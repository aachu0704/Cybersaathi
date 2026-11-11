import json
import logging
from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS

from backend.config import HOST, PORT, DEBUG, METRICS_PATH
from backend.database.db import (
    init_db,
    record_feedback,
    get_feedback_list,
    record_message_analysis,
    record_url_analysis,
    get_system_stats,
)
from backend.ml.model import analyze_message, load_artifacts
from backend.url_analyzer.analyzer import analyze_url

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
)
logger = logging.getLogger("cybersathi")

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for Flutter app

# Initialize database on startup
with app.app_context():
    init_db()
    try:
        load_artifacts()
        logger.info("ML artifacts loaded successfully.")
    except Exception as e:
        logger.warning(f"Could not load ML artifacts on startup: {e}")

# HTML Template for Interactive Web Verification Console
WEB_CONSOLE_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CyberSathi - AI Cyber Fraud Detection & Awareness</title>
    <style>
        :root {
            --primary: #1e3a8a;
            --primary-dark: #172554;
            --safe: #16a34a;
            --suspicious: #d97706;
            --high-risk: #dc2626;
            --bg: #f8fafc;
            --card: #ffffff;
            --text: #0f172a;
            --muted: #64748b;
            --border: #e2e8f0;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        body { background: var(--bg); color: var(--text); padding: 24px; line-height: 1.5; }
        .container { max-width: 1000px; margin: 0 auto; }
        header { text-align: center; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid var(--border); }
        header h1 { font-size: 2rem; color: var(--primary); display: flex; align-items: center; justify-content: center; gap: 10px; }
        header p { color: var(--muted); margin-top: 6px; font-size: 1.05rem; }
        .tabs { display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid var(--border); }
        .tab { padding: 10px 20px; cursor: pointer; border-radius: 8px 8px 0 0; font-weight: 600; border: none; background: transparent; color: var(--muted); }
        .tab.active { background: var(--primary); color: white; }
        .panel { display: none; background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .panel.active { display: block; }
        textarea, input[type="text"] { width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 1rem; margin-top: 8px; }
        button.btn { background: var(--primary); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; margin-top: 14px; transition: background 0.2s; }
        button.btn:hover { background: var(--primary-dark); }
        .result-box { margin-top: 24px; padding: 20px; border-radius: 8px; border: 1px solid var(--border); background: #f1f5f9; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-weight: 700; font-size: 0.9rem; text-transform: uppercase; color: white; }
        .badge.Safe-looking { background: var(--safe); }
        .badge.Suspicious { background: var(--suspicious); }
        .badge.High-Risk, .badge.High\\ Risk { background: var(--high-risk); }
        ul.indicators { margin-top: 10px; padding-left: 20px; }
        ul.indicators li { margin-bottom: 6px; }
        .disclaimer-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px; margin-top: 20px; border-radius: 4px; font-size: 0.9rem; color: #92400e; }
        .quick-samples { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .sample-btn { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; cursor: pointer; }
        .sample-btn:hover { background: #c7d2fe; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media(max-width: 768px) { .grid-2 { grid-template-columns: 1fr; } }
        .stat-card { background: #f8fafc; border: 1px solid var(--border); border-radius: 8px; padding: 16px; text-align: center; }
        .stat-val { font-size: 1.8rem; font-weight: 700; color: var(--primary); }
        .stat-lbl { font-size: 0.85rem; color: var(--muted); }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🛡️ CyberSathi AI Platform</h1>
            <p>AI-Based Cyber Fraud Detection, Awareness & Senior Citizen Protection System</p>
        </header>

        <div class="tabs">
            <button class="tab active" onclick="switchTab('message-tab')">✉️ Message Analyzer</button>
            <button class="tab" onclick="switchTab('url-tab')">🔗 URL Risk Analyzer</button>
            <button class="tab" onclick="switchTab('metrics-tab')">📊 ML Model Comparison</button>
            <button class="tab" onclick="switchTab('stats-tab')">📈 System Stats & Feedback</button>
        </div>

        <!-- 1. Message Analyzer Panel -->
        <div id="message-tab" class="panel active">
            <h2>Analyze Suspicious Message</h2>
            <p style="color: var(--muted); font-size: 0.95rem;">Paste an SMS, WhatsApp text, or email to detect cyber fraud indicators using TF-IDF + Voting Ensemble ML.</p>
            
            <div style="margin-top: 12px;">
                <label style="font-weight: 600;">Sample Tests:</label>
                <div class="quick-samples">
                    <button class="sample-btn" onclick="fillMessage('URGENT NOTICE: Your SBI account is blocked today! Update your PAN card and KYC immediately by clicking: http://sbi-kyc-pan-update.xyz')">Fake KYC Urgency</button>
                    <button class="sample-btn" onclick="fillMessage('Dear Customer, unauthorized transaction of Rs 48,000 detected. Share OTP 482910 immediately with support to cancel or call 9876543210')">OTP Theft Scam</button>
                    <button class="sample-btn" onclick="fillMessage('Congratulations! You received cash reward of Rs 75,000 from PhonePe Diwali offer. Enter your UPI PIN to claim: upi://pay?pa=cashreward@ybl')">UPI Cash Prize</button>
                    <button class="sample-btn" onclick="fillMessage('Dear Customer, INR 1,250.00 debited from A/c XX4821 on 10-NOV-24 at SMART BAZAAR POS. Avail Bal: INR 24,180.00. - State Bank of India')">Legitimate Bank Alert</button>
                </div>
            </div>

            <textarea id="message-input" rows="5" placeholder="Paste suspicious SMS, WhatsApp message, or email here..."></textarea>
            <button class="btn" onclick="analyzeMsg()">🔍 Analyze Message</button>

            <div id="msg-result" class="result-box" style="display: none;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h3>Analysis Result</h3>
                    <span id="msg-badge" class="badge">Safe</span>
                </div>
                <p><strong>Fraud Confidence Score:</strong> <span id="msg-score">0.0</span> / 1.00</p>
                <div style="margin-top: 10px;">
                    <strong>Detected Warning Indicators:</strong>
                    <ul id="msg-indicators" class="indicators"></ul>
                </div>
                <div style="margin-top: 14px;">
                    <strong>Recommended Safety Actions:</strong>
                    <ul id="msg-recs" class="indicators"></ul>
                </div>
                <div class="disclaimer-box" id="msg-disclaimer"></div>

                <!-- Feedback reporting block -->
                <div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed var(--border);">
                    <p style="font-size: 0.9rem; color: var(--muted); margin-bottom: 8px;">Was this prediction inaccurate? Report feedback to help our security team review:</p>
                    <button class="sample-btn" onclick="sendFeedback('False Positive', 'Safe message was flagged as scam')">Report False Positive</button>
                    <button class="sample-btn" onclick="sendFeedback('False Negative', 'Scam message was marked as safe')">Report Missed Scam</button>
                </div>
            </div>
        </div>

        <!-- 2. URL Risk Analyzer Panel -->
        <div id="url-tab" class="panel">
            <h2>Inspect Suspicious URL</h2>
            <p style="color: var(--muted); font-size: 0.95rem;">Examines heuristic indicators such as missing HTTPS, raw IP hosts, suspicious TLDs, obscure symbols (@), and deceptive brand keywords.</p>
            
            <div style="margin-top: 12px;">
                <label style="font-weight: 600;">Sample URLs:</label>
                <div class="quick-samples">
                    <button class="sample-btn" onclick="fillUrl('http://192.168.1.105/sbi-netbanking-login.php')">IP-Based Host</button>
                    <button class="sample-btn" onclick="fillUrl('http://sbi.com@secure-phishing-portal.xyz/kyc-update')">@ Host Obscurity</button>
                    <button class="sample-btn" onclick="fillUrl('http://hdfc-bank-verify-account.top/login')">Suspicious TLD (.top)</button>
                    <button class="sample-btn" onclick="fillUrl('https://www.onlinesbi.sbi')">Official Genuine SBI</button>
                </div>
            </div>

            <input type="text" id="url-input" placeholder="e.g. http://sbi-kyc-update.xyz/login">
            <button class="btn" onclick="inspectUrl()">🔗 Analyze URL</button>

            <div id="url-result" class="result-box" style="display: none;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h3>URL Risk Profile</h3>
                    <span id="url-badge" class="badge">Safe</span>
                </div>
                <p><strong>Calculated Risk Score:</strong> <span id="url-score">0.0</span> / 1.00</p>
                <div style="margin-top: 10px;">
                    <strong>Structural Risk Indicators:</strong>
                    <ul id="url-indicators" class="indicators"></ul>
                </div>
                <div style="margin-top: 14px;">
                    <strong>Safety Advice:</strong>
                    <ul id="url-recs" class="indicators"></ul>
                </div>
                <div class="disclaimer-box" id="url-disclaimer"></div>
            </div>
        </div>

        <!-- 3. ML Model Comparison Panel -->
        <div id="metrics-tab" class="panel">
            <h2>Machine Learning Models Comparison</h2>
            <p style="color: var(--muted); margin-bottom: 16px;">Evaluated on the benchmark dataset using TF-IDF and Bag-of-Words feature representations.</p>
            <div id="metrics-content">Loading ML evaluation metrics...</div>
        </div>

        <!-- 4. Stats & Feedback Panel -->
        <div id="stats-tab" class="panel">
            <h2>System Statistics & Community Feedback</h2>
            <div class="grid-2" style="margin-top: 16px; margin-bottom: 24px;">
                <div class="stat-card">
                    <div class="stat-val" id="stat-msgs">0</div>
                    <div class="stat-lbl">Messages Analyzed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-val" id="stat-urls">0</div>
                    <div class="stat-lbl">URLs Analyzed</div>
                </div>
            </div>
            <h3>Recent User Feedback Reports</h3>
            <div id="feedback-list" style="margin-top: 12px; font-size: 0.9rem; color: var(--muted);">No feedback recorded yet.</div>
        </div>
    </div>

    <script>
        function switchTab(tabId) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            event.target.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            if (tabId === 'metrics-tab') loadMetrics();
            if (tabId === 'stats-tab') loadStats();
        }

        function fillMessage(txt) {
            document.getElementById('message-input').value = txt;
        }

        function fillUrl(txt) {
            document.getElementById('url-input').value = txt;
        }

        async function analyzeMsg() {
            const text = document.getElementById('message-input').value;
            if (!text.trim()) { alert('Please enter message text'); return; }
            try {
                const res = await fetch('/analyze-message', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ message: text })
                });
                const data = await res.json();
                
                document.getElementById('msg-result').style.display = 'block';
                const badge = document.getElementById('msg-badge');
                badge.innerText = data.risk_level;
                badge.className = 'badge ' + data.risk_level.replace(' ', '-');
                document.getElementById('msg-score').innerText = data.confidence_score;
                
                const indList = document.getElementById('msg-indicators');
                indList.innerHTML = '';
                if (!data.warning_indicators || data.warning_indicators.length === 0) {
                    indList.innerHTML = '<li>No obvious scam keywords or threats identified.</li>';
                } else {
                    data.warning_indicators.forEach(i => {
                        indList.innerHTML += `<li><strong>${i.flag}</strong>: ${i.advice}</li>`;
                    });
                }

                const recList = document.getElementById('msg-recs');
                recList.innerHTML = '';
                data.recommendations.forEach(r => {
                    recList.innerHTML += `<li>${r}</li>`;
                });

                document.getElementById('msg-disclaimer').innerText = data.disclaimer;
            } catch(e) {
                alert('Analysis failed: ' + e);
            }
        }

        async function inspectUrl() {
            const url = document.getElementById('url-input').value;
            if (!url.trim()) { alert('Please enter a URL'); return; }
            try {
                const res = await fetch('/analyze-url', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ url: url })
                });
                const data = await res.json();
                
                document.getElementById('url-result').style.display = 'block';
                const badge = document.getElementById('url-badge');
                badge.innerText = data.risk_level;
                badge.className = 'badge ' + data.risk_level.replace(' ', '-');
                document.getElementById('url-score').innerText = data.risk_score;
                
                const indList = document.getElementById('url-indicators');
                indList.innerHTML = '';
                if (!data.warning_indicators || data.warning_indicators.length === 0) {
                    indList.innerHTML = '<li>Standard domain structure without obvious deceptive patterns.</li>';
                } else {
                    data.warning_indicators.forEach(i => {
                        indList.innerHTML += `<li><strong>${i.flag}</strong>: ${i.description}</li>`;
                    });
                }

                const recList = document.getElementById('url-recs');
                recList.innerHTML = '';
                data.recommendations.forEach(r => {
                    recList.innerHTML += `<li>${r}</li>`;
                });

                document.getElementById('url-disclaimer').innerText = data.disclaimer;
            } catch(e) {
                alert('URL Analysis failed: ' + e);
            }
        }

        async function sendFeedback(type, comments) {
            const text = document.getElementById('message-input').value;
            const pred = document.getElementById('msg-badge').innerText;
            const reported = (type === 'False Positive') ? 'legitimate' : 'fraud';
            
            try {
                const res = await fetch('/feedback', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        message_text: text,
                        predicted_label: pred,
                        reported_label: reported,
                        feedback_type: type,
                        comments: comments
                    })
                });
                const d = await res.json();
                alert('Feedback recorded for human review! Thank you for strengthening CyberSathi.');
            } catch(e) {
                alert('Error submitting feedback: ' + e);
            }
        }

        async function loadMetrics() {
            try {
                const res = await fetch('/model-metrics');
                const data = await res.json();
                let html = `<p><strong>Dataset Size:</strong> ${data.dataset_size} samples (Train: ${data.train_size}, Test: ${data.test_size})</p>`;
                html += `<p><strong>Selected Production Model:</strong> ${data.best_model}</p><br>`;
                
                for (const [feat, models] of Object.entries(data.comparisons)) {
                    html += `<h3 style="color: var(--primary); margin-bottom: 8px;">Feature Representation: ${feat}</h3>`;
                    html += `<table style="width:100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.95rem;">
                        <tr style="background:#e2e8f0; text-align:left;">
                            <th style="padding:8px; border:1px solid #cbd5e1;">Model</th>
                            <th style="padding:8px; border:1px solid #cbd5e1;">Accuracy</th>
                            <th style="padding:8px; border:1px solid #cbd5e1;">Precision</th>
                            <th style="padding:8px; border:1px solid #cbd5e1;">Recall</th>
                            <th style="padding:8px; border:1px solid #cbd5e1;">F1-Score</th>
                        </tr>`;
                    for (const [mName, mVals] of Object.entries(models)) {
                        html += `<tr>
                            <td style="padding:8px; border:1px solid #cbd5e1;"><strong>${mName}</strong></td>
                            <td style="padding:8px; border:1px solid #cbd5e1;">${mVals.accuracy}</td>
                            <td style="padding:8px; border:1px solid #cbd5e1;">${mVals.precision}</td>
                            <td style="padding:8px; border:1px solid #cbd5e1;">${mVals.recall}</td>
                            <td style="padding:8px; border:1px solid #cbd5e1;">${mVals.f1_score}</td>
                        </tr>`;
                    }
                    html += `</table>`;
                }
                document.getElementById('metrics-content').innerHTML = html;
            } catch(e) {
                document.getElementById('metrics-content').innerHTML = 'Error loading metrics: ' + e;
            }
        }

        async function loadStats() {
            try {
                const res = await fetch('/stats');
                const data = await res.json();
                document.getElementById('stat-msgs').innerText = data.total_messages_analyzed;
                document.getElementById('stat-urls').innerText = data.total_urls_analyzed;
                
                if (data.recent_feedback && data.recent_feedback.length > 0) {
                    let fbHtml = '<ul class="indicators">';
                    data.recent_feedback.forEach(f => {
                        fbHtml += `<li><strong>[${f.feedback_type}]</strong> "${f.message_text.substring(0, 60)}..." (Reported: ${f.reported_label})</li>`;
                    });
                    fbHtml += '</ul>';
                    document.getElementById('feedback-list').innerHTML = fbHtml;
                }
            } catch(e) {
                console.error(e);
            }
        }
    </script>
</body>
</html>
"""

@app.route("/", methods=["GET"])
def home():
    """Serves an interactive web verification and testing console for CyberSathi."""
    return render_template_string(WEB_CONSOLE_HTML)

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint to verify backend operational readiness."""
    return jsonify({
        "status": "healthy",
        "service": "CyberSathi AI Backend",
        "version": "1.0.0",
        "ready": True
    }), 200

@app.route("/analyze-message", methods=["POST"])
def endpoint_analyze_message():
    """Analyze incoming text message for fraud indicators and risk level."""
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({
            "error": "Invalid request body. Expected JSON object with 'message' field.",
            "status": "bad_request"
        }), 400

    raw_message = data.get("message") or data.get("text")
    if not raw_message or not isinstance(raw_message, str) or not raw_message.strip():
        return jsonify({
            "error": "Missing or empty 'message' string field in request.",
            "status": "bad_request"
        }), 400

    source = data.get("source", "direct_input")
    
    # Run analysis
    analysis_result = analyze_message(raw_message, source=source)
    
    # Log to SQLite
    try:
        record_message_analysis(
            input_text=analysis_result["text"],
            prediction=analysis_result["prediction"],
            risk_level=analysis_result["risk_level"],
            confidence=analysis_result["confidence_score"],
            source=source
        )
    except Exception as e:
        logger.error(f"Failed to record message analysis to DB: {e}")

    return jsonify(analysis_result), 200

@app.route("/analyze-url", methods=["POST"])
def endpoint_analyze_url():
    """Analyze a URL for phishing and heuristic risk indicators."""
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({
            "error": "Invalid request body. Expected JSON object with 'url' field.",
            "status": "bad_request"
        }), 400

    raw_url = data.get("url")
    if not raw_url or not isinstance(raw_url, str) or not raw_url.strip():
        return jsonify({
            "error": "Missing or empty 'url' string field in request.",
            "status": "bad_request"
        }), 400

    # Run URL analysis
    url_result = analyze_url(raw_url)

    # Log to SQLite
    try:
        record_url_analysis(
            url=url_result["url"],
            risk_level=url_result["risk_level"],
            risk_score=url_result["risk_score"]
        )
    except Exception as e:
        logger.error(f"Failed to record URL analysis to DB: {e}")

    return jsonify(url_result), 200

@app.route("/feedback", methods=["POST"])
def endpoint_feedback():
    """Receive user misclassification feedback and store in SQLite for human review."""
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({
            "error": "Invalid request body. Expected JSON object.",
            "status": "bad_request"
        }), 400

    message_text = data.get("message_text") or data.get("text")
    reported_label = data.get("reported_label")
    predicted_label = data.get("predicted_label", "")
    feedback_type = data.get("feedback_type", "misclassification")
    comments = data.get("comments", "")

    if not message_text or not reported_label:
        return jsonify({
            "error": "Fields 'message_text' and 'reported_label' are required.",
            "status": "bad_request"
        }), 400

    try:
        feedback_id = record_feedback(
            message_text=message_text,
            reported_label=reported_label,
            predicted_label=predicted_label,
            feedback_type=feedback_type,
            comments=comments
        )
        return jsonify({
            "status": "success",
            "message": "Feedback recorded successfully. Submissions are queued for human review and not auto-retrained.",
            "feedback_id": feedback_id
        }), 201
    except Exception as e:
        logger.error(f"Error saving feedback: {e}")
        return jsonify({"error": "Failed to save feedback.", "details": str(e)}), 500

@app.route("/stats", methods=["GET"])
def endpoint_stats():
    """Return aggregated system statistics and recent feedback."""
    try:
        stats = get_system_stats()
        recent_feedback = get_feedback_list(limit=5)
        stats["recent_feedback"] = recent_feedback
        return jsonify(stats), 200
    except Exception as e:
        logger.error(f"Error retrieving system stats: {e}")
        return jsonify({"error": "Could not fetch stats", "details": str(e)}), 500

@app.route("/model-metrics", methods=["GET"])
def endpoint_metrics():
    """Return ML comparative benchmark evaluation metrics."""
    if not METRICS_PATH.exists():
        return jsonify({"error": "Metrics file not found. Please train models first."}), 404
    try:
        with open(METRICS_PATH, "r", encoding="utf-8") as f:
            metrics = json.load(f)
        return jsonify(metrics), 200
    except Exception as e:
        return jsonify({"error": "Failed to load metrics", "details": str(e)}), 500

if __name__ == "__main__":
    print(f"[*] Starting CyberSathi Backend on http://{HOST}:{PORT}")
    app.run(host=HOST, port=PORT, debug=DEBUG)
