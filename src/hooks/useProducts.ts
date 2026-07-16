"use client";

import { useCallback, useEffect, useState } from "react";
import { Product, getAllProducts } from "@/services/product";
import { showError } from "@/lib/toast";

/**
 * Carrega a lista de todos os produtos sob demanda.
 * @param enabled quando false, não busca (ex.: dialog fechado).
 */
export function useProducts(enabled: boolean = true) {
    const [products, setProducts] = useState<Product[]>([]);

    const reload = useCallback(async () => {
        try {
            const data = await getAllProducts();
            setProducts(data);
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
            showError("Erro ao carregar produtos");
        }
    }, []);

    useEffect(() => {
        if (enabled) reload();
    }, [enabled, reload]);

    return { products, reload };
}
