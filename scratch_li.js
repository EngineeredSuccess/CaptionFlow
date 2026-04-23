const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testLinkedIn() {
    // 1. Get the latest token
    const { data } = await supabase
        .from('social_connections')
        .select('access_token')
        .eq('platform', 'linkedin')
        .single();
        
    if (!data) return console.log('No token');
    const token = data.access_token;

    // 2. Try the organizationAcls endpoint
    try {
        const orgRes = await fetch('https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&state=APPROVED', {
            headers: { 
                Authorization: `Bearer ${token}`
            },
        });
        const orgData = await orgRes.json();
        console.log('ACL Response:', JSON.stringify(orgData, null, 2));

        if (orgData.elements && orgData.elements.length > 0) {
            const orgUrns = orgData.elements.map(el => el.organization);
            const orgs = [];
            for (const urn of orgUrns) {
                const id = urn.split(':').pop();
                const res = await fetch(`https://api.linkedin.com/v2/organizations/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                orgs.push(data);
            }
            console.log('Orgs Details Response:', JSON.stringify(orgs, null, 2));
        }
    } catch (e) {
        console.error('Error', e);
    }
}

testLinkedIn();
