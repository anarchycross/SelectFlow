@@ .. @@
 import os

 SECRET_KEY = os.environ.get('SECRET_KEY', 'selectflow-secret-key-2024')
-GEMINI_API_KEY = "AIzaSyA6EBt8gdxP_zTYmyTkQgd7AP0lfS_7Gl8"
+GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
 DATABASE_PATH = 'database/selectflow.db'