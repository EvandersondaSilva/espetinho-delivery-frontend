import { apiClient } from "@/lib/api";
import { StoreSettings } from "@/lib/types";

export async function getStoreSettings(): Promise<StoreSettings> {
    return apiClient<StoreSettings>("/settings", {
        cache: "no-store",
    });
}
