// Authentication functionality
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // User type selector for login
        const loginUserTypeButtons = document.querySelectorAll('#login-form .user-type-btn');
        loginUserTypeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                loginUserTypeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // User type selector for register
        const registerUserTypeButtons = document.querySelectorAll('#register-form .user-type-btn');
        registerUserTypeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                registerUserTypeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateRegisterForm(btn.dataset.type);
            });
        });

        // Login form
        const loginForm = document.getElementById('login-form-element');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('register-form-element');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    }

    updateRegisterForm(userType) {
        const nameLabel = document.getElementById('name-label');
        const companyGroup = document.getElementById('company-name-group');
        const nameInput = document.getElementById('register-name');

        if (userType === 'company') {
            nameLabel.textContent = 'Nome do responsável';
            nameInput.placeholder = 'Maria Santos';
            companyGroup.style.display = 'block';
            document.getElementById('register-company').required = true;
        } else {
            nameLabel.textContent = 'Nome completo';
            nameInput.placeholder = 'João Silva';
            companyGroup.style.display = 'none';
            document.getElementById('register-company').required = false;
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const userType = document.querySelector('#login-form .user-type-btn.active').dataset.type;
        const submitBtn = e.target.querySelector('button[type="submit"]');

        // Basic validation
        if (!email || !password) {
            this.showError('login-form', 'Por favor, preencha todos os campos');
            return;
        }

        try {
            this.setLoading(submitBtn, true);
            
            const response = await window.apiService.login(email, password, userType);
            
            if (response && response.user) {
                this.currentUser = {
                    id: response.user.id,
                    email: response.user.email,
                    name: response.user.name,
                    type: response.user.type,
                    avatar: response.user.avatar,
                    createdAt: new Date()
                };

                // Show dashboard
                await window.app.showDashboard();
            } else {
                throw new Error('Resposta inválida do servidor');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showError('login-form', error.message || 'Erro ao fazer login. Verifique suas credenciais.');
        } finally {
            this.setLoading(submitBtn, false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const userType = document.querySelector('#register-form .user-type-btn.active').dataset.type;
        const companyName = document.getElementById('register-company').value;
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

        const data = {
            name,
            email,
            password,
            userType,
            companyName: userType === 'company' ? companyName : undefined
        };

        try {
            this.setLoading(submitBtn, true);
            
            const response = await window.apiService.register(data);
            
            if (response && response.user) {
                this.currentUser = {
                    id: response.user.id,
                    email: response.user.email,
                    name: response.user.name,
                    type: response.user.type,
                    avatar: response.user.avatar,
                    createdAt: new Date()
                };

                // Show dashboard
                await window.app.showDashboard();
            } else {
                throw new Error('Resposta inválida do servidor');
            }
            
        } catch (error) {
            console.error('Register error:', error);
            this.showError('register-form', error.message || 'Erro ao criar conta. Tente novamente.');
        } finally {
            this.setLoading(submitBtn, false);
        }
    }

    async logout() {
        try {
            await window.apiService.logout();
            this.currentUser = null;
            window.app.showPreview();
        } catch (error) {
            console.error('Logout failed:', error);
            // Force logout anyway
            this.currentUser = null;
            window.app.showPreview();
        }
    }

    async checkAuthStatus() {
        try {
            const userData = await window.apiService.getCurrentUser();
            this.currentUser = {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                type: userData.type,
                avatar: userData.avatar,
                createdAt: new Date(userData.createdAt)
            };
            return true;
        } catch (error) {
            console.log('User not authenticated');
            return false;
        }
    }

    setLoading(button, loading) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    showError(formId, message) {
        this.clearMessages(formId);
        const form = document.getElementById(formId);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        form.querySelector('.auth-form').insertBefore(errorDiv, form.querySelector('.auth-form').firstChild);
    }

    showSuccess(formId, message) {
        this.clearMessages(formId);
        const form = document.getElementById(formId);
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        form.querySelector('.auth-form').insertBefore(successDiv, form.querySelector('.auth-form').firstChild);
    }

    clearMessages(formId) {
        const form = document.getElementById(formId);
        const messages = form.querySelectorAll('.error-message, .success-message');
        messages.forEach(msg => msg.remove());
    }
}

// Global functions for navigation
function showLogin() {
    window.app.showLogin();
}

function showRegister() {
    window.app.showRegister();
}

function showPreview() {
    window.app.showPreview();
}

function googleLogin() {
    alert('Login com Google não implementado ainda');
}

// Create global instance
window.authManager = new AuthManager();