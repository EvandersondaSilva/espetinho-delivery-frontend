"use client";

import { Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Category } from "@/lib/types";
import { Product } from "@/services/product";
import { ComboGroupFormValue } from "@/hooks/useComboGroups";

interface ComboGroupsEditorProps {
    groups: ComboGroupFormValue[];
    categories: Category[];
    products: Product[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    onUpdate: (index: number, patch: Partial<ComboGroupFormValue>) => void;
}

export function ComboGroupsEditor({
    groups,
    categories,
    products,
    onAdd,
    onRemove,
    onUpdate,
}: ComboGroupsEditorProps) {
    return (
        <div className="space-y-3">
            <Label>Grupos do combo</Label>

            {groups.map((group, index) => (
                <div key={index} className="rounded-xl border border-border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-muted-foreground">
                            Grupo {index + 1}
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemove(index)}
                            aria-label="Remover grupo"
                        >
                            <X className="size-4" />
                        </Button>
                    </div>

                    <div className="grid gap-1.5">
                        <Label>Tipo de escolha</Label>
                        <Select
                            value={group.type}
                            onValueChange={(value) =>
                                onUpdate(index, {
                                    type: value as ComboGroupFormValue["type"],
                                    categoryId: "",
                                    productId: "",
                                })
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CATEGORY_CHOICE">Escolha por categoria</SelectItem>
                                <SelectItem value="FIXED_PRODUCT">Produto fixo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {group.type === "CATEGORY_CHOICE" ? (
                        <div className="grid gap-1.5">
                            <Label>Categoria</Label>
                            <Select
                                value={group.categoryId}
                                onValueChange={(value) => onUpdate(index, { categoryId: value })}
                            >
                                <SelectTrigger className="w-full">
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
                        </div>
                    ) : (
                        <div className="grid gap-1.5">
                            <Label>Produto</Label>
                            <Select
                                value={group.productId}
                                onValueChange={(value) => onUpdate(index, { productId: value })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione um produto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((product) => (
                                        <SelectItem key={product.id} value={product.id}>
                                            {product.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid gap-1.5">
                        <Label>Texto exibido pro cliente</Label>
                        <Input
                            value={group.label}
                            onChange={(e) => onUpdate(index, { label: e.target.value })}
                            placeholder="Ex: Escolha 2 espetinhos"
                        />
                    </div>

                    {group.type === "CATEGORY_CHOICE" ? (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label>Quantidade mínima</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    step={1}
                                    value={group.minQuantity}
                                    onChange={(e) =>
                                        onUpdate(index, { minQuantity: Number(e.target.value) })
                                    }
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Quantidade máxima</Label>
                                <Input
                                    type="number"
                                    min={group.minQuantity}
                                    step={1}
                                    value={group.maxQuantity}
                                    onChange={(e) => onUpdate(index, { maxQuantity: e.target.value })}
                                    placeholder="Deixe em branco para quantidade exata"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-1.5">
                            <Label>Quantidade</Label>
                            <Input
                                type="number"
                                min={1}
                                step={1}
                                value={group.minQuantity}
                                onChange={(e) =>
                                    onUpdate(index, { minQuantity: Number(e.target.value) })
                                }
                            />
                        </div>
                    )}
                </div>
            ))}

            <Button type="button" variant="outline" className="w-full" onClick={onAdd}>
                <Plus className="size-4 mr-2" />
                Adicionar grupo
            </Button>
        </div>
    );
}
