
import { apiClient } from "@/lib/api";
import { Product } from "@/lib/types";
import { cookies } from "next/headers";
import ProductForm from "@/components/product/product-form";
import ProductCard from "@/components/product/product-card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";


async function getToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get("authToken")?.value || null;
}


async function getProducts(token: string): Promise<Product[]> {
    return apiClient<Product[]>("/product", {
        token: token,
    });
}

export default async function Products() {

    const token = await getToken();

    const products = await getProducts(token!);

    return (
        <div className="space-y-4 sm:space-y-6 px-4 mb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="px-5">
                    <h1 className="text-2xl sm:text-3xl font-bold text-black my-3">Produtos</h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                        Gerencie os produtos de seu cardápio aqui.
                    </p>
                </div>
                <ProductForm />
            </div>

            {products.length !== 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500">Nenhum produto criado ainda.</p>
                </div>
            )}

            <div className="flex justify-around">
                <Link href="/admin/dashboard">
                    <Button variant="outline" className="gap-2 px-4 ">
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </Button>
                </Link>
            </div>
        </div>
    );
}