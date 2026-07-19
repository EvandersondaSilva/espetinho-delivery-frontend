import { memo } from "react";
import { ShoppingCart } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-12 text-center">
        <ShoppingCart className="size-10 text-muted-foreground" />
        <p className="font-medium">Seu carrinho está vazio</p>
        <p className="text-sm text-muted-foreground">
          Adicione produtos do cardápio para continuar
        </p>
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
