// Dashboard functionality
class DashboardManager {
    constructor() {
        this.activeTab = 'dashboard';
        this.metrics = {
            totalCandidates: 0,
            activeJobs: 0,
            candidatesInReview: 0,
            scheduledInterviews: 0,
            totalApplications: 0,
            hiredCandidates: 0
        };
    }

    async loadMetrics() {
        try {
            const metricsData = await window.apiService.getDashboardMetrics();
            this.metrics = metricsData;
        } catch (error) {
            console.error('Failed to load metrics:', error);
        }
    }

    renderSidebar(user) {
        const sidebar = document.getElementById('sidebar');
        const userTypeClass = user.type === 'company' ? 'company' : 'candidate';
        
        const navigation = user.type === 'company' ? [
            { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
            { id: 'jobs', label: 'Vagas', icon: '💼' },
            { id: 'candidates', label: 'Candidatos', icon: '👥' },
            { id: 'profile', label: 'Perfil', icon: '🏢' },
        ] : [
            { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
            { id: 'jobs', label: 'Vagas', icon: '🔍' },
            { id: 'applications', label: 'Candidaturas', icon: '📄' },
            { id: 'profile', label: 'Perfil', icon: '👤' },
        ];

        sidebar.className = `sidebar ${userTypeClass}`;
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <div class="logo">
                    <img src="MaletaSF.png" alt="SelectFlow" class="logo-icon">
                    <img src="SelectFlowBranco.png" alt="SelectFlow" class="logo-text">
                </div>
            </div>

            <div class="sidebar-profile">
                <div class="sidebar-avatar">
                    <img src="${user.avatar}" alt="${user.name}">
                </div>
                <div class="sidebar-name">${user.name}</div>
                <div class="sidebar-role">${user.type === 'company' ? 'Empresa' : 'Candidato'}</div>
            </div>

            <nav class="sidebar-nav">
                ${navigation.map(item => `
                    <button class="nav-item ${userTypeClass} ${item.id === this.activeTab ? 'active' : ''}" 
                            onclick="window.dashboardManager.setActiveTab('${item.id}')">
                        <span class="nav-icon">${item.icon}</span>
                        <span>${item.label}</span>
                    </button>
                `).join('')}
            </nav>

            <button class="sidebar-logout" onclick="window.authManager.logout()">
                <span class="nav-icon">🚪</span>
                <span>Sair</span>
            </button>
        `;
    }

    setActiveTab(tab) {
        this.activeTab = tab;
        this.renderContent();
        
        // Update active nav item
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.onclick.toString().includes(`'${tab}'`)) {
                item.classList.add('active');
            }
        });
    }

    renderContent() {
        const mainContent = document.getElementById('main-content');
        const user = window.authManager.currentUser;

        switch (this.activeTab) {
            case 'dashboard':
                this.renderDashboardHome(mainContent, user);
                break;
            case 'jobs':
                this.renderJobsView(mainContent, user);
                break;
            case 'candidates':
                this.renderCandidatesView(mainContent);
                break;
            case 'applications':
                this.renderApplicationsView(mainContent);
                break;
            case 'profile':
                this.renderProfileView(mainContent, user);
                break;
            default:
                this.renderDashboardHome(mainContent, user);
        }
    }

    renderDashboardHome(container, user) {
        const greeting = user.type === 'company' 
            ? `Bem-vindo, ${user.name}! 🏢`
            : `Olá, ${user.name.split(' ')[0]}! 👋`;

        const subtitle = user.type === 'company'
            ? 'Aqui está um resumo das suas atividades de recrutamento'
            : 'Aqui está um resumo das suas atividades';

        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">${greeting}</h1>
                <p class="dashboard-subtitle">${subtitle}</p>
            </div>

            <div class="metrics-grid">
                ${this.renderMetricCard('Total de candidatos', this.metrics.totalCandidates, '👥', 'blue')}
                ${this.renderMetricCard('Vagas ativas', this.metrics.activeJobs, '💼', 'purple')}
                ${this.renderMetricCard('Em análise', this.metrics.candidatesInReview, '📄', 'gray')}
                ${this.renderMetricCard('Entrevistas', this.metrics.scheduledInterviews, '📅', 'green')}
            </div>

            <div class="content-grid">
                ${this.renderRecentActivities()}
                ${this.renderQuickStats()}
            </div>
        `;
    }

    renderMetricCard(title, value, icon, variant) {
        return `
            <div class="metric-card ${variant}">
                <div class="metric-header">
                    <div>
                        <div class="metric-icon">${icon}</div>
                    </div>
                </div>
                <div class="metric-title">${title}</div>
                <div class="metric-value">${value.toLocaleString()}</div>
            </div>
        `;
    }

    renderRecentActivities() {
        const activities = [
            { action: 'Nova candidatura recebida', detail: 'Desenvolvedor Full Stack - João Silva', time: '1 hora atrás' },
            { action: 'Entrevista agendada', detail: 'Analista de Dados - Amanda Silva', time: '3 horas atrás' },
            { action: 'Candidato contratado', detail: 'Designer UX/UI - Bruno Ferreira', time: '1 dia atrás' },
        ];

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Atividades Recentes</h3>
                </div>
                <div class="card-content">
                    <div class="activity-feed">
                        ${activities.map(activity => `
                            <div class="activity-item">
                                <div class="activity-dot"></div>
                                <div class="activity-content">
                                    <div class="activity-title">${activity.action}</div>
                                    <div class="activity-description">${activity.detail}</div>
                                    <div class="activity-time">${activity.time}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderQuickStats() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Estatísticas Rápidas</h3>
                </div>
                <div class="card-content">
                    <div class="activity-feed">
                        <div class="activity-item">
                            <div class="activity-content">
                                <div class="activity-title">Taxa de aprovação</div>
                                <div class="activity-description">68% dos candidatos passam para entrevista</div>
                            </div>
                        </div>
                        <div class="activity-item">
                            <div class="activity-content">
                                <div class="activity-title">Tempo médio</div>
                                <div class="activity-description">12 dias para contratação</div>
                            </div>
                        </div>
                        <div class="activity-item">
                            <div class="activity-content">
                                <div class="activity-title">Score IA médio</div>
                                <div class="activity-description">84% de compatibilidade</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderJobsView(container, user) {
        if (user.type === 'company') {
            this.renderCompanyJobs(container);
        } else {
            this.renderCandidateJobs(container);
        }
    }

    renderCompanyJobs(container) {
        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Minhas Vagas</h1>
                <p class="dashboard-subtitle">Gerencie suas oportunidades de emprego</p>
            </div>
            <div class="card">
                <div class="card-content">
                    <p>Funcionalidade de gerenciamento de vagas em desenvolvimento...</p>
                </div>
            </div>
        `;
    }

    renderCandidateJobs(container) {
        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Vagas Disponíveis</h1>
                <p class="dashboard-subtitle">Encontre oportunidades que combinam com seu perfil</p>
            </div>
            <div class="card">
                <div class="card-content">
                    <p>Funcionalidade de busca de vagas em desenvolvimento...</p>
                </div>
            </div>
        `;
    }

    renderCandidatesView(container) {
        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Candidatos</h1>
                <p class="dashboard-subtitle">Gerencie candidatos que se aplicaram às suas vagas</p>
            </div>
            <div class="card">
                <div class="card-content">
                    <p>Funcionalidade de gerenciamento de candidatos em desenvolvimento...</p>
                </div>
            </div>
        `;
    }

    renderApplicationsView(container) {
        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Minhas Candidaturas</h1>
                <p class="dashboard-subtitle">Acompanhe o status das suas candidaturas</p>
            </div>
            <div class="card">
                <div class="card-content">
                    <p>Funcionalidade de acompanhamento de candidaturas em desenvolvimento...</p>
                </div>
            </div>
        `;
    }

    renderProfileView(container, user) {
        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">${user.type === 'company' ? 'Perfil da Empresa' : 'Meu Perfil'}</h1>
                <p class="dashboard-subtitle">Mantenha suas informações atualizadas</p>
            </div>
            <div class="card">
                <div class="card-content">
                    <p>Funcionalidade de edição de perfil em desenvolvimento...</p>
                </div>
            </div>
        `;
    }
}

// Create global instance
window.dashboardManager = new DashboardManager();