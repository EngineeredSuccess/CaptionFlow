'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, RefreshCw, Repeat2, Lock } from 'lucide-react';
import { CaptionResultCard } from './CaptionResultCard';

const TONES = [
  { value: 'casual', label: '😎 Casual' },
  { value: 'professional', label: '💼 Professional' },
  { value: 'funny', label: '😄 Funny' },
  { value: 'edgy', label: '🎭 Edgy' },
  { value: 'witty', label: '🧠 Witty' },
];

const PLATFORMS = [
  { value: 'instagram', label: '📸 Instagram' },
  { value: 'tiktok', label: '🎵 TikTok' },
  { value: 'linkedin', label: '💼 LinkedIn' },
  { value: 'twitter', label: '🐦 Twitter/X' },
];

interface CaptionResult {
  id: string;
  content: string;
  hashtags: string[];
  platform: string;
  tone: string;
}

interface BrandVoice {
  id: string;
  name: string;
}

export function CaptionRemixer() {
  const [sourceText, setSourceText] = useState('');
  const [tone, setTone] = useState('casual');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);
  const [brandVoiceId, setBrandVoiceId] = useState<string>('none');
  const [brandVoices, setBrandVoices] = useState<BrandVoice[]>([]);
  const [useHumanMode, setUseHumanMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CaptionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<string>('free');
  const [activeModel, setActiveModel] = useState<'gpt-4o' | 'claude'>('gpt-4o');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch brand voices
        const bvRes = await fetch('/api/brand-voices');
        if (bvRes.ok) {
          const bvData = await bvRes.json();
          setBrandVoices(bvData.brandVoice ? [{ id: bvData.brandVoice.id, name: 'My Brand Voice' }] : []);
        }
        // Fetch user tier
        const userRes = await fetch('/api/user');
        if (userRes.ok) {
          const userData = await userRes.json();
          setUserTier(userData.subscription_tier || 'free');
        }
      } catch {
        console.error('Failed to fetch remix data');
      }
    }
    fetchData();
  }, []);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const handleRemix = async () => {
    if (sourceText.length < 10) {
      setError('Please paste some text to remix (at least 10 characters)');
      return;
    }
    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch('/api/remix-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceText,
          tone,
          platform: selectedPlatforms,
          brandVoiceId: brandVoiceId !== 'none' ? brandVoiceId : undefined,
          numHashtags: 8,
          useHumanMode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Remix failed');
      }

      if (data.captions && Array.isArray(data.captions)) {
        setResults(data.captions);
      }
      if (data.model) setActiveModel(data.model);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (userTier === 'free') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 lg:py-20">
        <div className="mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold tracking-tight">
            <Repeat2 className="w-4 h-4" />
            One-Click Remix
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">Remix Any Post</h1>
          <p className="text-lg text-zinc-500 max-w-2xl leading-relaxed">
            Paste any caption or text and transform it into your own voice — across every platform.
          </p>
        </div>

        <Card className="rounded-3xl border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 shadow-xl max-w-xl mx-auto">
          <CardContent className="p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Pro Feature</h2>
              <p className="text-zinc-500 leading-relaxed">
                One-Click Remix is available for Pro and Team users. Upgrade to remix any content into your brand voice in seconds.
              </p>
            </div>
            <a href="/pricing">
              <Button className="h-14 px-10 rounded-2xl font-bold bg-primary shadow-xl shadow-primary/25 hover:scale-[1.02] transition-transform">
                <Sparkles className="mr-2 w-5 h-5" />
                Upgrade to Pro
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 lg:py-20">
      <div className="mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold tracking-tight">
          <Repeat2 className="w-4 h-4" />
          {activeModel === 'claude' ? '✨ Human Mode — Claude Sonnet' : 'Powered by GPT-4o'}
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">Remix Any Post</h1>
        <p className="text-lg text-zinc-500 max-w-2xl leading-relaxed">
          Paste any content — a competitor's post, an article, a tweet — and transform it into your voice.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Input Panel */}
        <Card className="lg:col-span-12 xl:col-span-5 rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden self-start">
          <CardHeader className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 p-8">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Repeat2 className="w-5 h-5 text-primary" />
              </div>
              Source Content
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Source Text */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                Paste Any Text
              </label>
              <Textarea
                value={sourceText}
                onChange={e => setSourceText(e.target.value)}
                placeholder="Paste a competitor's post, a viral tweet, an article excerpt, or any content you want to remix in your own voice..."
                className="min-h-[200px] resize-none rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-primary/20 focus:border-primary transition-all p-5 text-base"
              />
              <p className="text-xs text-zinc-400">
                {sourceText.length}/5000 characters
              </p>
            </div>

            {/* Tone Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Tone of Voice</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="h-14 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-5 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-zinc-200 dark:border-zinc-800 p-2 shadow-2xl">
                  {TONES.map(t => (
                    <SelectItem key={t.value} value={t.value} className="rounded-xl py-3 focus:bg-primary/5 cursor-pointer">
                      <span className="font-bold">{t.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Platform Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Platforms</label>
              <div className="grid grid-cols-2 gap-3">
                {PLATFORMS.map(p => {
                  const isActive = selectedPlatforms.includes(p.value);
                  return (
                    <button
                      key={p.value}
                      onClick={() => togglePlatform(p.value)}
                      className={`h-14 px-4 rounded-xl border font-bold text-sm flex items-center gap-3 transition-all duration-200 ${isActive
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]'
                        : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-primary/50'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-zinc-300'}`} />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brand Voice Selection */}
            {brandVoices.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Brand Voice</label>
                <Select value={brandVoiceId} onValueChange={setBrandVoiceId}>
                  <SelectTrigger className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-5 font-medium">
                    <SelectValue placeholder="No brand voice" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-zinc-200 dark:border-zinc-800 p-2 shadow-2xl">
                    <SelectItem value="none" className="rounded-xl py-3 cursor-pointer">
                      <span className="text-zinc-400">No brand voice</span>
                    </SelectItem>
                    {brandVoices.map(bv => (
                      <SelectItem key={bv.id} value={bv.id} className="rounded-xl py-3 cursor-pointer">
                        <span className="font-bold">{bv.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Human Mode Toggle */}
            {(userTier === 'pro' || userTier === 'team') && (
              <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                      ✨ Human Mode
                      <Badge className="text-[10px] bg-primary text-white border-none px-2 uppercase tracking-wider">Pro</Badge>
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">Claude Sonnet — sounds more like a real person</p>
                  </div>
                  <button
                    onClick={() => setUseHumanMode(v => !v)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${useHumanMode ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${useHumanMode ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            )}

            {/* Remix Button */}
            <Button
              onClick={handleRemix}
              disabled={isLoading}
              className="w-full h-16 rounded-2xl text-lg font-bold bg-primary shadow-2xl shadow-primary/25 hover:scale-[1.02] transition-transform active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Remixing...
                </>
              ) : (
                <>
                  <Repeat2 className="mr-2 h-6 w-6" />
                  Remix in My Voice
                </>
              )}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-3">
                <RefreshCw className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-8 self-start">
          {results && results.length > 0 ? (
            results.map((res: CaptionResult) => (
              <CaptionResultCard
                key={res.id}
                initialResult={res}
                userTier={userTier}
                tone={tone}
                onRefreshAll={handleRemix}
                isLoadingRefetch={isLoading}
              />
            ))
          ) : (
            <Card className="rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden min-h-[400px]">
              <CardContent className="p-8">
                <div className="text-center py-32 space-y-4">
                  <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-100 dark:border-zinc-800">
                    {isLoading
                      ? <Loader2 className="w-10 h-10 text-primary animate-spin" />
                      : <Repeat2 className="w-10 h-10 text-zinc-300" />
                    }
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-zinc-400">
                      {isLoading ? 'Remixing in your voice...' : 'Ready to Remix?'}
                    </p>
                    {!isLoading && (
                      <p className="text-zinc-500 leading-relaxed max-w-sm mx-auto">
                        Paste any text on the left — a viral post, an article, a tweet — and get it rewritten in your brand voice.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
