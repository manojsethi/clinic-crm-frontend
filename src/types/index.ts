export interface User {
    id: string;
    username: string;
    role: 'admin' | 'staff';
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
