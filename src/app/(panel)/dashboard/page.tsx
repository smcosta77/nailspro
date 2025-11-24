// src/app/(panel)/dashboard/page.tsx
import getSession from "@/lib/getSesstion";
import { redirect } from "next/navigation";
import AssistenteAgendaPage from "./assistente-agenda/page";

export default async function Dashboard() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <AssistenteAgendaPage />
    </div>
  );
}
