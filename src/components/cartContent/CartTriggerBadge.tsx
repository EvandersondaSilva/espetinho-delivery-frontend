import { memo } from "react";

interface CartTriggerCountBadgeProps {
  count: number;
}

/**
 * Badge de contagem no trigger do carrinho
 * Renderizado apenas quando há itens no carrinho
 */
export const CartTriggerBadge = memo(function CartTriggerBadge({
  count,
}: CartTriggerCountBadgeProps) {
  if (count < 1) return null;

  return (
    <span
      className="absolute -top-2.5 -right-2.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-[13px] font-bold leading-none text-red-700 shadow-sm ring-1 ring-black/10"
      aria-hidden
    >
      {count}
    </span>
  );
});
