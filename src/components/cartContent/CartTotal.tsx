import { memo } from "react";
import { formatBRLFromCents } from "@/lib/currency";

interface CartTotalProps {
  total: number;
}

/**
 * Exibe o total do carrinho
 * Componente simples e memoizado para evitar re-renderizações
 */
export const CartTotal = memo(function CartTotal({ total }: CartTotalProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="text-base font-semibold">
          {formatBRLFromCents(total)}
        </span>
      </div>
    </div>
  );
});
