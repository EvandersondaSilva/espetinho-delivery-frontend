"use client";

import Image from "next/image";
import { Combo, ComboGroup } from "@/lib/types";
import { useCart } from "@/context/cartContext";
import { useComboSelection } from "@/hooks/useComboSelection";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatBRLFromCents } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

interface ComboDialogProps {
    combo: Combo;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ComboDialog({ combo, open, onOpenChange }: ComboDialogProps) {
    const { addCombo } = useCart();
    const {
        groupTotal,
        quantityOf,
        canIncrement,
        increment,
        decrement,
        isGroupComplete,
        canAddToCart,
        buildCartCombo,
    } = useComboSelection(combo);

    const handleAddToCart = () => {
        addCombo(buildCartCombo());
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-90vw lg:max-w-352 min-h-75vh bg-white p-6">
                <DialogHeader>
                    <DialogTitle>{combo.name}</DialogTitle>
                    <DialogDescription>{combo.description}</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
                    <div className="flex flex-col gap-4 overflow-auto max-h-[60vh]">
                        {combo.groups.map((group) => (
                            <ComboGroupSection
                                key={group.id}
                                group={group}
                                total={groupTotal(group.id)}
                                complete={isGroupComplete(group)}
                                quantityOf={(productId) => quantityOf(group.id, productId)}
                                canIncrement={(productId) => canIncrement(group, productId)}
                                onIncrement={(productId) => increment(group, productId)}
                                onDecrement={(productId) => decrement(group, productId)}
                            />
                        ))}
                    </div>

                    <div className="flex flex-col gap-4">
                        {combo.imageUrl && (
                            <div className="relative w-full aspect-video sm:aspect-square bg-gray-50">
                                <Image
                                    src={combo.imageUrl}
                                    alt={combo.name}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
                                    className="object-contain sm:object-cover"
                                />
                            </div>
                        )}

                        <p className="text-primary font-bold text-lg">
                            {formatBRLFromCents(combo.price)}
                        </p>

                        <Button onClick={handleAddToCart} disabled={!canAddToCart}>
                            Adicionar ao carrinho
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

interface ComboGroupSectionProps {
    group: ComboGroup;
    total: number;
    complete: boolean;
    quantityOf: (productId: string) => number;
    canIncrement: (productId: string) => boolean;
    onIncrement: (productId: string) => void;
    onDecrement: (productId: string) => void;
}

function ComboGroupSection({
    group,
    total,
    complete,
    quantityOf,
    canIncrement,
    onIncrement,
    onDecrement,
}: ComboGroupSectionProps) {
    if (group.type === "FIXED_PRODUCT") {
        return (
            <div>
                <p className="font-medium">{group.label} — incluso</p>
                <Separator className="mt-3" />
            </div>
        );
    }

    const products = group.category?.products ?? [];

    return (
        <div>
            <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{group.label}</p>
                <span className={cn("text-sm shrink-0", complete ? "text-primary" : "text-muted-foreground")}>
                    {total}/{group.minQuantity} selecionados
                </span>
            </div>

            <div className="flex flex-col gap-2 mt-3">
                {products.map((product) => {
                    const isOutOfStock = !product.available || product.stock <= 0;

                    return (
                        <ComboProductRow
                            key={product.id}
                            name={product.name}
                            price={product.price}
                            quantity={quantityOf(product.id)}
                            isOutOfStock={isOutOfStock}
                            canIncrement={canIncrement(product.id)}
                            onIncrement={() => onIncrement(product.id)}
                            onDecrement={() => onDecrement(product.id)}
                        />
                    );
                })}
            </div>

            <Separator className="mt-4" />
        </div>
    );
}

interface ComboProductRowProps {
    name: string;
    price: number;
    quantity: number;
    isOutOfStock: boolean;
    canIncrement: boolean;
    onIncrement: () => void;
    onDecrement: () => void;
}

function ComboProductRow({
    name,
    price,
    quantity,
    isOutOfStock,
    canIncrement,
    onIncrement,
    onDecrement,
}: ComboProductRowProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-between gap-3 rounded-lg border border-border p-2",
                isOutOfStock && "opacity-60"
            )}
        >
            <div className="min-w-0">
                <p className="truncate text-sm font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">{formatBRLFromCents(price)}</p>
                {isOutOfStock && (
                    <Badge variant="destructive" className="mt-1">
                        Esgotado
                    </Badge>
                )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={isOutOfStock || quantity === 0}
                    onClick={onDecrement}
                    aria-label={`Diminuir ${name}`}
                >
                    <Minus className="h-4 w-4" />
                </Button>

                <span className="w-6 text-center text-sm">{quantity}</span>

                <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={isOutOfStock || !canIncrement}
                    onClick={onIncrement}
                    aria-label={`Aumentar ${name}`}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
