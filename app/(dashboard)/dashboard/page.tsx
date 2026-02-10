'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, Trash2, Sparkles } from 'lucide-react';
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Saved Captions</h1>
        <p className="text-gray-600">
          View and manage all your generated captions
        </p>
      </div>

      {captions.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold mb-2">No captions yet</h3>
            <p className="text-gray-600 mb-6">
              Start generating captions and they will appear here
            </p>
            <Button asChild>
              <a href="/caption-generator">Generate Your First Caption</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {captions.map(caption => (
            <Card key={caption.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    {/* Caption Content */}
                    <p className="text-lg leading-relaxed whitespace-pre-wrap mb-4">
                      {caption.content}
                    </p>

                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {caption.hashtags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      <span>Platforms:</span>
                      {caption.platform.map(p => (
                        <Badge
                          key={p}
                          className={`${getPlatformBadge(p)} text-xs`}
                        >
                          {p}
                        </Badge>
                      ))}
                      <span className="mx-2">•</span>
                      <span>Tone: {caption.tone}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(caption.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(caption)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
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
