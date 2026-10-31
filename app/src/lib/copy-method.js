// Escolha do método de copy pela estrutura da peça.
// Sempre dentro do Método PRIME. Sem promessa, sem número, sem antes e depois.

export const COPY_STRUCTURES = ["post", "bio", "link-na-bio", "anuncio", "whatsapp", "site"];

const METHODS = {
  AIDA: {
    id: "AIDA",
    name: "AIDA",
    note: "Atenção, interesse, desejo e ação, dentro do Método PRIME.",
  },
  PAS: {
    id: "PAS",
    name: "PAS",
    note: "Problema, agitação e solução, dentro do Método PRIME.",
  },
  StoryBrand: {
    id: "StoryBrand",
    name: "StoryBrand",
    note: "A clínica entra como guia, dentro do Método PRIME.",
  },
  "4U": {
    id: "4U",
    name: "4U",
    note: "Útil, único, ultraespecífico e urgente sem número, dentro do Método PRIME.",
  },
};

const BY_STRUCTURE = {
  post: "AIDA",
  bio: "4U",
  "link-na-bio": "StoryBrand",
  anuncio: "PAS",
  whatsapp: "PAS",
  site: "StoryBrand",
};

export function structureForFormat(format) {
  if (format === "post" || format === "carousel" || format === "video") return "post";
  if (BY_STRUCTURE[format]) return format;
  return "post";
}

export function chooseCopyMethod(structure) {
  const key = BY_STRUCTURE[structure] ? structure : "post";
  const method = METHODS[BY_STRUCTURE[key]];
  return {
    id: method.id,
    name: method.name,
    note: method.note,
    structure: key,
    prime: "Método PRIME",
  };
}

export function copyMethodCatalog() {
  return COPY_STRUCTURES.map((structure) => chooseCopyMethod(structure));
}

function bit(value) {
  return typeof value === "string" ? value.trim() : "";
}

// Frase de trabalho no método escolhido. Não inventa número nem resultado.
export function suggestLine(structure, profile = {}) {
  const method = chooseCopyMethod(structure);
  const city = bit(profile.cidade);
  const tom = bit(profile.tom);
  const diff = bit(profile.diferenciais);
  const where = city ? ` em ${city}` : "";
  const voice = tom ? ` Tom: ${tom}.` : "";
  const mark = diff ? ` O que a gente destaca: ${diff}.` : "";
  let line = "";
  if (method.id === "AIDA") {
    line = `A gente chama atenção para o espaço${where}. O interesse fica no cuidado, o desejo em conhecer a clínica, e a ação é um convite sóbrio.${voice}${mark}`;
  } else if (method.id === "PAS") {
    line = `A presença espalhada é o problema. A gente mostra o incômodo de não ser encontrada e a saída: uma presença só${where}, sem promessa.${voice}`;
  } else if (method.id === "4U") {
    line = `A bio diz o que a clínica faz${where}, o que a torna única e o próximo passo, sem número e sem urgência falsa.${voice}${mark}`;
  } else {
    line = `Nosso time coloca a clínica como guia${where}. O plano é simples e a chamada é um convite, dentro do Método PRIME.${voice}${mark}`;
  }
  return { ...method, line };
}
