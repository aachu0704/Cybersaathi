import unittest
from backend.url_analyzer.analyzer import analyze_url

class TestURLAnalyzer(unittest.TestCase):
    def test_insecure_http_url(self):
        res = analyze_url("http://example-test.com/login")
        codes = [i["code"] for i in res["warning_indicators"]]
        self.assertIn("INSECURE_HTTP", codes)

    def test_ip_based_domain(self):
        res = analyze_url("http://192.168.1.50/sbi-kyc")
        codes = [i["code"] for i in res["warning_indicators"]]
        self.assertIn("IP_HOSTNAME", codes)
        self.assertEqual(res["risk_level"], "High Risk")

    def test_at_symbol_obscurity(self):
        res = analyze_url("http://google.com@phishing-target.xyz/login")
        codes = [i["code"] for i in res["warning_indicators"]]
        self.assertIn("AT_SYMBOL_OBSCURITY", codes)
        self.assertEqual(res["risk_level"], "High Risk")

    def test_suspicious_tld(self):
        res = analyze_url("https://fast-rewards.top/claim")
        codes = [i["code"] for i in res["warning_indicators"]]
        self.assertIn("SUSPICIOUS_TLD", codes)

    def test_brand_impersonation_keywords(self):
        res = analyze_url("https://hdfc-bank-account-kyc-verify.com/login")
        codes = [i["code"] for i in res["warning_indicators"]]
        self.assertIn("BRAND_IMPERSONATION", codes)

    def test_safe_looking_domain(self):
        res = analyze_url("https://www.google.com")
        self.assertEqual(res["risk_level"], "Safe-looking")
        self.assertLess(res["risk_score"], 0.35)

    def test_empty_url(self):
        res = analyze_url("")
        self.assertIn("error", res)

if __name__ == "__main__":
    unittest.main()
