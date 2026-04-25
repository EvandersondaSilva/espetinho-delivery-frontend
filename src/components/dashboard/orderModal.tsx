import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Order, OrderStatus } from "@/lib/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatBRLFromCents } from "@/lib/currency";
import { CheckCircle2, Circle, Clock, Truck } from "lucide-react";
import { updateOrderStatusAction } from "@/actions/orders";



interface OrderModalProps {
    orderId: string | null;
    onClose: () => Promise<void>;
    token: string;
}

export function OrderModal({ orderId, onClose, token }: OrderModalProps) {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(false);
    const [finishingOrder, setFinishingOrder] = useState(false);

    const fetchOrder = async () => {
        if (!orderId) {
            setOrder(null);
            return;
        }

        try {
            setLoading(true);

            const response = await apiClient<Order>(`/order/${orderId}`, {
                method: "GET",
                token: token,
            });
            setOrder(response);
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    useEffect(() => {
        async function loadOrders() {
            await fetchOrder();
        }

        loadOrders();
    }, [orderId]);

    const orderStatusSequence: OrderStatus[] = [
        OrderStatus.RECEBIDO,
        OrderStatus.PREPARANDO,
        OrderStatus.SAIU,
        OrderStatus.ENTREGUE,
    ];

    const currentStatusIndex = order
        ? orderStatusSequence.indexOf(order.status as OrderStatus)
        : -1;

    const getStatusLabel = (status: OrderStatus): string => {
        const labels: Record<OrderStatus, string> = {
            [OrderStatus.RECEBIDO]: "Recebido",
            [OrderStatus.PREPARANDO]: "Preparando",
            [OrderStatus.SAIU]: "Saiu para entrega",
            [OrderStatus.ENTREGUE]: "Entregue",
        };
        return labels[status];
    };

    const getStatusIcon = (
        status: OrderStatus,
        isCompleted: boolean,
        isCurrent: boolean
    ) => {
        if (isCompleted) {
            return <CheckCircle2 className="w-5 h-5 text-green-600" />;
        }
        if (isCurrent) {
            return <Clock className="w-5 h-5 text-blue-600" />;
        }
        return <Circle className="w-5 h-5 text-gray-300" />;
    };

    /**
     * Avança o status do pedido para o próximo estágio
     * Utiliza a action updateOrderStatusAction
     */
    const handleStatusAdvance = async () => {
        if (!order || currentStatusIndex >= orderStatusSequence.length - 1) {
            return;
        }

        const nextStatus = orderStatusSequence[currentStatusIndex + 1];
        try {
            setLoading(true);
            const result = await updateOrderStatusAction(order.id, nextStatus);
            
            if (result.success && result.data) {
                setOrder(result.data);
            } else {
                console.error("Erro ao atualizar status:", result.message);
            }
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Finaliza o pedido marcando-o como ENTREGUE e fechando o modal
     * O modal ao fechar refrescará a lista de pedidos
     */
    const handleFinishOrder = async () => {
        if (!order) {
            return;
        }

        try {
            setFinishingOrder(true);
            
            // Se o pedido ainda não estiver com status ENTREGUE, atualiza
            if (order.status !== "ENTREGUE") {
                const result = await updateOrderStatusAction(order.id, "ENTREGUE");
                
                if (!result.success) {
                    console.error("Erro ao finalizar pedido:", result.message);
                    setFinishingOrder(false);
                    return;
                }
            }

            // Fecha o modal (que dispara onClose e refrescar a lista)
            await onClose();
        } catch (error) {
            console.error("Erro ao finalizar pedido:", error);
            setFinishingOrder(false);
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Dialog open={orderId !== null} onOpenChange={async (open) => {
            if (!open) {
                await onClose();
            }
        }}>
            {order && (
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold" >Pedido #{order.id.slice(0, 8)}</DialogTitle>
                        <p className="text-sm text-muted-foreground">
                            {formatDate(order.createdAt)}
                        </p>

                        <DialogDescription className="sr-only">
                            Acompanhe o status do pedido e visualize os detalhes dos itens.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Informações do Cliente */}
                        <div className="space-y-3">
                            <h3 className="font-semibold">Informações do Cliente</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Nome</p>
                                    <p className="font-medium">{order.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Telefone</p>
                                    <p className="font-medium">{order.phone}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-muted-foreground">Endereço</p>
                                    <p className="font-medium">{order.address}</p>
                                </div>
                            </div>
                        </div>

                        {/* Timeline de Status */}
                        <div className="space-y-3">
                            <h3 className="font-semibold">Status do Pedido</h3>
                            <div className="space-y-3">
                                {orderStatusSequence.map((status, index) => {
                                    const isCompleted = index <= currentStatusIndex;
                                    const isCurrent = index === currentStatusIndex;

                                    return (
                                        <div key={status} className="flex items-center gap-3">
                                            {getStatusIcon(status, isCompleted && !isCurrent, isCurrent)}
                                            <div className="flex-1">
                                                <p
                                                    className={`text-sm font-medium ${isCurrent ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"
                                                        }`}
                                                >
                                                    {getStatusLabel(status)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Itens do Pedido */}
                        <div className="space-y-3">
                            <h3 className="font-semibold">Itens do Pedido</h3>
                            <div className="border rounded-lg divide-y">
                                {order.items.map((item) => (
                                    <div key={item.id} className="p-3 flex items-center gap-3">
                                        {item.product.imageUrl && (
                                            <img
                                                src={item.product.imageUrl}
                                                alt={item.product.name}
                                                className="w-16 h-16 rounded object-cover"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{item.product.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Qtd: {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">
                                                {formatBRLFromCents(item.price * item.quantity)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatBRLFromCents(item.price)} un
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Resumo do Pedido */}
                        <div className="border-t pt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">
                                    {formatBRLFromCents(
                                        order.total - order.deliveryFee
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Taxa de Entrega</span>
                                <span className="font-medium">
                                    {formatBRLFromCents(order.deliveryFee)}
                                </span>
                            </div>
                            <div className="flex justify-between text-base font-bold border-t pt-2">
                                <span>Total</span>
                                <span>{formatBRLFromCents(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-4 border-t">
                        <DialogClose asChild>
                            <Button variant="outline">Fechar</Button>
                        </DialogClose>

                        {currentStatusIndex < orderStatusSequence.length - 1 && (
                            <Button onClick={handleStatusAdvance} className="gap-2">
                                <Truck className="w-4 h-4" />
                                Avançar Status
                            </Button>
                        )}

                        {currentStatusIndex === orderStatusSequence.length - 1 && (
                            <Button 
                                onClick={handleFinishOrder} 
                                disabled={finishingOrder}
                                className="gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                {finishingOrder ? "Finalizando..." : "Finalizar Pedido"}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            )}
        </Dialog>
    );
}