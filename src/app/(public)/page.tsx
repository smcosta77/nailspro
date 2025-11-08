import { Footer } from "./_components/footer";
import { Header } from "./_components/header";
import { Hero } from "./_components/hero";
import { Professionals } from "./_components/professionals";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {/* Compensa a altura do header fixo */}
      <main className="flex-1 pt-16 md:pt-[72px]">
        <Hero />
        <Professionals />
      </main>
      <Footer />
    </div>
  );
}
