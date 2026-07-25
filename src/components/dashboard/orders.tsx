"use client";

import { Button } from "@/components/ui/button";
import { Order, OrderStatus, getOrders, getActiveOrders } from "@/services/order";
import { RefreshCcw, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { formatBRLFromCents, getChangeDue } from "@/lib/currency";
import { EyeIcon } from "lucide-react";
import { OrderModal } from "./orderModal";
import { cn } from "@/lib/utils";

type StatusFilter = "PENDENTES" | "TODOS" | OrderStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
    { value: "PENDENTES", label: "Pendentes" },
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

// Abas que usam paginação de verdade contra o backend (histórico que acumula)
const PAGINATED_FILTERS: StatusFilter[] = ["TODOS", "ENTREGUE"];

interface OrdersProps {
    token: string;
}

export function Orders({ token }: OrdersProps) {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDENTES");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const fetchOrders = async (reset: boolean) => {
        if (reset) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            if (statusFilter === "PENDENTES") {
                const active = await getActiveOrders(token);
                setOrders(active);
                setHasMore(false);
                setPage(1);
            } else if (statusFilter === "TODOS" || statusFilter === "ENTREGUE") {
                const nextPage = reset ? 1 : page + 1;
                const response = await getOrders(token, {
                    page: nextPage,
                    limit: 20,
                    status: statusFilter === "ENTREGUE" ? "ENTREGUE" : undefined,
                });

                setOrders((prev) => (reset ? response.orders : [...prev, ...response.orders]));
                setHasMore(response.hasMore);
                setPage(nextPage);
            } else {
                const response = await getOrders(token, { status: statusFilter, limit: 50 });
                setOrders(response.orders);
                setHasMore(false);
                setPage(1);
            }
        } catch (error) {
            // silencioso: mesmo comportamento de antes
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchOrders(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    const showLoadMore = PAGINATED_FILTERS.includes(statusFilter) && hasMore;

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
                <Button onClick={() => fetchOrders(true)}>
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
                            {filter.label}
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
                    {orders.length === 0 ? (
                        <p className="text-center text-gray-300">Nenhum pedido encontrado.</p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {orders.map((order) => {
                                const changeDue = getChangeDue(order);

                                return (
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
                                                    {changeDue.status === "due" && (
                                                        <Badge className="mt-1 border-amber-200 bg-amber-50 text-amber-900">
                                                            Troco: {formatBRLFromCents(changeDue.amountCents)}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Button size="sm"
                                                    className="hover:bg-primary/90 w-full  xl:w-auto" onClick={() => setSelectedOrder(order.id)}>
                                                    <EyeIcon className="w-4 h-4 mr-1" />
                                                    Detalhes
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {showLoadMore && (
                        <div className="flex justify-center mt-6">
                            <Button
                                variant="outline"
                                onClick={() => fetchOrders(false)}
                                disabled={loadingMore}
                            >
                                {loadingMore ? "Carregando..." : "Carregar mais"}
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <OrderModal
                orderId={selectedOrder}
                onClose={async () => {
                    setSelectedOrder(null);
                    await fetchOrders(true);
                }}
                token={token}
            />

        </div>
    )
}
