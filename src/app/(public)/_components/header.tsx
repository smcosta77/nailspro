"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "../../../components/ui/button";
import { Menu } from "lucide-react";


export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [{ href: "#sucesso", label: "Sucesso" }];

  return (
    <header className="fixed top-0 right-0 left-0 z-[999] py-4 px-6 bg-white/90 backdrop-blur border-b">
      <div className="container mx-auto flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3">

          {/* texto opcional (esconde no mobile, aparece do md pra cima) */}
          <span className="hidden md:inline text-xl font-semibold text-zinc-900">
            FinoDetalhe
            <span className="text-[#bb5b6a] ml-1">Studio</span>
          </span>
        </Link>

        {/* NAV MOBILE */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              className="text-black hover:bg-transparent"
              variant="ghost"
              size="icon"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[240px] sm:w-[300px] z-[9999]">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>Veja nossos links</SheetDescription>
            </SheetHeader>

          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
