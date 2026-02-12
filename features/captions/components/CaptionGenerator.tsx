'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, RefreshCw, Sparkles, Clock, ImagePlus, X, Type, Camera, Zap, Info } from 'lucide-react';

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
  platform: string[];
  tone: string;
}

interface AnalysisResult {
  score: number;
  breakdown: {
    hook: number;
    flow: number;
    cta: number;
  };
  feedback: string[];
  suggestion: string;
}

export function CaptionGenerator() {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [description, setDescription] = useState('');
  const [tone, setTone] = useState('casual');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CaptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remainingToday, setRemainingToday] = useState<number | null>(null);
  const [userTier, setUserTier] = useState<string>('free');

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  // Hooks state
  const [isGeneratingHooks, setIsGeneratingHooks] = useState(false);
  const [hooks, setHooks] = useState<string[]>([]);
  const [showHooks, setShowHooks] = useState(false);

  // Boost state
  const [isBoosting, setIsBoosting] = useState(false);

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

  const analyzeCaption = async (caption: string) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const response = await fetch('/api/analyze-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption, platform: selectedPlatforms }),
      });
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchHooks = async () => {
    if (!result) return;
    setIsGeneratingHooks(true);
    setShowHooks(true);
    try {
      const response = await fetch('/api/generate-hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: result.content,
          platform: selectedPlatforms[0] || 'instagram'
        }),
      });
      const data = await response.json();
      setHooks(data.hooks);
    } catch (err) {
      console.error('Hook error:', err);
    } finally {
      setIsGeneratingHooks(false);
    }
  };

  const boostCaption = async () => {
    if (!result || !analysis) return;
    setIsBoosting(true);
    try {
      const response = await fetch('/api/boost-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: result.content,
          platform: selectedPlatforms,
          tone,
          feedback: analysis.feedback,
          suggestion: analysis.suggestion,
          score: analysis.score,
        }),
      });
      const data = await response.json();
      if (data.boostedCaption) {
        setResult({ ...result, content: data.boostedCaption });
        // Re-analyze the boosted caption
        analyzeCaption(data.boostedCaption);
      }
    } catch (err) {
      console.error('Boost error:', err);
    } finally {
      setIsBoosting(false);
    }
  };

  const replaceHook = (newHook: string) => {
    if (!result) return;

    // Split by common sentence terminators to identify the first sentence
    let updatedContent = '';

    // Check if there are line breaks
    if (result.content.includes('\n')) {
      const lines = result.content.split('\n');
      lines[0] = newHook;
      updatedContent = lines.join('\n');
    } else {
      // If it's a single block, look for the first sentence end
      const firstSentenceMatch = result.content.match(/^.*?[.!?](\s|$)/);
      if (firstSentenceMatch) {
        updatedContent = result.content.replace(firstSentenceMatch[0], `${newHook} `);
      } else {
        // Fallback: just prepend if no clear sentence structure
        updatedContent = `${newHook} ${result.content}`;
      }
    }

    setResult({ ...result, content: updatedContent });

    // Re-analyze the updated caption
    analyzeCaption(updatedContent);
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
    setResult(null);
    setAnalysis(null);
    setHooks([]);
    setShowHooks(false);

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
        throw new Error(data.error || 'Failed to generate caption');
      }

      setResult(data.caption);
      setRemainingToday(data.remainingToday);
      if (data.tier) setUserTier(data.tier);

      // Automatic analysis
      analyzeCaption(data.caption.content);
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
          <Card className="rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden min-h-[400px]">
            <CardHeader className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 p-8 flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Generated Caption</CardTitle>
              {analysis && (
                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-2">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Viral Score</p>
                    <p className={`text-2xl font-black ${analysis.score >= 80 ? 'text-green-500' : analysis.score >= 60 ? 'text-orange-500' : 'text-red-500'}`}>
                      {analysis.score}<span className="text-sm font-bold text-zinc-400">/100</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center relative">
                    <svg className="w-full h-full -rotate-90">
                      {/* Background Circle */}
                      <circle
                        cx="24"
                        cy="24"
                        r="18"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-zinc-100 dark:text-zinc-800"
                      />
                      {/* Progress Circle */}
                      <circle
                        cx="24"
                        cy="24"
                        r="18"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 18}
                        strokeDashoffset={2 * Math.PI * 18 * (1 - analysis.score / 100)}
                        className={`transition-all duration-1000 ease-out ${analysis.score >= 80 ? 'text-green-500' : analysis.score >= 60 ? 'text-orange-500' : 'text-red-500'}`}
                      />
                    </svg>
                  </div>
                </div>
              )}
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

                  {/* Analysis Breakdown */}
                  {analysis && (
                    <div className="grid grid-cols-3 gap-4 p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <div className="text-center space-y-1">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Hook</p>
                        <p className="text-lg font-bold">{analysis.breakdown.hook}%</p>
                      </div>
                      <div className="text-center space-y-1 border-x border-zinc-200 dark:border-zinc-800">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Flow</p>
                        <p className="text-lg font-bold">{analysis.breakdown.flow}%</p>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">CTA</p>
                        <p className="text-lg font-bold">{analysis.breakdown.cta}%</p>
                      </div>
                    </div>
                  )}

                  {/* Suggestions/Feedback + Boost */}
                  {analysis && analysis.feedback.length > 0 && (
                    <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            Power Tip
                          </p>
                          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 italic">
                            "{analysis.suggestion}"
                          </p>
                        </div>
                        {analysis.score < 80 && (
                          <Button
                            onClick={boostCaption}
                            disabled={isBoosting}
                            className="h-12 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:scale-105 active:scale-95 shrink-0"
                          >
                            {isBoosting ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <Zap className="mr-2 w-4 h-4" />}
                            {isBoosting ? 'Boosting...' : 'AI Boost'}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Iterative Process Disclosure (free users only) */}
                  {analysis && analysis.score < 80 && userTier === 'free' && (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/50 dark:border-amber-800/30 animate-in fade-in duration-500">
                      <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-800 dark:text-amber-300">
                        <p className="font-bold mb-1">Why refine?</p>
                        <p className="leading-relaxed text-amber-700 dark:text-amber-400">
                          Great captions are built iteratively — just like real copywriters do. Use <strong>Refine Hooks</strong> and <strong>AI Boost</strong> to fine-tune your post.
                          Upgrade to <strong>Pro</strong> for viral-optimized captions from the first draft. ⚡
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Hashtags */}
                  <div className="space-y-2">
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
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <Button variant="outline" onClick={copyToClipboard} className="h-14 px-8 rounded-xl border-zinc-200 dark:border-zinc-800 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900">
                      <Copy className="mr-2 h-5 w-5" />
                      Copy All
                    </Button>
                    <Button
                      variant="outline"
                      onClick={fetchHooks}
                      disabled={isGeneratingHooks}
                      className="h-14 px-8 rounded-xl border-zinc-200 dark:border-zinc-800 font-bold bg-white dark:bg-zinc-950 hover:bg-zinc-50"
                    >
                      {isGeneratingHooks ? <Loader2 className="mr-2 w-5 h-5 animate-spin" /> : <RefreshCw className="mr-2 w-5 h-5" />}
                      Refine Hooks
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={generateCaption}
                      disabled={isLoading}
                      className="h-14 px-8 rounded-xl font-bold text-zinc-400 hover:text-primary hover:bg-primary/5"
                    >
                      <RefreshCw className={`mr-2 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                      Regenerate All
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-32 space-y-4">
                  <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-100 dark:border-zinc-800">
                    {isLoading ? <Loader2 className="w-10 h-10 text-primary animate-spin" /> : <Sparkles className="w-10 h-10 text-zinc-300 animate-pulse" />}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-zinc-400">{isLoading ? 'Writing your post...' : 'Ready to Create?'}</p>
                    {!isLoading && (
                      <p className="text-zinc-500 leading-relaxed max-w-sm mx-auto">
                        {inputMode === 'vision'
                          ? 'Upload an image to generate a caption based on its visual content.'
                          : 'Fill in the details on the left to generate your first high-performing caption.'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hook Selector (Side Drawer Style) */}
          {showHooks && (
            <Card className="rounded-3xl border-primary/20 bg-primary/5 shadow-2xl animate-in slide-in-from-right-4 duration-500">
              <CardHeader className="p-8 border-b border-primary/10 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Viral Hook Refiner
                  </CardTitle>
                  <CardDescription>Click any hook to instantly swap the first line of your caption.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowHooks(false)} className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent className="p-8 grid gap-4">
                {isGeneratingHooks ? (
                  <div className="py-12 flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-primary/60">Crafting high-impact hooks...</p>
                  </div>
                ) : (
                  hooks.map((hook, i) => (
                    <button
                      key={i}
                      onClick={() => replaceHook(hook)}
                      className="w-full text-left p-5 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-primary hover:shadow-lg transition-all group relative"
                    >
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge className="bg-primary text-white border-none text-[10px]">Swap</Badge>
                      </div>
                      <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">"{hook}"</p>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
