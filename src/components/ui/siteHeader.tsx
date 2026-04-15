"use client";

import Link from "next/link";
import { Menu, LogIn } from "lucide-react";

import { CartSheet } from "@/components/ui/cartSheet";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-12.5 shrink-0 items-center justify-between border-b border-red-700/30 bg-red-600 px-3 text-white dark:bg-red-700 sm:px-4">
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/15 focus-visible:ring-white/40"
              aria-label="Abrir menu"
            />
          }
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex w-[min(100%,20rem)] flex-col bg-white text-foreground dark:bg-white"
        >
          <SheetHeader className="border-b border-border text-left">
            <SheetTitle className="text-foreground">Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 p-4">
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Início
            </Link>


            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-black transition hover:bg-white/20"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2">

        <CartSheet />
      </div>
    </header>
  );
}
