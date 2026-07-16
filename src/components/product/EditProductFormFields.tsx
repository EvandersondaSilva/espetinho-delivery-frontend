"use client";

import { Category, Product } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface EditProductFormFieldsProps {
    product: Product;
    categories: Category[];
    categoryId: string;
    priceValue: string;
    onCategoryChange: (value: string) => void;
    onPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function EditProductFormFields({
    product,
    categories,
    categoryId,
    priceValue,
    onCategoryChange,
    onPriceChange,
}: EditProductFormFieldsProps) {
    return (
        <>
            {/* Nome */}
            <div>
                <Label htmlFor="editProductName" className="mb-2">
                    Nome do produto
                </Label>
                <Input
                    id="editProductName"
                    name="name"
                    required
                    defaultValue={product.name}
                    placeholder="Digite o nome do produto..."
                    className="border-border bg-background"
                />
            </div>

            {/* Preço + Categoria */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="editProductPrice" className="mb-2">
                        Preço (R$)
                    </Label>
                    <Input
                        id="editProductPrice"
                        name="price"
                        type="text"
                        required
                        value={priceValue}
                        onChange={onPriceChange}
                        placeholder="0.00"
                        className="border-border bg-background"
                    />
                </div>

                <div>
                    <Label htmlFor="editCategoryId" className="mb-2">
                        Categoria
                    </Label>
                    <Select onValueChange={onCategoryChange} value={categoryId}>
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

                    {/* hidden para envio */}
                    <input type="hidden" name="categoryId" value={categoryId} />
                </div>
            </div>

            {/* Estoque */}
            <div>
                <Label htmlFor="editProductStock" className="mb-2">
                    Estoque
                </Label>
                <Input
                    id="editProductStock"
                    name="stock"
                    type="number"
                    min={0}
                    step={1}
                    defaultValue={product.stock}
                    placeholder="Ex: 40"
                    className="border-border bg-background"
                />
            </div>

            {/* Descrição */}
            <div>
                <Label htmlFor="editProductDescription" className="mb-2">
                    Descrição{" "}
                    <span className="text-xs text-gray-500">(opcional)</span>
                </Label>

                <Textarea
                    id="editProductDescription"
                    name="description"
                    defaultValue={product.description || ""}
                    placeholder="Digite a descrição do produto..."
                    className="border-border bg-background"
                    rows={3}
                />
            </div>
        </>
    );
}