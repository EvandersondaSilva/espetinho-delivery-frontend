import { memo } from "react";
import { CartCombo } from "@/context/cartContext";
import { CartComboRow } from "./CartComboRow";

interface CartComboListProps {
  combos: CartCombo[];
  onRemove: (cartComboId: string) => void;
}

/**
 * Lista de combos montados no carrinho.
 * Renderiza CartComboRow para cada combo; não aparece nada se não houver combos.
 */
export const CartComboList = memo(function CartComboList({
  combos,
  onRemove,
}: CartComboListProps) {
  if (combos.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {combos.map((combo) => (
        <CartComboRow key={combo.cartComboId} combo={combo} onRemove={onRemove} />
      ))}
    </div>
  );
});
