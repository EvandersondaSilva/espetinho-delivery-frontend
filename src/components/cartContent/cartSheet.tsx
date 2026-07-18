"use client";

import { useState, useCallback, memo, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cartContext";
import { useCartBounce } from "@/hooks/useCartBounce";
import { CartContent } from "@/components/cartContent/cartContent";
import { CartTriggerBadge } from "@/components/cartContent/CartTriggerBadge";
import { cn } from "@/lib/utils";

export const CartSheet = memo(function CartSheet() {
  const { itemsCount } = useCart();
  const { bounce, onAnimationEnd } = useCartBounce();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  /**
   * Controla renderização lazy do conteúdo pesado
   * Quando o Sheet abre: adota renderização com requestAnimationFrame
   * Quando o Sheet fecha: remove o conteúdo imediatamente
   */
  useEffect(() => {
    if (open) {

      const frameId = requestAnimationFrame(() => {
        setMounted(true);
      });

      return () => cancelAnimationFrame(frameId);
    } else {

      setMounted(false);
    }
  }, [open]);

  const handleCartClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-white hover:bg-white/15 focus-visible:ring-white/40"
          aria-label={
            itemsCount > 0
              ? `Abrir carrinho, ${itemsCount} itens`
              : "Abrir carrinho"
          }
        >
          <span
            className={cn("relative inline-flex", bounce && "animate-cart-bounce")}
            onAnimationEnd={onAnimationEnd}
          >
            <ShoppingCart className="size-5" />
            <CartTriggerBadge count={itemsCount} />
          </span>
        </Button>
      </SheetTrigger>

      {/* Renderizar CartContent apenas após a animação iniciar */}
      {mounted && <CartContent onCartClose={handleCartClose} />}
    </Sheet>
  );
});

