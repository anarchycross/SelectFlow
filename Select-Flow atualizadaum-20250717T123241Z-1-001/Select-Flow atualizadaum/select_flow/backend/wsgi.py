#!/usr/bin/env python3
from app import create_app
from models import init_db
import os

# Create Flask app
app = create_app()

# Initialize database on startup
with app.app_context():
    try:
        init_db()
        print("Database initialized successfully!")
    except Exception as e:
        print(f"Database initialization error: {e}")

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)