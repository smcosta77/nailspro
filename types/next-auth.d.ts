// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
    // Dados que vêm do Prisma (User)
    interface User {
        id: string;
        name: string;
        email: string;
        emailVerified?: null | string | boolean;
        image?: string;
        stripeCustomerId?: string;
        time: string[];      // mantém os nomes que você já usa hoje
        addres?: string;     // idem (se quiser, depois renomeia pra "address")
        phone?: string;
        status?: boolean;
        createdAt: string;
        updatedAt: string;

        // 👉 novo campo
        role: UserRole;
    }

    // Sessão que o app consome (client/server)
    interface Session {
        user: DefaultSession["user"] & User;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: UserRole;
    }
}
