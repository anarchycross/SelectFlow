@@ .. @@
     async handleLogin(e) {
         e.preventDefault();
         
         const email = document.getElementById('login-email').value;
         const password = document.getElementById('login-password').value;
         const userType = document.querySelector('#login-form .user-type-btn.active').dataset.type;
         const submitBtn = e.target.querySelector('button[type="submit"]');

        // Basic validation
        if (!name || !email || !password) {
            this.showError('register-form', 'Por favor, preencha todos os campos obrigatórios');
            return;
        }

        if (userType === 'company' && !companyName) {
            this.showError('register-form', 'Nome da empresa é obrigatório');
            return;
        }

+        // Basic validation
+        if (!email || !password) {
+            this.showError('login-form', 'Por favor, preencha todos os campos');
+            return;
+        }
+
         try {
             this.setLoading(submitBtn, true);
             
             const response = await window.apiService.login(email, password, userType);
             
-            this.currentUser = {
-                id: response.user.id,
-                email: response.user.email,
-                name: response.user.name,
-                type: response.user.type,
-                avatar: response.user.avatar,
-                createdAt: new Date()
-            };
            if (response && response.user) {
                this.currentUser = {
                    id: response.user.id,
                    email: response.user.email,
                    name: response.user.name,
                    type: response.user.type,
                    avatar: response.user.avatar,
                    createdAt: new Date()
                };
+            if (response && response.user) {
+                this.currentUser = {
+                    id: response.user.id,
+                    email: response.user.email,
+                    name: response.user.name,
+                    type: response.user.type,
+                    avatar: response.user.avatar,
+                    createdAt: new Date()
+                };
 
-            // Show dashboard
-            window.app.showDashboard();
                // Show dashboard
                await window.app.showDashboard();
            } else {
                throw new Error('Resposta inválida do servidor');
            }
+                // Show dashboard
+                await window.app.showDashboard();
+            } else {
+                throw new Error('Resposta inválida do servidor');
+            }
             
         } catch (error) {
            console.error('Register error:', error);
            this.showError('register-form', error.message || 'Erro ao criar conta. Tente novamente.');
+            console.error('Login error:', error);
+            this.showError('login-form', error.message || 'Erro ao fazer login. Verifique suas credenciais.');
         } finally {
             this.setLoading(submitBtn, false);
         }
     }