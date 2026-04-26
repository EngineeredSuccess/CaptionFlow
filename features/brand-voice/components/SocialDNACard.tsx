'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dna, Instagram, Linkedin, Twitter, MessageSquare, Quote, Hash } from 'lucide-react';

interface DNAData {
  tone: string;
  emojiPattern: string;
  hookStyle: string;
  vocabularyLevel: string;
  averageLength: string;
  source_captions?: string[];
}

interface SocialDNACardProps {
  platform: string;
  handle: string;
  dna: DNAData;
}

export function SocialDNACard({ platform, handle, dna }: SocialDNACardProps) {
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
          <Badge variant="outline" className="rounded-full px-4 py-1 border-primary/20 bg-primary/5 text-primary font-bold">
            Synchronized
          </Badge>
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
