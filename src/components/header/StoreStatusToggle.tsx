"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { getStoreSettings } from "@/services/settings";
import { updateStoreStatusAction } from "@/actions/settings";
import { showError } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface StoreStatusToggleProps {
    token: string | null;
}

export function StoreStatusToggle({ token }: StoreStatusToggleProps) {
    const [isStoreOpen, setIsStoreOpen] = useState<boolean | null>(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (!token) return;

        getStoreSettings()
            .then((settings) => setIsStoreOpen(settings.isStoreOpen))
            .catch(() => {
                // Se falhar, o toggle só não aparece - não deve travar o header do admin.
            });
    }, [token]);

    if (!token || isStoreOpen === null) return null;

    const handleToggle = async () => {
        const nextValue = !isStoreOpen;
        setUpdating(true);

        try {
            const result = await updateStoreStatusAction(nextValue);

            if (result.success && result.data) {
                setIsStoreOpen(result.data.isStoreOpen);
            } else {
                showError(result.message);
            }
        } catch {
            showError("Erro ao atualizar status da loja.");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <span
                className={cn(
                    "text-xs font-medium",
                    isStoreOpen ? "text-green-100" : "text-red-100"
                )}
            >
                {isStoreOpen ? "Loja aberta" : "Loja fechada"}
            </span>

            <Switch
                checked={isStoreOpen}
                disabled={updating}
                onCheckedChange={handleToggle}
                className="data-checked:bg-green-500 data-unchecked:bg-red-400"
                aria-label={isStoreOpen ? "Fechar loja" : "Abrir loja"}
            />
        </div>
    );
}
