import { apiClient } from "@/lib/api";

export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
    available: boolean;
    stock: number;
    categoryId: string;
    createdAt: string;
}

export interface UpdateProductData {
    name?: string;
    price?: number;
    description?: string | null;
    categoryId?: string;
    file?: File;
    removeImage?: boolean;
}

/**
 * Prepara FormData para atualização parcial de produto
 * Apenas adiciona campos que foram preenchidos/alterados
 */
export function prepareUpdateProductFormData(
    formData: FormData,
    removeImage: boolean = false
): FormData {
    const uploadFormData = new FormData();

    // Obter dados do form
    const file = formData.get("file") as File | null;
    const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") as string;
    const stock = formData.get("stock") as string;

    // Adicionar arquivo se selecionado
    if (file && file.size > 0) {
        uploadFormData.append("file", file);
    }

    // Flag para remover imagem existente
    if (removeImage) {
        uploadFormData.append("removeImage", "true");
    }

    // Campos obrigatórios
    if (name?.trim()) {
        uploadFormData.append("name", name);
    }

    if (price?.trim()) {
        uploadFormData.append("price", price);
    }

    // Descrição: opcional e pode ser vazia
    if (description !== undefined) {
        uploadFormData.append("description", description || "");
    }

    // Categoria: opcional
    if (categoryId?.trim()) {
        uploadFormData.append("categoryId", categoryId);
    }

    // Estoque: opcional
    if (stock?.trim()) {
        uploadFormData.append("stock", stock);
    }

    return uploadFormData;
}

export async function getproductsByCategoryId(categoryId: string): Promise<Product[]> {
    return apiClient<Product[]>(`/category/${categoryId}/products`, {
        cache: "no-store"
    });
}

export async function getAllProducts(): Promise<Product[]> {
    return apiClient<Product[]>("/product", {
        cache: "no-store"
    });
}