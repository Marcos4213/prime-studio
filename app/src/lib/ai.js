// Estúdio e as outras estruturas: geração com Gemini e rascunho de exemplo.
// A chave vem SÓ do ambiente (env.GEMINI_API_KEY). Sem chave, ou se a API
// não responder, o app devolve o rascunho local. A chave não entra em log,
// erro ou texto da peça.
import { chooseCopyMethod, structureForFormat, suggestLine } from "./copy-method.js";

const FORMATS = new Set(["post", "carousel", "video"]);

// Flash estável na documentação do Gemini (setembro de 2026). Sem preview.
export const GEMINI_MODEL = "gemini-3.8-flash";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// --- Regras de marca (guarda-corpos) --------------------------------------
// Padrões proibidos no que a IA gera. Em caso de acerto, vira aviso + o texto
// é sinalizado; nada publica sozinho (status permanece 'rascunho').
const BANNED = [
  { re: /\bfatur(a|e|ar|amento|ando)\b/i, msg: "Possível promessa de faturamento." },
  { re: /\blucr(o|os|ar|atividade)\b/i, msg: "Possível promessa de lucro." },
  { re: /\bganh[ae]\s+(mais\s+)?(dinheiro|reais|R\$)/i, msg: "Promessa financeira." },
  { re: /antes\s*(e|\/|\s)\s*depois/i, msg: "Antes e depois não é permitido." },
  { re: /\bbefore\s*(and|\/)\s*after\b/i, msg: "Antes e depois não é permitido." },
  { re: /\bretorno\s+garantido\b/i, msg: "Promessa de retorno garantido." },
  { re: /\bgarant(o|ia|ido|imos)\b.*\b(resultado|retorno|venda)/i, msg: "Garantia de resultado." },
  { re: /\b(paciente|prontu[aá]rio|diagn[oó]stico|laudo)\b/i, msg: "Possível dado de saúde." },
  { re: /R\$\s*\d/, msg: "Possível valor inventado." },
  { re: /\b\d+\s*%/, msg: "Possível percentual inventado." },
];

export function brandGuard(output) {
  const warnings = [];
  const scan = (val, path) => {
    if (typeof val === "string") {
      for (const b of BANNED) if (b.re.test(val)) warnings.push(`${path}: ${b.msg}`);
    } else if (Array.isArray(val)) {
      val.forEach((v, i) => scan(v, `${path}[${i}]`));
    } else if (val && typeof val === "object") {
      for (const k of Object.keys(val)) scan(val[k], path ? `${path}.${k}` : k);
    }
  };
  scan(output, "");
  return warnings;
}

export function redactSecrets(text, secret) {
  let out = String(text || "");
  if (typeof secret === "string" && secret.length > 6) out = out.split(secret).join("[redacted]");
  out = out.replace(/AIza[0-9A-Za-z_-]{8,}/g, "[redacted]");
  out = out.replace(/([?&]key=)[^&\s]+/gi, "$1[redacted]");
  out = out.replace(/(x-goog-api-key|authorization|api[_-]?key)\s*[:=]\s*\S+/gi, "$1 [redacted]");
  return out.slice(0, 180);
}

// --- Prompt ----------------------------------------------------------------
function brandBlock(profile) {
  if (!profile) return "A clínica ainda não preencheu o perfil de marca. Use um tom premium, sóbrio e humano.";
  const colors = safeList(profile.colors);
  const fonts = safeList(profile.fonts);
  return [
    profile.tone || profile.tom ? `Tom da clínica: ${profile.tom || profile.tone}` : "",
    colors.length ? `Cores da marca: ${colors.join(", ")}` : "",
    fonts.length ? `Fontes da marca: ${fonts.join(", ")}` : "",
    profile.avoid ? `O que a clínica NUNCA diz: ${profile.avoid}` : "",
    profile.highlights || profile.diferenciais ? `O que destaca a clínica: ${profile.diferenciais || profile.highlights}` : "",
    profile.nicho ? `Nicho: ${profile.nicho}` : "",
    profile.especialidades ? `Especialidades: ${profile.especialidades}` : "",
    profile.procedimentos ? `Procedimentos carro-chefe: ${profile.procedimentos}` : "",
    profile.publico ? `Público ideal: ${profile.publico}` : "",
    profile.cidade ? `Cidade: ${profile.cidade}` : "",
    profile.objetivos ? `Objetivos: ${profile.objetivos}` : "",
    profile.objecoes ? `Objeções comuns: ${profile.objecoes}` : "",
    profile.provas ? `Provas e autoridade: ${profile.provas}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function safeList(v) {
  if (Array.isArray(v)) return v;
  try {
    const p = JSON.parse(v || "[]");
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

const RULES = [
  "Regras inegociáveis (compliance CFM e CFO) para TUDO que você gerar:",
  "- Sem promessa de resultado, cura, transformação ou retorno.",
  "- Sem 'antes e depois'.",
  "- Sem dado de saúde, diagnóstico, paciente ou procedimento clínico específico.",
  "- Sem número inventado (métrica, preço, percentual, estatística). Se não foi informado, não cite.",
  "- Nada aqui publica sozinho: é um rascunho para aprovação humana.",
  "- Português do Brasil. Fale como \"nosso time\" ou \"a gente\".",
].join("\n");

function systemPrompt(profile, method) {
  const voice = method
    ? `Método de copy desta peça: ${method.name} (${method.note}). Estrutura: ${method.structure}. Sempre dentro do ${method.prime || "Método PRIME"}.`
    : `Sempre dentro do Método PRIME.`;
  return `Você é o estúdio de conteúdo da Prime Studio, criando peças para clínicas premium, dentro do Método PRIME.\n\n${voice}\n\nPerfil da marca:\n${brandBlock(
    profile
  )}\n\n${RULES}`;
}

function formatInstruction(format, recordingMode) {
  if (format === "post") {
    return 'Formato: POST único. Responda JSON: {"caption": string, "imagePrompt": string}. O imagePrompt descreve fotografia real do espaço, no visual e nas cores da clínica, sem pessoa em destaque e sem texto na imagem.';
  }
  if (format === "carousel") {
    return 'Formato: CARROSSEL. Responda JSON: {"caption": string, "slides": [{"title": string, "imagePrompt": string}]}. Entre 3 e 6 slides, com começo, desenvolvimento e fechamento. Um imagePrompt por slide, no mesmo padrão visual: fotografia real do espaço, sem pessoa em destaque, sem texto na imagem.';
  }
  const modeLine =
    recordingMode === "narracao" || recordingMode === "camera"
      ? `O campo recording.mode DEVE ser "${recordingMode}".`
      : 'recording.mode é "camera" (alguém da clínica fala) ou "narracao" (voz sobre imagem do espaço).';
  return `Formato: VÍDEO (reels ou story). Responda JSON: {"script": {"hook": string, "body": string, "cta": string}, "recording": {"mode": "camera" | "narracao", "tips": [string]}}. SEM prompt de imagem. ${modeLine} tips com enquadramento, luz natural e ordem das falas. Ritmo curto, sem citar segundos, métrica, faturamento, antes e depois ou dado de saúde.`;
}

const SCHEMAS = {
  post: {
    type: "object",
    properties: {
      caption: { type: "string" },
      imagePrompt: { type: "string" },
    },
    required: ["caption", "imagePrompt"],
  },
  carousel: {
    type: "object",
    properties: {
      caption: { type: "string" },
      slides: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            imagePrompt: { type: "string" },
          },
          required: ["title", "imagePrompt"],
        },
      },
    },
    required: ["caption", "slides"],
  },
  video: {
    type: "object",
    properties: {
      script: {
        type: "object",
        properties: {
          hook: { type: "string" },
          body: { type: "string" },
          cta: { type: "string" },
        },
        required: ["hook", "body", "cta"],
      },
      recording: {
        type: "object",
        properties: {
          mode: { type: "string" },
          tips: { type: "array", items: { type: "string" } },
        },
        required: ["mode", "tips"],
      },
    },
    required: ["script", "recording"],
  },
  line: {
    type: "object",
    properties: { line: { type: "string" } },
    required: ["line"],
  },
};

function geminiKey(env) {
  const key = env?.GEMINI_API_KEY;
  return typeof key === "string" ? key.trim() : "";
}

function geminiModel(env) {
  const raw = typeof env?.GEMINI_MODEL === "string" ? env.GEMINI_MODEL.trim() : "";
  if (/^gemini-\d+(\.\d+)?-flash$/.test(raw)) return raw;
  return GEMINI_MODEL;
}

function logFallback(err, key) {
  const detail = redactSecrets(err?.message || err, key);
  console.log(JSON.stringify({ level: "warn", msg: "gemini_rascunho", detail }));
}

// --- Geração ---------------------------------------------------------------
export async function generatePiece(env, { format, theme, profile, recordingMode, structure } = {}) {
  if (!FORMATS.has(format)) throw new Error("formato inválido");
  const mode = recordingMode === "narracao" || recordingMode === "camera" ? recordingMode : "";
  const method = chooseCopyMethod(structure || structureForFormat(format));
  const key = geminiKey(env);
  if (!key) {
    return finishMock(format, theme, profile, mode, method);
  }
  try {
    const parsed = await callGemini(env, key, {
      profile,
      method,
      schema: SCHEMAS[format],
      instruction: `${formatInstruction(format, mode)}\n\nTema: ${theme || "conteúdo institucional da clínica"}\nResponda apenas o JSON.`,
      timeoutMs: 25000,
    });
    const output = normalize(format, parsed, mode);
    return { source: "ia", model: geminiModel(env), output: attach(output, method) };
  } catch (err) {
    logFallback(err, key);
    return { ...finishMock(format, theme, profile, mode, method), fallback: redactSecrets(err?.message || err, key) };
  }
}

// Bio, link na bio, anúncio, WhatsApp e site. O mesmo Gemini, com o método da estrutura.
export async function generateStructureCopy(env, { structure, profile, theme } = {}) {
  const method = chooseCopyMethod(structure);
  const local = suggestLine(method.structure, profile);
  const key = geminiKey(env);
  if (!key) return { ...local, source: "mock" };
  try {
    const parsed = await callGemini(env, key, {
      profile,
      method,
      schema: SCHEMAS.line,
      instruction: `Estrutura: ${method.structure}. Escreva uma frase de copy no método ${method.name}. ${method.note}\nTema: ${theme || "presença da clínica"}\nResponda JSON {"line": string}. Sem promessa de resultado, sem antes e depois, sem número inventado.`,
      timeoutMs: 12000,
    });
    const line = str(parsed.line) || local.line;
    const warnings = brandGuard({ line });
    return { ...method, line, source: "ia", model: geminiModel(env), warnings };
  } catch (err) {
    logFallback(err, key);
    return { ...local, source: "mock" };
  }
}

function finishMock(format, theme, profile, mode, method) {
  const output = mockPiece(format, theme, profile, mode, method);
  return { source: "mock", output: attach(output, method) };
}

function attach(output, method) {
  return { ...output, copyMethod: method, warnings: brandGuard(output) };
}

async function callGemini(env, key, { profile, method, schema, instruction, timeoutMs }) {
  const model = geminiModel(env);
  const resp = await fetch(`${GEMINI_URL}/${model}:generateContent`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": key,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt(profile, method) }] },
      contents: [{ role: "user", parts: [{ text: instruction }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseJsonSchema: schema,
        maxOutputTokens: 2048,
        thinkingConfig: { thinkingLevel: "low" },
      },
    }),
    signal: AbortSignal.timeout(timeoutMs || 28000),
  });
  const raw = await resp.text();
  if (!resp.ok) {
    let code = `gemini_${resp.status}`;
    try {
      const status = JSON.parse(raw)?.error?.status;
      if (typeof status === "string" && /^[A-Z0-9_]+$/.test(status)) code = `${code}_${status}`;
    } catch {
      code = `gemini_${resp.status}`;
    }
    throw new Error(code);
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("gemini_json");
  }
  const text = candidateText(data);
  if (!text) throw new Error("gemini_vazio");
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("gemini_conteudo");
  }
}

function candidateText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .filter((part) => part && typeof part.text === "string" && !part.thought)
    .map((part) => part.text)
    .join("")
    .trim();
}

// Garante a forma esperada por formato, mesmo se a IA variar.
function normalize(format, p, recordingMode) {
  if (format === "post") {
    return { caption: str(p.caption), imagePrompt: str(p.imagePrompt) };
  }
  if (format === "carousel") {
    const slides = Array.isArray(p.slides) ? p.slides : [];
    return {
      caption: str(p.caption),
      slides: slides.slice(0, 8).map((s) => ({ title: str(s?.title), imagePrompt: str(s?.imagePrompt) })),
    };
  }
  const script = p.script || {};
  const rec = p.recording || {};
  const mode =
    recordingMode === "narracao" || recordingMode === "camera"
      ? recordingMode
      : rec.mode === "narracao"
        ? "narracao"
        : "camera";
  const tips = Array.isArray(rec.tips) ? rec.tips.map(str).filter(Boolean).slice(0, 6) : [];
  return {
    script: { hook: str(script.hook), body: str(script.body), cta: str(script.cta) },
    recording: { mode, tips },
  };
}

function str(v) {
  return typeof v === "string" ? v.trim() : "";
}

// --- Rascunho de exemplo ---------------------------------------------------
// Determinístico e dentro das regras de marca. Usado sem chave e quando a API falha.
function colorHint(profile, theme) {
  const colors = safeList(profile?.colors);
  const fonts = safeList(profile?.fonts);
  const bits = [
    `Fotografia real do espaço, sobre ${theme}.`,
    "Sem pessoa em destaque, sem texto na imagem.",
  ];
  if (colors.length) bits.push(`Cores da marca: ${colors.join(", ")}.`);
  else bits.push("Se a marca não tiver cor, clima escuro com detalhe dourado.");
  if (fonts.length) bits.push(`Se houver tipografia, usar: ${fonts.join(", ")}.`);
  return bits.join(" ");
}

function videoTips(mode) {
  if (mode === "narracao") {
    return [
      "Grave a voz em lugar silencioso, perto do celular.",
      "As imagens são do espaço da clínica, com luz natural.",
      "Enquadramento estável, na vertical, mostrando o ambiente.",
      "Ordem: gancho, desenvolvimento e chamada, sem esticar.",
    ];
  }
  return [
    "Alguém da clínica fala olhando para a lente, celular na vertical.",
    "Enquadramento estável, luz natural de frente, sem contraluz.",
    "Ordem: gancho, desenvolvimento e chamada.",
    "Ritmo curto, de reels ou story, sem cronômetro na fala.",
  ];
}

function mockPiece(format, theme, profile, recordingMode, method) {
  const t = (theme && theme.trim()) || "o cuidado premium da clínica";
  const nicho = profile?.nicho ? ` Nicho: ${profile.nicho}.` : "";
  const drafted = suggestLine(method?.structure || "post", profile);
  const caption = `${drafted.line} Tema: ${t}.${nicho}`.trim();
  if (format === "post") {
    return {
      caption,
      imagePrompt: colorHint(profile, t),
    };
  }
  if (format === "carousel") {
    return {
      caption,
      slides: [
        { title: "Abertura", imagePrompt: colorHint(profile, t) },
        { title: "Desenvolvimento", imagePrompt: colorHint(profile, `um detalhe do ambiente ligado a ${t}`) },
        { title: "Fechamento", imagePrompt: colorHint(profile, "um convite sóbrio para conhecer o espaço") },
      ],
    };
  }
  const mode = recordingMode === "narracao" ? "narracao" : "camera";
  return {
    script: {
      hook: `Gancho de exemplo sobre ${t}, no tom da clínica${profile?.nicho ? ` (${profile.nicho})` : ""}.`,
      body: drafted.line,
      cta: "Convite sóbrio para conhecer a clínica.",
    },
    recording: { mode, tips: videoTips(mode) },
  };
}

export { FORMATS };
