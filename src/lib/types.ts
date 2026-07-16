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

export interface Product {
    id: string;
    name: string;
    price: number;
    description: string | null;
    imageUrl: string | null;
    available: boolean;
    stock: number;
    categoryId: string;
    createdAt: string;
}

export enum OrderStatus {
    RECEBIDO = "RECEBIDO",
    PREPARANDO = "PREPARANDO",
    SAIU = "SAIU",
    ENTREGUE = "ENTREGUE",
}

export interface OrderItemProduct {
    id: string;
    name: string;
    imageUrl: string | null;
}

export interface OrderItem {
    id: string;
    productId: string;
    quantity: number;
    price: number;
    product: OrderItemProduct;
}

export interface Order {
    id: string;
    customerName: string;
    phone: string;
    address: string;
    deliveryFee: number;
    total: number;
    status: OrderStatus;
    createdAt: string;
    items: OrderItem[];
}
