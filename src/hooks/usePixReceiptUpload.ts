"use client";

import { useCallback, useState } from "react";
import { uploadToCloudinary, validateReceiptFile } from "@/lib/cloudinary";
import { showError } from "@/lib/toast";

export function usePixReceiptUpload() {
    const [preview, setPreview] = useState<string | null>(null);
    const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectFile = useCallback(async (file: File) => {
        const validationError = validateReceiptFile(file);
        if (validationError) {
            setError(validationError);
            showError(validationError);
            return;
        }

        setError(null);
        setReceiptUrl(null);
        setPreview(URL.createObjectURL(file));
        setUploading(true);

        try {
            const url = await uploadToCloudinary(file);
            setReceiptUrl(url);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Falha ao enviar comprovante.";
            setError(msg);
            showError(msg);
        } finally {
            setUploading(false);
        }
    }, []);

    const clear = useCallback(() => {
        setPreview(null);
        setReceiptUrl(null);
        setError(null);
        setUploading(false);
    }, []);

    return {
        preview,
        receiptUrl,
        uploading,
        error,
        selectFile,
        clear,
    };
}
