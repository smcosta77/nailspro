// src/app/api/ai/agenda/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { agendaSalaoSystemPrompt } from "@/ai/agendaSalaoPrompt";
import { calculateTotalPrice, getServicesByCodes } from "@/lib/agenda-business";

export const runtime = "nodejs";

type ChatMessage = {
    role: "user" | "assistant";
    content: string;
};

type AgentBookingPayload = {
    confirmado: boolean;
    serviceCodes: string[];
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    professionalName: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
};

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroq(messages: ChatMessage[]): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY não definida");

    const payload = {
        model: "llama-3.1-8b-instant",
        messages: [
            { role: "system", content: agendaSalaoSystemPrompt },
            ...messages,
        ],
        temperature: 0.4,
    };

    const res = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("[AI_AGENDA_GROQ_ERROR]", res.status, text);
        throw new Error("Erro ao contactar serviço de IA (Groq).");
    }

    const data = await res.json();
    const reply: string =
        data.choices?.[0]?.message?.content?.trim() ??
        "Desculpa, não consegui responder agora.";

    return reply;
}

function extractBookingJson(reply: string): {
    cleanText: string;
    booking?: AgentBookingPayload;
} {
    const regex = /<AGENDAMENTO_JSON>([\s\S]*?)<\/AGENDAMENTO_JSON>/;
    const match = reply.match(regex);

    if (!match) {
        return { cleanText: reply.trim() };
    }

    const jsonRaw = match[1].trim();
    const cleanText = reply.replace(regex, "").trim();

    try {
        const parsed = JSON.parse(jsonRaw) as AgentBookingPayload;
        return { cleanText, booking: parsed };
    } catch (error) {
        console.error("[AI_AGENDA_PARSE_JSON_ERROR]", error, jsonRaw);
        return { cleanText };
    }
}

type CreateFromBookingResult =
    | { status: "created"; appointmentId: string; total: number }
    | { status: "conflict"; total: number }
    | { status: "skipped" };

async function createAppointmentFromBooking(
    booking: AgentBookingPayload
): Promise<CreateFromBookingResult> {
    if (!booking.confirmado) return { status: "skipped" };

    const user = await prisma.user.findFirst();
    if (!user) {
        console.error("[AI_AGENDA] Nenhum user encontrado.");
        return { status: "skipped" };
    }

    // valor total sempre calculado pelo backend
    const total = calculateTotalPrice(booking.serviceCodes);
    const services = getServicesByCodes(booking.serviceCodes);

    // pega o primeiro serviço para vincular ao Appointment (se quiser, pode adaptar para multi-serviço)
    const mainServiceCode = booking.serviceCodes[0];
    const mainService = await prisma.service.findUnique({
        where: { code: mainServiceCode },
    });

    if (!mainService) {
        console.error("[AI_AGENDA] Serviço não encontrado p/ código:", mainServiceCode);
        return { status: "skipped" };
    }

    const professional = await prisma.professional.findUnique({
        where: { name: booking.professionalName },
    });

    if (!professional) {
        console.error(
            "[AI_AGENDA] Profissional não encontrado p/ nome:",
            booking.professionalName
        );
        return { status: "skipped" };
    }

    const appointmentDate = new Date(`${booking.date}T${booking.time}:00`);

    // verifica conflito de slot da profissional
    const conflict = await prisma.appointment.findFirst({
        where: {
            professionalId: professional.id,
            appointmentDate,
        },
    });

    if (conflict) {
        console.warn("[AI_AGENDA] Conflito de horário detectado.");
        return { status: "conflict", total };
    }

    const created = await prisma.appointment.create({
        data: {
            name: booking.clientName,
            email: booking.clientEmail ?? "",
            phone: booking.clientPhone ?? "",
            appointmentDate,
            time: booking.time,
            userId: user.id,
            serviceId: mainService.id,
            professionalId: professional.id,
        },
    });

    return { status: "created", appointmentId: created.id, total };
}

// GET só para teste
export async function GET() {
    return NextResponse.json({
        ok: true,
        message: "GET /api/ai/agenda (Groq) está a responder ✅",
    });
}

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as { messages?: ChatMessage[] };

        if (!body.messages || body.messages.length === 0) {
            return NextResponse.json(
                { error: "Nenhuma mensagem enviada." },
                { status: 400 }
            );
        }

        const reply = await callGroq(body.messages);
        const { cleanText, booking } = extractBookingJson(reply);

        // resposta padrão = só o texto da IA
        let finalText = cleanText;

        if (booking?.confirmado) {
            const result = await createAppointmentFromBooking(booking);

            if (result.status === "created") {
                finalText += `

✅ Agendamento registado com sucesso.
Valor total confirmado (de acordo com a tabela oficial): R$ ${result.total},00.
Em instantes você receberá a confirmação também pelo WhatsApp no número informado.`;
            } else if (result.status === "conflict") {
                finalText += `

⚠️ Atenção: enquanto processávamos a confirmação, o horário ${booking.time} para a profissional ${booking.professionalName} já foi ocupado.
O agendamento NÃO foi criado. Por favor, escolha outro horário ou outra profissional. (Valor total continuaria R$ ${result.total},00 para os mesmos serviços.)`;
            }
        }

        return NextResponse.json({ reply: finalText });
    } catch (error) {
        console.error("[AI_AGENDA_ERROR]", error);
        return NextResponse.json(
            { error: "Erro ao falar com o agente de agenda." },
            { status: 500 }
        );
    }
}
