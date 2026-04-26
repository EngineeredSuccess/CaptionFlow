'use client';

import { useState } from 'react';
import { CaptionGenerator } from '@/features/captions/components/CaptionGenerator';
import { CaptionRemixer } from '@/features/captions/components/CaptionRemixer';
import { Sparkles, Repeat2 } from 'lucide-react';

type Tab = 'generate' | 'remix';

export default function CaptionGeneratorPage() {
  const [activeTab, setActiveTab] = useState<Tab>('generate');

  return (
    <div>
      {/* Tab Bar */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('generate')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all duration-200 ${
                activeTab === 'generate'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Generate
            </button>
            <button
              onClick={() => setActiveTab('remix')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all duration-200 ${
                activeTab === 'remix'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              <Repeat2 className="w-4 h-4" />
              Remix
              <span className="text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Pro
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'generate' ? <CaptionGenerator /> : <CaptionRemixer />}
    </div>
  );
}
