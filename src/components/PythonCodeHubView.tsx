import React, { useState } from 'react';
import { PYTHON_PROJECT_FILES, PythonFileItem } from '../data/pythonProjectFiles';
import { Terminal, Copy, Check, Download, FileCode, Folder, Play, Sparkles } from 'lucide-react';

export const PythonCodeHubView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<PythonFileItem>(PYTHON_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(1);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (file: PythonFileItem) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAllBundle = () => {
    // Generate concatenated bundle or text file for simple offline saving
    let combined = `# PHISHSHIELD ML - PYTHON PROJECT BUNDLE\n# Save files in their respective folders as indicated\n\n`;
    for (const f of PYTHON_PROJECT_FILES) {
      combined += `\n======================================================\n`;
      combined += `FILE: ${f.path}\n`;
      combined += `======================================================\n\n`;
      combined += f.content;
      combined += `\n\n`;
    }
    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'phishshield_python_project_bundle.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const terminalSteps = [
    {
      step: 1,
      title: 'Initialize Virtual Environment',
      command: 'python3 -m venv venv && source venv/bin/activate  # On Windows: venv\\Scripts\\activate',
      desc: 'Isolates project dependencies to prevent conflicts with global Python packages.'
    },
    {
      step: 2,
      title: 'Install Required Packages',
      command: 'pip install -r requirements.txt',
      desc: 'Installs scikit-learn, pandas, numpy, flask, matplotlib, and joblib.'
    },
    {
      step: 3,
      title: 'Train Machine Learning Models',
      command: 'python train_model.py',
      desc: 'Fits TF-IDF vectorizer, trains Naive Bayes & Logistic Regression, calculates test metrics, and exports models.'
    },
    {
      step: 4,
      title: 'Launch Flask Web Application',
      command: 'python app.py',
      desc: 'Starts local web interface at http://127.0.0.1:5000 with real-time in-memory scanning.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-cyan-400">
            <Terminal className="w-5 h-5" />
            <h2 className="text-lg font-semibold text-slate-100">
              Python & Scikit-Learn Project Source Code Hub
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete standalone Python codebase for local execution, homework assignments, or SOC security lab testing.
          </p>
        </div>

        <button
          onClick={handleDownloadAllBundle}
          className="flex items-center gap-2 px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download All Code (.txt bundle)</span>
        </button>
      </div>

      {/* Terminal Step-by-Step Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Play className="w-4 h-4 text-cyan-400" />
            <span>Step-by-Step Local Execution Workflow</span>
          </h3>
          <span className="text-xs text-slate-400">Suitable for beginner students</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {terminalSteps.map(item => (
            <button
              key={item.step}
              type="button"
              onClick={() => setActiveStep(item.step)}
              className={`p-3 rounded-lg border text-left transition-all ${
                activeStep === item.step
                  ? 'bg-slate-800 border-cyan-500 ring-1 ring-cyan-500/50'
                  : 'bg-slate-950 border-slate-800 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono text-cyan-400 font-semibold">Step {item.step}</span>
                {activeStep === item.step && <span className="text-[10px] text-slate-400">Active</span>}
              </div>
              <div className="text-xs font-medium text-slate-200">{item.title}</div>
            </button>
          ))}
        </div>

        {/* Active Command Terminal Block */}
        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800/90 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">
              {terminalSteps[activeStep - 1].desc}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(terminalSteps[activeStep - 1].command);
              }}
              className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1 font-mono"
            >
              <Copy className="w-3 h-3" />
              <span>Copy Command</span>
            </button>
          </div>
          <div className="p-3 bg-slate-900 rounded border border-slate-800 text-xs font-mono text-cyan-300 select-all overflow-x-auto">
            $ {terminalSteps[activeStep - 1].command}
          </div>
        </div>
      </div>

      {/* Code Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File Tree (Left) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[560px]">
          <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Folder className="w-4 h-4 text-cyan-400" />
            <span>Project File Directory</span>
          </div>

          <div className="p-2 space-y-1 overflow-y-auto flex-1">
            <div className="text-[11px] font-mono text-slate-500 px-2 py-1">python_project/</div>
            {PYTHON_PROJECT_FILES.map(file => {
              const isSelected = selectedFile.filename === file.filename;
              return (
                <button
                  key={file.filename}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                    isSelected
                      ? 'bg-slate-800 text-cyan-400 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate font-mono">
                    <FileCode className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{file.filename}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase">{file.language}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Viewer (Right) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[560px]">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-4">
            <div className="truncate">
              <span className="font-mono text-xs font-semibold text-slate-200">
                {selectedFile.path}
              </span>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {selectedFile.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>

              <button
                onClick={() => handleDownloadFile(selectedFile)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors"
                title="Download this file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Code Body */}
          <div className="p-4 bg-slate-950 flex-1 overflow-auto text-xs font-mono text-slate-200 leading-relaxed">
            <pre className="select-text whitespace-pre-wrap">
              {selectedFile.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
