"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getStoreSettings } from "@/services/settings";
import { updateStoreStatusAction, updateMinOrderValueAction } from "@/actions/settings";
import { formatBRLFromCents, maskBRLInput, parseBRLToCents } from "@/lib/currency";
import { showError, showSuccess } from "@/lib/toast";

interface StoreSettingsPanelProps {
    token: string;
}

export function StoreSettingsPanel({ token }: StoreSettingsPanelProps) {
    const [isStoreOpen, setIsStoreOpen] = useState<boolean | null>(null);
    const [minOrderValue, setMinOrderValue] = useState<string | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [savingMinOrder, setSavingMinOrder] = useState(false);

    useEffect(() => {
        if (!token) return;

        getStoreSettings()
            .then((settings) => {
                setIsStoreOpen(settings.isStoreOpen);
                setMinOrderValue(formatBRLFromCents(settings.minOrderValue));
            })
            .catch(() => {
                showError("Erro ao carregar configurações da loja.");
            });
    }, [token]);

    async function handleToggleStatus() {
        if (isStoreOpen === null) return;

        const nextValue = !isStoreOpen;
        setUpdatingStatus(true);

        try {
            const result = await updateStoreStatusAction(nextValue);

            if (result.success && result.data) {
                setIsStoreOpen(result.data.isStoreOpen);
                showSuccess("Status da loja atualizado.");
            } else {
                showError(result.message);
            }
        } catch {
            showError("Erro ao atualizar status da loja.");
        } finally {
            setUpdatingStatus(false);
        }
    }

    async function handleSaveMinOrder() {
        if (minOrderValue === null) return;

        setSavingMinOrder(true);

        try {
            const result = await updateMinOrderValueAction(parseBRLToCents(minOrderValue));

            if (result.success && result.data) {
                setMinOrderValue(formatBRLFromCents(result.data.minOrderValue));
                showSuccess("Valor mínimo do pedido atualizado.");
            } else {
                showError(result.message);
            }
        } catch {
            showError("Erro ao atualizar valor mínimo do pedido.");
        } finally {
            setSavingMinOrder(false);
        }
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Status da loja</CardTitle>
                </CardHeader>
                <CardContent>
                    {isStoreOpen === null ? (
                        <p className="text-sm text-muted-foreground">Carregando...</p>
                    ) : (
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="font-medium">
                                    {isStoreOpen ? "Loja aberta" : "Loja fechada"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Quando fechada, novos pedidos são recusados automaticamente.
                                </p>
                            </div>
                            <Switch
                                checked={isStoreOpen}
                                disabled={updatingStatus}
                                onCheckedChange={handleToggleStatus}
                                className="data-checked:bg-green-500 data-unchecked:bg-red-400"
                                aria-label={isStoreOpen ? "Fechar loja" : "Abrir loja"}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pedido mínimo</CardTitle>
                </CardHeader>
                <CardContent>
                    {minOrderValue === null ? (
                        <p className="text-sm text-muted-foreground">Carregando...</p>
                    ) : (
                        <div className="grid gap-1.5">
                            <Label htmlFor="minOrderValue">Valor mínimo do pedido (R$)</Label>
                            <p className="text-sm text-muted-foreground mb-1">
                                Pedidos com valor de produtos abaixo desse mínimo são recusados.
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    id="minOrderValue"
                                    value={minOrderValue}
                                    onChange={(e) => setMinOrderValue(maskBRLInput(e.target.value))}
                                    disabled={savingMinOrder}
                                    placeholder="R$ 0,00"
                                />
                                <Button onClick={handleSaveMinOrder} disabled={savingMinOrder}>
                                    {savingMinOrder ? "Salvando..." : "Salvar"}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
