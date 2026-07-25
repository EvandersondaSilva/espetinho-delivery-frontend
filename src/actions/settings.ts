"use server";

import { apiClient } from "@/lib/api";
import { StoreSettings } from "@/lib/types";
import { getToken } from "@/lib/getToken";

/**
 * Action para abrir/fechar a loja
 * @param isStoreOpen - Novo estado da loja
 * @returns Objeto com sucesso/erro e as configurações atualizadas
 */
export async function updateStoreStatusAction(isStoreOpen: boolean) {
    try {
        const token = await getToken();

        if (!token) {
            return {
                success: false,
                message: "Erro ao atualizar loja: Token de autenticação não encontrado.",
                data: null,
            };
        }

        const response = await apiClient<StoreSettings>("/settings/store-status", {
            method: "PATCH",
            body: JSON.stringify({ isStoreOpen }),
            token,
        });

        return {
            success: true,
            message: "Status da loja atualizado com sucesso.",
            data: response,
        };
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Erro ao atualizar status da loja.";

        console.error("Error updating store status:", message);

        return {
            success: false,
            message: `Falha ao atualizar loja: ${message}`,
            data: null,
        };
    }
}

/**
 * Action para definir o valor mínimo do pedido
 * @param minOrderValue - Novo valor mínimo, em centavos
 * @returns Objeto com sucesso/erro e as configurações atualizadas
 */
export async function updateMinOrderValueAction(minOrderValue: number) {
    try {
        const token = await getToken();

        if (!token) {
            return {
                success: false,
                message: "Erro ao atualizar valor mínimo: Token de autenticação não encontrado.",
                data: null,
            };
        }

        const response = await apiClient<StoreSettings>("/settings/min-order-value", {
            method: "PATCH",
            body: JSON.stringify({ minOrderValue }),
            token,
        });

        return {
            success: true,
            message: "Valor mínimo do pedido atualizado com sucesso.",
            data: response,
        };
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Erro ao atualizar valor mínimo do pedido.";

        console.error("Error updating min order value:", message);

        return {
            success: false,
            message: `Falha ao atualizar valor mínimo: ${message}`,
            data: null,
        };
    }
}
