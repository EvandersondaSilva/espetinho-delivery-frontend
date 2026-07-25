"use client";

import { useCallback, useState } from "react";
import { ComboGroupType } from "@/lib/types";

export interface ComboGroupFixedItemFormValue {
    productId: string;
    quantity: number;
}

export interface ComboGroupFormValue {
    type: ComboGroupType;
    label: string;
    categoryIds: string[];
    fixedItems: ComboGroupFixedItemFormValue[];
    productIds: string[];
    minQuantity: number;
    /** string para permitir campo vazio; "" = deixa o backend usar minQuantity como default */
    maxQuantity: string;
}

const EMPTY_GROUP: ComboGroupFormValue = {
    type: "CATEGORY_CHOICE",
    label: "",
    categoryIds: [],
    fixedItems: [],
    productIds: [],
    minQuantity: 1,
    maxQuantity: "",
};

export function useComboGroups(initialGroups: ComboGroupFormValue[] = []) {
    const [groups, setGroups] = useState<ComboGroupFormValue[]>(initialGroups);

    const addGroup = useCallback(() => {
        setGroups((prev) => [...prev, { ...EMPTY_GROUP }]);
    }, []);

    const removeGroup = useCallback((index: number) => {
        setGroups((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const updateGroup = useCallback((index: number, patch: Partial<ComboGroupFormValue>) => {
        setGroups((prev) =>
            prev.map((group, i) => (i === index ? { ...group, ...patch } : group))
        );
    }, []);

    const resetGroups = useCallback((next: ComboGroupFormValue[] = []) => {
        setGroups(next);
    }, []);

    return { groups, addGroup, removeGroup, updateGroup, resetGroups };
}

/**
 * Validação client-side antes de enviar — o backend também valida
 * (inclusive overlap entre grupos), essa checagem é só pra evitar
 * um round-trip óbvio com campo vazio.
 */
export function validateComboGroups(groups: ComboGroupFormValue[]): string | null {
    if (groups.length === 0) {
        return "Adicione pelo menos um grupo ao combo.";
    }

    for (const group of groups) {
        if (!group.label.trim()) {
            return 'Preencha o texto ("label") de todos os grupos.';
        }

        if (group.type === "CATEGORY_CHOICE" && group.categoryIds.length === 0) {
            return 'Selecione pelo menos uma categoria em todos os grupos do tipo "Escolha por categoria".';
        }

        if (group.type === "FIXED_PRODUCT") {
            if (group.fixedItems.length === 0) {
                return 'Adicione pelo menos um produto fixo em todos os grupos do tipo "Produto fixo".';
            }

            for (const item of group.fixedItems) {
                if (!item.productId || !item.quantity || item.quantity < 1) {
                    return "Selecione o produto e uma quantidade válida em todos os produtos fixos.";
                }
            }
        }

        if (group.type === "PRODUCT_CHOICE" && group.productIds.length < 2) {
            return 'Selecione pelo menos 2 produtos em todos os grupos do tipo "Escolha entre produtos específicos".';
        }

        if (group.type === "CATEGORY_CHOICE" || group.type === "PRODUCT_CHOICE") {
            if (!group.minQuantity || group.minQuantity < 1) {
                return "A quantidade mínima de cada grupo deve ser pelo menos 1.";
            }

            if (group.maxQuantity && Number(group.maxQuantity) < group.minQuantity) {
                return "A quantidade máxima não pode ser menor que a mínima.";
            }
        }
    }

    return null;
}

/**
 * Converte os grupos do formulário pro formato esperado pelo backend.
 * `maxQuantity` é omitido quando vazio, pro backend aplicar o default (= minQuantity).
 */
export function serializeComboGroups(groups: ComboGroupFormValue[]) {
    return groups.map((group) => ({
        type: group.type,
        label: group.label.trim(),
        ...(group.type === "CATEGORY_CHOICE"
            ? {
                categoryIds: group.categoryIds,
                minQuantity: group.minQuantity,
                ...(group.maxQuantity ? { maxQuantity: Number(group.maxQuantity) } : {}),
            }
            : group.type === "PRODUCT_CHOICE"
                ? {
                    productIds: group.productIds,
                    minQuantity: group.minQuantity,
                    ...(group.maxQuantity ? { maxQuantity: Number(group.maxQuantity) } : {}),
                }
                : { fixedItems: group.fixedItems }),
    }));
}
