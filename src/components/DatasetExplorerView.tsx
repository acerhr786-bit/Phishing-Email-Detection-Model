import React, { useState } from 'react';
import { EmailData } from '../types/ml';
import { GLOBAL_MODEL } from '../ml/tfidfModel';
import { RAW_EMAIL_DATASET } from '../data/emailDataset';
import { Search, Download, ShieldAlert, ShieldCheck, Filter } from 'lucide-react';

export const DatasetExplorerView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [labelFilter, setLabelFilter] = useState<'all' | 'phishing' | 'safe'>('all');
  const [splitFilter, setSplitFilter] = useState<'all' | 'train' | 'test'>('all');
  const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(RAW_EMAIL_DATASET[0]);

  const { split } = GLOBAL_MODEL;

  const trainSet = new Set(split.train.map(e => e.id));
  const testSet = new Set(split.test.map(e => e.id));

  const filteredEmails = RAW_EMAIL_DATASET.filter(email => {
    // Label filter
    if (labelFilter !== 'all' && email.label !== labelFilter) return false;

    // Split filter
    if (splitFilter === 'train' && !trainSet.has(email.id)) return false;
    if (splitFilter === 'test' && !testSet.has(email.id)) return false;

    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        email.subject.toLowerCase().includes(q) ||
        email.body.toLowerCase().includes(q) ||
        email.sender.toLowerCase().includes(q) ||
        email.category.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const exportCsv = () => {
    const headers = 'id,sender,subject,body,label,category\n';
    const rows = RAW_EMAIL_DATASET.map(e => {
      const cleanBody = `"${e.body.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      const cleanSubject = `"${e.subject.replace(/"/g, '""')}"`;
      return `${e.id},${e.sender},${cleanSubject},${cleanBody},${e.label},"${e.category}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'phishing_detection_dataset.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Dataset Corpus Explorer</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Total records: {RAW_EMAIL_DATASET.length} emails (15 Phishing · 15 Safe · 80% Train / 20% Test)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search subject or content..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-52"
            />
          </div>

          {/* Export CSV button */}
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Segmented Controls */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <span className="text-slate-400 px-2 font-medium">Split:</span>
          {(['all', 'train', 'test'] as const).map(splitKey => (
            <button
              key={splitKey}
              onClick={() => setSplitFilter(splitKey)}
              className={`px-2.5 py-1 rounded capitalize transition-colors ${
                splitFilter === splitKey
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {splitKey}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <span className="text-slate-400 px-2 font-medium">Class:</span>
          {(['all', 'phishing', 'safe'] as const).map(labelKey => (
            <button
              key={labelKey}
              onClick={() => setLabelFilter(labelKey)}
              className={`px-2.5 py-1 rounded capitalize transition-colors ${
                labelFilter === labelKey
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {labelKey}
            </button>
          ))}
        </div>
      </div>

      {/* Split View: Master Email List (Left) & Detailed Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Email Master List */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[600px]">
          <div className="p-3 border-b border-slate-800 bg-slate-950/60 text-xs text-slate-400 flex justify-between">
            <span>Filtered ({filteredEmails.length} records)</span>
            <span>Click to inspect</span>
          </div>

          <div className="overflow-y-auto divide-y divide-slate-800/60 flex-1">
            {filteredEmails.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No emails match the selected filters.
              </div>
            ) : (
              filteredEmails.map(item => {
                const isTrain = trainSet.has(item.id);
                const isSelected = selectedEmail?.id === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedEmail(item)}
                    className={`w-full text-left p-3.5 transition-colors block ${
                      isSelected
                        ? 'bg-slate-800/80 border-l-2 border-cyan-400'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-[10px] text-slate-500">{item.id}</span>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono">
                        <span className="text-slate-400">
                          {isTrain ? 'TRAIN' : 'TEST'}
                        </span>
                        <span>·</span>
                        <span
                          className={
                            item.label === 'phishing'
                              ? 'text-rose-400 font-semibold'
                              : 'text-emerald-400 font-semibold'
                          }
                        >
                          {item.label.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs font-medium text-slate-200 truncate mb-1">
                      {item.subject}
                    </div>

                    <div className="text-[11px] text-slate-400 truncate">
                      {item.sender}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Email Detail Inspector */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col h-[600px] overflow-y-auto">
          {selectedEmail ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-slate-500">{selectedEmail.id}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-xs text-slate-400">{selectedEmail.category}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-xs font-mono text-cyan-400">
                      Partition: {trainSet.has(selectedEmail.id) ? 'Training Set' : 'Test Set'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{selectedEmail.subject}</h3>
                </div>

                <div className="shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded border ${
                      selectedEmail.label === 'phishing'
                        ? 'bg-rose-950/40 text-rose-300 border-rose-800/50'
                        : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50'
                    }`}
                  >
                    {selectedEmail.label === 'phishing' ? (
                      <ShieldAlert className="w-3.5 h-3.5" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    )}
                    {selectedEmail.label.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Sender & Security Notes */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400">Sender / From: </span>
                  <span className="font-mono text-slate-200">{selectedEmail.sender}</span>
                </div>
                {selectedEmail.notes && (
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-slate-300">
                    <strong className="text-cyan-400">Security Analyst Annotations: </strong>
                    {selectedEmail.notes}
                  </div>
                )}
              </div>

              {/* Email Body */}
              <div className="space-y-1.5 flex-1">
                <span className="text-xs font-medium text-slate-400 block">Email Body Text</span>
                <pre className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-slate-200 text-xs font-mono leading-relaxed whitespace-pre-wrap select-text">
                  {selectedEmail.body}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-slate-500">
              Select an email from the left pane to inspect its metadata and body.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
