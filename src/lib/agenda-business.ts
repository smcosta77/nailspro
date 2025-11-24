// src/lib/agenda-business.ts
import { SERVICOS } from "@/config/salao";
import prisma from "@/lib/prisma";

export function getServicesByCodes(codes: string[]) {
    return codes
        .map((code) => SERVICOS.find((s) => s.codigo === code))
        .filter(Boolean) as typeof SERVICOS;
}

export function calculateTotalPrice(codes: string[]): number {
    const services = getServicesByCodes(codes);
    return services.reduce((sum, s) => sum + s.preco, 0);
}
