// Main application controller
class App {
    constructor() {
        this.currentPage = 'loading';
        this.init();
    }

    async init() {
        // Show loading screen
        this.showLoading();

        // Check if user is already authenticated
        const isAuthenticated = await window.authManager.checkAuthStatus();
        
        if (isAuthenticated) {
            await this.showDashboard();
        } else {
            this.showPreview();
        }
    }

    showLoading() {
        this.hideAllPages();
        document.getElementById('loading-screen').classList.remove('hidden');
        this.currentPage = 'loading';
    }

    showPreview() {
        this.hideAllPages();
        document.getElementById('preview-landing').classList.remove('hidden');
        this.currentPage = 'preview';
        this.loadPreviewData();
    }

    showLogin() {
        this.hideAllPages();
        document.getElementById('login-form').classList.remove('hidden');
        this.currentPage = 'login';
        
        // Clear form
        document.getElementById('login-form-element').reset();
        window.authManager.clearMessages('login-form');
    }

    showRegister() {
        this.hideAllPages();
        document.getElementById('register-form').classList.remove('hidden');
        this.currentPage = 'register';
        
        // Clear form
        document.getElementById('register-form-element').reset();
        window.authManager.clearMessages('register-form');
        
        // Reset to candidate type
        const candidateBtn = document.querySelector('#register-form .user-type-btn[data-type="candidate"]');
        if (candidateBtn) {
            candidateBtn.click();
        }
    }

    async showDashboard() {
        const user = window.authManager.currentUser;
        if (!user) {
            this.showPreview();
            return;
        }

        this.hideAllPages();
        document.getElementById('dashboard').classList.remove('hidden');
        this.currentPage = 'dashboard';

        // Load dashboard data
        await window.dashboardManager.loadMetrics();
        window.dashboardManager.renderSidebar(user);
        window.dashboardManager.renderContent();
    }

    hideAllPages() {
        const pages = document.querySelectorAll('.page, #loading-screen');
        pages.forEach(page => page.classList.add('hidden'));
    }

    async loadPreviewData() {
        try {
            // Load jobs data
            const jobs = await window.apiService.getPublicJobs();
            if (jobs && Array.isArray(jobs)) {
                this.renderJobs(jobs.slice(0, 6)); // Show only first 6 jobs
                // Update search functionality
                this.setupJobSearch(jobs);
            } else {
                throw new Error('Invalid jobs data received');
            }
            
            // Load and update stats
            try {
                const stats = await window.apiService.getPublicStats();
                if (stats) {
                    this.updateStats(stats);
                }
            } catch (statsError) {
                console.warn('Failed to load stats:', statsError);
            }
            
        } catch (error) {
            console.error('Failed to load preview data:', error);
            // Show fallback data
            this.renderFallbackJobs();
        }
    }

    updateStats(stats) {
        const totalJobsEl = document.getElementById('total-jobs');
        const totalCompaniesEl = document.getElementById('total-companies');
        const totalCandidatesEl = document.getElementById('total-candidates');

        if (totalJobsEl) totalJobsEl.textContent = `${stats.totalJobs}+`;
        if (totalCompaniesEl) totalCompaniesEl.textContent = `${stats.totalCompanies}+`;
        if (totalCandidatesEl) totalCandidatesEl.textContent = `${stats.totalCandidates}+`;
    }

    renderJobs(jobs) {
        const jobsGrid = document.getElementById('jobs-grid');
        
        jobsGrid.innerHTML = jobs.map(job => `
            <div class="job-card" onclick="showLogin()">
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
                    <span class="job-card-salary-amount">${job.salary}</span>
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
                    <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); showLogin();">
                        Ver Vaga
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderFallbackJobs() {
        const fallbackJobs = [
            {
                id: '1',
                title: 'Desenvolvedor Full Stack',
                company: 'TechCorp',
                location: 'São Paulo, SP',
                workLocation: 'Híbrido',
                salary: 'R$ 8.000 - R$ 12.000',
                type: 'Tempo integral',
                applicants: 45,
                description: 'Procuramos um desenvolvedor experiente para nossa equipe de tecnologia.',
                tags: ['React', 'Node.js', 'TypeScript']
            },
            {
                id: '2',
                title: 'Analista de Dados',
                company: 'DataTech',
                location: 'São Paulo, SP',
                workLocation: 'Remoto',
                salary: 'R$ 6.000 - R$ 9.000',
                type: 'Tempo integral',
                applicants: 32,
                description: 'Oportunidade para analista de dados com foco em business intelligence.',
                tags: ['Python', 'SQL', 'Power BI']
            },
            {
                id: '3',
                title: 'Designer UX/UI',
                company: 'DesignCorp',
                location: 'Rio de Janeiro, RJ',
                workLocation: 'Presencial',
                salary: 'R$ 4.000 - R$ 6.000',
                type: 'Tempo integral',
                applicants: 28,
                description: 'Estamos buscando um designer criativo para melhorar a experiência do usuário.',
                tags: ['Figma', 'Adobe XD', 'Prototyping']
            }
        ];
        
        this.renderJobs(fallbackJobs);
    }

    setupJobSearch(jobs) {
        const searchInput = document.getElementById('job-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredJobs = jobs.filter(job => 
                    job.title.toLowerCase().includes(searchTerm) ||
                    (job.company && job.company.toLowerCase().includes(searchTerm)) ||
                    (job.tags && job.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
                );
                this.renderJobs(filteredJobs.slice(0, 6));
            });
        }
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
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});