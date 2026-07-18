"use client";

import { Product } from "@/services/product";
import { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from "react";

interface CartItem {
    product: Product;
    quantity: number;
    notes?: string;
}

export interface CartCombo {
    cartComboId: string;
    comboId: string;
    name: string;
    price: number;
    imageUrl: string | null;
    selections: { productId: string; quantity: number }[];
    displayItems: { productId: string; name: string; quantity: number }[];
}

interface CartContextProps {
    items: CartItem[];
    combos: CartCombo[];
    addItem: (product: Product, quantity?: number, notes?: string) => void;
    decreaseItem: (productId: string, notes?: string) => void;
    removeItem: (productId: string, notes?: string) => void;
    addCombo: (combo: Omit<CartCombo, "cartComboId">) => void;
    removeCombo: (cartComboId: string) => void;
    clearCart: () => void;
    total: number;
    itemsCount: number;
    isHydrated: boolean;
}

const CartContext = createContext<CartContextProps>({} as CartContextProps);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [combos, setCombos] = useState<CartCombo[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Carregar dados do localStorage ao iniciar
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedCart = localStorage.getItem("cart");
            if (savedCart) {
                try {
                    const parsed = JSON.parse(savedCart);
                    // Formato antigo: array puro de items. Formato novo: { items, combos }.
                    if (Array.isArray(parsed)) {
                        setItems(parsed);
                    } else {
                        setItems(parsed.items || []);
                        setCombos(parsed.combos || []);
                    }
                } catch (error) {
                    console.error("Erro ao carregar carrinho do localStorage:", error);
                }
            }
            setIsHydrated(true);
        }
    }, []);

    // Salvar no localStorage sempre que items/combos mudar
    useEffect(() => {
        if (isHydrated && typeof window !== "undefined") {
            localStorage.setItem("cart", JSON.stringify({ items, combos }));
        }
    }, [items, combos, isHydrated]);

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

    const addCombo = useCallback((combo: Omit<CartCombo, "cartComboId">) => {
        setCombos((prev) => [...prev, { ...combo, cartComboId: crypto.randomUUID() }]);
    }, []);

    const removeCombo = useCallback((cartComboId: string) => {
        setCombos((prev) => prev.filter((combo) => combo.cartComboId !== cartComboId));
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
        setCombos([]);
    }, []);

    const total = useMemo(() =>
        items.reduce((acc, item) => acc + item.product.price * item.quantity, 0) +
        combos.reduce((acc, combo) => acc + combo.price, 0),
        [items, combos]
    );

    const itemsCount = useMemo(() =>
        items.reduce((acc, item) => acc + item.quantity, 0) + combos.length,
        [items, combos]
    );

    const value = useMemo(
        () => ({
            items,
            combos,
            addItem,
            decreaseItem,
            removeItem,
            addCombo,
            removeCombo,
            clearCart,
            total,
            itemsCount,
            isHydrated,
        }),
        [items, combos, addItem, decreaseItem, removeItem, addCombo, removeCombo, clearCart, total, itemsCount, isHydrated]
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