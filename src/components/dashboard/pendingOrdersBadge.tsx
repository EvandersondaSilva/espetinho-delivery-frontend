"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { getActiveOrders, Order } from "@/services/order";
import { printOrderReceipt } from "@/services/qzPrint";
import { markOrderPrintedAction } from "@/actions/orders";

const POLL_INTERVAL_MS = 30_000;

interface PendingOrdersBadgeProps {
    token: string | null;
}

async function processAutoPrints(orders: Order[], printingIds: Set<string>) {
    const toPrint = orders.filter(
        (order) => order.status === "RECEBIDO" && !order.autoPrinted && !printingIds.has(order.id)
    );

    for (const order of toPrint) {
        printingIds.add(order.id);

        try {
            await printOrderReceipt(order);

            const result = await markOrderPrintedAction(order.id);
            if (!result.success) {
                console.error("Falha ao marcar pedido como impresso:", order.id, result.message);
            }
        } catch (error) {
            console.error("Falha ao imprimir pedido automaticamente:", order.id, error);
        } finally {
            printingIds.delete(order.id);
        }
    }
}

export function PendingOrdersBadge({ token }: PendingOrdersBadgeProps) {
    const [pendingCount, setPendingCount] = useState(0);
    const printingIdsRef = useRef<Set<string>>(new Set());

    const fetchPendingCount = useCallback(async () => {
        if (!token) return;

        try {
            const orders = await getActiveOrders(token);

            setPendingCount(orders.length);

            void processAutoPrints(orders, printingIdsRef.current);
        } catch {
            // Polling silencioso: não deve interromper a navegação do admin.
        }
    }, [token]);

    useEffect(() => {
        fetchPendingCount();

        const interval = setInterval(fetchPendingCount, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchPendingCount]);

    if (!token || pendingCount === 0) return null;

    return (
        <Link
            href="/admin/dashboard/pedidos"
            className="relative inline-flex items-center rounded-lg p-2 text-white hover:bg-white/15"
            aria-label={`${pendingCount} pedidos pendentes`}
        >
            <Bell className="size-5" />
            <span
                className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold leading-none text-red-700 shadow-sm ring-1 ring-black/10"
                aria-hidden
            >
                {pendingCount}
            </span>
        </Link>
    );
}
