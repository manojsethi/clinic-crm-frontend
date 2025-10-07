export interface User {
  id: string;
  username: string;
  role: "admin" | "staff" | "doctor";
  _id: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}

export interface RegistrationData {
  name: string;
  age: number;
  symptoms?: string;
  deviceId?: string;
  doctorId?: string;
  deviceName?: string;
  doctorName?: string;
}

export interface UserManagementRequest {
  username: string;
  password: string;
  role: string;
}

export interface UserManagementResponse {
  users: User[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface Registration {
  id: string;
  tokenId: string;
  name: string;
  age: number;
  symptoms?: string;
  createdAt: string;
}

export interface QRData {
  token: string;
  valid: boolean;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Devices
export interface Device {
  _id: string;
  deviceId: string;
  deviceName: string;
  roomName: string;
  doctor: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeviceRequest {
  deviceId: string;
  deviceName: string;
  roomName: string;
  doctor: string;
}

export interface DeviceResult {
  success: boolean;
  message?: string;
  data?: {
    device?: Device;
    devices?: Device[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// Device-Doctor Mapping interfaces
export interface DeviceDoctorMapping {
  _id: string;
  deviceId: {
    _id: string;
    deviceId: string;
    deviceName: string;
  };
  doctorId: {
    _id: string;
    username: string;
    role: string;
  };
  startTime: string;
  endTime?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMappingRequest {
  deviceId: string;
  doctorId: string;
  notes?: string;
}

export interface MappingResult {
  success: boolean;
  message?: string;
  data?: {
    mapping?: DeviceDoctorMapping;
    mappings?: DeviceDoctorMapping[];
  };
}
