import React from 'react';
import { ShieldAlert, Download, Terminal } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onQuickSample: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onQuickSample }) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <button
            onClick={() => setActiveTab('scanner')}
            className="text-left font-bold text-slate-100 tracking-tight text-lg hover:text-cyan-400 transition-colors whitespace-nowrap"
          >
            PhishShield ML
          </button>
        </div>

        {/* Zone 2: 4-5 Navigation Links (single line) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`whitespace-nowrap transition-colors ${
              activeTab === 'scanner'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5'
                : 'hover:text-slate-200'
            }`}
          >
            Email Scanner
          </button>
          <button
            onClick={() => setActiveTab('evaluation')}
            className={`whitespace-nowrap transition-colors ${
              activeTab === 'evaluation'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5'
                : 'hover:text-slate-200'
            }`}
          >
            Model Evaluation
          </button>
          <button
            onClick={() => setActiveTab('dataset')}
            className={`whitespace-nowrap transition-colors ${
              activeTab === 'dataset'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5'
                : 'hover:text-slate-200'
            }`}
          >
            Dataset Explorer
          </button>
          <button
            onClick={() => setActiveTab('nlp')}
            className={`whitespace-nowrap transition-colors ${
              activeTab === 'nlp'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5'
                : 'hover:text-slate-200'
            }`}
          >
            Text Analysis & NLP
          </button>
          <button
            onClick={() => setActiveTab('python')}
            className={`whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'python'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5'
                : 'hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Python Project Hub</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onQuickSample}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors whitespace-nowrap shadow-sm hover:shadow"
          >
            Test Phishing Sample
          </button>
        </div>
      </div>
    </header>
  );
};
