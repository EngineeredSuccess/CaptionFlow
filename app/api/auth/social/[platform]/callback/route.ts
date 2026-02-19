import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// OAuth token URLs for each platform
const TOKEN_URLS: Record<string, string> = {
    instagram: 'https://graph.facebook.com/v18.0/oauth/access_token',
    linkedin: 'https://www.linkedin.com/oauth/v2/accessToken',
    twitter: 'https://api.twitter.com/2/oauth2/token',
    tiktok: 'https://open.tiktokapis.com/v2/oauth/token/',
};

const CLIENT_ENV_KEYS: Record<string, { id: string; secret: string }> = {
    instagram: { id: 'INSTAGRAM_CLIENT_ID', secret: 'INSTAGRAM_CLIENT_SECRET' },
    linkedin: { id: 'LINKEDIN_CLIENT_ID', secret: 'LINKEDIN_CLIENT_SECRET' },
    twitter: { id: 'TWITTER_CLIENT_ID', secret: 'TWITTER_CLIENT_SECRET' },
    tiktok: { id: 'TIKTOK_CLIENT_ID', secret: 'TIKTOK_CLIENT_SECRET' },
};

// Platform-specific profile fetchers
async function fetchPlatformProfile(platform: string, accessToken: string): Promise<{ handle: string; platformUserId: string }> {
    try {
        if (platform === 'instagram') {
            // For Instagram Graph API, we fetch the Facebook Pages and find the linked IG Business Account
            const res = await fetch(`https://graph.facebook.com/v18.0/me/accounts?fields=instagram_business_account{id,username}&access_token=${accessToken}`);
            const data = await res.json();

            // Find the first Page that has an Instagram Business Account linked
            const pageWithIg = data.data?.find((page: any) => page.instagram_business_account);

            if (pageWithIg) {
                return {
                    handle: `@${pageWithIg.instagram_business_account.username}`,
                    platformUserId: pageWithIg.instagram_business_account.id
                };
            }
            return { handle: 'No IG Account Linked', platformUserId: 'none' };
        }
        if (platform === 'linkedin') {
            const res = await fetch('https://api.linkedin.com/v2/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await res.json();
            return { handle: data.name || data.email || 'LinkedIn User', platformUserId: data.sub };
        }
        if (platform === 'twitter') {
            const res = await fetch('https://api.twitter.com/2/users/me', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await res.json();
            return { handle: `@${data.data.username}`, platformUserId: data.data.id };
        }
        if (platform === 'tiktok') {
            const res = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await res.json();
            return { handle: data.data?.user?.display_name || 'TikTok User', platformUserId: data.data?.user?.open_id };
        }
    } catch (error) {
        console.error(`Failed to fetch ${platform} profile:`, error);
    }
    return { handle: 'Unknown', platformUserId: 'unknown' };
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ platform: string }> }
) {
    try {
        const { platform } = await params;
        const url = new URL(request.url);
        const code = url.searchParams.get('code');
        const stateParam = url.searchParams.get('state');
        const errorParam = url.searchParams.get('error');

        if (errorParam) {
            console.error(`OAuth error for ${platform}:`, errorParam);
            return NextResponse.redirect(new URL('/settings?social_error=denied', request.url));
        }

        if (!code || !stateParam) {
            return NextResponse.redirect(new URL('/settings?social_error=missing_code', request.url));
        }

        // Decode and validate state
        let state: { userId: string; platform: string; timestamp: number };
        try {
            state = JSON.parse(Buffer.from(stateParam, 'base64url').toString());
        } catch {
            return NextResponse.redirect(new URL('/settings?social_error=invalid_state', request.url));
        }

        // Validate timestamp (max 10 minutes)
        if (Date.now() - state.timestamp > 10 * 60 * 1000) {
            return NextResponse.redirect(new URL('/settings?social_error=expired', request.url));
        }

        const envKeys = CLIENT_ENV_KEYS[platform];
        const clientId = process.env[envKeys.id];
        const clientSecret = process.env[envKeys.secret];

        if (!clientId || !clientSecret) {
            return NextResponse.redirect(new URL('/settings?social_error=not_configured', request.url));
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const redirectUri = `${appUrl}/api/auth/social/${platform}/callback`;

        // Exchange code for token
        const tokenUrl = TOKEN_URLS[platform];
        let tokenBody: URLSearchParams | string;
        const headers: Record<string, string> = {};

        if (platform === 'instagram') {
            console.log('Exchanging code for token:', { code, redirectUri });
            tokenBody = new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
                code,
            });
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        } else if (platform === 'linkedin') {
            tokenBody = new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
                client_id: clientId,
                client_secret: clientSecret,
            });
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        } else if (platform === 'twitter') {
            tokenBody = new URLSearchParams({
                code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
                code_verifier: 'challenge',
                client_id: clientId,
            });
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
            headers['Authorization'] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
        } else {
            tokenBody = new URLSearchParams({
                client_key: clientId,
                client_secret: clientSecret,
                code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
            });
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers,
            body: tokenBody.toString(),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok || tokenData.error) {
            console.error(`Token exchange failed for ${platform}:`, tokenData);
            return NextResponse.redirect(new URL('/settings?social_error=token_failed', request.url));
        }

        const accessToken = tokenData.access_token;
        const refreshToken = tokenData.refresh_token || null;
        const expiresIn = tokenData.expires_in;
        const tokenExpiresAt = expiresIn
            ? new Date(Date.now() + expiresIn * 1000).toISOString()
            : null;

        // Fetch the user's profile from the platform
        const { handle, platformUserId } = await fetchPlatformProfile(platform, accessToken);

        // Store the connection using service role (bypasses RLS)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { error: upsertError } = await supabaseAdmin
            .from('social_connections')
            .upsert({
                user_id: state.userId,
                platform,
                platform_handle: handle,
                platform_user_id: platformUserId,
                access_token: accessToken,
                refresh_token: refreshToken,
                token_expires_at: tokenExpiresAt,
                connected_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id,platform',
            });

        if (upsertError) {
            console.error('Failed to save connection:', upsertError);
            return NextResponse.redirect(new URL('/settings?social_error=save_failed', request.url));
        }

        console.log('Successfully connected:', platform, handle);
        return NextResponse.redirect(new URL(`/settings?social_connected=${platform}`, request.url));
    } catch (error) {
        console.error('OAuth callback error:', error);
        return NextResponse.redirect(new URL('/settings?social_error=unknown', request.url));
    }
}
