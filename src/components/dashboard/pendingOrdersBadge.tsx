"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { getActiveOrders } from "@/services/order";

const POLL_INTERVAL_MS = 30_000;

interface PendingOrdersBadgeProps {
    token: string | null;
}

export function PendingOrdersBadge({ token }: PendingOrdersBadgeProps) {
    const [pendingCount, setPendingCount] = useState(0);

    const fetchPendingCount = useCallback(async () => {
        if (!token) return;

        try {
            const orders = await getActiveOrders(token);

            setPendingCount(orders.length);
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
