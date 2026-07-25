export function formatBRLFromCents(cents: number): string {
  const safeCents = Number.isFinite(cents) ? cents : 0;
  const value = safeCents / 100;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Extrai o valor em centavos (inteiro) de uma string digitada pelo usuário.
 * Considera apenas os dígitos: "R$ 10,50" -> 1050, "1050" -> 1050, "" -> 0.
 */
export function parseBRLToCents(masked: string): number {
  const digits = masked.replace(/\D/g, "");
  if (!digits) return 0;
  return parseInt(digits, 10);
}

/**
 * Máscara de input de preço: recebe o texto digitado e devolve no formato BRL.
 * Retorna "" quando não há dígitos, para não travar o campo vazio.
 */
export function maskBRLInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return formatBRLFromCents(parseBRLToCents(digits));
}

export type ChangeDueResult =
  | { status: "not-applicable" }
  | { status: "no-change-needed" }
  | { status: "invalid" }
  | { status: "due"; amountCents: number };

/**
 * Calcula o troco a devolver (changeFor - total) num pedido em dinheiro.
 * Nunca retorna um valor negativo: se changeFor estiver ausente ou for
 * menor que o total (situação inconsistente), o status vira "invalid".
 */
export function getChangeDue(order: {
  paymentMethod: string | null;
  changeFor: number | null;
  noChangeNeeded: boolean;
  total: number;
}): ChangeDueResult {
  if (order.paymentMethod !== "dinheiro") return { status: "not-applicable" };
  if (order.noChangeNeeded) return { status: "no-change-needed" };
  if (order.changeFor == null || order.changeFor < order.total) return { status: "invalid" };

  return { status: "due", amountCents: order.changeFor - order.total };
}

