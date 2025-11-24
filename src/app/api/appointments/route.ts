// src/app/api/appointments/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createAppointment } from "@/server/appointments/createAppointment";
import type { CreateAppointmentDTO } from "@/dtos/appointment";

export const runtime = "nodejs";

// GET /api/appointments?date=YYYY-MM-DD
// "calendário" do dia: lista todos os agendamentos com serviço e profissional
export async function GET(req: Request) {
    const url = new URL(req.url);
    const dateParam = url.searchParams.get("date");

    if (!dateParam) {
        return NextResponse.json(
            { error: "Parâmetro 'date' (YYYY-MM-DD) é obrigatório." },
            { status: 400 }
        );
    }

    // início e fim do dia
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
            service: true,
            professional: true,
        },
        orderBy: {
            appointmentDate: "asc",
        },
    });

    return NextResponse.json({ items: appointments });
}

// POST /api/appointments
// body: CreateAppointmentDTO
export async function POST(req: Request) {
    try {
        const body = (await req.json()) as Partial<CreateAppointmentDTO>;

        if (
            !body.userId ||
            !body.clientName ||
            !body.clientEmail ||
            !body.clientPhone ||
            !body.serviceId ||
            !body.professionalId ||
            !body.date ||
            !body.time
        ) {
            return NextResponse.json(
                { error: "Campos obrigatórios em falta para criar agendamento." },
                { status: 400 }
            );
        }

        const appointment = await createAppointment(body as CreateAppointmentDTO);

        return NextResponse.json(
            {
                message: "Agendamento criado com sucesso.",
                appointment,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("[APPOINTMENTS_POST_ERROR]", error);

        if (error instanceof Error && error.message.includes("Já existe um agendamento")) {
            return NextResponse.json(
                { error: error.message },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Erro ao criar agendamento." },
            { status: 500 }
        );
    }
}
