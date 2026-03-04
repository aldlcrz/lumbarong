import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
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

// Add error handling interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            console.error('Network Error: Please check if the backend server (port 5000) is running.');
        } else if (error.response.status === 500) {
            // Log the detailed error from the backend for debugging
            console.error('[API 500 Error]:', error.response.data);
            const msg = error.response.data?.message || 'Internal Server Error';
            const detail = error.response.data?.error || '';
            alert(`Artisan Registry Error (500): ${msg}${detail ? ` - ${detail}` : ''}`);
        }
        return Promise.reject(error);
    }
);

export default api;
