'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Loader2,
    Search,
    Sparkles,
    TrendingUp,
    Zap,
    Copy,
    ArrowRight,
    Plus,
    X,
    BarChart3,
    Target,
    MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

interface NicheDna {
    avgLength: number;
    dominantTone: string;
    emojiDensity: string;
    hashtagStrategy: string;
}

interface HookPattern {
    pattern: string;
    example: string;
    frequency: string;
}

interface StructureBlueprint {
    opening: string;
    body: string;
    closing: string;
}

interface CompetitorAnalysis {
    nicheDna: NicheDna;
    hookPatterns: HookPattern[];
    structureBlueprint: StructureBlueprint;
    winningKeywords: string[];
    contentThemes: string[];
    goldenRule: string;
    generatorPrompt: string;
}

const PLATFORMS = [
    { value: 'instagram', label: '📸 Instagram' },
    { value: 'tiktok', label: '🎵 TikTok' },
    { value: 'linkedin', label: '💼 LinkedIn' },
    { value: 'twitter', label: '𝕏 Twitter / X' },
];

export function ResearchHub() {
    const [platform, setPlatform] = useState('instagram');
    const [niche, setNiche] = useState('');
    const [captions, setCaptions] = useState<string[]>(['', '', '']);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copiedPrompt, setCopiedPrompt] = useState(false);

    const addCaptionField = () => {
        if (captions.length < 20) {
            setCaptions([...captions, '']);
        }
    };

    const removeCaptionField = (index: number) => {
        if (captions.length > 3) {
            setCaptions(captions.filter((_, i) => i !== index));
        }
    };

    const updateCaption = (index: number, value: string) => {
        const updated = [...captions];
        updated[index] = value;
        setCaptions(updated);
    };

    const analyzeCompetitors = async () => {
        const validCaptions = captions.filter((c) => c.trim().length >= 5);
        if (validCaptions.length < 3) {
            setError('Please paste at least 3 competitor captions (min 5 characters each).');
            return;
        }

        if (!niche.trim()) {
            setError('Please enter your niche or industry.');
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setAnalysis(null);

        try {
            const response = await fetch('/api/research/analyze-competitor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    captions: validCaptions,
                    platform,
                    niche: niche.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Analysis failed');
            }

            setAnalysis(data.analysis);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const copyGeneratorPrompt = () => {
        if (analysis?.generatorPrompt) {
            navigator.clipboard.writeText(analysis.generatorPrompt);
            setCopiedPrompt(true);
            setTimeout(() => setCopiedPrompt(false), 2000);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 lg:py-20">
            <div className="text-center mb-12 space-y-4">
                <Badge variant="outline" className="text-primary border-primary/30 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest">
                    <Search className="w-3 h-3 mr-2" />
                    Pro Feature
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-zinc-50">
                    Competitor Research{' '}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                        Engine
                    </span>
                </h1>
                <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
                    Paste your competitors&apos; best captions. Our AI extracts their secret viral patterns and gives you a ready-to-use blueprint.
                </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
                {/* Input Section */}
                <Card className="lg:col-span-2 rounded-3xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-xl font-bold">Feed the Engine</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-2 space-y-6">
                        {/* Niche */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Your Niche</label>
                            <input
                                type="text"
                                value={niche}
                                onChange={(e) => setNiche(e.target.value)}
                                placeholder="e.g. Fitness coaching, SaaS marketing..."
                                className="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                            />
                        </div>

                        {/* Platform */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Platform</label>
                            <Select value={platform} onValueChange={setPlatform}>
                                <SelectTrigger className="h-12 rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PLATFORMS.map((p) => (
                                        <SelectItem key={p.value} value={p.value}>
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Competitor Captions */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                                    Competitor Captions ({captions.filter((c) => c.trim().length >= 5).length}/{captions.length})
                                </label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={addCaptionField}
                                    disabled={captions.length >= 20}
                                    className="text-primary text-xs font-bold"
                                >
                                    <Plus className="w-3 h-3 mr-1" /> Add
                                </Button>
                            </div>

                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                {captions.map((caption, index) => (
                                    <div key={index} className="relative group">
                                        <textarea
                                            value={caption}
                                            onChange={(e) => updateCaption(index, e.target.value)}
                                            placeholder={`Paste competitor caption #${index + 1}...`}
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all resize-none"
                                        />
                                        {captions.length > 3 && (
                                            <button
                                                onClick={() => removeCaptionField(index)}
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                                            >
                                                <X className="w-3 h-3 text-zinc-500 hover:text-red-500" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Analyze Button */}
                        <Button
                            onClick={analyzeCompetitors}
                            disabled={isAnalyzing}
                            className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary via-purple-500 to-pink-500 hover:opacity-90 text-white font-bold text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Analyzing Patterns...
                                </>
                            ) : (
                                <>
                                    <Search className="mr-2 h-5 w-5" />
                                    Extract Viral DNA
                                </>
                            )}
                        </Button>

                        {error && (
                            <p className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-950/20 p-3 rounded-xl">
                                {error}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Results Section */}
                <Card className="lg:col-span-3 rounded-3xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            Viral Intelligence Report
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-2">
                        {!analysis && !isAnalyzing && (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                    <TrendingUp className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
                                </div>
                                <p className="text-zinc-400 text-lg font-medium">
                                    Paste at least 3 competitor captions to unlock their viral DNA.
                                </p>
                            </div>
                        )}

                        {isAnalyzing && (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                                    <Search className="w-10 h-10 text-primary" />
                                </div>
                                <p className="text-zinc-500 text-lg font-medium">
                                    Reverse-engineering their strategy...
                                </p>
                            </div>
                        )}

                        {analysis && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Golden Rule */}
                                <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl border border-amber-200/50 dark:border-amber-800/30">
                                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Sparkles className="w-3 h-3" /> Golden Rule
                                    </p>
                                    <p className="text-base font-bold text-amber-900 dark:text-amber-200 italic">
                                        &quot;{analysis.goldenRule}&quot;
                                    </p>
                                </div>

                                {/* Niche DNA Grid */}
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Niche DNA</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                            <p className="text-xs text-zinc-400 font-bold uppercase">Avg Length</p>
                                            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{analysis.nicheDna.avgLength}<span className="text-sm text-zinc-400 ml-1">chars</span></p>
                                        </div>
                                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                            <p className="text-xs text-zinc-400 font-bold uppercase">Dominant Tone</p>
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">{analysis.nicheDna.dominantTone}</p>
                                        </div>
                                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                            <p className="text-xs text-zinc-400 font-bold uppercase">Emoji Strategy</p>
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">{analysis.nicheDna.emojiDensity}</p>
                                        </div>
                                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                            <p className="text-xs text-zinc-400 font-bold uppercase">Hashtag Approach</p>
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">{analysis.nicheDna.hashtagStrategy}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Hook Patterns */}
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-primary" /> Hook Patterns
                                    </h3>
                                    <div className="space-y-3">
                                        {analysis.hookPatterns.map((hook, i) => (
                                            <div key={i} className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-bold text-primary">{hook.pattern}</span>
                                                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-none">
                                                        {hook.frequency}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">&quot;{hook.example}&quot;</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Structure Blueprint */}
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Target className="w-4 h-4 text-purple-500" /> Structure Blueprint
                                    </h3>
                                    <div className="space-y-2">
                                        {(['opening', 'body', 'closing'] as const).map((section) => (
                                            <div key={section} className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                                <span className="text-xs font-bold text-zinc-400 uppercase w-16 shrink-0 pt-0.5">{section}</span>
                                                <p className="text-sm text-zinc-700 dark:text-zinc-300">{analysis.structureBlueprint[section]}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Winning Keywords & Themes */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">Winning Keywords</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.winningKeywords.map((kw, i) => (
                                                <Badge key={i} variant="secondary" className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-none text-xs font-bold">
                                                    {kw}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">Content Themes</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.contentThemes.map((theme, i) => (
                                                <Badge key={i} variant="secondary" className="px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-none text-xs font-bold">
                                                    {theme}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Generator Prompt (CTA) */}
                                <div className="p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl border border-primary/20">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <MessageSquare className="w-3 h-3" /> Ready-to-Use Prompt
                                            </p>
                                            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 italic">
                                                &quot;{analysis.generatorPrompt}&quot;
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        <Button
                                            variant="outline"
                                            onClick={copyGeneratorPrompt}
                                            className="h-10 px-4 rounded-xl text-sm font-bold"
                                        >
                                            <Copy className="w-4 h-4 mr-2" />
                                            {copiedPrompt ? 'Copied!' : 'Copy Prompt'}
                                        </Button>
                                        <Link href="/caption-generator">
                                            <Button className="h-10 px-5 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20">
                                                <ArrowRight className="w-4 h-4 mr-2" />
                                                Use in Generator
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
