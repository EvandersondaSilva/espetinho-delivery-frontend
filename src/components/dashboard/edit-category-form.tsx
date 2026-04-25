"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Edit } from "lucide-react";
import { Category } from "@/lib/types";
import { updateCategoryAction } from "@/actions/categories";
import { useRouter } from "next/navigation";
import { showError } from "@/lib/toast";

interface EditCategoryFormProps {
    category: Category;
}

export default function EditCategoryForm({ category }: EditCategoryFormProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [categoryName, setCategoryName] = useState(category.name);
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleUpdateCategory(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", categoryName);

            const result = await updateCategoryAction(category.id, formData);

            if (result.success) {
                setOpen(false);
                router.refresh();
            } else {
                showError(result.message || "Erro ao atualizar categoria");
                setError(result.message || "Erro ao atualizar categoria");
            }
        } catch (error) {
            showError("Erro ao atualizar categoria");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 p-0"
                    title="Editar categoria"
                >
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="p-6 bg-card">
                <DialogHeader>
                    <DialogTitle>Editar categoria</DialogTitle>
                    <DialogDescription>
                        Atualize o nome da categoria
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleUpdateCategory}>
                    <div>
                        <Label htmlFor="categoryName" className="mb-2">
                            Nome da categoria
                        </Label>
                        <Input
                            id="categoryName"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            required
                            placeholder="Digite o nome da categoria..."
                            className="border-border bg-background mt-2"
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-500">
                            {error}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="bg-primary text-white hover:bg-primary"
                            disabled={loading || categoryName === category.name}
                        >
                            {loading ? "Atualizando..." : "Atualizar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
