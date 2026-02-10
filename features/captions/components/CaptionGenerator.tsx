'use client';

import { useState } from 'react';
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
import { Loader2, Copy, RefreshCw, Sparkles, Clock } from 'lucide-react';

const TONES = [
  { value: 'casual', label: '😎 Casual', description: 'Relaxed and conversational' },
  { value: 'professional', label: '💼 Professional', description: 'Polished and business-focused' },
  { value: 'funny', label: '😄 Funny', description: 'Humorous and entertaining' },
  { value: 'edgy', label: '🎭 Edgy', description: 'Bold and provocative' },
  { value: 'witty', label: '🧠 Witty', description: 'Clever and quick-witted' },
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
  platform: string[];
  tone: string;
}

export function CaptionGenerator() {
  const [description, setDescription] = useState('');
  const [tone, setTone] = useState('casual');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CaptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remainingToday, setRemainingToday] = useState<number | null>(null);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const generateCaption = async () => {
    if (description.length < 5) {
      setError('Please provide a description (at least 5 characters)');
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          tone,
          platform: selectedPlatforms,
          numHashtags: 10,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate caption');
      }

      setResult(data.caption);
      setRemainingToday(data.remainingToday);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      const text = `${result.content}\n\n${result.hashtags.map(h => `#${h}`).join(' ')}`;
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 lg:py-20">
      <div className="mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold tracking-tight">
          <Sparkles className="w-4 h-4" />
          Powered by GPT-4o
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">Caption Generator</h1>
        <p className="text-lg text-zinc-500 max-w-2xl leading-relaxed">Create engaging social media captions in seconds. Tailored to your brand DNA.</p>
        {remainingToday !== null && (
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
            <Clock className="w-4 h-4" />
            <span>{remainingToday} daily generations remaining</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Input Section */}
        <Card className="lg:col-span-5 rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
          <CardHeader className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 p-8">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              Define Your Post
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Description Input */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                Main Idea
              </label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What is your post about? Maximize engagement..."
                className="min-h-[160px] resize-none rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-primary/20 focus:border-primary transition-all p-5 text-base"
              />
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
                    <SelectItem key={t.value} value={t.value} className="rounded-xl py-3 focus:bg-primary/5 transition-colors cursor-pointer">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold">{t.label}</span>
                        <span className="text-xs text-zinc-500">{t.description}</span>
                      </div>
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

            {/* Generate Button */}
            <Button
              onClick={generateCaption}
              disabled={isLoading}
              className="w-full h-16 rounded-2xl text-lg font-bold bg-primary shadow-2xl shadow-primary/25 hover:scale-[1.02] transition-transform active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Generating Magic...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-6 w-6" />
                  Generate Caption
                </>
              )}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-3">
                <RefreshCw className="w-4 h-4" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result Section */}
        <Card className="lg:col-span-1 rounded-3xl border-transparent bg-transparent shadow-none" /> {/* Spacer */}
        <Card className="lg:col-span-6 rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden self-start">
          <CardHeader className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 p-8">
            <CardTitle className="text-xl">Generated Caption</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {result ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-500 rounded-2xl blur opacity-15 group-hover:opacity-25 transition duration-1000"></div>
                  <div className="relative p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <p className="text-xl leading-relaxed font-medium text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap">
                      {result.content}
                    </p>
                  </div>
                </div>

                {/* Hashtags */}
                <div className="space-y-4">
                  <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Optimized Hashtags</label>
                  <div className="flex flex-wrap gap-2.5">
                    {result.hashtags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="px-4 py-1.5 rounded-lg bg-primary/10 text-primary border-none text-sm font-bold hover:bg-primary/20 transition-colors">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6">
                  <Button variant="outline" onClick={copyToClipboard} className="flex-1 h-14 rounded-xl border-zinc-200 dark:border-zinc-800 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <Copy className="mr-2 h-5 w-5" />
                    Copy All
                  </Button>
                  <Button
                    variant="outline"
                    onClick={generateCaption}
                    disabled={isLoading}
                    className="flex-1 h-14 rounded-xl border-zinc-200 dark:border-zinc-800 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <RefreshCw className={`mr-2 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                    Regenerate
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-24 space-y-4">
                <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-100 dark:border-zinc-800">
                  <Sparkles className="w-10 h-10 text-zinc-300 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-bold text-zinc-400">Ready to Create?</p>
                  <p className="text-zinc-500 leading-relaxed">Fill in the details on the left to generate <br />your first high-performing caption.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
