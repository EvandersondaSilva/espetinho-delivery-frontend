"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "@/context/cartContext";
import { showSuccess } from "@/lib/toast";

/**
 * Detecta aumento na quantidade total de itens do carrinho e expõe um
 * estado de "bounce" pra animar o ícone/badge do carrinho, além de disparar
 * um toast de confirmação. Centralizado aqui (reagindo ao CartContext) em
 * vez de duplicado em cada lugar que chama addItem.
 */
export function useCartBounce() {
    const { items, isHydrated } = useCart();
    const [bounce, setBounce] = useState(false);
    const prevQuantityRef = useRef<number | null>(null);

    const quantity = items.reduce((acc, item) => acc + item.quantity, 0);

    useEffect(() => {
        if (!isHydrated) return;

        if (prevQuantityRef.current === null) {
            prevQuantityRef.current = quantity;
            return;
        }

        if (quantity > prevQuantityRef.current) {
            setBounce(true);
            showSuccess("Produto adicionado ao carrinho!");
        }

        prevQuantityRef.current = quantity;
    }, [quantity, isHydrated]);

    const onAnimationEnd = useCallback(() => {
        setBounce(false);
    }, []);

    return { bounce, onAnimationEnd };
}
