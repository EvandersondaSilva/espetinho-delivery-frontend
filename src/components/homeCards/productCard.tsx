"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/services/product";
import { formatBRLFromCents } from "@/lib/currency";
import { ProductDialog } from "./ProductDialog";


interface ProductCardProps {
    product: Product;
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
                {/* Mobile: layout horizontal | Desktop: layout card */}
                <div className="flex sm:flex-col">
                    <div className="relative w-32 h-32 shrink-0 sm:w-full sm:h-48">
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 400px"
                            className="object-cover"
                        />
                    </div>
                    <div className="p-4 flex flex-col justify-center">
                        <h2 className="font-semibold text-lg">{product.name}</h2>
                        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{product.description}</p>
                        <p className="text-primary font-bold mt-3">
                            {formatBRLFromCents(product.price)}
                        </p>
                    </div>
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