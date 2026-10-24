// POST /api/capi — espelha eventos do Pixel na Conversions API (dedup por event_id).
// Inativo até existirem META_PIXEL_ID e META_CAPI_TOKEN nas variáveis do Pages.
import { json, capiSend } from "../../lib/integrations.js";
const OK = new Set(["PageView", "ViewContent", "Lead", "CompleteRegistration", "Contact", "Schedule", "InitiateCheckout", "QuizStart", "QuizStep"]);
export async function onRequestPost({ request, env }) {
  if (!env.META_CAPI_TOKEN || !env.META_PIXEL_ID) return json({ ok: true, capi: "inativo" });
  const origin = request.headers.get("origin") || ""; if (origin && !/prime\.devbrasil\.online|prime-studio\.pages\.dev|localhost/.test(origin)) return json({ ok: false }, 403);
  let b; try { b = JSON.parse(await request.text()); } catch { return json({ ok: false }, 400); }
  if (!OK.has(b.event_name)) return json({ ok: false, error: "evento" }, 422);
  return json({ ok: true, ...(await capiSend(env, request, b)) });
}
