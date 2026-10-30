// Indicação dos dois lados (fase 6).
// Fechado pelo Marcos: quem indica (cliente) ganha 60 dias; a clínica indicada ganha 15%.
// Serviço extra, order bump/upsell e indicador profissional seguem em discussão.
// Sem comissão em dinheiro. Não inventar outro número.

import { clean } from "../../src/lib/http.js";

export const REWARDS = {
  cliente: {
    indicador: { forma: "tempo_de_central", dias: 60, rotulo: "60 dias" },
    indicado: { forma: "desconto", percentual: 15, rotulo: "15%" },
    servico_extra: null,
  },
  profissional: {
    indicador: {
      forma: "em_discussao",
      percentual: null,
      valor: null,
      comissao_dinheiro: false,
      rotulo: "Em discussão",
    },
    indicado: { forma: "desconto", percentual: 15, rotulo: "15%" },
  },
};

export const COPY = {
  cliente: {
    indicadorTitulo: "Você",
    indicadorForma: "Central",
    indicadorValor: "60 dias",
    indicadoTitulo: "A clínica indicada",
    indicadoForma: "Desconto",
    indicadoValor: "15%",
    nota: "Você ganha 60 dias de Central. A clínica indicada ganha 15% de desconto.",
    hint: "Quem indica ganha tempo. Quem chega ganha desconto.",
    passos: [
      "Diga o nome e o WhatsApp da clínica",
      "O nosso time entra em contato",
      "Você ganha 60 dias e a clínica, 15% de desconto",
    ],
  },
  profissional: {
    indicadorTitulo: "Você",
    indicadorForma: "Recompensa",
    indicadorValor: "Em discussão",
    indicadoTitulo: "A clínica indicada",
    indicadoForma: "Desconto",
    indicadoValor: "15%",
    nota: "A recompensa de quem indica como profissional segue em discussão. Sem comissão em dinheiro. A clínica indicada tem 15% de desconto.",
    hint: "Contador, parceiro ou fornecedor. Sem comissão em dinheiro.",
    passos: [
      "Diga o nome e o WhatsApp da clínica",
      "O nosso time entra em contato",
      "A clínica indicada tem 15% de desconto",
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
