# PhishShield ML: Phishing Email Detection System Using Machine Learning

A complete, beginner-friendly cybersecurity mini-project demonstrating how to detect phishing emails and distinguish them from legitimate workplace communications using Python, Scikit-Learn, and Flask.

---

## 📌 Project Overview

This project implements an end-to-end Machine Learning security pipeline:
1. **Curated Labelled Dataset (`dataset.csv`)**: 30 diverse, real-world email samples covering credential harvesting, Business Email Compromise (BEC), fake invoices, delivery scams, and legitimate workplace messages.
2. **Feature Extraction**: TF-IDF (Term Frequency-Inverse Document Frequency) vectorizer with n-grams (unigrams and bigrams) and English stop-word filtering.
3. **Data Leakage Prevention**: Stratified train/test split (80% train, 20% test). The vectorizer is fitted strictly on training data.
4. **Machine Learning Classifiers**:
   - **Logistic Regression**: Linear decision boundary with high interpretability and probabilistic calibration.
   - **Multinomial Naive Bayes**: Probabilistic baseline using Bayes' theorem with Laplace smoothing ($\alpha=1.0$).
5. **Model Evaluation**: Calculation of Accuracy, Precision, Recall, F1-Score, and generation of a Confusion Matrix heatmap (`confusion_matrix.png`).
6. **Interactive Flask Web Application**: Clean dashboard with in-memory email scanning, real-time probability readout, risk score, detected red-flags, and actionable defense recommendations.
7. **Zero-Retention Privacy**: Submitted email texts are parsed in-memory and discarded immediately; user data is never stored on disk or databases.

---

## ⚠️ Important Cybersecurity Disclaimer

> **Critical Security Notice:** Machine learning classifications are probabilistic estimates based on observed textual patterns. **A "Safe" prediction does NOT guarantee that an email is harmless.** Sophisticated spear-phishing campaigns, zero-day lures, or compromised executive accounts can bypass keyword filters. Always follow strict security hygiene and verify unusual requests out-of-band.

---

## 📁 Project Folder Structure

```
python_project/
├── dataset.csv               # Labelled email dataset (id, sender, subject, body, label)
├── requirements.txt          # Python library dependencies
├── train_model.py            # Model training & evaluation pipeline script
├── app.py                    # Flask web application server
├── confusion_matrix.png      # Generated evaluation confusion matrix plot (after training)
├── models/                   # Saved serialized models (created by train_model.py)
│   ├── vectorizer.joblib     # Fitted TF-IDF vectorizer
│   └── phishing_model.joblib # Trained Logistic Regression model
├── templates/
│   └── index.html            # Flask HTML user interface
└── static/
    ├── style.css             # Cyber-defense UI stylesheet
    └── script.js             # Client-side scanner logic & API interaction
```

---

## 🚀 Step-by-Step Local Setup & Execution Guide

### Step 1: Clone or Open the Project
Open a terminal in the `python_project/` directory:
```bash
cd python_project
```

### Step 2: Create a Python Virtual Environment
Creating an isolated environment keeps dependencies tidy:
```bash
# On macOS / Linux:
python3 -m venv venv
source venv/bin/activate

# On Windows:
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Required Dependencies
Install Scikit-Learn, Pandas, NumPy, Flask, Matplotlib, and Joblib:
```bash
pip install -r requirements.txt
```

### Step 4: Train the Machine Learning Model
Execute the training script:
```bash
python train_model.py
```

**What happens during this step:**
- Reads `dataset.csv`
- Performs stratified 80/20 train/test split
- Fits the `TfidfVectorizer` exclusively on the training set
- Trains Multinomial Naive Bayes and Logistic Regression
- Evaluates metrics on the unseen test set
- Generates `confusion_matrix.png`
- Saves `models/vectorizer.joblib` and `models/phishing_model.joblib`

### Step 5: Run the Flask Web Application
Launch the local web server:
```bash
python app.py
```

Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 🧠 Key Machine Learning & Cybersecurity Concepts

### 1. What is TF-IDF?
TF-IDF measures how important a word is to an email in a collection. Words like *urgent*, *password*, and *suspension* appear frequently in phishing lures but rarely in benign project notes, earning higher discriminative weights.

### 2. Preventing Data Leakage
In machine learning, **data leakage** occurs when test data influences feature engineering or model training. If a vectorizer is fit on the whole dataset before splitting, the model inadvertently learns test set statistics. We prevent this by calling `.fit_transform()` only on `X_train` and `.transform()` on `X_test`.

### 3. Understanding the Confusion Matrix for Phishing
- **True Positive (TP)**: Phishing email correctly identified as Phishing.
- **True Negative (TN)**: Legitimate email correctly identified as Safe.
- **False Positive (FP)**: Legitimate email incorrectly flagged as Phishing (causes employee annoyance).
- **False Negative (FN)**: Phishing email incorrectly passed as Safe (**the most dangerous outcome in cybersecurity!**).

In cybersecurity, we typically optimize for **Recall** on the phishing class to minimize False Negatives.

---

## 🔒 Privacy & Data Handling Guarantee
- The application never writes submitted email bodies to any log file, file storage, or external database.
- The scan runs strictly in volatile RAM memory during HTTP request processing.
