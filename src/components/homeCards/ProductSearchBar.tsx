"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearch } from "@/context/searchContext";

export function ProductSearchBar() {
    const { searchTerm, setSearchTerm } = useSearch();
    const hasSearch = searchTerm.trim().length > 0;

    return (
        <div className="px-4">
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
        </div>
    );
}
