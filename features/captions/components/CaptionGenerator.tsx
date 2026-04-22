'use client';

import { useState, useRef, useCallback } from 'react';
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
import { Loader2, Sparkles, Clock, ImagePlus, X, Type, Camera, RefreshCw } from 'lucide-react';
import { CaptionResultCard } from './CaptionResultCard';

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

type InputMode = 'text' | 'vision';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

interface CaptionResult {
  id: string;
  content: string;
  hashtags: string[];
  platform: string;
  tone: string;
}

export function CaptionGenerator() {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [description, setDescription] = useState('');
  const [tone, setTone] = useState('casual');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CaptionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [remainingToday, setRemainingToday] = useState<number | null>(null);
  const [userTier, setUserTier] = useState<string>('free');

  // Vision state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const processFile = useCallback((file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Image too large. Maximum size is 4MB.');
      return;
    }

    setError(null);
    setImageMimeType(file.type);

    // Create preview
    const previewReader = new FileReader();
    previewReader.onload = (e) => setImagePreview(e.target?.result as string);
    previewReader.readAsDataURL(file);

    // Create base64 (without the data:... prefix)
    const base64Reader = new FileReader();
    base64Reader.onload = (e) => {
      const result = e.target?.result as string;
      // Remove the "data:image/...;base64," prefix
      const base64 = result.split(',')[1];
      setImageBase64(base64);
    };
    base64Reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const clearImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    setImageMimeType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const generateCaption = async () => {
    if (inputMode === 'text' && description.length < 5) {
      setError('Please provide a description (at least 5 characters)');
      return;
    }

    if (inputMode === 'vision' && !imageBase64) {
      setError('Please upload an image first');
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
      const endpoint = inputMode === 'vision'
        ? '/api/generate-caption-vision'
        : '/api/generate-caption';

      const payload = inputMode === 'vision'
        ? {
          imageBase64,
          mimeType: imageMimeType,
          tone,
          platform: selectedPlatforms,
          numHashtags: 10,
        }
        : {
          description,
          tone,
          platform: selectedPlatforms,
          numHashtags: 10,
        };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate captions');
      }

      if (data.captions && Array.isArray(data.captions)) {
        setResults(data.captions);
      } else if (data.caption) {
        setResults([data.caption]); // fallback
      }
      
      setRemainingToday(data.remainingToday);
      if (data.tier) setUserTier(data.tier);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
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
        <Card className="lg:col-span-12 xl:col-span-5 rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden self-start">
          <CardHeader className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 p-8">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              Define Your Post
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Mode Switcher */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Input Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setInputMode('text')}
                  className={`h-14 px-4 rounded-xl border font-bold text-sm flex items-center gap-3 transition-all duration-200 ${inputMode === 'text'
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]'
                    : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-primary/50'
                    }`}
                >
                  <Type className="w-5 h-5" />
                  Describe
                </button>
                <button
                  onClick={() => setInputMode('vision')}
                  className={`h-14 px-4 rounded-xl border font-bold text-sm flex items-center gap-3 transition-all duration-200 ${inputMode === 'vision'
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]'
                    : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-primary/50'
                    }`}
                >
                  <Camera className="w-5 h-5" />
                  Upload Image
                </button>
              </div>
            </div>

            {/* Conditional Input: Text or Image */}
            {inputMode === 'text' ? (
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
            ) : (
              <div className="space-y-3">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                  Your Image
                </label>
                {imagePreview ? (
                  <div className="relative group rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                    <img
                      src={imagePreview}
                      alt="Upload preview"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={clearImage}
                        className="w-12 h-12 rounded-full bg-white/90 text-red-500 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <Badge className="bg-white/90 text-zinc-700 border-none shadow-sm font-bold">
                        ✓ Ready
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`min-h-[160px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 ${isDragging
                      ? 'border-primary bg-primary/5 scale-[1.02]'
                      : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 hover:border-primary/50 hover:bg-primary/5'
                      }`}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? 'bg-primary/20' : 'bg-zinc-100 dark:bg-zinc-800'
                      }`}>
                      <ImagePlus className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-zinc-400'}`} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-zinc-600 dark:text-zinc-300">
                        {isDragging ? 'Drop it here!' : 'Drag & drop your image'}
                      </p>
                      <p className="text-sm text-zinc-400 mt-1">
                        or click to browse — JPEG, PNG, WebP (max 4MB)
                      </p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}

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
                  {inputMode === 'vision' ? 'Analyzing Image...' : 'Generating Magic...'}
                </>
              ) : (
                <>
                  {inputMode === 'vision' ? <Camera className="mr-2 h-6 w-6" /> : <Sparkles className="mr-2 h-6 w-6" />}
                  {inputMode === 'vision' ? 'Generate from Image' : 'Generate Caption'}
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
        <div className="lg:col-span-12 xl:col-span-7 space-y-8 self-start">
          {results && results.length > 0 ? (
            results.map((res: CaptionResult) => (
              <CaptionResultCard
                key={res.id}
                initialResult={res}
                userTier={userTier}
                tone={tone}
                onRefreshAll={generateCaption}
                isLoadingRefetch={isLoading}
              />
            ))
          ) : (
            <Card className="rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden min-h-[400px]">
              <CardContent className="p-8">
                <div className="text-center py-32 space-y-4">
                  <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-100 dark:border-zinc-800">
                    {isLoading ? <Loader2 className="w-10 h-10 text-primary animate-spin" /> : <Sparkles className="w-10 h-10 text-zinc-300 animate-pulse" />}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-zinc-400">{isLoading ? 'Writing your specific posts...' : 'Ready to Create?'}</p>
                    {!isLoading && (
                      <p className="text-zinc-500 leading-relaxed max-w-sm mx-auto">
                        {inputMode === 'vision'
                          ? 'Upload an image to generate captions tailored to each platform based on its visual content.'
                          : 'Fill in the details on the left, select your networks, and hit generate.'}
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
