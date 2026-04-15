"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/services/product";
import { useCart } from "@/context/cartContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatBRLFromCents } from "@/lib/currency";
import { Minus, Plus } from "lucide-react";

interface ProductCardProps {
    product: Product;
}

interface ProductDialogProps {
    product: Product;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function ProductDialog({ product, open, onOpenChange }: ProductDialogProps) {
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState("");

    const handleAddToCart = () => {
        addItem(product, quantity, notes.trim() || undefined);
        onOpenChange(false);
        setQuantity(1);
        setNotes("");
    };

    const increaseQuantity = () => setQuantity(prev => prev + 1);
    const decreaseQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-[90vw] lg:max-w-352 min-h-[75vh] bg-white p-6">
                <DialogHeader>
                    <DialogTitle>{product.name}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
                    {/* Product Image */}
                    <div className="relative w-full h-80 lg:h-176">
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover rounded-lg"
                        />
                    </div>

                    {/* Product Details and Controls */}
                    <div className="flex flex-col gap-4">
                        <div>
                            <p className="text-muted-foreground text-sm mb-2">{product.description}</p>
                            <p className="text-primary font-bold text-lg">
                                {formatBRLFromCents(product.price)}
                            </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={decreaseQuantity}
                                disabled={quantity <= 1}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center font-medium">{quantity}</span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={increaseQuantity}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Notes Textarea */}
                        <div className="flex-1">
                            <Textarea
                                placeholder="Alguma observação? (opcional)"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="min-h-24 resize-none"
                            />
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                            size="lg"
                            className="w-full font-semibold shadow-sm hover:shadow-md hover:bg-primary/90 transition-shadow"
                            onClick={handleAddToCart}
                        >
                            Adicionar ao carrinho
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function ProductCard({ product }: ProductCardProps) {
    const [dialogOpen, setDialogOpen] = useState(false);

    if (!product.available) return null;

    return (
        <>
            <div
                className="bg-card border border-black/10 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer"
                onClick={() => setDialogOpen(true)}
            >
                <div className="relative w-full h-48">
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="p-4">
                    <h2 className="font-semibold text-lg">{product.name}</h2>
                    <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{product.description}</p>
                    <p className="text-primary font-bold mt-3">
                        {formatBRLFromCents(product.price)}
                    </p>
                </div>
            </div>

            <ProductDialog
                product={product}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </>
    );
}