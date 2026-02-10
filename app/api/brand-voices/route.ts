import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import { z } from 'zod';

// GET - Get user's brand voice
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: brandVoice, error } = await supabase
      .from('brand_voices')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      return NextResponse.json(
        { error: 'Failed to fetch brand voice' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      brandVoice: brandVoice || null,
    });
  } catch (error) {
    console.error('Get brand voice error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create or update brand voice
const brandVoiceSchema = z.object({
  examples: z.array(z.string()).min(1).max(5),
  selectedTone: z.enum(['casual', 'professional', 'funny', 'edgy', 'witty']),
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

    // Check if user has Pro subscription
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    if (userData?.subscription_tier === 'free') {
      return NextResponse.json(
        { error: 'Brand voice training requires Pro subscription' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = brandVoiceSchema.parse(body);

    // Check if brand voice already exists
    const { data: existingVoice } = await supabase
      .from('brand_voices')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const brandVoiceData = {
      user_id: user.id,
      example_1: validatedData.examples[0] || null,
      example_2: validatedData.examples[1] || null,
      example_3: validatedData.examples[2] || null,
      example_4: validatedData.examples[3] || null,
      example_5: validatedData.examples[4] || null,
      selected_tone: validatedData.selectedTone,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (existingVoice) {
      // Update existing
      const { data, error } = await supabase
        .from('brand_voices')
        .update(brandVoiceData)
        .eq('id', existingVoice.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('brand_voices')
        .insert(brandVoiceData)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json({
      success: true,
      brandVoice: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Save brand voice error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
