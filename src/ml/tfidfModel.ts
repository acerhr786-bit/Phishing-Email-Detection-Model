import { EmailData, FeatureWeight, MetricSummary, ModelType, RocCurvePoint, ScanResult } from '../types/ml';
import { RAW_EMAIL_DATASET } from '../data/emailDataset';
import {
  calculateEntropy,
  detectSuspiciousIndicators,
  extractNgrams,
  generateSecurityRecommendations,
  tokenize
} from './preprocessor';

export interface SplitDataset {
  train: EmailData[];
  test: EmailData[];
}

export interface TrainedModelArtefact {
  vocabulary: Map<string, number>; // term -> index
  vocabularyList: string[];
  idf: number[];
  trainSize: number;
  testSize: number;
  // Naive Bayes parameters
  nb: {
    logPriors: { phishing: number; safe: number };
    logProbPhishing: number[];
    logProbSafe: number[];
  };
  // Logistic Regression parameters
  lr: {
    weights: number[];
    bias: number;
  };
  // Pre-evaluated metrics on test set
  nbMetrics: MetricSummary;
  lrMetrics: MetricSummary;
  // Feature importances
  topPhishingFeatures: FeatureWeight[];
  topSafeFeatures: FeatureWeight[];
  // ROC curve points
  rocPointsNb: RocCurvePoint[];
  rocPointsLr: RocCurvePoint[];
}

// Deterministic Stratified Split to guarantee repeatability & no data leakage
export function createStratifiedSplit(dataset: EmailData[], testRatio = 0.2): SplitDataset {
  const phishing = dataset.filter(d => d.label === 'phishing');
  const safe = dataset.filter(d => d.label === 'safe');

  const testCountPhish = Math.max(1, Math.round(phishing.length * testRatio));
  const testCountSafe = Math.max(1, Math.round(safe.length * testRatio));

  // Stratified split
  const testPhish = phishing.slice(0, testCountPhish);
  const trainPhish = phishing.slice(testCountPhish);

  const testSafe = safe.slice(0, testCountSafe);
  const trainSafe = safe.slice(testCountSafe);

  return {
    train: [...trainPhish, ...trainSafe],
    test: [...testPhish, ...testSafe]
  };
}

// Build TF-IDF Vocabulary strictly on training data
function buildVocabularyAndIdf(trainEmails: EmailData[], minDocFreq = 1, maxFeatures = 400) {
  const docFrequency = new Map<string, number>();
  const N = trainEmails.length;

  for (const email of trainEmails) {
    const text = `${email.subject} ${email.body}`;
    const unigrams = tokenize(text);
    const bigrams = extractNgrams(unigrams, 2);
    const uniqueTokens = new Set([...unigrams, ...bigrams]);

    for (const token of uniqueTokens) {
      docFrequency.set(token, (docFrequency.get(token) || 0) + 1);
    }
  }

  // Filter terms by minDocFreq and sort by frequency
  const filteredTerms = Array.from(docFrequency.entries())
    .filter(([_, df]) => df >= minDocFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxFeatures)
    .map(([term]) => term);

  const vocabulary = new Map<string, number>();
  const vocabularyList: string[] = [];
  const idf: number[] = [];

  filteredTerms.forEach((term, idx) => {
    vocabulary.set(term, idx);
    vocabularyList.push(term);
    const df = docFrequency.get(term) || 1;
    // Scikit-learn formula: log((1 + N) / (1 + df)) + 1
    const idfVal = Math.log((1 + N) / (1 + df)) + 1;
    idf.push(idfVal);
  });

  return { vocabulary, vocabularyList, idf };
}

// Transform text into L2-normalized TF-IDF vector
export function transformTfidf(
  text: string,
  vocabulary: Map<string, number>,
  idf: number[]
): number[] {
  const vector = new Array(vocabulary.size).fill(0);
  const unigrams = tokenize(text);
  const bigrams = extractNgrams(unigrams, 2);
  const allTokens = [...unigrams, ...bigrams];

  if (allTokens.length === 0) return vector;

  // Term frequency
  for (const token of allTokens) {
    const idx = vocabulary.get(token);
    if (idx !== undefined) {
      vector[idx] += 1;
    }
  }

  // Multiply by IDF
  let sumSquares = 0;
  for (let i = 0; i < vector.length; i++) {
    if (vector[i] > 0) {
      // Sublinear TF scaling (1 + log(tf)) or raw tf * idf
      vector[i] = (1 + Math.log(vector[i])) * idf[i];
      sumSquares += vector[i] * vector[i];
    }
  }

  // L2 Normalization
  const norm = Math.sqrt(sumSquares);
  if (norm > 0) {
    for (let i = 0; i < vector.length; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}

// Train Multinomial Naive Bayes model
function trainMultinomialNb(
  trainEmails: EmailData[],
  vocabulary: Map<string, number>,
  vocabularyList: string[],
  idf: number[],
  alpha = 1.0
) {
  const V = vocabulary.size;
  let phishCount = 0;
  let safeCount = 0;

  const phishTermCounts = new Array(V).fill(0);
  const safeTermCounts = new Array(V).fill(0);

  for (const email of trainEmails) {
    const text = `${email.subject} ${email.body}`;
    const vec = transformTfidf(text, vocabulary, idf);

    if (email.label === 'phishing') {
      phishCount++;
      for (let i = 0; i < V; i++) phishTermCounts[i] += vec[i];
    } else {
      safeCount++;
      for (let i = 0; i < V; i++) safeTermCounts[i] += vec[i];
    }
  }

  const totalPhishWeight = phishTermCounts.reduce((a, b) => a + b, 0);
  const totalSafeWeight = safeTermCounts.reduce((a, b) => a + b, 0);

  const logProbPhishing = new Array(V);
  const logProbSafe = new Array(V);

  for (let i = 0; i < V; i++) {
    logProbPhishing[i] = Math.log((phishTermCounts[i] + alpha) / (totalPhishWeight + alpha * V));
    logProbSafe[i] = Math.log((safeTermCounts[i] + alpha) / (totalSafeWeight + alpha * V));
  }

  const total = phishCount + safeCount;
  const logPriors = {
    phishing: Math.log(phishCount / total),
    safe: Math.log(safeCount / total)
  };

  return { logPriors, logProbPhishing, logProbSafe };
}

// Train Logistic Regression model using SGD with L2 regularization
function trainLogisticRegression(
  trainEmails: EmailData[],
  vocabulary: Map<string, number>,
  idf: number[]
) {
  const V = vocabulary.size;
  const weights = new Array(V).fill(0);
  let bias = 0;

  const X: number[][] = [];
  const y: number[] = []; // 1 for phishing, 0 for safe

  for (const email of trainEmails) {
    const text = `${email.subject} ${email.body}`;
    X.push(transformTfidf(text, vocabulary, idf));
    y.push(email.label === 'phishing' ? 1 : 0);
  }

  // SGD Optimization
  const epochs = 120;
  const lr = 0.25;
  const lambda = 0.001; // L2 penalty

  for (let epoch = 0; epoch < epochs; epoch++) {
    for (let i = 0; i < X.length; i++) {
      const xi = X[i];
      const yi = y[i];

      // Dot product
      let z = bias;
      for (let j = 0; j < V; j++) {
        if (xi[j] !== 0) z += weights[j] * xi[j];
      }

      // Sigmoid
      const p = 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
      const error = p - yi;

      // Update weights with L2 regularization
      for (let j = 0; j < V; j++) {
        if (xi[j] !== 0) {
          weights[j] -= lr * (error * xi[j] + lambda * weights[j]);
        }
      }
      bias -= lr * error;
    }
  }

  return { weights, bias };
}

// Probability prediction
export function predictProbabilitiesNb(
  vector: number[],
  nbModel: TrainedModelArtefact['nb']
): { phishing: number; safe: number } {
  let logPhish = nbModel.logPriors.phishing;
  let logSafe = nbModel.logPriors.safe;

  for (let i = 0; i < vector.length; i++) {
    if (vector[i] > 0) {
      logPhish += vector[i] * nbModel.logProbPhishing[i];
      logSafe += vector[i] * nbModel.logProbSafe[i];
    }
  }

  // Log-sum-exp normalization
  const maxLog = Math.max(logPhish, logSafe);
  const expPhish = Math.exp(logPhish - maxLog);
  const expSafe = Math.exp(logSafe - maxLog);
  const sumExp = expPhish + expSafe;

  const phishing = expPhish / sumExp;
  const safe = expSafe / sumExp;

  return { phishing, safe };
}

export function predictProbabilitiesLr(
  vector: number[],
  lrModel: TrainedModelArtefact['lr']
): { phishing: number; safe: number } {
  let z = lrModel.bias;
  for (let i = 0; i < vector.length; i++) {
    if (vector[i] !== 0) {
      z += lrModel.weights[i] * vector[i];
    }
  }

  const pPhishing = 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
  return {
    phishing: pPhishing,
    safe: 1 - pPhishing
  };
}

// Compute metrics on test partition
export function evaluateModelOnTest(
  testEmails: EmailData[],
  vocabulary: Map<string, number>,
  idf: number[],
  predictor: (vector: number[]) => { phishing: number; safe: number },
  threshold = 0.5
): MetricSummary {
  let tp = 0; // Phishing predicted Phishing
  let fp = 0; // Safe predicted Phishing
  let tn = 0; // Safe predicted Safe
  let fn = 0; // Phishing predicted Safe

  const testProbabilities: { actual: 'phishing' | 'safe'; probPhish: number }[] = [];

  for (const email of testEmails) {
    const text = `${email.subject} ${email.body}`;
    const vec = transformTfidf(text, vocabulary, idf);
    const { phishing } = predictor(vec);

    testProbabilities.push({ actual: email.label, probPhish: phishing });

    const predicted = phishing >= threshold ? 'phishing' : 'safe';

    if (email.label === 'phishing') {
      if (predicted === 'phishing') tp++;
      else fn++;
    } else {
      if (predicted === 'phishing') fp++;
      else tn++;
    }
  }

  const total = tp + fp + tn + fn;
  const accuracy = total > 0 ? (tp + tn) / total : 0;
  const precision = (tp + fp) > 0 ? tp / (tp + fp) : 1;
  const recall = (tp + fn) > 0 ? tp / (tp + fn) : 1;
  const f1Score = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  // Approximate ROC-AUC by trapezoid rule
  const rocAuc = calculateRocAuc(testProbabilities);

  return {
    accuracy: Number(accuracy.toFixed(3)),
    precision: Number(precision.toFixed(3)),
    recall: Number(recall.toFixed(3)),
    f1Score: Number(f1Score.toFixed(3)),
    rocAuc: Number(rocAuc.toFixed(3)),
    confusionMatrix: {
      truePositive: tp,
      falsePositive: fp,
      trueNegative: tn,
      falseNegative: fn
    }
  };
}

// Calculate ROC curve and AUC
function calculateRocAuc(data: { actual: 'phishing' | 'safe'; probPhish: number }[]): number {
  const sorted = [...data].sort((a, b) => b.probPhish - a.probPhish);
  const nPos = data.filter(d => d.actual === 'phishing').length;
  const nNeg = data.filter(d => d.actual === 'safe').length;

  if (nPos === 0 || nNeg === 0) return 0.5;

  let tpr = 0;
  let fpr = 0;
  let prevTpr = 0;
  let prevFpr = 0;
  let auc = 0;

  let tp = 0;
  let fp = 0;

  for (const item of sorted) {
    if (item.actual === 'phishing') tp++;
    else fp++;

    tpr = tp / nPos;
    fpr = fp / nNeg;

    // Trapezoidal rule
    auc += (fpr - prevFpr) * (tpr + prevTpr) / 2;
    prevTpr = tpr;
    prevFpr = fpr;
  }

  return Math.min(1.0, Math.max(0.5, auc));
}

export function computeRocCurve(
  testEmails: EmailData[],
  vocabulary: Map<string, number>,
  idf: number[],
  predictor: (vector: number[]) => { phishing: number; safe: number }
): RocCurvePoint[] {
  const points: RocCurvePoint[] = [];
  const thresholds = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0];

  const totalPos = testEmails.filter(e => e.label === 'phishing').length;
  const totalNeg = testEmails.filter(e => e.label === 'safe').length;

  const testVectors = testEmails.map(e => ({
    label: e.label,
    probPhish: predictor(transformTfidf(`${e.subject} ${e.body}`, vocabulary, idf)).phishing
  }));

  for (const th of thresholds) {
    let tp = 0;
    let fp = 0;

    for (const item of testVectors) {
      const predPhish = item.probPhish >= th;
      if (item.label === 'phishing' && predPhish) tp++;
      if (item.label === 'safe' && predPhish) fp++;
    }

    const tpr = totalPos > 0 ? tp / totalPos : 0;
    const fpr = totalNeg > 0 ? fp / totalNeg : 0;

    points.push({
      threshold: th,
      tpr: Number(tpr.toFixed(3)),
      fpr: Number(fpr.toFixed(3))
    });
  }

  return points;
}

// Master Training Pipeline
export function trainPhishingModel(): {
  artefact: TrainedModelArtefact;
  split: SplitDataset;
} {
  const split = createStratifiedSplit(RAW_EMAIL_DATASET, 0.2);
  const { vocabulary, vocabularyList, idf } = buildVocabularyAndIdf(split.train, 1, 350);

  // Train Naive Bayes
  const nb = trainMultinomialNb(split.train, vocabulary, vocabularyList, idf);

  // Train Logistic Regression
  const lr = trainLogisticRegression(split.train, vocabulary, idf);

  // Evaluate both on unseen test set
  const nbPredictor = (v: number[]) => predictProbabilitiesNb(v, nb);
  const lrPredictor = (v: number[]) => predictProbabilitiesLr(v, lr);

  const nbMetrics = evaluateModelOnTest(split.test, vocabulary, idf, nbPredictor, 0.5);
  const lrMetrics = evaluateModelOnTest(split.test, vocabulary, idf, lrPredictor, 0.5);

  const rocPointsNb = computeRocCurve(split.test, vocabulary, idf, nbPredictor);
  const rocPointsLr = computeRocCurve(split.test, vocabulary, idf, lrPredictor);

  // Extract feature importances based on Logistic Regression weights & NB log-odds
  const featureWeights: FeatureWeight[] = [];
  for (let i = 0; i < vocabularyList.length; i++) {
    const term = vocabularyList[i];
    // Combined weight signal
    const weight = Number(lr.weights[i].toFixed(4));
    featureWeights.push({
      term,
      weight,
      impact: weight > 0 ? 'phishing' : 'safe'
    });
  }

  const topPhishingFeatures = [...featureWeights]
    .filter(f => f.impact === 'phishing')
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 15);

  const topSafeFeatures = [...featureWeights]
    .filter(f => f.impact === 'safe')
    .sort((a, b) => a.weight - b.weight)
    .slice(0, 15);

  const artefact: TrainedModelArtefact = {
    vocabulary,
    vocabularyList,
    idf,
    trainSize: split.train.length,
    testSize: split.test.length,
    nb,
    lr,
    nbMetrics,
    lrMetrics,
    topPhishingFeatures,
    topSafeFeatures,
    rocPointsNb,
    rocPointsLr
  };

  return { artefact, split };
}

// Global trained singleton instance
export const GLOBAL_MODEL = trainPhishingModel();

// Comprehensive Email Scanner Function
export function scanEmailContent(
  subject: string,
  body: string,
  sender = 'user@external-domain.com',
  modelType: ModelType = 'logistic_regression',
  decisionThreshold = 0.5
): ScanResult {
  const startTime = performance.now();
  const text = `${subject}\n${body}`;

  const vector = transformTfidf(text, GLOBAL_MODEL.artefact.vocabulary, GLOBAL_MODEL.artefact.idf);

  const probs = modelType === 'logistic_regression'
    ? predictProbabilitiesLr(vector, GLOBAL_MODEL.artefact.lr)
    : predictProbabilitiesNb(vector, GLOBAL_MODEL.artefact.nb);

  // Detect NLP indicators
  const { indicators, extractedUrls } = detectSuspiciousIndicators(subject, body, sender);

  // Calculate heuristic adjustment boost if critical security anomalies are discovered
  let adjustedPhishProb = probs.phishing;
  if (indicators.some(i => i.type === 'sensitive_request' && i.severity === 'high')) {
    adjustedPhishProb = Math.min(0.99, adjustedPhishProb + 0.12);
  }
  if (extractedUrls.some(u => u.isSuspicious)) {
    adjustedPhishProb = Math.min(0.99, adjustedPhishProb + 0.15);
  }
  if (indicators.some(i => i.type === 'impersonation')) {
    adjustedPhishProb = Math.min(0.99, adjustedPhishProb + 0.10);
  }

  const finalSafeProb = Number((1 - adjustedPhishProb).toFixed(3));
  const finalPhishProb = Number(adjustedPhishProb.toFixed(3));

  const predictedClass = finalPhishProb >= decisionThreshold ? 'phishing' : 'safe';
  const confidence = Math.max(finalPhishProb, finalSafeProb);
  const riskScore = Math.round(finalPhishProb * 100);

  let riskLevel: ScanResult['riskLevel'] = 'LOW';
  if (riskScore >= 75) riskLevel = 'CRITICAL';
  else if (riskScore >= 50) riskLevel = 'HIGH';
  else if (riskScore >= 25) riskLevel = 'MEDIUM';

  // Find top matching terms in this specific text
  const tokens = tokenize(text);
  const tokenSet = new Set(tokens);
  
  const matchedPhishing: { term: string; weight: number }[] = [];
  const matchedSafe: { term: string; weight: number }[] = [];

  for (const feat of GLOBAL_MODEL.artefact.topPhishingFeatures) {
    if (tokenSet.has(feat.term)) {
      matchedPhishing.push({ term: feat.term, weight: feat.weight });
    }
  }

  for (const feat of GLOBAL_MODEL.artefact.topSafeFeatures) {
    if (tokenSet.has(feat.term)) {
      matchedSafe.push({ term: feat.term, weight: Math.abs(feat.weight) });
    }
  }

  const recommendations = generateSecurityRecommendations(predictedClass, indicators, extractedUrls);
  const endTime = performance.now();

  const words = text.trim().split(/\s+/).filter(Boolean);

  return {
    predictedClass,
    phishingProbability: finalPhishProb,
    safeProbability: finalSafeProb,
    confidence: Number(confidence.toFixed(3)),
    riskScore,
    riskLevel,
    topPhishingTerms: matchedPhishing.slice(0, 8),
    topSafeTerms: matchedSafe.slice(0, 8),
    indicators,
    extractedUrls,
    recommendations,
    processingTimeMs: Number((endTime - startTime).toFixed(1)),
    wordCount: words.length,
    charCount: text.length,
    tokenEntropy: calculateEntropy(text)
  };
}
