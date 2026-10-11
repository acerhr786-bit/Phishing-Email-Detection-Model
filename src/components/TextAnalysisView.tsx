import React, { useState } from 'react';
import { tokenize, extractNgrams, calculateEntropy, ENGLISH_STOP_WORDS } from '../ml/preprocessor';
import { GLOBAL_MODEL, transformTfidf } from '../ml/tfidfModel';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';

export const TextAnalysisView: React.FC = () => {
  const [inputText, setInputText] = useState(
    'URGENT: Your Microsoft Office 365 password expires in less than 24 hours. Please verify your credentials immediately.'
  );

  const rawWords = inputText.trim() ? inputText.trim().split(/\s+/) : [];
  const tokens = tokenize(inputText);
  const bigrams = extractNgrams(tokens, 2);
  const entropy = calculateEntropy(inputText);

  // Stop words identified in the original text
  const stopWordsFound = rawWords
    .map(w => w.toLowerCase().replace(/[^\w]/g, ''))
    .filter(w => ENGLISH_STOP_WORDS.has(w));

  const uniqueStopWords = Array.from(new Set(stopWordsFound));

  // Compute TF-IDF on this custom sentence
  const tfidfVector = transformTfidf(
    inputText,
    GLOBAL_MODEL.artefact.vocabulary,
    GLOBAL_MODEL.artefact.idf
  );

  const nonZeroWeights: { term: string; weight: number }[] = [];
  GLOBAL_MODEL.artefact.vocabularyList.forEach((term, idx) => {
    if (tfidfVector[idx] > 0) {
      nonZeroWeights.push({
        term,
        weight: tfidfVector[idx]
      });
    }
  });

  nonZeroWeights.sort((a, b) => b.weight - a.weight);

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-cyan-400">
          <BookOpen className="w-5 h-5" />
          <h2 className="text-lg font-semibold text-slate-100">
            Natural Language Processing (NLP) & Feature Engineering Pipeline
          </h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          How machine learning converts raw human emails into numeric mathematical vectors for Scikit-Learn classifiers. Try editing the text below to observe real-time feature extraction.
        </p>
      </div>

      {/* Interactive Input Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <label className="block text-xs font-semibold text-slate-300">
          Interactive NLP Test Input
        </label>
        <textarea
          rows={3}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Type or paste any sample sentence..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500 leading-relaxed"
        />
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <span>Raw Words: {rawWords.length}</span>
          <span>Filtered Tokens: {tokens.length}</span>
          <span>Shannon Entropy: {entropy} bits/char</span>
        </div>
      </div>

      {/* Step by step stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Step 1: Tokenization */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400">01. Tokenization</span>
            <span className="text-[10px] font-mono text-slate-500">Lowercasing & Regex</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Splits text into lowercase alphanumeric words, stripping special symbols and digits.
          </p>
          <div className="p-2.5 bg-slate-950 rounded border border-slate-800/80 min-h-24 max-h-36 overflow-y-auto">
            <div className="flex flex-wrap gap-1">
              {tokens.map((t, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 font-mono text-[10px]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Stop Words Removal */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400">02. Stop-Word Filter</span>
            <span className="text-[10px] font-mono text-slate-500">NLTK / English List</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Removes uninformative function words (<code className="text-slate-300">your, in, than, please</code>) to focus on semantic content.
          </p>
          <div className="p-2.5 bg-slate-950 rounded border border-slate-800/80 min-h-24 max-h-36 overflow-y-auto">
            <div className="flex flex-wrap gap-1">
              {uniqueStopWords.map((sw, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded bg-slate-900/60 text-slate-500 border border-slate-800/40 line-through font-mono text-[10px]"
                >
                  {sw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3: N-Gram Extraction */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400">03. N-Gram Bundles</span>
            <span className="text-[10px] font-mono text-slate-500">Bigrams (N=2)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Preserves compound phrases like "password expires" or "verify credentials" that signal intent.
          </p>
          <div className="p-2.5 bg-slate-950 rounded border border-slate-800/80 min-h-24 max-h-36 overflow-y-auto">
            <div className="flex flex-wrap gap-1">
              {bigrams.map((bg, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded bg-cyan-950/30 text-cyan-300 border border-cyan-900/40 font-mono text-[10px]"
                >
                  "{bg}"
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Step 4: Shannon Entropy */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400">04. Entropy & Obfuscation</span>
            <span className="text-[10px] font-mono text-slate-500">H(X) Metric</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Higher randomness values indicate encoded strings, homoglyphs, or randomized tracking tokens.
          </p>
          <div className="p-2.5 bg-slate-950 rounded border border-slate-800/80 min-h-24 flex flex-col justify-center text-center">
            <div className="font-mono text-2xl font-bold text-cyan-400 tabular-nums">
              {entropy}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {entropy > 4.2 ? 'Moderate/High Complexity' : 'Normal Text Distribution'}
            </div>
          </div>
        </div>
      </div>

      {/* TF-IDF Weights Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Computed TF-IDF Feature Weights for Test Text
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Formula: <code className="text-cyan-300">tfidf(t, d) = tf(t, d) × (log((1 + N)/(1 + df(t))) + 1)</code> with L2 vector normalization.
            </p>
          </div>
          <span className="font-mono text-xs text-cyan-400">
            {nonZeroWeights.length} vocabulary matches
          </span>
        </div>

        {nonZeroWeights.length === 0 ? (
          <div className="p-4 bg-slate-950 rounded border border-slate-800 text-xs text-slate-500 text-center">
            None of the words in the sample match the trained vocabulary dictionary (Out-of-Vocabulary).
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {nonZeroWeights.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-slate-950 rounded border border-slate-800 flex items-center justify-between text-xs"
              >
                <span className="font-mono text-slate-200 truncate">{item.term}</span>
                <span className="font-mono text-cyan-400 font-semibold tabular-nums ml-2">
                  {item.weight.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
