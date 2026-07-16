"use client";

import { useState } from "react";
import Image from "next/image";
import { Combo } from "@/lib/types";
import { formatBRLFromCents } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { isComboAvailable } from "@/lib/comboAvailability";
import { ComboDialog } from "./ComboDialog";

interface ComboCardProps {
    combo: Combo;
}

export function ComboCard({ combo }: ComboCardProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const available = isComboAvailable(combo);

    return (
        <>
            <div
                className={cn(
                    "bg-card border border-black/10 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer",
                    !available && "opacity-60"
                )}
                onClick={() => available && setDialogOpen(true)}
            >
                <div className="flex flex-row">
                    <div className="p-4 flex flex-col justify-center flex-1">
                        <h2 className="font-semibold text-lg">{combo.name}</h2>
                        {combo.description && (
                            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                                {combo.description}
                            </p>
                        )}
                        <p className="text-primary font-bold mt-3">
                            {formatBRLFromCents(combo.price)}
                        </p>
                    </div>
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0">
                        {combo.imageUrl ? (
                            <Image
                                src={combo.imageUrl}
                                alt={combo.name}
                                fill
                                sizes="(max-width: 768px) 128px, 160px"
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center" />
                        )}
                        {!available && (
                            <Badge variant="destructive" className="absolute top-2 left-2">
                                Esgotado
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {available && (
                <ComboDialog combo={combo} open={dialogOpen} onOpenChange={setDialogOpen} />
            )}
        </>
    );
}
