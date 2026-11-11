import re
import string
import warnings

# Suppress NLTK directory ownership warning when running in isolated test environments
warnings.filterwarnings("ignore", category=RuntimeWarning, module="nltk")

import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Initialize lemmatizer and stopwords with safe fallbacks
try:
    _lemmatizer = WordNetLemmatizer()
except Exception:
    _lemmatizer = None

# Custom stop words: exclude critical security / fraud cue words
PRESERVED_WORDS = {
    "not", "no", "never", "now", "urgent", "immediately", "free",
    "blocked", "suspended", "warning", "verify", "update", "expire",
    "alert", "winner", "prize", "claim", "money", "cash", "bank"
}

try:
    _nltk_stopwords = set(stopwords.words("english"))
    STOP_WORDS = _nltk_stopwords - PRESERVED_WORDS
except Exception:
    STOP_WORDS = {
        "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you",
        "your", "yours", "yourself", "yourselves", "he", "him", "his",
        "himself", "she", "her", "hers", "herself", "it", "its", "itself",
        "they", "them", "their", "theirs", "themselves", "what", "which",
        "who", "whom", "this", "that", "these", "those", "am", "is", "are",
        "was", "were", "be", "been", "being", "have", "has", "had", "having",
        "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if",
        "or", "because", "as", "until", "while", "of", "at", "by", "for",
        "with", "about", "against", "between", "into", "through", "during",
        "before", "after", "above", "below", "to", "from", "up", "down",
        "in", "out", "on", "off", "over", "under", "again", "further",
        "then", "once"
    }

def clean_text(text: str) -> str:
    """Basic text cleanup: lowercase, normalize whitespace, remove noise."""
    if not isinstance(text, str):
        return ""
    
    # 1. Lowercase
    text = text.lower()
    
    # 2. Normalize URLs, emails, phone numbers to generic tokens
    text = re.sub(r'https?://\S+|www\.\S+', ' httpurl ', text)
    text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', ' emailaddr ', text)
    text = re.sub(r'\+?\d[\d -]{8,}\d', ' phonenum ', text)
    text = re.sub(r'[₹$€£]\s*\d+([,\.]\d+)?', ' moneyprize ', text)
    text = re.sub(r'\b(rs\.?|inr)\s*\d+([,\.]\d+)?', ' moneyprize ', text)
    
    # 3. Replace punctuation with space
    text = re.sub(r'[%s]' % re.escape(string.punctuation), ' ', text)
    
    # 4. Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def tokenize(text: str) -> list[str]:
    """Tokenize cleaned text using NLTK or regex fallback."""
    try:
        tokens = nltk.word_tokenize(text)
    except Exception:
        tokens = re.findall(r'\b[a-zA-Z0-9_]+\b', text)
    return tokens

def remove_stopwords(tokens: list[str]) -> list[str]:
    """Filter out non-informative stop words while preserving key security indicators."""
    return [token for token in tokens if token not in STOP_WORDS and len(token) > 1]

def lemmatize_tokens(tokens: list[str]) -> list[str]:
    """Apply WordNet lemmatization to tokens."""
    if _lemmatizer is None:
        return tokens
    lemmatized = []
    for token in tokens:
        try:
            lemmatized.append(_lemmatizer.lemmatize(token))
        except Exception:
            lemmatized.append(token)
    return lemmatized

def preprocess_message(text: str) -> str:
    """Full preprocessing pipeline: clean -> tokenize -> filter stopwords -> lemmatize -> join."""
    cleaned = clean_text(text)
    tokens = tokenize(cleaned)
    tokens = remove_stopwords(tokens)
    tokens = lemmatize_tokens(tokens)
    return " ".join(tokens)
