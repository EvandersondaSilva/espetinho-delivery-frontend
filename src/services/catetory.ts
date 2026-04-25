import { apiClient } from "@/lib/api";

export interface Category {
    id: string;
    name: string;
    createdAt: string;
}

export async function getAllCategories(): Promise<Category[]> {
    return apiClient<Category[]>("/category");
}

export async function getCategories() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category`);

    if (!response.ok) {
        throw new Error("Erro ao buscar categorias");
    }

    return response.json();
}