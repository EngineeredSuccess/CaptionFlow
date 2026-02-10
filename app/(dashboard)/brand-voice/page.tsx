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

import { Loader2, Save, CheckCircle, AlertCircle } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Brand Voice Training</h1>
        <p className="text-gray-600">
          Train the AI to write captions that match your unique style
        </p>
      </div>

      {!hasPro && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Brand voice training requires a Pro subscription.{' '}
            <a href="/pricing" className="underline font-medium">
              Upgrade to Pro
            </a>
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📝 Example Captions
          </CardTitle>
          <CardDescription>
            Paste 3-5 of your best-performing captions. The AI will analyze your
            writing style, vocabulary, tone, and patterns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Example Inputs */}
          <div className="grid gap-4">
            {[0, 1, 2, 3, 4].map(index => (
              <div key={index}>
                <label className="block text-sm font-medium mb-2">
                  Example {index + 1} {index < 3 && <span className="text-red-500">*</span>}
                </label>
                <Textarea
                  value={examples[index]}
                  onChange={e => updateExample(index, e.target.value)}
                  placeholder={`Paste one of your best captions here...`}
                  rows={2}
                  className="resize-none"
                  disabled={!hasPro}
                />
              </div>
            ))}
          </div>

          {/* Tone Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Preferred Tone
            </label>
            <Select
              value={selectedTone}
              onValueChange={setSelectedTone}
              disabled={!hasPro}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map(t => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          {savedVoice && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">
                  Brand Voice Active
                </span>
              </div>
              <p className="text-sm text-green-700">
                Last updated: {new Date(savedVoice.updated_at).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Brand voice saved successfully!
            </div>
          )}

          {/* Save Button */}
          <Button
            onClick={saveBrandVoice}
            disabled={isSaving || !hasPro}
            className="w-full"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Save Brand Voice
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
