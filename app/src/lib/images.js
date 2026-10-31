// Imagens do estúdio. A chave fica só em env.GEMINI_API_KEY e não entra em log.
// Compliance CFM/CFO vale para o que a IA gera. A foto importada pela clínica não passa por esta trava.
import { redactSecrets } from "./ai.js";

export const IMAGE_MODEL = "gemini-nano-banana-2.1";
const IMAGE_FALLBACK = "gemini-3.1-flash-lite-image";
const INTERACTIONS = "https://generativelanguage.googleapis.com/v1beta/interactions";

export const IMAGE_RATIOS = new Set(["1:1", "4:5", "9:16"]);
export const IMAGE_KINDS = {
  post: { label: "Post", ratio: "4:5" },
  stories: { label: "Stories", ratio: "9:16" },
  capa: { label: "Capa", ratio: "1:1" },
};

const PALETTE = "petróleo #0F4C5C, fundo #F7F5F0, dourado #B08D57 só como detalhe fino";

export function imagePrompt({ kind, profile, caption, theme, fromPhoto }) {
  const place = [
    profile?.cidade ? `Cidade: ${profile.cidade}.` : "",
    profile?.nicho ? `Nicho: ${profile.nicho}.` : "",
    profile?.tom ? `Tom: ${profile.tom}.` : "",
    theme ? `Tema: ${theme}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const line = String(caption || "").replace(/\s+/g, " ").trim().slice(0, 320);
  const use = kind === "stories" ? "stories vertical" : kind === "capa" ? "capa quadrada" : "post";
  const rules = [
    "Compliance CFM e CFO, obrigatório nesta imagem gerada:",
    "Sem antes e depois.",
    "Sem rosto ou corpo de paciente simulando resultado.",
    "Sem promessa de resultado, cura ou número.",
    "Prefira o ambiente da clínica, texturas, objetos e tipografia.",
    "Sem pessoa em destaque.",
    `Paleta Petróleo Clínico: ${PALETTE}.`,
  ].join(" ");
  const base = fromPhoto
    ? "Use a foto enviada como base. Enquadre, acrescente moldura e tipografia. Não altere rosto ou corpo para sugerir um resultado clínico."
    : `Crie uma imagem de ${use} para a clínica.`;
  const text = line ? `Se houver texto na imagem, use só isto, sem inventar frase: ${line}` : "Sem frase inventada na imagem.";
  return `${base} ${place} ${text} ${rules}`;
}

export function imageMotivo(status) {
  if (status === 429) return "cota";
  if (status === 404) return "modelo";
  if (status >= 500) return "indisponivel";
  return "falha";
}

export function extractGeneratedImage(data, inputB64 = "") {
  const direct = data?.output_image || data?.outputImage;
  if (direct?.data && direct.data !== inputB64) return packImage(direct);
  const steps = Array.isArray(data?.steps) ? data.steps : [];
  const modelSteps = steps.filter((step) => /model|output/i.test(String(step?.type || step?.role || "")));
  const pool = modelSteps.length ? modelSteps : [];
  const found = [];
  for (const step of pool) collectImages(step, found);
  const fresh = found.filter((img) => img.b64 && img.b64 !== inputB64);
  return fresh.at(-1) || null;
}

function packImage(node) {
  const b64 = String(node.data || node.inline_data?.data || node.inlineData?.data || "");
  if (!b64) return null;
  const mime = node.mime_type || node.mimeType || node.inline_data?.mime_type || node.inlineData?.mimeType || "image/png";
  return { b64, mime: String(mime) };
}

function collectImages(node, out) {
  if (!node || typeof node !== "object") return;
  if ((node.type === "image" || node.mime_type || node.mimeType) && typeof node.data === "string") {
    const packed = packImage(node);
    if (packed) out.push(packed);
  }
  const kids = Array.isArray(node.content) ? node.content : Array.isArray(node.parts) ? node.parts : [];
  for (const kid of kids) collectImages(kid, out);
}

function geminiKey(env) {
  const key = env?.GEMINI_API_KEY;
  return typeof key === "string" ? key.trim() : "";
}

export async function generateClinicImage(env, { kind, ratio, profile, caption, theme, photo } = {}) {
  const key = geminiKey(env);
  if (!key) return { ok: false, motivo: "sem_chave" };
  const prompt = imagePrompt({
    kind,
    profile,
    caption,
    theme,
    fromPhoto: !!(photo?.b64),
  });
  const models = [IMAGE_MODEL, IMAGE_FALLBACK];
  let last = "falha";
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const made = await callImage(key, model, prompt, ratio, photo);
        return { ok: true, model, ...made };
      } catch (err) {
        last = err?.motivo || "falha";
        console.log(JSON.stringify({ level: "warn", msg: "gemini_imagem", detail: redactSecrets(err?.message || err, key), model }));
        if (last !== "indisponivel" && last !== "cota") break;
      }
    }
  }
  return { ok: false, motivo: last };
}

async function callImage(key, model, prompt, ratio, photo) {
  const input = [{ type: "text", text: prompt }];
  if (photo?.b64) input.push({ type: "image", data: photo.b64, mime_type: photo.mime || "image/jpeg" });
  const resp = await fetch(INTERACTIONS, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      model,
      input,
      response_format: {
        type: "image",
        mime_type: "image/png",
        aspect_ratio: ratio,
        image_size: "1K",
      },
    }),
    signal: AbortSignal.timeout(32000),
  });
  if (!resp.ok) {
    const err = new Error(`gemini_imagem_${resp.status}`);
    err.motivo = imageMotivo(resp.status);
    throw err;
  }
  let data;
  try {
    data = await resp.json();
  } catch {
    const err = new Error("gemini_imagem_json");
    err.motivo = "falha";
    throw err;
  }
  const image = extractGeneratedImage(data, photo?.b64 || "");
  if (!image?.b64) {
    const err = new Error("gemini_imagem_vazia");
    err.motivo = "falha";
    throw err;
  }
  return { bytes: decodeB64(image.b64), mime: image.mime.startsWith("image/") ? image.mime : "image/png" };
}

function decodeB64(raw) {
  const b64 = String(raw).replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "").replace(/\s/g, "");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
