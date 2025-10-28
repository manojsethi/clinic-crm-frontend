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
  // Patient Information
  name: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  dob?: string;
  
  // Contact Information
  address?: string;
  contactNumber?: string;
  email?: string;
  
  // Medical Information
  allergies?: string;
  currentMedicalIllness?: string;
  symptoms?: string;
  
  // Legacy fields for backward compatibility
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
  _id: string;
  tokenId: any;
  name: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  dob?: string;
  address?: string;
  contactNumber?: string;
  email?: string;
  allergies?: string;
  currentMedicalIllness?: string;
  symptoms?: string;
  deviceId?: any;
  doctorId?: any;
  createdAt: string;
}

export interface PopulatedRegistration extends Registration {
  deviceId: {
    _id: string;
    deviceName: string;
    roomName?: string;
  };
  doctorId: {
    _id: string;
    username: string;
    role: string;
  };
  tokenId: {
    _id: string;
    token: string;
    createdAt: string;
    consumedAt?: string;
  };
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
    qrToken?: string;
  };
}

// File Manager interfaces
export interface FileItem {
  _id: string;
  name: string;
  type: 'file' | 'image' | 'url';
  size?: number;
  url?: string;
  filePath?: string;
  mimeType?: string;
  description?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isActive: boolean;
}

export interface UploadRequest {
  name: string;
  type: 'file' | 'image' | 'url';
  description?: string;
  tags?: string[];
  url?: string;
  file?: File;
}

export interface FileManagerResult {
  success: boolean;
  message?: string;
  file?: FileItem;
  data?: {
    file?: FileItem;
    files?: FileItem[];
    pagination?: Pagination;
  };
}

export interface ScannerData {
  fileId: string;
  fileName: string;
  fileType: string;
  qrCode: string;
  createdAt: string;
}
