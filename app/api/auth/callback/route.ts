import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/shared/lib/supabase/server';
import { createServiceRoleClient } from '@/shared/lib/supabase/service-role';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  console.log('Auth callback hit. Code exists:', !!code);

  if (code) {
    // Use server client to exchange code AND set session cookies
    const supabase = await createServerClient();
    
    try {
      // Exchange the code for a session
      const { data: { user }, error: authError } = await supabase.auth.exchangeCodeForSession(code);

      if (authError) {
        console.error('Auth error:', authError);
        return NextResponse.redirect(`${requestUrl.origin}/login?error=auth`);
      }

      console.log('User from auth:', user?.id, user?.email);

      if (user) {
        // Use service role client for database operations
        const serviceRoleClient = createServiceRoleClient();
        
        // Check if user exists in our database
        const { data: existingUser, error: queryError } = await serviceRoleClient
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();

        console.log('Existing user check:', { existingUser: !!existingUser, queryError: queryError?.message });

        // If user doesn't exist, create them
        if (queryError || !existingUser) {
          console.log('Creating new user in database...');
          
          const { error: insertError } = await serviceRoleClient.from('users').insert({
            id: user.id,
            email: user.email,
            subscription_tier: 'free',
            subscription_status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          if (insertError) {
            console.error('Error creating user:', insertError);
            return NextResponse.redirect(`${requestUrl.origin}/login?error=db_insert`);
          }
          
          console.log('User created successfully');
        } else {
          console.log('User already exists');
        }

        // Redirect to caption generator
        return NextResponse.redirect(`${requestUrl.origin}/caption-generator`);
      }
    } catch (error) {
      console.error('Callback error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=unknown`);
    }
  }

  // If no code or error, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}
