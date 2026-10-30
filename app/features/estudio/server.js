// Estúdio — página em /estudio e geração com modo de gravação.
// A casca só registra o bloco /* feature:estudio */. Nada publica sozinho.
import pageTemplate from "./page.html";
import studioCss from "./studio.css.txt";
import clientJs from "./client.js.txt";
import { json, uid, nowIso, clean, parseCookies } from "../../src/lib/http.js";
import { getClientFromSession } from "../../src/lib/auth.js";
import { generatePiece, FORMATS } from "../../src/lib/ai.js";
import { dailyPair } from "./logic.js";

export function handleEstudioPage(request) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("método não permitido", { status: 405, headers: { allow: "GET, HEAD" } });
  }
  const boot = JSON.stringify(dailyPair(new Date())).replace(/</g, "\\u003c");
  const html = pageTemplate
    .replace("___ESTUDIO_CSS___", studioCss)
    .replace("___ESTUDIO_JS___", clientJs)
    .replace("___ESTUDIO_BOOT___", boot);
  return new Response(request.method === "HEAD" ? null : html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

export async function handleEstudioGenerate(request, env) {
  const cookies = parseCookies(request);
  const client = await getClientFromSession(env, cookies.central_session);
  if (!client) return json({ ok: false, error: "nao_autenticado" }, 401);

  const body = await readJson(request);
  const format = clean(body.format, 20);
  const theme = clean(body.theme, 400);
  const recordingMode = clean(body.recordingMode, 20);
  if (!FORMATS.has(format)) return json({ ok: false, error: "formato_invalido" }, 422);
  if (format === "video" && recordingMode !== "camera" && recordingMode !== "narracao") {
    return json({ ok: false, error: "modo_invalido" }, 422);
  }

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
    result = await generatePiece(env, {
      format,
      theme,
      profile,
      recordingMode: format === "video" ? recordingMode : "",
    });
  } catch (err) {
    console.log(JSON.stringify({ level: "error", msg: String(err?.message || err).slice(0, 300), path: "/api/estudio/generate" }));
    return json({ ok: false, error: "falha_ia" }, 502);
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
    piece: {
      id,
      format,
      theme,
      output: result.output,
      source: result.source,
      status: "rascunho",
      created_at: created,
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

function parseJsonArr(v) {
  try {
    const p = JSON.parse(v || "[]");
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}
