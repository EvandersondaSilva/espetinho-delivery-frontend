"use client";

import { Dialog, DialogDescription, DialogTitle, DialogTrigger, DialogHeader, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { createProductAction } from "@/actions/products";
import { useRouter } from "next/navigation";
import { Category } from "@/lib/types";
import { getApiUrl } from "@/lib/api";
import Image from "next/image";
import { Upload } from "lucide-react";

import { showSuccess, showError } from "@/lib/toast";

export default function ProductForm() {
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryId, setCategoryId] = useState("");
    const [loading, setLoading] = useState(false);
    const [priceValue, setPriceValue] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (open) {
            fetchCategories();
        }
    }, [open]);

    async function fetchCategories() {
        try {
            const response = await fetch(`${getApiUrl()}/category`);
            if (!response.ok) throw new Error("Failed to fetch categories");
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            showError("Erro ao carregar categorias");
        }
    }

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

            // converte o preço de BRL para número
            const numbers = priceValue.replace(/\D/g, "");
            const price = parseInt(numbers) / 100;
            formData.set("price", price.toString());

            const result = await createProductAction(formData);

            if (result.success) {
                setOpen(false);
                setPriceValue("");
                setCategoryId("");
                setImagePreview(null);
                setSelectedFile(null);
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

    function formatToBrl(value: string) {
        const numbers = value.replace(/\D/g, "");

        if (!numbers) return "";

        const amount = parseInt(numbers) / 100;

        return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
        const formatted = formatToBrl(e.target.value);
        setPriceValue(formatted);
    }

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                return;
            }
            setSelectedFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    function clearImage() {
        setSelectedFile(null);
        setImagePreview(null);
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

                    <div className="space-y-2">
                        <Label htmlFor="productImage" className="mb-2">
                            Imagem do produto
                        </Label>
                        {imagePreview ? (
                            <div className="relative w-full border rounded-lg overflow-hidden">
                                <Image
                                    src={imagePreview}
                                    alt="Pré-visualização da imagem"
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                    className="w-full h-auto object-contain"
                                />
                                <Button type="button" variant="destructive" onClick={clearImage}
                                    className="absolute top-2 right-2 z-20">
                                    Remover imagem
                                </Button>
                            </div>
                        ) : (
                            <div className=" border-2 border-dashed rounded-md p-8 border-gray-300 flex flex-col items-center justify-center ">
                                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                <Label htmlFor="file">
                                    Clique para selecionar uma imagem
                                </Label>

                                <Input id="file" type="file" name="file" accept="image/jpeg,image/png,image/jpg" onChange={handleImageChange}
                                    className="hidden" /></div>
                        )}
                    </div>

                    <Button type="submit" className="w-full bg-primary text-white hover:bg-primary" disabled={loading}>
                        {loading ? "Criando..." : "Criar produto"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
