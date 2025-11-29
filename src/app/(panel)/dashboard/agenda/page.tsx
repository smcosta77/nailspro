// src/app/(panel)/dashboard/agendaAdmin/page.tsx
import getSession from "@/lib/getSesstion";
import { redirect } from "next/navigation";
import AgendaDoDiaPage from "./_components/agenda";

export default async function AgendaPage() {

  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return (
    <AgendaDoDiaPage />
  );
}
