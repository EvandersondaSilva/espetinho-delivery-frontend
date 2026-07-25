"use server";

import { apiClient } from "@/lib/api";
import { Order } from "@/lib/types";
import { getToken } from "@/lib/getToken";

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

/**
 * Action para marcar um pedido como já impresso (usada pela impressão
 * automática via QZ Tray, pra não reimprimir o mesmo pedido a cada polling)
 * @param orderId - ID do pedido
 * @returns Objeto com sucesso/erro e dados do pedido
 */
export async function markOrderPrintedAction(orderId: string) {
    try {
        const token = await getToken();

        if (!token) {
            return {
                success: false,
                message: "Erro ao marcar pedido como impresso: Token de autenticação não encontrado.",
                data: null,
            };
        }

        const response = await apiClient<Order>(`/order/${orderId}/mark-printed`, {
            method: "PATCH",
            token: token,
        });

        return {
            success: true,
            message: "Pedido marcado como impresso.",
            data: response,
        };
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Erro ao marcar pedido como impresso.";

        console.error("Error marking order as printed:", message);

        return {
            success: false,
            message: `Falha ao marcar pedido como impresso: ${message}`,
            data: null,
        };
    }
}

/**
 * Action para adicionar um produto a um pedido existente
 * @param orderId - ID do pedido
 * @param productId - ID do produto a adicionar
 * @param quantity - Quantidade a adicionar (soma se o produto já estiver no pedido)
 * @returns Objeto com sucesso/erro e o pedido atualizado
 */
export async function addOrderItemAction(orderId: string, productId: string, quantity: number) {
    try {
        const token = await getToken();

        if (!token) {
            return {
                success: false,
                message: "Erro ao adicionar item: Token de autenticação não encontrado.",
                data: null,
            };
        }

        const response = await apiClient<Order>("/order-item", {
            method: "POST",
            body: JSON.stringify({ orderId, productId, quantity }),
            token,
        });

        return {
            success: true,
            message: "Item adicionado com sucesso.",
            data: response,
        };
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Erro ao adicionar item ao pedido.";

        console.error("Error adding order item:", message);

        return {
            success: false,
            message: `Falha ao adicionar item: ${message}`,
            data: null,
        };
    }
}

/**
 * Action para remover um item de um pedido existente
 * @param orderItemId - ID do OrderItem a remover
 * @returns Objeto com sucesso/erro e o pedido atualizado
 */
export async function deleteOrderItemAction(orderItemId: string) {
    try {
        const token = await getToken();

        if (!token) {
            return {
                success: false,
                message: "Erro ao remover item: Token de autenticação não encontrado.",
                data: null,
            };
        }

        const response = await apiClient<Order>(`/order-item/${orderItemId}`, {
            method: "DELETE",
            token,
        });

        return {
            success: true,
            message: "Item removido com sucesso.",
            data: response,
        };
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Erro ao remover item do pedido.";

        console.error("Error deleting order item:", message);

        return {
            success: false,
            message: `Falha ao remover item: ${message}`,
            data: null,
        };
    }
}
