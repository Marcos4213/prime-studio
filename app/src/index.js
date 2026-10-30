// Central do Cliente — Worker: serve o app (assets) e a API.
// App separado do site de marketing. Deploy só com o OK do Marcos.
import { json, uid, nowIso, clean, parseCookies, sessionCookie, clearCookie } from "./lib/http.js";
import {
  createSession,
  getClientFromSession,
  destroySession,
  verifyPassword,
  createClient,
} from "./lib/auth.js";
import { generatePiece, FORMATS } from "./lib/ai.js";
import { findFeaturesDir, loadFeatures, toMenu } from "../features/load.js";
import bakedMenu from "./feature-menu.json";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      try {
        return await handleApi(request, env, url, ctx);
      } catch (err) {
        console.log(JSON.stringify({ level: "error", msg: String(err?.message || err), path: url.pathname }));
        return json({ ok: false, error: "erro interno" }, 500);
      }
    }
    return env.ASSETS.fetch(request);
  },
};

async function handleApi(request, env, url, ctx) {
  const path = url.pathname;
  const method = request.method;
  const secure = url.protocol === "https:";

  // --- Auth pública ---
  if (path === "/api/login" && method === "POST") return login(request, env, secure);
  if (path === "/api/logout" && method === "POST") return logout(request, env, secure);

  // --- Admin (bootstrap de clientes), protegido por ADMIN_KEY no ambiente ---
  if (path === "/api/admin/clients" && method === "POST") return adminCreateClient(request, env);

  // --- A partir daqui exige sessão ---
  const cookies = parseCookies(request);
  const client = await getClientFromSession(env, cookies.central_session);
  if (!client) return json({ ok: false, error: "nao_autenticado" }, 401);

  if (path === "/api/me" && method === "GET") {
    const onboarding = await readOnboarding(env, client.id);
    return json({
      ok: true,
      client: publicClient(client),
      ai_configurada: !!env.AI_API_KEY,
      onboarding,
    });
  }

  if (path === "/api/onboarding" && method === "POST") return postOnboarding(request, env, client);
  if (path === "/api/features" && method === "GET") {
    return json({ ok: true, menu: await featureMenu() });
  }

  if (path === "/api/profile" && method === "GET") return getProfile(env, client);
  if (path === "/api/profile" && method === "PUT") return putProfile(request, env, client);

  if (path === "/api/generate" && method === "POST") return generate(request, env, client);

  if (path === "/api/history" && method === "GET") return listHistory(env, client);

  const pieceMatch = path.match(/^\/api\/pieces\/([\w-]+)$/);
  if (pieceMatch && method === "GET") return getPiece(env, client, pieceMatch[1]);

  const approveMatch = path.match(/^\/api\/pieces\/([\w-]+)\/approve$/);
  if (approveMatch && method === "POST") return approvePiece(env, client, approveMatch[1]);

  return json({ ok: false, error: "rota_nao_encontrada" }, 404);
}

function publicClient(c) {
  return { id: c.id, email: c.email, name: c.name, nicho: c.nicho, access_until: c.access_until };
}

// --- Handlers ---------------------------------------------------------------

async function login(request, env, secure) {
  const body = await readJson(request);
  const email = clean(body.email, 120).toLowerCase();
  const password = clean(body.password, 200);
  if (!email || !password) return json({ ok: false, error: "campos" }, 422);

  const row = await env.DB.prepare(
    "SELECT id, pass_hash, pass_salt FROM clients WHERE email = ?"
  )
    .bind(email)
    .first();
  // Verifica a senha mesmo sem cliente, para não vazar existência por tempo.
  const okPass = row
    ? await verifyPassword(password, row.pass_salt, row.pass_hash)
    : await verifyPassword(password, "00", "00");
  if (!row || !okPass) return json({ ok: false, error: "credenciais" }, 401);

  const ttl = Number(env.SESSION_TTL_HOURS || "168") || 168;
  const { token } = await createSession(env, row.id, ttl);
  return json(
    { ok: true },
    200,
    { "set-cookie": sessionCookie(token, secure, ttl * 3600) }
  );
}

async function featureMenu() {
  try {
    const dir = await findFeaturesDir();
    if (dir) return await loadFeatures(dir);
  } catch (err) {
    console.log(
      JSON.stringify({
        level: "warn",
        msg: "menu em disco indisponivel",
        detail: String(err?.message || err),
      })
    );
  }
  const baked = Array.isArray(bakedMenu) ? bakedMenu : [];
  return toMenu(baked);
}

async function readOnboarding(env, clientId) {
  const row = await env.DB.prepare(
    "SELECT completed_at, tema_amanha FROM client_onboarding WHERE client_id = ?"
  )
    .bind(clientId)
    .first();
  return { completo: !!row, tema_amanha: row?.tema_amanha || "" };
}

async function postOnboarding(request, env, client) {
  const body = await readJson(request);
  const tema = clean(body.tema_amanha, 140);
  await env.DB.prepare(
    `INSERT INTO client_onboarding (client_id, completed_at, tema_amanha)
     VALUES (?, ?, ?)
     ON CONFLICT(client_id) DO UPDATE SET
       completed_at = excluded.completed_at,
       tema_amanha = excluded.tema_amanha`
  )
    .bind(client.id, nowIso(), tema)
    .run();
  return json({ ok: true, onboarding: { completo: true, tema_amanha: tema } });
}

async function logout(request, env, secure) {
  const cookies = parseCookies(request);
  await destroySession(env, cookies.central_session);
  return json({ ok: true }, 200, { "set-cookie": clearCookie(secure) });
}

// Bootstrap de clientes. Só funciona se ADMIN_KEY estiver no ambiente
// e o header x-admin-key bater. Sem ADMIN_KEY => 404 (desligado).
async function adminCreateClient(request, env) {
  if (!env.ADMIN_KEY) return json({ ok: false, error: "rota_nao_encontrada" }, 404);
  if (request.headers.get("x-admin-key") !== env.ADMIN_KEY)
    return json({ ok: false, error: "nao_autorizado" }, 403);
  const body = await readJson(request);
  const email = clean(body.email, 120).toLowerCase();
  const name = clean(body.name, 120);
  const nicho = clean(body.nicho, 40);
  const password = clean(body.password, 200);
  if (!email || !name || password.length < 8)
    return json({ ok: false, error: "campos (senha min 8)" }, 422);
  const exists = await env.DB.prepare("SELECT id FROM clients WHERE email = ?").bind(email).first();
  if (exists) return json({ ok: false, error: "email_ja_existe" }, 409);
  const id = await createClient(env, { email, name, nicho, password });
  return json({ ok: true, id });
}

async function getProfile(env, client) {
  const row = await env.DB.prepare(
    "SELECT colors, fonts, tone, avoid, highlights, updated_at FROM brand_profiles WHERE client_id = ?"
  )
    .bind(client.id)
    .first();
  const profile = row
    ? {
        colors: parseJsonArr(row.colors),
        fonts: parseJsonArr(row.fonts),
        tone: row.tone || "",
        avoid: row.avoid || "",
        highlights: row.highlights || "",
        updated_at: row.updated_at,
      }
    : { colors: [], fonts: [], tone: "", avoid: "", highlights: "", updated_at: null };
  return json({ ok: true, profile, nicho: client.nicho });
}

async function putProfile(request, env, client) {
  const body = await readJson(request);
  const colors = Array.isArray(body.colors)
    ? body.colors.map((c) => clean(c, 24)).filter(Boolean).slice(0, 8)
    : [];
  const fonts = Array.isArray(body.fonts)
    ? body.fonts.map((f) => clean(f, 60)).filter(Boolean).slice(0, 6)
    : [];
  const tone = clean(body.tone, 1200);
  const avoid = clean(body.avoid, 1200);
  const highlights = clean(body.highlights, 1200);
  await env.DB.prepare(
    `INSERT INTO brand_profiles (client_id, colors, fonts, tone, avoid, highlights, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(client_id) DO UPDATE SET
       colors=excluded.colors, fonts=excluded.fonts, tone=excluded.tone,
       avoid=excluded.avoid, highlights=excluded.highlights, updated_at=excluded.updated_at`
  )
    .bind(client.id, JSON.stringify(colors), JSON.stringify(fonts), tone, avoid, highlights, nowIso())
    .run();
  return json({ ok: true });
}

async function generate(request, env, client) {
  const body = await readJson(request);
  const format = clean(body.format, 20);
  const theme = clean(body.theme, 400);
  if (!FORMATS.has(format)) return json({ ok: false, error: "formato_invalido" }, 422);

  const prow = await env.DB.prepare(
    "SELECT colors, fonts, tone, avoid, highlights FROM brand_profiles WHERE client_id = ?"
  )
    .bind(client.id)
    .first();
  const profile = prow
    ? {
        colors: parseJsonArr(prow.colors),
        fonts: parseJsonArr(prow.fonts),
        tone: prow.tone || "",
        avoid: prow.avoid || "",
        highlights: prow.highlights || "",
        nicho: client.nicho || "",
      }
    : { nicho: client.nicho || "" };

  let result;
  try {
    result = await generatePiece(env, { format, theme, profile });
  } catch (err) {
    return json({ ok: false, error: "falha_ia", detail: String(err?.message || err) }, 502);
  }

  const id = uid("pc");
  const created = nowIso();
  await env.DB.prepare(
    "INSERT INTO pieces (id, client_id, format, theme, output, source, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'rascunho', ?)"
  )
    .bind(id, client.id, format, theme, JSON.stringify(result.output), result.source, created)
    .run();

  return json({
    ok: true,
    piece: { id, format, theme, output: result.output, source: result.source, status: "rascunho", created_at: created },
  });
}

async function listHistory(env, client) {
  const res = await env.DB.prepare(
    "SELECT id, format, theme, source, status, created_at FROM pieces WHERE client_id = ? ORDER BY created_at DESC LIMIT 100"
  )
    .bind(client.id)
    .all();
  return json({ ok: true, items: res.results || [] });
}

async function getPiece(env, client, id) {
  const row = await env.DB.prepare(
    "SELECT id, format, theme, output, source, status, created_at FROM pieces WHERE id = ? AND client_id = ?"
  )
    .bind(id, client.id)
    .first();
  if (!row) return json({ ok: false, error: "nao_encontrado" }, 404);
  row.output = parseJsonObj(row.output);
  return json({ ok: true, piece: row });
}

// Aprovação é ação humana e interna: apenas marca o rascunho como aprovado.
// NÃO publica em lugar nenhum nem dispara mensagem.
async function approvePiece(env, client, id) {
  const res = await env.DB.prepare(
    "UPDATE pieces SET status = 'aprovado' WHERE id = ? AND client_id = ?"
  )
    .bind(id, client.id)
    .run();
  if (!res.meta || res.meta.changes === 0) return json({ ok: false, error: "nao_encontrado" }, 404);
  return json({ ok: true, status: "aprovado" });
}

// --- utils ---
async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function parseJsonArr(v) {
  try {
    const p = JSON.parse(v || "[]");
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function parseJsonObj(v) {
  try {
    return JSON.parse(v || "{}");
  } catch {
    return {};
  }
}
