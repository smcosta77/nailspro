// src/dtos/appointment.ts
export type CreateAppointmentDTO = {
    userId: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;

    serviceId: string;       // serviço principal (para compat)
    serviceIds?: string[];   // lista completa de serviços

    professionalId: string;
    date: string;            // YYYY-MM-DD
    time: string;            // HH:mm
    totalDuration?: number;  // calculado no backend (opcional aqui)
};
