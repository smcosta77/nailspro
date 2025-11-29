// src/app/(public)/.../Professionals.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, Instagram, Music2, LogIn } from "lucide-react";
import fotoImg from "@/../public/foto1.png";
import fotoImg2 from "@/../public/image2.jpg";
import fotoImg5 from "@/../public/image5.jpeg";
import imageCombo from "@/../public/imagecombo.jpeg";
import imageSimples from "@/../public/imagesimples.jpeg";
import { handleRegister } from "../_actions/login";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Clinica = {
  id: string;
  nome: string;
  href: string;
  ativa?: boolean;
  imagem?: StaticImageData;
};

const CLINICAS: Clinica[] = [
  {
    id: "123",
    nome: "Aplicação do alongamento",
    href: "/agendaCliente",
    ativa: true,
    imagem: fotoImg2,
  },
  {
    id: "124",
    nome: "Banho de gel",
    href: "/agendaCliente",
    ativa: true,
    imagem: fotoImg5,
  },
  {
    id: "125",
    nome: "Manicure simples",
    href: "/agendaCliente",
    ativa: true,
    imagem: imageSimples,
  },
  {
    id: "126",
    nome: "Combo mãos e pés",
    href: "/agendaCliente",
    ativa: true,
    imagem: imageCombo,
  },
];

export function Professionals() {
  const { data: session, status } = useSession();
  const router = useRouter();

  async function handleLogin(redirectTo: string = "/dashboard") {
    await handleRegister("google", redirectTo);
  }

  const NavLinks = () => (
    <>
      {status === "loading" ? null : session ? (
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 bg-[#702e35] hover:bg-[#bb5b6a] text-white py-1 rounded-md px-4"
        >
          Meus agendamentos
        </Link>
      ) : (
        <Button onClick={() => handleLogin("/dashboard")}>
          <LogIn />
          Meus agendamentos
        </Button>
      )}
    </>
  );

  return (
    <section className="bg-background py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold sm:mb-12 sm:text-3xl">
          Serviços Disponíveis
        </h2>

        <section className="grid grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          {CLINICAS.map((c) => (
            <Card
              key={c.id}
              className="
                w-full max-w-[320px] sm:max-w-none
                rounded-xl overflow-hidden p-0
                border border-t-0
              "
            >
              <div className="relative w-full h-36 sm:h-40 lg:h-44">
                <Image
                  src={c.imagem ?? fotoImg}
                  alt={`Foto da ${c.nome}`}
                  fill
                  className="block object-cover"
                  sizes="(min-width:1024px) 400px, (min-width:640px) 50vw, 100vw"
                  priority
                />
              </div>

              <CardContent className="space-y-3 p-3 sm:space-y-4 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold sm:text-lg">
                      {c.nome}
                    </h3>
                  </div>
                  {c.ativa && (
                    <span className="h-2.5 w-2.5 rounded-full bg-[#e8b6bc]" />
                  )}
                </div>

                <button
                  type="button"
                  aria-label={`Agendar horário em ${c.nome}`}
                  onClick={async () => {
                    if (status === "authenticated") {
                      router.push(c.href); // já logado → vai direto para agenda
                    } else if (status !== "loading") {
                      await handleLogin(c.href); // não logado → faz login e volta para agenda
                    }
                  }}
                  className="
                    flex w-full items-center justify-center
                    rounded-md bg-[#bb5b6a] py-2
                    text-sm font-medium text-white hover:bg-[#a14f5a]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bb5b6a]/60
                    md:text-base
                  "
                >
                  Agendar horário
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* bloco de info + redes sociais abaixo dos cards */}
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-2xl font-semibold mb-2">Fino Detalhe Studio</h3>
            <p className="mb-4 text-sm text-slate-700">
              Cuidamos das suas unhas com carinho, técnica e muito detalhe –
              um momento de autocuidado para mulheres e homens.
            </p>
            <a
              href="https://wa.me/5511992072006?text=Olá, vim pelo site e gostaria de mais informações sobre os serviços."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              Contato via WhatsApp
            </a>
          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-2">Contatos</h3>

            <p className="text-sm text-slate-700">
              <span className="font-medium">Telefone:</span> 11 99207-2006
            </p>

          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-2">Redes Sociais</h3>
            <div className="flex gap-4">
              {/* WhatsApp atalho */}
              <a
                href="https://wa.me/5511992072006?text=Olá, vim pelo site e gostaria de agendar um horário."
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition-colors"
                aria-label="Fale conosco no WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/finodetalhestudio?igsh=MWE3MzY4anV5Ynp6OA=="
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-pink-600 hover:bg-pink-50 transition-colors"
                aria-label="Visite nosso Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>

              {/* TikTok (ícone genérico de vídeo/música) */}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
