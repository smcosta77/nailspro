// src/app/(public)/assistenteagenda/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Service = {
  id: string;
  code: string;
  name: string;
  duration: number;
  price?: number;
};

type Professional = {
  id: string;
  name: string;
  specialties: string[];
};

type AppointmentServiceRow = {
  serviceId: string;
  appointmentId: string;
  service: Service;
};

type Appointment = {
  id: string;
  name: string;
  email: string;
  phone: string;
  appointmentDate: string; // ISO
  time: string; // "HH:mm"
  serviceId: string;
  professionalId: string;
  professional: Professional;
  service: Service; // serviço principal
  services: AppointmentServiceRow[]; // todos os serviços
  totalDuration: number; // duração total em minutos
};

type ServicesResponse = { items: Service[] };
type ProfessionalsResponse = { items: Professional[] };
type AppointmentsResponse = { items: Appointment[] };

// slots de 30 em 30 min (09:00 às 18:30)
const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30",
];

const SLOT_MINUTES = 30;

function formatDateInput(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addMinutesToTime(time: string, minutesToAdd: number) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutesToAdd;
  const hour = Math.floor(total / 60);
  const min = total % 60;
  return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export default function AssistenteAgenda() {
  const router = useRouter();
  const { data: session } = useSession();

  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // multi-select de serviços
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedProfessionalId, setSelectedProfessionalId] =
    useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    formatDateInput(new Date()),
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [clientName, setClientName] = useState<string>(
    (session?.user?.name as string | undefined) ?? "",
  );
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail] = useState<string>(
    (session?.user?.email as string | undefined) ?? "",
  );

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // preencher nome quando a sessão carregar
  useEffect(() => {
    if (session?.user?.name) {
      setClientName((prev) => prev || (session.user.name as string));
    }
  }, [session]);

  // ------------------ carregar serviços + profissionais ------------------
  useEffect(() => {
    async function loadInitial() {
      try {
        setLoadingPage(true);

        const [servicesRes, profsRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/professionals"),
        ]);

        if (!servicesRes.ok) {
          throw new Error("Falha ao carregar serviços.");
        }
        if (!profsRes.ok) {
          throw new Error("Falha ao carregar profissionais.");
        }

        const servicesJson = (await servicesRes.json()) as ServicesResponse;
        const profsJson = (await profsRes.json()) as ProfessionalsResponse;

        setServices(servicesJson.items ?? []);
        setProfessionals(profsJson.items ?? []);

        // defaults
        if (servicesJson.items?.length && selectedServiceIds.length === 0) {
          setSelectedServiceIds([servicesJson.items[0].id]);
        }
        if (profsJson.items?.length && !selectedProfessionalId) {
          setSelectedProfessionalId(profsJson.items[0].id);
        }

        setError(null);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar serviços e profissionais.");
      } finally {
        setLoadingPage(false);
      }
    }

    void loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------ carregar agendamentos do dia ------------------
  useEffect(() => {
    if (!selectedDate) return;

    async function loadAppointments(date: string) {
      try {
        setLoadingAppointments(true);
        setError(null);

        const res = await fetch(`/api/appointments?date=${date}`);
        if (!res.ok) {
          const text = await res.text();
          console.error("Erro ao buscar agendamentos:", res.status, text);
          throw new Error("Falha ao carregar agendamentos.");
        }

        const data = (await res.json()) as AppointmentsResponse;
        setAppointments(data.items ?? []);
        setSelectedTime(null); // reset ao trocar de data
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar os agendamentos desse dia.");
        setAppointments([]);
      } finally {
        setLoadingAppointments(false);
      }
    }

    void loadAppointments(selectedDate);
  }, [selectedDate]);

  // ------------------ slots ocupados (considerando totalDuration) ------------------
  const busySlots = useMemo(() => {
    const set = new Set<string>();

    for (const appt of appointments) {
      // duração total (fallbacks de segurança)
      const duration =
        appt.totalDuration && appt.totalDuration > 0
          ? appt.totalDuration
          : appt.services?.length
            ? appt.services.reduce(
              (sum, row) => sum + (row.service?.duration ?? 0),
              0,
            )
            : appt.service?.duration ?? SLOT_MINUTES;

      const [h, m] = appt.time.split(":").map(Number);
      const startMinutes = h * 60 + m;
      const slotsToBlock = Math.max(1, Math.ceil(duration / SLOT_MINUTES));

      for (let i = 0; i < slotsToBlock; i++) {
        const currentMinutes = startMinutes + i * SLOT_MINUTES;
        const hour = Math.floor(currentMinutes / 60);
        const minutes = currentMinutes % 60;

        const slotLabel = `${String(hour).padStart(2, "0")}:${String(
          minutes,
        ).padStart(2, "0")}`;

        set.add(`${appt.professionalId}|${slotLabel}`);
      }
    }

    return set;
  }, [appointments]);

  function isSlotBusy(professionalId: string | null, time: string) {
    if (!professionalId) return true;
    return busySlots.has(`${professionalId}|${time}`);
  }

  // ------------------ seleção múltipla de serviços ------------------
  function toggleService(serviceId: string) {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  }

  const selectedServices = useMemo(
    () => services.filter((s) => selectedServiceIds.includes(s.id)),
    [services, selectedServiceIds],
  );

  const totalPrice = useMemo(
    () =>
      selectedServices.reduce(
        (sum, s) => sum + (typeof s.price === "number" ? s.price : 0),
        0,
      ),
    [selectedServices],
  );

  const totalDuration = useMemo(
    () => selectedServices.reduce((sum, s) => sum + (s.duration || 0), 0),
    [selectedServices],
  );

  const selectedProfessional = professionals.find(
    (p) => p.id === selectedProfessionalId,
  );

  const estimatedEndTime =
    selectedTime && totalDuration > 0
      ? addMinutesToTime(selectedTime, totalDuration)
      : null;

  // ------------------ submit do agendamento ------------------
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (
      selectedServiceIds.length === 0 ||
      !selectedProfessionalId ||
      !selectedDate ||
      !selectedTime
    ) {
      setError("Selecione pelo menos um serviço, profissional, data e horário.");
      return;
    }

    if (!clientName.trim() || !clientPhone.trim()) {
      setError("Preencha o seu nome e WhatsApp para finalizar o agendamento.");
      return;
    }

    const userId = session?.user?.id as string | undefined;
    if (!userId) {
      setError("Você precisa estar autenticado para criar um agendamento.");
      router.push("/login");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          clientName: clientName.trim(),
          clientEmail: clientEmail ?? "",
          clientPhone: clientPhone.trim(),
          professionalId: selectedProfessionalId,
          date: selectedDate,
          time: selectedTime,
          serviceId: selectedServiceIds[0],
          serviceIds: selectedServiceIds,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Erro ao criar agendamento:", res.status, text);
        const msg =
          res.status === 409
            ? "Esse horário já foi ocupado enquanto confirmávamos. Escolha outro horário."
            : "Não foi possível criar o agendamento. Tente novamente.";
        setError(msg);
        return;
      }

      setSuccess("Agendamento criado com sucesso! Vamos abrir a agenda do dia…");

      setTimeout(() => {
        router.push("/");
      }, 1800);
    } catch (err) {
      console.error(err);
      setError("Ocorreu um erro ao tentar criar o agendamento.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background py-8 px-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-sm border p-6 md:p-8 flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-semibold">Agendar horário</h1>
          <p className="text-sm md:text-base text-slate-600">
            Escolha um ou mais serviços, selecione a profissional, o dia e um
            horário livre.
          </p>
        </header>

        {loadingPage ? (
          <p className="text-sm text-slate-500">
            Carregando serviços e profissionais…
          </p>
        ) : (
          <>
            {error && (
              <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
                {success}
              </p>
            )}

            {/* 1. Serviços */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">1. Escolha os serviços</h2>
              <p className="text-xs text-slate-500">
                Pode selecionar mais de um (ex.: Manicure simples + Pedicure
                simples + Blindagem).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {services.map((service) => {
                  const selected = selectedServiceIds.includes(service.id);
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleService(service.id)}
                      className={`text-left rounded-lg border px-3 py-2 text-sm md:text-base transition ${selected
                        ? "border-[#bb5b6a] bg-[#fbecef]"
                        : "border-slate-200 hover:border-[#bb5b6a]/60"
                        }`}
                    >
                      <div className="font-semibold flex justify-between items-center gap-2">
                        <span>{service.name}</span>
                        {typeof service.price === "number" && (
                          <span className="text-xs font-normal text-slate-600">
                            R$ {service.price},00
                          </span>
                        )}
                      </div>
                      {service.duration && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          Duração aproximada: {service.duration} min
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 2. Profissional + Data */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">2. Profissional e dia</h2>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Profissional
                  </label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#bb5b6a]"
                    value={selectedProfessionalId ?? ""}
                    onChange={(e) =>
                      setSelectedProfessionalId(e.target.value || null)
                    }
                  >
                    {professionals.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label
                    className="block text-xs font-medium text-slate-600 mb-1"
                    htmlFor="agenda-date"
                  >
                    Data
                  </label>
                  <input
                    id="agenda-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#bb5b6a]"
                  />
                </div>
              </div>
            </section>

            {/* 3. Slots de horário */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">
                3. Escolha um horário{" "}
                {selectedProfessional ? `com ${selectedProfessional.name}` : ""}
              </h2>

              {loadingAppointments ? (
                <p className="text-sm text-slate-500">
                  Carregando horários deste dia…
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const busy = isSlotBusy(selectedProfessionalId, slot);
                    const selected = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={busy}
                        onClick={() => setSelectedTime(slot)}
                        className={[
                          "rounded-md border px-2 py-1.5 text-xs md:text-sm",
                          "transition disabled:opacity-40 disabled:cursor-not-allowed",
                          selected
                            ? "bg-[#bb5b6a] border-[#bb5b6a] text-white"
                            : "border-slate-200 hover:border-[#bb5b6a]/60",
                        ].join(" ")}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 4. Dados do cliente + confirmar */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">4. Seus dados</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Nome completo
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#bb5b6a]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      WhatsApp com DDD
                    </label>
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="11999999999"
                      className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#bb5b6a]"
                    />
                  </div>
                </div>

                {selectedServices.length > 0 &&
                  selectedProfessional &&
                  selectedDate &&
                  selectedTime && (
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs md:text-sm text-slate-700">
                      <div className="font-semibold mb-1">
                        Resumo do agendamento
                      </div>
                      <p>
                        Serviços:{" "}
                        {selectedServices.map((s) => s.name).join(" + ")}
                      </p>
                      <p>Profissional: {selectedProfessional.name}</p>
                      <p>
                        Data: {selectedDate} · Início: {selectedTime}
                        {estimatedEndTime
                          ? ` · Término aprox.: ${estimatedEndTime}`
                          : null}
                      </p>
                      <p>
                        Duração estimada: {totalDuration || 0} min
                        {totalDuration >= 60
                          ? ` (~${(totalDuration / 60).toFixed(1)} h)`
                          : ""}
                      </p>
                      <p className="mt-1 font-semibold">
                        Total estimado: R$ {totalPrice},00
                      </p>
                    </div>
                  )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-md bg-[#bb5b6a] px-5 py-2.5 text-sm md:text-base font-medium text-white hover:bg-[#a14f5a] disabled:opacity-60"
                >
                  {submitting ? "Aguarde…" : "Confirmar agendamento"}
                </button>
              </form>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
