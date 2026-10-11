"""
Phishing Email Detection Flask Web Application
==============================================
Production-ready, lightweight web scanner for cybersecurity students.

Features:
- Live inference with trained Scikit-Learn pipeline
- Heuristic threat and URL analysis
- Strict Zero-Retention Privacy: Submitted emails are evaluated in memory and discarded
- Safety Warning: 'Safe' predictions do NOT guarantee harmlessness
"""

import os
import re
from urllib.parse import urlparse
from flask import Flask, jsonify, render_template, request
import joblib

app = Flask(__name__)

# Paths to trained model files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
VEC_PATH = os.path.join(MODEL_DIR, "vectorizer.joblib")
MODEL_PATH = os.path.join(MODEL_DIR, "phishing_model.joblib")

vectorizer = None
model = None

# Load models if pre-trained, otherwise provide fallback instructions
def load_artifacts():
    global vectorizer, model
    if os.path.exists(VEC_PATH) and os.path.exists(MODEL_PATH):
        try:
            vectorizer = joblib.load(VEC_PATH)
            model = joblib.load(MODEL_PATH)
            print("[+] Successfully loaded trained Scikit-Learn models.")
        except Exception as e:
            print(f"[!] Error loading models: {e}")
    else:
        print("[!] Note: Model files not found. Run 'python train_model.py' first.")

load_artifacts()

# Suspicious keywords and URL heuristics
SUSPICIOUS_KEYWORDS = [
    "urgent", "immediately", "action required", "password", "suspended",
    "expire", "credentials", "verify", "social security", "ssn", "gift card",
    "wire transfer", "direct deposit", "unauthorized", "dispute", "quota"
]

SUSPICIOUS_TLDS = [".xyz", ".top", ".info", ".cc", ".biz", ".club", ".buzz", ".work"]


def extract_url_heuristics(text):
    url_pattern = r"(https?://[^\s\"'<>]+)"
    found_urls = re.findall(url_pattern, text)
    flags = []
    suspicious_count = 0

    for raw_url in found_urls:
        clean_url = raw_url.rstrip(".,;:)")
        try:
            parsed = urlparse(clean_url)
            domain = parsed.netloc.lower()

            if any(domain.endswith(tld) for tld in SUSPICIOUS_TLDS):
                flags.append(f"Suspicious high-risk TLD detected: {domain}")
                suspicious_count += 1
            if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", domain):
                flags.append(f"Direct IP address used instead of domain: {domain}")
                suspicious_count += 1
            if clean_url.startswith("http://"):
                flags.append(f"Insecure HTTP link: {domain}")
        except Exception:
            continue

    return flags, len(found_urls), suspicious_count


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    """
    Scans submitted email in-memory without persistent storage.
    """
    global vectorizer, model

    data = request.get_json(silent=True) or request.form
    subject = data.get("subject", "").strip()
    body = data.get("body", "").strip()

    if not body and not subject:
        return jsonify({"error": "Please provide an email subject or body to analyze."}), 400

    combined_text = f"{subject} {body}"

    # Analyze suspicious keywords
    lower_text = combined_text.lower()
    matched_keywords = [kw for kw in SUSPICIOUS_KEYWORDS if kw in lower_text]
    url_flags, total_urls, suspicious_urls = extract_url_heuristics(combined_text)

    # If models are not trained yet, attempt to train on the fly or provide heuristic scoring
    if vectorizer is None or model is None:
        load_artifacts()

    if vectorizer is not None and model is not None:
        X_vec = vectorizer.transform([combined_text])
        probabilities = model.predict_proba(X_vec)[0]
        # Class 1 = Phishing, Class 0 = Safe
        phishing_prob = float(probabilities[1])
    else:
        # Heuristic fallback if student ran app.py before train_model.py
        heuristic_score = min(1.0, (len(matched_keywords) * 0.18) + (suspicious_urls * 0.25))
        phishing_prob = heuristic_score

    # Adjust probability slightly if severe URL or credential threats detected
    if suspicious_urls > 0 or ("password" in lower_text and "urgent" in lower_text):
        phishing_prob = min(0.99, phishing_prob + 0.12)

    safe_prob = round(1.0 - phishing_prob, 3)
    phishing_prob = round(phishing_prob, 3)

    is_phishing = phishing_prob >= 0.5
    prediction = "Phishing" if is_phishing else "Safe"
    risk_score = int(phishing_prob * 100)

    # Security Recommendations
    recommendations = []
    if is_phishing:
        recommendations.append("Do NOT click links, download attachments, or reply to this email.")
        recommendations.append("Report this message to your company's IT security team or mark as phishing.")
        recommendations.append("If this email claims to be from a colleague or executive, verify via phone call or direct chat.")
    else:
        recommendations.append("IMPORTANT DISCLAIMER: A 'Safe' prediction does not guarantee an email is harmless.")
        recommendations.append("Always verify sender email addresses carefully and exercise caution with unexpected attachments.")

    response_data = {
        "prediction": prediction,
        "is_phishing": is_phishing,
        "phishing_probability": phishing_prob,
        "safe_probability": safe_prob,
        "risk_score": risk_score,
        "matched_keywords": matched_keywords[:8],
        "url_flags": url_flags,
        "total_urls": total_urls,
        "recommendations": recommendations,
        "privacy_notice": "Strict Zero-Retention: This email was analyzed in-memory and has not been stored."
    }

    return jsonify(response_data)


if __name__ == "__main__":
    print("[*] Starting PhishShield Flask Server on http://127.0.0.1:5000 ...")
    app.run(debug=True, host="0.0.0.0", port=5000)
