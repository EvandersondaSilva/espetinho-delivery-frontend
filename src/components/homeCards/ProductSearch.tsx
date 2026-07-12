"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/homeCards/productCard";
import type { Category } from "@/services/catetory";
import type { Product } from "@/services/product";

interface ProductSearchProps {
    categories: (Category & { products: Product[] })[];
}

export function ProductSearch({ categories }: ProductSearchProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const hasSearch = searchTerm.trim().length > 0;

    const filteredCategories = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return categories;

        return categories
            .map((category) => ({
                ...category,
                products: category.products.filter(
                    (product) =>
                        product.name.toLowerCase().includes(term) ||
                        (product.description ?? "").toLowerCase().includes(term)
                ),
            }))
            .filter((category) => category.products.length > 0);
    }, [categories, searchTerm]);

    return (
        <>
            <div className="relative max-w-2xl md:max-w-3xl mx-auto mb-10">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar produtos..."
                    aria-label="Buscar produtos"
                    className="pl-9 pr-9"
                />
                {hasSearch && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
                        aria-label="Limpar busca"
                    >
                        <X className="size-4" />
                    </Button>
                )}
            </div>

            {filteredCategories.map((category) => (
                <div key={category.id} className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-center md:text-left">
                        {category.name}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {category.products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            ))}

            {hasSearch && filteredCategories.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                        Nenhum produto encontrado para sua busca.
                    </p>
                </div>
            )}
        </>
    );
}
