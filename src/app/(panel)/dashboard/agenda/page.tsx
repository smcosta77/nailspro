// src/app/(panel)/dashboard/agendaAdmin/page.tsx
import getSession from "@/lib/getSesstion";
import { redirect } from "next/navigation";

export default async function AgendaDoDiaPage() {

  const session = await getSession();

  if (!session) {
    redirect("/");
  }


  return (
    <AgendaDoDiaPage />
  );
}
