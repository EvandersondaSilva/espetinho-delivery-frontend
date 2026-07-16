"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, EyeOff, Layers } from "lucide-react";
import { deleteComboAction, enableComboAction, disableComboAction } from "@/actions/combos";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Combo } from "@/lib/types";
import Image from "next/image";
import EditComboForm from "./edit-combo-form";

interface ComboCardProps {
    combo: Combo;
}

export default function ComboCard({ combo }: ComboCardProps) {
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleDeleteCombo() {
        setLoading(true);
        try {
            const result = await deleteComboAction(combo.id);

            if (result.success) {
                setOpenDeleteDialog(false);
                router.refresh();
            } else {
                alert(result.message || "Erro ao deletar combo");
            }
        } catch (error) {
            alert("Erro ao deletar combo");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleToggleAvailability() {
        setLoading(true);
        try {
            const result = combo.available
                ? await disableComboAction(combo.id)
                : await enableComboAction(combo.id);

            if (result.success) {
                router.refresh();
            } else {
                alert(result.message || "Erro ao atualizar disponibilidade do combo");
            }
        } catch (error) {
            alert("Erro ao atualizar disponibilidade do combo");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const priceInReais = (combo.price / 100).toFixed(2);

    return (
        <>
            <Card className="transition shadow hover:shadow-md flex flex-col overflow-hidden">
                <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                    {combo.imageUrl ? (
                        <Image
                            src={combo.imageUrl}
                            alt={combo.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-contain p-2"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <Layers className="w-10 h-10 text-gray-300" />
                        </div>
                    )}
                    {!combo.available && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-semibold">Desabilitado</span>
                        </div>
                    )}
                </div>

                <CardHeader>
                    <CardTitle className="text-base md:text-lg line-clamp-2">
                        {combo.name}
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                    <p className="text-gray-500 text-xs mb-2 line-clamp-2">
                        {combo.description}
                    </p>
                    <p className="text-lg font-bold text-primary mb-1">
                        R$ {priceInReais}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                        {combo.groups.length} {combo.groups.length === 1 ? "grupo" : "grupos"}
                    </p>

                    <div className="mt-auto space-y-2">
                        {/* Botões de ação (Editar + Habilitar/Desabilitar) */}
                        <div className="flex gap-2">
                            <EditComboForm combo={combo} />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleToggleAvailability}
                                disabled={loading}
                                className="flex-1"
                            >
                                {combo.available ? (
                                    <>
                                        <EyeOff className="w-4 h-4 mr-2" />
                                        Desabilitar
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-4 h-4 mr-2" />
                                        Habilitar
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Botão de deletar */}
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setOpenDeleteDialog(true)}
                            disabled={loading}
                            className="w-full"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Deletar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Deletar combo?</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja deletar o combo <strong>{combo.name}</strong>?
                            Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpenDeleteDialog(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteCombo}
                            disabled={loading}
                        >
                            {loading ? "Deletando..." : "Deletar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
