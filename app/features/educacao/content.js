// Trilha curta da Central. Tom do nosso time: premium e humanizado.
// Sem número inventado, sem promessa de faturamento, sem antes e depois, sem dado de saúde.

export const DAY_ORDER = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];

const WEEKDAY_TO_ID = {
  Sun: "dom",
  Mon: "seg",
  Tue: "ter",
  Wed: "qua",
  Thu: "qui",
  Fri: "sex",
  Sat: "sab",
};

export function nextDayId(id) {
  const i = DAY_ORDER.indexOf(id);
  if (i < 0) return DAY_ORDER[0];
  return DAY_ORDER[(i + 1) % DAY_ORDER.length];
}

/** Relógio da clínica (America/Sao_Paulo), não o UTC do Worker. */
export function clinicClock(date = new Date()) {
  const tz = "America/Sao_Paulo";
  const wd = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(date);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value || "";
  return { id: WEEKDAY_TO_ID[wd] || "seg", iso: `${get("year")}-${get("month")}-${get("day")}` };
}

export const DAYS = [
  {
    id: "seg",
    weekday: "Segunda",
    theme: "Posicionamento",
    title: "Uma frase só",
    em: "frase só",
    photo: "presenca",
    alt: "Recepção clara, com balcão de pedra, espelho em arco e orquídeas brancas.",
    paragraphs: [
      "Posicionamento cabe numa frase: o que a clínica faz, para quem, e o convite para o próximo passo. Sem enfeite. Sem lista de tudo o que ela oferece.",
      "Essa frase vira a bio, a primeira linha do site e o começo de qualquer peça. Se cada canal diz uma coisa, a presença se desfaz.",
    ],
    steps: [
      "Escreva a frase em três partes: o que a clínica faz, para quem, e o próximo passo.",
      "Leia em voz alta. Se precisar explicar, ainda não está pronta.",
      "Guarde a frase no tom da marca, na Central.",
    ],
    studio: false,
  },
  {
    id: "ter",
    weekday: "Terça",
    theme: "Tom",
    title: "Como a clínica fala",
    em: "a clínica fala",
    photo: "tom",
    alt: "Sala clara com sofá, poltrona e dois espelhos redondos na parede.",
    paragraphs: [
      "O tom é a voz da clínica quando ninguém improvisa: sóbria, acolhedora, direta. Também é a lista do que ela nunca diz.",
      "O estúdio acerta mais quando essa voz está escrita. Cada correção afina a próxima peça.",
    ],
    steps: [
      "Anote três palavras que combinam com a clínica.",
      "Anote o que fica de fora: promessa de resultado, história de quem foi atendido, foto de resultado.",
      "Salve isso na memória da marca.",
    ],
    studio: false,
  },
  {
    id: "qua",
    weekday: "Quarta",
    theme: "Conteúdo",
    title: "O assunto já passou por aqui",
    em: "já passou por aqui",
    photo: "detalhe",
    alt: "Bandeja com frascos, tecido claro e um vaso pequeno, detalhe de um espaço.",
    paragraphs: [
      "O post trava quando a clínica procura um tema genérico. O assunto bom já aconteceu: a luz da sala, o cuidado na chegada, a pergunta que se repete.",
      "Quem é atendido não vira conteúdo. O espaço e a rotina já bastam.",
    ],
    steps: [
      "Escolha um detalhe real da clínica: um canto, um gesto, uma pergunta frequente.",
      "Leve esse tema ao estúdio e peça a peça no tom da clínica.",
      "Ajuste uma frase até soar como a voz de vocês.",
    ],
    studio: true,
  },
  {
    id: "qui",
    weekday: "Quinta",
    theme: "Presença",
    title: "Prova com cuidado",
    em: "com cuidado",
    photo: "calma",
    alt: "Sala de espera clara, com árvore no centro, bancos baixos e mesas brancas.",
    paragraphs: [
      "Reputação é o que dá para ver sem a clínica se explicar: avaliação respondida, perfil do Google completo, depoimento com autorização.",
      "Cuidado também é o que fica de fora. História de quem foi atendido não entra. Foto de resultado não entra.",
    ],
    steps: [
      "Confira horário, fotos do espaço e telefone no perfil do Google.",
      "Responda uma avaliação com educação, sem detalhe de atendimento.",
      "Se for usar um depoimento, confirme a autorização antes.",
    ],
    studio: false,
  },
  {
    id: "sex",
    weekday: "Sexta",
    theme: "Conteúdo",
    title: "Uma ideia, três formatos",
    em: "três formatos",
    photo: "presenca",
    alt: "Recepção clara, com balcão de pedra, espelho em arco e orquídeas brancas.",
    paragraphs: [
      "A clínica não precisa de assunto novo todo dia. Uma ideia boa vira post, carrossel e story. O tom fica. O formato muda.",
      "A gente monta a peça no estúdio. A clínica decide o que vai ao ar. Nada publica sozinho.",
    ],
    steps: [
      "Escolha um tema que a clínica já viveu nesta semana.",
      "No estúdio, peça o post.",
      "Peça a mesma ideia em carrossel ou em vídeo.",
    ],
    studio: true,
  },
  {
    id: "sab",
    weekday: "Sábado",
    theme: "Constância",
    title: "O ritmo que a clínica aguenta",
    em: "a clínica aguenta",
    photo: "tom",
    alt: "Sala clara com sofá, poltrona e dois espelhos redondos na parede.",
    paragraphs: [
      "Constância premium é ritmo, não volume. Uma peça no tom da clínica vale mais do que uma sequência que não se parece.",
      "A presença trabalha quando o gesto cabe na agenda. Um formato. Um tema. Uma peça. E amanhã de novo.",
    ],
    steps: [
      "Escolha o formato que a clínica consegue produzir sem correria.",
      "Deixe esse formato como o padrão desta semana.",
      "Feche uma peça no estúdio e pare por hoje.",
    ],
    studio: true,
  },
  {
    id: "dom",
    weekday: "Domingo",
    theme: "Presença",
    title: "Olhar o conjunto",
    em: "o conjunto",
    photo: "sala",
    alt: "Sala de estar com sofá claro, poltronas e um espelho redondo.",
    paragraphs: [
      "Antes de produzir, a gente olha. Instagram, Google, site e o link na bio precisam contar a mesma história.",
      "A história é curta: o que a clínica faz, para quem, e qual é o próximo passo. Se um canal destoa, a presença trabalha contra a clínica.",
    ],
    steps: [
      "Abra os quatro no celular, um depois do outro.",
      "Anote só o que não bate com a frase da clínica.",
      "Na segunda, a leitura de posicionamento ajuda a reescrever essa frase.",
    ],
    studio: false,
  },
];

export const PRIME = [
  {
    id: "p",
    letter: "P",
    name: "Perfil",
    line: "Uma olhada diz o que a clínica faz, para quem e qual é o próximo passo.",
    title: "O site é a recepção. O Instagram é a vitrine.",
    em: "a vitrine.",
    photo: "presenca",
    alt: "Recepção clara, com balcão de pedra, espelho em arco e orquídeas brancas.",
    paragraphs: [
      "Perfil premium não explica demais. Em uma olhada dá para saber o que a clínica faz, para quem e como dar o próximo passo.",
      "A bio carrega a frase da clínica. Os destaques seguem a mesma capa. Os posts fixos apresentam o trabalho. O link não se perde no caminho.",
    ],
    steps: [
      "Reescreva a bio com a frase da clínica.",
      "Deixe os destaques com capa no mesmo estilo.",
      "Confira se o link leva a um único próximo passo.",
    ],
    studio: false,
  },
  {
    id: "r",
    letter: "R",
    name: "Reputação",
    line: "A prova que aparece, sem expor quem foi atendido.",
    title: "A prova que fala antes",
    em: "fala antes",
    photo: "calma",
    alt: "Sala de espera clara, com árvore no centro, bancos baixos e mesas brancas.",
    paragraphs: [
      "Quem ainda não conhece a clínica procura sinal de cuidado. Avaliação recente, resposta educada, depoimento autorizado.",
      "A satisfação que não aparece não trabalha pela presença. E o que é íntimo do atendimento continua íntimo.",
    ],
    steps: [
      "Peça uma avaliação com uma mensagem curta, só a quem já autorizou o contato.",
      "Responda o que estiver sem resposta, sem contar o caso.",
      "Reúna depoimentos autorizados num lugar só.",
    ],
    studio: false,
  },
  {
    id: "i",
    letter: "I",
    name: "Imagem",
    line: "A mesma marca em qualquer peça, mesmo sem o logo.",
    title: "Parecer a mesma clínica",
    em: "a mesma clínica",
    photo: "sala",
    alt: "Sala de estar com sofá claro, poltronas e um espelho redondo.",
    paragraphs: [
      "Imagem premium é consistência: poucas cores, duas fontes, foto real do espaço. Cada peça parece da clínica, mesmo sem o logo.",
      "A tendência da semana não manda na marca. Se a peça pudesse ser de qualquer uma, ainda não está pronta.",
    ],
    steps: [
      "Defina duas ou três cores e duas fontes e use em tudo.",
      "Troque imagem genérica por foto real do espaço.",
      "Antes de aprovar, pergunte: parece a nossa clínica?",
    ],
    studio: true,
  },
  {
    id: "m",
    letter: "M",
    name: "Marca no site",
    line: "Um endereço que a clínica controla.",
    title: "Um endereço da clínica",
    em: "da clínica",
    photo: "sala",
    alt: "Sala de estar com sofá claro, poltronas e um espelho redondo.",
    paragraphs: [
      "O Instagram é terreno de outro. O alcance muda, a conta não é da clínica. O site é o endereço que ela controla.",
      "No celular ele abre rápido, cada serviço principal tem a sua página, e o próximo passo está visível o tempo todo.",
    ],
    steps: [
      "Confira se o domínio e o e-mail são da marca.",
      "Veja se cada serviço principal tem a sua página.",
      "Abra o site no celular e ache o próximo passo sem procurar.",
    ],
    studio: false,
  },
  {
    id: "e",
    letter: "E",
    name: "Escala",
    line: "Presença que a clínica consegue repetir.",
    title: "Presença que se sustenta",
    em: "se sustenta",
    photo: "tom",
    alt: "Sala clara com sofá, poltrona e dois espelhos redondos na parede.",
    paragraphs: [
      "Escala, aqui, não é volume. É a clínica repetir o cuidado: a mesma voz, uma resposta que não esfria, um ritmo de conteúdo que cabe na agenda.",
      "Anúncio vem depois que perfil, reputação, imagem e site dizem a mesma coisa. Antes disso, a gente não acelera por cima de uma presença frouxa.",
    ],
    steps: [
      "Combine quem responde e como a conversa segue.",
      "Mantenha o conteúdo no ritmo que a clínica aguenta.",
      "Use o estúdio para não recomeçar a frase do zero.",
    ],
    studio: true,
  },
];

export function dayById(id) {
  return DAYS.find((d) => d.id === id) || null;
}

export function primeById(id) {
  return PRIME.find((p) => p.id === id) || null;
}
