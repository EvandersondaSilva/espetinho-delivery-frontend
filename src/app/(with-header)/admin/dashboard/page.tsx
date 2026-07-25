"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { LogOut } from "lucide-react";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-50">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Button
            onClick={logout}
            variant="ghost"
            size="icon"
            className="text-red-600 hover:bg-red-50"
            aria-label="Sair"
          >
            <LogOut className="w-5 h-5" />
          </Button>
          <h1 className="text-4xl font-bold text-black">Painel de Administração</h1>
        </div>

        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Bem-vindo, {user?.name || "Admin"}!
            </h2>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtos</h3>
            <p className="text-gray-600 mb-4">Gerencie os produtos do seu cardápio</p>
            <Button variant="outline" className="w-full">
              <Link href="/admin/dashboard/products" className="w-full"> Ir para Produtos</Link>
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorias</h3>
            <p className="text-gray-600 mb-4">Organize os produtos em categorias</p>
            <Button variant="outline" className="w-full">
              <Link href="/admin/dashboard/categories" className="w-full"> Ir para Categorias</Link>

            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pedidos</h3>
            <p className="text-gray-600 mb-4">Acompanhe os pedidos dos clientes</p>
            <Button variant="outline" className="w-full">
              <Link href="/admin/dashboard/pedidos" className="w-full"> Ir para Pedidos</Link>
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Combos</h3>
            <p className="text-gray-600 mb-4">Monte combos com produtos e categorias</p>
            <Button variant="outline" className="w-full">
              <Link href="/admin/dashboard/combos" className="w-full"> Ir para Combos</Link>
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações</h3>
            <p className="text-gray-600 mb-4">Status da loja e valor mínimo do pedido</p>
            <Button variant="outline" className="w-full">
              <Link href="/admin/dashboard/configuracoes" className="w-full"> Ir para Configurações</Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
