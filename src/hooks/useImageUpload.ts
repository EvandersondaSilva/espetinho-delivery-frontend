"use client";

import { useCallback, useState } from "react";
import { showError } from "@/lib/toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Gerencia seleção de imagem em formulários: arquivo escolhido, preview local
 * (data URL), validação de tamanho e os estados de remover/restaurar usados na edição.
 *
 * @param initialPreview URL de imagem já existente (ex.: produto em edição).
 */
export function useImageUpload(initialPreview: string | null = null) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(initialPreview);
    const [imageRemoved, setImageRemoved] = useState(false);

    const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            showError("Imagem muito grande (máx 5MB)");
            return;
        }

        setSelectedFile(file);
        setImageRemoved(false);

        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    }, []);

    const clearImage = useCallback(() => {
        setSelectedFile(null);
        setImagePreview(null);
        setImageRemoved(true);
    }, []);

    /** Reseta o estado para uma imagem existente (ou nenhuma). */
    const resetTo = useCallback((preview: string | null = null) => {
        setSelectedFile(null);
        setImagePreview(preview);
        setImageRemoved(false);
    }, []);

    return {
        selectedFile,
        imagePreview,
        imageRemoved,
        handleImageChange,
        clearImage,
        resetTo,
    };
}
