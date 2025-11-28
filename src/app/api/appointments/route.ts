// src/app/api/appointments/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createAppointment } from "@/server/appointments/createAppointment";
import type { CreateAppointmentDTO } from "@/dtos/appointment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/appointments?date=YYYY-MM-DD
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const dateParam = url.searchParams.get("date");

        if (!dateParam) {
            return NextResponse.json(
                { error: "Parâmetro 'date' (YYYY-MM-DD) é obrigatório." },
                { status: 400 }
            );
        }

        const start = new Date(`${dateParam}T00:00:00.000`);
        const end = new Date(`${dateParam}T23:59:59.999`);

        const appointments = await prisma.appointment.findMany({
            where: {
                appointmentDate: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                professional: true,
                service: true,
                services: {
                    include: {
                        service: true,
                    },
                },
            },
            orderBy: {
                appointmentDate: "asc",
            },
        });

        return NextResponse.json({ items: appointments });
    } catch (error) {
        console.error("[APPOINTMENTS_GET_ERROR]", error);
        return NextResponse.json(
            { error: "Erro ao carregar agendamentos." },
            { status: 500 }
        );
    }
}

// src/app/api/appointments/route.ts (POST)
export async function POST(req: Request) {
    try {
        const body = (await req.json()) as Partial<CreateAppointmentDTO>;

        if (
            !body.userId ||
            !body.clientName ||
            !body.clientPhone ||
            !body.serviceId ||                        // ainda exigimos
            !body.professionalId ||
            !body.date ||
            !body.time ||
            !body.serviceIds ||
            !Array.isArray(body.serviceIds) ||
            body.serviceIds.length === 0
        ) {
            return NextResponse.json(
                { error: "Campos obrigatórios em falta para criar agendamento." },
                { status: 400 },
            );
        }

        const appointment = await createAppointment(body as CreateAppointmentDTO);

        return NextResponse.json(
            { message: "Agendamento criado com sucesso.", appointment },
            { status: 201 },
        );
    } catch (error: any) {
        console.error("[APPOINTMENTS_POST_ERROR]", error);

        if (error instanceof Error && error.message.includes("Já existe um agendamento")) {
            return NextResponse.json({ error: error.message }, { status: 409 });
        }

        return NextResponse.json(
            { error: "Erro ao criar agendamento." },
            { status: 500 },
        );
    }
}

