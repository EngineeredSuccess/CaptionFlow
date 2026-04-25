import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/shared/lib/supabase/service-role';

// Opt out of caching
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // 1. Verify Vercel Cron Secret for security
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const supabase = createServiceRoleClient();

        // 2. Fetch past-due scheduled posts
        const { data: postsToPublish, error: fetchError } = await supabase
            .from('captions')
            .select(`
                id,
                content, 
                hashtags, 
                publish_platforms, 
                publish_target_id,
                user_id,
                media_url
            `)
            .eq('scheduled_status', 'scheduled')
            .lte('scheduled_at', new Date().toISOString());

        if (fetchError || !postsToPublish || postsToPublish.length === 0) {
            return NextResponse.json({ success: true, message: 'No posts to publish', processed: 0 });
        }

        console.log(`Cron: Found ${postsToPublish.length} posts to attempt publishing.`);

        let processedCount = 0;

        for (const post of postsToPublish) {
            try {
                // 3. Validate user subscription tier
                const { data: userData } = await supabase
                    .from('users')
                    .select('subscription_tier')
                    .eq('id', post.user_id)
                    .single();

                if (!userData || userData.subscription_tier === 'free') {
                    console.log(`Cron: Skipping post ${post.id} because user is on free tier.`);
                    await updatePostStatus(supabase, post.id, 'failed_api_error');
                    continue;
                }

                // 4. Fetch User Social Connections
                const platforms = post.publish_platforms as string[];
                
                // Get exactly the connected platforms for this user
                const { data: connections } = await supabase
                    .from('social_connections')
                    .select('*')
                    .eq('user_id', post.user_id)
                    .in('platform', platforms);

                if (!connections || connections.length === 0) {
                    console.log(`Cron: No valid connections found for post ${post.id}.`);
                    await updatePostStatus(supabase, post.id, 'failed_api_error');
                    continue;
                }

                let atLeastOneSuccess = false;

                // 5. Attempt Publishing per platform
                for (const connection of connections) {
                    if (connection.platform === 'linkedin') {
                        const success = await publishToLinkedIn(
                            post.content, 
                            post.hashtags, 
                            connection.access_token, 
                            post.publish_target_id || connection.platform_user_id
                        );
                        
                        if (success) atLeastOneSuccess = true;
                    } 
                    else if (connection.platform === 'tiktok') {
                        if (!post.media_url) {
                            console.log(`Cron: Skipping TikTok publish for ${post.id} - media_url is missing.`);
                            continue;
                        }
                        const success = await publishToTikTok(
                            post.content,
                            post.media_url,
                            connection.access_token
                        );
                        if (success) atLeastOneSuccess = true;
                    }
                    else if (connection.platform === 'twitter') {
                        // Twitter API Free Tier does not allow posting. 
                        // Skipping for now to avoid persistent 403 errors.
                        console.log(`Cron: Skipping Twitter publish for ${post.id} - Platform requires API upgrade ($100/mo).`);
                        continue; 
                    }
                    else if (connection.platform === 'instagram') {
                        if (!post.media_url) {
                            console.log(`Cron: Skipping Instagram publish for ${post.id} - media_url is missing.`);
                            continue;
                        }
                        const success = await publishToInstagram(
                            post.content,
                            post.hashtags,
                            post.media_url,
                            connection.access_token,
                            connection.platform_user_id
                        );
                        if (success) atLeastOneSuccess = true;
                    }
                    else {
                        console.log(`Cron: Native publishing for ${connection.platform} is pending support.`);
                    }
                }

                // 6. Update Status
                if (atLeastOneSuccess) {
                    await updatePostStatus(supabase, post.id, 'published');
                    processedCount++;
                } else {
                    await updatePostStatus(supabase, post.id, 'failed_api_error');
                }

            } catch (postErr) {
                console.error(`Cron: Unexpected error processing post ${post.id}`, postErr);
                await updatePostStatus(supabase, post.id, 'failed_api_error');
            }
        }

        return NextResponse.json({ success: true, processed: processedCount });

    } catch (error) {
        console.error('Cron Publish Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// --- Helpers ---

async function updatePostStatus(supabase: any, postId: string, status: 'published' | 'failed_api_error') {
    await supabase.from('captions').update({ scheduled_status: status }).eq('id', postId);
}

async function publishToTikTok(title: string, videoUrl: string, accessToken: string) {
    try {
        console.log('Cron: Starting TikTok Publish (init)...');
        // TikTok publishing is a multi-step process. 
        // 1. Initialize publish
        const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                post_info: {
                    title: title,
                    privacy_level: "PUBLIC_TO_EVERYONE",
                    disable_comment: false,
                    disable_duet: false,
                    disable_stitch: false
                },
                source_info: {
                    source: "PULL_FROM_URL",
                    video_url: videoUrl
                }
            })
        });

        const initData = await initRes.json();
        if (!initRes.ok) {
            console.error('TikTok Init Failed:', JSON.stringify(initData));
            return false;
        }

        console.log('TikTok Publish initialized successfully:', initData.data?.publish_id);
        return true;
    } catch (e) {
        console.error('TikTok Publish Exception:', e);
        return false;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function refreshTwitterToken(connection: any, supabase: any): Promise<string | null> {
    try {
        if (!connection.refresh_token) {
            console.error('Twitter: No refresh_token stored — user must reconnect their account.');
            return null;
        }

        const clientId = process.env.TWITTER_CLIENT_ID!;
        const clientSecret = process.env.TWITTER_CLIENT_SECRET!;
        const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        const res = await fetch('https://api.twitter.com/2/oauth2/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: connection.refresh_token,
            }).toString(),
        });

        const data = await res.json();
        if (!res.ok || !data.access_token) {
            console.error('Twitter token refresh failed:', JSON.stringify(data));
            return null;
        }

        const newAccessToken = data.access_token;
        const newRefreshToken = data.refresh_token || connection.refresh_token;
        const expiresIn = data.expires_in;
        const tokenExpiresAt = expiresIn
            ? new Date(Date.now() + expiresIn * 1000).toISOString()
            : null;

        // Persist the new tokens to the DB
        await supabase
            .from('social_connections')
            .update({
                access_token: newAccessToken,
                refresh_token: newRefreshToken,
                token_expires_at: tokenExpiresAt,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', connection.user_id)
            .eq('platform', 'twitter');

        console.log('Twitter: Token refreshed successfully.');
        return newAccessToken;
    } catch (e) {
        console.error('Twitter token refresh exception:', e);
        return null;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function publishToTwitter(content: string, hashtags: string[], connection: any, supabase: any) {
    try {
        // Build tweet text: content + hashtags, capped at 280 chars
        const hashtagStr = hashtags && hashtags.length > 0
            ? '\n\n' + hashtags.slice(0, 5).map((h: string) => `#${h}`).join(' ')
            : '';
        const fullText = (content + hashtagStr).slice(0, 280);

        const tryPost = async (token: string) => fetch('https://api.twitter.com/2/tweets', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: fullText }),
        });

        let res = await tryPost(connection.access_token);

        // Auto-refresh on 401 and retry once
        if (res.status === 401) {
            console.log('Twitter: Got 401 — attempting token refresh...');
            const newToken = await refreshTwitterToken(connection, supabase);
            if (!newToken) return false;
            res = await tryPost(newToken);
        }

        if (!res.ok) {
            const errorData = await res.json().catch(() => null);
            console.error('Twitter/X Publish FAILED', {
                httpStatus: res.status,
                errorType: errorData?.errors?.[0]?.type || errorData?.error,
                errorDetail: errorData?.errors?.[0]?.detail || errorData?.error_description,
                fullResponse: JSON.stringify(errorData),
            });
            return false;
        }

        const data = await res.json();
        console.log('Twitter/X Tweet published, id:', data.data?.id);
        return true;
    } catch (e) {
        console.error('Twitter/X Publish Exception:', e);
        return false;
    }
}

async function publishToInstagram(
    content: string,
    hashtags: string[],
    mediaUrl: string,
    accessToken: string,
    igUserId: string
) {
    try {
        const caption = hashtags && hashtags.length > 0
            ? `${content}\n\n${hashtags.map(h => `#${h}`).join(' ')}`
            : content;

        // Detect if URL is a video based on extension
        const isVideo = /\.(mp4|mov|avi|m4v)$/i.test(mediaUrl);

        // Step 1: Create media container
        const containerPayload: Record<string, string> = {
            caption,
            access_token: accessToken,
        };

        if (isVideo) {
            containerPayload.media_type = 'REELS';
            containerPayload.video_url = mediaUrl;
        } else {
            containerPayload.image_url = mediaUrl;
        }

        const containerRes = await fetch(
            `https://graph.facebook.com/v18.0/${igUserId}/media`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(containerPayload),
            }
        );

        const containerData = await containerRes.json();
        if (!containerRes.ok || !containerData.id) {
            console.error('Instagram Container Creation Failed:', JSON.stringify(containerData));
            return false;
        }

        const creationId = containerData.id;
        console.log(`Instagram: Container created (id: ${creationId}). Publishing...`);

        // For videos, wait briefly for processing (Instagram needs time to process video)
        if (isVideo) {
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        // Step 2: Publish the container
        const publishRes = await fetch(
            `https://graph.facebook.com/v18.0/${igUserId}/media_publish`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    creation_id: creationId,
                    access_token: accessToken,
                }),
            }
        );

        const publishData = await publishRes.json();
        if (!publishRes.ok || !publishData.id) {
            console.error('Instagram Publish Failed:', JSON.stringify(publishData));
            return false;
        }

        console.log('Instagram: Post published successfully, id:', publishData.id);
        return true;
    } catch (e) {
        console.error('Instagram Publish Exception:', e);
        return false;
    }
}

async function publishToLinkedIn(content: string, hashtags: string[], accessToken: string, targetId: string) {
    try {
        const fullText = hashtags && hashtags.length > 0 
            ? `${content}\n\n${hashtags.join(' ')}` 
            : content;

        // If it starts with urn:li:organization, it's a page. If urn:li:person, personal profile.
        // If targetId is not an urn (like an old ID), we format it as person urn.
        const authorUrn = targetId.startsWith('urn:li:') 
            ? targetId 
            : `urn:li:person:${targetId}`;

        const payload = {
            author: authorUrn,
            lifecycleState: "PUBLISHED",
            specificContent: {
                "com.linkedin.ugc.ShareContent": {
                    shareCommentary: {
                        text: fullText
                    },
                    shareMediaCategory: "NONE"
                }
            },
            visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        };

        const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('LinkedIn Publish Failed:', errorText);
            return false;
        }

        return true;
    } catch (e) {
        console.error('LinkedIn Publish Exception:', e);
        return false;
    }
}
