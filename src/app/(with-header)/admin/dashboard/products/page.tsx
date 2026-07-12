
import { apiClient } from "@/lib/api";
import { Product } from "@/lib/types";
import { getToken } from "@/lib/getToken";
import ProductForm from "@/components/product/product-form";
import ProductCard from "@/components/product/product-card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";


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
                    <div className="flex items-center gap-3 mb-3">
                        <Link href="/admin/dashboard">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-slate-200"
                                aria-label="Voltar"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-bold text-black">Produtos</h1>
                    </div>
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
        </div>
    );
}