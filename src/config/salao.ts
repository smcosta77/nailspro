// src/config/salao.ts
export const SALAO_NOME = "NailsPro Studio";

export const HORARIO_FUNCIONAMENTO = {
    dias: ["segunda", "terça", "quarta", "quinta", "sexta", "sábado"],
    abre: "09:00",
    fecha: "19:00",
};

export const SERVICOS = [
    { codigo: "manicure_simples", nome: "Manicure simples", duracaoMin: 40, preco: 30 },
    { codigo: "pedicure_simples", nome: "Pedicure simples", duracaoMin: 40, preco: 35 },
    { codigo: "combo_maos_pes", nome: "Combo mãos + pés", duracaoMin: 80, preco: 60 },
    { codigo: "alongamento_em_fibra", nome: "Aplicação do alongamento", duracaoMin: 120, preco: 150 },
    { codigo: "manutencao_alongamento", nome: "Manutenção alongamento", duracaoMin: 90, preco: 110 },
    { codigo: "banho_de_gel", nome: "Banho de gel", duracaoMin: 60, preco: 90 },
    { codigo: "blindagem", nome: "Blindagem", duracaoMin: 60, preco: 70 },
];

export const PROFISSIONAIS = [
    { nome: "Ana", especialidades: ["manicure", "gel", "nail art"] },
    { nome: "Bruna", especialidades: ["manicure", "pedicure"] },
    { nome: "Carla", especialidades: ["manicure", "gel"] },
    { nome: "Beatriz", especialidades: ["manicure", "gel"] },
];
