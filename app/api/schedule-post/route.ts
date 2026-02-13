import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import { z } from 'zod';

const requestSchema = z.object({
    captionId: z.string().uuid(),
    scheduledAt: z.string().datetime(),
    publishPlatforms: z.array(z.enum(['instagram', 'tiktok', 'linkedin', 'twitter'])).min(1),
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

        // Pro/Team only feature
        const { data: userData } = await supabase
            .from('users')
            .select('subscription_tier')
            .eq('id', user.id)
            .single();

        if (!userData || userData.subscription_tier === 'free') {
            return NextResponse.json(
                { error: 'Social Scheduling is a Pro feature. Upgrade to unlock.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validatedData = requestSchema.parse(body);

        // Verify the caption belongs to the user
        const { data: caption, error: captionError } = await supabase
            .from('captions')
            .select('id, content, hashtags, platform')
            .eq('id', validatedData.captionId)
            .eq('user_id', user.id)
            .single();

        if (captionError || !caption) {
            return NextResponse.json({ error: 'Caption not found' }, { status: 404 });
        }

        // Validate scheduled time is in the future
        const scheduledDate = new Date(validatedData.scheduledAt);
        if (scheduledDate <= new Date()) {
            return NextResponse.json(
                { error: 'Scheduled time must be in the future' },
                { status: 400 }
            );
        }

        // Update the caption with scheduling info
        const { data: updatedCaption, error: updateError } = await supabase
            .from('captions')
            .update({
                scheduled_at: validatedData.scheduledAt,
                scheduled_status: 'scheduled',
                publish_platforms: validatedData.publishPlatforms,
            })
            .eq('id', validatedData.captionId)
            .eq('user_id', user.id)
            .select()
            .single();

        if (updateError) {
            console.error('Error scheduling caption:', updateError);
            return NextResponse.json(
                { error: 'Failed to schedule caption' },
                { status: 500 }
            );
        }

        // TODO: When Ayrshare API key is configured, dispatch the post to the scheduling provider
        // For now, we store the schedule locally and the cron job will handle publishing

        return NextResponse.json({
            success: true,
            scheduled: {
                id: updatedCaption.id,
                content: updatedCaption.content,
                scheduledAt: updatedCaption.scheduled_at,
                platforms: validatedData.publishPlatforms,
                status: 'scheduled',
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Scheduling error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET: Fetch all scheduled captions for the user
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'scheduled';

        const { data: captions, error } = await supabase
            .from('captions')
            .select('id, content, hashtags, platform, scheduled_at, scheduled_status, publish_platforms, created_at')
            .eq('user_id', user.id)
            .eq('scheduled_status', status)
            .order('scheduled_at', { ascending: true });

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch scheduled captions' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            captions: captions || [],
        });
    } catch (error) {
        console.error('Fetch scheduled error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
