import { json, parseCookies, uid, nowIso } from "../../src/lib/http.js";
import { getClientFromSession } from "../../src/lib/auth.js";
import {
  REWARDS,
  COPY,
  validateIndication,
  shareText,
  whatsappHref,
  referralInsert,
} from "./rewards.js";
import { pageHtml, gateHtml, BROWSER_JS } from "./page.js";
import { SALA_WEBP_BASE64 } from "./photo.js";

let salaBytes;
function sala() {
  if (!salaBytes) {
    const bin = atob(SALA_WEBP_BASE64);
    salaBytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) salaBytes[i] = bin.charCodeAt(i);
  }
  return salaBytes;
}

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

async function clientFrom(request, env) {
  const token = parseCookies(request).central_session;
  if (!token || !env?.DB) return null;
  return getClientFromSession(env, token);
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export async function handleIndicacao(request, env, url) {
  const path = url.pathname;

  if (path === "/indicacao/media/sala.webp" && request.method === "GET") {
    return new Response(sala(), {
      headers: { "content-type": "image/webp", "cache-control": "public, max-age=86400" },
    });
  }

  if (path === "/indicacao/app.js" && request.method === "GET") {
    return new Response(BROWSER_JS, {
      headers: { "content-type": "text/javascript; charset=utf-8", "cache-control": "no-store" },
    });
  }

  if (path === "/indicacao" || path === "/indicacao/") {
    const client = await clientFrom(request, env);
    if (!client) return html(gateHtml());
    return html(pageHtml(client.name || ""));
  }

  if (path === "/api/indicacao" && request.method === "GET") return getIndicacao(request, env);
  if (path === "/api/indicacao" && request.method === "POST") return postIndicacao(request, env);
  return json({ ok: false, error: "rota_nao_encontrada" }, 404);
}

async function getIndicacao(request, env) {
  const client = await clientFrom(request, env);
  if (!client) return json({ ok: false, error: "nao_autenticado" }, 401);
  const res = await env.DB.prepare(
    "SELECT id, referred_name, referred_contact, referrer_type, status, created_at FROM referrals WHERE referrer_client_id = ? ORDER BY created_at DESC LIMIT 50"
  )
    .bind(client.id)
    .all();
  return json({
    ok: true,
    clinic: client.name || "",
    rewards: REWARDS,
    copy: COPY,
    items: res.results || [],
  });
}

async function postIndicacao(request, env) {
  const client = await clientFrom(request, env);
  if (!client) return json({ ok: false, error: "nao_autenticado" }, 401);
  const parsed = validateIndication(await readJson(request));
  if (!parsed.ok) return json({ ok: false, error: "campos" }, 422);

  const row = {
    id: uid("ind"),
    clientId: client.id,
    name: parsed.name,
    contact: parsed.contact,
    type: parsed.type,
    created: nowIso(),
  };
  const insert = referralInsert(row);
  await env.DB.prepare(insert.sql).bind(...insert.binds).run();
  const share = shareText(client.name);
  return json({
    ok: true,
    item: {
      id: row.id,
      referred_name: row.name,
      referred_contact: row.contact,
      referrer_type: row.type,
      status: "novo",
      created_at: row.created,
    },
    share,
    whatsapp: whatsappHref(row.contact, share),
  });
}
