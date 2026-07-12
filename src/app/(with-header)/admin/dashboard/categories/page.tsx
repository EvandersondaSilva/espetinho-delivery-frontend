import { apiClient } from "@/lib/api";
import { Category } from "@/lib/types";
import { getToken } from "@/lib/getToken";
import CategoryForm from "@/components/dashboard/category-form";
import CategoryCard from "@/components/dashboard/category-card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";


async function getCategories(token: string): Promise<Category[]> {
    return apiClient<Category[]>("/category", {
        token: token,
    });
}

export default async function Categories() {

    const token = await getToken();

    const categories = await getCategories(token!);

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
                        <h1 className="text-2xl sm:text-3xl font-bold text-black">Categorias</h1>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                        Gerencie as categorias de seus produtos aqui.
                    </p>
                </div>
                <CategoryForm />
            </div>

            {categories.length !== 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {categories.map((category) => (
                        <CategoryCard key={category.id} category={category} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500">Nenhuma categoria criada ainda.</p>
                </div>
            )}
        </div>
    );
}