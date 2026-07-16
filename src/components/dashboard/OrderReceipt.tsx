import { Order } from "@/lib/types";
import { formatBRLFromCents } from "@/lib/currency";
import { PAYMENT_METHODS } from "@/lib/constants";

const SEPARATOR = "-".repeat(32);

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

interface ReceiptRowProps {
    left: string;
    right?: string;
}

function ReceiptRow({ left, right }: ReceiptRowProps) {
    return (
        <div className="flex justify-between gap-2">
            <span>{left}</span>
            {right && <span className="shrink-0">{right}</span>}
        </div>
    );
}

interface OrderReceiptProps {
    order: Order;
}

/**
 * Cupom formatado para impressora térmica 80mm.
 * Renderizado sempre no DOM (oculto na tela); só aparece via CSS de @media print (globals.css).
 */
export function OrderReceipt({ order }: OrderReceiptProps) {
    const paymentMethodLabel =
        PAYMENT_METHODS.find((m) => m.value === order.paymentMethod)?.label || "Não informado";

    const changeLine =
        order.paymentMethod === "dinheiro"
            ? order.noChangeNeeded
                ? "Sem troco"
                : order.changeFor
                    ? `Troco para: ${formatBRLFromCents(order.changeFor)}`
                    : null
            : null;

    const subtotal = order.total - order.deliveryFee;

    return (
        <div id="order-receipt" className="hidden font-mono text-[12px] leading-tight text-black">
            <p className="text-center font-bold">ESPETINHO DO NILSON</p>
            <p>{SEPARATOR}</p>

            <p>Pedido: #{order.id.slice(0, 8).toUpperCase()}</p>
            <p>Data: {formatDate(order.createdAt)}</p>
            <p>Cliente: {order.customerName}</p>
            <p>Telefone: {order.phone}</p>

            <p>{SEPARATOR}</p>
            <p>ENDERECO DE ENTREGA:</p>
            <p>{order.address}</p>

            <p>{SEPARATOR}</p>
            <p>ITENS DO PEDIDO</p>

            {order.items.map((item) => (
                <ReceiptRow
                    key={item.id}
                    left={`${item.quantity}x ${item.product.name}`}
                    right={formatBRLFromCents(item.price * item.quantity)}
                />
            ))}

            {order.combos.map((combo) => (
                <div key={combo.id}>
                    <ReceiptRow
                        left={`1x ${combo.combo.name}`}
                        right={formatBRLFromCents(combo.price)}
                    />
                    {combo.items.map((item) => (
                        <p key={item.id} className="pl-2">
                            {item.quantity}x {item.product.name}
                        </p>
                    ))}
                </div>
            ))}

            <p>{SEPARATOR}</p>
            <ReceiptRow left="Subtotal:" right={formatBRLFromCents(subtotal)} />
            <ReceiptRow left="Taxa de entrega:" right={formatBRLFromCents(order.deliveryFee)} />
            <ReceiptRow left="TOTAL:" right={formatBRLFromCents(order.total)} />

            <p>{SEPARATOR}</p>
            <p>Forma de pagamento: {paymentMethodLabel}</p>
            {changeLine && <p>{changeLine}</p>}
            <p>{SEPARATOR}</p>
        </div>
    );
}
