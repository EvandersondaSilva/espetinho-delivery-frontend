"use server";

import { apiClient } from "@/lib/api";
import { Product } from "@/lib/types";
import { prepareUpdateProductFormData } from "@/services/product";
import { revalidatePath } from "next/cache";
import { getToken } from "@/lib/getToken";

export async function createProductAction(formData: FormData) {


    try {
        const token = await getToken();

        if (!token) {
            return { success: false, message: "Erro ao criar produto: Token de autenticação não encontrado." };
        }


        const file = formData.get("file") as File;
        const name = formData.get("name") as string;
        const price = formData.get("price") as string; // já em centavos
        const description = formData.get("description") as string;
        const categoryId = formData.get("categoryId") as string;
        const stock = formData.get("stock") as string;



        // Criar FormData para envio multipart
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("name", name);
        uploadFormData.append("price", price);
        uploadFormData.append("description", description);
        uploadFormData.append("categoryId", categoryId);

        // Estoque: opcional (backend usa default 0 se omitido)
        if (stock?.trim()) {
            uploadFormData.append("stock", stock);
        }



        await apiClient<Product>("/product", {
            method: "POST",
            body: uploadFormData,
            token: token,
        });

        revalidatePath("/admin/dashboard/products");

        return { success: true, message: "Produto criado com sucesso!" };
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error creating product:", error.message);
            return { success: false, message: error.message };
        }

        return { success: false, message: "An error occurred while creating the product." };
    }
}

export async function updateProductAction(
    productId: string,
    formData: FormData,
    removeImage: boolean = false
) {
    try {
        const token = await getToken();

        if (!token) {
            return { success: false, message: "Token não encontrado." };
        }

        const uploadFormData = prepareUpdateProductFormData(formData, removeImage);

        await apiClient<Product>(`/product/${productId}`, {
            method: "PUT",
            body: uploadFormData,
            token: token,
        });

        revalidatePath("/admin/dashboard/products");
        return { success: true, message: "Produto atualizado com sucesso!" };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: "Erro ao atualizar produto." };
    }
}


export async function deleteProductAction(productId: string) {
    try {
        const token = await getToken();

        if (!token) {
            return { success: false, message: "Erro ao deletar produto: Token de autenticação não encontrado." };
        }

        await apiClient<Product>(`/product/${productId}`, {
            method: "DELETE",
            token: token,
        });

        revalidatePath("/admin/dashboard/products");

        return { success: true, message: "Produto deletado com sucesso!" };
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error deleting product:", error.message);
            return { success: false, message: error.message };
        }

        return { success: false, message: "An error occurred while deleting the product." };
    }
}

export async function enableProductAction(productId: string) {
    try {
        const token = await getToken();

        if (!token) {
            return { success: false, message: "Erro ao habilitar produto: Token de autenticação não encontrado." };
        }

        await apiClient<Product>(`/product/${productId}/enable`, {
            method: "PATCH",
            token: token,
        });

        revalidatePath("/admin/dashboard/products");

        return { success: true, message: "Produto habilitado com sucesso!" };
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error enabling product:", error.message);
            return { success: false, message: error.message };
        }

        return { success: false, message: "An error occurred while enabling the product." };
    }
}

export async function disableProductAction(productId: string) {
    try {
        const token = await getToken();

        if (!token) {
            return { success: false, message: "Erro ao desabilitar produto: Token de autenticação não encontrado." };
        }

        await apiClient<Product>(`/product/${productId}/disable`, {
            method: "PATCH",
            token: token,
        });

        revalidatePath("/admin/dashboard/products");

        return { success: true, message: "Produto desabilitado com sucesso!" };
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error disabling product:", error.message);
            return { success: false, message: error.message };
        }

        return { success: false, message: "An error occurred while disabling the product." };
    }
}
