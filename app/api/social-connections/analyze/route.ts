import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import OpenAI from 'openai';
import { z } from 'zod';

const analyzeSchema = z.object({
  connectionId: z.string().uuid(),
  captions: z.array(z.string()).min(1).max(5),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { connectionId, captions } = analyzeSchema.parse(body);

    // Verify ownership
    const { data: connection, error: connError } = await supabase
      .from('social_connections')
      .select('id, profile_dna')
      .eq('id', connectionId)
      .eq('user_id', user.id)
      .single();

    if (connError || !connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const prompt = `Analyze these recent social media captions and extract the user's "Profile DNA" to help an AI write like them in the future.
Return a JSON object with EXACTLY these string keys:
- "tone" (e.g., casual, professional, enthusiastic)
- "emojiPattern" (e.g., end of sentences, heavy usage, none)
- "hookStyle" (e.g., questions, bold statements)
- "vocabularyLevel" (e.g., simple, industry-jargon)
- "averageLength" (e.g., short, medium, long)

Captions:
${captions.map((c, i) => `[${i + 1}] ${c}`).join('\n\n')}`;

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    if (!aiResponse.choices[0].message.content) {
      throw new Error('No content returned from OpenAI');
    }

    const newDna = JSON.parse(aiResponse.choices[0].message.content);
    newDna.source_captions = captions;

    // Preserve managed_organizations if they exist
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingDna: any = connection.profile_dna || {};
    if (existingDna.managed_organizations) {
      newDna.managed_organizations = existingDna.managed_organizations;
    }

    const { error: updateError } = await supabase
      .from('social_connections')
      .update({ profile_dna: newDna })
      .eq('id', connectionId)
      .eq('user_id', user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, dna: newDna });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    console.error('Analyze DNA error:', error);
    return NextResponse.json({ error: 'Failed to analyze DNA' }, { status: 500 });
  }
}
