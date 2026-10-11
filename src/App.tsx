import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ScannerView } from './components/ScannerView';
import { ModelEvaluationView } from './components/ModelEvaluationView';
import { DatasetExplorerView } from './components/DatasetExplorerView';
import { TextAnalysisView } from './components/TextAnalysisView';
import { PythonCodeHubView } from './components/PythonCodeHubView';
import { ShieldAlert, AlertTriangle, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'evaluation' | 'dataset' | 'nlp' | 'python'>('scanner');
  const [showDisclaimerBanner, setShowDisclaimerBanner] = useState(true);

  const handleQuickSample = () => {
    setActiveTab('scanner');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar following Top Bar Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(t) => setActiveTab(t as any)}
        onQuickSample={handleQuickSample}
      />

      {/* Mandatory Cybersecurity Safety Banner */}
      {showDisclaimerBanner && (
        <div className="bg-amber-950/40 border-b border-amber-900/50 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-amber-200/90 gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>CRITICAL SECURITY NOTICE:</strong> A <em>"Safe"</em> classification does <strong>NOT guarantee</strong> that an email is harmless. Zero-day spear phishing, vendor account compromise, and polymorphic social engineering can evade statistical models.
              </span>
            </div>
            <button
              onClick={() => setShowDisclaimerBanner(false)}
              className="text-amber-400 hover:text-amber-200 text-xs shrink-0 font-medium px-2 py-0.5 rounded"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'scanner' && (
          <ScannerView
            onGoToEvaluation={() => setActiveTab('evaluation')}
            onGoToPythonHub={() => setActiveTab('python')}
          />
        )}

        {activeTab === 'evaluation' && <ModelEvaluationView />}

        {activeTab === 'dataset' && <DatasetExplorerView />}

        {activeTab === 'nlp' && <TextAnalysisView />}

        {activeTab === 'python' && <PythonCodeHubView />}
      </main>

      {/* Quiet, Professional Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">PhishShield ML</span>
            <span>·</span>
            <span>Machine Learning Security Model & Academic Mini-Project</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>In-Memory Evaluation</span>
            <span>·</span>
            <span>Zero-Retention Policy</span>
            <span>·</span>
            <span>Scikit-Learn & Python Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
