"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Painel de Administração</h1>
          <Button
            onClick={logout}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2"
          >
            Sair
          </Button>
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
        </div>
      </div>
    </div>
  );
}
