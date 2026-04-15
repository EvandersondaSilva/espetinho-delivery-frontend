"use client";

import { Product } from "@/services/product";
import { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from "react";

interface CartItem {
    product: Product;
    quantity: number;
    notes?: string;
}

interface CartContextProps {
    items: CartItem[];
    addItem: (product: Product, quantity?: number, notes?: string) => void;
    decreaseItem: (productId: string, notes?: string) => void;
    removeItem: (productId: string, notes?: string) => void;
    clearCart: () => void;
    total: number;
    itemsCount: number;
}

const CartContext = createContext<CartContextProps>({} as CartContextProps);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Carregar dados do localStorage ao iniciar
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedCart = localStorage.getItem("cart");
            if (savedCart) {
                try {
                    setItems(JSON.parse(savedCart));
                } catch (error) {
                    console.error("Erro ao carregar carrinho do localStorage:", error);
                }
            }
            setIsHydrated(true);
        }
    }, []);

    // Salvar no localStorage sempre que items mudar
    useEffect(() => {
        if (isHydrated && typeof window !== "undefined") {
            localStorage.setItem("cart", JSON.stringify(items));
        }
    }, [items, isHydrated]);

    const addItem = useCallback((product: Product, quantity: number = 1, notes?: string) => {
        setItems((prev) => {
            const existing = prev.find((item) => item.product.id === product.id && item.notes === notes);

            if (existing) {
                return prev.map((item) =>
                    item.product.id === product.id && item.notes === notes
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            return [...prev, { product, quantity, notes }];
        });
    }, []);

    const decreaseItem = useCallback((productId: string, notes?: string) => {
        setItems((prev) => {
            const existingIndex = prev.findIndex((item) => item.product.id === productId && item.notes === notes);
            if (existingIndex === -1) return prev;

            const existing = prev[existingIndex];
            if (existing.quantity <= 1) {
                return prev.filter((item, index) => index !== existingIndex);
            }

            return prev.map((item, index) =>
                index === existingIndex ? { ...item, quantity: item.quantity - 1 } : item
            );
        });
    }, []);

    const removeItem = useCallback((productId: string, notes?: string) => {
        setItems((prev) => prev.filter((item) => !(item.product.id === productId && item.notes === notes)));
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const total = useMemo(() =>
        items.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
        [items]
    );

    const itemsCount = useMemo(() =>
        items.reduce((acc, item) => acc + item.quantity, 0),
        [items]
    );

    const value = useMemo(
        () => ({ items, addItem, decreaseItem, removeItem, clearCart, total, itemsCount }),
        [items, addItem, decreaseItem, removeItem, clearCart, total, itemsCount]
    );

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext)
}