"use server";

import { signIn } from "@/lib/auth";

export async function handleRegister(provider: string, redirectTo?: string) {
  await signIn(provider, {
    redirectTo: redirectTo ?? "/dashboard",
  });
}