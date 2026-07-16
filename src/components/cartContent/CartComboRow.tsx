import { memo, useCallback } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartCombo } from "@/context/cartContext";
import { formatBRLFromCents } from "@/lib/currency";

interface CartComboRowProps {
  combo: CartCombo;
  onRemove: (cartComboId: string) => void;
}

/**
 * Linha de combo montado no carrinho: sem controle de quantidade,
 * já que cada combo é uma entrada independente e não editável.
 */
export const CartComboRow = memo(function CartComboRow({
  combo,
  onRemove,
}: CartComboRowProps) {
  const handleRemove = useCallback(() => {
    onRemove(combo.cartComboId);
  }, [combo.cartComboId, onRemove]);

  const itemsSummary = combo.displayItems
    .map((item) => `${item.quantity}x ${item.name}`)
    .join(", ");

  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-3">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        {combo.imageUrl ? (
          <Image
            src={combo.imageUrl}
            alt={combo.name}
            fill
            className="object-cover"
            sizes="64px"
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium">{combo.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatBRLFromCents(combo.price)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleRemove}
            aria-label={`Remover ${combo.name}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        {itemsSummary && (
          <p className="text-xs text-muted-foreground mt-2">{itemsSummary}</p>
        )}
      </div>
    </div>
  );
});
