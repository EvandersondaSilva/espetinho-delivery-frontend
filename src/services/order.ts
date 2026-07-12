import { apiClient } from "@/lib/api";

export interface CreateOrderInput {
  customerName: string;
  phone: string;
  address: string;
  deliveryFee?: number;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
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

export type OrderStatus = "RECEBIDO" | "PREPARANDO" | "SAIU" | "ENTREGUE";

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  return apiClient<Order>("/order", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getOrders(token: string): Promise<Order[]> {
  return apiClient<Order[]>("/orders", {
    method: "GET",
    cache: "no-store",
    token,
  });
}

