'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles,
    Zap,
    CheckCircle2,
    Clock,
    Instagram,
    Twitter,
    Linkedin,
    Rocket,
    ArrowRight,
    ShieldCheck,
    Target,
    Loader2,
} from 'lucide-react';

const BENEFITS = [
    {
        icon: <Target className="w-5 h-5 text-primary" />,
        text: "Learns your brand voice from 5 examples",
    },
    {
        icon: <Sparkles className="w-5 h-5 text-purple-500" />,
        text: "Works for IG, TikTok, LinkedIn, Twitter/X",
    },
    {
        icon: <Zap className="w-5 h-5 text-yellow-500" />,
        text: "Smart hashtags that boost reach",
    },
    {
        icon: <Clock className="w-5 h-5 text-emerald-500" />,
        text: "Save 5+ hours every week",
    },
];

export default function WaitlistPage() {
    const [email, setEmail] = useState('');
    const [handle, setHandle] = useState('');
    const [platform, setPlatform] = useState('instagram');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');
        setMessage('');

        try {
            const response = await fetch('/api/waitlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, handle, platform }),
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitStatus('success');
                setMessage(data.message);
                setEmail('');
                setHandle('');
            } else {
                setSubmitStatus('error');
                setMessage(data.error || 'Something went wrong.');
            }
        } catch (error) {
            setSubmitStatus('error');
            setMessage('Failed to join waitlist. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 font-sans selection:bg-primary/30">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-50 dark:opacity-20" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] opacity-50 dark:opacity-20" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            <main className="max-w-6xl mx-auto px-4 py-20 lg:py-32 flex flex-col items-center">
                {/* Header */}
                <div className="text-center space-y-6 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <Badge variant="secondary" className="px-4 py-1.5 rounded-full bg-primary/10 text-primary border-none text-sm font-bold uppercase tracking-widest ring-1 ring-primary/20">
                        <Rocket className="w-3.5 h-3.5 mr-2" />
                        Join the waitlist
                    </Badge>

                    <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.1]">
                        Stop Writing Captions.<br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                            Start Creating.
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        The first AI caption generator that learns <span className="text-zinc-900 dark:text-zinc-100 font-bold underline decoration-primary decoration-4 underline-offset-4 italic">YOUR</span> unique voice.
                        Upload 5 examples. Get unlimited captions that sound exactly like you.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start w-full">
                    {/* Left: Benefits & Social Proof */}
                    <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-1000 delay-200">
                        <div className="grid sm:grid-cols-2 gap-6">
                            {BENEFITS.map((benefit, i) => (
                                <div key={i} className="group p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mb-4 ring-1 ring-zinc-200 dark:ring-zinc-700 group-hover:scale-110 transition-transform duration-500">
                                        {benefit.icon}
                                    </div>
                                    <p className="font-bold text-zinc-800 dark:text-zinc-200 leading-snug">
                                        {benefit.text}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Incentive Banner */}
                        <div className="relative overflow-hidden p-8 rounded-[32px] bg-gradient-to-br from-zinc-900 to-zinc-950 text-white shadow-2xl">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Rocket className="w-32 h-32 rotate-12" />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className={`w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-[10px] font-bold`}>
                                                {String.fromCharCode(64 + i)}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-sm font-bold text-zinc-400">100+ creators joined</span>
                                </div>
                                <h3 className="text-2xl font-bold">🎉 Early Access Special</h3>
                                <p className="text-zinc-400 text-lg">
                                    Join today to get your <span className="text-primary font-bold">first month FREE</span> and a <span className="text-purple-400 font-bold">25% lifetime discount</span>. Limited to the first 500 signups.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-zinc-400 font-medium pt-4">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                            <span>2,400+ creators already using CaptionFlow ecosystem</span>
                        </div>
                    </div>

                    {/* Right: Submission Form */}
                    <div className="animate-in fade-in slide-in-from-right-4 duration-1000 delay-400">
                        <Card className="rounded-[40px] border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-2xl shadow-primary/10 p-2 overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-800">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-2xl font-bold text-center">Get Early Access</CardTitle>
                                <CardDescription className="text-center">Start generating high-reach content that sounds like you.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-4">
                                {submitStatus === 'success' ? (
                                    <div className="py-12 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-500">
                                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{message}</h3>
                                            <p className="text-zinc-500">We'll reach out as soon as your spot opens up.</p>
                                        </div>
                                        <Button variant="outline" onClick={() => setSubmitStatus('idle')} className="rounded-full px-8">
                                            Wait for another?
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
                                            <Input
                                                type="email"
                                                placeholder="you@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="h-14 px-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest ml-1">Social Handle</label>
                                            <Input
                                                type="text"
                                                placeholder="@yourname"
                                                value={handle}
                                                onChange={(e) => setHandle(e.target.value)}
                                                required
                                                className="h-14 px-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest ml-1">Primary Platform</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {['instagram', 'tiktok', 'linkedin', 'twitter'].map((p) => (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        onClick={() => setPlatform(p)}
                                                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 font-bold capitalize ${platform === p
                                                                ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20'
                                                                : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-600'
                                                            }`}
                                                    >
                                                        {p === 'instagram' && <Instagram size={18} />}
                                                        {p === 'tiktok' && <Zap size={18} />}
                                                        {p === 'linkedin' && <Linkedin size={18} />}
                                                        {p === 'twitter' && <Twitter size={18} />}
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {submitStatus === 'error' && (
                                            <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 text-sm font-bold text-center border border-red-500/20">
                                                {message}
                                            </div>
                                        )}

                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20 ring-1 ring-white/20 transition-all active:scale-[0.98]"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Securing your spot...
                                                </>
                                            ) : (
                                                <>
                                                    Join the Waitlist
                                                    <ArrowRight className="w-5 h-5 ml-2" />
                                                </>
                                            )}
                                        </Button>

                                        <p className="text-center text-xs text-zinc-400 font-medium">
                                            By joining, you agree to receive early access updates.
                                            No spam, just pure value.
                                        </p>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="max-w-6xl mx-auto px-4 py-20 border-t border-zinc-100 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold">C</div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-zinc-50 dark:to-zinc-500">CaptionFlow</span>
                </div>
                <p className="text-zinc-500 font-medium flex items-center gap-2">
                    Developed by creators, for creators. <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                </p>
            </footer>
        </div>
    );
}

function Heart({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
    );
}
