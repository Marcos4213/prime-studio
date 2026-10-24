// POST /api/calcom — webhook do Cal.com (BOOKING_CREATED / RESCHEDULED / CANCELLED / NO_SHOW / MEETING_ENDED)
// Valida X-Cal-Signature-256 (HMAC-SHA256 do corpo com CALCOM_WEBHOOK_SECRET), atualiza o lead no KV
// e sincroniza Brevo (BREVO_API_KEY) / HubSpot (HUBSPOT_PRIVATE_TOKEN) / Meta CAPI (Schedule) — cada um inativo sem a env.
import { clean, json, TTL, digits, hubspotSync, brevoSync, capiSend, findLead, indexLead } from "../../lib/integrations.js";

const STATUS = { BOOKING_CREATED: "agendado", BOOKING_RESCHEDULED: "remarcado", BOOKING_CANCELLED: "cancelado", BOOKING_NO_SHOW_UPDATED: "no_show", MEETING_ENDED: "realizado" };

async function verify(secret, body, sig) {
  if (!secret) return true; // sem segredo configurado, aceita (não recomendado)
  if (!sig) return false;
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = [...new Uint8Array(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(body)))].map(x => x.toString(16).padStart(2, "0")).join("");
  if (mac.length !== sig.length) return false;
  let d = 0; for (let i = 0; i < mac.length; i++) d |= mac.charCodeAt(i) ^ sig.charCodeAt(i);
  return d === 0;
}
const val = v => (v && typeof v === "object" && "value" in v ? v.value : v);

export async function onRequestPost({ request, env }) {
  const raw = await request.text();
  if (!(await verify(env.CALCOM_WEBHOOK_SECRET, raw, request.headers.get("x-cal-signature-256") || ""))) return json({ ok: false, error: "assinatura" }, 401);
  let b; try { b = JSON.parse(raw); } catch { return json({ ok: false }, 400); }
  const ev = b.triggerEvent, p = b.payload || {};
  if (ev === "PING" || !STATUS[ev]) return json({ ok: true, ignorado: ev || "?" });
  let status = STATUS[ev];
  if (ev === "BOOKING_NO_SHOW_UPDATED" && p.noShow === false) status = "realizado";
  const r = p.responses || {}, m = p.metadata || {}, at = (p.attendees || [])[0] || {};
  const c = {
    nome: clean(val(r.name) || at.name, 80), email: clean(val(r.email) || at.email, 120).toLowerCase(), whatsapp: digits(val(r.whatsapp) || val(r.attendeePhoneNumber)),
    negocio: clean(val(r.negocio), 120), nicho: clean(m.nicho, 80), nicho_key: clean(m.nicho_key, 12), fit_nivel: clean(m.nivel, 10), fbclid: clean(m.fbclid, 200), score: m.score, dor: clean(m.dor, 80), faixa: clean(m.faixa, 10), origem: clean(m.origem || "cal", 40),
    utm_source: clean(m.utm_source, 120), utm_medium: clean(m.utm_medium, 120), utm_campaign: clean(m.utm_campaign, 120), utm_content: clean(m.utm_content, 120), utm_term: clean(m.utm_term, 120),
    status, start: p.startTime || "", uid: p.uid || ""
  };
  const ag = { status, uid: c.uid, inicio: c.start, fim: p.endTime || "", meet: p.metadata?.videoCallUrl || p.videoCallData?.url || "", atualizado: new Date().toISOString(), evento: ev };

  // KV: atualiza o lead do quiz (ou cria um lead "cal" se veio direto pelo link)
  let kv = "sem_kv", hsDeal = "";
  if (env.LEADS) {
    const f = await findLead(env, { id: m.lead_id, email: c.email || m.lead_email, whatsapp: c.whatsapp });
    if (f) {
      hsDeal = f.lead.hubspot?.dealId || "";
      if (!c.nicho_key && f.lead.nicho_key) c.nicho_key = f.lead.nicho_key; if (!c.fit_nivel && f.lead.nivel) c.fit_nivel = f.lead.nivel;
      const lead = { ...f.lead, status, agenda: ag, historico: [...(f.lead.historico || []), { ev, em: ag.atualizado, inicio: c.start }].slice(-20) };
      await env.LEADS.put(f.key, JSON.stringify(lead), { expirationTtl: TTL, metadata: { nome: lead.nome, nivel: lead.nivel, status } });
      kv = "atualizado";
    } else {
      const id = `lead:${Date.now()}:${crypto.randomUUID().slice(0, 8)}`;
      const lead = { nome: c.nome, email: c.email, whatsapp: c.whatsapp, clinica: c.negocio, subnicho: c.nicho, dor: c.dor, nota: +c.score || 0, origem: c.origem, atribuicao: { utm_source: c.utm_source, utm_medium: c.utm_medium, utm_campaign: c.utm_campaign, fbc: m.fbc || "", fbp: m.fbp || "" }, status, agenda: ag, data: ag.atualizado };
      await env.LEADS.put(id, JSON.stringify(lead), { expirationTtl: TTL, metadata: { nome: lead.nome, status } });
      await indexLead(env, id, c.email, c.whatsapp); kv = "criado";
    }
  }

  const jobs = [hubspotSync(env, c, { stage: ev === "BOOKING_CREATED" || ev === "BOOKING_RESCHEDULED" ? "agendado" : null, dealId: hsDeal }), brevoSync(env, c)];
  if (ev === "BOOKING_CREATED" && c.uid)
    jobs.push(capiSend(env, request, { event_name: "Schedule", event_id: "sched_" + c.uid, action_source: "website", url: "https://prime.devbrasil.online/", fbc: m.fbc, fbp: m.fbp, user: { em: c.email, ph: c.whatsapp ? (c.whatsapp.startsWith("55") ? c.whatsapp : "55" + c.whatsapp) : "" }, params: { content_name: "diagnostico", nicho: c.nicho, score: c.score, dor: c.dor, faixa: c.faixa } }));
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    const icon = { agendado: "📅", remarcado: "🔁", cancelado: "❌", no_show: "🚫", realizado: "✅" }[status];
    jobs.push(fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: `${icon} Diagnóstico ${status}: ${c.nome} · ${c.negocio}\n${c.start}\nWhatsApp: https://wa.me/${c.whatsapp}` }) }));
  }
  const res = await Promise.allSettled(jobs);
  return json({ ok: true, status, kv, integracoes: Object.assign({}, ...res.slice(0, 3).map(x => x.value || {})) });
}
export const onRequestGet = () => json({ ok: true, endpoint: "calcom-webhook" });
