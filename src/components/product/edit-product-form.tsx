"use client";

import {
    Dialog,
    DialogDescription,
    DialogTitle,
    DialogContent,
    DialogHeader,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { Category, Product } from "@/lib/types";
import { showError, showSuccess } from "@/lib/toast";

// ✅ service
import { updateProduct } from "@/services/product";
import { getCategories } from "@/services/catetory";

// ✅ components
import { ProductImageUpload } from "@/components/product/productImageUpload";
import { EditProductFormFields } from "@/components/product/EditProductFormFields";

interface EditProductFormProps {
    product: Product;
}

export default function EditProductForm({
    product,
}: EditProductFormProps) {
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryId, setCategoryId] = useState(product.categoryId);
    const [loading, setLoading] = useState(false);
    const [priceValue, setPriceValue] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(
        product.imageUrl
    );
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageRemoved, setImageRemoved] = useState(false);

    const router = useRouter();

    useEffect(() => {
        if (open) {
            fetchCategories();

            const priceFormatted = (product.price / 100).toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL",
                }
            );

            setPriceValue(priceFormatted);
            setImageRemoved(false);
            setImagePreview(product.imageUrl);
        }
    }, [open, product]);

    async function fetchCategories() {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error(error);
            showError("Erro ao carregar categorias");
        }
    }

    async function handleUpdateProduct(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            const form = e.currentTarget;

            formData.append(
                "name",
                (form.elements.namedItem("name") as HTMLInputElement).value
            );

            formData.append("categoryId", categoryId);

            formData.append(
                "description",
                (form.elements.namedItem(
                    "description"
                ) as HTMLTextAreaElement).value || ""
            );

            const numbers = priceValue.replace(/\D/g, "");
            formData.append("price", numbers);

            if (selectedFile) {
                formData.append("file", selectedFile);
            }

            if (imageRemoved) {
                formData.append("removeImage", "true");
            }

            // ✅ usando service
            await updateProduct(product.id, formData);

            showSuccess("Produto atualizado com sucesso!");

            setOpen(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            showError(
                error instanceof Error
                    ? error.message
                    : "Erro ao atualizar produto"
            );
        } finally {
            setLoading(false);
        }
    }

    function formatToBrl(value: string) {
        const numbers = value.replace(/\D/g, "");
        if (!numbers) return "";

        const amount = parseInt(numbers) / 100;

        return amount.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
        setPriceValue(formatToBrl(e.target.value));
    }

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showError("Imagem muito grande (máx 5MB)");
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
        setImageRemoved(true);
    }

    function restoreImage() {
        setImagePreview(product.imageUrl);
        setImageRemoved(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(true)}
                className="h-8 w-8 p-0"
            >
                <Edit className="h-4 w-4" />
            </Button>

            <DialogContent className="p-6 bg-card max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Editar produto</DialogTitle>
                    <DialogDescription>
                        Atualize os detalhes do produto
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleUpdateProduct}>
                    <EditProductFormFields
                        product={product}
                        categories={categories}
                        categoryId={categoryId}
                        priceValue={priceValue}
                        onCategoryChange={setCategoryId}
                        onPriceChange={handlePriceChange}
                    />

                    <ProductImageUpload
                        imagePreview={imagePreview}
                        imageRemoved={imageRemoved}
                        onImageChange={handleImageChange}
                        onClear={clearImage}
                        onRestore={restoreImage}
                    />

                    <Button
                        type="submit"
                        className="w-full bg-primary text-white"
                        disabled={loading}
                    >
                        {loading ? "Atualizando..." : "Atualizar produto"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}