"use client";

import { Dialog, DialogClose, DialogDescription, DialogTitle, DialogTrigger, DialogHeader, DialogFooter, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react"

export default function CategoryForm() {

    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button>
                    <Plus className="h-5 w-5 mr-2" />
                    Nova categoria
                </Button>
            </DialogTrigger>
        </Dialog>
    )
}