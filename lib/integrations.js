// Integrações server-side (Pages Functions). Cada uma fica INATIVA até a env existir.
//   HubSpot: HUBSPOT_PRIVATE_TOKEN (+ opcional HUBSPOT_PIPELINE, HUBSPOT_STAGE_AGENDADO)
//   Brevo:   BREVO_API_KEY (+ BREVO_LIST_ID)
//   Meta:    META_PIXEL_ID + META_CAPI_TOKEN (+ opcional META_TEST_EVENT_CODE)
export const clean = (v, n = 200) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
export const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
export const digits = v => String(v ?? "").replace(/\D/g, "");
export async function sha256(v) {
  if (!v) return "";
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(v).trim().toLowerCase()));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
}
export const phoneE164 = w => { const d = digits(w); return d ? "+" + (d.startsWith("55") ? d : "55" + d) : ""; };

/* ---------------- HubSpot ---------------- */
// Pipeline "default". Estágios e propriedades conforme o portal do Marcos (ver README-INTERNO.md).
export const HS_STAGE = { lead: "1467547048", ligacao: "1467547049", agendado: "1467547050", proposta: "1467547051", negociacao: "1467547052", ganho: "1467547053", perdido: "1467547054" };
const HS_NICHO = { estetica: "estetica", odonto: "odontologia", harmo: "harmonizacao", nutri: "nutricao", fisio: "fisioterapia_saude", beleza: "beleza", outro: "outro_alto_padrao" };
const HS_STATUS = { lead: "nao_agendado", novo: "nao_agendado", agendado: "agendado", remarcado: "reagendado", realizado: "realizado", no_show: "nao_compareceu", cancelado: "cancelado" };
const HS_ORIGEM = o => /whats/.test(o) ? "whatsapp" : /indic/.test(o) ? "indicacao" : o === "quiz" ? "quiz" : "agenda";
// c: {email,nome,whatsapp,negocio,nicho_key,score,fit_nivel,dor,origem,status,utm_*,fbclid,start}; opts: {stage, dealId}
export async function hubspotSync(env, c, opts = {}) {
  if (!env.HUBSPOT_PRIVATE_TOKEN || (!c.email && !c.whatsapp)) return { hubspot: "inativo" };
  const H = { authorization: `Bearer ${env.HUBSPOT_PRIVATE_TOKEN}`, "content-type": "application/json" };
  const api = (path, method, body) => fetch("https://api.hubapi.com" + path, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
  const [first, ...rest] = clean(c.nome, 80).split(" ");
  const props = {
    email: c.email, firstname: first || "", lastname: rest.join(" "), phone: phoneE164(c.whatsapp), company: c.negocio || "", nome_negocio: c.negocio || "",
    nicho: HS_NICHO[c.nicho_key] || "", score_presenca: c.score != null && c.score !== "" ? String(+c.score) : "", faixa_fit: /^(quente|morno|frio)$/.test(c.fit_nivel || "") ? c.fit_nivel : "",
    principal_dor: c.dor || "", origem_lead: c.origem ? HS_ORIGEM(c.origem) : "", status_agendamento: HS_STATUS[c.status] || "",
    utm_source: c.utm_source || "", utm_medium: c.utm_medium || "", utm_campaign: c.utm_campaign || "", utm_content: c.utm_content || "", utm_term: c.utm_term || "", fbclid: c.fbclid || "",
    perfil_instagram: c.instagram || "", site_atual: c.site || "",
    faturamento_mensal: /^(ate_10k|10_30k|30_80k|80_150k|acima_150k)$/.test(c.faturamento || "") ? c.faturamento : ""
  };
  Object.keys(props).forEach(k => props[k] === "" && delete props[k]);
  try {
    let r, contactId;
    if (c.email) {
      r = await api("/crm/v3/objects/contacts/batch/upsert", "POST", { inputs: [{ idProperty: "email", id: c.email, properties: props }] });
      contactId = (await r.json().catch(() => ({})))?.results?.[0]?.id;
    } else { // sem e-mail (ex.: filtro do WhatsApp): deduplica pelo telefone
      const sr = await api("/crm/v3/objects/contacts/search", "POST", { filterGroups: [{ filters: [{ propertyName: "phone", operator: "EQ", value: props.phone }] }], limit: 1 });
      const found = (await sr.json().catch(() => ({})))?.results?.[0]?.id;
      r = found ? await api(`/crm/v3/objects/contacts/${found}`, "PATCH", { properties: props }) : await api("/crm/v3/objects/contacts", "POST", { properties: props });
      contactId = found || (await r.json().catch(() => ({})))?.id;
    }
    let dealId = opts.dealId || "";
    if (opts.stage && contactId) {
      if (!dealId) { // procura deal já associado ao contato
        const ra = await api(`/crm/v4/objects/contacts/${contactId}/associations/deals`, "GET");
        dealId = (await ra.json().catch(() => ({})))?.results?.[0]?.toObjectId || "";
      }
      const dp = { dealstage: HS_STAGE[opts.stage], pipeline: "default" };
      if (dealId) {
        // não regride estágio (ex.: lead do quiz não volta um deal já agendado)
        const cur = await (await api(`/crm/v3/objects/deals/${dealId}?properties=dealstage`, "GET")).json().catch(() => ({}));
        const order = Object.values(HS_STAGE), now = order.indexOf(cur?.properties?.dealstage);
        if (now < order.indexOf(dp.dealstage) || opts.force) await api(`/crm/v3/objects/deals/${dealId}`, "PATCH", { properties: dp });
      } else {
        dp.dealname = `Diagnóstico Prime — ${c.negocio || c.nome}`;
        const rd = await api("/crm/v3/objects/deals", "POST", { properties: dp, associations: [{ to: { id: contactId }, types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 }] }] });
        dealId = (await rd.json().catch(() => ({})))?.id || "";
      }
    }
    return { hubspot: r.ok ? "ok" : "erro " + r.status, contactId, dealId: String(dealId || "") };
  } catch (e) { return { hubspot: "erro" }; }
}

/* ---------------- Brevo ---------------- */
// Atributos no Brevo: NOME, WHATSAPP, NEGOCIO, NICHO, SCORE, DOR, FAIXA, STATUS, ORIGEM, UTM_SOURCE, UTM_MEDIUM, UTM_CAMPAIGN, DATA_DIAGNOSTICO
export async function brevoSync(env, c) {
  if (!env.BREVO_API_KEY || !c.email) return { brevo: "inativo" };
  const attrs = {
    NOME: c.nome || "", WHATSAPP: phoneE164(c.whatsapp), NEGOCIO: c.negocio || "",
    NICHO: c.nicho || "", SCORE: c.score != null && c.score !== "" ? Number(c.score) : undefined, DOR: c.dor || "", FAIXA: c.faixa || "",
    STATUS: c.status || "", ORIGEM: c.origem || "", UTM_SOURCE: c.utm_source || "", UTM_MEDIUM: c.utm_medium || "", UTM_CAMPAIGN: c.utm_campaign || "",
    DATA_DIAGNOSTICO: (c.start || "").slice(0, 10)
  };
  Object.keys(attrs).forEach(k => (attrs[k] === "" || attrs[k] === undefined || Number.isNaN(attrs[k])) && delete attrs[k]);
  const body = { email: c.email, attributes: attrs, updateEnabled: true };
  if (env.BREVO_LIST_ID) body.listIds = [Number(env.BREVO_LIST_ID)];
  try {
    const r = await fetch("https://api.brevo.com/v3/contacts", { method: "POST", headers: { "api-key": env.BREVO_API_KEY, "content-type": "application/json", accept: "application/json" }, body: JSON.stringify(body) });
    return { brevo: r.ok ? "ok" : "erro " + r.status };
  } catch (e) { return { brevo: "erro" }; }
}

/* ---------------- Meta Conversions API ---------------- */
export async function capiSend(env, request, ev) {
  if (!env.META_CAPI_TOKEN || !env.META_PIXEL_ID) return { capi: "inativo" };
  const u = ev.user || {};
  const user_data = {
    em: u.em ? [/^[a-f0-9]{64}$/.test(u.em) ? u.em : await sha256(u.em)] : undefined,
    ph: u.ph ? [/^[a-f0-9]{64}$/.test(u.ph) ? u.ph : await sha256(digits(u.ph))] : undefined,
    fbc: ev.fbc || undefined, fbp: ev.fbp || undefined,
    client_ip_address: request.headers.get("cf-connecting-ip") || undefined,
    client_user_agent: request.headers.get("user-agent") || undefined
  };
  const data = [{ event_name: clean(ev.event_name, 50), event_time: Math.floor(Date.now() / 1000), event_id: clean(ev.event_id, 80) || undefined, action_source: ev.action_source || "website", event_source_url: clean(ev.url, 500) || undefined, user_data, custom_data: ev.params || {} }];
  const body = { data }; if (env.META_TEST_EVENT_CODE) body.test_event_code = env.META_TEST_EVENT_CODE;
  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/${env.META_PIXEL_ID}/events?access_token=${encodeURIComponent(env.META_CAPI_TOKEN)}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    return { capi: r.ok ? "ok" : "erro " + r.status };
  } catch (e) { return { capi: "erro" }; }
}

/* ---------------- KV: índice por e-mail/WhatsApp ---------------- */
export const TTL = 60 * 60 * 24 * 365;
export async function indexLead(env, id, email, whatsapp) {
  if (!env.LEADS) return;
  const j = [];
  if (email) j.push(env.LEADS.put("idx:em:" + email.toLowerCase(), id, { expirationTtl: TTL }));
  const w = digits(whatsapp).replace(/^55/, ""); if (w) j.push(env.LEADS.put("idx:wa:" + w, id, { expirationTtl: TTL }));
  await Promise.allSettled(j);
}
export async function findLead(env, { id, email, whatsapp }) {
  if (!env.LEADS) return null;
  let key = id && /^lead:/.test(id) ? id : null;
  if (!key && email) key = await env.LEADS.get("idx:em:" + email.toLowerCase());
  if (!key && whatsapp) key = await env.LEADS.get("idx:wa:" + digits(whatsapp).replace(/^55/, ""));
  if (!key) return null;
  const raw = await env.LEADS.get(key); return raw ? { key, lead: JSON.parse(raw) } : null;
}
