"use client";

import { Dialog, DialogDescription, DialogTitle, DialogTrigger, DialogHeader, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { createProductAction } from "@/actions/products";
import { useRouter } from "next/navigation";

import { showSuccess, showError } from "@/lib/toast";
import { maskBRLInput, parseBRLToCents } from "@/lib/currency";
import { useCategories } from "@/hooks/useCategories";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ProductImageUpload } from "@/components/product/productImageUpload";

export default function ProductForm() {
    const [open, setOpen] = useState(false);
    const [categoryId, setCategoryId] = useState("");
    const [loading, setLoading] = useState(false);
    const [priceValue, setPriceValue] = useState("");
    const router = useRouter();

    const { categories } = useCategories(open);
    const { selectedFile, imagePreview, imageRemoved, handleImageChange, resetTo } =
        useImageUpload();

    async function handleCreateProduct(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(e.currentTarget);

            // remove o file do formData atual e adiciona o arquivo selecionado
            formData.delete("file");
            if (selectedFile) {
                formData.append("file", selectedFile);
            }

            // preço trafega sempre em centavos
            formData.set("price", parseBRLToCents(priceValue).toString());

            const result = await createProductAction(formData);

            if (result.success) {
                setOpen(false);
                setPriceValue("");
                setCategoryId("");
                resetTo(null);
                router.refresh();

                showSuccess("Produto criado com sucesso");
            } else {
                showError(result.message || "Erro ao criar produto");
            }
        } catch (error) {
            console.error("Error creating product:", error);
            showError("Erro ao criar produto");
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
                    Novo produto
                </Button>
            </DialogTrigger>

            <DialogContent className="p-6 bg-card max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Criar novo produto</DialogTitle>
                    <DialogDescription>
                        Preencha os detalhes do novo produto
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleCreateProduct}>
                    <div>
                        <Label htmlFor="productName" className="mb-2">
                            Nome do produto
                        </Label>
                        <Input
                            id="productName"
                            name="name"
                            required
                            placeholder="Digite o nome do produto..."
                            className="border-border bg-background"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="productPrice" className="mb-2">
                                Preço (R$)
                            </Label>
                            <Input
                                id="productPrice"
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
                            <Label htmlFor="categoryId" className="mb-2">
                                Categoria
                            </Label>
                            <Select onValueChange={setCategoryId} value={categoryId}>
                                <SelectTrigger className="w-full border-border bg-background">
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {/* campo hidden para enviar no FormData */}
                            <input type="hidden" name="categoryId" value={categoryId} />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="productStock" className="mb-2">
                            Estoque inicial
                        </Label>
                        <Input
                            id="productStock"
                            name="stock"
                            type="number"
                            min={0}
                            step={1}
                            placeholder="Ex: 40"
                            className="border-border bg-background"
                        />
                    </div>

                    <div>
                        <Label htmlFor="productDescription" className="mb-2">
                            Descrição
                        </Label>
                        <Textarea
                            id="productDescription"
                            name="description"

                            placeholder="Digite a descrição do produto..."
                            className="border-border bg-background"
                            rows={3}
                        />
                    </div>

                    <ProductImageUpload
                        imagePreview={imagePreview}
                        imageRemoved={imageRemoved}
                        onImageChange={handleImageChange}
                        onClear={() => resetTo(null)}
                        onRestore={() => resetTo(null)}
                    />

                    <Button type="submit" className="w-full bg-primary text-white hover:bg-primary" disabled={loading}>
                        {loading ? "Criando..." : "Criar produto"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
