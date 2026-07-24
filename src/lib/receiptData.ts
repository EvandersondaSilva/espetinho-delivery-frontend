import { formatBRLFromCents } from "@/lib/currency";
import { PAYMENT_METHODS } from "@/lib/constants";

export interface ReceiptOrderItem {
    id: string;
    quantity: number;
    price: number;
    product: { name: string };
}

export interface ReceiptOrderComboItem {
    id: string;
    quantity: number;
    product: { name: string };
}

export interface ReceiptOrderCombo {
    id: string;
    price: number;
    combo: { name: string };
    items: ReceiptOrderComboItem[];
}

export interface ReceiptOrderInput {
    id: string;
    customerName: string;
    phone: string;
    address: string;
    createdAt: string;
    total: number;
    deliveryFee: number;
    paymentMethod: string | null;
    changeFor: number | null;
    noChangeNeeded: boolean;
    items: ReceiptOrderItem[];
    combos: ReceiptOrderCombo[];
}

export interface ReceiptItemLine {
    id: string;
    label: string;
    price: string;
}

export interface ReceiptComboLine {
    id: string;
    label: string;
    price: string;
    subItems: { id: string; label: string }[];
}

export interface ReceiptData {
    orderNumber: string;
    date: string;
    customerName: string;
    phone: string;
    address: string;
    items: ReceiptItemLine[];
    combos: ReceiptComboLine[];
    subtotal: string;
    deliveryFee: string;
    total: string;
    paymentMethodLabel: string;
    changeLine: string | null;
}

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

export function buildReceiptData(order: ReceiptOrderInput): ReceiptData {
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

    return {
        orderNumber: order.id.slice(0, 8).toUpperCase(),
        date: formatDate(order.createdAt),
        customerName: order.customerName,
        phone: order.phone,
        address: order.address,
        items: order.items.map((item) => ({
            id: item.id,
            label: `${item.quantity}x ${item.product.name}`,
            price: formatBRLFromCents(item.price * item.quantity),
        })),
        combos: order.combos.map((combo) => ({
            id: combo.id,
            label: `1x ${combo.combo.name}`,
            price: formatBRLFromCents(combo.price),
            subItems: combo.items.map((item) => ({
                id: item.id,
                label: `${item.quantity}x ${item.product.name}`,
            })),
        })),
        subtotal: formatBRLFromCents(subtotal),
        deliveryFee: formatBRLFromCents(order.deliveryFee),
        total: formatBRLFromCents(order.total),
        paymentMethodLabel,
        changeLine,
    };
}
