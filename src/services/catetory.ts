import { apiClient } from "@/lib/api";

export interface Category {
    id: string;
    name: string;
    createdAt: string;
}

export async function getCategories(): Promise<Category[]> {
    return apiClient<Category[]>("/category");
}