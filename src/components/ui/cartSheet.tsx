"use client";

import { useMemo, useState, useCallback, memo } from "react";
import Image from "next/image";
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react";

import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/context/cartContext";
import { createOrder } from "@/services/order";
import { formatBRLFromCents } from "@/lib/currency";

function CartTriggerCountBadge({ count }: { count: number }) {
  if (count < 1) return null;

  return (
    <span
      className="absolute -top-2.5 -right-2.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-[13px] font-bold leading-none text-red-700 shadow-sm ring-1 ring-black/10"
      aria-hidden
    >
      {count}
    </span>
  );
}

interface CartItemProps {
  product: any;
  quantity: number;
  notes?: string;
  onRemove: (id: string, notes?: string) => void;
  onDecrease: (id: string, notes?: string) => void;
  onIncrease: (product: any, notes?: string) => void;
}

const CartItemRow = memo(function CartItemRow({
  product,
  quantity,
  notes,
  onRemove,
  onDecrease,
  onIncrease,
}: CartItemProps) {
  return (
    <div
      className="flex gap-3 rounded-xl border border-border bg-card p-3"
    >
      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium">{product.name}</p>
            <p className="text-sm text-muted-foreground">{formatBRLFromCents(product.price)}</p>
            {notes && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                Obs: {notes}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onRemove(product.id, notes)}
            aria-label={`Remover ${product.name}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onDecrease(product.id, notes)}
              aria-label={`Diminuir ${product.name}`}
            >
              <Minus className="size-4" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onIncrease(product, notes)}
              aria-label={`Aumentar ${product.name}`}
            >
              <Plus className="size-4" />
            </Button>
          </div>

          <p className="text-sm font-semibold">
            {formatBRLFromCents(product.price * quantity)}
          </p>
        </div>
      </div>
    </div>
  );
});

export function CartSheet() {
  const { items, itemsCount, total, addItem, decreaseItem, removeItem, clearCart } = useCart();
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const disabledCheckout = useMemo(() => {
    if (loading) return true;
    if (items.length === 0) return true;
    if (!customerName.trim() || !phone.trim() || !address.trim()) return true;
    return false;
  }, [address, customerName, items.length, loading, phone]);

  const handleRemoveItem = useCallback((productId: string, notes?: string) => {
    removeItem(productId, notes);
  }, [removeItem]);

  const handleDecreaseItem = useCallback((productId: string, notes?: string) => {
    decreaseItem(productId, notes);
  }, [decreaseItem]);

  const handleAddItem = useCallback((product: any, notes?: string) => {
    addItem(product, 1, notes);
  }, [addItem]);

  const renderedItems = useMemo(() => {
    if (items.length === 0) return null;

    return (
      <div className="flex flex-col gap-3">
        {items.map(({ product, quantity, notes }) => (
          <CartItemRow
            key={`${product.id}-${notes || ''}`}
            product={product}
            quantity={quantity}
            notes={notes}
            onRemove={handleRemoveItem}
            onDecrease={handleDecreaseItem}
            onIncrease={handleAddItem}
          />
        ))}
      </div>
    );
  }, [items, handleRemoveItem, handleDecreaseItem, handleAddItem]);

  const handleCheckout = useCallback(async () => {
    setError(null);
    setSuccess(null);

    if (items.length === 0) {
      setError("Seu carrinho está vazio.");
      return;
    }

    const name = customerName.trim();
    const phoneValue = phone.trim();
    const addressValue = address.trim();

    if (!name || !phoneValue || !addressValue) {
      setError("Preencha nome, telefone e endereço para finalizar.");
      return;
    }

    try {
      setLoading(true);
      const order = await createOrder({
        customerName: name,
        phone: phoneValue,
        address: addressValue,
        deliveryFee: 0,
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      });

      const itemsList = items
        .map((i) =>
          `-----------------------------------\n*${i.quantity} ${i.product.name.toUpperCase()} • ${formatBRLFromCents(
            i.product.price * i.quantity
          )}*\n*OBSERVAÇÃO:* ${i.notes || '-'}`
        )
        .join("\n");

      const now = new Date().toLocaleString("pt-BR", { timeZone: "America/Fortaleza" });

      const message = `
    Olá ${name.toUpperCase()}!
    🟢 Seu pedido já está sendo preparado!
    ⚠️ Para informações sobre o seu pedido ou cancelamento, entrar em contato pelo número (85) XXXXX-XXXX.
    -----------------------------------
    *ESPETINHO DO NILSON: Pedido #${order.id.slice(0, 6).toUpperCase()}*
    -----------------------------------
    *Cliente:* ${name}
    *Telefone:* ${phoneValue}
    *Data do Pedido:* ${now}
    *Forma de retirada do pedido:* Delivery
    *ENDEREÇO DE ENTREGA:*
    ${addressValue}
    *Valor dos Produtos:* ${formatBRLFromCents(total)}
    *Taxa de Entrega:* R$ 0,00
    *Valor Total:* ${formatBRLFromCents(total)}
    *Valor à pagar:* ${formatBRLFromCents(total)}
    *Forma de Pagamento:* A combinar
    
    *ITENS DO PEDIDO*
    ${itemsList}
    -----------------------------------
    ❤️ Obrigado pela compra!
    -----------------------------------
    `.trim();

      const whatsappLink = `https://wa.me/5585986840551?text=${encodeURIComponent(message)}`;
      window.open(whatsappLink, "_blank");

      clearCart();
      setSuccess(`Pedido criado com sucesso! Código: ${order.id}`);
      setOpen(false);
      setCustomerName("");
      setPhone("");
      setAddress("");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Falha ao criar pedido.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [items, customerName, phone, address, total, clearCart]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-white hover:bg-white/15 focus-visible:ring-white/40"
            aria-label={
              itemsCount > 0 ? `Abrir carrinho, ${itemsCount} itens` : "Abrir carrinho"
            }
          />
        }
      >
        <span className="relative inline-flex">
          <ShoppingCart className="size-5" />
          <CartTriggerCountBadge count={itemsCount} />
        </span>
      </SheetTrigger>

      <SheetContent side="right" className="bg-white p-0 text-foreground dark:bg-white">
        <SheetHeader className="border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>Carrinho</SheetTitle>
            {items.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => clearCart()}>
                <Trash2 className="mr-2 size-4" />
                Limpar
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">
          {items.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              Seu carrinho está vazio. Adicione itens para finalizar o pedido.
            </div>
          ) : (
            renderedItems
          )}

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-base font-semibold">{formatBRLFromCents(total)}</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="customerName">Nome</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-0000"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="address">Endereço</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, número, bairro, complemento..."
                />
              </div>

              {error ? (
                <p className="text-sm font-medium text-destructive">{error}</p>
              ) : null}
              {success ? (
                <p className="text-sm font-medium text-primary">{success}</p>
              ) : null}
            </div>
          </div>
        </div>

        <SheetFooter className="border-t">
          <Button className="w-full" disabled={disabledCheckout} onClick={handleCheckout}>
            {loading ? "Finalizando..." : "Finalizar pedido"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

