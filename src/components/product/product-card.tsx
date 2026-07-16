"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, EyeOff } from "lucide-react";
import { deleteProductAction, enableProductAction, disableProductAction } from "@/actions/products";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Product } from "@/lib/types";
import Image from "next/image";
import EditProductForm from "./edit-product-form";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleDeleteProduct() {
        setLoading(true);
        try {
            const result = await deleteProductAction(product.id);

            if (result.success) {
                setOpenDeleteDialog(false);
                router.refresh();
            } else {
                alert(result.message || "Erro ao deletar produto");
            }
        } catch (error) {
            alert("Erro ao deletar produto");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleToggleAvailability() {
        setLoading(true);
        try {
            const result = product.available
                ? await disableProductAction(product.id)
                : await enableProductAction(product.id);

            if (result.success) {
                router.refresh();
            } else {
                alert(result.message || "Erro ao atualizar disponibilidade do produto");
            }
        } catch (error) {
            alert("Erro ao atualizar disponibilidade do produto");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const priceInReais = (product.price / 100).toFixed(2);

    const stockBadge =
        product.stock === 0
            ? { label: "Esgotado", className: "bg-red-50 text-red-700 border-red-200" }
            : product.stock <= 5
                ? { label: `Estoque: ${product.stock}`, className: "bg-yellow-50 text-yellow-700 border-yellow-200" }
                : { label: `Estoque: ${product.stock}`, className: "bg-green-50 text-green-700 border-green-200" };

    return (
        <>
            <Card className="transition shadow hover:shadow-md flex flex-col overflow-hidden">
                <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                    {product.imageUrl ? (
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-contain p-2"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">

                        </div>
                    )}
                    {!product.available && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-semibold">Desabilitado</span>
                        </div>
                    )}
                </div>

                <CardHeader>
                    <CardTitle className="text-base md:text-lg line-clamp-2">
                        {product.name}
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                    <p className="text-gray-500 text-xs mb-2 line-clamp-2">
                        {product.description}
                    </p>
                    <p className="text-lg font-bold text-primary mb-2">
                        R$ {priceInReais}
                    </p>
                    <Badge variant="outline" className={`w-fit mb-4 ${stockBadge.className}`}>
                        {stockBadge.label}
                    </Badge>

                    <div className="mt-auto space-y-2">
                        {/* Botões de ação (Editar + Habilitar/Desabilitar) */}
                        <div className="flex gap-2">
                            <EditProductForm product={product} />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleToggleAvailability}
                                disabled={loading}
                                className="flex-1"
                            >
                                {product.available ? (
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
                        <DialogTitle>Deletar produto?</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja deletar o produto <strong>{product.name}</strong>?
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
                            onClick={handleDeleteProduct}
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
