// Presença na tela: site, Instagram e Google.
// O link na bio continua gravado, fora desta tela. Não há métrica. O que não foi medido não vira número.

export const CHANNELS = [
  {
    id: "site",
    title: "Site",
    role: "Ser encontrada",
    line: "A casa da clínica na internet.",
    look: "Abrir o site e ver se a primeira tela ainda é a clínica.",
    photo: "/presenca/media/site.webp",
    photoAlt: "Recepção clara, com balcão, orquídeas e porta de vidro.",
    addressLabel: "Endereço",
    placeholder: "Endereço desta clínica",
    inputMode: "url",
  },
  {
    id: "instagram",
    title: "Instagram",
    role: "Ser lembrada",
    line: "Onde a clínica aparece no dia a dia.",
    look: "Abrir o perfil e ver o que está no ar.",
    photo: "/presenca/media/instagram.webp",
    photoAlt: "Bandeja com frascos, vela e tecido claro.",
    addressLabel: "Endereço",
    placeholder: "Endereço ou @perfil, se houver",
    inputMode: "text",
  },
  {
    id: "google",
    title: "Google",
    role: "Ser escolhida",
    line: "Onde a clínica é encontrada.",
    look: "Abrir o perfil do Google como quem busca a clínica.",
    photo: "/presenca/media/google.webp",
    photoAlt: "Sala de espera branca, com árvore e sofás baixos.",
    addressLabel: "Endereço",
    placeholder: "Endereço desta clínica",
    inputMode: "url",
  },
  {
    id: "bio",
    title: "Link na bio",
    role: "A porta única",
    line: "Um link que junta as outras portas.",
    look: "Abrir o link da bio e ver se os destinos estão lá.",
    addressLabel: "Endereço",
    placeholder: "Endereço desta clínica",
    inputMode: "url",
    photo: "/presenca/media/bio.webp",
    photoAlt: "Sala clara com sofás, poltronas e espelho redondo.",
  },
];

const ORDER = ["site", "instagram", "google", "bio"];
const DOORS = CHANNELS.filter((ch) => ch.id !== "bio");
const SPOKEN = {
  site: "o site",
  instagram: "o Instagram",
  google: "o Google",
  bio: "o link na bio",
};

export function isChannel(id) {
  return ORDER.includes(id);
}

export function saoPauloDay(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function saoPauloLabel(date = new Date()) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function normalizeAddress(id, raw) {
  const value = String(raw ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 300);
  if (!value) return { ok: true, value: "", href: null };
  if (/^(javascript|data|vbscript):/i.test(value)) return { ok: false };
  if (/\s/.test(value)) return { ok: true, value, href: null };

  if (id === "instagram") {
    const handle = value.match(/^@([A-Za-z0-9._]{1,30})$/);
    if (handle) {
      return { ok: true, value: `@${handle[1]}`, href: `https://instagram.com/${handle[1]}` };
    }
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    return { ok: true, value, href: null };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return { ok: false };
  if (!url.hostname) return { ok: false };
  if (url.username || url.password) return { ok: false };
  return { ok: true, value: url.toString(), href: url.toString() };
}

export function summarize(seenIds) {
  const ids = Array.isArray(seenIds) ? seenIds : [];
  const seen = DOORS.map((ch) => ch.id)
    .filter((id) => ids.includes(id))
    .map((id) => SPOKEN[id]);
  if (seen.length === 0) return "Nenhuma porta vista hoje.";
  if (seen.length === DOORS.length) return "As três portas vistas hoje.";
  if (seen.length === 1) return `Você viu ${seen[0]} hoje.`;
  if (seen.length === 2) return `Você viu ${seen[0]} e ${seen[1]} hoje.`;
  return `Você viu ${seen[0]}, ${seen[1]} e ${seen[2]} hoje.`;
}

export function daysLabel(n) {
  const days = Number(n);
  if (!Number.isInteger(days) || days <= 0) return "";
  if (days === 1) return "1 dia com olhar registrado.";
  return `${days} dias com olhar registrado.`;
}

export function buildView({ profile, look, days, clinic, now } = {}) {
  const channels = DOORS.map((ch) => {
    const stored = profile?.[ch.id] || "";
    const norm = normalizeAddress(ch.id, stored);
    const address = norm.ok ? norm.value : "";
    const href = norm.ok ? norm.href : null;
    return {
      id: ch.id,
      title: ch.title,
      role: ch.role,
      line: ch.line,
      look: ch.look,
      photo: ch.photo,
      photo_alt: ch.photoAlt,
      address_label: ch.addressLabel,
      placeholder: ch.placeholder,
      input_mode: ch.inputMode,
      address,
      href,
      seen: !!(look && Number(look[ch.id]) === 1),
      reading: "sem_leitura",
    };
  });
  return {
    ok: true,
    clinic: typeof clinic === "string" ? clinic : "",
    today: { date: saoPauloDay(now), label: saoPauloLabel(now) },
    summary: summarize(channels.filter((c) => c.seen).map((c) => c.id)),
    days_label: daysLabel(days),
    channels,
  };
}
