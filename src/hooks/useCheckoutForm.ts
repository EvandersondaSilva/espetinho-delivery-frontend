"use client";

import { useState, useCallback } from "react";

type Field =
    | "customerName"
    | "phone"
    | "street"
    | "neighborhood"
    | "complement"
    | "paymentMethod"
    | "deliveryType"
    | "changeFor";

const INITIAL_FORM = {
    customerName: "",
    phone: "",
    street: "",
    neighborhood: "",
    complement: "",
    paymentMethod: "dinheiro",
    deliveryType: "delivery",
    changeFor: "",
    noChangeNeeded: false,
};

export function useCheckoutForm() {
    const [form, setForm] = useState(INITIAL_FORM);

    const setField = useCallback((field: Field, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    /**
     * Troca a forma de pagamento; limpa o troco ao sair de "dinheiro"
     */
    const setPaymentMethod = useCallback((value: string) => {
        setForm((prev) => ({
            ...prev,
            paymentMethod: value,
            ...(value !== "dinheiro"
                ? { changeFor: "", noChangeNeeded: false }
                : {}),
        }));
    }, []);

    /**
     * Alterna "Não preciso de troco"; limpa o valor digitado quando ativado
     */
    const setNoChangeNeeded = useCallback((value: boolean) => {
        setForm((prev) => ({
            ...prev,
            noChangeNeeded: value,
            changeFor: value ? "" : prev.changeFor,
        }));
    }, []);

    const resetForm = useCallback(() => {
        setForm(INITIAL_FORM);
    }, []);

    return {
        form,
        setField,
        setPaymentMethod,
        setNoChangeNeeded,
        resetForm,
    };
}
