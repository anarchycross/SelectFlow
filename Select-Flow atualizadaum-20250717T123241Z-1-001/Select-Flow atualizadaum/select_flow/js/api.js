// API service for backend communication
class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
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