"use server";

import { apiClient } from "@/lib/api";
import { Order } from "@/lib/types";
import { cookies } from "next/headers";

/**
 * Obtém o token de autenticação dos cookies
 */
async function getToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get("authToken")?.value || null;
}

/**
 * Action para atualizar o status de um pedido
 * @param orderId - ID do pedido
 * @param status - Novo status do pedido
 * @returns Objeto com sucesso/erro e dados do pedido
 */
export async function updateOrderStatusAction(
    orderId: string,
    status: "RECEBIDO" | "PREPARANDO" | "SAIU" | "ENTREGUE"
) {
    try {
        const token = await getToken();

        if (!token) {
            return {
                success: false,
                message: "Erro ao atualizar pedido: Token de autenticação não encontrado.",
                data: null,
            };
        }

        const response = await apiClient<Order>(`/order/${orderId}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
            token: token,
        });

        return {
            success: true,
            message: "Pedido atualizado com sucesso.",
            data: response,
        };
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Erro ao atualizar status do pedido.";

        console.error("Error updating order status:", message);

        return {
            success: false,
            message: `Falha ao atualizar pedido: ${message}`,
            data: null,
        };
    }
}
