"use client";

import { useMemo } from "react";
import { ProductCard } from "@/components/homeCards/productCard";
import { useSearch } from "@/context/searchContext";
import type { Category } from "@/services/catetory";
import type { Product } from "@/services/product";

interface ProductSearchProps {
    categories: (Category & { products: Product[] })[];
}

export function ProductSearch({ categories }: ProductSearchProps) {
    const { searchTerm } = useSearch();
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
