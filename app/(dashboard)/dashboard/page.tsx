'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, Trash2, Sparkles, Clock } from 'lucide-react';
import { createClient } from '@/shared/lib/supabase/client';

interface Caption {
  id: string;
  content: string;
  hashtags: string[];
  platform: string[];
  tone: string;
  created_at: string;
}

export default function DashboardPage() {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const loadCaptions = async () => {
      try {
        const { data, error } = await supabase
          .from('captions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCaptions(data || []);
      } catch (err) {
        console.error('Error fetching captions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCaptions();
  }, [supabase]);

  const copyToClipboard = (caption: Caption) => {
    const text = `${caption.content}\n\n${caption.hashtags.map(h => `#${h}`).join(' ')}`;
    navigator.clipboard.writeText(text);
  };

  const deleteCaption = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/captions?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCaptions(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error('Error deleting caption:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const getPlatformBadge = (platform: string) => {
    const colors: Record<string, string> = {
      instagram: 'bg-pink-100 text-pink-800',
      tiktok: 'bg-black text-white',
      linkedin: 'bg-blue-100 text-blue-800',
      twitter: 'bg-sky-100 text-sky-800',
    };
    return colors[platform] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 lg:py-20">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold tracking-tight">
            <Sparkles className="w-4 h-4" />
            Library
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">Saved Captions</h1>
          <p className="text-lg text-zinc-500 leading-relaxed">
            Manage your personal library of high-performing AI captions.
          </p>
        </div>
        <Button asChild size="lg" className="rounded-2xl font-bold shadow-xl shadow-primary/20">
          <a href="/caption-generator">
            <Sparkles className="w-5 h-5 mr-2" />
            Generate New
          </a>
        </Button>
      </div>

      {captions.length === 0 ? (
        <Card className="text-center py-32 rounded-[2.5rem] border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shadow-none border-dashed border-2">
          <CardContent className="space-y-6">
            <div className="w-24 h-24 bg-white dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-black/5">
              <Sparkles className="w-12 h-12 text-zinc-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">No captions yet</h3>
              <p className="text-zinc-500 max-w-sm mx-auto">
                Your creative library is empty. Start generating captions and they will appear here automatically.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {captions.map(caption => (
            <Card key={caption.id} className="rounded-3xl border-zinc-200 dark:border-zinc-800 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden group">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Left Column: Content */}
                  <div className="flex-1 p-8 lg:p-10 space-y-6">
                    <p className="text-xl leading-relaxed text-zinc-900 dark:text-zinc-100 font-medium whitespace-pre-wrap">
                      {caption.content}
                    </p>

                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-2">
                      {caption.hashtags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-none font-bold text-xs uppercase tracking-wider">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Metadata Footer */}
                    <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Platforms:</span>
                        <div className="flex gap-1.5">
                          {caption.platform.map(p => (
                            <Badge
                              key={p}
                              className={`${getPlatformBadge(p)} text-[10px] font-bold uppercase tracking-tighter px-2 rounded-md`}
                            >
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Tone:</span>
                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 capitalize">{caption.tone}</span>
                      </div>

                      <div className="flex items-center gap-2 ml-auto">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-sm font-medium text-zinc-400 truncate">{new Date(caption.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions Sidebar */}
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 lg:w-48 flex lg:flex-col gap-3 border-t lg:border-t-0 lg:border-l border-zinc-100 dark:border-zinc-800">
                    <Button
                      variant="outline"
                      className="flex-1 lg:flex-none h-12 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-bold hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                      onClick={() => copyToClipboard(caption)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 lg:flex-none h-12 rounded-xl text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold transition-all"
                      onClick={() => deleteCaption(caption.id)}
                      disabled={deletingId === caption.id}
                    >
                      {deletingId === caption.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
