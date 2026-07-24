import { buildReceiptData, ReceiptOrderInput } from "@/lib/receiptData";

const PRINTER_NAME = "POS-80(copy of 3)";

// Largura em caracteres da linha do cupom em texto puro (fonte do firmware da
// impressora térmica, não relacionada ao CSS/72mm usado no cupom HTML via
// window.print()). 42 = padrão de POS-80 com 512 dots em Font A. Se a
// impressora for de 576 dots, sobra uma margem à direita — nada quebra.
const RECEIPT_WIDTH = 42;

const ESC_INIT = "\x1B\x40";
const PAPER_CUT = { type: "raw" as const, format: "command" as const, flavor: "hex" as const, data: "1D5600" };

// A guilhotina fica ~15-25mm depois da cabeça de impressão, e o GS V 0 (1D5600)
// corta na posição atual sem avançar papel. Sem esse avanço as últimas linhas
// ainda não passaram pela lâmina: o cupom sai cortado no meio do texto e o
// resto fica preso no rolo, saindo grudado no topo do próximo pedido.
// 6 linhas (~21mm) cobrem o offset da POS-80 com folga.
const FEED_BEFORE_CUT = "\n".repeat(6);

// QZ Tray manda cada caractere como 1 byte cru com o valor do código Unicode, e
// a impressora interpreta esses bytes na codepage CP437 (padrão de fábrica de
// impressoras ESC/POS) — que não tem acentos portugueses nem "•": no lugar tem
// símbolos gregos e de desenho de caixa (ex.: "ç" virava "τ", "ã" virava "π").
// Em vez de mapear a codepage manualmente (frágil, depende do firmware exato),
// remove os acentos e normaliza a pontuação não-ASCII só nesse caminho — no
// HTML e no WhatsApp os acentos continuam intactos; aqui perdem-se de
// propósito pra garantir impressão correta em qualquer impressora ESC/POS.
// Construído por código numérico (não como caractere literal na regex) porque
// espaços invisíveis (NBSP, espaço fino) são frágeis de embutir direto no
// código-fonte — editores/ferramentas tendem a "achatar" pra espaço comum
// silenciosamente, o que reintroduziria o bug do "R$á5,00".
const NBSP_LIKE_REGEX = new RegExp(`[${String.fromCharCode(0x00a0, 0x202f)}]`, "g");

function toPrinterCharset(text: string): string {
    return text
        .normalize("NFD")
        .replace(/\p{Mn}/gu, "") // remove os acentos (marcas diacríticas deixadas pelo NFD)
        .replace(NBSP_LIKE_REGEX, " ") // espaço não-quebrável/fino -> espaço comum
        .replace(/[•·]/g, "-") // "•" (separador de endereço) e "·" -> hífen
        .replace(/[–—]/g, "-") // travessão/en dash -> hífen
        .replace(/[^\x00-\x7F]/g, "?"); // qualquer outro caractere fora do ASCII -> "?" (nunca vira símbolo aleatório)
}

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
    lines.push(centerText("Obrigado pela compra!", RECEIPT_WIDTH));
    lines.push(separator);

    return toPrinterCharset(lines.join("\n")) + FEED_BEFORE_CUT;
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
