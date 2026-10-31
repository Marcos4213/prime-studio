// API e página do editor. Nada aqui publica a bio.
import { json, parseCookies } from "../../src/lib/http.js";
import { getClientFromSession } from "../../src/lib/auth.js";
import {
  contentHash,
  coversFor,
  editorDraft,
  emptyDraft,
  readyIssues,
  reviewState,
  sanitizeDraft,
} from "./model.js";
import { renderEditorPage, renderGatePage } from "./page.js";
import { suggestLine } from "../../src/lib/copy-method.js";
import { readLatestClinicProfile } from "../../src/lib/clinic-profile.js";

let schemaReady = null;

function ensureSchema(env) {
  if (!schemaReady) {
    schemaReady = env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS link_bio_pages (
         client_id TEXT PRIMARY KEY,
         draft TEXT NOT NULL,
         status TEXT NOT NULL DEFAULT 'rascunho',
         reviewed_at TEXT,
         reviewed_hash TEXT,
         updated_at TEXT NOT NULL,
         FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
       )`
    )
      .run()
      .catch((err) => {
        schemaReady = null;
        throw err;
      });
  }
  return schemaReady;
}

export async function handleLinkNaBio(request, env, url) {
  try {
    if (!env?.DB) return json({ ok: false, error: "sem_banco" }, 500);
    await ensureSchema(env);
    return await route(request, env, url);
  } catch (err) {
    console.log(JSON.stringify({ level: "error", msg: String(err?.message || err), path: url.pathname }));
    return json({ ok: false, error: "erro interno" }, 500);
  }
}

async function route(request, env, url) {
  const path = url.pathname;
  const method = request.method;

  if (path === "/link-na-bio") {
    if (method !== "GET") return json({ ok: false, error: "metodo" }, 405);
    const client = await clientOf(request, env);
    if (!client) return html(renderGatePage());
    return html(renderEditorPage());
  }

  if (!path.startsWith("/api/link-na-bio")) return json({ ok: false, error: "rota_nao_encontrada" }, 404);

  const client = await clientOf(request, env);
  if (!client) return json({ ok: false, error: "nao_autenticado" }, 401);

  if (path === "/api/link-na-bio" && method === "GET") return json(await present(await loadRow(env, client.id), client, env));
  if (path === "/api/link-na-bio" && method === "PUT") return persist(env, client, await readJson(request), "save");
  if (path === "/api/link-na-bio/revisao" && method === "POST")
    return persist(env, client, await readJson(request), "review");
  if (path === "/api/link-na-bio/pronta" && method === "POST") return markReady(env, client);

  return json({ ok: false, error: "rota_nao_encontrada" }, 404);
}

async function clientOf(request, env) {
  const cookies = parseCookies(request);
  return getClientFromSession(env, cookies.central_session);
}

async function loadRow(env, clientId) {
  return env.DB.prepare(
    "SELECT draft, status, reviewed_at, reviewed_hash, updated_at FROM link_bio_pages WHERE client_id = ?"
  )
    .bind(clientId)
    .first();
}

function parseStored(raw) {
  try {
    return sanitizeDraft(JSON.parse(raw)).draft;
  } catch {
    return emptyDraft("");
  }
}

async function present(row, client, env) {
  const canonical = row ? parseStored(row.draft) : emptyDraft(client.name || "");
  const hash = contentHash(canonical);
  const reviewed = reviewState({
    reviewedAt: row?.reviewed_at || null,
    contentHash: hash,
    reviewedHash: row?.reviewed_hash || "",
  });
  let copyMethod = suggestLine("link-na-bio", {});
  try {
    const clinic = await readLatestClinicProfile(env, client.id);
    copyMethod = suggestLine("link-na-bio", clinic.profile);
  } catch {
    copyMethod = suggestLine("link-na-bio", {});
  }
  return {
    ok: true,
    client: { name: client.name || "", nicho: client.nicho || "" },
    status: row?.status === "pronta" ? "pronta" : "rascunho",
    reviewed_at: row?.reviewed_at || null,
    updated_at: row?.updated_at || null,
    state: reviewed.state,
    covers: coversFor(client.nicho),
    draft: editorDraft(canonical),
    copy_method: copyMethod,
  };
}

async function persist(env, client, body, mode) {
  const { errors, draft } = sanitizeDraft(body);
  if (errors.length) return json({ ok: false, error: "conteudo", fields: errors }, 422);

  if (mode === "review") {
    const aligned = draft.alignment.site && draft.alignment.instagram && draft.alignment.google;
    if (!aligned) {
      return json(
        { ok: false, error: "alinhamento", message: "Confira as três portas antes de registrar a revisão." },
        422
      );
    }
  }

  const existing = await loadRow(env, client.id);
  const hash = contentHash(draft);
  const now = new Date().toISOString();
  let reviewedAt = existing?.reviewed_at || null;
  let reviewedHash = existing?.reviewed_hash || "";
  let status = existing?.status === "pronta" ? "pronta" : "rascunho";

  if (mode === "review") {
    const unchangedReady = existing?.status === "pronta" && existing?.reviewed_hash === hash;
    reviewedAt = now;
    reviewedHash = hash;
    status = unchangedReady ? "pronta" : "rascunho";
  } else if (reviewedHash && reviewedHash !== hash) {
    status = "rascunho";
  }

  await env.DB.prepare(
    `INSERT INTO link_bio_pages (client_id, draft, status, reviewed_at, reviewed_hash, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(client_id) DO UPDATE SET
       draft = excluded.draft,
       status = excluded.status,
       reviewed_at = excluded.reviewed_at,
       reviewed_hash = excluded.reviewed_hash,
       updated_at = excluded.updated_at`
  )
    .bind(client.id, JSON.stringify(draft), status, reviewedAt, reviewedHash, now)
    .run();

  return json(await present(await loadRow(env, client.id), client, env));
}

async function markReady(env, client) {
  const row = await loadRow(env, client.id);
  if (!row) {
    return json({ ok: false, error: "revisao", message: "Salve e revise a página antes." }, 422);
  }
  const draft = parseStored(row.draft);
  const state = reviewState({
    reviewedAt: row.reviewed_at,
    contentHash: contentHash(draft),
    reviewedHash: row.reviewed_hash || "",
  });
  const issues = readyIssues(draft, state);
  if (issues.length) return json({ ok: false, error: "revisao", message: issues[0] }, 422);

  const now = new Date().toISOString();
  await env.DB.prepare("UPDATE link_bio_pages SET status = 'pronta', updated_at = ? WHERE client_id = ?")
    .bind(now, client.id)
    .run();
  return json(await present(await loadRow(env, client.id), client, env));
}

function html(body) {
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
