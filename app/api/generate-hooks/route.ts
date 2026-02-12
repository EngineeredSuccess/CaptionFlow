import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

const requestSchema = z.object({
    content: z.string().min(5),
    platform: z.string().optional().default('instagram'),
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
        const { content, platform } = requestSchema.parse(body);

        const systemPrompt = `You are a viral hook specialist. Your goal is to generate 5 "scroll-stopping" first lines (hooks) for a social media post on ${platform}.
    
    Hook styles to include:
    1. Question: Spark curiosity.
    2. Controversial: State something bold.
    3. How-to: Promise value.
    4. Negative: Warn against a mistake.
    5. Listicle: Promise order/quick learning.
    
    Format your response EXACTLY as a JSON array of strings:
    ["Hook 1", "Hook 2", "Hook 3", "Hook 4", "Hook 5"]`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Generate hooks for this content:\n\n"${content}"` }
            ],
            response_format: { type: "json_object" }, // Note: We'll wrap it in an object to satisfy JSON mode if needed, but array should be fine if specified correctly. Actually gpt-4o-mini requires an object schema in result.
        });

        // Let's refine the prompt to ensure it's a valid JSON object
        const finalResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: `${systemPrompt}\n\nReturn an object with a "hooks" key.` },
                { role: 'user', content: `Generate hooks for this content:\n\n"${content}"` }
            ],
            response_format: { type: "json_object" },
            temperature: 0.8,
        });

        const result = JSON.parse(finalResponse.choices[0].message.content || '{"hooks": []}');

        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
        }
        console.error('Hook generation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
