"use client";

import { useCallback, useEffect, useState } from "react";
import { Category } from "@/lib/types";
import { getAllCategories } from "@/services/catetory";
import { showError } from "@/lib/toast";

/**
 * Carrega a lista de categorias sob demanda.
 * @param enabled quando false, não busca (ex.: dialog fechado).
 */
export function useCategories(enabled: boolean = true) {
    const [categories, setCategories] = useState<Category[]>([]);

    const reload = useCallback(async () => {
        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch (error) {
            console.error("Erro ao carregar categorias:", error);
            showError("Erro ao carregar categorias");
        }
    }, []);

    useEffect(() => {
        if (enabled) reload();
    }, [enabled, reload]);

    return { categories, reload };
}
