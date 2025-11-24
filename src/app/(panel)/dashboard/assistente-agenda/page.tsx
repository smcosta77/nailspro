"use client";

import { useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function AssistenteAgendaPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const newMessage: ChatMessage = { role: "user", content: text };
    const nextMessages = [...messages, newMessage];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(
          "Erro ao chamar /api/ai/agenda:",
          res.status,
          errorText
        );
        throw new Error("Falha ao chamar o agente de IA");
      }

      const data = (await res.json()) as { reply?: string; error?: string };

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content:
          data.reply ??
          data.error ??
          "Tive um problema ao responder agora. Pode tentar outra vez?",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Ocorreu um erro ao contactar o assistente. Tenta novamente daqui a pouco.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-background py-8 px-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-sm border p-4 flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">
            Assistente de Agenda – NailsPro
          </h1>
          <p className="text-sm text-slate-600">
            Fale com o assistente para marcar, reagendar ou cancelar horários.
          </p>
        </header>

        <div className="border rounded-md p-3 h-80 overflow-y-auto bg-slate-50">
          {messages.length === 0 && (
            <p className="text-sm text-slate-500">
              Olá! 👋 Sou o assistente de agenda do salão. Como posso ajudar
              hoje?
            </p>
          )}

          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`mb-2 flex ${m.role === "user" ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border text-slate-900"
                  }`}
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex.: Quero marcar manicure amanhã à tarde..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </div>
    </main>
  );
}
