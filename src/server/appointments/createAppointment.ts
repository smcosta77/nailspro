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
        professionalId,
        date,
        time,
        serviceId,
        serviceIds,
    } = dto;

    // lista final de serviços: se vier serviceIds usa todos, senão só o principal
    const allServiceIds =
        serviceIds && serviceIds.length > 0 ? serviceIds : [serviceId];

    if (!allServiceIds.length) {
        throw new Error("É necessário informar pelo menos um serviço.");
    }

    // pega todos os serviços escolhidos
    const services = await prisma.service.findMany({
        where: { id: { in: allServiceIds } },
    });

    if (services.length !== allServiceIds.length) {
        throw new Error("Algum serviço selecionado não foi encontrado.");
    }

    // serviço principal: usa o serviceId que veio no DTO,
    // ou cai para o primeiro da lista como fallback
    const mainServiceId = serviceId || allServiceIds[0];

    // duração total (minutos) = soma das durações
    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);

    // monta DateTime a partir de "data + hora"
    const appointmentDate = new Date(`${date}T${time}:00`);

    // valida se já existe agendamento exatamente nesse horário/profissional
    // (se quiser fazer verificação por intervalo depois, dá pra evoluir isso)
    const conflict = await prisma.appointment.findFirst({
        where: {
            professionalId,
            appointmentDate,
        },
    });

    if (conflict) {
        throw new Error("Já existe um agendamento para esse horário/profissional.");
    }

    // cria o agendamento + linhas da tabela de junção
    const appointment = await prisma.appointment.create({
        data: {
            name: clientName,
            email: clientEmail ?? "",
            phone: clientPhone,
            appointmentDate,
            time,
            userId,
            professionalId,
            serviceId: mainServiceId,
            totalDuration,
            services: {
                create: allServiceIds.map((sid) => ({ serviceId: sid })),
            },
        },
        include: {
            service: true,
            professional: true,
            services: {
                include: {
                    service: true,
                },
            },
        },
    });

    return appointment;
}
