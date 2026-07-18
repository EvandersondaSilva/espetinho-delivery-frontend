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

interface StoreClosedDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function StoreClosedDialog({ open, onOpenChange }: StoreClosedDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Loja fechada</DialogTitle>
                    <DialogDescription>
                        A loja está fechada no momento. Tente novamente mais tarde!
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
