"use client";

import { Button } from "@/components/ui/button";
import { Order, OrderStatus, getOrders } from "@/services/order";
import { RefreshCcw, ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { formatBRLFromCents } from "@/lib/currency";
import { EyeIcon } from "lucide-react";
import { OrderModal } from "./orderModal";
import { cn } from "@/lib/utils";

type StatusFilter = "TODOS" | OrderStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
    { value: "TODOS", label: "Todos" },
    { value: "RECEBIDO", label: "Recebido" },
    { value: "PREPARANDO", label: "Preparando" },
    { value: "SAIU", label: "Saiu" },
    { value: "ENTREGUE", label: "Entregue" },
];

const STATUS_LABELS: Record<OrderStatus, string> = {
    RECEBIDO: "Recebido",
    PREPARANDO: "Preparando",
    SAIU: "Saiu",
    ENTREGUE: "Entregue",
};

interface OrdersProps {
    token: string;
}

export function Orders({ token }: OrdersProps) {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("TODOS");

    const fetchOrders = async () => {
        try {
            const response = await getOrders(token);

            setOrders(response);
            setLoading(false);

        } catch (error) {
            setLoading(false);
        }
    }

    useEffect(() => {

        async function loadOrders() {
            await fetchOrders();
        }

        loadOrders();

    }, [])

    const statusCounts = useMemo(() => {
        const counts: Record<StatusFilter, number> = {
            TODOS: orders.length,
            RECEBIDO: 0,
            PREPARANDO: 0,
            SAIU: 0,
            ENTREGUE: 0,
        };

        for (const order of orders) {
            counts[order.status] += 1;
        }

        return counts;
    }, [orders]);

    const filteredOrders = useMemo(() => {
        if (statusFilter === "TODOS") return orders;
        return orders.filter((order) => order.status === statusFilter);
    }, [orders, statusFilter]);

    return (
        <div className="space-y-4 sm:space-y-6 px-4 mb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="px-5">
                    <div className="flex items-center gap-3 mb-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="hover:bg-slate-200"
                            aria-label="Voltar"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <h1 className="text-2xl sm:text-3xl font-bold text-black">Pedidos</h1>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                        Gerencie os pedidos dos seus clientes aqui.
                    </p>
                </div>
                <Button onClick={fetchOrders}>
                    <RefreshCcw className="w-4 h-4" />

                </Button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
                {STATUS_FILTERS.map((filter) => {
                    const isActive = statusFilter === filter.value;

                    return (
                        <Button
                            key={filter.value}
                            type="button"
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter(filter.value)}
                            className={cn(
                                "shrink-0",
                                isActive && "border-red-600 bg-red-600 text-white hover:bg-red-700"
                            )}
                        >
                            {filter.label} ({statusCounts[filter.value]})
                        </Button>
                    );
                })}
            </div>

            {loading ? (
                <div>
                    <p className="text-center text-gray-300">Carregando pedidos...</p>
                </div>
            ) : (
                <div>
                    {filteredOrders.length === 0 ? (
                        <p className="text-center text-gray-300">Nenhum pedido encontrado.</p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredOrders.map((order) => (
                                <Card key={order.id} className="bg-card border-card">
                                    <CardHeader>
                                        <div className="flex items-center justify-between gap-2">
                                            <CardTitle className="text-lg lg:text-xl font-bold">
                                                Pedido #{order.id.slice(0, 8)}
                                            </CardTitle>
                                            <Badge variant="outline" className="text-xs select-none">
                                                {STATUS_LABELS[order.status]}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 sm:space-y-4 mt-auto">
                                        <div>
                                            {order.items && order.items.length > 0 && (
                                                <div className="space-y-1">
                                                    {order.items.slice(0, 2).map((item) => (
                                                        <p key={item.id} className="text-xs sm:text-sm text-gray-600 truncate">
                                                            - {item.quantity}x {item.product.name}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col xl:flex-row items-center justify-between pt-4 border-t border-app-border gap-3">
                                            <div className="self-start">
                                                <p className="text-sm text-gray-500 md:text-base">Total</p>
                                                <p className="text-base font-bold "> {formatBRLFromCents(order.total)} </p>
                                            </div>
                                            <Button size="sm"
                                                className="hover:bg-primary/90 w-full  xl:w-auto" onClick={() => setSelectedOrder(order.id)}>
                                                <EyeIcon className="w-4 h-4 mr-1" />
                                                Detalhes
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <OrderModal
                orderId={selectedOrder}
                onClose={async () => {
                    setSelectedOrder(null);
                    await fetchOrders();
                }}
                token={token}
            />

        </div>
    )
}