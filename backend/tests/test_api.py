import unittest
import json
from backend.app import app
from backend.database.db import init_db

class TestFlaskAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = app.test_client()

    def test_health_endpoint(self):
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "healthy")

    def test_analyze_message_success(self):
        payload = {
            "message": "URGENT NOTICE: Your SBI account is suspended! Update KYC immediately at http://sbi-kyc-verify.xyz or account blocked."
        }
        res = self.client.post(
            "/analyze-message",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("risk_level", data)
        self.assertIn("confidence_score", data)
        self.assertIn("warning_indicators", data)
        self.assertIn("recommendations", data)
        self.assertIn(data["risk_level"], ["Suspicious", "High Risk"])

    def test_analyze_message_empty(self):
        res = self.client.post(
            "/analyze-message",
            data=json.dumps({"message": "   "}),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, 400)

    def test_analyze_url_success(self):
        payload = {
            "url": "http://192.168.1.1/paytm-kyc-update.xyz"
        }
        res = self.client.post(
            "/analyze-url",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["risk_level"], "High Risk")
        self.assertGreater(data["risk_score"], 0.5)

    def test_feedback_submission(self):
        payload = {
            "message_text": "Sample legitimate notification from college",
            "predicted_label": "fraud",
            "reported_label": "legitimate",
            "feedback_type": "False Positive",
            "comments": "This was an official notification from principal"
        }
        res = self.client.post(
            "/feedback",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertIn("feedback_id", data)

    def test_stats_endpoint(self):
        res = self.client.get("/stats")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("total_messages_analyzed", data)
        self.assertIn("total_urls_analyzed", data)
        self.assertIn("total_feedback_reports", data)

    def test_model_metrics_endpoint(self):
        res = self.client.get("/model-metrics")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("comparisons", data)
        self.assertIn("TF-IDF", data["comparisons"])

if __name__ == "__main__":
    unittest.main()
