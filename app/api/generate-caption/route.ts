import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const requestSchema = z.object({
  description: z.string().min(5).max(1000),
  tone: z.enum(['casual', 'professional', 'funny', 'edgy', 'witty']),
  platform: z.array(z.enum(['instagram', 'tiktok', 'linkedin', 'twitter'])),
  brandVoiceId: z.string().uuid().optional(),
  numHashtags: z.number().min(5).max(15).default(10),
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

    // Get request body
    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    // Check user's subscription tier and daily limit
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('subscription_tier, daily_caption_count, last_reset_date')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Reset daily count if needed
    const today = new Date().toISOString().split('T')[0];
    if (
      !userData.last_reset_date ||
      new Date(userData.last_reset_date).toISOString().split('T')[0] < today
    ) {
      await supabase.rpc('reset_daily_caption_count');
      userData.daily_caption_count = 0;
    }

    // Check daily limit for free tier
    const dailyLimit = parseInt(process.env.FREE_DAILY_LIMIT || '10');
    if (
      userData.subscription_tier === 'free' &&
      userData.daily_caption_count >= dailyLimit
    ) {
      return NextResponse.json(
        { error: 'Daily limit reached. Upgrade to Pro for unlimited captions.' },
        { status: 403 }
      );
    }

    // Build system prompt
    let systemPrompt = `You are an expert social media caption writer. Write engaging, authentic captions that don't sound like generic AI-generated content.

Tone: ${validatedData.tone}
Platforms: ${validatedData.platform.join(', ')}

Platform-specific guidelines:
${validatedData.platform
        .map(p => {
          switch (p) {
            case 'instagram':
              return '- Instagram: Under 2,200 characters, use emojis naturally, conversational';
            case 'tiktok':
              return '- TikTok: Under 150 characters, energetic, trend-friendly, punchy';
            case 'linkedin':
              return '- LinkedIn: Professional, under 3,000 characters, no hashtags in body text';
            case 'twitter':
              return '- Twitter: Under 280 characters, conversational, punchy';
            default:
              return '';
          }
        })
        .join('\n')}`;

    // Add brand voice if provided
    if (validatedData.brandVoiceId) {
      const { data: brandVoice } = await supabase
        .from('brand_voices')
        .select('*')
        .eq('id', validatedData.brandVoiceId)
        .eq('user_id', user.id)
        .single();

      if (brandVoice) {
        const examples = [
          brandVoice.example_1,
          brandVoice.example_2,
          brandVoice.example_3,
          brandVoice.example_4,
          brandVoice.example_5,
        ].filter(Boolean);

        if (examples.length > 0) {
          systemPrompt += `\n\nMatch this brand voice. Here are example captions that show the user's style:\n${examples.map((ex, i) => `${i + 1}. "${ex}"`).join('\n')}\n\nWrite in this exact style - same tone, vocabulary, sentence structure, and personality.`;
        }
      }
    }

    // Pro/Team users get viral-optimized prompts
    const isPaidUser = userData.subscription_tier === 'pro' || userData.subscription_tier === 'team';
    if (isPaidUser) {
      systemPrompt += `\n\n🔥 VIRAL OPTIMIZATION (Pro feature):\n1. HOOK: The first line MUST be scroll-stopping. Use a curiosity gap, bold claim, or provocative question. Never start with generic openers.\n2. READABILITY: Use short, punchy sentences. Add strategic line breaks every 1-2 sentences. No walls of text.\n3. CTA: End with a clear call-to-action (ask a question, invite comments, or prompt saves/shares).\n4. EMOTION: Trigger at least one strong emotion (surprise, FOMO, inspiration, humor).\n5. PATTERN INTERRUPT: Include at least one unexpected element that breaks the scroll pattern.`;
    }

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Generate an engaging caption for this content: "${validatedData.description}"

You MUST output your response as a valid JSON object. For EACH platform specified (${validatedData.platform.join(', ')}), provide a highly optimized caption and an array of hashtags.
Format structure exactly like this:
{
  "instagram": {
    "content": "The generated caption text...",
    "hashtags": ["tag1", "tag2"]
  },
  "tiktok": {
    "content": "The generated caption text...",
    "hashtags": ["tag1", "tag2"]
  }
}
Where the uppercase key is the literal platform name in lowercase. Generate exactly ${validatedData.numHashtags} relevant hashtags per platform. Make the caption authentic and engaging. Mix popular and niche hashtags. Do not include the '#' symbol in the hashtag array elements.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 1500,
    });

    const aiResponse = response.choices[0].message.content;
    let generatedData: Record<string, { content: string, hashtags: string[] }> = {};
    
    try {
        generatedData = JSON.parse(aiResponse || '{}');
    } catch (e) {
        throw new Error('Failed to parse AI response into JSON');
    }

    const savedCaptions = [];

    // Save to database for each requested platform
    for (const platform of validatedData.platform) {
        // Sometimes GPT might capitalize the key
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
          console.error(`Error saving caption for ${platform}:`, saveError);
          continue; 
        }
        
        savedCaptions.push({
            id: savedCaption.id,
            content: platformData.content || '',
            hashtags: platformData.hashtags || [],
            platform: platform,
            tone: validatedData.tone,
        });
    }

    if (savedCaptions.length === 0) {
        return NextResponse.json(
            { error: 'Failed to generate captions for selected platforms' },
            { status: 500 }
        );
    }

    // Increment daily count - Count as ONE generation action
    await supabase.rpc('increment_caption_count', { user_uuid: user.id });

    return NextResponse.json({
      success: true,
      captions: savedCaptions,
      tier: userData.subscription_tier,
      remainingToday:
        userData.subscription_tier === 'free'
          ? dailyLimit - (userData.daily_caption_count + 1)
          : null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Caption generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
