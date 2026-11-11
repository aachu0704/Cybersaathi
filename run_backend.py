#!/usr/bin/env python3
"""
Launcher for CyberSathi AI Backend.
Starts the Flask server on 0.0.0.0:5000 with CORS and SQLite database.
"""
import os
import sys

# Ensure backend package is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from backend.app import app
from backend.config import HOST, PORT, DEBUG

if __name__ == "__main__":
    print(f"============================================================")
    print(f"  🛡️  CyberSathi AI Backend Platform Starting...")
    print(f"  Host: {HOST}:{PORT}")
    print(f"  Web Test Console: http://127.0.0.1:{PORT}")
    print(f"  API Docs / Health: http://127.0.0.1:{PORT}/health")
    print(f"============================================================")
    app.run(host=HOST, port=PORT, debug=DEBUG)
