"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import clsx from "clsx";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button";
import { Banknote, CalendarCheck2, ChevronLeft, ChevronRight, Folder, List, Settings } from "lucide-react";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import logoimage from "@/../public/logo-odonto.png"
import image6 from "@/../public/image6.jpeg";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

type Clinica = {
  id: string;
  nome: string;
  endereco: string;
  href: string;
  ativa?: boolean;
  imagem?: string | StaticImageData;
};

export function SidebarDashboard({ children }: { children: React.ReactNode }) {

  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full">

      <aside className={clsx("flex flex-col border-r bg-background transition-all duration-300 p-4 h-full", {
        "w-20": isCollapsed,
        "w-64": !isCollapsed,
        "hidden md:flex md:fixed": true,
      })}>
        <div className="mb-6 mt-4">
          {!isCollapsed && (
            <Image
              src={image6}
              alt="Logo do NailsPRO"
              priority
              quality={100}
              style={{
                width: "auto",
                height: "auto"
              }}
            />
          )}
        </div>

        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="bg-gray-100 hover:bg-gray-50 text-zinc-900 self-end mb-2"
        >
          {!isCollapsed ? <ChevronLeft className="w-12 h-12" /> : <ChevronRight className="w-12 h-12" />}
        </Button>

        {isCollapsed && (
          <nav className="flex flex-col gap-6 overflow-hidden mt-10">
            <SidebarLink
              href="/dashboard"
              label="Agendamento"
              pathname={pathname}
              isCollapsed={isCollapsed}
              icon={<CalendarCheck2 className="w-6 h-6" />}
            />
            <SidebarLink
              href="/dashboard/services"
              label="Serviços"
              pathname={pathname}
              isCollapsed={isCollapsed}
              icon={<Folder className="w-6 h-6" />}
            />
            <SidebarLink
              href="/dashboard/profile"
              label="Meu Perfil"
              pathname={pathname}
              isCollapsed={isCollapsed}
              icon={<Settings className="w-6 h-6" />}
            />
            <SidebarLink
              href="/dashboard/plans"
              label="Planos"
              pathname={pathname}
              isCollapsed={isCollapsed}
              icon={<Banknote className="w-6 h-6" />}
            />
          </nav>
        )}

        <Collapsible open={!isCollapsed}>
          <CollapsibleContent>
            {/* Grupo: Painel */}
            <div className="flex flex-col gap-1 overflow-hidden mt-4">
              <span className="block text-sm text-gray-400 font-medium uppercase">
                Painel
              </span>

              <SidebarLink
                href="/dashboard"
                label="Agendamento"
                pathname={pathname}
                isCollapsed={isCollapsed}
                icon={<CalendarCheck2 className="w-6 h-6" />}
              />
              <SidebarLink
                href="/dashboard/services"
                label="Serviços"
                pathname={pathname}
                isCollapsed={isCollapsed}
                icon={<Folder className="w-6 h-6" />}
              />
            </div>

            <div className="mt-6 flex flex-col gap-1">
              <span className="block text-sm text-gray-400 font-medium uppercase">
                Configurações
              </span>

              <SidebarLink
                href="/dashboard/profile"
                label="Meu Perfil"
                pathname={pathname}
                isCollapsed={isCollapsed}
                icon={<Settings className="w-6 h-6" />}
              />
              <SidebarLink
                href="/dashboard/plans"
                label="Planos"
                pathname={pathname}
                isCollapsed={isCollapsed}
                icon={<Banknote className="w-6 h-6" />}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

      </aside>

      <div className={clsx("flex flex-1 flex-col transition-all duration-300", {
        "md:ml-20": isCollapsed,
        "md:ml-64": !isCollapsed
      })}>

        <header className="md:hidden flex items-center justify-between border-b px-2 md:px-6 h-14 z-10 sticky top-0 bg-white">
          <Sheet>
            <div className="flex items-center gap-4">
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setIsCollapsed(false)}
                >
                  <List className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <h1 className="text-base md:text-lg font-semibold">Nails Bia</h1>
            </div>

            <SheetContent side="right" className="sm:max-w-xs text-black px-4">
              <SheetTitle>NailsPRO</SheetTitle>
              <SheetDescription>
                Menu Administrativo
              </SheetDescription>
              <nav className="grid gap-2 text-base pt-5">
                <SidebarLink
                  href="/dashboard"
                  label="Agendamento"
                  pathname={pathname}
                  isCollapsed={isCollapsed}
                  icon={<CalendarCheck2 className="w-6 h-6" />}
                />
                <SidebarLink
                  href="/dashboard/services"
                  label="Serviços"
                  pathname={pathname}
                  isCollapsed={isCollapsed}
                  icon={<Folder className="w-6 h-6" />}
                />
                <SidebarLink
                  href="/dashboard/profile"
                  label="Meu Perfil"
                  pathname={pathname}
                  isCollapsed={isCollapsed}
                  icon={<Settings className="w-6 h-6" />}
                />
                <SidebarLink
                  href="/dashboard/plans"
                  label="Planos"
                  pathname={pathname}
                  isCollapsed={isCollapsed}
                  icon={<Banknote className="w-6 h-6" />}
                />
              </nav>

            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 py-4 px-2 md:p-6">
          {children}
        </main>

      </div>

    </div>
  )
}

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  pathname: string;
  isCollapsed: boolean;
}

function SidebarLink({ href, icon, label, pathname, isCollapsed }: SidebarLinkProps) {
  return (
    <Link href={href}>
      <div className={clsx("flex items-center gap-2 px-3 py-2 rounded-md transition-colors", {
        "text-white bg-blue-500": pathname === href,
        "text-gray-700 hover:bg-gray-100": pathname !== href
      })}>
        <span className="w-6 h-6">{icon}</span>
        {!isCollapsed && <span>{label}</span>}
      </div>
    </Link>
  )
}