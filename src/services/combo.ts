import { apiClient } from "@/lib/api";
import { Combo } from "@/lib/types";

export async function getCombos(token: string): Promise<Combo[]> {
    return apiClient<Combo[]>("/combo", {
        token,
        cache: "no-store",
    });
}

export async function getCombo(id: string, token: string): Promise<Combo> {
    return apiClient<Combo>(`/combo/${id}`, {
        token,
        cache: "no-store",
    });
}

export async function getPublicCombos(): Promise<Combo[]> {
    return apiClient<Combo[]>("/combos", {
        cache: "no-store",
    });
}
