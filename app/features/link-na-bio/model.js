// Link na bio — rascunho seguro da página da clínica.
// Quatro portas da mesma presença: site, Instagram, Google e WhatsApp.
// Sem faturamento, sem antes e depois, sem número inventado, sem dado de paciente.

// Capas: fotos reais já no repo (Unsplash, espaços, 800px). Não são fotos da clínica.
// recepcao    ← assets/img/stock/ave-amb1-v18-800.webp
// espera      ← assets/img/stock/ave-amb2-v18-800.webp
// sala        ← assets/img/stock/ver-amb1-v18-800.webp
// consultorio ← assets/img/stock/sol-amb2-v18-800.webp
export const COVERS = [
  { id: "recepcao", label: "Recepção", src: "/features/link-na-bio/covers/recepcao.webp" },
  { id: "espera", label: "Espera", src: "/features/link-na-bio/covers/espera.webp" },
  { id: "sala", label: "Sala", src: "/features/link-na-bio/covers/sala.webp" },
  { id: "consultorio", label: "Consultório", src: "/features/link-na-bio/covers/consultorio.webp" },
];

export const LINK_IDS = ["whatsapp", "site", "instagram", "google"];

const DEFAULT_LABELS = {
  whatsapp: "WhatsApp",
  site: "Site",
  instagram: "Instagram",
  google: "Google",
};

const TEXT_RULES = [
  { re: /faturament|faturar|receita\s+mensal|\blucro\b/i, message: "Sem promessa de faturamento." },
  { re: /antes\s*(e|&|\/)\s*depois|before\s*and\s*after/i, message: "Sem antes e depois." },
  { re: /R\$/i, message: "Sem valor em dinheiro." },
  { re: /\d+\s*%/, message: "Sem número de resultado." },
  { re: /\b\d+\s*(mil|reais|pacientes|clientes|seguidores|avalia[cç][oõ]es|estrelas)\b/i, message: "Sem número inventado." },
  { re: /\b(prontu[aá]rio|laudo|cpf)\b/i, message: "Sem dado de paciente." },
  { re: /\d{3}\.\d{3}\.\d{3}-\d{2}/, message: "Sem dado de paciente." },
];

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function coversFor(nicho) {
  const all = COVERS.map((c) => ({ ...c }));
  const prefer = nicho === "odontologia" ? "consultorio" : nicho === "estetica" ? "sala" : "";
  if (!prefer) return all;
  const i = all.findIndex((c) => c.id === prefer);
  if (i > 0) {
    const [item] = all.splice(i, 1);
    all.unshift(item);
  }
  return all;
}

export function emptyDraft(name = "") {
  return {
    display_name: cleanText(name, 60),
    line: "",
    cover: "",
    links: LINK_IDS.map((id) => ({
      id,
      label: DEFAULT_LABELS[id],
      url: "",
      visible: true,
    })),
    highlights: ["", "", ""],
    alignment: { site: false, instagram: false, google: false },
  };
}

export function sanitizeDraft(input) {
  const errors = [];
  const src = input && typeof input === "object" ? input : {};

  const display_name = cleanText(src.display_name, 60);
  const line = cleanText(src.line, 110);
  let cover = typeof src.cover === "string" ? src.cover.trim() : "";
  if (cover && !COVERS.some((c) => c.id === cover)) cover = "";

  pushText(errors, "display_name", display_name);
  pushText(errors, "line", line);

  const incoming = Array.isArray(src.links) ? src.links : [];
  const byId = new Map();
  const order = [];
  for (const item of incoming) {
    if (!item || typeof item !== "object") continue;
    if (!LINK_IDS.includes(item.id) || byId.has(item.id)) continue;
    byId.set(item.id, item);
    order.push(item.id);
  }
  for (const id of LINK_IDS) if (!order.includes(id)) order.push(id);

  const links = order.map((id) => {
    const item = byId.get(id) || {};
    const label = cleanText(item.label, 32) || DEFAULT_LABELS[id];
    pushText(errors, "links." + id, label);
    const rawUrl = typeof item.url === "string" ? item.url.trim().slice(0, 300) : "";
    const norm = normalizeUrl(id, rawUrl);
    if (norm.error) errors.push({ field: "links." + id, message: norm.error });
    return {
      id,
      label,
      url: norm.error ? "" : norm.url,
      visible: item.visible !== false,
    };
  });

  const rawH = Array.isArray(src.highlights) ? src.highlights : [];
  const highlights = [0, 1, 2].map((i) => {
    const text = cleanText(rawH[i], 72);
    if (text) pushText(errors, "highlights." + i, text);
    return text;
  });

  const al = src.alignment && typeof src.alignment === "object" ? src.alignment : {};
  const alignment = {
    site: al.site === true,
    instagram: al.instagram === true,
    google: al.google === true,
  };

  return {
    errors,
    draft: { display_name, line, cover, links, highlights, alignment },
  };
}

export function contentHash(draft) {
  return JSON.stringify({
    display_name: draft.display_name || "",
    line: draft.line || "",
    cover: draft.cover || "",
    links: (draft.links || []).map((l) => ({
      id: l.id,
      label: l.label || "",
      url: l.url || "",
      visible: !!l.visible,
    })),
    highlights: [0, 1, 2].map((i) => (draft.highlights && draft.highlights[i]) || ""),
  });
}

export function editorDraft(draft) {
  return {
    display_name: draft.display_name || "",
    line: draft.line || "",
    cover: draft.cover || "",
    links: (draft.links || []).map((l) => ({
      id: l.id,
      label: l.label || DEFAULT_LABELS[l.id] || "",
      visible: l.visible !== false,
      url: editorValue(l),
    })),
    highlights: [0, 1, 2].map((i) => (draft.highlights && draft.highlights[i]) || ""),
    alignment: {
      site: draft.alignment?.site === true,
      instagram: draft.alignment?.instagram === true,
      google: draft.alignment?.google === true,
    },
  };
}

export function reviewState({ reviewedAt, contentHash: hash, reviewedHash, now = Date.now() }) {
  if (!reviewedAt) return { state: "none", drifted: false };
  const drifted = !!(reviewedHash && hash !== reviewedHash);
  if (drifted || !reviewedHash) return { state: "drift", drifted: true };
  const age = now - new Date(reviewedAt).getTime();
  if (Number.isNaN(age) || age >= WEEK_MS) return { state: "stale", drifted: false };
  return { state: "fresh", drifted: false };
}

export function readyIssues(draft, state) {
  const issues = [];
  if (!state || state.state !== "fresh") issues.push("Revise a página antes de marcar como pronta.");
  if (cleanText(draft.display_name, 60).length < 2) issues.push("Escreva o nome da clínica na bio.");
  const open = (draft.links || []).some((l) => l.visible && l.url);
  if (!open) issues.push("Deixe ao menos uma porta visível com destino.");
  return issues;
}

function editorValue(link) {
  if (!link || !link.url) return "";
  if (link.id === "whatsapp") {
    const digits = String(link.url).replace(/\D/g, "");
    return formatBrPhone(digits) || "";
  }
  if (link.id === "instagram") {
    const match = String(link.url).match(/instagram\.com\/([A-Za-z0-9._]+)/i);
    if (match) return "@" + match[1];
  }
  return String(link.url);
}

function formatBrPhone(digits) {
  let d = digits;
  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) d = d.slice(2);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return "";
}

function normalizeUrl(id, raw) {
  if (!raw) return { url: "" };
  if (id === "whatsapp") return normalizeWhatsapp(raw);
  if (id === "instagram") return normalizeInstagram(raw);
  return normalizeHttp(raw, id === "site");
}

function normalizeWhatsapp(raw) {
  const fromUrl = String(raw).match(/wa\.me\/(\d+)/i);
  let n = (fromUrl ? fromUrl[1] : String(raw)).replace(/\D/g, "");
  if (!n) return { error: "Informe o WhatsApp com DDD." };
  const withCountry = n.startsWith("55") && (n.length === 12 || n.length === 13);
  const national = n.length === 10 || n.length === 11;
  if (!withCountry && national) n = "55" + n;
  else if (!withCountry) return { error: "Informe o WhatsApp com DDD." };
  return { url: "https://wa.me/" + n };
}

function normalizeInstagram(raw) {
  let v = String(raw).trim();
  v = v.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
  v = v.replace(/[/?#].*$/, "");
  v = v.replace(/^@+/, "");
  if (!/^[A-Za-z0-9._]{1,30}$/.test(v)) return { error: "Use o @ do perfil da clínica." };
  return { url: "https://instagram.com/" + v };
}

function normalizeHttp(raw, requireDot) {
  const v = String(raw).trim();
  if (/^(javascript|data):/i.test(v)) return { error: "Link inválido." };
  let url;
  try {
    url = new URL(/^https?:\/\//i.test(v) ? v : "https://" + v);
  } catch {
    return { error: "Link inválido." };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return { error: "Link inválido." };
  if (url.username || url.password) return { error: "Link inválido." };
  if (requireDot && !url.hostname.includes(".")) return { error: "Link inválido." };
  return { url: url.toString() };
}

function pushText(errors, field, value) {
  if (!value) return;
  for (const rule of TEXT_RULES) {
    if (rule.re.test(value)) {
      errors.push({ field, message: rule.message });
      return;
    }
  }
}

function cleanText(v, max) {
  if (typeof v !== "string") return "";
  return v.replace(/\s+/g, " ").trim().slice(0, max);
}
