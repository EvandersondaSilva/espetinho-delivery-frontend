"use client";

import { useCallback, useMemo, useState } from "react";
import { Combo, ComboGroup } from "@/lib/types";
import { CartCombo } from "@/context/cartContext";

type Quantities = Record<string, Record<string, number>>;

function isProductAvailable(product: { available: boolean; stock: number } | null | undefined) {
    return !!product && product.available && product.stock > 0;
}

export function useComboSelection(combo: Combo) {
    const [quantities, setQuantities] = useState<Quantities>({});

    const groupTotal = useCallback(
        (groupId: string) => {
            const group = quantities[groupId];
            if (!group) return 0;
            return Object.values(group).reduce((acc, qty) => acc + qty, 0);
        },
        [quantities]
    );

    const quantityOf = useCallback(
        (groupId: string, productId: string) => quantities[groupId]?.[productId] || 0,
        [quantities]
    );

    const canIncrement = useCallback(
        (group: ComboGroup, productId: string) => {
            const product = group.category?.products?.find((p) => p.id === productId);
            if (!isProductAvailable(product)) return false;
            return groupTotal(group.id) < group.maxQuantity;
        },
        [groupTotal]
    );

    const increment = useCallback(
        (group: ComboGroup, productId: string) => {
            if (!canIncrement(group, productId)) return;

            setQuantities((prev) => {
                const groupQuantities = prev[group.id] || {};
                return {
                    ...prev,
                    [group.id]: {
                        ...groupQuantities,
                        [productId]: (groupQuantities[productId] || 0) + 1,
                    },
                };
            });
        },
        [canIncrement]
    );

    const decrement = useCallback((group: ComboGroup, productId: string) => {
        setQuantities((prev) => {
            const groupQuantities = prev[group.id];
            if (!groupQuantities || !groupQuantities[productId]) return prev;

            const nextQty = groupQuantities[productId] - 1;
            const nextGroupQuantities = { ...groupQuantities };

            if (nextQty <= 0) {
                delete nextGroupQuantities[productId];
            } else {
                nextGroupQuantities[productId] = nextQty;
            }

            return { ...prev, [group.id]: nextGroupQuantities };
        });
    }, []);

    const isGroupComplete = useCallback(
        (group: ComboGroup) => {
            if (group.type === "FIXED_PRODUCT") return true;
            return groupTotal(group.id) >= group.minQuantity;
        },
        [groupTotal]
    );

    const canAddToCart = useMemo(
        () => combo.groups.every(isGroupComplete),
        [combo.groups, isGroupComplete]
    );

    const buildCartCombo = useCallback((): Omit<CartCombo, "cartComboId"> => {
        const displayItems: CartCombo["displayItems"] = [];
        const selections: CartCombo["selections"] = [];

        combo.groups.forEach((group) => {
            if (group.type === "FIXED_PRODUCT") {
                if (!group.productId || !group.product) return;
                selections.push({ productId: group.productId, quantity: group.minQuantity });
                displayItems.push({
                    productId: group.productId,
                    name: group.product.name,
                    quantity: group.minQuantity,
                });
                return;
            }

            const groupQuantities = quantities[group.id] || {};
            Object.entries(groupQuantities).forEach(([productId, quantity]) => {
                if (quantity <= 0) return;
                const product = group.category?.products?.find((p) => p.id === productId);
                selections.push({ productId, quantity });
                displayItems.push({
                    productId,
                    name: product?.name || "",
                    quantity,
                });
            });
        });

        return {
            comboId: combo.id,
            name: combo.name,
            price: combo.price,
            imageUrl: combo.imageUrl,
            selections,
            displayItems,
        };
    }, [combo, quantities]);

    return {
        groupTotal,
        quantityOf,
        canIncrement,
        increment,
        decrement,
        isGroupComplete,
        canAddToCart,
        buildCartCombo,
    };
}
