import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

const requestSchema = z.object({
    captions: z.array(z.string().min(5)).min(3).max(20),
    platform: z.enum(['instagram', 'tiktok', 'linkedin', 'twitter']),
    niche: z.string().min(2).max(100),
});

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Pro/Team only feature
        const { data: userData } = await supabase
            .from('users')
            .select('subscription_tier')
            .eq('id', user.id)
            .single();

        if (!userData || userData.subscription_tier === 'free') {
            return NextResponse.json(
                { error: 'Competitor Analysis is a Pro feature. Upgrade to unlock.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validatedData = requestSchema.parse(body);

        const captionsBlock = validatedData.captions
            .map((c, i) => `${i + 1}. "${c}"`)
            .join('\n');

        const systemPrompt = `You are an elite social media strategist who reverse-engineers viral content. Analyze the following ${validatedData.captions.length} competitor captions from the "${validatedData.niche}" niche on ${validatedData.platform}.

Extract the hidden patterns that make these posts perform. Be brutally specific—no generic advice.

Format your response EXACTLY as a JSON object:
{
  "nicheDna": {
    "avgLength": number,
    "dominantTone": "string (e.g. 'vulnerable storytelling', 'provocative hot-take')",
    "emojiDensity": "string (e.g. 'heavy', 'minimal', 'strategic')",
    "hashtagStrategy": "string describing their tag approach"
  },
  "hookPatterns": [
    { "pattern": "string (e.g. 'Curiosity Gap Question')", "example": "string", "frequency": "string (e.g. '60% of posts')" }
  ],
  "structureBlueprint": {
    "opening": "string describing how they start",
    "body": "string describing the middle section pattern",
    "closing": "string describing how they end / CTA style"
  },
  "winningKeywords": ["string", "string", "string"],
  "contentThemes": ["string", "string", "string"],
  "goldenRule": "One single sentence summarizing WHY these captions work",
  "generatorPrompt": "A ready-to-use instruction that can be pasted into a caption generator to replicate this style (2-3 sentences max)"
}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Analyze these competitor captions:\n\n${captionsBlock}` },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 1200,
        });

        const analysis = JSON.parse(response.choices[0].message.content || '{}');

        return NextResponse.json({
            success: true,
            analysis,
            platform: validatedData.platform,
            niche: validatedData.niche,
            captionsAnalyzed: validatedData.captions.length,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Competitor analysis error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
