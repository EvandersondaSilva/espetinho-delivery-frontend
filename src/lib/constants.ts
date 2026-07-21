

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

export const DELIVERY_NEIGHBORHOODS = [
  { value: "conjunto-palmeiras", label: "Conjunto Palmeiras" },
] as const;

export const PIX_INFO = {
  key: "033.747.063-47",
  holderName: "Antônio Ivanilson Silva Oliveira",
  bank: "Itaú",
} as const;
