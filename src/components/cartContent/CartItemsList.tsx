import { memo } from "react";
import { Product } from "@/services/product";
import { CartItemRow } from "./CartItemRow";

interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

interface CartItemsListProps {
  items: CartItem[];
  onRemove: (id: string, notes?: string) => void;
  onDecrease: (id: string, notes?: string) => void;
  onIncrease: (product: Product, notes?: string) => void;
  showEmptyState?: boolean;
}

/**
 * Lista de itens do carrinho
 * Renderiza CartItemRow para cada item
 */
export const CartItemsList = memo(function CartItemsList({
  items,
  onRemove,
  onDecrease,
  onIncrease,
  showEmptyState = true,
}: CartItemsListProps) {
  if (items.length === 0) {
    if (!showEmptyState) return null;

    return (
      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        Seu carrinho está vazio. Adicione itens para finalizar o pedido.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map(({ product, quantity, notes }) => (
        <CartItemRow
          key={`${product.id}-${notes || ""}`}
          product={product}
          quantity={quantity}
          notes={notes}
          onRemove={onRemove}
          onDecrease={onDecrease}
          onIncrease={onIncrease}
        />
      ))}
    </div>
  );
});
