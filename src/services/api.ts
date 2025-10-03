import axios, { AxiosResponse } from 'axios';
import { LoginRequest, LoginResponse, QRData, Registration, RegistrationData } from '../types';
import { clearTokens, getAccessToken, getRefreshToken } from '../utils/token';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important for cookie-based auth
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = getRefreshToken();
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
                        withCredentials: true,
                    });

                    if (response.data.user) {
                        // Update the original request with new token
                        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                        return api(originalRequest);
                    }
                }
            } catch (refreshError) {
                // Refresh failed, redirect to login
                clearTokens();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const authService = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response: AxiosResponse<LoginResponse> = await api.post('/auth/login', credentials);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
        clearTokens();
    },

    refresh: async (): Promise<LoginResponse> => {
        const response: AxiosResponse<LoginResponse> = await api.post('/auth/refresh');
        return response.data;
    },
};

export const qrService = {
    getQR: async (): Promise<QRData> => {
        const response: AxiosResponse<QRData> = await api.get('/qr/generate');
        return response.data;
    },
    getCurrentQR: async (): Promise<QRData> => {
        const response: AxiosResponse<QRData> = await api.get('/qr/current');
        return response.data;
    },
    consumeQr: async (qr:string): Promise<QRData> => {
        const response: AxiosResponse<QRData> = await api.post(`/qr/consume/${qr}`);
        return response.data;
    },
};

export const registrationService = {
    createRegistration: async (tokenId: string, data: RegistrationData): Promise<Registration> => {
        const response: AxiosResponse<Registration> = await api.post(`/registration/${tokenId}`, data);
        return response.data;
    },

    getRegistrations: async (): Promise<Registration[]> => {
        const response: AxiosResponse<Registration[]> = await api.get('/registration');
        return response.data;
    },

    getRegistrationById: async (id: string): Promise<Registration> => {
        const response: AxiosResponse<Registration> = await api.get(`/registration/${id}`);
        return response.data;
    },
};

export const adminService = {
    getUsers: async (): Promise<any[]> => {
        const response: AxiosResponse<any[]> = await api.get('/admin/users');
        return response.data;
    },

    createUser: async (userData: { username: string; password: string; role: string }): Promise<any> => {
        const response: AxiosResponse<any> = await api.post('/admin/users', userData);
        return response.data;
    },

    deleteUser: async (id: string): Promise<void> => {
        await api.delete(`/admin/users/${id}`);
    },
};

export default api;
