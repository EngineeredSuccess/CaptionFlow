'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Loader2,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    Instagram,
    Twitter,
    Linkedin,
    Zap,
    Copy,
} from 'lucide-react';

interface ScheduledCaption {
    id: string;
    content: string;
    hashtags: string[];
    platform: string[];
    scheduled_at: string;
    scheduled_status: string;
    publish_platforms: string[];
    created_at: string;
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
    instagram: <Instagram className="w-4 h-4" />,
    twitter: <Twitter className="w-4 h-4" />,
    linkedin: <Linkedin className="w-4 h-4" />,
    tiktok: <Zap className="w-4 h-4" />,
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    scheduled: {
        color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        icon: <Clock className="w-4 h-4" />,
        label: 'Scheduled',
    },
    published: {
        color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        icon: <CheckCircle2 className="w-4 h-4" />,
        label: 'Published',
    },
    failed: {
        color: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
        icon: <AlertCircle className="w-4 h-4" />,
        label: 'Failed',
    },
};

export function ScheduledPosts() {
    const [captions, setCaptions] = useState<ScheduledCaption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'scheduled' | 'published' | 'failed'>('scheduled');

    useEffect(() => {
        fetchScheduled();
    }, [activeTab]);

    const fetchScheduled = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/schedule-post?status=${activeTab}`);
            const data = await response.json();
            if (data.success) {
                setCaptions(data.captions);
            }
        } catch (error) {
            console.error('Error fetching scheduled posts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getRelativeTime = (dateStr: string) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diff = date.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (diff < 0) return 'Past due';
        if (hours < 1) return 'Less than 1 hour';
        if (hours < 24) return `In ${hours}h`;
        return `In ${days}d`;
    };

    const copyContent = (content: string) => {
        navigator.clipboard.writeText(content);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-12 lg:py-20">
            <div className="text-center mb-12 space-y-4">
                <Badge variant="outline" className="text-primary border-primary/30 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest">
                    <Calendar className="w-3 h-3 mr-2" />
                    Content Calendar
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-zinc-50">
                    Scheduled{' '}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                        Posts
                    </span>
                </h1>
                <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
                    Your content pipeline at a glance. Track what&apos;s going live and when.
                </p>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-2 mb-8 justify-center">
                {(['scheduled', 'published', 'failed'] as const).map((tab) => {
                    const config = STATUS_CONFIG[tab];
                    return (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? 'default' : 'outline'}
                            onClick={() => setActiveTab(tab)}
                            className={`rounded-xl font-bold capitalize ${activeTab === tab ? '' : 'border-zinc-200 dark:border-zinc-800'}`}
                        >
                            {config.icon}
                            <span className="ml-2">{config.label}</span>
                        </Button>
                    );
                })}
            </div>

            {/* Content */}
            <Card className="rounded-3xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        {STATUS_CONFIG[activeTab].icon}
                        {STATUS_CONFIG[activeTab].label} Posts
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : captions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                <Calendar className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
                            </div>
                            <p className="text-zinc-400 text-lg font-medium">
                                No {activeTab} posts yet.
                            </p>
                            <p className="text-zinc-400 text-sm">
                                Generate a caption and click &quot;Schedule&quot; to get started.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {captions.map((caption) => (
                                <div
                                    key={caption.id}
                                    className="group p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-primary/30 transition-all"
                                >
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex items-center gap-3">
                                            {caption.scheduled_at && (
                                                <div className="flex items-center gap-4 text-sm">
                                                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                                        {formatDate(caption.scheduled_at)}
                                                    </span>
                                                    <span className="text-zinc-400 font-medium">
                                                        {formatTime(caption.scheduled_at)}
                                                    </span>
                                                    {activeTab === 'scheduled' && (
                                                        <Badge variant="secondary" className="text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-none font-bold">
                                                            {getRelativeTime(caption.scheduled_at)}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {(caption.publish_platforms || caption.platform || []).map((p) => (
                                                <span key={p} className="text-zinc-400" title={p}>
                                                    {PLATFORM_ICONS[p] || p}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-3 mb-3 leading-relaxed">
                                        {caption.content}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-wrap gap-1.5">
                                            {(caption.hashtags || []).slice(0, 5).map((tag, i) => (
                                                <span key={i} className="text-xs text-primary font-semibold">#{tag}</span>
                                            ))}
                                            {(caption.hashtags || []).length > 5 && (
                                                <span className="text-xs text-zinc-400">+{caption.hashtags.length - 5}</span>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyContent(caption.content)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                        >
                                            <Copy className="w-3 h-3 mr-1" /> Copy
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
