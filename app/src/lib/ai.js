// Estúdio de post: geração com IA (OpenAI-compatível) e fallback mock.
// A chave vem SÓ do ambiente (env.AI_API_KEY). Sem chave => exemplo (mock),
// para o app funcionar sem publicar. Regras de marca aplicadas ao que a IA gera.
import { chooseCopyMethod, structureForFormat, suggestLine } from "./copy-method.js";

const FORMATS = new Set(["post", "carousel", "video"]);

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
  "Regras inegociáveis para TUDO que você gerar:",
  "- Sem promessa de faturamento, lucro ou retorno financeiro.",
  "- Sem 'antes e depois'.",
  "- Sem dado de saúde, diagnóstico ou procedimento clínico específico.",
  "- Sem número inventado (métrica, preço, estatística). Se não foi informado, não cite.",
  "- Nada aqui publica sozinho: é um rascunho para aprovação humana.",
  "- Português do Brasil, tom premium e humano.",
].join("\n");

function systemPrompt(profile, method) {
  const voice = method
    ? `Método de copy desta peça: ${method.name} (${method.note}). Fale como "nosso time" ou "a gente".`
    : `Fale como "nosso time" ou "a gente".`;
  return `Você é o estúdio de conteúdo da Prime Studio, criando peças para clínicas premium, dentro do Método PRIME.\n\n${voice}\n\n${brandBlock(
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

// --- Geração ---------------------------------------------------------------
export async function generatePiece(env, { format, theme, profile, recordingMode, structure } = {}) {
  if (!FORMATS.has(format)) throw new Error("formato inválido");
  const mode = recordingMode === "narracao" || recordingMode === "camera" ? recordingMode : "";
  const method = chooseCopyMethod(structure || structureForFormat(format));
  const key = env?.AI_API_KEY;
  if (!key) {
    const output = mockPiece(format, theme, profile, mode, method);
    return { source: "mock", output: { ...output, copyMethod: method, warnings: brandGuard(output) } };
  }
  const output = await callModel(env, key, { format, theme, profile, recordingMode: mode, method });
  return { source: "ia", output: { ...output, copyMethod: method, warnings: brandGuard(output) } };
}

async function callModel(env, key, { format, theme, profile, recordingMode, method }) {
  const base = env.AI_BASE_URL || "https://api.openai.com/v1";
  const model = env.AI_MODEL || "gpt-4o-mini";
  const body = {
    model,
    temperature: 0.8,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt(profile, method) },
      {
        role: "user",
        content: `${formatInstruction(format, recordingMode)}\n\nTema: ${theme || "conteúdo institucional da clínica"}\nResponda apenas o JSON.`,
      },
    ],
  };
  const resp = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    throw new Error(`IA respondeu ${resp.status}: ${detail.slice(0, 200)}`);
  }
  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content || "{}";
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("IA retornou JSON inválido");
  }
  return normalize(format, parsed, recordingMode);
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

// --- Mock (sem chave de IA) ------------------------------------------------
// Exemplo determinístico e dentro das regras de marca, para o app rodar offline.
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
  const exemplo = "Rascunho de exemplo — configure a chave de IA para gerar de verdade.";
  const drafted = suggestLine(method?.structure || "post", profile);
  const caption = `${drafted.line} Tema: ${t}.${nicho} (${exemplo})`;
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
      cta: `Convite sóbrio para conhecer a clínica. (${exemplo})`,
    },
    recording: { mode, tips: videoTips(mode) },
  };
}

export { FORMATS };
