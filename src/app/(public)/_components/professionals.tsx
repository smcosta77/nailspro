import { Card, CardContent } from "@/components/ui/card";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import fotoImg from "@/../public/foto1.png";
import fotoImg1 from "@/../public/image1.jpg";
import fotoImg2 from "@/../public/image2.jpg";
import fotoImg3 from "@/../public/image3.jpg";
import fotoImg4 from "@/../public/image4.jpg";

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
    href: "/clinica/123",
    ativa: true,
    imagem: fotoImg1,
  },
  {
    id: "124",
    nome: "Banho de gel",
    href: "/clinica/124",
    ativa: true,
    imagem: fotoImg2,
  },
  {
    id: "125",
    nome: "Manicure simples",

    href: "/clinica/125",
    ativa: true,
    imagem: fotoImg3,
  },
  {
    id: "126",
    nome: "Combo mãos e pés",
    href: "/clinica/126",
    ativa: true,
    imagem: fotoImg1,
  },
];

export function Professionals() {
  return (
    <section className="bg-background py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* título mais compacto no mobile */}
        <h2 className="mb-8 text-center text-2xl font-bold sm:mb-12 sm:text-3xl">
          Serviços Disponíveis
        </h2>

        {/* centraliza e limita largura dos cards no mobile */}
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
              {/* Imagem colada no topo e mais baixa no mobile */}
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

              {/* conteúdo mais compacto no mobile */}
              <CardContent className="space-y-3 p-3 sm:space-y-4 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold sm:text-lg">
                      {c.nome}
                    </h3>

                  </div>
                  {c.ativa && <span className="h-2.5 w-2.5 rounded-full bg-[#e8b6bc]" />}
                </div>

                <Link
                  href={c.href}
                  aria-label={`Agendar horário na ${c.nome}`}
                  className="
                    flex w-full items-center justify-center
                    rounded-md bg-[#bb5b6a] py-2
                    text-sm font-medium text-white hover:bg-[#a14f5a]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bb5b6a]/60
                    md:text-base
                  "
                >
                  Agendar horário
                  <ArrowRight className="ml-2" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </section>
  );
}
