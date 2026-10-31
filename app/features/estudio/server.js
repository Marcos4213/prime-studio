// Estúdio — página em /estudio e geração com modo de gravação.
// A casca só registra o bloco /* feature:estudio */. Nada publica sozinho.
import pageTemplate from "./page.html";
import studioCss from "./studio.css.txt";
import clientJs from "./client.js.txt";
import { json, uid, nowIso, clean, parseCookies } from "../../src/lib/http.js";
import { getClientFromSession } from "../../src/lib/auth.js";
import { generatePiece, reviseCopy, FORMATS, redactSecrets } from "../../src/lib/ai.js";
import { generateClinicImage, IMAGE_KINDS, IMAGE_RATIOS } from "../../src/lib/images.js";
import { loadGeneratorProfile } from "../../src/lib/clinic-profile.js";
import { dailyPair } from "./logic.js";

export async function handleEstudio(request, env, url) {
  const path = url.pathname;
  if (path === "/estudio" || path === "/estudio/") return handleEstudioPage(request);
  if (path === "/api/estudio/generate" && request.method === "POST") return handleEstudioGenerate(request, env);
  if (path === "/api/estudio/imagem" && request.method === "POST") return handleEstudioImage(request, env);
  if (path === "/api/estudio/fotos" && request.method === "POST") return handleEstudioUpload(request, env);
  if (path === "/api/estudio/chat" && request.method === "POST") return handleEstudioChat(request, env);
  const file = path.match(/^\/api\/estudio\/imagens\/([a-zA-Z0-9_-]+)$/);
  if (file && (request.method === "GET" || request.method === "HEAD")) return handleEstudioFile(request, env, file[1]);
  if (request.method !== "GET" && request.method !== "HEAD" && request.method !== "POST") {
    return json({ ok: false, error: "metodo" }, 405);
  }
  return json({ ok: false, error: "rota_nao_encontrada" }, 404);
}

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

  const profile = (await loadGeneratorProfile(env, client)).profile;

  let result;
  try {
    result = await generatePiece(env, {
      format,
      theme,
      profile,
      recordingMode: format === "video" ? recordingMode : "",
    });
  } catch (err) {
    console.log(JSON.stringify({ level: "error", msg: redactSecrets(err?.message || err), path: "/api/estudio/generate" }));
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
      model: result.model || "",
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

const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function clinicFolder(client) {
  const id = String(client?.id || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48);
  return `imagens/${id || "clinica"}`;
}

function objectKey(client, name) {
  if (!/^[a-zA-Z0-9_-]{6,48}$/.test(name)) return "";
  return `${clinicFolder(client)}/${name}`;
}

async function sessionClient(request, env) {
  const cookies = parseCookies(request);
  return getClientFromSession(env, cookies.central_session);
}

export async function handleEstudioImage(request, env) {
  const client = await sessionClient(request, env);
  if (!client) return json({ ok: false, error: "nao_autenticado" }, 401);
  if (!env.VIDEOS) return json({ ok: false, error: "imagem_indisponivel", motivo: "arquivo" }, 503);

  const body = await readJson(request);
  const kind = IMAGE_KINDS[body.kind] ? body.kind : "post";
  const ratio = IMAGE_RATIOS.has(body.ratio) ? body.ratio : IMAGE_KINDS[kind].ratio;
  const caption = clean(body.caption, 500);
  const theme = clean(body.theme, 400);
  const origem = clean(body.origem, 48);
  const profile = (await loadGeneratorProfile(env, client)).profile;

  let photo = null;
  if (origem) {
    const key = objectKey(client, origem);
    const stored = key ? await env.VIDEOS.get(key) : null;
    if (!stored) return json({ ok: false, error: "foto_ausente" }, 404);
    const bytes = new Uint8Array(await stored.arrayBuffer());
    photo = { b64: encodeB64(bytes), mime: stored.httpMetadata?.contentType || "image/jpeg" };
  }

  let made;
  try {
    made = await generateClinicImage(env, { kind, ratio, profile, caption, theme, photo });
  } catch (err) {
    console.log(JSON.stringify({ level: "warn", msg: "gemini_imagem", detail: redactSecrets(err?.message || err) }));
    made = { ok: false, motivo: "falha" };
  }
  if (!made.ok) {
    return json({ ok: false, error: "imagem_indisponivel", motivo: made.motivo || "falha" }, 200);
  }

  const name = uid("img");
  const key = objectKey(client, name);
  await env.VIDEOS.put(key, made.bytes, { httpMetadata: { contentType: made.mime || "image/png" } });
  return json({
    ok: true,
    image: {
      id: name,
      url: `/api/estudio/imagens/${name}`,
      ratio,
      kind,
      source: "ia",
      model: made.model || "",
    },
  });
}

export async function handleEstudioUpload(request, env) {
  const client = await sessionClient(request, env);
  if (!client) return json({ ok: false, error: "nao_autenticado" }, 401);
  if (!env.VIDEOS) return json({ ok: false, error: "arquivo_indisponivel" }, 503);

  let file;
  try {
    const form = await request.formData();
    file = form.get("foto");
  } catch {
    file = null;
  }
  if (!file || typeof file.arrayBuffer !== "function") return json({ ok: false, error: "foto_ausente" }, 422);
  const mime = PHOTO_TYPES.has(file.type) ? file.type : "";
  if (!mime) return json({ ok: false, error: "foto_tipo" }, 422);
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!bytes.byteLength || bytes.byteLength > 3500000) return json({ ok: false, error: "foto_tamanho" }, 422);

  const name = uid("foto");
  const key = objectKey(client, name);
  await env.VIDEOS.put(key, bytes, { httpMetadata: { contentType: mime } });
  return json({ ok: true, foto: { id: name, url: `/api/estudio/imagens/${name}` } });
}

export async function handleEstudioChat(request, env) {
  const client = await sessionClient(request, env);
  if (!client) return json({ ok: false, error: "nao_autenticado" }, 401);

  const body = await readJson(request);
  const instruction = clean(body.instruction, 400);
  const target = body.target === "legenda" ? "legenda" : body.target === "imagem" || body.target === "foto" ? "imagem" : "";
  if (!target || !instruction) return json({ ok: false, error: "pedido" }, 422);

  const profile = (await loadGeneratorProfile(env, client)).profile;
  if (target === "legenda") {
    let revised;
    try {
      revised = await reviseCopy(env, {
        instruction,
        text: clean(body.text, 4000),
        profile,
        structure: clean(body.structure, 20),
      });
    } catch (err) {
      console.log(JSON.stringify({ level: "warn", msg: "gemini_conversa", detail: redactSecrets(err?.message || err) }));
      revised = { ok: false, motivo: "falha" };
    }
    if (!revised.ok) return json({ ok: false, error: "conversa_indisponivel", motivo: revised.motivo || "falha" }, 200);
    return json({
      ok: true,
      target: "legenda",
      version: { text: revised.text, warnings: revised.warnings || [], model: revised.model || "", source: "ia" },
    });
  }

  if (!env.VIDEOS) return json({ ok: false, error: "imagem_indisponivel", motivo: "arquivo" }, 503);
  const kind = IMAGE_KINDS[body.kind] ? body.kind : "post";
  const ratio = IMAGE_RATIOS.has(body.ratio) ? body.ratio : IMAGE_KINDS[kind].ratio;
  const origem = clean(body.origem, 48);
  let photo = null;
  if (origem) {
    const key = objectKey(client, origem);
    const stored = key ? await env.VIDEOS.get(key) : null;
    if (!stored) return json({ ok: false, error: "foto_ausente" }, 404);
    const bytes = new Uint8Array(await stored.arrayBuffer());
    photo = { b64: encodeB64(bytes), mime: stored.httpMetadata?.contentType || "image/jpeg" };
  }

  let made;
  try {
    made = await generateClinicImage(env, {
      kind,
      ratio,
      profile,
      caption: clean(body.text, 500),
      pedido: instruction,
      photo,
    });
  } catch (err) {
    console.log(JSON.stringify({ level: "warn", msg: "gemini_imagem", detail: redactSecrets(err?.message || err) }));
    made = { ok: false, motivo: "falha" };
  }
  if (!made.ok) return json({ ok: false, error: "imagem_indisponivel", motivo: made.motivo || "falha" }, 200);

  const name = uid("img");
  await env.VIDEOS.put(objectKey(client, name), made.bytes, { httpMetadata: { contentType: made.mime || "image/png" } });
  return json({
    ok: true,
    target: "imagem",
    version: { id: name, url: `/api/estudio/imagens/${name}`, source: "ia", model: made.model || "" },
  });
}

export async function handleEstudioFile(request, env, name) {
  const client = await sessionClient(request, env);
  if (!client) return json({ ok: false, error: "nao_autenticado" }, 401);
  const key = objectKey(client, name);
  if (!key || !env.VIDEOS) return json({ ok: false, error: "foto_ausente" }, 404);
  const stored = await env.VIDEOS.get(key);
  if (!stored) return json({ ok: false, error: "foto_ausente" }, 404);
  const download = new URL(request.url).searchParams.get("download") === "1";
  const headers = {
    "content-type": stored.httpMetadata?.contentType || "application/octet-stream",
    "cache-control": "private, max-age=300",
    "content-disposition": `${download ? "attachment" : "inline"}; filename="${name}"`,
    "x-robots-tag": "noindex, nofollow",
  };
  return new Response(request.method === "HEAD" ? null : stored.body, { status: 200, headers });
}

function encodeB64(bytes) {
  let bin = "";
  const chunk = 0x4000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

