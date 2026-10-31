// Ângulo do dia no fuso da clínica. Sem métrica: só o tema que muda amanhã.

export const TZ = "America/Sao_Paulo";

export const ANGLES = [
  { label: "Domingo", angle: "O silêncio do espaço antes de abrir" },
  { label: "Segunda", angle: "Como a clínica recebe quem chega" },
  { label: "Terça", angle: "Um detalhe do ambiente" },
  { label: "Quarta", angle: "A rotina de um dia na clínica" },
  { label: "Quinta", angle: "O cuidado no acolhimento" },
  { label: "Sexta", angle: "O que torna o atendimento humano" },
  { label: "Sábado", angle: "Um convite sóbrio para conhecer o espaço" },
];

const WEEK = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function dayKey(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function weekdayIndex(date) {
  const w = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(date);
  const i = WEEK[w];
  if (i == null) throw new Error("dia invalido");
  return i;
}

export function dailyPair(date = new Date()) {
  const i = weekdayIndex(date);
  return {
    todayKey: dayKey(date),
    today: ANGLES[i],
    tomorrow: ANGLES[(i + 1) % 7],
  };
}
