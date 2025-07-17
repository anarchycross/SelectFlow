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
        this.jobs = [];
        this.candidates = [];
        this.applications = [];
        this.profile = null;
        this.tags = [];
    }

    async loadMetrics() {
        try {
            const metricsData = await window.apiService.getDashboardMetrics();
            this.metrics = metricsData;
        } catch (error) {
            console.error('Failed to load metrics:', error);
        }
    }

    async loadJobs() {
        try {
            this.jobs = await window.apiService.getJobs();
        } catch (error) {
            console.error('Failed to load jobs:', error);
            this.jobs = [];
        }
    }

    async loadCandidates() {
        try {
            this.candidates = await window.apiService.getCandidates();
        } catch (error) {
            console.error('Failed to load candidates:', error);
            this.candidates = [];
        }
    }

    async loadProfile() {
        try {
            this.profile = await window.apiService.getProfile();
        } catch (error) {
            console.error('Failed to load profile:', error);
            this.profile = null;
        }
    }

    async loadTags() {
        try {
            this.tags = await window.apiService.getTags();
        } catch (error) {
            console.error('Failed to load tags:', error);
            this.tags = [];
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
                            data-tab="${item.id}"
                            onclick="event.preventDefault(); window.dashboardManager.setActiveTab('${item.id}')">
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

    async setActiveTab(tab) {
        this.activeTab = tab;
        
        // Load data based on tab
        switch (tab) {
            case 'jobs':
                await this.loadJobs();
                await this.loadTags();
                break;
            case 'candidates':
                await this.loadCandidates();
                break;
            case 'profile':
                await this.loadProfile();
                break;
        }
        
        
        // Update active nav item
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            // Check if this nav item corresponds to the current tab
            const itemText = item.textContent.toLowerCase().trim();
            if ((tab === 'dashboard' && itemText === 'dashboard') ||
                (tab === 'jobs' && itemText === 'vagas') ||
                (tab === 'candidates' && itemText === 'candidatos') ||
                (tab === 'applications' && itemText === 'candidaturas') ||
                (tab === 'profile' && itemText === 'perfil')) {
                item.classList.add('active');
            }
        });
        
        // Render content after updating navigation
        this.renderContent();
    }

    renderContent() {
        const mainContent = document.getElementById('main-content');
        const user = window.authManager.currentUser;

        // Clear previous content
        mainContent.innerHTML = '';

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
                console.log('Unknown tab:', this.activeTab);
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
                <div class="dashboard-header-content">
                    <div>
                        <h1 class="dashboard-title">Minhas Vagas</h1>
                        <p class="dashboard-subtitle">Gerencie suas oportunidades de emprego</p>
                    </div>
                    <button class="btn btn-primary" onclick="window.dashboardManager.showCreateJobModal()">
                        <span class="icon">+</span>
                        Nova Vaga
                    </button>
                </div>
            </div>

            <div class="jobs-container">
                <div class="jobs-filters">
                    <div class="search-box">
                        <input type="text" id="jobs-search" placeholder="Buscar vagas..." onkeyup="window.dashboardManager.filterJobs()">
                        <span class="search-icon">🔍</span>
                    </div>
                    <select id="jobs-status-filter" onchange="window.dashboardManager.filterJobs()">
                        <option value="">Todos os status</option>
                        <option value="active">Ativa</option>
                        <option value="closed">Fechada</option>
                        <option value="draft">Rascunho</option>
                    </select>
                </div>

                <div class="jobs-grid" id="company-jobs-grid">
                    ${this.jobs.length === 0 ? this.renderEmptyJobs() : this.jobs.map(job => this.renderCompanyJobCard(job)).join('')}
                </div>
            </div>

            <!-- Create Job Modal -->
            <div id="create-job-modal" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Nova Vaga</h2>
                        <button class="modal-close" onclick="window.dashboardManager.hideCreateJobModal()">×</button>
                    </div>
                    <form id="create-job-form" class="modal-form">
                        <div class="form-group">
                            <label>Título da vaga *</label>
                            <input type="text" id="job-title" required placeholder="Ex: Desenvolvedor Full Stack Sênior">
                        </div>

                        <div class="form-group">
                            <label>Descrição *</label>
                            <textarea id="job-description" required rows="4" placeholder="Descreva as responsabilidades e o que procura no candidato..."></textarea>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Localização *</label>
                                <input type="text" id="job-location" required placeholder="São Paulo, SP">
                            </div>
                            <div class="form-group">
                                <label>Modalidade *</label>
                                <select id="job-work-location" required>
                                    <option value="">Selecione</option>
                                    <option value="Remoto">Remoto</option>
                                    <option value="Presencial">Presencial</option>
                                    <option value="Híbrido">Híbrido</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Salário</label>
                                <input type="text" id="job-salary" placeholder="R$ 5.000 - R$ 8.000">
                            </div>
                            <div class="form-group">
                                <label>Tipo</label>
                                <select id="job-type">
                                    <option value="full-time">Tempo integral</option>
                                    <option value="part-time">Meio período</option>
                                    <option value="contract">Contrato</option>
                                    <option value="internship">Estágio</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Requisitos</label>
                            <div class="tags-input">
                                <input type="text" id="requirements-input" placeholder="Digite um requisito e pressione Enter">
                                <div id="requirements-tags" class="tags-container"></div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Tags</label>
                            <div class="tags-input">
                                <input type="text" id="tags-input" placeholder="Digite uma tag e pressione Enter">
                                <div id="job-tags" class="tags-container"></div>
                            </div>
                        </div>

                        <div class="modal-actions">
                            <button type="button" class="btn btn-outline" onclick="window.dashboardManager.hideCreateJobModal()">
                                Cancelar
                            </button>
                            <button type="submit" class="btn btn-primary">
                                Criar Vaga
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.setupJobFormHandlers();
    }

    renderCandidateJobs(container) {
        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Vagas Disponíveis</h1>
                <p class="dashboard-subtitle">Encontre oportunidades que combinam com seu perfil</p>
            </div>

            <div class="jobs-container">
                <div class="jobs-filters">
                    <div class="search-box">
                        <input type="text" id="jobs-search" placeholder="Buscar vagas..." onkeyup="window.dashboardManager.filterJobs()">
                        <span class="search-icon">🔍</span>
                    </div>
                    <select id="jobs-location-filter" onchange="window.dashboardManager.filterJobs()">
                        <option value="">Todas as modalidades</option>
                        <option value="Remoto">Remoto</option>
                        <option value="Presencial">Presencial</option>
                        <option value="Híbrido">Híbrido</option>
                    </select>
                </div>

                <div class="jobs-grid" id="candidate-jobs-grid">
                    ${this.jobs.length === 0 ? this.renderEmptyJobs() : this.jobs.map(job => this.renderCandidateJobCard(job)).join('')}
                </div>
            </div>
        `;
    }

    renderCompanyJobCard(job) {
        const statusClass = job.status === 'active' ? 'success' : job.status === 'closed' ? 'error' : 'warning';
        const statusText = job.status === 'active' ? 'Ativa' : job.status === 'closed' ? 'Fechada' : 'Rascunho';

        return `
            <div class="job-card company-job-card">
                <div class="job-card-header">
                    <div>
                        <div class="job-card-title">${job.title}</div>
                        <div class="job-card-meta">
                            📍 ${job.location} • ${job.workLocation}
                        </div>
                    </div>
                    <div class="job-status ${statusClass}">${statusText}</div>
                </div>

                <div class="job-card-description">${job.description}</div>

                <div class="job-card-stats">
                    <div class="job-stat">
                        <span class="job-stat-number">${job.applicants}</span>
                        <span class="job-stat-label">Candidatos</span>
                    </div>
                    <div class="job-stat">
                        <span class="job-stat-number">${this.formatDate(job.postedAt)}</span>
                        <span class="job-stat-label">Publicada</span>
                    </div>
                </div>

                <div class="job-card-tags">
                    ${(job.tags || []).slice(0, 3).map(tag => `
                        <span class="job-tag">${tag}</span>
                    `).join('')}
                    ${job.tags && job.tags.length > 3 ? `<span class="job-tag">+${job.tags.length - 3}</span>` : ''}
                </div>

                <div class="job-card-actions">
                    <button class="btn btn-outline btn-sm" onclick="window.dashboardManager.viewJobDetails(${job.id})">
                        Ver Detalhes
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="window.dashboardManager.editJob(${job.id})">
                        Editar
                    </button>
                </div>
            </div>
        `;
    }

    renderCandidateJobCard(job) {
        return `
            <div class="job-card candidate-job-card">
                <div class="job-card-header">
                    <div>
                        <div class="job-card-title">${job.title}</div>
                        <div class="job-card-company">
                            🏢 ${job.company || 'Empresa'}
                        </div>
                    </div>
                    <div class="job-card-location">${this.getWorkLocationIcon(job.workLocation)}</div>
                </div>
                
                <div class="job-card-meta">
                    <div class="job-card-meta-item">
                        📍 ${job.location} • ${job.workLocation}
                    </div>
                    <div class="job-card-meta-item">
                        👥 ${job.applicants} candidatos
                    </div>
                </div>
                
                <div class="job-card-description">${job.description}</div>
                
                <div class="job-card-salary">
                    <span class="job-card-salary-amount">${job.salary || 'Salário não informado'}</span>
                    <span>${job.type}</span>
                </div>
                
                <div class="job-card-tags">
                    ${(job.tags || []).slice(0, 3).map(tag => `
                        <span class="job-tag">${tag}</span>
                    `).join('')}
                    ${job.tags && job.tags.length > 3 ? `<span class="job-tag">+${job.tags.length - 3}</span>` : ''}
                </div>
                
                <div class="job-card-footer">
                    <div class="job-card-applicants">
                        👥 ${job.applicants} candidatos
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="window.dashboardManager.applyToJob(${job.id})">
                        Candidatar-se
                    </button>
                </div>
            </div>
        `;
    }

    renderEmptyJobs() {
        const user = window.authManager.currentUser;
        if (user.type === 'company') {
            return `
                <div class="empty-state">
                    <div class="empty-icon">💼</div>
                    <h3>Nenhuma vaga criada ainda</h3>
                    <p>Comece criando sua primeira vaga para atrair candidatos qualificados.</p>
                    <button class="btn btn-primary" onclick="window.dashboardManager.showCreateJobModal()">
                        Criar Primeira Vaga
                    </button>
                </div>
            `;
        } else {
            return `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <h3>Nenhuma vaga encontrada</h3>
                    <p>Não encontramos vagas que correspondam aos seus critérios de busca.</p>
                </div>
            `;
        }
    }

    async renderCandidatesView(container) {
        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Candidatos</h1>
                <p class="dashboard-subtitle">Gerencie candidatos que se aplicaram às suas vagas</p>
            </div>
            
            <div class="candidates-container">
                <div class="candidates-filters">
                    <input type="text" id="candidate-search" placeholder="Buscar candidatos..." class="form-control">
                    <select id="candidate-status-filter">
                        <option value="">Todos os status</option>
                        <option value="resume_analysis">Análise de currículo</option>
                        <option value="technical_test">Teste técnico</option>
                        <option value="interview">Entrevista</option>
                        <option value="hired">Contratado</option>
                    </select>
                    <div class="search-box">
                        <input type="text" id="candidates-search" placeholder="Buscar candidatos..." onkeyup="window.dashboardManager.filterCandidates()">
                        <span class="search-icon">🔍</span>
                    </div>
                    <select id="candidates-status-filter" onchange="window.dashboardManager.filterCandidates()">
                        <option value="">Todos os status</option>
                        <option value="resume_analysis">Análise de currículo</option>
                        <option value="technical_test">Teste técnico</option>
                        <option value="interview">Entrevista</option>
                        <option value="hired">Contratado</option>
                    </select>
                </div>

                <div class="candidates-grid" id="candidates-grid">
                    ${this.candidates.length === 0 ? this.renderEmptyCandidates() : this.candidates.map(candidate => this.renderCandidateCard(candidate)).join('')}
                </div>
            </div>
        `;
    }

    renderCandidateCard(candidate) {
        const statusClass = this.getStatusClass(candidate.status);
        const statusText = this.getStatusText(candidate.status);

        return `
            <div class="candidate-card">
                <div class="candidate-header">
                    <div class="candidate-avatar">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=7c3aed&color=fff" alt="${candidate.name}">
                    </div>
                    <div class="candidate-info">
                        <div class="candidate-name">${candidate.name}</div>
                        <div class="candidate-position">${candidate.position}</div>
                        <div class="candidate-location">📍 ${candidate.location}</div>
                    </div>
                    <div class="candidate-status ${statusClass}">${statusText}</div>
                </div>

                <div class="candidate-skills">
                    ${(candidate.skills || []).slice(0, 4).map(skill => `
                        <span class="skill-tag">${skill}</span>
                    `).join('')}
                    ${candidate.skills && candidate.skills.length > 4 ? `<span class="skill-tag">+${candidate.skills.length - 4}</span>` : ''}
                </div>

                <div class="candidate-meta">
                    <div class="candidate-meta-item">
                        📧 ${candidate.email}
                    </div>
                    <div class="candidate-meta-item">
                        📅 Candidatou-se em ${this.formatDate(candidate.appliedAt)}
                    </div>
                </div>

                <div class="candidate-actions">
                    <button class="btn btn-outline btn-sm" onclick="window.dashboardManager.viewCandidateProfile('${candidate.id}')">
                        Ver Perfil
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="window.dashboardManager.manageCandidateStage('${candidate.id}')">
                        Gerenciar
                    </button>
                </div>
            </div>
        `;
    }

    renderEmptyCandidates() {
        return `
            <div class="empty-state">
                <div class="empty-icon">👥</div>
                <h3>Nenhum candidato ainda</h3>
                <p>Quando candidatos se aplicarem às suas vagas, eles aparecerão aqui.</p>
            </div>
        `;
    }

    renderApplicationsView(container) {
        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Minhas Candidaturas</h1>
                <p class="dashboard-subtitle">Acompanhe o status das suas candidaturas</p>
            </div>

            <div class="applications-container">
                <div class="applications-filters">
                    <div class="search-box">
                        <input type="text" id="applications-search" placeholder="Buscar candidaturas..." onkeyup="window.dashboardManager.filterApplications()">
                        <span class="search-icon">🔍</span>
                    </div>
                    <select id="applications-status-filter" onchange="window.dashboardManager.filterApplications()">
                        <option value="">Todos os status</option>
                        <option value="resume_analysis">Análise de currículo</option>
                        <option value="technical_test">Teste técnico</option>
                        <option value="interview">Entrevista</option>
                        <option value="hired">Contratado</option>
                    </select>
                </div>

                <div class="applications-list" id="applications-list">
                    ${this.renderApplicationsList()}
                </div>
            </div>
        `;
    }

    renderApplicationsList() {
        // Mock data for applications
        const applications = [
            {
                id: 1,
                jobTitle: 'Desenvolvedor Full Stack Sênior',
                company: 'TechCorp',
                status: 'interview',
                appliedAt: '2024-01-15',
                salary: 'R$ 8.000 - R$ 12.000'
            },
            {
                id: 2,
                jobTitle: 'Analista de Dados Pleno',
                company: 'DataTech',
                status: 'technical_test',
                appliedAt: '2024-01-10',
                salary: 'R$ 6.000 - R$ 9.000'
            }
        ];

        if (applications.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">📄</div>
                    <h3>Nenhuma candidatura ainda</h3>
                    <p>Explore as vagas disponíveis e candidate-se às oportunidades que interessam você.</p>
                    <button class="btn btn-primary" onclick="window.dashboardManager.setActiveTab('jobs')">
                        Ver Vagas
                    </button>
                </div>
            `;
        }

        return applications.map(app => `
            <div class="application-card">
                <div class="application-header">
                    <div>
                        <div class="application-title">${app.jobTitle}</div>
                        <div class="application-company">🏢 ${app.company}</div>
                    </div>
                    <div class="application-status ${this.getStatusClass(app.status)}">
                        ${this.getStatusText(app.status)}
                    </div>
                </div>

                <div class="application-details">
                    <div class="application-salary">${app.salary}</div>
                    <div class="application-date">Candidatou-se em ${this.formatDate(app.appliedAt)}</div>
                </div>

                <div class="application-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${this.getProgressWidth(app.status)}%"></div>
                    </div>
                    <div class="progress-stages">
                        <span class="stage ${app.status === 'resume_analysis' ? 'active' : 'completed'}">Análise</span>
                        <span class="stage ${app.status === 'technical_test' ? 'active' : app.status === 'interview' || app.status === 'hired' ? 'completed' : ''}">Teste</span>
                        <span class="stage ${app.status === 'interview' ? 'active' : app.status === 'hired' ? 'completed' : ''}">Entrevista</span>
                        <span class="stage ${app.status === 'hired' ? 'active' : ''}">Contratado</span>
                    </div>
                </div>

                <div class="application-actions">
                    <button class="btn btn-outline btn-sm" onclick="window.dashboardManager.viewApplicationDetails(${app.id})">
                        Ver Detalhes
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderProfileView(container, user) {
        if (!this.profile) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Carregando perfil...</p>
                </div>
            `;
            return;
        }

        if (user.type === 'company') {
            this.renderCompanyProfile(container);
        } else {
            this.renderCandidateProfile(container);
        }
    }

    renderCompanyProfile(container) {
        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Perfil da Empresa</h1>
                <p class="dashboard-subtitle">Mantenha as informações da sua empresa atualizadas</p>
            </div>

            <div class="profile-container">
                <form id="company-profile-form" class="profile-form">
                    <div class="profile-section">
                        <h3>Informações Básicas</h3>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Nome da empresa *</label>
                                <input type="text" id="company-name" value="${this.profile.company_name || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>Setor</label>
                                <select id="company-industry">
                                    <option value="">Selecione o setor</option>
                                    <option value="Tecnologia" ${this.profile.industry === 'Tecnologia' ? 'selected' : ''}>Tecnologia</option>
                                    <option value="Saúde" ${this.profile.industry === 'Saúde' ? 'selected' : ''}>Saúde</option>
                                    <option value="Educação" ${this.profile.industry === 'Educação' ? 'selected' : ''}>Educação</option>
                                    <option value="Financeiro" ${this.profile.industry === 'Financeiro' ? 'selected' : ''}>Financeiro</option>
                                    <option value="Varejo" ${this.profile.industry === 'Varejo' ? 'selected' : ''}>Varejo</option>
                                    <option value="Outros" ${this.profile.industry === 'Outros' ? 'selected' : ''}>Outros</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Tamanho da empresa</label>
                                <select id="company-size">
                                    <option value="">Selecione o tamanho</option>
                                    <option value="1-10" ${this.profile.size === '1-10' ? 'selected' : ''}>1-10 funcionários</option>
                                    <option value="11-50" ${this.profile.size === '11-50' ? 'selected' : ''}>11-50 funcionários</option>
                                    <option value="51-200" ${this.profile.size === '51-200' ? 'selected' : ''}>51-200 funcionários</option>
                                    <option value="201-500" ${this.profile.size === '201-500' ? 'selected' : ''}>201-500 funcionários</option>
                                    <option value="500+" ${this.profile.size === '500+' ? 'selected' : ''}>500+ funcionários</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Localização</label>
                                <input type="text" id="company-location" value="${this.profile.location || ''}" placeholder="São Paulo, SP">
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Descrição da empresa</label>
                            <textarea id="company-description" rows="4" placeholder="Conte sobre sua empresa, cultura e valores...">${this.profile.description || ''}</textarea>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Website</label>
                                <input type="url" id="company-website" value="${this.profile.website || ''}" placeholder="https://suaempresa.com">
                            </div>
                            <div class="form-group">
                                <label>LinkedIn</label>
                                <input type="url" id="company-linkedin" value="${this.profile.linkedin || ''}" placeholder="https://linkedin.com/company/suaempresa">
                            </div>
                        </div>
                    </div>

                    <div class="profile-actions">
                        <button type="submit" class="btn btn-primary">
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        `;

        this.setupCompanyProfileForm();
    }

    renderCandidateProfile(container) {
        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Meu Perfil</h1>
                <p class="dashboard-subtitle">Mantenha suas informações atualizadas para atrair melhores oportunidades</p>
            </div>

            <div class="profile-container">
                <form id="candidate-profile-form" class="profile-form">
                    <div class="profile-section">
                        <h3>Informações Pessoais</h3>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Telefone</label>
                                <input type="tel" id="candidate-phone" value="${this.profile.phone || ''}" placeholder="(11) 99999-9999">
                            </div>
                            <div class="form-group">
                                <label>Localização</label>
                                <input type="text" id="candidate-location" value="${this.profile.location || ''}" placeholder="São Paulo, SP">
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Bio</label>
                            <textarea id="candidate-bio" rows="3" placeholder="Conte um pouco sobre você e sua experiência...">${this.profile.bio || ''}</textarea>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>LinkedIn</label>
                                <input type="url" id="candidate-linkedin" value="${this.profile.linkedin || ''}" placeholder="https://linkedin.com/in/seuperfil">
                            </div>
                            <div class="form-group">
                                <label>GitHub</label>
                                <input type="url" id="candidate-github" value="${this.profile.github || ''}" placeholder="https://github.com/seuusuario">
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Portfolio</label>
                            <input type="url" id="candidate-portfolio" value="${this.profile.portfolio || ''}" placeholder="https://seuportfolio.com">
                        </div>
                    </div>

                    <div class="profile-section">
                        <h3>Habilidades</h3>
                        <div class="tags-input">
                            <input type="text" id="skills-input" placeholder="Digite uma habilidade e pressione Enter">
                            <div id="skills-tags" class="tags-container">
                                ${(this.profile.skills || []).map(skill => `
                                    <span class="tag">
                                        ${skill}
                                        <button type="button" onclick="this.parentElement.remove()">×</button>
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="profile-section">
                        <h3>Experiência</h3>
                        <div id="experience-list">
                            ${(this.profile.experience || []).map((exp, index) => this.renderExperienceItem(exp, index)).join('')}
                        </div>
                        <button type="button" class="btn btn-outline" onclick="window.dashboardManager.addExperience()">
                            + Adicionar Experiência
                        </button>
                    </div>

                    <div class="profile-section">
                        <h3>Formação</h3>
                        <div id="education-list">
                            ${(this.profile.education || []).map((edu, index) => this.renderEducationItem(edu, index)).join('')}
                        </div>
                        <button type="button" class="btn btn-outline" onclick="window.dashboardManager.addEducation()">
                            + Adicionar Formação
                        </button>
                    </div>

                    <div class="profile-section">
                        <h3>Idiomas</h3>
                        <div class="tags-input">
                            <input type="text" id="languages-input" placeholder="Digite um idioma e pressione Enter">
                            <div id="languages-tags" class="tags-container">
                                ${(this.profile.languages || []).map(lang => `
                                    <span class="tag">
                                        ${lang}
                                        <button type="button" onclick="this.parentElement.remove()">×</button>
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="profile-actions">
                        <button type="submit" class="btn btn-primary">
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        `;

        this.setupCandidateProfileForm();
    }

    renderExperienceItem(exp, index) {
        return `
            <div class="experience-item" data-index="${index}">
                <div class="form-row">
                    <div class="form-group">
                        <label>Cargo</label>
                        <input type="text" value="${exp.position || ''}" placeholder="Desenvolvedor Full Stack">
                    </div>
                    <div class="form-group">
                        <label>Empresa</label>
                        <input type="text" value="${exp.company || ''}" placeholder="Tech Corp">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Duração</label>
                        <input type="text" value="${exp.duration || ''}" placeholder="Jan 2020 - Atual">
                    </div>
                    <div class="form-group">
                        <button type="button" class="btn btn-outline btn-sm" onclick="this.closest('.experience-item').remove()">
                            Remover
                        </button>
                    </div>
                </div>
                <div class="form-group">
                    <label>Descrição</label>
                    <textarea rows="2" placeholder="Descreva suas responsabilidades e conquistas...">${exp.description || ''}</textarea>
                </div>
            </div>
        `;
    }

    renderEducationItem(edu, index) {
        return `
            <div class="education-item" data-index="${index}">
                <div class="form-row">
                    <div class="form-group">
                        <label>Curso</label>
                        <input type="text" value="${edu.degree || ''}" placeholder="Ciência da Computação">
                    </div>
                    <div class="form-group">
                        <label>Instituição</label>
                        <input type="text" value="${edu.institution || ''}" placeholder="Universidade de São Paulo">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Ano</label>
                        <input type="text" value="${edu.year || ''}" placeholder="2022">
                    </div>
                    <div class="form-group">
                        <button type="button" class="btn btn-outline btn-sm" onclick="this.closest('.education-item').remove()">
                            Remover
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Helper methods
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    getWorkLocationIcon(workLocation) {
        switch (workLocation?.toLowerCase()) {
            case 'remoto':
                return '🏠';
            case 'presencial':
                return '🏢';
            case 'híbrido':
                return '🔄';
            default:
                return '📍';
        }
    }

    getStatusClass(status) {
        switch (status) {
            case 'hired':
                return 'success';
            case 'interview':
            case 'final_interview':
                return 'info';
            case 'technical_test':
            case 'group_dynamics':
                return 'warning';
            case 'resume_analysis':
                return 'pending';
            default:
                return 'gray';
        }
    }

    getStatusText(status) {
        const statusMap = {
            'resume_analysis': 'Análise de currículo',
            'technical_test': 'Teste técnico',
            'group_dynamics': 'Dinâmica em grupo',
            'interview': 'Entrevista',
            'reference_check': 'Verificação de referências',
            'final_interview': 'Entrevista final',
            'hired': 'Contratado'
        };
        return statusMap[status] || status;
    }

    getProgressWidth(status) {
        const progressMap = {
            'resume_analysis': 25,
            'technical_test': 50,
            'interview': 75,
            'hired': 100
        };
        return progressMap[status] || 0;
    }

    // Event handlers and form setup
    setupJobFormHandlers() {
        const form = document.getElementById('create-job-form');
        if (form) {
            form.addEventListener('submit', this.handleCreateJob.bind(this));
        }

        // Setup tags input
        this.setupTagsInput('requirements-input', 'requirements-tags');
        this.setupTagsInput('tags-input', 'job-tags');
    }

    setupCompanyProfileForm() {
        const form = document.getElementById('company-profile-form');
        if (form) {
            form.addEventListener('submit', this.handleUpdateCompanyProfile.bind(this));
        }
    }

    setupCandidateProfileForm() {
        const form = document.getElementById('candidate-profile-form');
        if (form) {
            form.addEventListener('submit', this.handleUpdateCandidateProfile.bind(this));
        }

        // Setup tags inputs
        this.setupTagsInput('skills-input', 'skills-tags');
        this.setupTagsInput('languages-input', 'languages-tags');
    }

    setupTagsInput(inputId, containerId) {
        const input = document.getElementById(inputId);
        const container = document.getElementById(containerId);
        
        if (input && container) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = input.value.trim();
                    if (value) {
                        const tag = document.createElement('span');
                        tag.className = 'tag';
                        tag.innerHTML = `
                            ${value}
                            <button type="button" onclick="this.parentElement.remove()">×</button>
                        `;
                        container.appendChild(tag);
                        input.value = '';
                    }
                }
            });
        }
    }

    // Modal handlers
    showCreateJobModal() {
        document.getElementById('create-job-modal').classList.remove('hidden');
    }

    hideCreateJobModal() {
        document.getElementById('create-job-modal').classList.add('hidden');
        document.getElementById('create-job-form').reset();
        document.getElementById('requirements-tags').innerHTML = '';
        document.getElementById('job-tags').innerHTML = '';
    }

    // Form handlers
    async handleCreateJob(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const requirements = Array.from(document.querySelectorAll('#requirements-tags .tag')).map(tag => tag.textContent.replace('×', '').trim());
        const tags = Array.from(document.querySelectorAll('#job-tags .tag')).map(tag => tag.textContent.replace('×', '').trim());
        
        const jobData = {
            title: document.getElementById('job-title').value,
            description: document.getElementById('job-description').value,
            location: document.getElementById('job-location').value,
            workLocation: document.getElementById('job-work-location').value,
            salary: document.getElementById('job-salary').value,
            type: document.getElementById('job-type').value,
            requirements,
            tags
        };

        try {
            await window.apiService.createJob(jobData);
            this.hideCreateJobModal();
            await this.loadJobs();
            this.renderContent();
            this.showNotification('Vaga criada com sucesso!', 'success');
        } catch (error) {
            this.showNotification(error.message || 'Erro ao criar vaga', 'error');
        }
    }

    async handleUpdateCompanyProfile(e) {
        e.preventDefault();
        
        const profileData = {
            company_name: document.getElementById('company-name').value,
            industry: document.getElementById('company-industry').value,
            size: document.getElementById('company-size').value,
            location: document.getElementById('company-location').value,
            description: document.getElementById('company-description').value,
            website: document.getElementById('company-website').value,
            linkedin: document.getElementById('company-linkedin').value
        };

        try {
            await window.apiService.updateProfile(profileData);
            this.showNotification('Perfil atualizado com sucesso!', 'success');
        } catch (error) {
            this.showNotification(error.message || 'Erro ao atualizar perfil', 'error');
        }
    }

    async handleUpdateCandidateProfile(e) {
        e.preventDefault();
        
        const skills = Array.from(document.querySelectorAll('#skills-tags .tag')).map(tag => tag.textContent.replace('×', '').trim());
        const languages = Array.from(document.querySelectorAll('#languages-tags .tag')).map(tag => tag.textContent.replace('×', '').trim());
        
        const experience = Array.from(document.querySelectorAll('.experience-item')).map(item => ({
            position: item.querySelector('input[placeholder="Desenvolvedor Full Stack"]').value,
            company: item.querySelector('input[placeholder="Tech Corp"]').value,
            duration: item.querySelector('input[placeholder="Jan 2020 - Atual"]').value,
            description: item.querySelector('textarea').value
        }));

        const education = Array.from(document.querySelectorAll('.education-item')).map(item => ({
            degree: item.querySelector('input[placeholder="Ciência da Computação"]').value,
            institution: item.querySelector('input[placeholder="Universidade de São Paulo"]').value,
            year: item.querySelector('input[placeholder="2022"]').value
        }));

        const profileData = {
            phone: document.getElementById('candidate-phone').value,
            location: document.getElementById('candidate-location').value,
            bio: document.getElementById('candidate-bio').value,
            linkedin: document.getElementById('candidate-linkedin').value,
            github: document.getElementById('candidate-github').value,
            portfolio: document.getElementById('candidate-portfolio').value,
            skills,
            experience,
            education,
            languages
        };

        try {
            await window.apiService.updateProfile(profileData);
            this.showNotification('Perfil atualizado com sucesso!', 'success');
        } catch (error) {
            this.showNotification(error.message || 'Erro ao atualizar perfil', 'error');
        }
    }

    // Action handlers
    async applyToJob(jobId) {
        try {
            await window.apiService.applyToJob(jobId);
            this.showNotification('Candidatura enviada com sucesso!', 'success');
        } catch (error) {
            this.showNotification(error.message || 'Erro ao enviar candidatura', 'error');
        }
    }

    addExperience() {
        const container = document.getElementById('experience-list');
        const index = container.children.length;
        const experienceHtml = this.renderExperienceItem({}, index);
        container.insertAdjacentHTML('beforeend', experienceHtml);
    }

    addEducation() {
        const container = document.getElementById('education-list');
        const index = container.children.length;
        const educationHtml = this.renderEducationItem({}, index);
        container.insertAdjacentHTML('beforeend', educationHtml);
    }

    // Filter methods
    filterJobs() {
        // Implementation for job filtering
        console.log('Filtering jobs...');
    }

    filterCandidates() {
        // Implementation for candidate filtering
        console.log('Filtering candidates...');
    }

    filterApplications() {
        // Implementation for application filtering
        console.log('Filtering applications...');
    }

    // Notification system
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Placeholder methods for future implementation
    viewJobDetails(jobId) {
        console.log('View job details:', jobId);
    }

    editJob(jobId) {
        console.log('Edit job:', jobId);
    }

    viewCandidateProfile(candidateId) {
        console.log('View candidate profile:', candidateId);
    }

    manageCandidateStage(candidateId) {
        console.log('Manage candidate stage:', candidateId);
    }

    viewApplicationDetails(applicationId) {
        console.log('View application details:', applicationId);
    }
}

// Create global instance
window.dashboardManager = new DashboardManager();