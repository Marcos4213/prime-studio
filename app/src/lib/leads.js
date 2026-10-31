// Caderno comercial. Nome, contato, origem, serviço, valor e status.
// Sem saúde, procedimento, queixa ou paciente. Sem banco, sem número inventado.
import { json, uid, nowIso, clean } from "./http.js";
import { draftCommercialMessage } from "./ai.js";
import { loadGeneratorProfile } from "./clinic-profile.js";
import { stripPatientCounts } from "./provas.js";

export const LEAD_STATUS = new Set(["aberto", "fechado", "pago"]);
export const LEAD_SUBJECTS = new Set(["recuperacao", "follow-up", "remarcacao", "engajamento"]);

const STATUS_LABEL = {
  aberto: "Não fechou",
  fechado: "Fechou",
  pago: "Pago",
};

const SUBJECT_LABEL = {
  recuperacao: "Recuperação",
  "follow-up": "Follow-up",
  remarcacao: "Remarcação",
  engajamento: "Engajamento",
};

export function monthKey(isoOrDate) {
  const date = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value || "";
  const month = parts.find((part) => part.type === "month")?.value || "";
  return year && month ? `${year}-${month}` : "";
}

export function parseValor(raw) {
  if (raw == null) return { ok: true, centavos: null };
  let text = String(raw).trim().replace(/\s/g, "").replace(/^R\$/i, "");
  if (!text) return { ok: true, centavos: null };
  if (text.includes(",")) {
    if (!/^(?:\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:,\d{1,2})?)$/.test(text)) return { ok: false };
    text = text.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(text)) {
    text = text.replace(/\./g, "");
  } else if (!/^\d+(\.\d{1,2})?$/.test(text)) {
    return { ok: false };
  }
  const value = Number(text);
  if (!Number.isFinite(value) || value < 0 || value > 99999999) return { ok: false };
  return { ok: true, centavos: Math.round(value * 100) };
}

export function monthSummary(rows, now = new Date()) {
  const key = monthKey(now);
  const monthRows = (rows || []).filter((row) => monthKey(row.created_at) === key);
  if (!monthRows.length) return { vazio: true, leads: 0, fechados: 0, valor_centavos: null };
  const fechados = monthRows.filter((row) => row.status === "fechado" || row.status === "pago");
  const valores = fechados
    .map((row) => (row.valor_centavos == null ? null : Number(row.valor_centavos)))
    .filter((value) => Number.isInteger(value) && value >= 0);
  return {
    vazio: false,
    leads: monthRows.length,
    fechados: fechados.length,
    valor_centavos: valores.length ? valores.reduce((sum, value) => sum + value, 0) : null,
  };
}

export function whatsappHandoffUrl(text) {
  return `https://wa.me/?text=${encodeURIComponent(String(text || ""))}`;
}

export function publicLead(row) {
  if (!row) return null;
  const status = LEAD_STATUS.has(row.status) ? row.status : "aberto";
  return {
    id: row.id,
    name: row.name || "",
    contact: row.contact || "",
    origin: row.origin || "",
    status,
    status_label: STATUS_LABEL[status],
    servico: row.servico || "",
    valor_centavos: row.valor_centavos == null ? null : Number(row.valor_centavos),
    whatsapp: row.whatsapp || "",
    historico: row.historico || "",
    contatos: row.contatos || "",
    ultimo_contato: row.ultimo_contato || null,
    created_at: row.created_at,
  };
}

function readFields(body, { requireName = true } = {}) {
  const name = clean(body?.name, 80);
  const contact = clean(body?.contact, 80);
  const origin = clean(body?.origin, 80);
  const servico = clean(body?.servico, 120);
  const whatsapp = clean(body?.whatsapp, 40);
  const historico = stripPatientCounts(clean(body?.historico, 800));
  const status = LEAD_STATUS.has(body?.status) ? body.status : "aberto";
  const valor = parseValor(body?.valor);
  if (requireName && !name) return { ok: false, error: "campos" };
  if (!valor.ok) return { ok: false, error: "valor" };
  return {
    ok: true,
    fields: { name, contact, origin, servico, whatsapp, historico, status, valor_centavos: valor.centavos },
  };
}

function missingTable(err) {
  return /no such table/i.test(String(err?.message || err));
}

async function readLead(env, clientId, id) {
  return env.DB.prepare(
    `SELECT id, name, contact, origin, status, servico, valor_centavos, whatsapp, historico, contatos, ultimo_contato, created_at
       FROM commercial_leads WHERE id = ? AND client_id = ?`
  )
    .bind(id, clientId)
    .first();
}

export async function handleLeads(request, env, url, client) {
  try {
    return await dispatch(request, env, url, client);
  } catch (err) {
    if (missingTable(err)) return json({ ok: false, error: "sem_tabela" }, 503);
    throw err;
  }
}

async function dispatch(request, env, url, client) {
  const path = url.pathname;
  const method = request.method;

  if (path === "/api/leads" && method === "GET") return listLeads(env, client);
  if (path === "/api/leads" && method === "POST") return createLead(request, env, client);

  const draft = path.match(/^\/api\/leads\/([A-Za-z0-9_-]+)\/mensagem$/);
  if (draft && method === "POST") return draftMessage(request, env, client, draft[1]);

  const hand = path.match(/^\/api\/leads\/([A-Za-z0-9_-]+)\/whatsapp$/);
  if (hand && method === "POST") return handoff(request, env, client, hand[1]);

  const one = path.match(/^\/api\/leads\/([A-Za-z0-9_-]+)$/);
  if (one && method === "PATCH") return patchLead(request, env, client, one[1]);

  return json({ ok: false, error: "rota_nao_encontrada" }, 404);
}

async function listLeads(env, client) {
  const res = await env.DB.prepare(
    `SELECT id, name, contact, origin, status, servico, valor_centavos, whatsapp, historico, contatos, ultimo_contato, created_at
       FROM commercial_leads WHERE client_id = ? ORDER BY created_at DESC LIMIT 200`
  )
    .bind(client.id)
    .all();
  const items = (res.results || []).map(publicLead);
  return json({
    ok: true,
    items,
    resumo: monthSummary(items),
    subjects: [...LEAD_SUBJECTS].map((id) => ({ id, label: SUBJECT_LABEL[id] })),
  });
}

async function createLead(request, env, client) {
  const parsed = readFields(await readJson(request));
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 422);
  const id = uid("ld");
  const created = nowIso();
  const f = parsed.fields;
  await env.DB.prepare(
    `INSERT INTO commercial_leads
      (id, client_id, name, contact, origin, status, servico, valor_centavos, whatsapp, historico, contatos, ultimo_contato, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', NULL, ?)`
  )
    .bind(id, client.id, f.name, f.contact, f.origin, f.status, f.servico, f.valor_centavos, f.whatsapp, f.historico, created)
    .run();
  const row = await readLead(env, client.id, id);
  return json({ ok: true, item: publicLead(row) });
}

async function patchLead(request, env, client, id) {
  const current = await readLead(env, client.id, id);
  if (!current) return json({ ok: false, error: "nao_encontrado" }, 404);
  const parsed = readFields(await readJson(request));
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 422);
  const f = parsed.fields;
  await env.DB.prepare(
    `UPDATE commercial_leads
        SET name = ?, contact = ?, origin = ?, status = ?, servico = ?, valor_centavos = ?, whatsapp = ?, historico = ?
      WHERE id = ? AND client_id = ?`
  )
    .bind(f.name, f.contact, f.origin, f.status, f.servico, f.valor_centavos, f.whatsapp, f.historico, id, client.id)
    .run();
  return json({ ok: true, item: publicLead(await readLead(env, client.id, id)) });
}

async function draftMessage(request, env, client, id) {
  const row = await readLead(env, client.id, id);
  if (!row) return json({ ok: false, error: "nao_encontrado" }, 404);
  const body = await readJson(request);
  const subject = clean(body.assunto, 20);
  if (!LEAD_SUBJECTS.has(subject)) return json({ ok: false, error: "assunto" }, 422);
  const loaded = await loadGeneratorProfile(env, client);
  const profile = { ...loaded.profile, provas: "" };
  const result = await draftCommercialMessage(env, {
    name: row.name,
    servico: row.servico,
    historico: [row.historico, row.contatos].filter(Boolean).join("\n"),
    subject,
    profile,
  });
  if (result?.unavailable || !result?.text) {
    return json({ ok: false, error: "ia_indisponivel", motivo: result?.motivo || "indisponivel" });
  }
  return json({
    ok: true,
    text: result.text,
    source: result.source,
    model: result.model || "",
    ultimo_contato: row.ultimo_contato || null,
  });
}

async function handoff(request, env, client, id) {
  const row = await readLead(env, client.id, id);
  if (!row) return json({ ok: false, error: "nao_encontrado" }, 404);
  const body = await readJson(request);
  const text = stripPatientCounts(clean(body.text, 700));
  const subject = LEAD_SUBJECTS.has(body.assunto) ? body.assunto : "";
  if (!text) return json({ ok: false, error: "mensagem" }, 422);
  const when = nowIso();
  const note = subject ? `${when} ${SUBJECT_LABEL[subject]}` : when;
  const contatos = [row.contatos, note].filter(Boolean).join("\n").slice(0, 4000);
  await env.DB.prepare(
    `UPDATE commercial_leads SET ultimo_contato = ?, contatos = ? WHERE id = ? AND client_id = ?`
  )
    .bind(when, contatos, id, client.id)
    .run();
  const saved = await readLead(env, client.id, id);
  return json({
    ok: true,
    url: whatsappHandoffUrl(text),
    ultimo_contato: saved.ultimo_contato,
    item: publicLead(saved),
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
