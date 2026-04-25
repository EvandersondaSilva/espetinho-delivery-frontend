"use client";

import { useState, useCallback } from "react";

type Field =
    | "customerName"
    | "phone"
    | "street"
    | "neighborhood"
    | "complement"
    | "paymentMethod"
    | "deliveryType";

export function useCheckoutForm() {
    const [form, setForm] = useState({
        customerName: "",
        phone: "",
        street: "",
        neighborhood: "",
        complement: "",
        paymentMethod: "dinheiro",
        deliveryType: "delivery",
    });

    const [success, setSuccess] = useState<string | null>(null);

    const setField = useCallback((field: Field, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    const resetForm = useCallback(() => {
        setForm({
            customerName: "",
            phone: "",
            street: "",
            neighborhood: "",
            complement: "",
            paymentMethod: "dinheiro",
            deliveryType: "delivery",
        });
    }, []);

    return {
        form,
        setField,
        resetForm,
        success,
        setSuccess,
    };
}