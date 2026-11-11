# 🛡️ CyberSathi – AI-Based Cyber Fraud Detection and Awareness System

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1-black.svg)](https://flask.palletsprojects.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.9-orange.svg)](https://scikit-learn.org/)
[![Flutter](https://img.shields.io/badge/Flutter-3.0%2B-02569B.svg)](https://flutter.dev/)
[![Kotlin](https://img.shields.io/badge/Kotlin-Android_NotificationListener-7F52FF.svg)](https://kotlinlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**CyberSathi** is an intelligent, bilingual digital safety assistant specifically tailored for **students and senior citizens**. It bridges machine learning scam detection with accessible education, empowering users to identify suspicious SMS, WhatsApp messages, emails, and web links before financial loss occurs.

Unlike basic spam classifiers, CyberSathi blends **Natural Language Processing (NLP)**, **Voting Ensemble Machine Learning**, **heuristic URL risk profiling**, **Android Notification Protection**, and **voice-assisted Senior Citizen Mode** with dedicated support in both **English and Kannada (ಕನ್ನಡ)**.

---

## 🌟 Key Capabilities

1. **AI Message Scam Analyzer**:
   - Analyzes pasted SMS, WhatsApp messages, or emails using TF-IDF + a Voting Ensemble model (Multinomial Naive Bayes, Logistic Regression, Support Vector Machine).
   - Classifies messages into three distinct risk tiers: **Safe-looking**, **Suspicious**, or **High Risk**.
   - Extracts specific warning indicators (urgency threats, credential theft, APK requests, UPI collection traps, fake lottery).
   - Generates actionable safety recommendations and advisory disclaimers.

2. **Heuristic URL Risk Analyzer**:
   - Inspects suspicious links for structural red flags: missing HTTPS encryption, raw IP address hostnames, `@` symbol obscurity tricks, excessive length, high-abuse top-level domains (`.xyz`, `.top`, `.tk`), and deceptive brand typosquatting (e.g. `sbi-kyc-verify.com`).

3. **Android Notification Protection Service**:
   - Built on Kotlin's native `NotificationListenerService`.
   - Safely captures incoming SMS, WhatsApp, and banking notifications with explicit user permission.
   - Allows users to scan incoming alerts against the ML backend with an instant warning popup when danger is identified.
   - Strict privacy guarantees: operates on device, zero access to private message databases, and instant disable toggle.

4. **Senior Citizen Mode**:
   - High-contrast, large-button interface (minimum 64px tap targets, 20pt+ typography).
   - Built-in **Voice Read-Aloud (Text-To-Speech)** to speak out safety advice and risk warnings.
   - One-tap access to the **National Cyber Crime Helpline (1930)**.
   - Simple 3 golden safety rules written in non-technical language.

5. **Bilingual Localization (English & Kannada - ಕನ್ನಡ)**:
   - Full user interface, warning indicators, learning modules, and quizzes localized into English and Kannada.
   - Clean, modular architecture for easy expansion to Hindi, Tamil, Telugu, and other Indian languages.

6. **Interactive Cyber Safety Learning Hub**:
   - In-depth, practical breakdowns of 7 prevalent scam vectors in India:
     1. OTP & PIN Credential Theft
     2. UPI & QR Code Traps (Receiving money never requires entering a PIN)
     3. Phishing Links & Clone Portals
     4. Fake KYC & Account Suspension Urgency
     5. Part-Time Work-From-Home / Telegram Task Scams
     6. Courier & India Post Delivery Fee Scams
     7. Digital Arrest & Fake Police / CBI Interrogation

7. **Interactive Awareness Quiz**:
   - Scenario-based quiz questions with instant scoring, feedback, and educational explanations.

8. **Feedback & Misclassification Reporting**:
   - Built-in reporting mechanism for false positives and false negatives stored in SQLite.
   - Clear policy: unverified submissions are queued for human review and **not** automatically retrained into production models.

---

## 📐 System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CYBERSATHI CLIENT                               │
├──────────────────────────────────────┬──────────────────────────────────────┤
│        Flutter Mobile App            │       Interactive Web Console        │
│   (Android Kotlin Service + Dart)    │          (HTML5 / CSS / JS)          │
│                                      │                                      │
│  - Message Analyzer Screen           │  - Browser-based message tester      │
│  - URL Risk Analyzer Screen          │  - URL inspection tool               │
│  - Senior Citizen Mode (TTS + 1930)  │  - Comparative ML Metrics Table      │
│  - Android NotificationListener      │  - System Statistics & Feedback      │
│  - Learning Hub & Quizzes            │                                      │
│  - Kannada & English Localization    │                                      │
└──────────────────┬───────────────────┴───────────────────┬──────────────────┘
                   │                                       │
                   │ RESTful JSON API                      │
                   ▼                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CYBERSATHI FLASK BACKEND                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  REST Endpoints:                                                            │
│    POST /analyze-message  ──► NLP Preprocessing & Voting Ensemble           │
│    POST /analyze-url      ──► URL Structural Heuristics & Brand Checker     │
│    POST /feedback         ──► SQLite Feedback Audit Store                   │
│    GET  /stats            ──► Aggregated System Counts                      │
│    GET  /model-metrics    ──► MNB vs LR vs SVM vs Ensemble Benchmarks       │
│    GET  /health           ──► System Health & Operational Status            │
├─────────────────────────────────────────────────────────────────────────────┤
│  ML & NLP Pipeline:                                                         │
│    - Text Normalization (URL/Phone/Currency tokens)                         │
│    - Custom Stop Words Filtering (Preserving critical security terms)       │
│    - WordNet Lemmatization                                                  │
│    - Dual Feature Extraction: TF-IDF & Bag-of-Words (CountVectorizer)       │
│    - Evaluated Models: MultinomialNB, Logistic Regression, Linear SVM       │
│    - Production Predictor: Soft-Voting Ensemble (MNB + LR + SVM)            │
├─────────────────────────────────────────────────────────────────────────────┤
│  SQLite Database:                                                           │
│    - feedback (id, message_text, reported_label, feedback_type, comments)   │
│    - message_analyses (input_text, prediction, risk_level, confidence)      │
│    - url_analyses (url, risk_level, risk_score)                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔬 Machine Learning Evaluation & Results

Our pipeline preprocesses raw messages and trains classifiers across both **TF-IDF** and **Bag-of-Words (BoW)** representations:

| Feature Engine | Model | Accuracy | Precision | Recall | F1-Score |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **TF-IDF** | Multinomial Naive Bayes | 75.00% | 66.67% | **100.00%** | 0.8000 |
| **TF-IDF** | Logistic Regression | 68.75% | 61.54% | **100.00%** | 0.7619 |
| **TF-IDF** | Support Vector Machine (Linear) | **87.50%** | **80.00%** | **100.00%** | **0.8889** |
| **TF-IDF** | **Voting Ensemble (MNB + LR + SVM)** | **87.50%** | **80.00%** | **100.00%** | **0.8889** |
| **Bag-of-Words** | Logistic Regression | 93.75% | 100.00% | 87.50% | 0.9333 |
| **Bag-of-Words** | Multinomial Naive Bayes | 81.25% | 72.73% | 100.00% | 0.8421 |
| **Bag-of-Words** | Support Vector Machine | 87.50% | 100.00% | 75.00% | 0.8571 |

> [!NOTE]
> The **Voting Ensemble (MNB + LR + SVM)** on TF-IDF was selected for production because it achieves **100% recall on fraud samples** in evaluation testing—ensuring malicious messages are not missed (minimizing false negatives)—while leveraging probabilistic confidence blending.

### Ethical ML Principles:
- **No 100% Guarantee**: Predictions are presented as probabilistic risk scores.
- **Defense in Depth**: Machine learning predictions are combined with regex rule indicators and safety education.
- **Unverified Feedback Safety**: User feedback is logged into SQLite for human auditor validation and is **not** automatically retrained to prevent data poisoning.

---

## 📁 Repository Structure

```text
lecturer-main/
├── backend/
│   ├── app.py                      # Flask API endpoints & interactive web test console
│   ├── config.py                   # Configuration, ports, paths, risk thresholds
│   ├── requirements.txt            # Python dependencies (Flask, scikit-learn, nltk, etc.)
│   ├── database/
│   │   ├── __init__.py
│   │   ├── db.py                   # SQLite tables (feedback, analyses, statistics)
│   │   └── cybersathi.db           # SQLite database file
│   ├── ml/
│   │   ├── __init__.py
│   │   ├── preprocess.py           # NLP cleaning, tokenization, stop words, lemmatization
│   │   ├── dataset.py              # Labelled benchmark dataset (OTP, UPI, KYC, Job, Legitimate)
│   │   ├── train.py                # Comparative training (MNB, LR, SVM, Ensemble) & evaluation
│   │   ├── model.py                # Production prediction pipeline & warning indicator engine
│   │   └── models/
│   │       ├── cybersathi_ensemble_model.joblib
│   │       ├── cybersathi_vectorizer.joblib
│   │       ├── cybersathi_dataset.csv
│   │       └── model_evaluation_metrics.json
│   ├── url_analyzer/
│   │   ├── __init__.py
│   │   └── analyzer.py             # Heuristic URL analyzer (IP, @ symbol, TLD, length, brands)
│   └── tests/
│       ├── __init__.py
│       ├── test_api.py             # Flask API integration tests
│       ├── test_ml.py              # ML preprocessing and classifier tests
│       └── test_url.py             # URL heuristic risk tests
├── cybersathi_app/                 # Complete Flutter + Android Mobile App
│   ├── pubspec.yaml                # Flutter project specification
│   ├── android/
│   │   ├── app/
│   │   │   ├── build.gradle        # Android gradle configuration (SDK 34)
│   │   │   └── src/main/
│   │   │       ├── AndroidManifest.xml # Permissions & NotificationListenerService registration
│   │   │       └── kotlin/com/cybersathi/app/
│   │   │           ├── MainActivity.kt                  # MethodChannel bridge
│   │   │           └── CyberSathiNotificationListener.kt# Kotlin NotificationListenerService
│   ├── lib/
│   │   ├── main.dart               # MultiProvider application entry point
│   │   ├── config/
│   │   │   ├── api_config.dart     # Backend URLs & endpoints
│   │   │   └── theme.dart          # Standard and Senior Citizen High-Contrast themes
│   │   ├── l10n/
│   │   │   └── app_translations.dart# English and Kannada (ಕನ್ನಡ) translations
│   │   ├── models/
│   │   │   ├── message_analysis.dart
│   │   │   ├── url_analysis.dart
│   │   │   ├── learning_topic.dart
│   │   │   └── quiz_item.dart
│   │   ├── services/
│   │   │   ├── api_service.dart
│   │   │   ├── notification_service.dart
│   │   │   └── tts_service.dart
│   │   ├── providers/
│   │   │   └── app_state.dart
│   │   ├── widgets/
│   │   │   ├── risk_badge.dart
│   │   │   ├── indicator_card.dart
│   │   │   └── speech_button.dart
│   │   └── screens/
│   │       ├── home_screen.dart
│   │       ├── message_analyzer_screen.dart
│   │       ├── url_analyzer_screen.dart
│   │       ├── notification_monitor_screen.dart
│   │       ├── learning_hub_screen.dart
│   │       ├── quiz_screen.dart
│   │       ├── senior_citizen_screen.dart
│   │       └── feedback_screen.dart
├── run_backend.py                  # One-click backend startup script
└── README.md                       # Complete documentation and setup guide
```

---

## 🚀 Setup and Run Instructions

### 1. Prerequisites
- **Python 3.10+**
- **Flutter SDK 3.0+** (for building/running the mobile app)
- **Android Studio / Android SDK 34** (for Android APK & NotificationListenerService)
- **VS Code** (with Flutter and Python extensions)

---

### 2. Backend Setup & Startup

#### Step A: Open Terminal and Navigate to Project
```bash
cd /Users/aashwija/Downloads/lecturer-main
```

#### Step B: Activate Virtual Environment
```bash
source .venv/bin/activate
```
*(If setting up from scratch on a new machine: `python3 -m venv .venv && source .venv/bin/activate && pip install -r backend/requirements.txt`)*

#### Step C: Run Unit Tests
Verify all 20 tests pass:
```bash
python3 -m unittest discover backend/tests
```

#### Step D: Start the CyberSathi Backend
```bash
python3 run_backend.py
```
Output:
```text
============================================================
  🛡️  CyberSathi AI Backend Platform Starting...
  Host: 0.0.0.0:5050
  Web Test Console: http://127.0.0.1:5050
  API Docs / Health: http://127.0.0.1:5050/health
============================================================
 * Running on http://127.0.0.1:5050
```

> [!TIP]
> Open **http://127.0.0.1:5050** in your browser to immediately use the **Interactive Web Verification Console** to test message analysis, URL inspection, ML comparative metrics, and system statistics directly in any browser!

---

### 3. Running the Flutter Android Application

#### Step A: Open the Project in VS Code
Open `/Users/aashwija/Downloads/lecturer-main/cybersathi_app` in VS Code.

#### Step B: Fetch Flutter Dependencies
```bash
cd cybersathi_app
flutter pub get
```

#### Step C: Configure API URL (if testing on device)
- For the **Android Emulator**: The default `http://10.0.2.2:5050` in `lib/config/api_config.dart` connects directly to your computer's localhost.
- For a **Physical Android Device**: Update `baseUrl` in `lib/config/api_config.dart` to your computer's Wi-Fi LAN IP (e.g., `http://192.168.1.15:5050`).

#### Step D: Launch App
```bash
flutter run
```

---

### 4. Setting up Android Notification Protection

To enable live notification monitoring on an Android device:
1. Open the CyberSathi app.
2. Tap the **Notification Scam Guard** card on the dashboard.
3. Tap **Grant Notification Access**.
4. In the Android System Settings screen that opens, toggle **CyberSathi** to **Allowed**.
5. Return to the app. The shield icon will turn green: **"Notification Protection is ACTIVE"**.
6. When an incoming SMS or WhatsApp notification arrives, tap **"Scan with AI"** or **"Inspect"** to verify risk levels before clicking any links.

---

## 📡 REST API Reference

### 1. `POST /analyze-message`
Analyze message text for cyber fraud risk.

**Request:**
```bash
curl -X POST http://127.0.0.1:5050/analyze-message \
  -H "Content-Type: application/json" \
  -d '{"message": "URGENT: Your SBI account is blocked! Update PAN at http://sbi-kyc-verify.xyz"}'
```

**Response (HTTP 200):**
```json
{
  "text": "URGENT: Your SBI account is blocked! Update PAN at http://sbi-kyc-verify.xyz",
  "prediction": "fraud",
  "risk_level": "High Risk",
  "confidence_score": 0.8345,
  "raw_ml_fraud_prob": 0.8345,
  "warning_indicators": [
    {
      "id": "urgency_threat",
      "flag": "High urgency or fear-inducing threats (e.g., account blocked, power cutoff, legal arrest)",
      "severity": "high",
      "advice": "Scammers manufacture artificial panic to force hasty decisions. Take a breath and verify independently."
    },
    {
      "id": "suspicious_link",
      "flag": "Contains unverified web link or download URL",
      "severity": "medium",
      "advice": "Do not tap on unverified links or install unknown .apk files sent via SMS/WhatsApp."
    }
  ],
  "recommendations": [
    "DO NOT click any links, open attachments, or download files from this message.",
    "NEVER share any OTP, UPI PIN, ATM PIN, or banking passwords with anyone.",
    "If money has already been deducted, immediately call the National Cyber Crime Helpline at 1930."
  ],
  "disclaimer": "CyberSathi AI analysis provides probabilistic risk indicators based on trained patterns. Predictions are not 100% guaranteed. Always independently verify suspicious communications with official authorities or contact the National Cyber Crime Helpline (1930)."
}
```

---

### 2. `POST /analyze-url`
Inspect web URL for phishing and deceptive structural indicators.

**Request:**
```bash
curl -X POST http://127.0.0.1:5050/analyze-url \
  -H "Content-Type: application/json" \
  -d '{"url": "http://192.168.1.105/sbi-netbanking-login.php"}'
```

**Response (HTTP 200):**
```json
{
  "url": "http://192.168.1.105/sbi-netbanking-login.php",
  "risk_level": "High Risk",
  "risk_score": 0.95,
  "indicator_count": 3,
  "warning_indicators": [
    {
      "code": "INSECURE_HTTP",
      "flag": "Missing HTTPS Encryption (Insecure HTTP)",
      "severity": "medium",
      "description": "Communications over standard HTTP are transmitted in plaintext."
    },
    {
      "code": "IP_HOSTNAME",
      "flag": "IP-Based Hostname Instead of Domain Name",
      "severity": "high",
      "description": "Using raw IP addresses is common in phishing servers."
    },
    {
      "code": "BRAND_IMPERSONATION",
      "flag": "Combines Brand Names (sbi) with Action Triggers (login)",
      "severity": "high",
      "description": "High probability of deceptive brand impersonation targeting banking credentials."
    }
  ],
  "note": "These are heuristic risk indicators, not definitive proof of fraud."
}
```

---

### 3. `POST /feedback`
Record user feedback for misclassified messages.

**Request:**
```bash
curl -X POST http://127.0.0.1:5050/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "message_text": "Sample legitimate notification from college",
    "predicted_label": "High Risk",
    "reported_label": "legitimate",
    "feedback_type": "False Positive",
    "comments": "This was an official notification from college principal."
  }'
```

**Response (HTTP 201):**
```json
{
  "status": "success",
  "feedback_id": 1,
  "message": "Feedback recorded successfully. Submissions are queued for human review and not auto-retrained."
}
```

---

### 4. `GET /stats`
Retrieve aggregated analysis metrics and audit logs.

**Response (HTTP 200):**
```json
{
  "total_messages_analyzed": 14,
  "total_urls_analyzed": 8,
  "total_feedback_reports": 2,
  "risk_breakdown": {
    "High Risk": 9,
    "Safe-looking": 4,
    "Suspicious": 1
  }
}
```

---

### 5. `GET /model-metrics`
Returns comparative evaluation metrics (accuracy, precision, recall, F1, confusion matrix) for all models trained on both TF-IDF and Bag-of-Words.

---

## 📚 Expanding with Larger Datasets

The dataset loader in `backend/ml/dataset.py` can be extended with external datasets (such as the *UCI SMS Spam Collection*, *Kaggle Phishing Datasets*, or *CERT-In advisories*).

To add an external CSV dataset:
1. Place your CSV in `backend/ml/models/custom_dataset.csv` with columns: `text` and `label` (0 = legitimate, 1 = fraud).
2. Re-train models:
```bash
python3 -m backend.ml.train
```
The script will retrain all models, regenerate the comparative evaluation metrics JSON, and update the production ensemble model.

---

## ⚖️ Advisory & Legal Disclaimer

CyberSathi is an educational and decision-support tool. Machine learning predictions are probabilistic evaluations of language patterns and cannot guarantee 100% accuracy. If you suspect an unauthorized transaction has occurred:
1. Immediately contact your bank to freeze debit/credit cards and net banking.
2. Dial the **National Cyber Crime Helpline at 1930** (operated by the Ministry of Home Affairs, Government of India).
3. File a formal complaint at the official portal: **[https://cybercrime.gov.in](https://cybercrime.gov.in)**.
