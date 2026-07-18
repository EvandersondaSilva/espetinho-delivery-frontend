"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogIn, MessageCircle, Home } from "lucide-react";
import { useState, useEffect } from "react";

import { CartSheet } from "@/components/cartContent/cartSheet";
import { PendingOrdersBadge } from "@/components/dashboard/pendingOrdersBadge";
import { StoreStatusToggle } from "@/components/header/StoreStatusToggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface SiteHeaderProps {
  token: string | null;
}

export function SiteHeader({ token }: SiteHeaderProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      const frameId = requestAnimationFrame(() => {
        setMenuMounted(true);
      });
      return () => cancelAnimationFrame(frameId);
    } else {
      setMenuMounted(false);
    }
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 flex h-12.5 shrink-0 items-center justify-between border-b border-red-700/30 bg-red-600 px-3 text-white dark:bg-red-700 sm:px-4">
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/15 focus-visible:ring-white/40"
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>

        {menuMounted && (
          <SheetContent
            side="left"
            className="flex w-[min(100%,20rem)] flex-col bg-white text-foreground dark:bg-white"
          >
            <SheetHeader className="border-b border-border text-left">
              <SheetTitle className="text-foreground">Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Navegue pelo nosso site usando o menu.
              </SheetDescription>
            </SheetHeader>
            <nav className="flex flex-col gap-1 p-4">
              <Link
                href="/"
                className=" inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Home className="h-4 w-4" />
                Início
              </Link>
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm font-medium text-black transition hover:bg-white/20"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
              <Link
                href={process.env.NEXT_PUBLIC_WHATSAPP_NUMBER!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
              >
                <MessageCircle className="h-4 w-4" />
                Pedir pelo WhatsApp
              </Link>
            </nav>
          </SheetContent>
        )}
      </Sheet>

      <div className="flex items-center gap-2">
        {isAdminRoute ? (
          <>
            <StoreStatusToggle token={token} />
            <PendingOrdersBadge token={token} />
          </>
        ) : (
          <CartSheet />
        )}
      </div>
    </header>
  );
}