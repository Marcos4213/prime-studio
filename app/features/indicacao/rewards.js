// Indicação dos dois lados (fase 6).
// Cliente: tempo de central, nunca desconto no serviço.
// Profissional (contador, parceiro, fornecedor): comissão em dinheiro ou permuta.
// Meses, percentual, valor e serviço extra ficam nulos até o Marcos fechar. Não inventar.

import { clean } from "../../src/lib/http.js";

export const A_DEFINIR = "A definir";

export const REWARDS = {
  cliente: {
    indicador: { forma: "tempo_de_central", meses: null, rotulo: A_DEFINIR },
    indicado: { forma: "tempo_de_central", meses: null, rotulo: A_DEFINIR },
    desconto: false,
    servico_extra: null,
  },
  profissional: {
    indicador: {
      forma: "comissao_dinheiro_ou_permuta",
      percentual: null,
      valor: null,
      rotulo: A_DEFINIR,
    },
    indicado: { forma: "tempo_de_central", meses: null, rotulo: A_DEFINIR },
    desconto: false,
  },
};

export const COPY = {
  cliente: {
    indicadorTitulo: "Você",
    indicadorForma: "Tempo de central",
    indicadoTitulo: "A clínica indicada",
    indicadoForma: "Tempo de central",
    nota: "Sem desconto no serviço. A quantidade de tempo a Prime confirma.",
    hint: "Você e a clínica indicada ganham tempo de central.",
    passos: [
      "Diga o nome e o WhatsApp da clínica",
      "O nosso time entra em contato",
      "Os dois ganham tempo de central",
    ],
  },
  profissional: {
    indicadorTitulo: "Você",
    indicadorForma: "Comissão em dinheiro ou permuta",
    indicadoTitulo: "A clínica indicada",
    indicadoForma: "Tempo de central",
    nota: "O valor da comissão a Prime confirma. A clínica indicada ganha tempo de central, sem desconto.",
    hint: "Contador, parceiro ou fornecedor.",
    passos: [
      "Diga o nome e o WhatsApp da clínica",
      "O nosso time entra em contato",
      "Você recebe comissão; a clínica ganha tempo de central",
    ],
  },
};

export const STATUS_LABEL = {
  novo: "Recebida",
  em_contato: "Em conversa",
  fechado: "Fechada",
  sem_retorno: "Sem retorno",
};

export function rewardView(type) {
  const key = type === "profissional" ? "profissional" : "cliente";
  return { tipo: key, recompensa: REWARDS[key], texto: COPY[key] };
}

export function validateIndication(body) {
  const name = clean(body?.referred_name, 120);
  const contact = clean(body?.referred_contact, 80);
  const type = body?.referrer_type === "profissional" || body?.referrer_type === "cliente" ? body.referrer_type : "";
  if (name.length < 2 || contact.length < 8 || !type) return { ok: false, error: "campos" };
  return { ok: true, name, contact, type };
}

export function shareText(referrerName) {
  const who = clean(referrerName, 120);
  const from = who ? `Aqui é ${who}.` : "Aqui é uma clínica atendida pela Prime Studio.";
  return `Oi. ${from} A Prime Studio cuida da nossa presença digital e eu indiquei a sua clínica. Se fizer sentido, o nosso time entra em contato.`;
}

export function whatsappHref(contact, text) {
  let n = String(contact || "").replace(/\D/g, "").replace(/^0+/, "");
  if (n.length === 10 || n.length === 11) n = `55${n}`;
  if (n.length < 12 || n.length > 13) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}

export function referralInsert(row) {
  return {
    sql: "INSERT INTO referrals (id, referrer_client_id, referred_name, referred_contact, referrer_type, status, created_at) VALUES (?, ?, ?, ?, ?, 'novo', ?)",
    binds: [row.id, row.clientId, row.name, row.contact, row.type, row.created],
  };
}
