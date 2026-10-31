// Rotas da presença. A casca não muda: a tela vive em /presenca.
import { json, nowIso, parseCookies } from "../../src/lib/http.js";
import { getClientFromSession } from "../../src/lib/auth.js";
import { pageDocument } from "./page.js";
import { buildView, isChannel, normalizeAddress, saoPauloDay } from "./model.js";

export async function handlePresenca(request, env, url) {
  try {
    return await dispatch(request, env, url);
  } catch (err) {
    if (missingTable(err)) return json({ ok: false, error: "sem_tabela" }, 503);
    console.log(JSON.stringify({ level: "error", msg: String(err?.message || err), path: url.pathname }));
    return json({ ok: false, error: "erro interno" }, 500);
  }
}

async function dispatch(request, env, url) {
  const path = url.pathname;
  const method = request.method;

  if ((path === "/presenca" || path === "/presenca/") && method === "GET") {
    const client = await clientFrom(request, env);
    if (!client) return Response.redirect(new URL("/", url), 302);
    return html(pageDocument());
  }

  if (!path.startsWith("/api/presenca")) return json({ ok: false, error: "rota_nao_encontrada" }, 404);

  const client = await clientFrom(request, env);
  if (!client) return json({ ok: false, error: "nao_autenticado" }, 401);

  if (path === "/api/presenca" && method === "GET") return json(await viewFor(env, client));

  if (path === "/api/presenca/olhar" && method === "POST") return postLook(request, env, client);
  if (path === "/api/presenca/endereco" && method === "POST") return postAddress(request, env, client);

  return json({ ok: false, error: "rota_nao_encontrada" }, 404);
}

async function postLook(request, env, client) {
  const body = await readJson(request);
  const id = body.id;
  if (!isChannel(id) || typeof body.seen !== "boolean") return json({ ok: false, error: "campos" }, 422);
  const day = saoPauloDay();
  const current = await env.DB.prepare(
    "SELECT site, instagram, google, bio FROM presence_looks WHERE client_id = ? AND day = ?"
  )
    .bind(client.id, day)
    .first();
  const row = flags(current);
  row[id] = body.seen ? 1 : 0;
  await env.DB.prepare(
    `INSERT INTO presence_looks (client_id, day, site, instagram, google, bio, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(client_id, day) DO UPDATE SET
       site = excluded.site, instagram = excluded.instagram, google = excluded.google,
       bio = excluded.bio, updated_at = excluded.updated_at`
  )
    .bind(client.id, day, row.site, row.instagram, row.google, row.bio, nowIso())
    .run();
  return json(await viewFor(env, client));
}

async function postAddress(request, env, client) {
  const body = await readJson(request);
  const id = body.id;
  if (!isChannel(id) || typeof body.address !== "string") return json({ ok: false, error: "campos" }, 422);
  const norm = normalizeAddress(id, body.address);
  if (!norm.ok) return json({ ok: false, error: "endereco_invalido" }, 422);

  const current = await env.DB.prepare(
    "SELECT site, instagram, google, bio FROM presence_profile WHERE client_id = ?"
  )
    .bind(client.id)
    .first();
  const row = {
    site: current?.site || "",
    instagram: current?.instagram || "",
    google: current?.google || "",
    bio: current?.bio || "",
  };
  row[id] = norm.value;
  await env.DB.prepare(
    `INSERT INTO presence_profile (client_id, site, instagram, google, bio, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(client_id) DO UPDATE SET
       site = excluded.site, instagram = excluded.instagram, google = excluded.google,
       bio = excluded.bio, updated_at = excluded.updated_at`
  )
    .bind(client.id, row.site, row.instagram, row.google, row.bio, nowIso())
    .run();
  return json(await viewFor(env, client));
}

async function viewFor(env, client) {
  const day = saoPauloDay();
  const profile = await env.DB.prepare(
    "SELECT site, instagram, google, bio FROM presence_profile WHERE client_id = ?"
  )
    .bind(client.id)
    .first();
  const look = await env.DB.prepare(
    "SELECT site, instagram, google, bio FROM presence_looks WHERE client_id = ? AND day = ?"
  )
    .bind(client.id, day)
    .first();
  const countRow = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM presence_looks
      WHERE client_id = ? AND (site = 1 OR instagram = 1 OR google = 1 OR bio = 1)`
  )
    .bind(client.id)
    .first();
  return buildView({
    profile,
    look,
    days: Number(countRow?.n || 0),
    clinic: client.name || "",
  });
}

function flags(current) {
  return {
    site: current ? Number(current.site) || 0 : 0,
    instagram: current ? Number(current.instagram) || 0 : 0,
    google: current ? Number(current.google) || 0 : 0,
    bio: current ? Number(current.bio) || 0 : 0,
  };
}

async function clientFrom(request, env) {
  const cookies = parseCookies(request);
  return getClientFromSession(env, cookies.central_session);
}

function html(body) {
  return new Response(body, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function missingTable(err) {
  return /no such table/i.test(String(err?.message || err));
}
