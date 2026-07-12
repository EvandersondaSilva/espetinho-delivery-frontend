import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { maskBRLInput } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface CashChangeFieldProps {
    value: string;
    noChangeNeeded: boolean;
    onChange: (value: string) => void;
    onNoChangeNeededChange: (value: boolean) => void;
}

export function CashChangeField({
    value,
    noChangeNeeded,
    onChange,
    onNoChangeNeededChange,
}: CashChangeFieldProps) {
    return (
        <div className="grid gap-1.5">
            <Label htmlFor="changeFor">Troco para quanto?</Label>
            <Input
                id="changeFor"
                value={value}
                onChange={(e) => onChange(maskBRLInput(e.target.value))}
                placeholder="R$ 0,00"
                disabled={noChangeNeeded}
            />

            <Button
                type="button"
                variant={noChangeNeeded ? "default" : "outline"}
                size="sm"
                onClick={() => onNoChangeNeededChange(!noChangeNeeded)}
                className={cn(
                    "w-fit gap-1.5",
                    noChangeNeeded && "border-red-600 bg-red-600 text-white hover:bg-red-700"
                )}
            >
                {noChangeNeeded && <Check className="size-3.5" />}
                Não preciso de troco
            </Button>
        </div>
    );
}
