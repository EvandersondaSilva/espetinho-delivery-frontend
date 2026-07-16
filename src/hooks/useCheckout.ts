"use client";

import { useState, useCallback } from "react";
import { createOrder } from "@/services/order";
import { showError } from "@/lib/toast";
import { generateWhatsAppMessage } from "@/lib/MessageWhats";
import { CartCombo } from "@/context/cartContext";

interface CheckoutParams {
    items: any[];
    combos: CartCombo[];
    customerName: string;
    phone: string;
    street: string;
    neighborhood: string;
    complement: string;
    paymentMethod: string;
    deliveryType: string;
    total: number;
    clearCart: () => void;
    receiptUrl?: string;
    changeFor?: string;
    noChangeNeeded?: boolean;
    onSuccess?: (orderId: string) => void;
}

export function useCheckout() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkout = useCallback(async (data: CheckoutParams) => {
        const {
            items,
            combos,
            customerName,
            phone,
            street,
            neighborhood,
            complement,
            paymentMethod,
            deliveryType,
            total,
            clearCart,
            receiptUrl,
            changeFor,
            noChangeNeeded,
            onSuccess,
        } = data;

        setError(null);

        // validações
        if (items.length === 0 && combos.length === 0) {
            const msg = "Seu carrinho está vazio.";
            setError(msg);
            showError(msg);
            return;
        }

        const name = customerName.trim();
        const phoneValue = phone.trim();
        const streetValue = street.trim();
        const neighborhoodValue = neighborhood.trim();

        if (!name || !phoneValue || !streetValue || !neighborhoodValue) {
            const msg = "Preencha nome, telefone, rua e bairro para finalizar.";
            setError(msg);
            showError(msg);
            return;
        }

        try {
            setLoading(true);

            const fullAddress = [streetValue, neighborhoodValue, complement.trim()]
                .filter((part) => part)
                .join(" • ");

            const order = await createOrder({
                customerName: name,
                phone: phoneValue,
                address: fullAddress,
                deliveryFee: 0,
                items: items.map((i) => ({
                    productId: i.product.id,
                    quantity: i.quantity,
                })),
                combos: combos.map((c) => ({
                    comboId: c.comboId,
                    selections: c.selections,
                })),
            });

            const message = generateWhatsAppMessage({
                orderId: order.id,
                items,
                combos,
                customerName: name,
                phone: phoneValue,
                street: streetValue,
                neighborhood: neighborhoodValue,
                complement,
                total,
                paymentMethod,
                deliveryType,
                receiptUrl,
                changeFor,
                noChangeNeeded,
            });

            const whatsappLink = `${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                message
            )}`;

            window.open(whatsappLink, "_blank");

            clearCart();

            onSuccess?.(order.id);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Falha ao criar pedido.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        checkout,
        loading,
        error,
    };
}