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
import { Combo, ComboGroup } from "@/lib/types";
import { showError, showSuccess } from "@/lib/toast";
import { formatBRLFromCents, maskBRLInput, parseBRLToCents } from "@/lib/currency";

import { updateComboAction } from "@/actions/combos";

import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { useImageUpload } from "@/hooks/useImageUpload";
import {
    useComboGroups,
    validateComboGroups,
    serializeComboGroups,
    ComboGroupFormValue,
} from "@/hooks/useComboGroups";

import { ProductImageUpload } from "@/components/product/productImageUpload";
import { EditComboFormFields } from "@/components/combo/EditComboFormFields";
import { ComboGroupsEditor } from "@/components/combo/ComboGroupsEditor";

interface EditComboFormProps {
    combo: Combo;
}

function mapGroupsToFormValues(groups: ComboGroup[]): ComboGroupFormValue[] {
    return groups.map((group) => ({
        type: group.type,
        label: group.label,
        categoryIds: group.categories?.map((c) => c.id) ?? [],
        productId: group.productId ?? "",
        minQuantity: group.minQuantity,
        // Se max === min, trata como "quantidade exata" (campo em branco no form)
        maxQuantity:
            group.maxQuantity && group.maxQuantity !== group.minQuantity
                ? String(group.maxQuantity)
                : "",
    }));
}

export default function EditComboForm({ combo }: EditComboFormProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [priceValue, setPriceValue] = useState("");

    const router = useRouter();

    const { categories } = useCategories(open);
    const { products } = useProducts(open);
    const {
        selectedFile,
        imagePreview,
        imageRemoved,
        handleImageChange,
        clearImage,
        resetTo,
    } = useImageUpload(combo.imageUrl);
    const { groups, addGroup, removeGroup, updateGroup, resetGroups } = useComboGroups();

    useEffect(() => {
        if (open) {
            setPriceValue(formatBRLFromCents(combo.price));
            resetTo(combo.imageUrl);
            resetGroups(mapGroupsToFormValues(combo.groups));
        }
    }, [open, combo, resetTo, resetGroups]);

    async function handleUpdateCombo(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const validationError = validateComboGroups(groups);
        if (validationError) {
            showError(validationError);
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            const form = e.currentTarget;

            formData.append(
                "name",
                (form.elements.namedItem("name") as HTMLInputElement).value
            );

            formData.append(
                "description",
                (form.elements.namedItem(
                    "description"
                ) as HTMLTextAreaElement).value || ""
            );

            formData.append("price", parseBRLToCents(priceValue).toString());
            formData.append("groups", JSON.stringify(serializeComboGroups(groups)));

            if (selectedFile) {
                formData.append("file", selectedFile);
            }

            const result = await updateComboAction(combo.id, formData, imageRemoved);

            if (result.success) {
                showSuccess("Combo atualizado com sucesso!");
                setOpen(false);
                router.refresh();
            } else {
                showError(result.message || "Erro ao atualizar combo");
            }
        } catch (error) {
            console.error(error);
            showError("Erro ao atualizar combo");
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

            <DialogContent className="p-6 bg-card max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar combo</DialogTitle>
                    <DialogDescription>
                        Atualize os detalhes do combo
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleUpdateCombo}>
                    <EditComboFormFields
                        combo={combo}
                        priceValue={priceValue}
                        onPriceChange={handlePriceChange}
                    />

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
                        onClear={clearImage}
                        onRestore={() => resetTo(combo.imageUrl)}
                    />

                    <Button
                        type="submit"
                        className="w-full bg-primary text-white"
                        disabled={loading}
                    >
                        {loading ? "Atualizando..." : "Atualizar combo"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
