'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/shared/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, User, CreditCard, BarChart3, Shield, ExternalLink } from 'lucide-react';
import { SocialConnections } from '@/features/social/components/SocialConnections';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserData {
    email: string;
    subscription_tier: string;
    subscription_status: string;
    daily_caption_count: number;
    current_period_end: string | null;
}

export default function SettingsPage() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [portalLoading, setPortalLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setUserData(profile);
            } else if (profileError) {
                console.error('Error loading profile:', profileError);
                setError('Failed to load profile data.');
            }
            setLoading(false);
        }

        loadData();
    }, [supabase, router]);

    const handleManageSubscription = async () => {
        setPortalLoading(true);
        try {
            const response = await fetch('/api/create-portal-session', {
                method: 'POST',
            });
            const data = await response.json();

            if (data.redirect) {
                router.push(data.redirect);
            } else if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No URL returned');
            }
        } catch (error) {
            console.error('Error opening portal:', error);
            alert('Failed to open billing portal. Please try again.');
        } finally {
            setPortalLoading(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">Retry</Button>
            </div>
        )
    }

    if (!userData) return null;

    const dailyLimit = userData.subscription_tier === 'free' ? 10 : '∞';
    const usagePercentage = userData.subscription_tier === 'free'
        ? Math.min((userData.daily_caption_count / 10) * 100, 100)
        : 0;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                    <p className="text-muted-foreground mt-2">Manage your subscription, usage, and preferences.</p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Profile Card */}
                <Card className="shadow-lg border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Email Address</label>
                            <p className="font-medium text-lg">{userData.email}</p>
                        </div>
                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <Button variant="outline" onClick={handleSignOut} className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/20 dark:hover:text-red-400 dark:hover:border-red-800 transition-colors">
                                Sign Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Usage Card */}
                <Card className="shadow-lg border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            Usage
                        </CardTitle>
                        <CardDescription>Daily caption generations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm font-medium">
                                <span>{userData.daily_caption_count} / {dailyLimit} used</span>
                                <span className="text-muted-foreground">Resets daily</span>
                            </div>
                            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 rounded-full ${userData.daily_caption_count >= 10 ? 'bg-red-500' : 'bg-primary'}`}
                                    style={{ width: `${userData.subscription_tier === 'free' ? usagePercentage : 100}%` }}
                                />
                            </div>
                        </div>
                        {userData.subscription_tier === 'free' && (
                            <div className="pt-2">
                                <Link href="/pricing" className="block w-full">
                                    <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity shadow-md">
                                        Upgrade to Pro for Unlimited
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Subscription Card */}
                <Card className="md:col-span-2 shadow-lg border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary" />
                            Subscription
                        </CardTitle>
                        <CardDescription>Your plan and billing details</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center p-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-2xl capitalize">{userData.subscription_tier} Plan</span>
                                <Badge variant={userData.subscription_status === 'active' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                                    {userData.subscription_status || 'Active'}
                                </Badge>
                            </div>
                            {userData.current_period_end ? (
                                <p className="text-sm text-muted-foreground">
                                    Renews on {new Date(userData.current_period_end).toLocaleDateString()}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Free plan (No expiration)
                                </p>
                            )}
                        </div>

                        <Button
                            onClick={handleManageSubscription}
                            disabled={portalLoading}
                            size="lg"
                            variant={userData.subscription_tier === 'free' ? 'outline' : 'default'}
                            className="min-w-[200px]"
                        >
                            {portalLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Opening Portal...
                                </>
                            ) : (
                                <>
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    {userData.subscription_tier === 'free' ? 'View Billing' : 'Manage Subscription'}
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Social Connections */}
                <SocialConnections />
            </div>
        </div>
    );
}
