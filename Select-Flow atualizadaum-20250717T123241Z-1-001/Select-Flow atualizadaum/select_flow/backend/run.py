#!/usr/bin/env python3
import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import init_db

def main():
    # Initialize database
    print("Initializing database...")
    try:
        init_db()
        print("Database initialized successfully!")
    except Exception as e:
        print(f"Database initialization error: {e}")
        # Continue anyway, database might already exist

    # Create Flask app
    app = create_app()

    if __name__ == "__main__":
        print("Starting SelectFlow backend server...")
        print("Frontend should be running on http://localhost:5173")
        print("Backend API available on http://localhost:5000")
        
        try:
            app.run(debug=True, host='0.0.0.0', port=5000)
        except Exception as e:
            print(f"Error starting server: {e}")
            sys.exit(1)

if __name__ == "__main__":
    main()