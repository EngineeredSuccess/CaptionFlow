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
        const { caption, platform } = requestSchema.parse(body);

        const systemPrompt = `You are a social media viral growth expert. Analyze the provided caption for ${platform.join(', ')} and provide a viral potential score (0-100).
    
    Evaluate based on:
    1. Hook: Is the first line scroll-stopping?
    2. Readability: Is it easy to scan?
    3. Call-to-Action (CTA): Is there a clear next step?
    4. Platform Fit: Does it follow best practices for the chosen platforms?
    
    Format your response EXACTLY as a JSON object:
    {
      "score": number,
      "breakdown": {
        "hook": number,
        "flow": number,
        "cta": number
      },
      "feedback": [string, string, string],
      "suggestion": "One power tip to make this 10x better"
    }`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // Using mini for speed and cost efficiency
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Analyze this caption:\n\n"${caption}"` }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const analysis = JSON.parse(response.choices[0].message.content || '{}');

        return NextResponse.json(analysis);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
        }
        console.error('Caption analysis error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
