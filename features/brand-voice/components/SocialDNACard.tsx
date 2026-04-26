'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dna, Instagram, Linkedin, Twitter, MessageSquare, Quote, Loader2, Sparkles } from 'lucide-react';

interface DNAData {
  tone: string;
  emojiPattern: string;
  hookStyle: string;
  vocabularyLevel: string;
  averageLength: string;
  source_captions?: string[];
}

interface SocialDNACardProps {
  connectionId: string;
  platform: string;
  handle: string;
  dna: DNAData;
  onRefresh?: () => void;
}

export function SocialDNACard({ connectionId, platform, handle, dna, onRefresh }: SocialDNACardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [captionsInput, setCaptionsInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const hasDna = dna && dna.tone && dna.tone.length > 0;

  const handleManualSync = async () => {
    const rawCaptions = captionsInput.split('\n\n').map(c => c.trim()).filter(c => c.length > 10);
    if (rawCaptions.length === 0) return;

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/social-connections/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId,
          captions: rawCaptions.slice(0, 5) // max 5
        })
      });

      if (res.ok) {
        setIsOpen(false);
        setCaptionsInput('');
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Failed to analyze DNA manually:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };
  const getIcon = () => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-5 h-5 text-pink-500" />;
      case 'linkedin': return <Linkedin className="w-5 h-5 text-blue-600" />;
      case 'twitter': return <Twitter className="w-5 h-5 text-zinc-900" />;
      default: return <MessageSquare className="w-5 h-5 text-zinc-400" />;
    }
  };

  return (
    <Card className="rounded-[2.5rem] border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden bg-white dark:bg-zinc-950">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
              {getIcon()}
            </div>
            <div>
              <CardTitle className="text-xl capitalize">{platform} DNA</CardTitle>
              <p className="text-sm text-zinc-500 font-medium">{handle}</p>
            </div>
          </div>
          {hasDna ? (
            <Badge variant="outline" className="rounded-full px-4 py-1 border-primary/20 bg-primary/5 text-primary font-bold">
              Synchronized
            </Badge>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 font-bold">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Sync DNA
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Manual DNA Sync ({platform})</DialogTitle>
                  <DialogDescription>
                    Paste 1 to 5 of your recent, most successful {platform} posts, separated by an empty line.
                    We will extract your tone, vocabulary, and hook style.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Textarea
                    placeholder="Paste caption 1 here...&#10;&#10;Paste caption 2 here..."
                    className="min-h-[200px]"
                    value={captionsInput}
                    onChange={(e) => setCaptionsInput(e.target.value)}
                  />
                  <Button 
                    className="w-full font-bold" 
                    onClick={handleManualSync}
                    disabled={isAnalyzing || captionsInput.length < 10}
                  >
                    {isAnalyzing ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing DNA...</>
                    ) : (
                      'Analyze & Save DNA'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-8 pt-4 space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Tone Bias</p>
            <p className="font-bold text-zinc-900 dark:text-zinc-100">{dna.tone || 'Pending analysis...'}</p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Hook Style</p>
            <p className="font-bold text-zinc-900 dark:text-zinc-100">{dna.hookStyle || 'Pending analysis...'}</p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Emoji usage</p>
            <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{dna.emojiPattern || 'Pending analysis...'}</p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Vocab Level</p>
            <p className="font-bold text-zinc-900 dark:text-zinc-100">{dna.vocabularyLevel || 'Pending analysis...'}</p>
          </div>
        </div>

        {dna.source_captions && dna.source_captions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-400 px-1">
              <Quote className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Source Samples Analyzed</span>
            </div>
            <Accordion type="single" collapsible className="w-full space-y-2 border-none">
              {dna.source_captions.slice(0, 3).map((caption, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border border-zinc-100 dark:border-zinc-800 rounded-2xl bg-zinc-50/30 px-4">
                  <AccordionTrigger className="hover:no-underline py-4 text-left font-medium text-sm text-zinc-600 dark:text-zinc-400 line-clamp-1">
                    Sample {i + 1}: {caption.substring(0, 50)}...
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm text-zinc-500 leading-relaxed italic">
                    "{caption}"
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
