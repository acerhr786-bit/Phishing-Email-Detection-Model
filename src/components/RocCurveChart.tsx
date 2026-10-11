import React from 'react';
import { RocCurvePoint } from '../types/ml';

interface RocCurveChartProps {
  points: RocCurvePoint[];
  auc: number;
  currentThreshold: number;
}

export const RocCurveChart: React.FC<RocCurveChartProps> = ({ points, auc, currentThreshold }) => {
  const width = 280;
  const height = 220;
  const padding = 32;

  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  // Convert points to SVG coordinates
  // (fpr, tpr): fpr goes 0 -> 1 (left to right), tpr goes 0 -> 1 (bottom to top)
  const svgPoints = points.map(p => {
    const x = padding + p.fpr * innerW;
    const y = height - padding - p.tpr * innerH;
    return `${x},${y}`;
  }).join(' ');

  // Find nearest point for currentThreshold
  const activePoint = points.reduce((prev, curr) => {
    return Math.abs(curr.threshold - currentThreshold) < Math.abs(prev.threshold - currentThreshold) ? curr : prev;
  }, points[0]);

  const activeX = padding + (activePoint?.fpr || 0) * innerW;
  const activeY = height - padding - (activePoint?.tpr || 1) * innerH;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">Receiver Operating Characteristic</span>
        <span className="font-mono text-cyan-400">AUC = {auc.toFixed(3)}</span>
      </div>

      <div className="bg-slate-900/60 p-3 rounded border border-slate-800 flex justify-center">
        <svg width={width} height={height} className="overflow-visible select-none">
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#334155" strokeDasharray="3 3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#475569" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#475569" />
          <line x1={width - padding} y1={padding} x2={width - padding} y2={height - padding} stroke="#334155" strokeDasharray="3 3" />

          {/* Random Guess Diagonal */}
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={padding}
            stroke="#64748b"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />

          {/* ROC Path */}
          <polyline
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            points={svgPoints}
          />

          {/* Shaded Area under Curve */}
          <polygon
            points={`${padding},${height - padding} ${svgPoints} ${padding + innerW},${height - padding}`}
            fill="rgba(6, 182, 212, 0.12)"
          />

          {/* Current Operating Point */}
          <circle cx={activeX} cy={activeY} r="5" fill="#f43f5e" stroke="#fff" strokeWidth="2" />

          {/* Axis Labels */}
          <text x={width / 2} y={height - 8} fill="#94a3b8" fontSize="10" textAnchor="middle">
            False Positive Rate (FPR)
          </text>
          <text
            x={10}
            y={height / 2}
            fill="#94a3b8"
            fontSize="10"
            textAnchor="middle"
            transform={`rotate(-90, 10, ${height / 2})`}
          >
            True Positive Rate (TPR)
          </text>
        </svg>
      </div>

      <div className="flex justify-between items-center text-[11px] text-slate-400">
        <span>Operating Point: <span className="font-mono text-slate-200">θ = {currentThreshold.toFixed(2)}</span></span>
        <span>TPR: <strong className="font-mono text-cyan-400">{((activePoint?.tpr || 0) * 100).toFixed(0)}%</strong> · FPR: <strong className="font-mono text-rose-400">{((activePoint?.fpr || 0) * 100).toFixed(0)}%</strong></span>
      </div>
    </div>
  );
};
