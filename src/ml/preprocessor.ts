import { ExtractedUrl, SuspiciousIndicator } from '../types/ml';

export const ENGLISH_STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'cannot', 'could', 'couldn', 'did', 'didn', 'do', 'does', 'doesn', 'doing', 'don', 'down',
  'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn', 'has', 'hasn', 'have', 'haven',
  'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in',
  'into', 'is', 'isn', 'it', 'its', 'itself', 'just', 'll', 'm', 'me', 'might', 'more', 'most', 'must',
  'my', 'myself', 'no', 'nor', 'not', 'now', 'o', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'our', 'ours', 'ourselves', 'out', 'over', 'own', 're', 's', 'same', 'she', 'should', 'so', 'some',
  'such', 't', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there',
  'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was',
  'wasn', 'we', 'were', 'weren', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why',
  'will', 'with', 'won', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

export const URGENCY_TRIGGERS = [
  'immediately', 'urgent', 'action required', 'suspended', '24 hours', '48 hours', '12 hours',
  'expires', 'termination', 'critical', 'warning', 'held', 'withheld', 'dispute', 'unauthorized',
  'restricted', 'deactivated', 'quota exceeded', 'bounced', 'deadline', 'right now', 'confidential'
];

export const SENSITIVE_REQUEST_TRIGGERS = [
  'password', 'credentials', 'social security', 'ssn', 'pin', 'routing number', 'bank account',
  'gift card', 'redemption code', 'wire transfer', 'scratch the back', 'direct deposit', 'credit card',
  'verify identity', 'confirm details', 'form 1040', 'tax refund'
];

export const IMPERSONATION_TARGETS = [
  'microsoft', 'office 365', 'paypal', 'chase', 'bank of america', 'amazon', 'dhl', 'fedex',
  'ups', 'netflix', 'dropbox', 'irs', 'zoom', 'linkedin', 'apple'
];

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !ENGLISH_STOP_WORDS.has(token) && !/^\d+$/.test(token));
}

export function extractNgrams(tokens: string[], n: number = 2): string[] {
  const ngrams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(' '));
  }
  return ngrams;
}

export function extractUrls(text: string): ExtractedUrl[] {
  const urlRegex = /(https?:\/\/[^\s"'<>]+)/gi;
  const matches = text.match(urlRegex) || [];
  const results: ExtractedUrl[] = [];

  for (const rawUrl of matches) {
    try {
      const cleanUrl = rawUrl.replace(/[.,;:)\]]+$/, '');
      const parsed = new URL(cleanUrl);
      const domain = parsed.hostname.toLowerCase();
      
      let isSuspicious = false;
      let reason = '';

      // Check heuristics
      const suspiciousTlds = ['.xyz', '.top', '.info', '.cc', '.biz', '.club', '.buzz', '.work'];
      const hasSuspiciousTld = suspiciousTlds.some(tld => domain.endsWith(tld));
      const hasIpAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain);
      const hasLookalikeTarget = IMPERSONATION_TARGETS.some(target => {
        // e.g. micros0ft or paypal-login
        const targetClean = target.replace(/\s+/g, '');
        return domain.includes(targetClean) && !domain.endsWith(`.${targetClean}.com`) && domain !== `${targetClean}.com`;
      });
      const hasExcessiveHyphens = (domain.match(/-/g) || []).length >= 2;
      const isHttpOnly = cleanUrl.startsWith('http://');

      if (hasLookalikeTarget) {
        isSuspicious = true;
        reason = `Lookalike brand impersonation domain (${domain})`;
      } else if (hasIpAddress) {
        isSuspicious = true;
        reason = 'Direct IP address destination instead of validated hostname';
      } else if (hasSuspiciousTld) {
        isSuspicious = true;
        reason = `High-risk top-level domain (${domain.slice(domain.lastIndexOf('.'))})`;
      } else if (hasExcessiveHyphens) {
        isSuspicious = true;
        reason = 'Excessive hyphens common in deceptive redirect domains';
      } else if (isHttpOnly) {
        isSuspicious = true;
        reason = 'Unencrypted HTTP transport protocol for sensitive link';
      }

      results.push({
        url: cleanUrl,
        domain,
        isSuspicious,
        reason: reason || undefined
      });
    } catch {
      results.push({
        url: rawUrl,
        domain: rawUrl,
        isSuspicious: true,
        reason: 'Malformed URL structure'
      });
    }
  }

  return results;
}

export function calculateEntropy(str: string): number {
  if (!str || str.length === 0) return 0;
  const frequencies = new Map<string, number>();
  for (const char of str) {
    frequencies.set(char, (frequencies.get(char) || 0) + 1);
  }
  let entropy = 0;
  for (const count of frequencies.values()) {
    const p = count / str.length;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(3));
}

export function detectSuspiciousIndicators(subject: string, body: string, sender: string): {
  indicators: SuspiciousIndicator[];
  extractedUrls: ExtractedUrl[];
} {
  const combined = `${subject}\n${body}`.toLowerCase();
  const indicators: SuspiciousIndicator[] = [];
  const extractedUrls = extractUrls(`${subject} ${body}`);

  // 1. Urgency / Psychological pressure
  const matchedUrgency = URGENCY_TRIGGERS.filter(trigger => combined.includes(trigger));
  if (matchedUrgency.length > 0) {
    indicators.push({
      type: 'urgency',
      title: 'Artificial Time Pressure & Fear Appeal',
      description: `Detected ${matchedUrgency.length} urgent pressure triggers designed to prompt hasty decision-making.`,
      severity: matchedUrgency.length >= 2 ? 'high' : 'medium',
      matches: matchedUrgency.slice(0, 5)
    });
  }

  // 2. Sensitive credential / financial requests
  const matchedSensitive = SENSITIVE_REQUEST_TRIGGERS.filter(trigger => combined.includes(trigger));
  if (matchedSensitive.length > 0) {
    indicators.push({
      type: 'sensitive_request',
      title: 'High-Value Credential or Asset Solicitation',
      description: `Email solicits sensitive credentials, banking data, or untraceable payments.`,
      severity: 'high',
      matches: matchedSensitive.slice(0, 5)
    });
  }

  // 3. Suspicious URLs
  const suspiciousUrls = extractedUrls.filter(u => u.isSuspicious);
  if (suspiciousUrls.length > 0) {
    indicators.push({
      type: 'url',
      title: 'Deceptive or Unverified External Links',
      description: `Found ${suspiciousUrls.length} link(s) exhibiting phishing red flags (lookalike domains, insecure HTTP, or high-risk TLDs).`,
      severity: 'high',
      matches: suspiciousUrls.map(u => u.domain)
    });
  }

  // 4. Sender Spoofing / Lookalike Check
  const senderDomain = sender.split('@')[1]?.toLowerCase() || '';
  const impersonatedBrand = IMPERSONATION_TARGETS.find(target => {
    const cleanTarget = target.replace(/\s+/g, '');
    return (senderDomain.includes(cleanTarget) && !senderDomain.endsWith(`${cleanTarget}.com`)) ||
           (combined.includes(target) && !senderDomain.includes(cleanTarget) && senderDomain !== '');
  });

  if (impersonatedBrand && senderDomain) {
    indicators.push({
      type: 'impersonation',
      title: 'Sender Identity / Brand Mismatch',
      description: `Email claims representation of '${impersonatedBrand}' but is sent from unrelated domain '@${senderDomain}'.`,
      severity: 'high',
      matches: [`@${senderDomain}`]
    });
  }

  // 5. Excessive Uppercase / Screaming Subject
  const uppercaseLetters = (subject.match(/[A-Z]/g) || []).length;
  const totalLetters = (subject.match(/[a-zA-Z]/g) || []).length;
  if (totalLetters > 10 && (uppercaseLetters / totalLetters) > 0.45) {
    indicators.push({
      type: 'grammatical',
      title: 'Aggressive Uppercase Formatting',
      description: 'Subject line contains disproportionately high uppercase lettering often seen in spam and extortion lures.',
      severity: 'low',
      matches: [`${Math.round((uppercaseLetters / totalLetters) * 100)}% Uppercase`]
    });
  }

  return { indicators, extractedUrls };
}

export function generateSecurityRecommendations(
  predictedClass: 'phishing' | 'safe',
  indicators: SuspiciousIndicator[],
  extractedUrls: ExtractedUrl[]
): string[] {
  const recommendations: string[] = [];

  if (predictedClass === 'phishing') {
    recommendations.push('Do NOT click any hyperlinks or open attachments contained in this email.');
    recommendations.push('Forward this message as an attachment (.eml) to your organization\'s Security Operations Center (SOC) or IT Security desk.');
    
    if (indicators.some(i => i.type === 'sensitive_request')) {
      recommendations.push('Never enter passwords, PINs, or financial details into web pages opened from an unsolicited email link.');
    }
    
    if (indicators.some(i => i.type === 'urgency')) {
      recommendations.push('Verify high-urgency requests through an out-of-band channel (e.g., call the sender using a verified internal phone number, not the phone number in the email).');
    }

    if (extractedUrls.length > 0) {
      recommendations.push('Inspect the actual hyperlink destination by hovering over links without clicking, verifying the full root domain against official portals.');
    }
    
    recommendations.push('Mark as Spam / Phishing in your email client to update inbound spam filters.');
  } else {
    recommendations.push('While classified as SAFE by the statistical model, always maintain zero-trust vigilance against targeted spear phishing.');
    recommendations.push('Confirm that any requested actions align with normal business workflows and established communication protocols.');
    recommendations.push('Inspect any external links before clicking, especially if the message touches financial approvals or account settings.');
    recommendations.push('Remember: Machine learning classifications indicate probabilistic likelihood, not an absolute guarantee of safety.');
  }

  return recommendations;
}
