"use client";

import { Dialog, DialogDescription, DialogTitle, DialogTrigger, DialogHeader, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createCategoryAction } from "@/actions/categories";
import { useRouter } from "next/navigation";
import { showError } from "@/lib/toast";

export default function CategoryForm() {

    const [open, setOpen] = useState(false);
    const router = useRouter();

    async function handleCreateCategory(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const result = await createCategoryAction(formData);

        if (result.success) {
            setOpen(false);
            router.refresh();
            return;
        } else {
            console.log("Error creating category:", result.message);
            showError(result.message || "Erro ao criar categoria");
        }

    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className=" font-semibold">
                    <Plus className="h-5 w-5 mr-2" />
                    Nova categoria
                </Button>
            </DialogTrigger>

            <DialogContent className="p-6 bg-card">
                <DialogHeader>
                    <DialogTitle>Criar nova categoria</DialogTitle>
                    <DialogDescription>
                        Criando uma nova categoria...
                    </DialogDescription>
                </DialogHeader>

                <form className="spacey-4" onSubmit={handleCreateCategory}>
                    <div>
                        <Label htmlFor="categoryName" className="mb-2">
                            Nome da categoria
                        </Label>
                        <Input
                            id="categoryName"
                            name="name"
                            required
                            placeholder="Digite o nome da categoria..."
                            className="border-border bg-background mt-4"
                        />
                    </div>

                    <div className="mt-4">
                        <Label htmlFor="categoryDisplayOrder" className="mb-2">
                            Ordem de exibição
                        </Label>
                        <Input
                            id="categoryDisplayOrder"
                            name="displayOrder"
                            type="number"
                            min={0}
                            step={1}
                            placeholder="0"
                            className="border-border bg-background"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Categorias com número menor aparecem primeiro no cardápio.
                        </p>
                    </div>

                    <Button type="submit" className="w-full bg-primary text-white hover:bg-primary mt-4">
                        Criar categoria
                    </Button>

                </form>
            </DialogContent>
        </Dialog>
    )
}