import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

const requestSchema = z.object({
    caption: z.string().min(5),
    platform: z.array(z.string()),
    tone: z.string(),
    feedback: z.array(z.string()).optional(),
    suggestion: z.string().optional(),
    score: z.number().optional(),
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

        const body = await request.json();
        const { caption, platform, tone, feedback, suggestion, score } = requestSchema.parse(body);

        const feedbackContext = feedback?.length
            ? `\n\nPrevious AI feedback on this caption:\n${feedback.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\nPower tip: ${suggestion || 'N/A'}\nCurrent score: ${score || 'Unknown'}/100`
            : '';

        const systemPrompt = `You are a viral social media copywriter specializing in ${platform.join(', ')}. 
Your task is to REWRITE the provided caption to maximize engagement and viral potential.

Rules:
1. Keep the same core message and intent.
2. Match the "${tone}" tone of voice.
3. Make the hook (first line) absolutely scroll-stopping.
4. Improve readability with short punchy sentences and strategic line breaks.
5. Add a clear call-to-action if missing.
6. Use platform-specific best practices.
7. Address ALL the feedback points listed below.
${feedbackContext}

Return ONLY the improved caption text. No explanations, no quotes around it.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Rewrite this caption to score 90+:\n\n${caption}` }
            ],
            temperature: 0.8,
        });

        const boostedCaption = response.choices[0].message.content?.trim() || caption;

        return NextResponse.json({ boostedCaption });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
        }
        console.error('Boost caption error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
