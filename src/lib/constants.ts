

export const PAYMENT_METHODS = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "debito", label: "Débito" },
  { value: "credito", label: "Crédito" },
  { value: "pix", label: "PIX" },
] as const;

export const DELIVERY_OPTIONS = [
  { value: "delivery", label: "Delivery" },
  { value: "pickup", label: "Retirada no balcão" },
] as const;
