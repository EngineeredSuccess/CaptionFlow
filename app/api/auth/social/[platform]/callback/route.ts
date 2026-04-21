import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

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
    tiktok: { id: 'TIKTOK_CLIENT_KEY', secret: 'TIKTOK_CLIENT_SECRET' },
};

// Platform-specific profile fetchers
async function fetchPlatformProfile(platform: string, accessToken: string): Promise<{ handle: string | null; platformUserId: string | null; recentCaptions: string[] }> {
    let recentCaptions: string[] = [];
    try {
        if (platform === 'instagram') {
            // For Instagram Graph API, we fetch the Facebook Pages and find the linked IG Business Account
            const res = await fetch(`https://graph.facebook.com/v18.0/me/accounts?fields=instagram_business_account{id,username}&access_token=${accessToken}`);
            const data = await res.json();

            // Find the first Page that has an Instagram Business Account linked
            const pageWithIg = data.data?.find((page: { instagram_business_account?: { id: string; username: string } }) => page.instagram_business_account);

            if (pageWithIg) {
                const igId = pageWithIg.instagram_business_account.id;
                
                // Fetch recent media to extract DNA
                try {
                    const mediaRes = await fetch(`https://graph.facebook.com/v18.0/${igId}/media?fields=caption&limit=5&access_token=${accessToken}`);
                    const mediaData = await mediaRes.json();
                    if (mediaData.data) {
                        recentCaptions = mediaData.data
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            .filter((m: any) => m.caption)
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            .map((m: any) => m.caption);
                    }
                } catch (mediaErr) {
                    console.error('Failed to fetch IG media:', mediaErr);
                }

                return {
                    handle: `@${pageWithIg.instagram_business_account.username}`,
                    platformUserId: igId,
                    recentCaptions
                };
            }
            return { handle: null, platformUserId: null, recentCaptions: [] };
        }
        if (platform === 'linkedin') {
            const res = await fetch('https://api.linkedin.com/v2/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await res.json();
            return { handle: data.name || data.email || 'LinkedIn User', platformUserId: data.sub, recentCaptions };
        }
        if (platform === 'twitter') {
            const res = await fetch('https://api.twitter.com/2/users/me', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await res.json();
            return { handle: `@${data.data.username}`, platformUserId: data.data.id, recentCaptions };
        }
        if (platform === 'tiktok') {
            const res = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = await res.json();

            // Fetch recent videos for DNA Sync
            try {
                const videoRes = await fetch('https://open.tiktokapis.com/v2/video/list/?fields=video_description', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ max_count: 5 }),
                });
                const videoData = await videoRes.json();
                if (videoData.data?.videos) {
                    recentCaptions = videoData.data.videos
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .filter((v: any) => v.video_description)
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .map((v: any) => v.video_description);
                }
            } catch (err) {
                console.error('Failed to fetch TikTok videos:', err);
            }

            return { handle: data.data?.user?.display_name || 'TikTok User', platformUserId: data.data?.user?.open_id, recentCaptions };
        }
    } catch (error) {
        console.error(`Failed to fetch ${platform} profile:`, error);
    }
    return { handle: 'Unknown', platformUserId: 'unknown', recentCaptions: [] };
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
        const { handle, platformUserId, recentCaptions } = await fetchPlatformProfile(platform, accessToken);

        if (platform === 'instagram' && (!handle || !platformUserId)) {
            return NextResponse.redirect(new URL('/settings?social_error=no_ig_account', request.url));
        }

        // Extract Profile DNA if we have recent captions
        let profile_dna = {};
        if (recentCaptions.length > 0) {
            try {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
                const prompt = `Analyze these recent social media captions and extract the user's "Profile DNA" to help an AI write like them in the future.
Return a JSON object with EXACTLY these string keys:
- "tone" (e.g., casual, professional, enthusiastic)
- "emojiPattern" (e.g., end of sentences, heavy usage, none)
- "hookStyle" (e.g., questions, bold statements)
- "vocabularyLevel" (e.g., simple, industry-jargon)
- "averageLength" (e.g., short, medium, long)

Captions:
${recentCaptions.map((c, i) => `[${i+1}] ${c}`).join('\n\n')}`;

                const aiResponse = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                    response_format: { type: 'json_object' },
                    temperature: 0.2,
                });

                if (aiResponse.choices[0].message.content) {
                    profile_dna = JSON.parse(aiResponse.choices[0].message.content);
                }
            } catch (err) {
                console.error('Failed to extract DNA:', err);
            }
        }

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
                profile_dna,
                connected_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id,platform',
            });

        if (upsertError) {
            console.error('Failed to save connection:', upsertError);
            const errorMsg = encodeURIComponent(upsertError.message || 'database_error');
            return NextResponse.redirect(new URL(`/settings?social_error=save_failed&msg=${errorMsg}`, request.url));
        }

        console.log('Successfully connected:', platform, handle);
        return NextResponse.redirect(new URL(`/settings?social_connected=${platform}`, request.url));
    } catch (error) {
        console.error('OAuth callback error:', error);
        return NextResponse.redirect(new URL('/settings?social_error=unknown', request.url));
    }
}
