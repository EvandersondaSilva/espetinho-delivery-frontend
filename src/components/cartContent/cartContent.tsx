"use client";

import { useMemo, memo } from "react";
import { Trash2 } from "lucide-react";

import {
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cartContext";

import { CartItemsList } from "./CartItemsList";
import { CartTotal } from "./CartTotal";
import { CartCheckoutForm } from "@/components/cartContent/CartCheckoutForm";

import { useCheckout } from "@/hooks/useCheckout";
import { useCheckoutForm } from "@/hooks/useCheckoutForm";

interface CartContentProps {
    onCartClose: () => void;
}

export const CartContent = memo(function CartContent({
    onCartClose,
}: CartContentProps) {
    const { items, total, addItem, decreaseItem, removeItem, clearCart } =
        useCart();

    const { form, setField, resetForm, success, setSuccess } =
        useCheckoutForm();

    const { checkout, loading, error } = useCheckout();

    /**
     * Verifica se checkout está desabilitado
     */
    const isCheckoutDisabled = useMemo(() => {
        if (loading) return true;
        if (items.length === 0) return true;

        if (
            !form.customerName.trim() ||
            !form.phone.trim() ||
            !form.street.trim() ||
            !form.neighborhood.trim()
        )
            return true;

        if (!form.paymentMethod) return true;
        if (!form.deliveryType) return true;

        return false;
    }, [form, items.length, loading]);

    return (
        <SheetContent
            side="right"
            className="bg-white p-0 text-foreground dark:bg-white"
            style={{ willChange: "transform" }}
        >
            {/* Header */}
            <SheetHeader className="border-b">
                <div className="flex items-center justify-between">
                    <SheetTitle>Carrinho</SheetTitle>

                    {items.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearCart}>
                            <Trash2 className="mr-2 size-4" />
                            Limpar
                        </Button>
                    )}
                </div>

                <SheetDescription className="sr-only">
                    Revise seus itens e finalize seu pedido.
                </SheetDescription>
            </SheetHeader>

            {/* Conteúdo */}
            <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">
                {/* Lista */}
                <CartItemsList
                    items={items}
                    onRemove={removeItem}
                    onDecrease={decreaseItem}
                    onIncrease={(product, notes) => addItem(product, 1, notes)}
                />

                {/* Total */}
                {items.length > 0 && <CartTotal total={total} />}

                {/* Formulário */}
                <CartCheckoutForm
                    customerName={form.customerName}
                    phone={form.phone}
                    street={form.street}
                    neighborhood={form.neighborhood}
                    complement={form.complement}
                    paymentMethod={form.paymentMethod}
                    deliveryType={form.deliveryType}
                    error={error}
                    success={success}
                    onCustomerNameChange={(v) => setField("customerName", v)}
                    onPhoneChange={(v) => setField("phone", v)}
                    onStreetChange={(v) => setField("street", v)}
                    onNeighborhoodChange={(v) => setField("neighborhood", v)}
                    onComplementChange={(v) => setField("complement", v)}
                    onPaymentMethodChange={(v) => setField("paymentMethod", v)}
                    onDeliveryTypeChange={(v) => setField("deliveryType", v)}
                />
            </div>

            {/* Footer */}
            <SheetFooter className="border-t">
                <Button
                    className="w-full"
                    disabled={isCheckoutDisabled}
                    onClick={() =>
                        checkout({
                            ...form,
                            items,
                            total,
                            clearCart,
                            onSuccess: (orderId) => {
                                setSuccess(`Pedido criado com sucesso! Código: ${orderId}`);
                                onCartClose();
                                resetForm();
                            },
                        })
                    }
                >
                    {loading ? "Finalizando..." : "Finalizar pedido"}
                </Button>
            </SheetFooter>
        </SheetContent>
    );
});