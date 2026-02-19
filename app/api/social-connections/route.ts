import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';

// GET: List user's social connections
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: connections, error } = await supabase
            .from('social_connections')
            .select('id, platform, platform_handle, connected_at, profile_dna')
            .eq('user_id', user.id)
            .order('connected_at', { ascending: false });

        console.log('Fetching connections for user:', user.id);
        console.log('Found connections:', connections);
        console.log('Error if any:', error);

        if (error) {
            console.error('Error fetching connections:', error);
            return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 });
        }

        return NextResponse.json({ connections: connections || [] });
    } catch (error) {
        console.error('Social connections GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Disconnect a social account
export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { connectionId } = await request.json();

        if (!connectionId) {
            return NextResponse.json({ error: 'Connection ID required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('social_connections')
            .delete()
            .eq('id', connectionId)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error deleting connection:', error);
            return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Social connections DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
