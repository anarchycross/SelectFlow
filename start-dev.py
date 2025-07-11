#!/usr/bin/env python3
"""
Development server starter for SelectFlow
Starts both frontend and backend servers
"""
import subprocess
import sys
import os
import time
import threading
from pathlib import Path

def start_backend():
    """Start the Flask backend server"""
    print("🚀 Starting backend server...")
    backend_dir = Path(__file__).parent / "backend"
    os.chdir(backend_dir)
    
    try:
        subprocess.run([sys.executable, "run.py"], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Backend server stopped")
    except Exception as e:
        print(f"❌ Backend server error: {e}")

def start_frontend():
    """Start the frontend server"""
    print("🌐 Starting frontend server...")
    frontend_dir = Path(__file__).parent
    os.chdir(frontend_dir)
    
    try:
        subprocess.run([sys.executable, "-m", "http.server", "8000"], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Frontend server stopped")
    except Exception as e:
        print(f"❌ Frontend server error: {e}")

def main():
    print("🔥 SelectFlow Development Server")
    print("=" * 40)
    print("Frontend: http://localhost:8000")
    print("Backend:  http://localhost:5001")
    print("=" * 40)
    print("Press Ctrl+C to stop both servers")
    print()
    
    # Start backend in a separate thread
    backend_thread = threading.Thread(target=start_backend, daemon=True)
    backend_thread.start()
    
    # Give backend time to start
    time.sleep(2)
    
    # Start frontend in main thread
    try:
        start_frontend()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down servers...")
        sys.exit(0)

if __name__ == "__main__":
    main()