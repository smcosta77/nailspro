// src/lib/auth.ts
import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import { UserRole } from "@prisma/client";

if (
    process.env.NODE_ENV !== "production" &&
    (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET)
) {
    console.warn("Missing AUTH_GOOGLE_ID or AUTH_GOOGLE_SECRET (dev only)");
}

export const authConfig = {
    adapter: PrismaAdapter(prisma),
    trustHost: true,
    secret: process.env.AUTH_SECRET,

    session: {
        strategy: "jwt",
    },

    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role ?? UserRole.CLIENT;
            }

            if (!token.role) {
                token.role = UserRole.CLIENT;
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                if (token.sub) {
                    (session.user as any).id = token.sub;
                }

                (session.user as any).role =
                    (token.role as UserRole | undefined) ?? UserRole.CLIENT;
            }

            return session;
        },

        async signIn({ user }) {
            const dbUser = await prisma.user.findUnique({
                where: { id: user.id },
                select: { id: true, role: true },
            });

            if (!dbUser) {
                return true;
            }

            if (!dbUser.role) {
                await prisma.user.update({
                    where: { id: dbUser.id },
                    data: { role: UserRole.CLIENT },
                });
            }

            return true;
        },
    },
} satisfies NextAuthConfig;

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
