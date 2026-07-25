"use client";

import { Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
                                    categoryIds: [],
                                    fixedItems: [],
                                    productIds: [],
                                })
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CATEGORY_CHOICE">Escolha por categoria</SelectItem>
                                <SelectItem value="PRODUCT_CHOICE">Escolha entre produtos específicos</SelectItem>
                                <SelectItem value="FIXED_PRODUCT">Produto fixo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {group.type === "CATEGORY_CHOICE" && (
                        <div className="grid gap-1.5">
                            <Label>Categorias</Label>
                            <div className="grid gap-2 max-h-48 overflow-y-auto rounded-lg border border-border p-3">
                                {categories.map((category) => {
                                    const checked = group.categoryIds.includes(category.id);

                                    return (
                                        <label
                                            key={category.id}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={(value) =>
                                                    onUpdate(index, {
                                                        categoryIds: value
                                                            ? [...group.categoryIds, category.id]
                                                            : group.categoryIds.filter(
                                                                  (id) => id !== category.id
                                                              ),
                                                    })
                                                }
                                            />
                                            {category.name}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {group.type === "PRODUCT_CHOICE" && (
                        <div className="grid gap-1.5">
                            <Label>Produtos</Label>
                            <div className="grid gap-2 max-h-48 overflow-y-auto rounded-lg border border-border p-3">
                                {products.map((product) => {
                                    const checked = group.productIds.includes(product.id);

                                    return (
                                        <label
                                            key={product.id}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={(value) =>
                                                    onUpdate(index, {
                                                        productIds: value
                                                            ? [...group.productIds, product.id]
                                                            : group.productIds.filter(
                                                                  (id) => id !== product.id
                                                              ),
                                                    })
                                                }
                                            />
                                            {product.name}
                                        </label>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Selecione pelo menos 2 produtos.
                            </p>
                        </div>
                    )}

                    {group.type === "FIXED_PRODUCT" && (
                        <div className="grid gap-1.5">
                            <Label>Produtos fixos</Label>
                            <div className="space-y-2">
                                {group.fixedItems.map((item, itemIndex) => (
                                    <div key={itemIndex} className="flex items-center gap-2">
                                        <Select
                                            value={item.productId}
                                            onValueChange={(value) =>
                                                onUpdate(index, {
                                                    fixedItems: group.fixedItems.map((fi, i) =>
                                                        i === itemIndex ? { ...fi, productId: value } : fi
                                                    ),
                                                })
                                            }
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
                                        <Input
                                            type="number"
                                            min={1}
                                            step={1}
                                            className="w-24 shrink-0"
                                            value={item.quantity}
                                            onChange={(e) =>
                                                onUpdate(index, {
                                                    fixedItems: group.fixedItems.map((fi, i) =>
                                                        i === itemIndex
                                                            ? { ...fi, quantity: Number(e.target.value) }
                                                            : fi
                                                    ),
                                                })
                                            }
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                onUpdate(index, {
                                                    fixedItems: group.fixedItems.filter(
                                                        (_, i) => i !== itemIndex
                                                    ),
                                                })
                                            }
                                            aria-label="Remover produto fixo"
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    onUpdate(index, {
                                        fixedItems: [
                                            ...group.fixedItems,
                                            { productId: "", quantity: 1 },
                                        ],
                                    })
                                }
                            >
                                <Plus className="size-4 mr-2" />
                                Adicionar produto fixo
                            </Button>
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

                    {group.type === "CATEGORY_CHOICE" || group.type === "PRODUCT_CHOICE" ? (
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
                    ) : null}
                </div>
            ))}

            <Button type="button" variant="outline" className="w-full" onClick={onAdd}>
                <Plus className="size-4 mr-2" />
                Adicionar grupo
            </Button>
        </div>
    );
}
