@@ .. @@
 from flask import Flask
 from flask_cors import CORS
 from config import SECRET_KEY

 def create_app():
     app = Flask(__name__)
     app.secret_key = SECRET_KEY
     
     # Enable CORS for React frontend
-    CORS(app, origins=["http://localhost:5173", "https://localhost:5173"], supports_credentials=True)
+    CORS(app, 
+         origins=["http://localhost:5173", "https://localhost:5173", "http://127.0.0.1:5173", "https://127.0.0.1:5173"], 
+         supports_credentials=True,
+         allow_headers=["Content-Type", "Authorization"],
+         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
     
     from .routes import main
     app.register_blueprint(main)
     
     return app