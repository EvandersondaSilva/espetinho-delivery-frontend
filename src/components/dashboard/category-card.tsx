"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tags, Trash2 } from "lucide-react";
import { deleteCategoryAction } from "@/actions/categories";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Category } from "@/lib/types";
import EditCategoryForm from "./edit-category-form";

interface CategoryCardProps {
    category: Category;
}

import { showSuccess, showError } from "@/lib/toast";

export default function CategoryCard({ category }: CategoryCardProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleDeleteCategory() {
        setLoading(true);
        try {
            const result = await deleteCategoryAction(category.id);

            if (result.success) {
                setOpen(false);
                router.refresh();

            } else {
                showError(result.message || "Erro ao deletar categoria");
            }
        } catch (error) {
            console.error(error);
            showError("Erro ao deletar categoria");

        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Card className="transition shadow hover:shadow-md flex flex-col">
                <CardHeader>
                    <CardTitle className="gap-2 flex items-center text-base md:text-lg">
                        <Tags className="w-5 h-5" />
                        <span>{category.name}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                    <p className="text-gray-500 text-xs">{category.id}</p>
                    <p className="text-gray-500 text-xs mb-4">Ordem: {category.displayOrder ?? 0}</p>
                    <div className="mt-auto space-y-2">
                        <div className="flex gap-2">
                            <EditCategoryForm category={category} />
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setOpen(true)}
                                className="flex-1"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Deletar
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Deletar categoria?</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja deletar a categoria <strong>{category.name}</strong>?
                            Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteCategory}
                            disabled={loading}
                        >
                            {loading ? "Deletando..." : "Deletar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
