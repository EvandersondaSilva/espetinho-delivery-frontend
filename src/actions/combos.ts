"use server";

import { apiClient } from "@/lib/api";
import { Combo } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { getToken } from "@/lib/getToken";

export async function createComboAction(formData: FormData) {
    try {
        const token = await getToken();

        if (!token) {
            return { success: false, message: "Erro ao criar combo: Token de autenticação não encontrado." };
        }

        await apiClient<Combo>("/combo", {
            method: "POST",
            body: formData,
            token: token,
        });

        revalidatePath("/admin/dashboard/combos");

        return { success: true, message: "Combo criado com sucesso!" };
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error creating combo:", error.message);
            return { success: false, message: error.message };
        }

        return { success: false, message: "Erro ao criar combo." };
    }
}

export async function updateComboAction(
    comboId: string,
    formData: FormData,
    removeImage: boolean = false
) {
    try {
        const token = await getToken();

        if (!token) {
            return { success: false, message: "Token não encontrado." };
        }

        if (removeImage) {
            formData.append("removeImage", "true");
        }

        await apiClient<Combo>(`/combo/${comboId}`, {
            method: "PUT",
            body: formData,
            token: token,
        });

        revalidatePath("/admin/dashboard/combos");
        return { success: true, message: "Combo atualizado com sucesso!" };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: "Erro ao atualizar combo." };
    }
}

export async function deleteComboAction(comboId: string) {
    try {
        const token = await getToken();

        if (!token) {
            return { success: false, message: "Erro ao deletar combo: Token de autenticação não encontrado." };
        }

        await apiClient<Combo>(`/combo/${comboId}`, {
            method: "DELETE",
            token: token,
        });

        revalidatePath("/admin/dashboard/combos");

        return { success: true, message: "Combo deletado com sucesso!" };
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error deleting combo:", error.message);
            return { success: false, message: error.message };
        }

        return { success: false, message: "Erro ao deletar combo." };
    }
}

export async function enableComboAction(comboId: string) {
    try {
        const token = await getToken();

        if (!token) {
            return { success: false, message: "Erro ao habilitar combo: Token de autenticação não encontrado." };
        }

        await apiClient<Combo>(`/combo/${comboId}/enable`, {
            method: "PATCH",
            token: token,
        });

        revalidatePath("/admin/dashboard/combos");

        return { success: true, message: "Combo habilitado com sucesso!" };
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error enabling combo:", error.message);
            return { success: false, message: error.message };
        }

        return { success: false, message: "Erro ao habilitar combo." };
    }
}

export async function disableComboAction(comboId: string) {
    try {
        const token = await getToken();

        if (!token) {
            return { success: false, message: "Erro ao desabilitar combo: Token de autenticação não encontrado." };
        }

        await apiClient<Combo>(`/combo/${comboId}/disable`, {
            method: "PATCH",
            token: token,
        });

        revalidatePath("/admin/dashboard/combos");

        return { success: true, message: "Combo desabilitado com sucesso!" };
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error disabling combo:", error.message);
            return { success: false, message: error.message };
        }

        return { success: false, message: "Erro ao desabilitar combo." };
    }
}
