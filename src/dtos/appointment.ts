// src/dtos/appointment.ts
export interface CreateAppointmentDTO {
    userId: string;          // id do salão (User)
    clientName: string;
    clientEmail: string;
    clientPhone: string;

    serviceId: string;
    professionalId: string;

    date: string;            // "2025-11-24"
    time: string;            // "15:30"
}
