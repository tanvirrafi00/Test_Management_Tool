import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Include cookies in requests
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Remove automatic redirect to allow application logic to handle it
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/updateprofile', data),
    changePassword: (data) => api.put('/auth/changepassword', data),
    getUsers: () => api.get('/auth/users'),
    updateUserRole: (id, data) => api.put(`/auth/users/${id}/role`, data),
};

// Projects API
export const projectsAPI = {
    getAll: (params) => api.get('/projects', { params }),
    getById: (id) => api.get(`/projects/${id}`),
    create: (data) => api.post('/projects', data),
    update: (id, data) => api.put(`/projects/${id}`, data),
    delete: (id) => api.delete(`/projects/${id}`),
    addMember: (id, data) => api.post(`/projects/${id}/members`, data),
    removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
};

// Test Cases API
export const testCasesAPI = {
    getAll: (params) => api.get('/testcases', { params }),
    getById: (id) => api.get(`/testcases/${id}`),
    create: (data) => api.post('/testcases', data),
    update: (id, data) => api.put(`/testcases/${id}`, data),
    delete: (id) => api.delete(`/testcases/${id}`),
    clone: (id) => api.post(`/testcases/${id}/clone`),
};

// Test Plans API
export const testPlansAPI = {
    getAll: (params) => api.get('/testplans', { params }),
    getById: (id) => api.get(`/testplans/${id}`),
    create: (data) => api.post('/testplans', data),
    update: (id, data) => api.put(`/testplans/${id}`, data),
    delete: (id) => api.delete(`/testplans/${id}`),
    addTestCases: (id, data) => api.post(`/testplans/${id}/testcases`, data),
    removeTestCase: (id, testCaseId) => api.delete(`/testplans/${id}/testcases/${testCaseId}`),
};

// Executions API
export const executionsAPI = {
    getAll: (params) => api.get('/executions', { params }),
    getById: (id) => api.get(`/executions/${id}`),
    create: (data) => api.post('/executions', data),
    update: (id, data) => api.put(`/executions/${id}`, data),
    delete: (id) => api.delete(`/executions/${id}`),
    getByTestPlan: (testPlanId) => api.get(`/executions/testplan/${testPlanId}`),
    getByTestCase: (testCaseId) => api.get(`/executions/testcase/${testCaseId}`),
};

// Defects API
export const defectsAPI = {
    getAll: (params) => api.get('/defects', { params }),
    getById: (id) => api.get(`/defects/${id}`),
    create: (data) => api.post('/defects', data),
    update: (id, data) => api.put(`/defects/${id}`, data),
    delete: (id) => api.delete(`/defects/${id}`),
    assign: (id, data) => api.put(`/defects/${id}/assign`, data),
    updateStatus: (id, data) => api.put(`/defects/${id}/status`, data),
    addComment: (id, data) => api.post(`/defects/${id}/comments`, data),
};

// Dashboard API
export const dashboardAPI = {
    getStats: (params) => api.get('/dashboard/stats', { params }),
    getProjects: (params) => api.get('/dashboard/projects', { params }),
    getRecentActivity: (params) => api.get('/dashboard/recent-activity', { params }),
    getTesterWise: (params) => api.get('/dashboard/tester-wise', { params }),
    getReleaseWise: (params) => api.get('/dashboard/release-wise', { params }),
    exportReport: (reportType, format = 'csv', params = {}) => api.get(`/dashboard/reports/${reportType}/${format}`, {
        params,
        responseType: format === 'pdf' ? 'blob' : 'json'
    }),
};

export default api;

