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


    async renderJobsView(container, user) {
        if (user.type === 'company') {
            await this.renderCompanyJobs(container, user);
        } else {
            await this.renderCandidateJobs(container, user);
        }
    }


    async renderCompanyJobs(container, user) {
        // Formulário para criar vaga
        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Minhas Vagas</h1>
                <p class="dashboard-subtitle">Gerencie e crie oportunidades de emprego</p>
            </div>
            <div class="card">
                <div class="card-header"><h3 class="card-title">Cadastrar nova vaga</h3></div>
                <div class="card-content">
                    <form id="job-create-form">
                        <div class="form-group">
                            <label>Título</label>
                            <input type="text" id="job-title" required>
                        </div>
                        <div class="form-group">
                            <label>Descrição</label>
                            <textarea id="job-description" required></textarea>
                        </div>
                        <div class="form-group">
                            <label>Localização</label>
                            <input type="text" id="job-location" required>
                        </div>
                        <div class="form-group">
                            <label>Tipo de trabalho</label>
                            <select id="job-type">
                                <option value="full-time">Tempo Integral</option>
                                <option value="part-time">Meio Período</option>
                                <option value="remote">Remoto</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Faixa Salarial</label>
                            <input type="text" id="job-salary">
                        </div>
                        <button type="submit" class="btn btn-primary">Criar Vaga</button>
                        <div id="job-create-message" style="margin-top:10px;"></div>
                    </form>
                </div>
            </div>
            <div class="card" id="company-jobs-list">
                <div class="card-header"><h3 class="card-title">Vagas cadastradas</h3></div>
                <div class="card-content" id="company-jobs-content">
                    <p>Carregando vagas...</p>
                </div>
            </div>
        `;

        // Handler do formulário
        document.getElementById('job-create-form').onsubmit = async (e) => {
            e.preventDefault();
            const title = document.getElementById('job-title').value;
            const description = document.getElementById('job-description').value;
            const location = document.getElementById('job-location').value;
            const jobType = document.getElementById('job-type').value;
            const salary = document.getElementById('job-salary').value;
            const messageDiv = document.getElementById('job-create-message');
            messageDiv.textContent = '';
            try {
                await window.apiService.createJob({
                    title,
                    description,
                    location,
                    workLocation: jobType,
                    salary,
                    type: jobType
                });
                messageDiv.textContent = 'Vaga criada com sucesso!';
                messageDiv.style.color = 'green';
                document.getElementById('job-create-form').reset();
                await this.loadCompanyJobs();
            } catch (err) {
                messageDiv.textContent = 'Erro ao criar vaga.';
                messageDiv.style.color = 'red';
            }
        };
        await this.loadCompanyJobs();
    }

    async loadCompanyJobs() {
        const content = document.getElementById('company-jobs-content');
        try {
            const jobs = await window.apiService.getJobs();
            if (!jobs.length) {
                content.innerHTML = '<p>Nenhuma vaga cadastrada.</p>';
                return;
            }
            content.innerHTML = jobs.map(job => `
                <div class="job-item" data-job-id="${job.id}">
                    <h4>${job.title}</h4>
                    <div class="job-meta"><b>Local:</b> ${job.location} | <b>Tipo:</b> ${job.workLocation}</div>
                    <div class="job-meta"><b>Salário:</b> ${job.salary || 'Não informado'}</div>
                    <button class="btn-apply" onclick="window.dashboardManager.openJobModal(${job.id}, 'company')">Ver detalhes</button>
                    <div class="job-date">Publicado em: ${job.postedAt}</div>
                </div>
            `).join('');
        } catch (err) {
            content.innerHTML = '<p>Erro ao carregar vagas.</p>';
        }
    }

    async renderCandidateJobs(container, user) {
        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Vagas Disponíveis</h1>
                <p class="dashboard-subtitle">Encontre oportunidades que combinam com seu perfil</p>
            </div>
            <div class="card" id="candidate-jobs-list">
                <div class="card-header"><h3 class="card-title">Vagas abertas</h3></div>
                <div class="card-content" id="candidate-jobs-content">
                    <p>Carregando vagas...</p>
                </div>
            </div>
        `;
        await this.loadCandidateJobs();
    }

    async loadCandidateJobs() {
        const content = document.getElementById('candidate-jobs-content');
        try {
            const jobs = await window.apiService.getJobs();
            if (!jobs.length) {
                content.innerHTML = '<p>Nenhuma vaga disponível.</p>';
                return;
            }
            content.innerHTML = jobs.map(job => `
                <div class="job-item" data-job-id="${job.id}">
                    <h4>${job.title}</h4>
                    <div class="job-meta"><b>Empresa:</b> ${job.company}</div>
                    <div class="job-meta"><b>Local:</b> ${job.location} | <b>Tipo:</b> ${job.workLocation}</div>
                    <div class="job-meta"><b>Salário:</b> ${job.salary || 'Não informado'}</div>
                    <button class="btn-apply" onclick="window.dashboardManager.openJobModal(${job.id}, 'candidate')">Ver detalhes</button>
                    <div class="job-date">Publicado em: ${job.postedAt}</div>
                </div>
            `).join('');
        } catch (err) {
            content.innerHTML = '<p>Erro ao carregar vagas.</p>';
        }
    }

    openJobModal(jobId, userType) {
        // Busca o job na lista renderizada
        let jobs = [];
        if (userType === 'company') {
            jobs = Array.from(document.querySelectorAll('#company-jobs-content .job-item'));
        } else {
            jobs = Array.from(document.querySelectorAll('#candidate-jobs-content .job-item'));
        }
        const jobDiv = jobs.find(j => j.getAttribute('data-job-id') == jobId);
        if (!jobDiv) return;
        // Pega os dados do job do DOM
        const title = jobDiv.querySelector('h4').textContent;
        const meta = jobDiv.querySelectorAll('.job-meta');
        const description = jobDiv.querySelector('.job-desc') ? jobDiv.querySelector('.job-desc').textContent : '';
        const date = jobDiv.querySelector('.job-date').textContent;
        let empresa = '';
        if (userType === 'candidate') {
            empresa = meta[0].textContent;
        }
        // Cria o modal
        let modal = document.getElementById('job-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'job-modal';
            document.body.appendChild(modal);
        }
        modal.innerHTML = `
            <div class="modal-overlay" onclick="window.dashboardManager.closeJobModal()"></div>
            <div class="modal-content">
                <button class="modal-close" onclick="window.dashboardManager.closeJobModal()">&times;</button>
                <h2>${title}</h2>
                ${empresa ? `<div class='job-meta'>${empresa}</div>` : ''}
                ${Array.from(meta).map(m => `<div class='job-meta'>${m.textContent}</div>`).join('')}
                <div class='job-desc'>${description}</div>
                <div class='job-date'>${date}</div>
                ${userType === 'candidate' ? `<button class='btn-apply' onclick='window.dashboardManager.applyToJob(${jobId}, this)'>Candidatar-se</button><span class="apply-message" style="margin-left:10px;font-size:0.95em;"></span>` : ''}
            </div>
        `;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeJobModal() {
        const modal = document.getElementById('job-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    async applyToJob(jobId, btn) {
        const messageSpan = btn.nextElementSibling;
        btn.disabled = true;
        messageSpan.textContent = '';
        try {
            await window.apiService.applyToJob(jobId);
            messageSpan.textContent = 'Candidatura enviada!';
            messageSpan.style.color = 'green';
        } catch (err) {
            messageSpan.textContent = 'Erro ao candidatar-se.';
            messageSpan.style.color = 'red';
        }
        setTimeout(() => {
            btn.disabled = false;
            messageSpan.textContent = '';
        }, 2500);
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