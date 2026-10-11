"""
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
    print(f"\n[+] Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)

    print(f"    Total records: {len(df)}")
    print(f"    Class distribution:\n{df['label'].value_counts().to_string()}")

    # Combine subject and body for rich contextual text analysis
    df["full_text"] = df["subject"].fillna("") + " " + df["body"].fillna("")

    # Map labels: 'phishing' -> 1, 'safe' -> 0
    df["target"] = df["label"].map({"phishing": 1, "safe": 0})

    X = df["full_text"]
    y = df["target"]

    # 2. Data Leakage Prevention: Train / Test Split
    # CRITICAL: We split BEFORE applying TF-IDF vectorization.
    # The vectorizer must learn vocabulary and IDF weights exclusively from the training set.
    print("\n[+] Splitting data into Train (80%) and Test (20%) sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"    Training samples: {len(X_train)} (Phishing: {sum(y_train)}, Safe: {len(y_train) - sum(y_train)})")
    print(f"    Testing samples:  {len(X_test)} (Phishing: {sum(y_test)}, Safe: {len(y_test) - sum(y_test)})")

    # 3. Text Preprocessing & Feature Extraction (TF-IDF)
    print("\n[+] Initializing and fitting TF-IDF Vectorizer on training data...")
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
    print("\n[+] Training Model 1: Multinomial Naive Bayes (alpha=1.0)...")
    nb_model = MultinomialNB(alpha=1.0)
    nb_model.fit(X_train_tfidf, y_train)

    # B) Logistic Regression (High interpretability, calibrated probabilities)
    print("[+] Training Model 2: Logistic Regression (L2 penalty, C=1.0)...")
    lr_model = LogisticRegression(C=1.0, max_iter=200, random_state=42)
    lr_model.fit(X_train_tfidf, y_train)

    # 5. Evaluate on Unseen Test Dataset
    print("\n" + "=" * 70)
    print("  MODEL PERFORMANCE EVALUATION (TEST DATASET)")
    print("=" * 70)

    for name, model in [("Multinomial Naive Bayes", nb_model), ("Logistic Regression", lr_model)]:
        y_pred = model.predict(X_test_tfidf)
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        cm = confusion_matrix(y_test, y_pred)

        print(f"\n--- {name} ---")
        print(f"Accuracy:  {acc * 100:.2f}%")
        print(f"Precision: {prec * 100:.2f}% (Phishing)")
        print(f"Recall:    {rec * 100:.2f}% (Phishing)")
        print(f"F1-Score:  {f1 * 100:.2f}%")
        print("\nConfusion Matrix:")
        print(f"  [True Negative  (Safe -> Safe):         {cm[0][0]}]   [False Positive (Safe -> Phish): {cm[0][1]}]")
        print(f"  [False Negative (Phish -> Safe):        {cm[1][0]}]   [True Positive  (Phish -> Phish): {cm[1][1]}]")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred, target_names=["Safe", "Phishing"], zero_division=0))

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
    print(f"\n[+] Saved confusion matrix visualization to: {cm_output_path}")

    # 7. Inspect Most Informative Phishing Keywords
    feature_names = np.array(vectorizer.get_feature_names_out())
    coefs = lr_model.coef_[0]
    top_phish_idx = coefs.argsort()[-10:][::-1]
    top_safe_idx = coefs.argsort()[:10]

    print("\n[+] Top 10 Phishing Indicator Words (Highest Positive Coefficients):")
    for idx in top_phish_idx:
        print(f"    - {feature_names[idx]}: +{coefs[idx]:.4f}")

    print("\n[+] Top 10 Safe Indicator Words (Highest Negative Coefficients):")
    for idx in top_safe_idx:
        print(f"    - {feature_names[idx]}: {coefs[idx]:.4f}")

    # 8. Save Trained Artifacts with Joblib
    model_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(model_dir, exist_ok=True)

    vec_path = os.path.join(model_dir, "vectorizer.joblib")
    model_path = os.path.join(model_dir, "phishing_model.joblib")

    joblib.dump(vectorizer, vec_path)
    joblib.dump(lr_model, model_path)

    print(f"\n[+] Saved fitted TF-IDF vectorizer to: {vec_path}")
    print(f"[+] Saved trained Logistic Regression model to: {model_path}")
    print("\n[✔] Training successfully completed! You can now start the web app: python app.py")


if __name__ == "__main__":
    main()
