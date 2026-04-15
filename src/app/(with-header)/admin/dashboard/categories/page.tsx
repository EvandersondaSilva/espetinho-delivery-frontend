import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Category } from "@/lib/types";
import { cookies } from "next/headers";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { Car, Tags } from "lucide-react";


async function getToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get("authToken")?.value || null;
}

/**
 * Função assíncrona para buscar categorias usando o token de autenticação
 */
async function getCategories(token: string): Promise<Category[]> {
    return apiClient<Category[]>("/category", {
        token: token,
    });
}

export default async function Categories() {

    const token = await getToken();

    const categories = await getCategories(token!);

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="px-5">
                    <h1 className="text-2xl sm:text-3xl font-bold text-black my-3">Categorias</h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                        Gerencie as categorias de seus produtos aqui.
                    </p>
                </div>

                <Button variant="default" size="default">
                    Adicionar Categoria
                </Button>
            </div>

            {categories.length !== 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {categories.map((category) => (
                        <Card key={category.id} className="transition shadow hover:shadow-md">
                            <CardHeader>
                                <CardTitle className="gap-2 flex items-center text-base md:text-lg">
                                    <Tags className="w-5 h-5" />
                                    <span>{category.name}</span></CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-500 text-xs">{category.id}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}