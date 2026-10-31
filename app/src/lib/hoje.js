// Estado da peça de hoje e a semana da presença.
// Só marca o dia que a tela realmente recebeu. Sem eixo, sem contagem, sem faturamento.

const WEEK = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const TZ = "America/Sao_Paulo";

export function saoPauloDay(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function weekdayIndex(date) {
  const w = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(date);
  const i = WEEK[w];
  if (i == null) throw new Error("dia invalido");
  return i;
}

function anchor(day) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 15, 0, 0));
}

export function weekBars(rows, now = new Date()) {
  const seen = new Set();
  for (const row of rows || []) {
    if (!row || !row.day) continue;
    const on = ["site", "instagram", "google", "bio"].some((key) => Number(row[key]) === 1);
    if (on) seen.add(String(row.day));
  }
  const today = anchor(saoPauloDay(now));
  const index = weekdayIndex(today);
  const mondayOffset = index === 0 ? -6 : 1 - index;
  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() + mondayOffset);
  const bars = [];
  for (let i = 0; i < 7; i++) {
    const dt = new Date(monday);
    dt.setUTCDate(monday.getUTCDate() + i);
    const day = saoPauloDay(dt);
    bars.push({ day, label: LABELS[i], visto: seen.has(day) });
  }
  return bars;
}

export function pieceEstado(items, todayKey) {
  const todays = (items || []).filter((item) => saoPauloDay(new Date(item.created_at)) === todayKey);
  if (!todays.length) return { id: "aberto", label: "Em aberto" };
  if (todays.some((item) => item.status === "aprovado")) return { id: "vista", label: "Já vista" };
  if (todays.some((item) => item.status === "rascunho")) return { id: "pronta", label: "Pronta para o OK" };
  return { id: "aberto", label: "Em aberto" };
}
