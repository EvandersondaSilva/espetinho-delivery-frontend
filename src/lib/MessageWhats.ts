

import { formatBRLFromCents } from "@/lib/currency";
import { PAYMENT_METHODS, DELIVERY_OPTIONS, DELIVERY_NEIGHBORHOODS } from "@/../src/lib/constants";
import { CartCombo } from "@/context/cartContext";

export function generateWhatsAppMessage({
    orderId,
    items,
    combos,
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
    combos: CartCombo[];
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

    const itemsSection =
        items.length > 0
            ? `\n\n*ITENS DO PEDIDO*\n${itemsList}`
            : "";

    const combosList = combos
        .map((c) => {
            const productLines = c.displayItems
                .map((d) => `• ${d.quantity}x ${d.name}`)
                .join("\n");
            return `-----------------------------------\n*1x ${c.name} — ${formatBRLFromCents(
                c.price
            )}*\n${productLines}`;
        })
        .join("\n");

    const combosSection =
        combos.length > 0
            ? `\n\n*COMBOS DO PEDIDO*\n${combosList}`
            : "";

    const now = new Date().toLocaleString("pt-BR", {
        timeZone: "America/Fortaleza",
    });

    const paymentMethodLabel =
        PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label ||
        paymentMethod;

    const deliveryTypeLabel =
        DELIVERY_OPTIONS.find((d) => d.value === deliveryType)?.label ||
        deliveryType;

    const neighborhoodLabel =
        DELIVERY_NEIGHBORHOODS.find((n) => n.value === neighborhood)?.label ||
        neighborhood;

    const fullAddress = [street, neighborhoodLabel, complement]
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
*Forma de Pagamento:* ${paymentMethodLabel}${receiptLine}${changeLine}${itemsSection}${combosSection}

-----------------------------------
Obrigado pela compra!
-----------------------------------
`.trim();

}