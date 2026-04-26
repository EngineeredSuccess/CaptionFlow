import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const requestSchema = z.object({
  sourceText: z.string().min(10).max(5000),
  tone: z.enum(['casual', 'professional', 'funny', 'edgy', 'witty']),
  platform: z.array(z.enum(['instagram', 'tiktok', 'linkedin', 'twitter'])).min(1),
  brandVoiceId: z.string().uuid().optional(),
  numHashtags: z.number().min(3).max(15).default(8),
  useHumanMode: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('subscription_tier, daily_caption_count, last_reset_date')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (userData.subscription_tier === 'free') {
      return NextResponse.json(
        { error: 'Remix is a Pro feature. Upgrade to unlock unlimited remixes.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    const isPaidUser = userData.subscription_tier === 'pro' || userData.subscription_tier === 'team';
    const useClaudeWriter = isPaidUser && validatedData.useHumanMode;

    // Build brand voice context
    let brandVoiceContext = '';
    if (validatedData.brandVoiceId) {
      const { data: brandVoice } = await supabase
        .from('brand_voices')
        .select('*')
        .eq('id', validatedData.brandVoiceId)
        .eq('user_id', user.id)
        .single();

      if (brandVoice) {
        const examples = [
          brandVoice.example_1, brandVoice.example_2, brandVoice.example_3,
          brandVoice.example_4, brandVoice.example_5,
        ].filter(Boolean);

        if (examples.length > 0) {
          brandVoiceContext = `\n\nBRAND VOICE — write in this exact style, vocabulary, and personality:\n${examples.map((ex, i) => `${i + 1}. "${ex}"`).join('\n')}`;
        }
      }
    }

    const systemPrompt = `You are an expert social media ghostwriter. Your job is to take a source text and completely rewrite it in the user's brand voice for their social platforms.

CRITICAL RULES:
1. Keep the CORE MESSAGE and KEY INSIGHTS — never lose the substance
2. Completely transform the STYLE, TONE, and VOICE 
3. Do NOT copy sentences directly — rewrite authentically
4. Make it platform-optimized
5. Tone: ${validatedData.tone}

Platform guidelines:
${validatedData.platform.map(p => {
  switch (p) {
    case 'instagram': return '- Instagram: conversational, emojis, up to 2,200 chars';
    case 'tiktok': return '- TikTok: punchy, under 150 chars, trend-aware';
    case 'linkedin': return '- LinkedIn: professional, thought-leadership tone, up to 3,000 chars';
    case 'twitter': return '- Twitter: concise, under 280 chars, punchy';
    default: return '';
  }
}).join('\n')}
${brandVoiceContext}
${useClaudeWriter ? '\nCRITICAL: Write in a deeply human, natural voice. Avoid AI filler phrases. Sound like a real person, not a marketing department.' : ''}`;

    const userPrompt = `Remix this content into posts for each specified platform (${validatedData.platform.join(', ')}):

--- SOURCE TEXT ---
${validatedData.sourceText}
--- END ---

Output a valid JSON object with this structure:
{
  "instagram": { "content": "...", "hashtags": ["tag1", "tag2"] },
  "linkedin": { "content": "...", "hashtags": ["tag1", "tag2"] }
}

Generate exactly ${validatedData.numHashtags} relevant hashtags per platform. Do NOT include the '#' symbol in the hashtag array.`;

    let aiResponse: string | null = null;

    if (useClaudeWriter) {
      const claudeResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });
      const block = claudeResponse.content[0];
      const rawText = block.type === 'text' ? block.text : null;
      const jsonMatch = rawText?.match(/\{[\s\S]*\}/);
      aiResponse = jsonMatch ? jsonMatch[0] : rawText;
    } else {
      const gptResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.85,
        max_tokens: 1500,
      });
      aiResponse = gptResponse.choices[0].message.content;
    }

    let generatedData: Record<string, { content: string; hashtags: string[] }> = {};
    try {
      generatedData = JSON.parse(aiResponse || '{}');
    } catch {
      throw new Error('Failed to parse AI response');
    }

    // Save remixed captions to DB
    const savedCaptions = [];
    for (const platform of validatedData.platform) {
      const platformKey = Object.keys(generatedData).find(k => k.toLowerCase() === platform.toLowerCase());
      const platformData = platformKey ? generatedData[platformKey] : null;
      if (!platformData) continue;

      const { data: savedCaption, error: saveError } = await supabase
        .from('captions')
        .insert({
          user_id: user.id,
          content: platformData.content || '',
          hashtags: platformData.hashtags || [],
          platform: [platform],
          tone: validatedData.tone,
          brand_voice_id: validatedData.brandVoiceId || null,
        })
        .select()
        .single();

      if (saveError) {
        console.error(`Remix save error for ${platform}:`, saveError);
        continue;
      }

      savedCaptions.push({
        id: savedCaption.id,
        content: platformData.content || '',
        hashtags: platformData.hashtags || [],
        platform,
        tone: validatedData.tone,
      });
    }

    if (savedCaptions.length === 0) {
      return NextResponse.json({ error: 'Failed to generate remixed captions' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      captions: savedCaptions,
      model: useClaudeWriter ? 'claude' : 'gpt-4o',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.issues }, { status: 400 });
    }
    console.error('Remix error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
