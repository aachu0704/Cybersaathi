import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Database configuration
DATABASE_PATH = os.environ.get("CYBERSATHI_DB", str(BASE_DIR / "database" / "cybersathi.db"))

# ML Artifacts path
MODELS_DIR = BASE_DIR / "ml" / "models"
MODEL_PATH = MODELS_DIR / "cybersathi_ensemble_model.joblib"
VECTORIZER_PATH = MODELS_DIR / "cybersathi_vectorizer.joblib"
METRICS_PATH = MODELS_DIR / "model_evaluation_metrics.json"

# Risk Thresholds
# Probability of fraud:
# < 0.35 => Safe-looking
# 0.35 - 0.70 => Suspicious
# >= 0.70 => High Risk
THRESHOLD_SUSPICIOUS = 0.35
THRESHOLD_HIGH_RISK = 0.70

# Advisory disclaimer
DISCLAIMER_TEXT = (
    "CyberSathi AI analysis provides probabilistic risk indicators based on trained patterns. "
    "Predictions are not 100% guaranteed. Always independently verify suspicious communications "
    "with official authorities or contact the National Cyber Crime Helpline (1930)."
)

# Server config
HOST = os.environ.get("HOST", "0.0.0.0")
# Use 5050 by default to avoid macOS AirPlay Receiver collision on port 5000
PORT = int(os.environ.get("PORT", 5050))
DEBUG = os.environ.get("DEBUG", "False").lower() in ("true", "1")
