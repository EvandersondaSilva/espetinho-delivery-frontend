import { memo, useCallback } from "react";
import Image from "next/image";
import { Trash2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/services/product";
import { formatBRLFromCents } from "@/lib/currency";

interface CartItemRowProps {
  product: Product;
  quantity: number;
  notes?: string;
  onRemove: (id: string, notes?: string) => void;
  onDecrease: (id: string, notes?: string) => void;
  onIncrease: (product: Product, notes?: string) => void;
}

/**
 * Linha de item no carrinho com controles de quantidade
 * Memoizado para evitar re-renderizações desnecessárias
 * Imagens carregam com lazy loading para melhor performance
 */
export const CartItemRow = memo(function CartItemRow({
  product,
  quantity,
  notes,
  onRemove,
  onDecrease,
  onIncrease,
}: CartItemRowProps) {
  // Memoizar handlers para evitar criar nova função em cada render
  const handleRemove = useCallback(() => {
    onRemove(product.id, notes);
  }, [product.id, notes, onRemove]);

  const handleDecrease = useCallback(() => {
    onDecrease(product.id, notes);
  }, [product.id, notes, onDecrease]);

  const handleIncrease = useCallback(() => {
    onIncrease(product, notes);
  }, [product, notes, onIncrease]);

  const totalPrice = product.price * quantity;

  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-3">
      {/* Imagem do produto com lazy loading */}
      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="64px"
            loading="lazy" // Lazy loading para melhor performance
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
          />
        ) : null}
      </div>

      {/* Conteúdo principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Cabeçalho: nome, preço e botão remover */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium">{product.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatBRLFromCents(product.price)}
            </p>
            {notes && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                Obs: {notes}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleRemove}
            aria-label={`Remover ${product.name}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        {/* Rodapé: controles de quantidade e total */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handleDecrease}
              aria-label={`Diminuir ${product.name}`}
            >
              <Minus className="size-4" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handleIncrease}
              aria-label={`Aumentar ${product.name}`}
            >
              <Plus className="size-4" />
            </Button>
          </div>

          <p className="text-sm font-semibold">
            {formatBRLFromCents(totalPrice)}
          </p>
        </div>
      </div>
    </div>
  );
});
