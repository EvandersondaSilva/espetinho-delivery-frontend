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

