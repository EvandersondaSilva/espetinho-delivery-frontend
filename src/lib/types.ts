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
    displayOrder: number;
    createdAt: string;
}

export interface StoreSettings {
    id: string;
    isStoreOpen: boolean;
    createdAt: string;
    updatedAt: string;
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

export type ComboGroupType = "CATEGORY_CHOICE" | "FIXED_PRODUCT";

export interface ComboGroup {
    id: string;
    type: ComboGroupType;
    label: string;
    categoryId: string | null;
    category: { id: string; name: string; products?: Product[] } | null;
    productId: string | null;
    product: Product | null;
    minQuantity: number;
    maxQuantity: number;
}

export interface Combo {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    available: boolean;
    createdAt: string;
    groups: ComboGroup[];
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

export interface OrderComboItem {
    id: string;
    productId: string;
    quantity: number;
    product: OrderItemProduct;
}

export interface OrderCombo {
    id: string;
    comboId: string;
    price: number;
    combo: { id: string; name: string; imageUrl: string | null };
    items: OrderComboItem[];
}

export interface Order {
    id: string;
    customerName: string;
    phone: string;
    address: string;
    deliveryFee: number;
    total: number;
    status: OrderStatus;
    paymentMethod: string | null;
    changeFor: number | null;
    noChangeNeeded: boolean;
    createdAt: string;
    items: OrderItem[];
    combos: OrderCombo[];
}
