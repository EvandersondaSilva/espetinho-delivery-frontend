import { Order } from "@/lib/types";
import { buildReceiptData } from "@/lib/receiptData";

const SEPARATOR = "-".repeat(28);

interface ReceiptRowProps {
    left: string;
    right?: string;
}

function ReceiptRow({ left, right }: ReceiptRowProps) {
    return (
        <div className="flex justify-between gap-2">
            <span className="min-w-0 wrap-break-word">{left}</span>
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
    const data = buildReceiptData(order);

    return (
        <div id="order-receipt" className="hidden font-mono text-[14px] leading-tight text-black">
            <p className="text-center font-bold">ESPETINHO DO NILSON</p>
            <p>{SEPARATOR}</p>

            <p>Pedido: #{data.orderNumber}</p>
            <p>Data: {data.date}</p>
            <p>Cliente: {data.customerName}</p>
            <p>Telefone: {data.phone}</p>

            <p>{SEPARATOR}</p>
            <p>ENDERECO DE ENTREGA:</p>
            <p>{data.address}</p>

            <p>{SEPARATOR}</p>
            <p>ITENS DO PEDIDO</p>

            {data.items.map((item) => (
                <ReceiptRow key={item.id} left={item.label} right={item.price} />
            ))}

            {data.combos.map((combo) => (
                <div key={combo.id}>
                    <ReceiptRow left={combo.label} right={combo.price} />
                    {combo.subItems.map((item) => (
                        <p key={item.id} className="pl-2">
                            {item.label}
                        </p>
                    ))}
                </div>
            ))}

            <p>{SEPARATOR}</p>
            <ReceiptRow left="Subtotal:" right={data.subtotal} />
            <ReceiptRow left="Taxa de entrega:" right={data.deliveryFee} />
            <ReceiptRow left="TOTAL:" right={data.total} />

            <p>{SEPARATOR}</p>
            <p>Forma de pagamento: {data.paymentMethodLabel}</p>
            {data.changeLine && <p>{data.changeLine}</p>}

            <p>{SEPARATOR}</p>
            <p className="text-center">Obrigado pela compra!</p>
            <p>{SEPARATOR}</p>
        </div>
    );
}
