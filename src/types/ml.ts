export type EmailLabel = 'phishing' | 'safe';

export interface EmailData {
  id: string;
  subject: string;
  body: string;
  sender: string;
  label: EmailLabel; // 'phishing' | 'safe'
  category: string;
  notes?: string;
}

export interface MetricSummary {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  confusionMatrix: {
    truePositive: number;  // Correctly predicted Phishing
    falsePositive: number; // Safe predicted as Phishing
    trueNegative: number;  // Correctly predicted Safe
    falseNegative: number; // Phishing predicted as Safe
  };
}

export interface SuspiciousIndicator {
  type: 'urgency' | 'url' | 'sensitive_request' | 'impersonation' | 'grammatical' | 'header';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  matches?: string[];
}

export interface ExtractedUrl {
  url: string;
  domain: string;
  isSuspicious: boolean;
  reason?: string;
}

export interface ScanResult {
  predictedClass: EmailLabel;
  phishingProbability: number; // 0 to 1
  safeProbability: number;     // 0 to 1
  confidence: number;          // max(p, 1-p)
  riskScore: number;           // 0 to 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  topPhishingTerms: { term: string; weight: number }[];
  topSafeTerms: { term: string; weight: number }[];
  indicators: SuspiciousIndicator[];
  extractedUrls: ExtractedUrl[];
  recommendations: string[];
  processingTimeMs: number;
  wordCount: number;
  charCount: number;
  tokenEntropy: number;
}

export type ModelType = 'multinomial_nb' | 'logistic_regression';

export interface FeatureWeight {
  term: string;
  weight: number;
  impact: 'phishing' | 'safe';
}

export interface RocCurvePoint {
  fpr: number;
  tpr: number;
  threshold: number;
}
