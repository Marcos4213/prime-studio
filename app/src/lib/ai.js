// Estúdio de post: geração com IA (OpenAI-compatível) e fallback mock.
// A chave vem SÓ do ambiente (env.AI_API_KEY). Sem chave => exemplo (mock),
// para o app funcionar sem publicar. Regras de marca aplicadas ao que a IA gera.

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
    profile.tone ? `Tom da clínica: ${profile.tone}` : "",
    colors.length ? `Cores da marca: ${colors.join(", ")}` : "",
    fonts.length ? `Fontes da marca: ${fonts.join(", ")}` : "",
    profile.avoid ? `O que a clínica NUNCA diz: ${profile.avoid}` : "",
    profile.highlights ? `O que destaca a clínica: ${profile.highlights}` : "",
    profile.nicho ? `Nicho: ${profile.nicho}` : "",
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

function systemPrompt(profile) {
  return `Você é o estúdio de conteúdo da Prime Studio, criando peças de Instagram para clínicas premium.\n\n${brandBlock(
    profile
  )}\n\n${RULES}`;
}

function formatInstruction(format) {
  if (format === "post") {
    return 'Formato: POST único. Responda JSON: {"caption": string, "imagePrompt": string}. O imagePrompt descreve a arte no visual e nas cores da clínica.';
  }
  if (format === "carousel") {
    return 'Formato: CARROSSEL. Responda JSON: {"caption": string, "slides": [{"title": string, "imagePrompt": string}]}. Entre 3 e 6 slides, com começo, desenvolvimento e fechamento. Um imagePrompt por slide, no mesmo padrão visual.';
  }
  return 'Formato: VÍDEO (reels/story). Responda JSON: {"script": {"hook": string, "body": string, "cta": string}, "recording": {"mode": "camera" | "narracao", "tips": [string]}}. SEM prompt de imagem. mode=camera (pessoa falando) ou mode=narracao (narração sobre imagem/vídeo). tips com orientação simples de captação.';
}

// --- Geração ---------------------------------------------------------------
export async function generatePiece(env, { format, theme, profile }) {
  if (!FORMATS.has(format)) throw new Error("formato inválido");
  const key = env.AI_API_KEY;
  if (!key) {
    const output = mockPiece(format, theme, profile);
    return { source: "mock", output: { ...output, warnings: brandGuard(output) } };
  }
  const output = await callModel(env, key, { format, theme, profile });
  return { source: "ia", output: { ...output, warnings: brandGuard(output) } };
}

async function callModel(env, key, { format, theme, profile }) {
  const base = env.AI_BASE_URL || "https://api.openai.com/v1";
  const model = env.AI_MODEL || "gpt-4o-mini";
  const body = {
    model,
    temperature: 0.8,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt(profile) },
      {
        role: "user",
        content: `${formatInstruction(format)}\n\nTema: ${theme || "conteúdo institucional da clínica"}\nResponda apenas o JSON.`,
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
  return normalize(format, parsed);
}

// Garante a forma esperada por formato, mesmo se a IA variar.
function normalize(format, p) {
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
  const mode = rec.mode === "narracao" ? "narracao" : "camera";
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
function mockPiece(format, theme, profile) {
  const t = (theme && theme.trim()) || "o cuidado premium da clínica";
  const nicho = profile?.nicho ? ` (${profile.nicho})` : "";
  if (format === "post") {
    return {
      caption: `Exemplo de legenda no tom da clínica${nicho} sobre ${t}. Uma mensagem sóbria, humana e premium, que apresenta o cuidado sem promessas e sem números. (Rascunho de exemplo — configure a chave de IA para gerar de verdade.)`,
      imagePrompt: `Fotografia real, premium, clima escuro com detalhes dourados, foco em ${t}. Sem texto sobreposto na imagem. Respeitar as cores da marca da clínica.`,
    };
  }
  if (format === "carousel") {
    return {
      caption: `Exemplo de carrossel sobre ${t}, no tom da clínica${nicho}. (Rascunho de exemplo — configure a chave de IA para gerar de verdade.)`,
      slides: [
        { title: "Abertura", imagePrompt: `Capa premium, escuro com dourado, tema: ${t}. Foto real, sem texto na imagem.` },
        { title: "Desenvolvimento", imagePrompt: `Detalhe do ambiente da clínica ligado a ${t}. Foto real, paleta da marca.` },
        { title: "Fechamento", imagePrompt: `Convite sóbrio ao contato, clima acolhedor e premium, paleta da marca.` },
      ],
    };
  }
  return {
    script: {
      hook: `Gancho de exemplo sobre ${t}, no tom da clínica${nicho}.`,
      body: `Desenvolvimento curto e humano, apresentando o cuidado da clínica sem promessas e sem números.`,
      cta: `Convite sóbrio para conhecer a clínica. (Rascunho de exemplo — configure a chave de IA.)`,
    },
    recording: {
      mode: "camera",
      tips: [
        "Grave na horizontal ou vertical conforme o destino, com o celular estável.",
        "Luz natural de frente; evite contraluz.",
        "Fale a frase de gancho olhando para a câmera, pausado.",
      ],
    },
  };
}

export { FORMATS };
