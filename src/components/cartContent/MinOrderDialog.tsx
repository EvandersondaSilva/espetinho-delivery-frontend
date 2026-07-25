import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatBRLFromCents } from "@/lib/currency";

interface MinOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    minOrderValue: number;
    missing?: number;
}

export function MinOrderDialog({ open, onOpenChange, minOrderValue, missing }: MinOrderDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Pedido abaixo do mínimo</DialogTitle>
                    <DialogDescription>
                        Pedido mínimo de {formatBRLFromCents(minOrderValue)}.
                        {missing ? ` Faltam ${formatBRLFromCents(missing)} para atingir.` : ""}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Fechar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
