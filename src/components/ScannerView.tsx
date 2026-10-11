import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Upload,
  RotateCcw,
  Sliders,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { ModelType, ScanResult } from '../types/ml';
import { PRESET_EMAILS } from '../data/emailDataset';
import { scanEmailContent } from '../ml/tfidfModel';

interface ScannerViewProps {
  onGoToEvaluation: () => void;
  onGoToPythonHub: () => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({ onGoToEvaluation }) => {
  const [subject, setSubject] = useState(
    'URGENT: Microsoft 365 Password Expiry Warning - Action Required Within 24 Hours'
  );
  const [sender, setSender] = useState('security-alert@micros0ft-verify.com');
  const [body, setBody] = useState(
    `Dear User,

Your Microsoft Office 365 password expires in less than 24 hours. Failure to update your credentials immediately will result in permanent suspension of your mailbox and enterprise access.

Please click the secure portal below to keep your current password and avoid service termination:
http://login.micros0ft-verify.com/auth/update-session?id=98321

Do not ignore this critical security warning.

IT Infrastructure Team
Global Support Services`
  );
  const [modelType, setModelType] = useState<ModelType>('logistic_regression');
  const [threshold, setThreshold] = useState<number>(0.5);
  const [result, setResult] = useState<ScanResult | null>(() =>
    scanEmailContent(
      'URGENT: Microsoft 365 Password Expiry Warning - Action Required Within 24 Hours',
      `Dear User, Your Microsoft Office 365 password expires in less than 24 hours. Failure to update your credentials immediately will result in permanent suspension. Click http://login.micros0ft-verify.com/auth/update-session?id=98321`,
      'security-alert@micros0ft-verify.com',
      'logistic_regression',
      0.5
    )
  );

  const handleScan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!subject.trim() && !body.trim()) return;
    const scanRes = scanEmailContent(subject, body, sender, modelType, threshold);
    setResult(scanRes);
  };

  const handleSelectPreset = (index: number) => {
    const item = PRESET_EMAILS[index];
    if (!item) return;
    setSubject(item.email.subject);
    setSender(item.email.sender);
    setBody(item.email.body);
    const scanRes = scanEmailContent(item.email.subject, item.email.body, item.email.sender, modelType, threshold);
    setResult(scanRes);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (!content) return;

      // Simple EML parsing or plain text
      const lines = content.split('\n');
      let extractedSubject = '';
      let extractedFrom = '';
      let bodyStartIndex = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.toLowerCase().startsWith('subject:')) {
          extractedSubject = line.substring(8).trim();
        } else if (line.toLowerCase().startsWith('from:')) {
          extractedFrom = line.substring(5).trim();
        } else if (line.trim() === '') {
          bodyStartIndex = i + 1;
          break;
        }
      }

      const extractedBody = lines.slice(bodyStartIndex).join('\n').trim() || content;

      if (extractedSubject) setSubject(extractedSubject);
      if (extractedFrom) setSender(extractedFrom);
      setBody(extractedBody);

      const scanRes = scanEmailContent(
        extractedSubject || file.name,
        extractedBody,
        extractedFrom || 'user@imported.mail',
        modelType,
        threshold
      );
      setResult(scanRes);
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setSubject('');
    setSender('');
    setBody('');
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Privacy Notice Banner */}
      <div className="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          <span className="text-cyan-400 font-mono">🔒 ZERO-STORAGE POLICY</span>
          <span className="text-slate-400">·</span>
          <span>Submitted email content is evaluated strictly in-memory and discarded. No records are saved to disk or telemetry.</span>
        </div>
        <button
          onClick={onGoToEvaluation}
          className="text-cyan-400 hover:text-cyan-300 whitespace-nowrap ml-4 font-medium"
        >
          View Model Evaluation →
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Email Input & Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-100">Live Email Scanner</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Paste email headers and text for TF-IDF feature extraction and Scikit-Learn classification.
                </p>
              </div>

              {/* Presets dropdown */}
              <div className="relative">
                <select
                  aria-label="Load Sample Attack Scenario"
                  onChange={e => handleSelectPreset(Number(e.target.value))}
                  className="appearance-none bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  defaultValue="0"
                >
                  <option value="" disabled>Load Sample Scenario...</option>
                  {PRESET_EMAILS.map((preset, idx) => (
                    <option key={idx} value={idx}>
                      {preset.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            <form onSubmit={handleScan} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. URGENT: Account Suspension Notice"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Sender Address (From)
                  </label>
                  <input
                    type="text"
                    value={sender}
                    onChange={e => setSender(e.target.value)}
                    placeholder="sender@domain.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-400">
                    Email Body Content
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {body.length} chars · {body.trim() ? body.trim().split(/\s+/).length : 0} words
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Paste email text, links, or instructions..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono text-xs leading-relaxed"
                  required
                />
              </div>

              {/* Model & Sensitivity Configuration Strip */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-slate-300 font-medium">Model Pipeline:</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setModelType('logistic_regression')}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        modelType === 'logistic_regression'
                          ? 'bg-cyan-500 text-slate-950 font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Logistic Regression
                    </button>
                    <button
                      type="button"
                      onClick={() => setModelType('multinomial_nb')}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        modelType === 'multinomial_nb'
                          ? 'bg-cyan-500 text-slate-950 font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Naive Bayes
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="text-slate-400">
                    Decision Threshold (θ): <span className="font-mono text-slate-200">{threshold.toFixed(2)}</span>
                    <span className="text-slate-500 text-[10px] ml-1.5">(Lower = More Sensitive to Phish)</span>
                  </div>
                  <input
                    type="range"
                    min="0.10"
                    max="0.90"
                    step="0.05"
                    value={threshold}
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      setThreshold(val);
                      if (result) {
                        setResult(scanEmailContent(subject, body, sender, modelType, val));
                      }
                    }}
                    className="w-32 accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-sm"
                  >
                    Scan Email with Machine Learning
                  </button>

                  <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg cursor-pointer transition-colors whitespace-nowrap">
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span>Upload .EML / .TXT</span>
                    <input
                      type="file"
                      accept=".eml,.txt,.msg"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-300 text-xs px-2 py-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Prediction Results & Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              {/* Verdict Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      result.predictedClass === 'phishing'
                        ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                        : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                    }`}
                  >
                    {result.predictedClass === 'phishing' ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : (
                      <ShieldCheck className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] font-mono tracking-wider text-slate-400">
                      MODEL PREDICTION
                    </div>
                    <div
                      className={`text-base font-bold tracking-tight ${
                        result.predictedClass === 'phishing'
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {result.predictedClass === 'phishing'
                        ? 'PHISHING EMAIL DETECTED'
                        : 'CLASSIFIED AS SAFE'}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Risk Score</span>
                  <span
                    className={`font-mono text-xl font-bold tabular-nums ${
                      result.riskScore > 50 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {result.riskScore}/100
                  </span>
                </div>
              </div>

              {/* Probabilities Comparison Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Model Probability Distribution</span>
                  <span className="font-mono text-slate-400 text-[11px]">
                    Latency: {result.processingTimeMs}ms
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
                  <div
                    className="h-full bg-rose-500 rounded-l-full transition-all duration-300"
                    style={{ width: `${result.phishingProbability * 100}%` }}
                    title={`Phishing: ${(result.phishingProbability * 100).toFixed(1)}%`}
                  />
                  <div
                    className="h-full bg-emerald-500 rounded-r-full transition-all duration-300"
                    style={{ width: `${result.safeProbability * 100}%` }}
                    title={`Safe: ${(result.safeProbability * 100).toFixed(1)}%`}
                  />
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-rose-400">
                    Phishing: {(result.phishingProbability * 100).toFixed(1)}%
                  </span>
                  <span className="text-emerald-400">
                    Safe: {(result.safeProbability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Threat Indicators Found */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>Detected Threat Signals</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {result.indicators.length} signals
                  </span>
                </div>

                {result.indicators.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-950 rounded border border-slate-800/60">
                    No prominent red flags or urgent coercive patterns identified in text.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {result.indicators.map((ind, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-950 rounded border border-slate-800/80 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            {ind.title}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              ind.severity === 'high'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800/50'
                                : 'bg-amber-950 text-amber-300 border border-amber-800/50'
                            }`}
                          >
                            {ind.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          {ind.description}
                        </p>
                        {ind.matches && ind.matches.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {ind.matches.map((m, mIdx) => (
                              <span
                                key={mIdx}
                                className="text-[10px] font-mono bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Extracted URLs Heuristics */}
              {result.extractedUrls.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-slate-300 block">
                    Extracted Hyperlinks ({result.extractedUrls.length})
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {result.extractedUrls.map((urlItem, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded border text-xs font-mono space-y-0.5 ${
                          urlItem.isSuspicious
                            ? 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between truncate">
                          <span className="truncate flex items-center gap-1">
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            {urlItem.domain}
                          </span>
                          <span className="text-[10px] shrink-0 text-slate-400">
                            {urlItem.isSuspicious ? 'FLAGGED' : 'NEUTRAL'}
                          </span>
                        </div>
                        {urlItem.reason && (
                          <p className="text-[11px] text-rose-400 font-sans">
                            {urlItem.reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Informative Model Terms */}
              {result.topPhishingTerms.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-slate-400 block">
                    Discriminative Phishing Terms in Sample:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {result.topPhishingTerms.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-900/40"
                      >
                        {t.term} (+{t.weight.toFixed(2)})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Recommendations */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <span className="text-xs font-semibold text-cyan-400 tracking-wide uppercase block">
                  Security Defense Guidelines:
                </span>
                <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Critical Caveat Warning */}
              <div className="p-2.5 bg-amber-950/20 border border-amber-900/30 rounded text-[11px] text-amber-300/90 leading-relaxed">
                <strong>Cybersecurity Student Note:</strong> Real-world ML models must be paired with SPF/DKIM/DMARC authentication, URL reputation sandboxing, and employee security training. Never rely on keyword scoring in isolation.
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 space-y-3">
              <FileText className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-medium">Ready to Analyze</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Paste an email or select one of the test attack presets to trigger feature extraction and Scikit-Learn prediction.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
