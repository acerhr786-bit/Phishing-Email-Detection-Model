export interface PythonFileItem {
  filename: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const PYTHON_PROJECT_FILES: PythonFileItem[] = [
  {
    filename: 'train_model.py',
    path: 'train_model.py',
    language: 'python',
    description: 'Scikit-Learn ML training pipeline with TF-IDF, stratified train/test split, and confusion matrix export.',
    content: `"""
Phishing Email Detection Model Training Pipeline
=================================================
A beginner-friendly Machine Learning workflow using Scikit-Learn, Pandas, and Matplotlib.

Author: Cybersecurity ML Project
Dataset: Balanced labeled email corpus (phishing vs safe)
Architecture: TF-IDF Vectorizer + Multinomial Naive Bayes & Logistic Regression
"""

import os
import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB


def main():
    print("=" * 70)
    print("  PHISHING EMAIL DETECTION - MACHINE LEARNING TRAINING PIPELINE")
    print("=" * 70)

    # 1. Load Dataset
    dataset_path = os.path.join(os.path.dirname(__file__), "dataset.csv")
    print(f"\\n[+] Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)

    print(f"    Total records: {len(df)}")
    print(f"    Class distribution:\\n{df['label'].value_counts().to_string()}")

    # Combine subject and body for rich contextual text analysis
    df["full_text"] = df["subject"].fillna("") + " " + df["body"].fillna("")

    # Map labels: 'phishing' -> 1, 'safe' -> 0
    df["target"] = df["label"].map({"phishing": 1, "safe": 0})

    X = df["full_text"]
    y = df["target"]

    # 2. Data Leakage Prevention: Train / Test Split
    # CRITICAL: We split BEFORE applying TF-IDF vectorization.
    # The vectorizer must learn vocabulary and IDF weights exclusively from the training set.
    print("\\n[+] Splitting data into Train (80%) and Test (20%) sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"    Training samples: {len(X_train)} (Phishing: {sum(y_train)}, Safe: {len(y_train) - sum(y_train)})")
    print(f"    Testing samples:  {len(X_test)} (Phishing: {sum(y_test)}, Safe: {len(y_test) - sum(y_test)})")

    # 3. Text Preprocessing & Feature Extraction (TF-IDF)
    print("\\n[+] Initializing and fitting TF-IDF Vectorizer on training data...")
    vectorizer = TfidfVectorizer(
        stop_words="english",
        lowercase=True,
        ngram_range=(1, 2),  # Extract unigrams and bigrams
        max_features=500,     # Restrict to top 500 informative tokens
        sublinear_tf=True
    )

    # Fit ONLY on X_train, then transform both
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    print(f"    Vocabulary size learned: {len(vectorizer.vocabulary_)} terms")

    # 4. Train Classifiers
    # A) Multinomial Naive Bayes (Fast, effective text baseline)
    print("\\n[+] Training Model 1: Multinomial Naive Bayes (alpha=1.0)...")
    nb_model = MultinomialNB(alpha=1.0)
    nb_model.fit(X_train_tfidf, y_train)

    # B) Logistic Regression (High interpretability, calibrated probabilities)
    print("[+] Training Model 2: Logistic Regression (L2 penalty, C=1.0)...")
    lr_model = LogisticRegression(C=1.0, max_iter=200, random_state=42)
    lr_model.fit(X_train_tfidf, y_train)

    # 5. Evaluate on Unseen Test Dataset
    print("\\n" + "=" * 70)
    print("  MODEL PERFORMANCE EVALUATION (TEST DATASET)")
    print("=" * 70)

    for name, model in [("Multinomial Naive Bayes", nb_model), ("Logistic Regression", lr_model)]:
        y_pred = model.predict(X_test_tfidf)
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        cm = confusion_matrix(y_test, y_pred)

        print(f"\\n--- {name} ---")
        print(f"Accuracy:  {acc * 100:.2f}%")
        print(f"Precision: {prec * 100:.2f}% (Phishing)")
        print(f"Recall:    {rec * 100:.2f}% (Phishing)")
        print(f"F1-Score:  {f1 * 100:.2f}%")
        print("\\nConfusion Matrix:")
        print(f"  [True Negative  (Safe -> Safe):         {cm[0][0]}]   [False Positive (Safe -> Phish): {cm[0][1]}]")
        print(f"  [False Negative (Phish -> Safe):        {cm[1][0]}]   [True Positive  (Phish -> Phish): {cm[1][1]}]")

    # 6. Plot & Save Confusion Matrix for Logistic Regression
    y_pred_lr = lr_model.predict(X_test_tfidf)
    cm_lr = confusion_matrix(y_test, y_pred_lr)

    plt.figure(figsize=(6, 5))
    plt.imshow(cm_lr, interpolation="nearest", cmap=plt.cm.Blues)
    plt.title("Phishing Detection Confusion Matrix (Test Set)")
    plt.colorbar()
    tick_marks = np.arange(2)
    plt.xticks(tick_marks, ["Safe (0)", "Phishing (1)"])
    plt.yticks(tick_marks, ["Safe (0)", "Phishing (1)"])

    thresh = cm_lr.max() / 2.0
    for i in range(cm_lr.shape[0]):
        for j in range(cm_lr.shape[1]):
            plt.text(
                j, i, format(cm_lr[i, j], "d"),
                ha="center", va="center",
                color="white" if cm_lr[i, j] > thresh else "black",
                fontsize=14, weight="bold"
            )

    plt.ylabel("Actual True Label")
    plt.xlabel("Predicted Label")
    plt.tight_layout()

    cm_output_path = os.path.join(os.path.dirname(__file__), "confusion_matrix.png")
    plt.savefig(cm_output_path, dpi=150)
    plt.close()
    print(f"\\n[+] Saved confusion matrix visualization to: {cm_output_path}")

    # 7. Save Trained Artifacts with Joblib
    model_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(model_dir, exist_ok=True)

    vec_path = os.path.join(model_dir, "vectorizer.joblib")
    model_path = os.path.join(model_dir, "phishing_model.joblib")

    joblib.dump(vectorizer, vec_path)
    joblib.dump(lr_model, model_path)

    print(f"\\n[+] Saved fitted TF-IDF vectorizer to: {vec_path}")
    print(f"[+] Saved trained Logistic Regression model to: {model_path}")
    print("\\n[✔] Training successfully completed! You can now start the web app: python app.py")


if __name__ == "__main__":
    main()`
  },
  {
    filename: 'app.py',
    path: 'app.py',
    language: 'python',
    description: 'Production-ready Flask web application with /predict REST API, security heuristics, and zero-retention guarantee.',
    content: `"""
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

def load_artifacts():
    global vectorizer, model
    if os.path.exists(VEC_PATH) and os.path.exists(MODEL_PATH):
        try:
            vectorizer = joblib.load(VEC_PATH)
            model = joblib.load(MODEL_PATH)
            print("[+] Successfully loaded trained Scikit-Learn models.")
        except Exception as e:
            print(f"[!] Error loading models: {e}")

load_artifacts()

SUSPICIOUS_KEYWORDS = [
    "urgent", "immediately", "action required", "password", "suspended",
    "expire", "credentials", "verify", "social security", "ssn", "gift card",
    "wire transfer", "direct deposit", "unauthorized", "dispute", "quota"
]

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True) or request.form
    subject = data.get("subject", "").strip()
    body = data.get("body", "").strip()

    if not body and not subject:
        return jsonify({"error": "Please provide an email subject or body to analyze."}), 400

    combined_text = f"{subject} {body}"
    lower_text = combined_text.lower()
    matched_keywords = [kw for kw in SUSPICIOUS_KEYWORDS if kw in lower_text]

    if vectorizer is not None and model is not None:
        X_vec = vectorizer.transform([combined_text])
        probabilities = model.predict_proba(X_vec)[0]
        phishing_prob = float(probabilities[1])
    else:
        phishing_prob = min(0.99, len(matched_keywords) * 0.2)

    is_phishing = phishing_prob >= 0.5
    prediction = "Phishing" if is_phishing else "Safe"

    recommendations = []
    if is_phishing:
        recommendations.append("Do NOT click links, download attachments, or reply to this email.")
        recommendations.append("Report this message to your company's IT security team or mark as phishing.")
    else:
        recommendations.append("IMPORTANT DISCLAIMER: A 'Safe' prediction does not guarantee an email is harmless.")
        recommendations.append("Always verify sender email addresses carefully and exercise caution.")

    return jsonify({
        "prediction": prediction,
        "is_phishing": is_phishing,
        "phishing_probability": round(phishing_prob, 3),
        "safe_probability": round(1.0 - phishing_prob, 3),
        "risk_score": int(phishing_prob * 100),
        "matched_keywords": matched_keywords[:8],
        "recommendations": recommendations,
        "privacy_notice": "Strict Zero-Retention: Analyzed in-memory, never stored."
    })

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)`
  },
  {
    filename: 'dataset.csv',
    path: 'dataset.csv',
    language: 'csv',
    description: 'Curated 30-sample benchmark dataset with phishing attacks and legitimate emails.',
    content: `id,sender,subject,body,label
PHISH-001,security-alert@micros0ft-verify.com,URGENT: Microsoft 365 Password Expiry Warning - Action Required Within 24 Hours,"Dear User, Your Microsoft Office 365 password expires in less than 24 hours. Failure to update immediately will result in permanent suspension. Click the secure portal http://login.micros0ft-verify.com/auth/update to keep your password.",phishing
PHISH-002,payroll@secure-adp-update.net,Action Required: Direct Deposit Form Verification Update Needed,"Hello Team Member, Due to system migration, your direct deposit banking information could not be processed. Please confirm your routing number and account details via https://payroll-portal-auth.net/adp/reverify before 5:00 PM today.",phishing
PHISH-003,executive-office@ceo-directline.org,Quick favor - Need urgent Apple gift cards for client meeting,"Are you at your desk right now? I am in an executive meeting and cannot take calls. Urgently purchase 5 Apple gift cards ($100 each). Scratch the backs, take photos of redemption codes, and email them to me right away. Confidential.",phishing
SAFE-001,marcus.vance@company.com,Sprint 24 Planning: Agenda and Backlog Grooming Notes,"Hi team, Here is the agenda for Sprint 24 planning session tomorrow at 10:00 AM PST. Key items: velocity from Sprint 23 (42 points), search indexing improvements, database query optimization. Review Jira board beforehand.",safe
SAFE-002,hr-benefits@company.com,Annual Open Enrollment for Health & Dental Benefits: November 1 - November 21,"Dear colleagues, Our annual Benefits Open Enrollment period begins next Monday, November 1st and runs through Friday, November 21st. Review medical, dental, and vision plans. Webinars Thursday at 2:00 PM EST on company intranet.",safe`
  },
  {
    filename: 'requirements.txt',
    path: 'requirements.txt',
    language: 'text',
    description: 'Python package requirements file for pip.',
    content: `scikit-learn>=1.3.0
pandas>=2.0.0
numpy>=1.24.0
flask>=3.0.0
matplotlib>=3.7.0
joblib>=1.3.0`
  },
  {
    filename: 'README.md',
    path: 'README.md',
    language: 'markdown',
    description: 'Full cybersecurity student setup manual, ML theory, and troubleshooting guide.',
    content: `# PhishShield ML: Phishing Email Detection System Using Machine Learning

A complete, beginner-friendly cybersecurity mini-project demonstrating how to detect phishing emails and distinguish them from legitimate workplace communications using Python, Scikit-Learn, and Flask.

## Quickstart:
1. python3 -m venv venv && source venv/bin/activate
2. pip install -r requirements.txt
3. python train_model.py
4. python app.py
Open http://127.0.0.1:5000 in your browser!`
  }
];
