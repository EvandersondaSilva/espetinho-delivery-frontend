import { apiClient } from "@/lib/api";

export interface Category {
    id: string;
    name: string;
    createdAt: string;
}

export async function getAllCategories(): Promise<Category[]> {
    return apiClient<Category[]>("/category", {
        cache: "no-store"
    });
}