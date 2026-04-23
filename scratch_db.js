const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { data, error } = await supabase
        .from('social_connections')
        .select('platform, profile_dna')
        .eq('platform', 'linkedin');
        
    console.log(JSON.stringify(data, null, 2));
}

check();
