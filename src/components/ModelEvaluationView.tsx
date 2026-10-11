import React, { useState } from 'react';
import { ModelType } from '../types/ml';
import { GLOBAL_MODEL, evaluateModelOnTest, predictProbabilitiesLr, predictProbabilitiesNb, transformTfidf } from '../ml/tfidfModel';
import { ConfusionMatrixChart } from './ConfusionMatrixChart';
import { RocCurveChart } from './RocCurveChart';
import { ShieldCheck, Info, CheckCircle2, AlertOctagon } from 'lucide-react';

export const ModelEvaluationView: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<ModelType>('logistic_regression');
  const [evalThreshold, setEvalThreshold] = useState<number>(0.5);

  const { artefact, split } = GLOBAL_MODEL;

  // Compute live metrics if threshold changes
  const predictor = selectedModel === 'logistic_regression'
    ? (v: number[]) => predictProbabilitiesLr(v, artefact.lr)
    : (v: number[]) => predictProbabilitiesNb(v, artefact.nb);

  const activeMetrics = evaluateModelOnTest(
    split.test,
    artefact.vocabulary,
    artefact.idf,
    predictor,
    evalThreshold
  );

  const rocPoints = selectedModel === 'logistic_regression' ? artefact.rocPointsLr : artefact.rocPointsNb;
  const modelTitle = selectedModel === 'logistic_regression' ? 'Logistic Regression' : 'Multinomial Naive Bayes';

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Model Performance & Evaluation Dashboard</h2>
          <p className="text-xs text-slate-400 mt-1">
            Validated against independent holdout test data (80/20 stratified split · No data leakage).
          </p>
        </div>

        {/* Model Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setSelectedModel('logistic_regression')}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
              selectedModel === 'logistic_regression'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Logistic Regression
          </button>
          <button
            type="button"
            onClick={() => setSelectedModel('multinomial_nb')}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
              selectedModel === 'multinomial_nb'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Multinomial Naive Bayes
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Accuracy</span>
          <div className="font-mono text-2xl font-bold text-cyan-400 mt-1 tabular-nums">
            {(activeMetrics.accuracy * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Overall correct classifications</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Precision (Phish)</span>
          <div className="font-mono text-2xl font-bold text-cyan-400 mt-1 tabular-nums">
            {(activeMetrics.precision * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Flagged items actually phishing</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Recall (Catch Rate)</span>
          <div className="font-mono text-2xl font-bold text-cyan-400 mt-1 tabular-nums">
            {(activeMetrics.recall * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Actual phishing caught</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">F1-Score</span>
          <div className="font-mono text-2xl font-bold text-cyan-400 mt-1 tabular-nums">
            {activeMetrics.f1Score.toFixed(3)}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Harmonic mean of prec & rec</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 col-span-2 md:col-span-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">ROC-AUC</span>
          <div className="font-mono text-2xl font-bold text-cyan-400 mt-1 tabular-nums">
            {activeMetrics.rocAuc.toFixed(3)}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Area under ROC curve</span>
        </div>
      </div>

      {/* Threshold Dynamic Slider */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">Interactive Decision Threshold (θ):</span>
            <span className="font-mono text-cyan-400 text-sm font-bold">{evalThreshold.toFixed(2)}</span>
          </div>
          <span className="text-slate-400 text-[11px]">
            Lower threshold increases Recall (catches more attacks); higher threshold increases Precision (fewer false alarms).
          </span>
        </div>
        <input
          type="range"
          min="0.10"
          max="0.90"
          step="0.05"
          value={evalThreshold}
          onChange={e => setEvalThreshold(parseFloat(e.target.value))}
          className="w-full accent-cyan-400 cursor-pointer"
        />
      </div>

      {/* Confusion Matrix and ROC Curve Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Confusion Matrix */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">Interactive Confusion Matrix Heatmap</h3>
            <span className="text-xs text-slate-400">Click any quadrant to inspect</span>
          </div>
          <ConfusionMatrixChart metrics={activeMetrics} modelName={modelTitle} />
        </div>

        {/* Right: ROC Curve */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-100">ROC Curve & Operating Point</h3>
          <RocCurveChart
            points={rocPoints}
            auc={activeMetrics.rocAuc}
            currentThreshold={evalThreshold}
          />
        </div>
      </div>

      {/* Feature Coefficients / Vocabulary Importance */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Vocabulary Weights & Model Interpretability (Top Features)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Coefficients learned by the Logistic Regression linear decision boundary: log-odds shift per unit TF-IDF weight.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {artefact.vocabulary.size} features in vocabulary
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Phishing Features */}
          <div className="p-4 bg-slate-950 border border-rose-900/30 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
              <AlertOctagon className="w-4 h-4" />
              <span>Top Phishing Indicators (+ Coefficients)</span>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {artefact.topPhishingFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded bg-rose-950/20 border border-rose-900/30 font-mono"
                >
                  <span className="text-slate-200">{feat.term}</span>
                  <span className="text-rose-400 tabular-nums">+{feat.weight.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Safe Features */}
          <div className="p-4 bg-slate-950 border border-emerald-900/30 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Top Safe Indicators (- Coefficients)</span>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {artefact.topSafeFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded bg-emerald-950/20 border border-emerald-900/30 font-mono"
                >
                  <span className="text-slate-200">{feat.term}</span>
                  <span className="text-emerald-400 tabular-nums">{feat.weight.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data Leakage Prevention & Methodology Explainer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold">
          <Info className="w-4 h-4" />
          <span>Cybersecurity Data Science: Preventing Data Leakage</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3 bg-slate-950 rounded border border-slate-800/80 space-y-1">
            <span className="font-semibold text-slate-100 block">1. Stratified Partitioning</span>
            <p className="text-slate-400 leading-relaxed">
              The dataset is divided prior to any NLP transformations. An 80/20 ratio ensures equal distribution of attack vectors and benign samples across both folds.
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded border border-slate-800/80 space-y-1">
            <span className="font-semibold text-slate-100 block">2. Training-Only TF-IDF Fitting</span>
            <p className="text-slate-400 leading-relaxed">
              The vocabulary dictionary and IDF inverse frequency weights are fitted exclusively on <code className="text-cyan-300">X_train</code>. The test set is strictly transformed using learned parameters.
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded border border-slate-800/80 space-y-1">
            <span className="font-semibold text-slate-100 block">3. Zero Contamination</span>
            <p className="text-slate-400 leading-relaxed">
              No test words influence the feature space. Unseen test tokens are gracefully handled as out-of-vocabulary, mirroring real-world incoming mail streams.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
