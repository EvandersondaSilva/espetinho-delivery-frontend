import { getToken } from "@/lib/getToken";
import { StoreSettingsPanel } from "@/components/dashboard/StoreSettingsPanel";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Configuracoes() {
    const token = await getToken();

    return (
        <div className="space-y-4 sm:space-y-6 px-4 mb-3">
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
                    <h1 className="text-2xl sm:text-3xl font-bold text-black">Configurações</h1>
                </div>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                    Gerencie as configurações da loja aqui.
                </p>
            </div>

            <StoreSettingsPanel token={token!} />
        </div>
    );
}
