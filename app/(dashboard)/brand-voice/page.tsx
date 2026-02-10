'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Loader2, Save, CheckCircle, AlertCircle, Zap } from 'lucide-react';

const TONES = [
  { value: 'casual', label: '😎 Casual' },
  { value: 'professional', label: '💼 Professional' },
  { value: 'funny', label: '😄 Funny' },
  { value: 'edgy', label: '🎭 Edgy' },
  { value: 'witty', label: '🧠 Witty' },
];

export default function BrandVoicePage() {
  const [examples, setExamples] = useState<string[]>(['', '', '', '', '']);
  const [selectedTone, setSelectedTone] = useState('casual');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasPro, setHasPro] = useState(false);
  const [savedVoice, setSavedVoice] = useState<{
    id: string;
    selected_tone: string;
    updated_at: string;
    example_1?: string;
    example_2?: string;
    example_3?: string;
    example_4?: string;
    example_5?: string;
  } | null>(null);

  useEffect(() => {
    fetchBrandVoice();
  }, []);

  const fetchBrandVoice = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/brand-voices');
      const data = await response.json();

      if (response.ok && data.brandVoice) {
        const voice = data.brandVoice;
        setSavedVoice(voice);
        setSelectedTone(voice.selected_tone);
        setExamples([
          voice.example_1 || '',
          voice.example_2 || '',
          voice.example_3 || '',
          voice.example_4 || '',
          voice.example_5 || '',
        ]);
      }

      // Check subscription tier
      const userResponse = await fetch('/api/user');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setHasPro(userData.user?.subscription_tier !== 'free');
      }
    } catch (err) {
      console.error('Error fetching brand voice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateExample = (index: number, value: string) => {
    const newExamples = [...examples];
    newExamples[index] = value;
    setExamples(newExamples);
  };

  const saveBrandVoice = async () => {
    const filledExamples = examples.filter(ex => ex.trim().length > 0);

    if (filledExamples.length === 0) {
      setError('Please provide at least one example caption');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/brand-voices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examples: filledExamples,
          selectedTone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save brand voice');
      }

      setSuccess(true);
      setSavedVoice(data.brandVoice);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 lg:py-20">
      <div className="mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold tracking-tight">
          <Zap className="w-4 h-4" />
          Neural Training
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">Brand Voice DNA</h1>
        <p className="text-lg text-zinc-500 max-w-2xl leading-relaxed">
          Train the AI to capture your unique rhythm, vocabulary, and emotional resonance.
        </p>
      </div>

      {!hasPro && (
        <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 shadow-xl shadow-amber-500/5 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-amber-900 dark:text-amber-200 text-lg">Pro Feature Locked</p>
            <p className="text-amber-700 dark:text-amber-400">
              Brand DNA mapping requires a Pro subscription.{' '}
              <a href="/pricing" className="underline font-bold decoration-2 underline-offset-4">
                Upgrade to Pro
              </a>
            </p>
          </div>
        </div>
      )}

      <Card className="rounded-[2.5rem] border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        <CardHeader className="p-10 pb-0 space-y-2">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Save className="w-5 h-5 text-primary" />
            </div>
            Training Repository
          </CardTitle>
          <CardDescription className="text-base text-zinc-500">
            Paste 3-5 of your most successful captions below. The AI will deconstruct <br className="hidden md:block" />
            your writing &apos;DNA&apos; to provide authentically formatted results.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-10 space-y-10">
          {/* Example Inputs */}
          <div className="grid gap-6">
            {[0, 1, 2, 3, 4].map(index => (
              <div key={index} className="space-y-3">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center justify-between px-1">
                  <span>Training Sample {index + 1}</span>
                  {index < 3 && <span className="text-primary text-[10px] font-bold">Required Hook</span>}
                </label>
                <Textarea
                  value={examples[index]}
                  onChange={e => updateExample(index, e.target.value)}
                  placeholder={`Paste a sample caption here...`}
                  className="min-h-[100px] resize-none rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-primary/20 focus:border-primary transition-all p-5 text-base"
                  disabled={!hasPro}
                />
              </div>
            ))}
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

          {/* Tone Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] px-1">
              Global Tone Bias
            </label>
            <Select
              value={selectedTone}
              onValueChange={setSelectedTone}
              disabled={!hasPro}
            >
              <SelectTrigger className="h-16 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 font-bold text-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-zinc-200 dark:border-zinc-800 p-2 shadow-2xl">
                {TONES.map(t => (
                  <SelectItem key={t.value} value={t.value} className="rounded-xl py-4 focus:bg-primary/5 transition-colors cursor-pointer">
                    <span className="font-bold text-lg">{t.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Display Area */}
          <div className="space-y-4">
            {savedVoice && (
              <div className="p-6 bg-primary/[0.03] border border-primary/20 rounded-3xl animate-in zoom-in-95 duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-primary">Brand DNA Map Active</p>
                    <p className="text-sm text-zinc-400">
                      Synchronized on {new Date(savedVoice.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-3xl text-red-600 dark:text-red-400 font-medium flex gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-3xl text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-3">
                <CheckCircle className="w-5 h-5" />
                Neural mapping complete. Your voice is saved.
              </div>
            )}
          </div>

          {/* Save Action */}
          <div className="pt-4">
            <Button
              onClick={saveBrandVoice}
              disabled={isSaving || !hasPro}
              className="w-full h-16 rounded-2xl text-xl font-bold bg-primary shadow-2xl shadow-primary/25 hover:scale-[1.01] transition-all active:scale-[0.99]"
              size="lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Processing DNA...
                </>
              ) : (
                <>
                  <Zap className="mr-3 h-6 w-6" />
                  Save Brand Voice
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
