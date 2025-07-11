from flask import Flask
from flask_cors import CORS
from config import SECRET_KEY

def create_app():
    app = Flask(__name__)
    app.secret_key = SECRET_KEY
    
    # Enable CORS for React frontend
    CORS(app, origins=["http://localhost:5173", "https://localhost:5173"], supports_credentials=True)
    
    from .routes import main
    app.register_blueprint(main)
    
    return app