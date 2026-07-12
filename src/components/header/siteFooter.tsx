"use client";


import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

export function SiteFooter() {
    const pathname = usePathname();

    if (pathname?.startsWith("/admin")) return null;

    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-red-600 text-white dark:bg-red-700">
            <Separator className="bg-red-500" />

            <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-6 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
                <div>
                    <p className="text-base font-bold tracking-wide">
                        🍢 Espetinho do Nilson
                    </p>
                    <p className="mt-1 text-sm text-red-100">
                        🕐 Ter-Sáb: 18h às 00h
                    </p>
                </div>

                <div className="flex flex-col items-center gap-2 text-sm sm:items-end">


                    {WHATSAPP_URL && (
                        <a
                            href={WHATSAPP_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 hover:underline"
                        >
                            <MessageCircle className="size-4" />
                            (85) 98628-2445
                        </a>
                    )}
                </div>
            </div>

            <Separator className="bg-red-500" />

            <p className="px-4 py-3 text-center text-xs text-red-100">
                © {currentYear} Espetinho do Nilson. Todos os direitos reservados.
            </p>
        </footer>
    );
}
