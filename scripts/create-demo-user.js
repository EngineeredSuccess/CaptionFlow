
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createDemoUser() {
    const email = 'demo@example.com';
    const password = 'password123';

    console.log(`Checking if user ${email} exists...`);

    // 1. Try to create the user in Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    });

    if (authError) {
        if (authError.message.includes('already registered')) {
            console.log('User already exists in Auth.');
        } else {
            console.error('Error creating auth user:', authError.message);
            return;
        }
    } else {
        console.log('User created in Auth successfully:', authUser.user.id);
    }

    // 2. Get the user ID (either from new creation or search)
    let userId;
    if (authUser?.user?.id) {
        userId = authUser.user.id;
    } else {
        const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
            console.error('Error listing users:', listError.message);
            return;
        }
        const existingUser = listData.users.find(u => u.email === email);
        if (!existingUser) {
            console.error('Could not find existing user ID.');
            return;
        }
        userId = existingUser.id;
    }

    console.log(`Target User ID: ${userId}`);

    // 3. Ensure the user exists in the public.users table
    const { data: publicUser, error: publicError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

    if (publicError && publicError.code === 'PGRST116') { // Not found
        console.log('Creating entry in public.users...');
        const { error: insertError } = await supabase
            .from('users')
            .insert({
                id: userId,
                email: email,
                subscription_tier: 'pro' // Give them Pro for testing
            });

        if (insertError) {
            console.error('Error inserting into public.users:', insertError.message);
        } else {
            console.log('Entry created in public.users successfully.');
        }
    } else if (publicUser) {
        console.log('User already exists in public.users.');
        // Ensure they have Pro for testing
        await supabase.from('users').update({ subscription_tier: 'pro' }).eq('id', userId);
    } else {
        console.error('Error checking public.users:', publicError.message);
    }

    console.log('\n--- DEMO ACCOUNT DETAILS ---');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('----------------------------');
}

createDemoUser();
