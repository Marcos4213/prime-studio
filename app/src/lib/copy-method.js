// Escolha do método de copy pela estrutura da peça.
// Sempre dentro do Método PRIME. A frase é da clínica ("a gente" / "nosso time").
// Sem promessa, sem número, sem antes e depois, sem simular resultado.

export const COPY_STRUCTURES = ["post", "bio", "link-na-bio", "anuncio", "whatsapp", "site"];

const METHODS = {
  AIDA: {
    id: "AIDA",
    name: "AIDA",
    note: "Atenção, interesse, desejo e ação, dentro do Método PRIME.",
    beats:
      "Atenção na primeira frase, sem abrir com você. Interesse num detalhe que está no perfil. Desejo de conhecer a clínica, nunca um resultado clínico. Ação: um convite sóbrio, um passo só.",
  },
  PAS: {
    id: "PAS",
    name: "PAS",
    note: "Problema, agitação e solução, dentro do Método PRIME.",
    beats:
      "Problema: a dificuldade de escolher uma clínica com clareza, sem sintoma e sem diagnóstico. Agitação: o incômodo de decidir no escuro, sem medo clínico. Solução: a clínica como presença clara e um convite sóbrio.",
  },
  StoryBrand: {
    id: "StoryBrand",
    name: "StoryBrand",
    note: "A clínica entra como guia, dentro do Método PRIME.",
    beats:
      "Quem chega é a pessoa. A clínica é o guia e fala como a gente ou nosso time. O plano é curto. A chamada é um passo. Sem vilão de saúde.",
  },
  "4U": {
    id: "4U",
    name: "4U",
    note: "Útil, único, ultraespecífico e urgente sem número, dentro do Método PRIME.",
    beats:
      "Útil: o que a clínica faz. Único: o diferencial do perfil, se houver. Ultraespecífico: cidade e especialidade do perfil, sem inventar campo vazio. Urgente: o próximo passo, sem escassez, sem prazo e sem número.",
  },
};

const BY_STRUCTURE = {
  post: {
    method: "AIDA",
    why: "Dentro do Método PRIME. No feed, a primeira frase segura o scroll.",
    job: "Feed, carrossel ou reels. Legenda curta. A primeira frase segura o scroll. As telas ou o roteiro avançam até um convite.",
  },
  bio: {
    method: "4U",
    why: "Dentro do Método PRIME. A bio tem de ser útil, única e específica.",
    job: "Bio do Instagram, até quatro linhas curtas. Cabe numa leitura de perfil.",
  },
  "link-na-bio": {
    method: "StoryBrand",
    why: "Dentro do Método PRIME. Quem chegou já clicou. A clínica guia.",
    job: "Uma frase sob o nome. Quem já clicou. As quatro portas (site, Instagram, Google e WhatsApp) são o plano. Não repita um anúncio.",
  },
  anuncio: {
    method: "PAS",
    why: "Dentro do Método PRIME. No anúncio frio, o problema abre a peça.",
    job: "Anúncio frio, para quem ainda não conhece a clínica. Sem agitar saúde.",
  },
  whatsapp: {
    method: "AIDA",
    why: "Dentro do Método PRIME. Na conversa, a primeira linha cabe na prévia.",
    job: "Mensagem de duas a quatro linhas. A primeira cabe na prévia da notificação. Tom de conversa, não de anúncio. Um pedido: responder.",
  },
  site: {
    method: "StoryBrand",
    why: "Dentro do Método PRIME. Na primeira dobra, a clínica é o guia.",
    job: "Primeira dobra do site: uma frase de título e uma de apoio. Sem texto longo.",
  },
};

export function structureForFormat(format) {
  if (format === "post" || format === "carousel" || format === "video") return "post";
  if (BY_STRUCTURE[format]) return format;
  return "post";
}

export function chooseCopyMethod(structure) {
  const key = BY_STRUCTURE[structure] ? structure : "post";
  const spec = BY_STRUCTURE[key];
  const method = METHODS[spec.method];
  return {
    id: method.id,
    name: method.name,
    note: method.note,
    beats: method.beats,
    job: spec.job,
    why: spec.why,
    structure: key,
    prime: "Método PRIME",
  };
}

export function copyMethodCatalog() {
  return COPY_STRUCTURES.map((structure) => chooseCopyMethod(structure));
}

function bit(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function clip(value, max) {
  const text = bit(value);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const sp = cut.lastIndexOf(" ");
  return (sp > 24 ? cut.slice(0, sp) : cut).trim();
}

// Frase de trabalho no método escolhido. Não inventa número nem resultado.
export function suggestLine(structure, profile = {}) {
  const method = chooseCopyMethod(structure);
  const city = clip(profile.cidade, 40);
  const tom = clip(profile.tom || profile.tone, 48);
  const diff = clip(profile.diferenciais || profile.highlights, 80);
  const spec = clip(profile.especialidades, 80);
  const where = city ? ` em ${city}` : "";
  const mark = diff ? `, com ${diff}` : "";
  const voice = tom ? ` No tom ${tom}.` : "";
  const care = spec ? `A gente cuida de ${spec}` : "A gente cuida do detalhe";
  let line = "";
  if (method.structure === "whatsapp") {
    line = `Aqui é o nosso time${where}. ${care}${mark}. Se quiser conhecer a clínica, responda esta mensagem.${voice}`;
  } else if (method.structure === "bio") {
    const who = spec || "Cuidado da clínica";
    const unique = diff ? `${diff}. ` : "";
    line = `${who}${where}. ${unique}Fale com o nosso time.${voice}`;
  } else if (method.structure === "anuncio") {
    line = `Escolher uma clínica no escuro cansa. A gente mostra o espaço${where}${mark}. O caminho é conhecer o nosso time.${voice}`;
  } else if (method.structure === "link-na-bio") {
    line = `Nosso time guia a visita${where}${mark}. O plano cabe nas quatro portas.${voice}`;
  } else if (method.structure === "site") {
    line = `Quem chega encontra o nosso time${where}. A gente mostra o espaço${mark} e deixa o caminho curto.${voice}`;
  } else {
    const interest = spec || "o cuidado no detalhe";
    line = `A gente abre a porta do espaço${where}${mark}. Por aqui, ${interest}. Dá vontade de conhecer a clínica. Chame o nosso time para ver de perto.${voice}`;
  }
  return { ...method, line };
}
