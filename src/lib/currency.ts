export function formatBRLFromCents(cents: number): string {
  const safeCents = Number.isFinite(cents) ? cents : 0;
  const value = safeCents / 100;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

