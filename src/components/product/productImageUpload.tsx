"use client";

import Image from "next/image";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProductImageUploadProps {
    imagePreview: string | null;
    imageRemoved: boolean;
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    onRestore: () => void;
}

export function ProductImageUpload({
    imagePreview,
    imageRemoved,
    onImageChange,
    onClear,
    onRestore,
}: ProductImageUploadProps) {
    return (
        <div className="space-y-2">
            <Label className="mb-2">Imagem do produto</Label>

            {/* 🔹 Preview da imagem */}
            {imagePreview && !imageRemoved ? (
                <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-gray-100">
                    <Image
                        src={imagePreview}
                        alt="Pré-visualização da imagem"
                        fill
                        sizes="(max-width: 640px) 100vw, 
                   (max-width: 768px) 50vw,
                   (max-width: 1024px) 33vw,
                   25vw"
                        className="object-cover"
                    />

                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={onClear}
                        className="absolute top-2 right-2 z-20 h-8 w-8 p-0"
                        title="Remover imagem"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : imageRemoved ? (
                /* 🔹 Estado: imagem removida */
                <div className="border-2 border-dashed rounded-md p-8 border-red-300 bg-red-50 flex flex-col items-center justify-center">
                    <p className="text-sm text-red-600 mb-4">
                        Imagem será removida
                    </p>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={onRestore}
                        className="w-full"
                    >
                        Restaurar imagem
                    </Button>
                </div>
            ) : (
                /* 🔹 Upload */
                <div className="border-2 border-dashed rounded-md p-8 border-gray-300 flex flex-col items-center justify-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />

                    <Label htmlFor="editFile" className="cursor-pointer">
                        Clique para selecionar uma imagem
                    </Label>

                    <Input
                        id="editFile"
                        type="file"
                        name="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={onImageChange}
                        className="hidden"
                    />
                </div>
            )}
        </div>
    );
}