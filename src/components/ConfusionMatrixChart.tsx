import React, { useState } from 'react';
import { MetricSummary } from '../types/ml';

interface ConfusionMatrixChartProps {
  metrics: MetricSummary;
  modelName: string;
}

export const ConfusionMatrixChart: React.FC<ConfusionMatrixChartProps> = ({ metrics, modelName }) => {
  const [selectedCell, setSelectedCell] = useState<'TN' | 'FP' | 'FN' | 'TP' | null>(null);

  const { truePositive, falsePositive, trueNegative, falseNegative } = metrics.confusionMatrix;
  const total = truePositive + falsePositive + trueNegative + falseNegative || 1;

  const cellDetails = {
    TN: {
      title: 'True Negative (TN)',
      count: trueNegative,
      percentage: ((trueNegative / total) * 100).toFixed(1),
      nature: 'Safe email correctly predicted as Safe',
      impact: 'Nominal workflow. Legitimate emails land safely in the employee inbox without interruption.'
    },
    FP: {
      title: 'False Positive (FP)',
      count: falsePositive,
      percentage: ((falsePositive / total) * 100).toFixed(1),
      nature: 'Safe email incorrectly flagged as Phishing (False Alarm)',
      impact: 'Business friction. Important internal emails, vendor invoices, or client inquiries may get quarantined.'
    },
    FN: {
      title: 'False Negative (FN)',
      count: falseNegative,
      percentage: ((falseNegative / total) * 100).toFixed(1),
      nature: 'Phishing attack slipped past model as Safe (Severe Threat)',
      impact: 'Critical vulnerability. Malicious credential harvesters or malware lures reach end-users undetected.'
    },
    TP: {
      title: 'True Positive (TP)',
      count: truePositive,
      percentage: ((truePositive / total) * 100).toFixed(1),
      nature: 'Phishing email accurately detected and neutralized',
      impact: 'Threat neutralized. Malicious payload blocked prior to victim engagement.'
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Evaluated on 20% unseen test partition</span>
        <span>Model: {modelName}</span>
      </div>

      <div className="grid grid-cols-[100px_1fr_1fr] gap-2 items-center text-xs">
        {/* Header row */}
        <div className="text-slate-500 font-mono">Actual \ Pred</div>
        <div className="text-center font-medium text-emerald-400 bg-emerald-950/20 py-1.5 rounded border border-emerald-900/30">
          Predicted SAFE (0)
        </div>
        <div className="text-center font-medium text-rose-400 bg-rose-950/20 py-1.5 rounded border border-rose-900/30">
          Predicted PHISHING (1)
        </div>

        {/* Actual Safe Row */}
        <div className="text-slate-300 font-medium py-4 px-2 bg-slate-900/50 rounded border border-slate-800">
          Actual SAFE
        </div>

        {/* True Negative */}
        <button
          type="button"
          onClick={() => setSelectedCell('TN')}
          className={`p-4 rounded border text-left transition-all ${
            selectedCell === 'TN' ? 'ring-2 ring-emerald-400' : ''
          } bg-emerald-950/30 border-emerald-800/40 hover:bg-emerald-900/40`}
        >
          <div className="flex justify-between items-baseline mb-1">
            <span className="font-semibold text-emerald-300">True Negative (TN)</span>
            <span className="font-mono text-xs text-emerald-400/80">{((trueNegative / total) * 100).toFixed(0)}%</span>
          </div>
          <div className="font-mono text-2xl font-bold text-slate-100 tabular-nums">{trueNegative}</div>
          <div className="text-[11px] text-slate-400 mt-1">Legitimate confirmed</div>
        </button>

        {/* False Positive */}
        <button
          type="button"
          onClick={() => setSelectedCell('FP')}
          className={`p-4 rounded border text-left transition-all ${
            selectedCell === 'FP' ? 'ring-2 ring-amber-400' : ''
          } ${
            falsePositive > 0
              ? 'bg-amber-950/40 border-amber-800/50 hover:bg-amber-900/50'
              : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40'
          }`}
        >
          <div className="flex justify-between items-baseline mb-1">
            <span className={`font-semibold ${falsePositive > 0 ? 'text-amber-300' : 'text-slate-400'}`}>
              False Positive (FP)
            </span>
            <span className="font-mono text-xs text-slate-400">{((falsePositive / total) * 100).toFixed(0)}%</span>
          </div>
          <div className="font-mono text-2xl font-bold text-slate-100 tabular-nums">{falsePositive}</div>
          <div className="text-[11px] text-slate-400 mt-1">False alarm (overblock)</div>
        </button>

        {/* Actual Phishing Row */}
        <div className="text-slate-300 font-medium py-4 px-2 bg-slate-900/50 rounded border border-slate-800">
          Actual PHISH
        </div>

        {/* False Negative */}
        <button
          type="button"
          onClick={() => setSelectedCell('FN')}
          className={`p-4 rounded border text-left transition-all ${
            selectedCell === 'FN' ? 'ring-2 ring-rose-400' : ''
          } ${
            falseNegative > 0
              ? 'bg-rose-950/50 border-rose-800/60 hover:bg-rose-900/60'
              : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40'
          }`}
        >
          <div className="flex justify-between items-baseline mb-1">
            <span className={`font-semibold ${falseNegative > 0 ? 'text-rose-300' : 'text-slate-400'}`}>
              False Negative (FN)
            </span>
            <span className="font-mono text-xs text-slate-400">{((falseNegative / total) * 100).toFixed(0)}%</span>
          </div>
          <div className="font-mono text-2xl font-bold text-slate-100 tabular-nums">{falseNegative}</div>
          <div className="text-[11px] text-slate-400 mt-1">Missed breach hazard</div>
        </button>

        {/* True Positive */}
        <button
          type="button"
          onClick={() => setSelectedCell('TP')}
          className={`p-4 rounded border text-left transition-all ${
            selectedCell === 'TP' ? 'ring-2 ring-cyan-400' : ''
          } bg-cyan-950/30 border-cyan-800/40 hover:bg-cyan-900/40`}
        >
          <div className="flex justify-between items-baseline mb-1">
            <span className="font-semibold text-cyan-300">True Positive (TP)</span>
            <span className="font-mono text-xs text-cyan-400/80">{((truePositive / total) * 100).toFixed(0)}%</span>
          </div>
          <div className="font-mono text-2xl font-bold text-slate-100 tabular-nums">{truePositive}</div>
          <div className="text-[11px] text-slate-400 mt-1">Phishing intercepted</div>
        </button>
      </div>

      {/* Explanatory Drawer */}
      {selectedCell && (
        <div className="p-3 bg-slate-900/70 border border-slate-800 rounded text-xs space-y-1">
          <div className="flex items-center justify-between font-medium text-slate-200">
            <span>{cellDetails[selectedCell].title}</span>
            <span className="font-mono text-cyan-400">{cellDetails[selectedCell].count} test cases ({cellDetails[selectedCell].percentage}%)</span>
          </div>
          <p className="text-slate-300">{cellDetails[selectedCell].nature}</p>
          <p className="text-slate-400">{cellDetails[selectedCell].impact}</p>
        </div>
      )}
    </div>
  );
};
