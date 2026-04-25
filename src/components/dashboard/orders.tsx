"use client";

import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { Order } from "@/services/order";
import { RefreshCcw, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { formatBRLFromCents } from "@/lib/currency";
import { EyeIcon } from "lucide-react";
import { OrderModal } from "./orderModal";





interface OrdersProps {
    token: string;
}

export function Orders({ token }: OrdersProps) {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

    const fetchOrders = async () => {
        try {

            const response = await apiClient<Order[]>("/orders", {
                method: "GET",
                cache: "no-store",
                token: token,

            })

            const pendingOrders = response.filter(order => order.status === "RECEBIDO" || order.status === "PREPARANDO" || order.status === "SAIU");

            setOrders(pendingOrders);
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

    const calculateOrderTotal = (order: Order) => {
        if (!order.items) return 0;

        return order.items.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0)

    }

    return (
        <div className="space-y-4 sm:space-y-6 px-4 mb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="px-5">
                    <div className="flex items-center gap-3 mb-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="hover:bg-slate-200"
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
                            {orders.map((order) => (
                                <Card key={order.id} className="bg-card border-card">
                                    <CardHeader>
                                        <div className="flex items-center justify-between gap-2">
                                            <CardTitle className="text-lg lg:text-xl font-bold">
                                                Pedido #{order.id.slice(0, 8)}
                                            </CardTitle>
                                            <Badge variant="outline" className="text-xs select-none">
                                                {order.status}
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
                                                <p className="text-base font-bold "> {formatBRLFromCents(calculateOrderTotal(order))} </p>
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