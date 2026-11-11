import unittest
from backend.ml.preprocess import clean_text, tokenize, remove_stopwords, lemmatize_tokens, preprocess_message
from backend.ml.model import analyze_message, extract_warning_indicators

class TestMLPipeline(unittest.TestCase):
    def test_clean_text(self):
        raw = "Check this out: https://fake-sbi.xyz/login with phone +91 9876543210! Pay Rs. 500 now."
        cleaned = clean_text(raw)
        self.assertIn("httpurl", cleaned)
        self.assertIn("phonenum", cleaned)
        self.assertIn("moneyprize", cleaned)
        self.assertNotIn("https", cleaned)

    def test_preprocess_message(self):
        raw = "URGENT: Your SBI account is blocked today! Update your KYC now."
        processed = preprocess_message(raw)
        # Check preserved critical words
        self.assertIn("urgent", processed)
        self.assertIn("blocked", processed)
        self.assertIn("kyc", processed)

    def test_fraud_message_detection(self):
        scam_text = "Dear customer, unauthorized transaction of Rs 48,000 detected. Share OTP 482910 immediately to cancel or call 9876543210"
        res = analyze_message(scam_text)
        self.assertIn(res["risk_level"], ["Suspicious", "High Risk"])
        self.assertGreater(res["confidence_score"], 0.5)
        self.assertTrue(len(res["warning_indicators"]) > 0)
        self.assertTrue(len(res["recommendations"]) > 0)
        self.assertIn("disclaimer", res)

    def test_legitimate_message(self):
        legit_text = "Hey mom, I reached the hostel safely. Will call you after dinner tonight."
        res = analyze_message(legit_text)
        self.assertEqual(res["risk_level"], "Safe-looking")
        self.assertEqual(res["prediction"], "legitimate")
        self.assertLess(res["confidence_score"], 0.40)

    def test_warning_indicators_extraction(self):
        test_text = "Your electricity power will be disconnected tonight by police. Enter UPI PIN to pay bill."
        indicators = extract_warning_indicators(test_text)
        flag_ids = [i["id"] for i in indicators]
        self.assertIn("credential_request", flag_ids)
        self.assertIn("urgency_threat", flag_ids)

    def test_empty_message(self):
        res = analyze_message("")
        self.assertIn("error", res)
        self.assertEqual(res["confidence_score"], 0.0)

if __name__ == "__main__":
    unittest.main()
