import { Combo, ComboGroup } from "@/lib/types";

function isProductAvailable(product: { available: boolean; stock: number } | null | undefined) {
    return !!product && product.available && product.stock > 0;
}

export function isGroupFulfillable(group: ComboGroup): boolean {
    if (group.type === "FIXED_PRODUCT") {
        return group.fixedItems.every(isProductAvailable);
    }

    const availableProducts = group.products?.filter(isProductAvailable) ?? [];
    return availableProducts.length >= group.minQuantity;
}

export function isComboAvailable(combo: Combo): boolean {
    if (!combo.available) return false;
    return combo.groups.every(isGroupFulfillable);
}
