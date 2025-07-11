// API service for backend communication
class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:5001/api';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            console.log(`Making request to: ${url}`, config);
            const response = await fetch(url, config);
            console.log(`Response status: ${response.status}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP Error ${response.status}:`, errorText);
                
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.error || `HTTP ${response.status}`);
                } catch (parseError) {
                    throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
                }
            }
            
            const data = await response.json();
            console.log('Response data:', data);
            return data;
            
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 5001.');
            }
            
            throw new Error(error.message || 'Erro de conexão com o servidor');
        }
    }

    // Authentication
    async login(email, password, userType) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, userType }),
        });
    }

    async register(data) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async logout() {
        return this.request('/auth/logout', {
            method: 'POST',
        });
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    // Public routes for preview
    async getPublicJobs() {
        return this.request('/public/jobs');
    }

    async getPublicStats() {
        return this.request('/public/stats');
    }

    // Dashboard
    async getDashboardMetrics() {
        return this.request('/dashboard/metrics');
    }

    // Candidates
    async getCandidates() {
        return this.request('/candidates');
    }

    // Jobs
    async getJobs() {
        return this.request('/jobs');
    }

    async createJob(jobData) {
        return this.request('/jobs', {
            method: 'POST',
            body: JSON.stringify(jobData),
        });
    }

    // Applications
    async applyToJob(jobId) {
        return this.request('/applications', {
            method: 'POST',
            body: JSON.stringify({ jobId }),
        });
    }

    // Profile
    async getProfile() {
        return this.request('/profile');
    }

    async updateProfile(profileData) {
        return this.request('/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }

    // Tags
    async getTags() {
        return this.request('/tags');
    }
}

// Create global instance
window.apiService = new ApiService();