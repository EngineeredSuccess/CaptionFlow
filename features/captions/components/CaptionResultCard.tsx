import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, RefreshCw, Zap, Info, CalendarClock, Sparkles, X } from 'lucide-react';

interface CaptionResult {
  id: string;
  content: string;
  hashtags: string[];
  platform: string;
  tone: string;
}

interface AnalysisResult {
  score: number;
  breakdown: { hook: number; flow: number; cta: number; };
  feedback: string[];
  suggestion: string;
}

interface CaptionResultCardProps {
  initialResult: CaptionResult;
  userTier: string;
  tone: string;
  onRefreshAll?: () => void;
  isLoadingRefetch?: boolean;
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: '📸 Instagram',
  tiktok: '🎵 TikTok',
  linkedin: '💼 LinkedIn',
  twitter: '🐦 Twitter/X',
};

export function CaptionResultCard({ initialResult, userTier, tone, onRefreshAll, isLoadingRefetch }: CaptionResultCardProps) {
  const [result, setResult] = useState<CaptionResult>(initialResult);
  
  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  // Hooks state
  const [isGeneratingHooks, setIsGeneratingHooks] = useState(false);
  const [hooks, setHooks] = useState<string[]>([]);
  const [showHooks, setShowHooks] = useState(false);

  // Boost state
  const [isBoosting, setIsBoosting] = useState(false);

  // Scheduling state
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-analyze on mount
  useState(() => {
    analyzeCaption(result.content);
  });

  async function analyzeCaption(caption: string) {
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const response = await fetch('/api/analyze-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption, platform: [result.platform] }),
      });
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }

  const fetchHooks = async () => {
    setIsGeneratingHooks(true);
    setShowHooks(true);
    try {
      const response = await fetch('/api/generate-hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: result.content,
          platform: result.platform || 'instagram'
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
    if (!analysis) return;
    setIsBoosting(true);
    try {
      const response = await fetch('/api/boost-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: result.content,
          platform: [result.platform],
          tone,
          feedback: analysis.feedback,
          suggestion: analysis.suggestion,
          score: analysis.score,
        }),
      });
      const data = await response.json();
      if (data.boostedCaption) {
        setResult({ ...result, content: data.boostedCaption });
        analyzeCaption(data.boostedCaption);
      }
    } catch (err) {
      console.error('Boost error:', err);
    } finally {
      setIsBoosting(false);
    }
  };

  const replaceHook = (newHook: string) => {
    let updatedContent = '';
    if (result.content.includes('\n')) {
      const lines = result.content.split('\n');
      lines[0] = newHook;
      updatedContent = lines.join('\n');
    } else {
      const firstSentenceMatch = result.content.match(/^.*?[.!?](\s|$)/);
      if (firstSentenceMatch) {
        updatedContent = result.content.replace(firstSentenceMatch[0], `${newHook} `);
      } else {
        updatedContent = `${newHook} ${result.content}`;
      }
    }
    setResult({ ...result, content: updatedContent });
    analyzeCaption(updatedContent);
  };

  const copyToClipboard = () => {
    const text = `${result.content}\n\n${result.hashtags.map(h => `#${h}`).join(' ')}`;
    navigator.clipboard.writeText(text);
  };

  const handleScheduleSubmit = async () => {
    if (!scheduleDate || !scheduleTime) return;
    setIsScheduling(true);
    setError(null);
    try {
      const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
      const res = await fetch('/api/schedule-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          captionId: result.id,
          scheduledAt,
          publishPlatforms: [result.platform],
          mediaUrl: mediaUrl.trim() || undefined
        }),
      });
      const data = await res.json();
      if (data.success) {
        setScheduleSuccess(true);
        setTimeout(() => {
          setShowScheduler(false);
          setScheduleSuccess(false);
          setScheduleDate('');
          setScheduleTime('');
          setMediaUrl('');
        }, 4000);
      } else {
        setError(data.error || 'Scheduling failed');
      }
    } catch {
      setError('Failed to schedule post');
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="space-y-4 mb-10">
      <Card className="rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden min-h-[400px]">
        <CardHeader className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 p-8 flex flex-row items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            {PLATFORM_LABELS[result.platform.toLowerCase()] || result.platform} Caption
          </CardTitle>
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
                  <circle cx="24" cy="24" r="18" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-zinc-100 dark:text-zinc-800" />
                  <circle
                    cx="24" cy="24" r="18" fill="transparent" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
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
                      <Sparkles className="w-3 h-3" /> Power Tip
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

            {/* Iterative Process Disclosure */}
            {analysis && analysis.score < 80 && userTier === 'free' && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/50 dark:border-amber-800/30 animate-in fade-in duration-500">
                <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-300">
                  <p className="font-bold mb-1">Why refine?</p>
                  <p className="leading-relaxed text-amber-700 dark:text-amber-400">
                    Great captions are built iteratively. Use <strong>Refine Hooks</strong> and <strong>AI Boost</strong> to fine-tune your post.
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
                <Copy className="mr-2 h-5 w-5" /> Copy
              </Button>
              <Button variant="outline" onClick={fetchHooks} disabled={isGeneratingHooks} className="h-14 px-8 rounded-xl border-zinc-200 dark:border-zinc-800 font-bold bg-white dark:bg-zinc-950 hover:bg-zinc-50">
                {isGeneratingHooks ? <Loader2 className="mr-2 w-5 h-5 animate-spin" /> : <RefreshCw className="mr-2 w-5 h-5" />} Refine Hooks
              </Button>
              <Button variant="outline" onClick={() => { setShowScheduler(!showScheduler); setScheduleSuccess(false); }} className={`h-14 px-8 rounded-xl font-bold transition-all ${showScheduler ? 'border-primary bg-primary/5 text-primary' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}>
                <CalendarClock className="mr-2 h-5 w-5" /> Schedule
              </Button>
              {onRefreshAll && (
                  <Button variant="ghost" onClick={onRefreshAll} disabled={isLoadingRefetch} className="h-14 px-8 rounded-xl font-bold text-zinc-400 hover:text-primary hover:bg-primary/5">
                    <RefreshCw className={`mr-2 h-5 w-5 ${isLoadingRefetch ? 'animate-spin' : ''}`} /> Regenerate All
                  </Button>
              )}
            </div>

            {/* Schedule Panel */}
            {showScheduler && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-300 p-5 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-2xl border border-primary/20 space-y-4">
                <p className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <CalendarClock className="w-4 h-4" /> Schedule on {PLATFORM_LABELS[result.platform.toLowerCase()] || result.platform}
                </p>
                {error && <div className="text-sm font-bold text-red-500 p-2 bg-red-50 rounded-lg">{error}</div>}
                {scheduleSuccess ? (
                  <div className="flex items-center gap-3 text-sm text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-xl">
                    <span className="text-lg">✅</span> Post scheduled!
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-end gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-400 uppercase">Date</label>
                        <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-400 uppercase">Time</label>
                        <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} step="300" className="h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400 uppercase flex justify-between">
                        <span>Media URL (Public direct link)</span>
                        {(result.platform.toLowerCase() === 'tiktok' || result.platform.toLowerCase() === 'instagram') && (
                          <span className="text-[10px] text-amber-500 font-bold">Required for {result.platform}</span>
                        )}
                      </label>
                      <input 
                        type="url" 
                        value={mediaUrl} 
                        onChange={(e) => setMediaUrl(e.target.value)} 
                        placeholder="https://example.com/video.mp4"
                        className="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" 
                      />
                      <p className="text-[10px] text-zinc-500 italic">TikTok & Instagram require a public direct link to your video/image file.</p>
                    </div>

                    <Button onClick={handleScheduleSubmit} disabled={isScheduling || !scheduleDate || !scheduleTime || ((result.platform.toLowerCase() === 'tiktok' || result.platform.toLowerCase() === 'instagram') && !mediaUrl)} className="w-full h-12 px-6 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:opacity-90">
                      {isScheduling ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <CalendarClock className="mr-2 w-4 h-4" />} Confirm
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hook Selector */}
      {showHooks && (
        <Card className="rounded-3xl border-primary/20 bg-primary/5 shadow-2xl animate-in slide-in-from-right-4 duration-500">
          <CardHeader className="p-8 border-b border-primary/10 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-primary flex items-center gap-2"><Sparkles className="w-5 h-5" /> Viral Hook Refiner</CardTitle>
              <CardDescription>Click any hook to instantly swap the first line of your caption.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowHooks(false)} className="rounded-full"><X className="w-5 h-5" /></Button>
          </CardHeader>
          <CardContent className="p-8 grid gap-4">
            {isGeneratingHooks ? (
              <div className="py-12 flex flex-col items-center gap-4"><Loader2 className="w-8 h-8 animate-spin text-primary" /><p className="text-sm font-medium text-primary/60">Crafting high-impact hooks...</p></div>
            ) : (
              hooks.map((h, i) => (
                <button key={i} onClick={() => replaceHook(h)} className="w-full text-left p-5 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-primary hover:shadow-lg transition-all group relative">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><Badge className="bg-primary text-white border-none text-[10px]">Swap</Badge></div>
                  <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">"{h}"</p>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
