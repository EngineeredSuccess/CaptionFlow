import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';

// OAuth configuration for each platform
const OAUTH_CONFIG: Record<string, {
    authUrl: string;
    tokenUrl: string;
    scopes: string[];
    clientIdEnv: string;
    clientSecretEnv: string;
}> = {
    instagram: {
        authUrl: 'https://api.instagram.com/oauth/authorize',
        tokenUrl: 'https://api.instagram.com/oauth/access_token',
        scopes: ['instagram_basic', 'instagram_content_publish', 'pages_show_list'],
        clientIdEnv: 'INSTAGRAM_CLIENT_ID',
        clientSecretEnv: 'INSTAGRAM_CLIENT_SECRET',
    },
    linkedin: {
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        scopes: ['openid', 'profile', 'w_member_social'],
        clientIdEnv: 'LINKEDIN_CLIENT_ID',
        clientSecretEnv: 'LINKEDIN_CLIENT_SECRET',
    },
    twitter: {
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
        scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
        clientIdEnv: 'TWITTER_CLIENT_ID',
        clientSecretEnv: 'TWITTER_CLIENT_SECRET',
    },
    tiktok: {
        authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
        tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
        scopes: ['user.info.basic', 'video.publish'],
        clientIdEnv: 'TIKTOK_CLIENT_ID',
        clientSecretEnv: 'TIKTOK_CLIENT_SECRET',
    },
};

// GET: Redirect user to OAuth consent screen
export async function GET(
    request: Request,
    { params }: { params: Promise<{ platform: string }> }
) {
    try {
        const { platform } = await params;
        const config = OAUTH_CONFIG[platform];

        if (!config) {
            return NextResponse.json({ error: `Unsupported platform: ${platform}` }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const clientId = process.env[config.clientIdEnv];
        if (!clientId) {
            return NextResponse.json({
                error: `${platform} OAuth not configured. Add ${config.clientIdEnv} to environment variables.`
            }, { status: 503 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const redirectUri = `${appUrl}/api/auth/social/${platform}/callback`;

        // Build state with user ID for security
        const state = Buffer.from(JSON.stringify({
            userId: user.id,
            platform,
            timestamp: Date.now(),
        })).toString('base64url');

        const authParams = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            scope: config.scopes.join(' '),
            response_type: 'code',
            state,
        });

        // Platform-specific params
        if (platform === 'twitter') {
            authParams.set('code_challenge', 'challenge');
            authParams.set('code_challenge_method', 'plain');
        }

        return NextResponse.redirect(`${config.authUrl}?${authParams.toString()}`);
    } catch (error) {
        console.error('OAuth init error:', error);
        return NextResponse.json({ error: 'Failed to start OAuth flow' }, { status: 500 });
    }
}
