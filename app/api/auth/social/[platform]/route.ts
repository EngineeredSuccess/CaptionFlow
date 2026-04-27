import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// OAuth configuration for each platform
const OAUTH_CONFIG: Record<string, {
    authUrl: string;
    tokenUrl: string;
    scopes: string[];
    clientIdEnv: string;
    clientSecretEnv: string;
}> = {
    instagram: {
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
        scopes: ['instagram_basic', 'instagram_content_publish', 'pages_show_list', 'pages_read_engagement', 'public_profile'],
        clientIdEnv: 'INSTAGRAM_CLIENT_ID',
        clientSecretEnv: 'INSTAGRAM_CLIENT_SECRET',
    },
    linkedin: {
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        scopes: ['openid', 'profile', 'w_member_social', 'rw_organization_admin', 'w_organization_social'],
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
        scopes: ['user.info.basic'], // Added back 'video.publish', 'video.list' after product approval in portal
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
        let redirectUri = `${appUrl}/api/auth/social/${platform}/callback`;

        if (platform === 'tiktok') {
            redirectUri += '/';
        }

        // Build state with user ID for security
        const state = Buffer.from(JSON.stringify({
            userId: user.id,
            platform,
            timestamp: Date.now(),
        })).toString('base64url');

        const authParams = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            scope: platform === 'tiktok' ? config.scopes.join(',') : config.scopes.join(' '),
            response_type: 'code',
            state,
        });

        // Platform-specific params
        if (platform === 'tiktok') {
            authParams.delete('client_id');
            authParams.set('client_key', clientId);
        }

        let twitterCodeVerifier: string | undefined;
        if (platform === 'twitter') {
            twitterCodeVerifier = crypto.randomBytes(32).toString('base64url');
            const codeChallenge = crypto
                .createHash('sha256')
                .update(twitterCodeVerifier)
                .digest('base64url');
            authParams.set('code_challenge', codeChallenge);
            authParams.set('code_challenge_method', 'S256');
        }

        const redirectResponse = NextResponse.redirect(`${config.authUrl}?${authParams.toString()}`);
        redirectResponse.headers.set('Cache-Control', 'no-store, max-age=0');

        // Store state in cookie for validation in callback (M1)
        redirectResponse.cookies.set('oauth_state', state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 600, // 10 minutes
            path: `/api/auth/social/${platform}/callback`,
        });

        if (twitterCodeVerifier) {
            redirectResponse.cookies.set('twitter_pkce_verifier', twitterCodeVerifier, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 600,
                path: '/api/auth/social/twitter/callback',
            });
        }

        return redirectResponse;
    } catch (error) {
        console.error('OAuth init error:', error);
        return NextResponse.json({ error: 'Failed to start OAuth flow' }, { status: 500 });
    }
}
