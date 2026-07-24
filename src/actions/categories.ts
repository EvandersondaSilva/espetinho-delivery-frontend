"use server";

import { apiClient } from "@/lib/api";
import { Category } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { getToken } from "@/lib/getToken";

export async function createCategoryAction(formData: FormData) {

    try {

        const token = await getToken();
        const name = formData.get("name") as string;
        const displayOrder = formData.get("displayOrder") as string;

        if (!token) {
            return { success: false, message: "Erro ao criar categoria: Token de autenticação não encontrado." };
        }

        const data = {
            name: name,
            displayOrder: displayOrder?.trim() ? parseInt(displayOrder, 10) : undefined,
        }

        await apiClient<Category>("/category", {
            method: "POST",
            body: JSON.stringify(data),
            token: token
        })

        revalidatePath("/admin/dashboard/categories");

        return { success: true, message: "Categoria criada com sucesso!" };

    } catch (error) {
        if (error instanceof Error) {
            console.error("Error creating category:", error.message);
        }

        return { success: false, message: "An error occurred while creating the category." };
    }

}

export async function updateCategoryAction(categoryId: string, formData: FormData) {

    try {

        const token = await getToken();
        const name = formData.get("name") as string;
        const displayOrder = formData.get("displayOrder") as string;

        if (!token) {
            return { success: false, message: "Erro ao atualizar categoria: Token de autenticação não encontrado." };
        }

        const data = {
            name: name,
            displayOrder: displayOrder?.trim() ? parseInt(displayOrder, 10) : undefined,
        }

        await apiClient<Category>(`/category/${categoryId}`, {
            method: "PUT",
            body: JSON.stringify(data),
            token: token
        })

        revalidatePath("/admin/dashboard/categories");

        return { success: true, message: "Categoria atualizada com sucesso!" };

    } catch (error) {
        if (error instanceof Error) {
            console.error("Error updating category:", error.message);
        }

        return { success: false, message: "An error occurred while updating the category." };
    }

}

export async function deleteCategoryAction(categoryId: string) {

    try {

        const token = await getToken();

        if (!token) {
            return { success: false, message: "Erro ao deletar categoria: Token de autenticação não encontrado." };
        }

        await apiClient<Category>(`/category/${categoryId}`, {
            method: "DELETE",
            token: token
        })

        revalidatePath("/admin/dashboard/categories");

        return { success: true, message: "Categoria deletada com sucesso!" };

    } catch (error) {
        if (error instanceof Error) {
            console.error("Error deleting category:", error.message);
        }

        return { success: false, message: "An error occurred while deleting the category." };
    }

}