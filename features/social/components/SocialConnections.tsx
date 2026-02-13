'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Instagram,
    Twitter,
    Linkedin,
    Zap,
    Loader2,
    CheckCircle2,
    LinkIcon,
    Unlink,
    Dna,
    AlertCircle,
} from 'lucide-react';

interface SocialConnection {
    id: string;
    platform: string;
    platform_handle: string;
    connected_at: string;
    profile_dna: Record<string, unknown>;
}

const PLATFORMS = [
    {
        id: 'instagram',
        name: 'Instagram',
        icon: Instagram,
        gradient: 'from-pink-500 via-purple-500 to-orange-400',
        bgLight: 'bg-pink-50',
        bgDark: 'dark:bg-pink-950/20',
        textColor: 'text-pink-600 dark:text-pink-400',
        borderColor: 'border-pink-200 dark:border-pink-800',
        description: 'Share photos, reels & stories',
    },
    {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: Linkedin,
        gradient: 'from-blue-600 to-blue-400',
        bgLight: 'bg-blue-50',
        bgDark: 'dark:bg-blue-950/20',
        textColor: 'text-blue-600 dark:text-blue-400',
        borderColor: 'border-blue-200 dark:border-blue-800',
        description: 'Professional networking & articles',
    },
    {
        id: 'twitter',
        name: 'X / Twitter',
        icon: Twitter,
        gradient: 'from-zinc-800 to-zinc-600',
        bgLight: 'bg-zinc-50',
        bgDark: 'dark:bg-zinc-800/30',
        textColor: 'text-zinc-700 dark:text-zinc-300',
        borderColor: 'border-zinc-200 dark:border-zinc-700',
        description: 'Tweets, threads & engagement',
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        icon: Zap,
        gradient: 'from-cyan-400 via-pink-500 to-red-500',
        bgLight: 'bg-cyan-50',
        bgDark: 'dark:bg-cyan-950/20',
        textColor: 'text-cyan-600 dark:text-cyan-400',
        borderColor: 'border-cyan-200 dark:border-cyan-800',
        description: 'Short videos & trends',
    },
];

export function SocialConnections() {
    const [connections, setConnections] = useState<SocialConnection[]>([]);
    const [loading, setLoading] = useState(true);
    const [disconnecting, setDisconnecting] = useState<string | null>(null);
    const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const fetchConnections = useCallback(async () => {
        try {
            const res = await fetch('/api/social-connections');
            const data = await res.json();
            setConnections(data.connections || []);
        } catch (error) {
            console.error('Failed to fetch connections:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConnections();

        // Check URL params for OAuth result
        const params = new URLSearchParams(window.location.search);
        const connected = params.get('social_connected');
        const error = params.get('social_error');

        if (connected) {
            setNotification({ type: 'success', message: `${connected} connected successfully! 🎉` });
            // Clean URL
            window.history.replaceState({}, '', '/settings');
            fetchConnections();
        }
        if (error) {
            const errorMessages: Record<string, string> = {
                denied: 'Authorization was denied. Please try again.',
                token_failed: 'Failed to connect. Please check your credentials.',
                not_configured: 'This platform is not configured yet. Contact support.',
                expired: 'Authorization expired. Please try again.',
                save_failed: 'Failed to save connection. Please try again.',
                missing_code: 'Authorization code was missing. Please try again.',
                invalid_state: 'Security validation failed. Please try again.',
                unknown: 'An unexpected error occurred. Please try again.',
            };
            setNotification({ type: 'error', message: errorMessages[error] || 'Connection failed.' });
            window.history.replaceState({}, '', '/settings');
        }

        // Clear notification after 6 seconds
        const timer = setTimeout(() => setNotification(null), 6000);
        return () => clearTimeout(timer);
    }, [fetchConnections]);

    const handleConnect = (platformId: string) => {
        setConnectingPlatform(platformId);
        // Redirect to OAuth flow
        window.location.href = `/api/auth/social/${platformId}`;
    };

    const handleDisconnect = async (connectionId: string, platformName: string) => {
        if (!confirm(`Disconnect ${platformName}? Scheduled posts for this account won't be published.`)) return;

        setDisconnecting(connectionId);
        try {
            const res = await fetch('/api/social-connections', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ connectionId }),
            });

            if (res.ok) {
                setConnections(prev => prev.filter(c => c.id !== connectionId));
                setNotification({ type: 'success', message: `${platformName} disconnected.` });
            }
        } catch (error) {
            console.error('Disconnect error:', error);
            setNotification({ type: 'error', message: 'Failed to disconnect. Please try again.' });
        } finally {
            setDisconnecting(null);
        }
    };

    const getConnection = (platformId: string) =>
        connections.find(c => c.platform === platformId);

    if (loading) {
        return (
            <Card className="md:col-span-2 shadow-lg border-zinc-200 dark:border-zinc-800">
                <CardContent className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="md:col-span-2 shadow-lg border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                    <LinkIcon className="w-5 h-5 text-primary" />
                    Social Connections
                </CardTitle>
                <CardDescription>
                    Link your accounts for one-click scheduling and{' '}
                    <span className="font-semibold text-primary">Profile DNA Sync</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Notification Banner */}
                {notification && (
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300 ${notification.type === 'success'
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                        }`}>
                        {notification.type === 'success'
                            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                            : <AlertCircle className="w-4 h-4 shrink-0" />
                        }
                        {notification.message}
                    </div>
                )}

                {/* Platform Cards */}
                <div className="grid gap-3 sm:grid-cols-2">
                    {PLATFORMS.map(platform => {
                        const connection = getConnection(platform.id);
                        const Icon = platform.icon;
                        const isConnecting = connectingPlatform === platform.id;
                        const isDisconnecting = disconnecting === connection?.id;

                        return (
                            <div
                                key={platform.id}
                                className={`relative group p-5 rounded-2xl border transition-all duration-300 ${connection
                                        ? `${platform.bgLight} ${platform.bgDark} ${platform.borderColor}`
                                        : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:border-primary/30'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${platform.gradient} text-white shadow-lg`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                                {platform.name}
                                            </p>
                                            <p className="text-xs text-zinc-400 mt-0.5">
                                                {platform.description}
                                            </p>
                                        </div>
                                    </div>
                                    {connection && (
                                        <Badge variant="outline" className="text-xs bg-white/80 dark:bg-zinc-900/50 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-bold">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Live
                                        </Badge>
                                    )}
                                </div>

                                {connection ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-semibold ${platform.textColor}`}>
                                                {connection.platform_handle}
                                            </span>
                                            {connection.profile_dna && Object.keys(connection.profile_dna).length > 0 && (
                                                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-none font-bold">
                                                    <Dna className="w-3 h-3 mr-1" />
                                                    DNA Synced
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-zinc-400">
                                                Connected {new Date(connection.connected_at).toLocaleDateString()}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDisconnect(connection.id, platform.name)}
                                                disabled={isDisconnecting}
                                                className="text-xs text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                            >
                                                {isDisconnecting ? (
                                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                ) : (
                                                    <Unlink className="w-3 h-3 mr-1" />
                                                )}
                                                Disconnect
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={() => handleConnect(platform.id)}
                                        disabled={isConnecting}
                                        className={`w-full mt-2 rounded-xl font-bold bg-gradient-to-r ${platform.gradient} text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-none`}
                                    >
                                        {isConnecting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Connecting...
                                            </>
                                        ) : (
                                            <>
                                                <LinkIcon className="w-4 h-4 mr-2" />
                                                Connect {platform.name}
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* DNA Sync Info */}
                {connections.length > 0 && (
                    <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 mt-4">
                        <Dna className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-bold text-primary mb-1">Profile DNA Sync</p>
                            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                CaptionFlow analyzes your connected profiles to learn your unique voice — emoji patterns, hook styles, and posting rhythm. This data supercharges your AI-generated captions.
                            </p>
                        </div>
                    </div>
                )}

                {/* Empty state hint */}
                {connections.length === 0 && (
                    <div className="text-center py-4 text-sm text-zinc-400">
                        Connect a social account above to enable <strong className="text-primary">one-click scheduling</strong> and <strong className="text-primary">DNA-powered captions</strong>.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
