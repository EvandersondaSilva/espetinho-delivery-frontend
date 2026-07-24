import { buildReceiptData, ReceiptOrderInput } from "@/lib/receiptData";

const PRINTER_NAME = "POS-80(copy of 3)";

// Largura em caracteres da linha do cupom em texto puro (fonte do firmware da
// impressora térmica, não relacionada ao CSS/72mm usado no cupom HTML via
// window.print()). Reaproveita o mesmo número já calibrado no cupom HTML por
// ser o valor mais seguro disponível — não há impressora física disponível
// aqui pra validar um valor maior.
const RECEIPT_WIDTH = 33;

const ESC_INIT = "\x1B\x40";
const PAPER_CUT = { type: "raw" as const, format: "command" as const, flavor: "hex" as const, data: "1D5600" };

function centerText(text: string, width: number): string {
    const leftPad = Math.max(Math.floor((width - text.length) / 2), 0);
    return " ".repeat(leftPad) + text;
}

function padRow(left: string, right: string, width: number): string {
    const gap = width - left.length - right.length;

    if (gap >= 1) {
        return `${left}${" ".repeat(gap)}${right}`;
    }

    // Não cabe na mesma linha: quebra o texto da esquerda antes do valor.
    return `${left}\n${" ".repeat(Math.max(width - right.length, 0))}${right}`;
}

function buildPlainTextReceipt(order: ReceiptOrderInput): string {
    const data = buildReceiptData(order);
    const separator = "-".repeat(RECEIPT_WIDTH);
    const lines: string[] = [];

    lines.push(centerText("ESPETINHO DO NILSON", RECEIPT_WIDTH));
    lines.push(separator);
    lines.push(`Pedido: #${data.orderNumber}`);
    lines.push(`Data: ${data.date}`);
    lines.push(`Cliente: ${data.customerName}`);
    lines.push(`Telefone: ${data.phone}`);
    lines.push(separator);
    lines.push("ENDERECO DE ENTREGA:");
    lines.push(data.address);
    lines.push(separator);
    lines.push("ITENS DO PEDIDO");

    for (const item of data.items) {
        lines.push(padRow(item.label, item.price, RECEIPT_WIDTH));
    }

    for (const combo of data.combos) {
        lines.push(padRow(combo.label, combo.price, RECEIPT_WIDTH));
        for (const subItem of combo.subItems) {
            lines.push(`  ${subItem.label}`);
        }
    }

    lines.push(separator);
    lines.push(padRow("Subtotal:", data.subtotal, RECEIPT_WIDTH));
    lines.push(padRow("Taxa de entrega:", data.deliveryFee, RECEIPT_WIDTH));
    lines.push(padRow("TOTAL:", data.total, RECEIPT_WIDTH));
    lines.push(separator);
    lines.push(`Forma de pagamento: ${data.paymentMethodLabel}`);

    if (data.changeLine) {
        lines.push(data.changeLine);
    }

    lines.push(separator);

    return lines.join("\n") + "\n\n\n";
}

let connectPromise: Promise<void> | null = null;

async function ensureConnected(): Promise<void> {
    const { default: qz } = await import("qz-tray");

    if (qz.websocket.isActive()) return;

    if (!connectPromise) {
        connectPromise = qz.websocket.connect({ retries: 2, delay: 1 }).catch((error) => {
            connectPromise = null;
            throw error;
        });
    }

    await connectPromise;
}

export async function printOrderReceipt(order: ReceiptOrderInput): Promise<void> {
    const { default: qz } = await import("qz-tray");

    await ensureConnected();

    const config = qz.configs.create(PRINTER_NAME);
    const receiptText = buildPlainTextReceipt(order);

    await qz.print(config, [ESC_INIT, receiptText, PAPER_CUT]);
}
