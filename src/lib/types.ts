export interface AuthResponse {
    id: string;
    name: string;
    role: "ADMIN";
    token: string;
}

export interface User {
    id: string;
    name: string;
    role: string;
}

export interface UseAuthReturn {
    user: User | null;
    token: string | null;
    loading: boolean;
    logout: () => void;
    isAuthenticated: boolean;
}

export interface Category {
    id: string;
    name: string;
    createdAt: string;
}