import sqlite3
import datetime
from pathlib import Path
from backend.config import DATABASE_PATH

def get_connection():
    db_file = Path(DATABASE_PATH)
    db_file.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Feedback table for misclassifications and user feedback
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_text TEXT NOT NULL,
            predicted_label TEXT,
            reported_label TEXT NOT NULL,
            feedback_type TEXT NOT NULL,
            comments TEXT,
            reviewed INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Message analysis audit log
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS message_analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            input_text TEXT NOT NULL,
            prediction TEXT NOT NULL,
            risk_level TEXT NOT NULL,
            confidence REAL NOT NULL,
            source TEXT DEFAULT 'direct_input',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # URL analysis audit log
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS url_analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            risk_level TEXT NOT NULL,
            risk_score REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()

def record_feedback(message_text: str, reported_label: str, predicted_label: str = "", feedback_type: str = "misclassification", comments: str = "") -> int:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO feedback (message_text, predicted_label, reported_label, feedback_type, comments)
        VALUES (?, ?, ?, ?, ?)
    """, (message_text, predicted_label, reported_label, feedback_type, comments))
    feedback_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return feedback_id

def get_feedback_list(limit: int = 50):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, message_text, predicted_label, reported_label, feedback_type, comments, reviewed, created_at
        FROM feedback
        ORDER BY created_at DESC
        LIMIT ?
    """, (limit,))
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows

def record_message_analysis(input_text: str, prediction: str, risk_level: str, confidence: float, source: str = "direct_input") -> int:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO message_analyses (input_text, prediction, risk_level, confidence, source)
        VALUES (?, ?, ?, ?, ?)
    """, (input_text, prediction, risk_level, confidence, source))
    analysis_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return analysis_id

def record_url_analysis(url: str, risk_level: str, risk_score: float) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO url_analyses (url, risk_level, risk_score)
        VALUES (?, ?, ?)
    """, (url, risk_level, risk_score))
    analysis_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return analysis_id

def get_system_stats():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM message_analyses")
    total_messages = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM url_analyses")
    total_urls = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM feedback")
    total_feedback = cursor.fetchone()[0]

    cursor.execute("""
        SELECT risk_level, COUNT(*) as count
        FROM message_analyses
        GROUP BY risk_level
    """)
    risk_breakdown = {row["risk_level"]: row["count"] for row in cursor.fetchall()}

    conn.close()
    return {
        "total_messages_analyzed": total_messages,
        "total_urls_analyzed": total_urls,
        "total_feedback_reports": total_feedback,
        "risk_breakdown": risk_breakdown
    }
