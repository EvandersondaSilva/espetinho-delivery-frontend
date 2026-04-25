"use server";

import { apiClient } from "@/lib/api";
import { Category } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

async function getToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get("authToken")?.value || null;
}

export async function createCategoryAction(formData: FormData) {

    try {

        const token = await getToken();
        const name = formData.get("name") as string;

        if (!token) {
            return { success: false, message: "Erro ao criar categoria: Token de autenticação não encontrado." };
        }

        const data = {
            name: name,
        }

        await apiClient<Category>("/category", {
            method: "POST",
            body: JSON.stringify(data),
            token: token
        })

        revalidatePath("/admin/dashboard/categories");

        return { success: true, error: "" };

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

        if (!token) {
            return { success: false, message: "Erro ao atualizar categoria: Token de autenticação não encontrado." };
        }

        const data = {
            name: name,
        }

        await apiClient<Category>(`/category/${categoryId}`, {
            method: "PUT",
            body: JSON.stringify(data),
            token: token
        })

        revalidatePath("/admin/dashboard/categories");

        return { success: true, error: "" };

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

        return { success: true, error: "" };

    } catch (error) {
        if (error instanceof Error) {
            console.error("Error deleting category:", error.message);
        }

        return { success: false, message: "An error occurred while deleting the category." };
    }

}