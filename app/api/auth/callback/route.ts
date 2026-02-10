import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    
    // Exchange the code for a session
    const { data: { user }, error: authError } = await supabase.auth.exchangeCodeForSession(code);

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth`);
    }

    if (user) {
      // Check if user exists in our database
      const { data: existingUser, error: queryError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      // If user doesn't exist, create them
      if (queryError || !existingUser) {
        const { error: insertError } = await supabase.from('users').insert({
          id: user.id,
          email: user.email,
          subscription_tier: 'free',
          subscription_status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error('Error creating user:', insertError);
          // Still redirect even if insert fails - user can try again
        }
      }

      // Redirect to caption generator
      return NextResponse.redirect(`${requestUrl.origin}/caption-generator`);
    }
  }

  // If no code or error, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}
