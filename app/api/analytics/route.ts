import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const { event, properties } = body;

    // Store event in database
    const { error } = await supabase.from('analytics_events').insert({
      user_id: user?.id || null,
      event_name: event,
      properties: properties || {},
      session_id: getSessionId(request),
      user_agent: request.headers.get('user-agent'),
      ip_address: getClientIP(request),
    });

    if (error) {
      console.error('Analytics storage error:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

function getSessionId(_request: Request): string {
  // Generate or retrieve session ID from cookie
  // For simplicity, we'll use a timestamp-based ID
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getClientIP(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || null;
}
