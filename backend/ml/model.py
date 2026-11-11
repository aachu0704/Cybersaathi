import re
import joblib
from pathlib import Path
from backend.config import (
    MODEL_PATH,
    VECTORIZER_PATH,
    THRESHOLD_SUSPICIOUS,
    THRESHOLD_HIGH_RISK,
    DISCLAIMER_TEXT
)
from backend.ml.preprocess import preprocess_message

# Global caches for loaded artifacts
_model = None
_vectorizer = None

def load_artifacts():
    global _model, _vectorizer
    if _model is None or _vectorizer is None:
        if not MODEL_PATH.exists() or not VECTORIZER_PATH.exists():
            from backend.ml.train import train_and_evaluate
            train_and_evaluate()
        _model = joblib.load(MODEL_PATH)
        _vectorizer = joblib.load(VECTORIZER_PATH)
    return _model, _vectorizer

# Red flag indicator patterns
INDICATOR_RULES = [
    {
        "id": "credential_request",
        "pattern": r'\b(otp|upi\s*pin|atm\s*pin|cvv|password|passcode|net\s*banking\s*password)\b',
        "flag": "Requests confidential credentials (OTP, PIN, CVV, or Password)",
        "severity": "high",
        "advice": "Banks and reputable services will NEVER ask for your OTP, PIN, or CVV. Never share this."
    },
    {
        "id": "urgency_threat",
        "pattern": r'\b(urgent|immediately|within\s*\d+\s*(hours?|mins?)|blocked\s*today|suspended|disconnected|frozen|seized|arrest\s*warrant|terminated)\b',
        "flag": "High urgency or fear-inducing threats (e.g., account blocked, power cutoff, legal arrest)",
        "severity": "high",
        "advice": "Scammers manufacture artificial panic to force hasty decisions. Take a breath and verify independently."
    },
    {
        "id": "suspicious_link",
        "pattern": r'(https?://[^\s]+|www\.[^\s]+|\.xyz|\.top|\.club|\.online|\.site|\.shop|\.link|\.apk|\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b)',
        "flag": "Contains unverified web link or download URL",
        "severity": "medium",
        "advice": "Do not tap on unverified links or install unknown .apk files sent via SMS/WhatsApp."
    },
    {
        "id": "upi_collect_lure",
        "pattern": r'(upi://pay|\bupi\b.*(claim|receive|cashback|bonus)|scan.*qr.*(receive|credit))',
        "flag": "UPI claim or QR scan reward lure",
        "severity": "high",
        "advice": "Golden Rule of UPI: You NEVER need to enter your UPI PIN or scan a QR code to RECEIVE money."
    },
    {
        "id": "financial_lure",
        "pattern": r'\b(won\s*(rs|inr|\$|\d)|lottery|lucky\s*draw|kbc|cash\s*prize|part-time\s*job|earn\s*(rs|\d+)|guaranteed\s*return|0%\s*interest)\b',
        "flag": "Unrealistic financial reward, lottery, or work-from-home task offer",
        "severity": "medium",
        "advice": "Unsolicited high-paying part-time jobs and lottery wins are textbook cyber scam traps."
    },
    {
        "id": "remote_access_apk",
        "pattern": r'\b(anydesk|teamviewer|quicksupport|rustdesk|\.apk|install\s*app)\b',
        "flag": "Requests installation of remote access tool or unknown APK package",
        "severity": "high",
        "advice": "Never install screen-sharing software (AnyDesk, QuickSupport) on instruction from callers."
    },
    {
        "id": "authority_impersonation",
        "pattern": r'\b(cbi|customs|cyber\s*crime|police|digital\s*arrest|supreme\s*court|trai|rbi|electricity\s*officer|sbi\s*yono)\b',
        "flag": "Claims to represent law enforcement, government authority, or bank security",
        "severity": "high",
        "advice": "Government agencies and police never interrogate or place citizens under 'digital arrest' via video call."
    }
]

def extract_warning_indicators(text: str) -> list[dict]:
    """Scan raw text for known social engineering patterns and security red flags."""
    indicators = []
    text_lower = text.lower()
    
    for rule in INDICATOR_RULES:
        if re.search(rule["pattern"], text_lower):
            indicators.append({
                "id": rule["id"],
                "flag": rule["flag"],
                "severity": rule["severity"],
                "advice": rule["advice"]
            })
    return indicators

def generate_recommendations(risk_level: str, indicators: list[dict]) -> list[str]:
    """Provide specific, actionable steps for the user based on the evaluation."""
    recs = []
    
    if risk_level == "High Risk":
        recs.append("DO NOT click any links, open attachments, or download files from this message.")
        recs.append("NEVER share any OTP, UPI PIN, ATM PIN, or banking passwords with anyone.")
        recs.append("If this message claims to be from your bank, open your official mobile banking app directly or visit your branch.")
        recs.append("If money has already been deducted, immediately call the National Cyber Crime Helpline at 1930 or report at cybercrime.gov.in.")
        recs.append("Block and report the sender number on WhatsApp / SMS.")
    elif risk_level == "Suspicious":
        recs.append("Exercise extreme caution. Do not reply with personal information, phone numbers, or account details.")
        recs.append("Independently verify sender authenticity through official contact numbers found on legitimate websites.")
        recs.append("Do not scan any QR codes claiming to credit money to your account.")
    else:  # Safe-looking
        recs.append("The message appears standard, but always stay vigilant with digital communications.")
        recs.append("Remember: Official organizations will never ask for your confidential security PINs or passwords.")
    
    # Add indicator-specific advice if not redundant
    for ind in indicators:
        if ind["advice"] not in recs:
            recs.append(ind["advice"])
            
    return recs

def analyze_message(text: str, source: str = "direct_input") -> dict:
    """Analyze a message using the ML ensemble + NLP feature extraction + rule-based indicators."""
    text_clean = (text or "").strip()
    if not text_clean:
        return {
            "error": "Message text cannot be empty.",
            "prediction": "unknown",
            "risk_level": "Unknown",
            "confidence_score": 0.0,
            "warning_indicators": [],
            "recommendations": ["Please enter or paste a valid message to analyze."],
            "disclaimer": DISCLAIMER_TEXT
        }

    model, vectorizer = load_artifacts()
    
    # 1. Preprocess and vectorise
    processed_text = preprocess_message(text_clean)
    vec = vectorizer.transform([processed_text])
    
    # 2. ML Probability calculation
    try:
        probabilities = model.predict_proba(vec)[0]
        # class 1 corresponds to fraud
        fraud_prob = float(probabilities[1])
        legit_prob = float(probabilities[0])
    except Exception:
        # Fallback if predict_proba is not directly available
        pred = model.predict(vec)[0]
        fraud_prob = 0.90 if pred == 1 else 0.10
        legit_prob = 1.0 - fraud_prob

    # 3. Indicator extraction
    indicators = extract_warning_indicators(text_clean)
    
    # 4. Hybrid risk score calculation
    # If high-severity indicators are present (like asking for OTP/PIN or digital arrest),
    # boost the risk score defensively
    has_high_severity = any(i["severity"] == "high" for i in indicators)
    has_medium_severity = any(i["severity"] == "medium" for i in indicators)
    
    adjusted_score = fraud_prob
    if has_high_severity:
        adjusted_score = max(adjusted_score, 0.78)
    elif has_medium_severity:
        adjusted_score = max(adjusted_score, 0.50)
        
    adjusted_score = round(min(adjusted_score, 0.98), 4)  # Never claim 100%

    # 5. Risk Level classification
    if adjusted_score >= THRESHOLD_HIGH_RISK:
        risk_level = "High Risk"
        prediction = "fraud"
    elif adjusted_score >= THRESHOLD_SUSPICIOUS:
        risk_level = "Suspicious"
        prediction = "suspicious"
    else:
        risk_level = "Safe-looking"
        prediction = "legitimate"

    recommendations = generate_recommendations(risk_level, indicators)

    return {
        "text": text_clean,
        "prediction": prediction,
        "risk_level": risk_level,
        "confidence_score": adjusted_score,
        "raw_ml_fraud_prob": round(fraud_prob, 4),
        "warning_indicators": indicators,
        "recommendations": recommendations,
        "source": source,
        "disclaimer": DISCLAIMER_TEXT
    }
