import { apiClient } from "@/lib/api";

export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
    available: boolean;
    categoryId: string;
    createdAt: string;
}


export async function getproductsByCategoryId(categoryId: string): Promise<Product[]> {
    return (
        apiClient<Product[]>(`/category/${categoryId}/products`)
    )
}

export async function getAllProducts(): Promise<Product[]> {
    return apiClient<Product[]>("/products");
}