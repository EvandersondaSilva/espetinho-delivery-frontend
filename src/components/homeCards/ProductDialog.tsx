"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/services/product";
import { useCart } from "@/context/cartContext";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatBRLFromCents } from "@/lib/currency";
import { Minus, Plus } from "lucide-react";

interface ProductDialogProps {
    product: Product;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProductDialog({
    product,
    open,
    onOpenChange,
}: ProductDialogProps) {
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState("");
    const isOutOfStock = !product.available || product.stock <= 0;

    const handleAddToCart = () => {
        addItem(product, quantity, notes.trim() || undefined);
        onOpenChange(false);
        setQuantity(1);
        setNotes("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-90vw lg:max-w-352 min-h-75vh bg-white p-6">
                <DialogHeader>
                    <DialogTitle>{product.name}</DialogTitle>
                    <DialogDescription>{product.description}</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
                    <div className="relative w-full aspect-video sm:aspect-square bg-gray-50">
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
                            className="object-contain sm:object-cover"
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        <p className="text-primary font-bold text-lg">
                            {formatBRLFromCents(product.price)}
                        </p>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={isOutOfStock}
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>

                            <span className="w-12 text-center">{quantity}</span>

                            <Button
                                variant="outline"
                                size="icon"
                                disabled={isOutOfStock}
                                onClick={() => setQuantity((q) => q + 1)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        <Textarea
                            placeholder="Alguma observação? (opcional)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />

                        {isOutOfStock && (
                            <p className="text-sm font-medium text-destructive">
                                Produto esgotado no momento
                            </p>
                        )}

                        <Button onClick={handleAddToCart} disabled={isOutOfStock}>
                            Adicionar ao carrinho
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}