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
import { Product } from "@/lib/types";
import { showError, showSuccess } from "@/lib/toast";
import { formatBRLFromCents, maskBRLInput, parseBRLToCents } from "@/lib/currency";

// ✅ Server Action
import { updateProductAction } from "@/actions/products";

// ✅ hooks
import { useCategories } from "@/hooks/useCategories";
import { useImageUpload } from "@/hooks/useImageUpload";

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
    const [categoryId, setCategoryId] = useState(product.categoryId);
    const [loading, setLoading] = useState(false);
    const [priceValue, setPriceValue] = useState("");

    const router = useRouter();

    const { categories } = useCategories(open);
    const {
        selectedFile,
        imagePreview,
        imageRemoved,
        handleImageChange,
        clearImage,
        resetTo,
    } = useImageUpload(product.imageUrl);

    useEffect(() => {
        if (open) {
            setPriceValue(formatBRLFromCents(product.price));
            resetTo(product.imageUrl);
        }
    }, [open, product, resetTo]);

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

            formData.append("price", parseBRLToCents(priceValue).toString());

            if (selectedFile) {
                formData.append("file", selectedFile);
            }

            // ✅ usando Server Action (mesmo caminho de criar produto)
            const result = await updateProductAction(product.id, formData, imageRemoved);

            if (result.success) {
                showSuccess("Produto atualizado com sucesso!");
                setOpen(false);
                router.refresh();
            } else {
                showError(result.message || "Erro ao atualizar produto");
            }
        } catch (error) {
            console.error(error);
            showError("Erro ao atualizar produto");
        } finally {
            setLoading(false);
        }
    }

    function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
        setPriceValue(maskBRLInput(e.target.value));
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
                        onRestore={() => resetTo(product.imageUrl)}
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