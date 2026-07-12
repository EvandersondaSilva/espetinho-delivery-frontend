

import { formatBRLFromCents } from "@/lib/currency";
import { PAYMENT_METHODS, DELIVERY_OPTIONS } from "@/../src/lib/constants";

export function generateWhatsAppMessage({
    orderId,
    items,
    customerName,
    phone,
    street,
    neighborhood,
    complement,
    total,
    paymentMethod,
    deliveryType,
    receiptUrl,
    changeFor,
    noChangeNeeded,
}: {
    orderId: string;
    items: any[];
    customerName: string;
    phone: string;
    street: string;
    neighborhood: string;
    complement: string;
    total: number;
    paymentMethod: string;
    deliveryType: string;
    receiptUrl?: string;
    changeFor?: string;
    noChangeNeeded?: boolean;
}) {
    const itemsList = items
        .map(
            (i) =>
                `-----------------------------------\n*${i.quantity} ${i.product.name.toUpperCase()} • ${formatBRLFromCents(
                    i.product.price * i.quantity
                )}*\n*OBSERVAÇÃO:* ${i.notes || "-"}`
        )
        .join("\n");

    const now = new Date().toLocaleString("pt-BR", {
        timeZone: "America/Fortaleza",
    });

    const paymentMethodLabel =
        PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label ||
        paymentMethod;

    const deliveryTypeLabel =
        DELIVERY_OPTIONS.find((d) => d.value === deliveryType)?.label ||
        deliveryType;

    const fullAddress = [street, neighborhood, complement]
        .filter((part) => part.trim())
        .join(" • ");

    const orderNumber = `pedido #${orderId.slice(0, 8)}`;

    const receiptLine =
        paymentMethod === "pix" && receiptUrl
            ? `\n*Comprovante PIX:* ${receiptUrl}`
            : "";

    const changeLine =
        paymentMethod === "dinheiro"
            ? noChangeNeeded
                ? "\n*Troco:* Sem troco"
                : changeFor
                    ? `\n*Troco para:* ${changeFor}`
                    : ""
            : "";

    return `
Olá ${customerName.toUpperCase()}!
Seu pedido já está sendo preparado!

Para informações ou cancelamento, entre em contato:
(85) 98628-2445

-----------------------------------
*ESPETINHO O NILSON: ${orderNumber}*
-----------------------------------

*Cliente:* ${customerName}
*Telefone:* ${phone}
*Data do Pedido:* ${now}
*Forma de entrega:* ${deliveryTypeLabel}

*ENDEREÇO:*
${fullAddress}

*Valor dos Produtos:* ${formatBRLFromCents(total)}
*Taxa de Entrega:* R$ 0,00
*Total:* ${formatBRLFromCents(total)}
*Forma de Pagamento:* ${paymentMethodLabel}${receiptLine}${changeLine}

*ITENS DO PEDIDO*
${itemsList}

-----------------------------------
Obrigado pela compra!
-----------------------------------
`.trim();

}