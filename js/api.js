@@ .. @@
 // API service for backend communication
 class ApiService {
     constructor() {
-        this.baseURL = 'http://localhost:5001/api';
+        this.baseURL = this.getBaseURL();
+    }
+
+    getBaseURL() {
+        // Check if we're in development or production
+        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
+            return 'http://localhost:5001/api';
+        }
+        // For production, use relative URLs
+        return '/api';
     }