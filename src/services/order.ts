import { apiClient } from "@/lib/api";

export interface CreateOrderInput {
  customerName: string;
  phone: string;
  address: string;
  deliveryFee?: number;
  items?: Array<{
    productId: string;
    quantity: number;
  }>;
  combos?: Array<{
    comboId: string;
    selections: Array<{
      productId: string;
      quantity: number;
    }>;
  }>;
  paymentMethod: string;
  changeFor?: number;
  noChangeNeeded?: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}

export interface OrderComboItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}

export interface OrderCombo {
  id: string;
  comboId: string;
  price: number;
  combo: { id: string; name: string; imageUrl: string | null };
  items: OrderComboItem[];
}

export type OrderStatus = "RECEBIDO" | "PREPARANDO" | "SAIU" | "ENTREGUE";

const ACTIVE_ORDER_STATUSES: OrderStatus[] = ["RECEBIDO", "PREPARANDO", "SAIU"];

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string | null;
  changeFor: number | null;
  noChangeNeeded: boolean;
  autoPrinted: boolean;
  createdAt: string;
  items: OrderItem[];
  combos: OrderCombo[];
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  return apiClient<Order>("/order", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export interface PaginatedOrders {
  orders: Order[];
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

export async function getOrders(
  token: string,
  params?: GetOrdersParams
): Promise<PaginatedOrders> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.status) query.set("status", params.status);

  const qs = query.toString();

  return apiClient<PaginatedOrders>(`/orders${qs ? `?${qs}` : ""}`, {
    method: "GET",
    cache: "no-store",
    token,
  });
}

/**
 * Busca os pedidos "ativos" (ainda não entregues) mesclando 3 buscas
 * paralelas, uma por status - o backend só filtra por um status por vez.
 */
export async function getActiveOrders(token: string): Promise<Order[]> {
  const results = await Promise.all(
    ACTIVE_ORDER_STATUSES.map((status) => getOrders(token, { status, limit: 50 }))
  );

  return results
    .flatMap((result) => result.orders)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

