import { CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

interface OrderSuccessViewProps {
    orderId: string;
    onBackToMenu: () => void;
}

export function OrderSuccessView({ orderId, onBackToMenu }: OrderSuccessViewProps) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <CheckCircle2 className="size-16 text-green-600" />

            <div className="space-y-1">
                <h2 className="text-lg font-semibold">Pedido enviado com sucesso!</h2>
                <p className="text-sm text-muted-foreground">
                    Seu pedido foi enviado para o WhatsApp da loja. Fique de olho na
                    conversa para acompanhar o preparo e a entrega.
                </p>
            </div>

            <p className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
                Pedido #{orderId.slice(0, 8)}
            </p>

            <div className="mt-2 flex w-full flex-col gap-2">
                {WHATSAPP_URL && (
                    <Button asChild className="w-full">
                        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="size-4" />
                            Acompanhar pelo WhatsApp
                        </a>
                    </Button>
                )}

                <Button variant="outline" className="w-full" onClick={onBackToMenu}>
                    Voltar ao cardápio
                </Button>
            </div>
        </div>
    );
}
