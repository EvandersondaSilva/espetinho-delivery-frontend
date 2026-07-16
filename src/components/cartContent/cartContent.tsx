"use client";

import { useMemo, memo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { CartComboList } from "./CartComboList";
import { CartTotal } from "./CartTotal";
import { CartCheckoutForm } from "@/components/cartContent/CartCheckoutForm";
import { OrderSuccessView } from "@/components/cartContent/OrderSuccessView";

import { useCheckout } from "@/hooks/useCheckout";
import { useCheckoutForm } from "@/hooks/useCheckoutForm";
import { usePixReceiptUpload } from "@/hooks/usePixReceiptUpload";

interface CartContentProps {
    onCartClose: () => void;
}

export const CartContent = memo(function CartContent({
    onCartClose,
}: CartContentProps) {
    const router = useRouter();
    const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

    const { items, combos, total, addItem, decreaseItem, removeItem, removeCombo, clearCart } =
        useCart();

    const { form, setField, setPaymentMethod, setNoChangeNeeded, resetForm } =
        useCheckoutForm();

    const { checkout, loading, error } = useCheckout();

    const {
        preview: pixReceiptPreview,
        receiptUrl: pixReceiptUrl,
        uploading: pixReceiptUploading,
        error: pixReceiptError,
        selectFile: onPixReceiptSelect,
        clear: onPixReceiptClear,
    } = usePixReceiptUpload();

    /**
     * Verifica se checkout está desabilitado
     */
    const isCheckoutDisabled = useMemo(() => {
        if (loading) return true;
        if (items.length === 0 && combos.length === 0) return true;

        if (
            !form.customerName.trim() ||
            !form.phone.trim() ||
            !form.street.trim() ||
            !form.neighborhood.trim()
        )
            return true;

        if (!form.paymentMethod) return true;
        if (!form.deliveryType) return true;

        if (form.paymentMethod === "pix" && (!pixReceiptUrl || pixReceiptUploading))
            return true;

        return false;
    }, [form, items.length, combos.length, loading, pixReceiptUrl, pixReceiptUploading]);

    const handleBackToMenu = () => {
        onCartClose();
        router.push("/");
    };

    if (completedOrderId) {
        return (
            <SheetContent
                side="right"
                className="bg-white p-0 text-foreground dark:bg-white"
                style={{ willChange: "transform" }}
            >
                <SheetHeader className="sr-only">
                    <SheetTitle>Pedido confirmado</SheetTitle>
                    <SheetDescription>
                        Seu pedido foi enviado com sucesso.
                    </SheetDescription>
                </SheetHeader>

                <OrderSuccessView
                    orderId={completedOrderId}
                    onBackToMenu={handleBackToMenu}
                />
            </SheetContent>
        );
    }

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

                    {(items.length > 0 || combos.length > 0) && (
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
                    showEmptyState={combos.length === 0}
                />

                {/* Combos montados */}
                <CartComboList combos={combos} onRemove={removeCombo} />

                {/* Total */}
                {(items.length > 0 || combos.length > 0) && <CartTotal total={total} />}

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
                    onCustomerNameChange={(v) => setField("customerName", v)}
                    onPhoneChange={(v) => setField("phone", v)}
                    onStreetChange={(v) => setField("street", v)}
                    onNeighborhoodChange={(v) => setField("neighborhood", v)}
                    onComplementChange={(v) => setField("complement", v)}
                    onPaymentMethodChange={setPaymentMethod}
                    onDeliveryTypeChange={(v) => setField("deliveryType", v)}
                    pixReceiptPreview={pixReceiptPreview}
                    pixReceiptUrl={pixReceiptUrl}
                    pixReceiptUploading={pixReceiptUploading}
                    pixReceiptError={pixReceiptError}
                    onPixReceiptSelect={onPixReceiptSelect}
                    onPixReceiptClear={onPixReceiptClear}
                    changeFor={form.changeFor}
                    noChangeNeeded={form.noChangeNeeded}
                    onChangeForChange={(v) => setField("changeFor", v)}
                    onNoChangeNeededChange={setNoChangeNeeded}
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
                            combos,
                            total,
                            clearCart,
                            receiptUrl: pixReceiptUrl || undefined,
                            onSuccess: (orderId) => {
                                setCompletedOrderId(orderId);
                                resetForm();
                                onPixReceiptClear();
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