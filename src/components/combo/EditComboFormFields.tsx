"use client";

import { Combo } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EditComboFormFieldsProps {
    combo: Combo;
    priceValue: string;
    onPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function EditComboFormFields({
    combo,
    priceValue,
    onPriceChange,
}: EditComboFormFieldsProps) {
    return (
        <>
            {/* Nome */}
            <div>
                <Label htmlFor="editComboName" className="mb-2">
                    Nome do combo
                </Label>
                <Input
                    id="editComboName"
                    name="name"
                    required
                    defaultValue={combo.name}
                    placeholder="Digite o nome do combo..."
                    className="border-border bg-background"
                />
            </div>

            {/* Preço */}
            <div>
                <Label htmlFor="editComboPrice" className="mb-2">
                    Preço (R$)
                </Label>
                <Input
                    id="editComboPrice"
                    name="price"
                    type="text"
                    required
                    value={priceValue}
                    onChange={onPriceChange}
                    placeholder="0.00"
                    className="border-border bg-background"
                />
            </div>

            {/* Descrição */}
            <div>
                <Label htmlFor="editComboDescription" className="mb-2">
                    Descrição{" "}
                    <span className="text-xs text-gray-500">(opcional)</span>
                </Label>
                <Textarea
                    id="editComboDescription"
                    name="description"
                    defaultValue={combo.description || ""}
                    placeholder="Digite a descrição do combo..."
                    className="border-border bg-background"
                    rows={3}
                />
            </div>
        </>
    );
}
