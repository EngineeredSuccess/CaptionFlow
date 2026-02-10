import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import { emailService } from '@/shared/lib/email';
import crypto from 'crypto';

// Beta invite codes storage
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Generate unique invite code
    const inviteCode = generateInviteCode();

    // Store beta signup
    const { error } = await supabase.from('beta_signups').insert({
      email,
      invite_code: inviteCode,
      status: 'pending',
    });

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        return NextResponse.json(
          { error: 'Email already registered for beta' },
          { status: 409 }
        );
      }
      throw error;
    }

    // Send beta invite email
    await emailService.sendBetaInvite(email, inviteCode);

    return NextResponse.json({
      success: true,
      message: 'Beta invite sent! Check your email.',
    });
  } catch (error) {
    console.error('Beta signup error:', error);
    return NextResponse.json(
      { error: 'Failed to process beta signup' },
      { status: 500 }
    );
  }
}

// Admin: Get all beta signups
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: signups, error } = await supabase
      .from('beta_signups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      signups: signups || [],
    });
  } catch (error) {
    console.error('Get beta signups error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch beta signups' },
      { status: 500 }
    );
  }
}

function generateInviteCode(): string {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
