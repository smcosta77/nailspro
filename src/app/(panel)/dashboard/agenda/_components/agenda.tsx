// src/app/(panel)/dashboard/agendaAdmin/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Service = {
  id: string;
  name: string;
  duration: number;
};

type Professional = {
  id: string;
  name: string;
};

type AppointmentService = {
  service: Service;
};

type Appointment = {
  id: string;
  name: string;
  email: string;
  phone: string;
  appointmentDate: string;
  time: string; // HH:mm
  service: Service | null;          // serviço principal
  professional: Professional | null;
  services?: AppointmentService[];  // todos os serviços do agendamento
  totalDuration?: number;           // minutos (vem do backend)
};

type ApiResponse = {
  items: Appointment[];
};

const WORKING_HOURS = Array.from({ length: 11 }, (_, i) => 9 + i); // 09h até 19h

function formatDateInput(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AgendaDoDiaPage() {
  const [date, setDate] = useState<string>(() => formatDateInput(new Date()));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  async function loadAppointments(selectedDate: string) {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/appointments?date=${selectedDate}`);

      if (!res.ok) {
        const text = await res.text();
        console.error("Erro ao buscar agendamentos:", res.status, text);
        throw new Error("Falha ao carregar agendamentos.");
      }

      const data = (await res.json()) as ApiResponse;
      setAppointments(data.items ?? []);
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar os agendamentos desse dia.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAppointments(date);
  }, [date]);

  const appointmentsByHour = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    const validHours = new Set(WORKING_HOURS);

    // inicializa todos os horários
    for (const hour of WORKING_HOURS) {
      const label = `${String(hour).padStart(2, "0")}:00`;
      map.set(label, []);
    }

    for (const appt of appointments) {
      // 1) calcula duração total em minutos
      const temMultiplos = appt.services && appt.services.length > 0;

      const durationFromServices = temMultiplos
        ? appt.services!.reduce(
          (sum, s) => sum + (s.service?.duration ?? 0),
          0,
        )
        : appt.service?.duration ?? 0;

      const baseDuration =
        typeof appt.totalDuration === "number" && appt.totalDuration > 0
          ? appt.totalDuration
          : durationFromServices;

      // se por algum motivo vier 0, considera 60 min
      const durationMinutes = baseDuration > 0 ? baseDuration : 60;

      // 2) converte início + duração em "quantas horas ocupa"
      const [hStr, mStr] = appt.time.split(":");
      const startMinutes = Number(hStr) * 60 + Number(mStr);
      const durationHours = Math.max(1, Math.ceil(durationMinutes / 60));
      const startHour = Math.floor(startMinutes / 60);

      // 3) espalha o agendamento pelos blocos de hora que ele ocupa
      for (let k = 0; k < durationHours; k++) {
        const hourSlot = startHour + k;
        if (!validHours.has(hourSlot)) continue;

        const label = `${String(hourSlot).padStart(2, "0")}:00`;
        const list = map.get(label);
        if (list) {
          list.push(appt);
        }
      }
    }

    // ordena dentro de cada horário pelo time (HH:mm)
    for (const [key, list] of map.entries()) {
      list.sort((a, b) => a.time.localeCompare(b.time));
      map.set(key, list);
    }

    return map;
  }, [appointments]);

  return (
    <main className="min-h-screen flex flex-col items-center py-8 px-4 bg-background">
      <div className="w-full max-w-4xl rounded-xl shadow-sm border p-4 flex flex-col gap-4 bg-background">
        <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Agenda do Dia</h1>
            <p className="text-sm text-slate-600">
              Visualize os agendamentos entre 09:00 e 19:00 para o dia
              selecionado.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <label className="text-sm text-slate-600" htmlFor="agenda-date">
              Data:
            </label>
            <input
              id="agenda-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </header>

        {loading && (
          <p className="text-sm text-slate-500">Carregando agendamentos...</p>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        {!loading && !error && appointments.length === 0 && (
          <p className="text-sm text-slate-500">
            Não há agendamentos para este dia.
          </p>
        )}

        <section className="mt-2 border-t pt-3">
          <div className="flex flex-col gap-2">
            {WORKING_HOURS.map((hour) => {
              const label = `${String(hour).padStart(2, "0")}:00`;
              const slotAppointments = appointmentsByHour.get(label) ?? [];

              return (
                <div
                  key={label}
                  className="flex items-stretch gap-3 border rounded-lg bg-slate-50 px-3 py-2"
                >
                  {/* coluna do horário */}
                  <div className="w-16 flex items-center justify-center">
                    <span className="text-xs font-semibold text-slate-700">
                      {label}
                    </span>
                  </div>

                  {/* coluna dos agendamentos */}
                  <div className="flex-1">
                    {slotAppointments.length === 0 ? (
                      <div className="border border-dashed border-slate-300 rounded-md px-3 py-2 text-xs text-slate-400">
                        Horário livre
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {slotAppointments.map((appt) => {
                          const temMultiplos =
                            appt.services && appt.services.length > 0;

                          const labelServico = temMultiplos
                            ? appt.services!
                              .map((s) => s.service.name)
                              .join(" + ")
                            : appt.service?.name ?? "Serviço";

                          const durationFromServices = temMultiplos
                            ? appt.services!.reduce(
                              (sum, s) =>
                                sum + (s.service.duration ?? 0),
                              0,
                            )
                            : appt.service?.duration ?? 0;

                          const totalDuration =
                            typeof appt.totalDuration === "number" &&
                              appt.totalDuration > 0
                              ? appt.totalDuration
                              : durationFromServices;

                          return (
                            <div
                              key={appt.id}
                              className="border rounded-md bg-white px-3 py-2 text-xs md:text-sm flex flex-col gap-1"
                            >
                              <div className="flex justify-between gap-2">
                                <span className="font-semibold text-slate-800">
                                  {labelServico}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  {appt.time}
                                </span>
                              </div>

                              {totalDuration > 0 && (
                                <div className="text-[11px] text-slate-500">
                                  Duração total:{" "}
                                  <span className="font-medium">
                                    {totalDuration} min
                                  </span>
                                </div>
                              )}

                              <div className="text-[11px] md:text-xs text-slate-600">
                                Profissional:{" "}
                                <span className="font-medium">
                                  {appt.professional?.name ?? "-"}
                                </span>
                              </div>

                              <div className="text-[11px] md:text-xs text-slate-600">
                                Cliente:{" "}
                                <span className="font-medium">
                                  {appt.name}
                                </span>{" "}
                                · {appt.phone}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
