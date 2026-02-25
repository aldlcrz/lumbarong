import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:5000/api/v1',
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
    }
    return config;
});

export default api;
