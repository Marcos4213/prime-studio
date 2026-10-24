// Cloudflare Pages Function: POST /api/lead
// Salva o lead no KV (binding LEADS) e, se configurado, notifica:
//  - TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID (gratuito)  e/ou  NOTIFY_WEBHOOK (POST JSON)
// GET /api/lead?key=ADMIN_KEY lista os últimos leads (só se a variável ADMIN_KEY existir).
// + HubSpot (HUBSPOT_PRIVATE_TOKEN) e Brevo (BREVO_API_KEY) — inativos sem as envs.
import { clean, json, TTL, hubspotSync, brevoSync, indexLead } from "../../lib/integrations.js";

export async function onRequestPost({ request, env }) {
  let b; try { b = await request.json(); } catch { return json({ ok: false, error: "json" }, 400); }
  const lead = {
    nome: clean(b.nome, 80), whatsapp: clean(b.whatsapp, 20).replace(/\D/g, ""), clinica: clean(b.clinica, 120),
    subnicho: clean(b.subnicho, 120), segmento_outro: clean(b.segmento_outro, 80), instagram: clean(b.instagram, 60), email: clean(b.email, 120), dor: clean(b.dor, 80), nota: +b.nota || 0, fit: +b.fit || 0,
    nivel: clean(b.nivel, 10), ligacao: !!b.ligacao, respostas: b.respostas && typeof b.respostas === "object" ? Object.fromEntries(Object.entries(b.respostas).slice(0, 10).map(([k, v]) => [clean(k, 30), clean(v, 120)])) : {},
    faixa: clean(b.faixa, 10), nicho_key: clean(b.nicho_key, 12), origem: clean(b.origem, 40), status: "novo", faturamento: clean(b.faturamento, 20), urgencia: clean(b.urgencia, 40),
    atribuicao: b.atribuicao && typeof b.atribuicao === "object" ? Object.fromEntries(Object.entries(b.atribuicao).slice(0, 15).map(([k, v]) => [clean(k, 20), clean(v, 200)])) : {},
    pagina: clean(b.pagina, 200), ua: clean(request.headers.get("user-agent"), 160), data: new Date().toISOString()
  };
  if (!lead.nome || lead.whatsapp.length < 10 || !lead.clinica) return json({ ok: false, error: "campos" }, 422);
  const id = /^[\w:.-]{10,80}$/.test(b.id || "") ? b.id : `lead:${Date.now()}:${crypto.randomUUID().slice(0, 8)}`;
  if (env.LEADS) await env.LEADS.put(id, JSON.stringify(lead), { expirationTtl: TTL, metadata: { nome: lead.nome, nivel: lead.nivel, status: lead.status } });
  await indexLead(env, id, lead.email, lead.whatsapp);

  const txt = `${lead.ligacao ? "📞 PEDIU LIGAÇÃO" : "🆕 Novo Raio-X"} (${lead.nivel})\n${lead.nome} · ${lead.clinica}\n${lead.subnicho}\nNota ${lead.nota}/100 · fit ${lead.fit}\nWhatsApp: https://wa.me/${lead.whatsapp}${lead.instagram ? "\nIG: " + lead.instagram : ""}`;
  const jobs = [];
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID)
    jobs.push(fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: txt, disable_web_page_preview: true }) }));
  if (env.NOTIFY_WEBHOOK)
    jobs.push(fetch(env.NOTIFY_WEBHOOK, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, texto: txt, ...lead }) }));
  const a = lead.atribuicao, c = { nome: lead.nome, email: lead.email, whatsapp: lead.whatsapp, negocio: lead.clinica, nicho: lead.subnicho, nicho_key: lead.nicho_key, fit_nivel: lead.nivel, fbclid: a.fbclid, score: lead.nota, dor: lead.dor, faixa: lead.faixa, origem: lead.origem || "quiz", status: "lead", faturamento: lead.faturamento, utm_source: a.utm_source, utm_medium: a.utm_medium, utm_campaign: a.utm_campaign, utm_content: a.utm_content, utm_term: a.utm_term };
  const res = await Promise.allSettled([hubspotSync(env, c, { stage: "lead" }), brevoSync(env, c), ...jobs]);
  if (env.LEADS && res[0].value?.dealId) { lead.hubspot = { contactId: res[0].value.contactId, dealId: res[0].value.dealId }; await env.LEADS.put(id, JSON.stringify(lead), { expirationTtl: TTL, metadata: { nome: lead.nome, nivel: lead.nivel, status: lead.status } }); }
  return json({ ok: true, id, armazenado: !!env.LEADS, integracoes: Object.assign({}, res[0].value, res[1].value) });
}

export async function onRequestGet({ request, env }) {
  const key = new URL(request.url).searchParams.get("key");
  if (!env.ADMIN_KEY || key !== env.ADMIN_KEY || !env.LEADS) return json({ ok: false }, 404);
  const list = await env.LEADS.list({ prefix: "lead:", limit: 100 });
  const items = await Promise.all(list.keys.reverse().map(async k => ({ id: k.name, ...JSON.parse(await env.LEADS.get(k.name) || "{}") })));
  return json({ ok: true, items });
}
