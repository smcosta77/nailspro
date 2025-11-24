// src/server/appointments/createAppointment.ts
"use server";

import prisma from "@/lib/prisma";
import type { CreateAppointmentDTO } from "@/dtos/appointment";

export async function createAppointment(dto: CreateAppointmentDTO) {
    const {
        userId,
        clientName,
        clientEmail,
        clientPhone,
        serviceId,
        professionalId,
        date,
        time,
    } = dto;

    // monta DateTime a partir de "data + hora"
    const appointmentDate = new Date(`${date}T${time}:00`);

    // valida se já existe agendamento no mesmo horário para esse profissional
    const conflict = await prisma.appointment.findFirst({
        where: {
            professionalId,
            appointmentDate,
        },
    });

    if (conflict) {
        throw new Error("Já existe um agendamento para esse horário/profissional.");
    }

    const appointment = await prisma.appointment.create({
        data: {
            name: clientName,
            email: clientEmail,
            phone: clientPhone,
            appointmentDate,
            time, // campo string do schema

            userId,
            serviceId,
            professionalId,
        },
        include: {
            service: true,
            professional: true,
        },
    });

    return appointment;
}
