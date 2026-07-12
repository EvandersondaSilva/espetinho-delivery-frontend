"use client";

import { useState } from "react";
import Image from "next/image";
import { Copy, Check, Upload, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { showSuccess, showError } from "@/lib/toast";

const PIX_KEY = process.env.NEXT_PUBLIC_PIX_KEY;

interface PixReceiptUploadProps {
    preview: string | null;
    receiptUrl: string | null;
    uploading: boolean;
    error: string | null;
    onFileSelect: (file: File) => void;
    onClear: () => void;
}

export function PixReceiptUpload({
    preview,
    receiptUrl,
    uploading,
    error,
    onFileSelect,
    onClear,
}: PixReceiptUploadProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!PIX_KEY) return;

        try {
            await navigator.clipboard.writeText(PIX_KEY);
            setCopied(true);
            showSuccess("Chave PIX copiada!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            showError("Não foi possível copiar a chave PIX.");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onFileSelect(file);
    };

    return (
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <div>
                <Label className="mb-1.5">Chave PIX</Label>
                <div className="flex items-center gap-2">
                    <Input
                        readOnly
                        value={PIX_KEY || "Chave PIX não configurada"}
                        className="bg-gray-50"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleCopy}
                        disabled={!PIX_KEY}
                        aria-label="Copiar chave PIX"
                    >
                        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Faça o pagamento e envie o comprovante abaixo.
                </p>
            </div>

            <div>
                <Label className="mb-1.5">Comprovante do PIX</Label>

                {preview ? (
                    <div className="relative w-full h-40 border rounded-lg overflow-hidden bg-gray-100">
                        <Image
                            src={preview}
                            alt="Comprovante do PIX"
                            fill
                            className="object-contain"
                            sizes="(max-width: 640px) 100vw, 400px"
                        />

                        {uploading && (
                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 text-sm text-white">
                                <Loader2 className="size-4 animate-spin" />
                                Enviando comprovante...
                            </div>
                        )}

                        {!uploading && receiptUrl && (
                            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-green-600/90 py-1 text-xs text-white">
                                <Check className="size-3" />
                                Comprovante enviado
                            </div>
                        )}

                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={onClear}
                            className="absolute top-2 right-2 h-8 w-8 p-0"
                            title="Trocar comprovante"
                            aria-label="Trocar comprovante"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="border-2 border-dashed rounded-md p-6 border-gray-300 flex flex-col items-center justify-center">
                        <Upload className="h-6 w-6 text-gray-400 mb-2" />
                        <Label htmlFor="pixReceiptFile" className="cursor-pointer text-sm text-center">
                            Clique para enviar o comprovante
                        </Label>
                        <Input
                            id="pixReceiptFile"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                )}

                {error && <p className="text-sm font-medium text-destructive mt-2">{error}</p>}
            </div>
        </div>
    );
}
