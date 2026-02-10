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
import { Loader2, Copy, RefreshCw, Sparkles } from 'lucide-react';

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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Caption Generator</h1>
        <p className="text-gray-600">Create engaging social media captions with AI</p>
        {remainingToday !== null && (
          <p className="text-sm text-gray-500 mt-2">
            Free tier: {remainingToday} captions remaining today
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Create Your Caption
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Description Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Describe your image or video
              </label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="A sunset photo of coffee..."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Tone Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Tone</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      <div>
                        <div>{t.label}</div>
                        <div className="text-xs text-gray-500">{t.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Platforms</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => togglePlatform(p.value)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedPlatforms.includes(p.value)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateCaption}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Caption
                </>
              )}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Caption</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">
                    {result.content}
                  </p>
                </div>

                {/* Hashtags */}
                <div>
                  <label className="block text-sm font-medium mb-2">Hashtags</label>
                  <div className="flex flex-wrap gap-2">
                    {result.hashtags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={copyToClipboard} className="flex-1">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    onClick={generateCaption}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Your generated caption will appear here</p>
                <p className="text-sm mt-2">Fill in the details and click Generate</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
