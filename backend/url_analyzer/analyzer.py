import re
import urllib.parse
from backend.config import DISCLAIMER_TEXT

SUSPICIOUS_TLDS = {
    "xyz", "top", "tk", "ml", "ga", "cf", "gq", "work", "click",
    "buzz", "rest", "support", "live", "link", "zip", "mov", "icu",
    "cam", "fit", "surf", "monster", "cfd"
}

POPULAR_SHORTENERS = {
    "bit.ly", "tinyurl.com", "goo.gl", "ow.ly", "is.gd", "buff.ly",
    "t.co", "rb.gy", "cutt.ly", "rotf.lol", "v.gd"
}

SENSITIVE_BRAND_KEYWORDS = {
    "sbi", "hdfc", "icici", "axis", "pnb", "bob", "canara", "paytm",
    "phonepe", "gpay", "googlepay", "bhim", "aadhaar", "uidai",
    "incometax", "epfo", "amazon", "flipkart", "netflix", "microsoft",
    "apple", "whatsapp", "telegram", "facebook", "instagram"
}

SECURITY_ACTION_KEYWORDS = {
    "kyc", "verify", "update", "login", "signin", "password",
    "blocked", "suspended", "security", "confirm", "wallet", "refund",
    "redeem", "cashback", "gift", "bonus", "reward"
}

def analyze_url(raw_url: str) -> dict:
    """Evaluate structural risk indicators of a URL without performing active outbound visits."""
    url = (raw_url or "").strip()
    if not url:
        return {
            "error": "URL cannot be empty.",
            "url": "",
            "risk_level": "Unknown",
            "risk_score": 0.0,
            "warning_indicators": [],
            "recommendations": ["Please enter a URL to analyze."],
            "disclaimer": DISCLAIMER_TEXT
        }

    # Add default scheme if missing for parsing
    if not url.startswith(("http://", "https://")):
        parsed_test = urllib.parse.urlparse("http://" + url)
        has_explicit_scheme = False
    else:
        parsed_test = urllib.parse.urlparse(url)
        has_explicit_scheme = True

    indicators = []
    risk_score = 0.0

    scheme = parsed_test.scheme.lower()
    netloc = parsed_test.netloc.lower()
    path = parsed_test.path.lower()
    query = parsed_test.query.lower()

    # 1. Check Protocol (Missing HTTPS)
    if scheme == "http" or not has_explicit_scheme:
        indicators.append({
            "code": "INSECURE_HTTP",
            "flag": "Missing HTTPS Encryption (Insecure HTTP)",
            "severity": "medium",
            "description": "Communications over standard HTTP are transmitted in plaintext and vulnerable to eavesdropping and interception."
        })
        risk_score += 0.25

    # 2. Check for IP Address in Hostname
    ip_pattern = r'^(\d{1,3}\.){3}\d{1,3}(:\d+)?$'
    if re.match(ip_pattern, netloc):
        indicators.append({
            "code": "IP_HOSTNAME",
            "flag": "IP-Based Hostname Instead of Domain Name",
            "severity": "high",
            "description": "Legitimate organizations use registered domain names. Using raw IP addresses is common in phishing servers."
        })
        risk_score += 0.40

    # 3. Check for '@' symbol in URL (Host Redirection Trick)
    if "@" in url:
        indicators.append({
            "code": "AT_SYMBOL_OBSCURITY",
            "flag": "URL Contains '@' Symbol (Host Obscurity Trick)",
            "severity": "high",
            "description": "Browsers ignore text before '@', allowing scammers to disguise malicious landing destinations."
        })
        risk_score += 0.45

    # 4. Check URL Length
    if len(url) > 75:
        indicators.append({
            "code": "EXCESSIVE_LENGTH",
            "flag": f"Unusually Long URL ({len(url)} characters)",
            "severity": "low",
            "description": "Phishing links frequently use bloated URLs to hide the real domain or inject obfuscated parameters."
        })
        risk_score += 0.15

    # 5. Check Suspicious TLD
    domain_parts = netloc.split(":")[0].split(".")
    tld = domain_parts[-1] if len(domain_parts) > 1 else ""
    if tld in SUSPICIOUS_TLDS:
        indicators.append({
            "code": "SUSPICIOUS_TLD",
            "flag": f"Unusual High-Abuse Top-Level Domain (.{tld})",
            "severity": "medium",
            "description": f"The '.{tld}' extension is heavily associated with disposable and bulk-registered phishing sites."
        })
        risk_score += 0.30

    # 6. Check for URL Shorteners
    if netloc in POPULAR_SHORTENERS:
        indicators.append({
            "code": "URL_SHORTENER",
            "flag": "Shortened Link Service Used",
            "severity": "medium",
            "description": "Shortened links conceal the ultimate destination domain. Only expand links from trusted contacts."
        })
        risk_score += 0.20

    # 7. Check Subdomain Bloat & Hyphen Overuse
    subdomain_count = len(domain_parts) - 2
    if subdomain_count >= 3:
        indicators.append({
            "code": "EXCESSIVE_SUBDOMAINS",
            "flag": f"Excessive Subdomains ({subdomain_count} levels detected)",
            "severity": "medium",
            "description": "Scammers nest multiple subdomain levels (e.g., sbi.bank.login.portal-xyz.com) to mimic genuine brands."
        })
        risk_score += 0.25

    hyphen_count = netloc.count("-")
    if hyphen_count >= 2:
        indicators.append({
            "code": "HYPHENATED_DOMAIN",
            "flag": f"Hyphenated Domain Name ({hyphen_count} hyphens)",
            "severity": "low",
            "description": "Phishing domains often add hyphens to mimic legitimate brands (e.g., icici-bank-online.com)."
        })
        risk_score += 0.15

    # 8. Check Brand Typosquatting / Impersonation Keywords
    matched_brands = [b for b in SENSITIVE_BRAND_KEYWORDS if b in netloc or b in path]
    matched_actions = [a for a in SECURITY_ACTION_KEYWORDS if a in netloc or a in path]

    if matched_brands and matched_actions:
        indicators.append({
            "code": "BRAND_IMPERSONATION",
            "flag": f"Combines Brand Names ({', '.join(matched_brands)}) with Action Triggers ({', '.join(matched_actions)})",
            "severity": "high",
            "description": "High probability of deceptive brand impersonation targeting banking, identity, or e-commerce credentials."
        })
        risk_score += 0.40

    # 9. Hexadecimal / Encoding Obfuscation
    if re.search(r'%[0-9a-fA-F]{2}', url):
        indicators.append({
            "code": "HEX_ENCODING",
            "flag": "Contains Hexadecimal Character Encoding",
            "severity": "low",
            "description": "Encoded characters may be used to evade keyword filters and disguise destination paths."
        })
        risk_score += 0.10

    # Normalize score between 0.05 and 0.95 (never 100%)
    final_score = round(min(max(risk_score, 0.05), 0.95), 2)

    # Classify Risk Level
    if final_score >= 0.65 or any(i["severity"] == "high" for i in indicators):
        risk_level = "High Risk"
    elif final_score >= 0.35:
        risk_level = "Suspicious"
    else:
        risk_level = "Safe-looking"

    # Action recommendations
    recommendations = []
    if risk_level == "High Risk":
        recommendations.append("DO NOT visit this website or enter any personal credentials.")
        recommendations.append("If you opened this link already, immediately change your account passwords from a separate trusted device.")
        recommendations.append("Never download APK files or install software prompted by this site.")
    elif risk_level == "Suspicious":
        recommendations.append("Inspect the exact base domain carefully before entering any information.")
        recommendations.append("Avoid providing phone numbers, banking details, or OTPs on this page.")
        recommendations.append("Access the service by typing the official URL into your browser directly.")
    else:
        recommendations.append("The domain structure appears standard.")
        recommendations.append("Always verify the SSL certificate padlock icon in your browser address bar.")

    return {
        "url": url,
        "risk_level": risk_level,
        "risk_score": final_score,
        "indicator_count": len(indicators),
        "warning_indicators": indicators,
        "recommendations": recommendations,
        "note": "These are heuristic risk indicators, not definitive proof of fraud. Legitimate sites may trigger warnings if poorly configured.",
        "disclaimer": DISCLAIMER_TEXT
    }
