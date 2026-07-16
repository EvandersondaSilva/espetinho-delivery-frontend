"use client";

import { Dialog, DialogDescription, DialogTitle, DialogTrigger, DialogHeader, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createComboAction } from "@/actions/combos";
import { useRouter } from "next/navigation";

import { showSuccess, showError } from "@/lib/toast";
import { maskBRLInput, parseBRLToCents } from "@/lib/currency";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useComboGroups, validateComboGroups, serializeComboGroups } from "@/hooks/useComboGroups";
import { ProductImageUpload } from "@/components/product/productImageUpload";
import { ComboGroupsEditor } from "@/components/combo/ComboGroupsEditor";

export default function ComboForm() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [priceValue, setPriceValue] = useState("");
    const router = useRouter();

    const { categories } = useCategories(open);
    const { products } = useProducts(open);
    const { selectedFile, imagePreview, imageRemoved, handleImageChange, resetTo } =
        useImageUpload();
    const { groups, addGroup, removeGroup, updateGroup, resetGroups } = useComboGroups();

    async function handleCreateCombo(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const validationError = validateComboGroups(groups);
        if (validationError) {
            showError(validationError);
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData(e.currentTarget);

            formData.delete("file");
            if (selectedFile) {
                formData.append("file", selectedFile);
            }

            formData.set("price", parseBRLToCents(priceValue).toString());
            formData.set("groups", JSON.stringify(serializeComboGroups(groups)));

            const result = await createComboAction(formData);

            if (result.success) {
                setOpen(false);
                setPriceValue("");
                resetGroups([]);
                resetTo(null);
                router.refresh();

                showSuccess("Combo criado com sucesso");
            } else {
                showError(result.message || "Erro ao criar combo");
            }
        } catch (error) {
            console.error("Error creating combo:", error);
            showError("Erro ao criar combo");
        } finally {
            setLoading(false);
        }
    }

    function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
        setPriceValue(maskBRLInput(e.target.value));
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="font-semibold">
                    <Plus className="h-5 w-5 mr-2" />
                    Criar combo
                </Button>
            </DialogTrigger>

            <DialogContent className="p-6 bg-card max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Criar novo combo</DialogTitle>
                    <DialogDescription>
                        Preencha os detalhes do novo combo
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleCreateCombo}>
                    <div>
                        <Label htmlFor="comboName" className="mb-2">
                            Nome do combo
                        </Label>
                        <Input
                            id="comboName"
                            name="name"
                            required
                            placeholder="Digite o nome do combo..."
                            className="border-border bg-background"
                        />
                    </div>

                    <div>
                        <Label htmlFor="comboPrice" className="mb-2">
                            Preço (R$)
                        </Label>
                        <Input
                            id="comboPrice"
                            name="price"
                            type="text"
                            required
                            placeholder="0.00"
                            value={priceValue}
                            onChange={handlePriceChange}
                            className="border-border bg-background"
                        />
                    </div>

                    <div>
                        <Label htmlFor="comboDescription" className="mb-2">
                            Descrição
                        </Label>
                        <Textarea
                            id="comboDescription"
                            name="description"
                            placeholder="Digite a descrição do combo..."
                            className="border-border bg-background"
                            rows={3}
                        />
                    </div>

                    <ComboGroupsEditor
                        groups={groups}
                        categories={categories}
                        products={products}
                        onAdd={addGroup}
                        onRemove={removeGroup}
                        onUpdate={updateGroup}
                    />

                    <ProductImageUpload
                        imagePreview={imagePreview}
                        imageRemoved={imageRemoved}
                        onImageChange={handleImageChange}
                        onClear={() => resetTo(null)}
                        onRestore={() => resetTo(null)}
                    />

                    <Button type="submit" className="w-full bg-primary text-white hover:bg-primary" disabled={loading}>
                        {loading ? "Criando..." : "Criar combo"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
