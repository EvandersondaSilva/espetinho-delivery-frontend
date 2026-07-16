import { getCombos } from "@/services/combo";
import { getToken } from "@/lib/getToken";
import ComboForm from "@/components/combo/combo-form";
import ComboCard from "@/components/combo/combo-card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Combos() {

    const token = await getToken();

    const combos = await getCombos(token!);

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
                        <h1 className="text-2xl sm:text-3xl font-bold text-black">Combos</h1>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                        Gerencie os combos do seu cardápio aqui.
                    </p>
                </div>
                <ComboForm />
            </div>

            {combos.length !== 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {combos.map((combo) => (
                        <ComboCard key={combo.id} combo={combo} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500">Nenhum combo criado ainda.</p>
                </div>
            )}
        </div>
    );
}
