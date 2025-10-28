import axios, { AxiosResponse } from "axios";
import {
  LoginRequest,
  LoginResponse,
  QRData,
  Registration,
  RegistrationData,
  UserManagementRequest,
  DeviceRequest,
  DeviceResult,
  CreateMappingRequest,
  MappingResult,
  Pagination,
  FileItem,
  FileManagerResult,
} from "../types";
import { clearTokens, getAccessToken, getRefreshToken } from "../utils/token";

const API_BASE_URL = `${import.meta.env.VITE_CLINIC_BACKEND_URL}/api`;

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
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              withCredentials: true,
            }
          );

          if (response.data.user) {
            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response: AxiosResponse<LoginResponse> = await api.post(
      "/auth/login",
      credentials
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
    clearTokens();
  },

  refresh: async (): Promise<LoginResponse> => {
    const response: AxiosResponse<LoginResponse> = await api.post(
      "/auth/refresh"
    );
    return response.data;
  },
};

export const qrService = {
  getQR: async (deviceId?: string, doctorId?: string): Promise<QRData> => {
    const params = new URLSearchParams();
    if (deviceId) params.append("deviceId", deviceId);
    if (doctorId) params.append("doctorId", doctorId);

    const response: AxiosResponse<QRData> = await api.get(
      `/qr/generate?${params.toString()}`
    );
    return response.data;
  },
  getCurrentQR: async (): Promise<QRData> => {
    const response: AxiosResponse<QRData> = await api.get("/qr/current");
    return response.data;
  },
  validateToken: async (
    tokenId: string
  ): Promise<{ msg: string; valid: boolean; token?: any }> => {
    const response: AxiosResponse<{
      msg: string;
      valid: boolean;
      token?: any;
    }> = await api.get(`/qr/validate/${tokenId}`);
    return response.data;
  },
  consumeQr: async (qr: string, roomId?: string): Promise<QRData> => {
    const params = new URLSearchParams();
    if (roomId) params.append("roomId", roomId);

    console.log("🔍 [API] Consuming QR with params:", {
      qr,
      roomId,
      params: params.toString(),
    });
    const response: AxiosResponse<QRData> = await api.post(
      `/qr/consume/${qr}?${params.toString()}`
    );
    return response.data;
  },
};

export const registrationService = {
  createRegistration: async (
    tokenId: string,
    data: RegistrationData
  ): Promise<{ msg: string; registration: Registration }> => {
    const response: AxiosResponse<{ msg: string; registration: Registration }> =
      await api.post(`/registration/${tokenId}`, data);
    return response.data;
  },
  getRegistrationByToken: async (tokenId: string): Promise<Registration> => {
    const response: AxiosResponse<Registration> = await api.get(
      `/registration/token/${tokenId}`
    );
    return response.data;
  },
  updateRegistrationByToken: async (
    tokenId: string,
    data: RegistrationData
  ): Promise<{ msg: string; registration: Registration }> => {
    const response: AxiosResponse<{ msg: string; registration: Registration }> =
      await api.put(`/registration/token/${tokenId}`, data);
    return response.data;
  },

  getRegistrations: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<{ registrations: Registration[]; pagination: Pagination }> => {
    const response: AxiosResponse<{
      registrations: Registration[];
      pagination: Pagination;
    }> = await api.get("/registration", { params });
    return response.data;
  },

  getRegistrationById: async (id: string): Promise<Registration> => {
    const response: AxiosResponse<Registration> = await api.get(
      `/registration/${id}`
    );
    return response.data;
  },

  getRegistrationsByDoctor: async (
    doctorId: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
    }
  ): Promise<{ registrations: Registration[]; pagination: Pagination }> => {
    const response: AxiosResponse<{
      registrations: Registration[];
      pagination: Pagination;
    }> = await api.get(`/registration/doctor/${doctorId}`, { params });
    return response.data;
  },
};

export const adminService = {
  getUsers: async (params?: { role?: string }): Promise<any> => {
    const response: AxiosResponse<any> = await api.get("/admin/users", {
      params,
    });
    return response.data;
  },

  createUser: async (userData: UserManagementRequest): Promise<any> => {
    const response: AxiosResponse<any> = await api.post(
      "/admin/users",
      userData
    );
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },

  // Devices CRUD
  getDevices: async (params?: {
    page?: number;
    limit?: number;
    onlyAvailable?: boolean;
  }): Promise<any> => {
    const response: AxiosResponse<DeviceResult> = await api.get(
      `/admin/devices`,
      { params }
    );
    return response.data;
  },
  createDevice: async (payload: DeviceRequest): Promise<DeviceResult> => {
    const response: AxiosResponse<DeviceResult> = await api.post(
      `/admin/devices`,
      payload
    );
    return response.data;
  },
  updateDevice: async (
    id: string,
    payload: Partial<DeviceRequest>
  ): Promise<DeviceResult> => {
    const response: AxiosResponse<DeviceResult> = await api.put(
      `/admin/devices/${id}`,
      payload
    );
    return response.data;
  },
  deleteDevice: async (id: string): Promise<void> => {
    await api.delete(`/admin/devices/${id}`);
  },
};

export const deviceDoctorMappingService = {
  createMapping: async (data: CreateMappingRequest): Promise<MappingResult> => {
    const response: AxiosResponse<MappingResult> = await api.post(
      "/device-doctor-mapping",
      data
    );
    return response.data;
  },

  getCurrentMapping: async (deviceId: string): Promise<MappingResult> => {
    const response: AxiosResponse<MappingResult> = await api.get(
      `/device-doctor-mapping/device/${deviceId}`
    );
    return response.data;
  },

  endMapping: async (deviceId: string): Promise<MappingResult> => {
    const response: AxiosResponse<MappingResult> = await api.delete(
      `/device-doctor-mapping/${deviceId}`
    );
    return response.data;
  },

  getAllMappings: async (): Promise<MappingResult> => {
    const response: AxiosResponse<MappingResult> = await api.get(
      "/device-doctor-mapping"
    );
    return response.data;
  },
};

export const fileManagerService = {
  uploadFile: async (formData: FormData): Promise<FileManagerResult> => {
    const response: AxiosResponse<FileManagerResult> = await api.post(
      "/files/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  createUrlFile: async (data: {
    name: string;
    url: string;
    description?: string;
    tags?: string[];
  }): Promise<FileManagerResult> => {
    const response: AxiosResponse<FileManagerResult> = await api.post(
      "/files/url",
      data
    );
    return response.data;
  },

  getFiles: async (params?: {
    type?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ files: FileItem[]; pagination: Pagination }> => {
    const response: AxiosResponse<{
      files: FileItem[];
      pagination: Pagination;
    }> = await api.get("/files", { params });
    return response.data;
  },

  getFileById: async (id: string): Promise<{ file: FileItem }> => {
    const response: AxiosResponse<{ file: FileItem }> = await api.get(
      `/files/${id}`
    );
    return response.data;
  },

  downloadFile: async (id: string): Promise<Blob> => {
    const response: AxiosResponse<Blob> = await api.get(`/files/${id}/download`, {
      responseType: "blob",
    });
    return response.data;
  },

  deleteFile: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response: AxiosResponse<{ success: boolean; message: string }> =
      await api.delete(`/files/${id}`);
    return response.data;
  },

  accessFileByQR: async (fileId: string): Promise<{ success: boolean; message: string; file: FileItem }> => {
    const response: AxiosResponse<{ success: boolean; message: string; file: FileItem }> = await api.get(
      `/files/qr/${fileId}`
    );
    return response.data;
  },

};

export default api;
