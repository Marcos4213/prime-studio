/* Prime Studio · /contato
   Nichos do anúncio, variantes de headline (par 1 e par 7) e faixas de faturamento.
   Atribuição 50/50 fica no navegador (localStorage). Este arquivo só normaliza. */
(function (root) {
  var NICHOS = {
    implantes: "Implantes · mais casos, sem depender de indicação",
    lentes: "Lentes de contato dental · a primeira escolha",
    plastica: "Cirurgia plástica · o nome como primeira escolha",
    estetica: "Estética · agenda previsível para a clínica"
  };
  var COPY = {
    "1": {
      h: "Mais pacientes de alto valor em 90 dias, sem depender de indicação.",
      s: "O nosso time aplica o Método PRIME no seu Google, Instagram e site. Deixa os seus dados: a gente analisa a presença da sua clínica de graça e entra em contato."
    },
    "7": {
      h: "“Quanto custa?” e sumiu? Quase nunca é o preço.",
      s: "É confiança. O nosso time conecta site, Google e Instagram numa presença só. Análise gratuita para clínicas que já faturam a partir de R$ 30 mil/mês."
    }
  };
  var FAT = [
    ["ate_10k", "Até R$ 10 mil"],
    ["10_30k", "R$ 10–30 mil"],
    ["30_80k", "R$ 30–80 mil"],
    ["80_150k", "R$ 80–150 mil"],
    ["acima_150k", "Acima de R$ 150 mil"]
  ];
  var QUAL = { "30_80k": 1, "80_150k": 1, "acima_150k": 1 };
  var ESPECIALIDADES = [
    ["odonto", "Implantes"],
    ["odonto", "Lentes de contato dental"],
    ["outro", "Cirurgia plástica"],
    ["estetica", "Estética e harmonização"],
    ["outro", "Outra especialidade de alto ticket"]
  ];

  function fold(v) {
    return String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  }
  function normNicho(raw) {
    var s = fold(raw).replace(/[^a-z]/g, "");
    if (!s) return "";
    if (s === "implantes" || s === "implante" || s === "implant") return "implantes";
    if (s === "lentes" || s === "lente") return "lentes";
    if (s === "plastica" || s === "plastic" || s === "cirurgia" || s === "cirurgiaplastica") return "plastica";
    if (s === "estetica" || s === "estetico" || s === "harmonizacao" || s === "hof") return "estetica";
    return "";
  }
  function normVariante(raw) {
    var s = fold(raw);
    if (s === "1" || s === "a" || s === "resultado") return "1";
    if (s === "7" || s === "b" || s === "problema") return "7";
    return "";
  }
  /* forced (?v=) vence e deve ser persistido. Sem forced, reutiliza o salvo. Senão, 50/50. */
  function assignVariante(forced, saved, rand) {
    if (forced === "1" || forced === "7") return forced;
    if (saved === "1" || saved === "7") return saved;
    return (rand ? rand() : Math.random()) < 0.5 ? "1" : "7";
  }

  var api = {
    NICHOS: NICHOS,
    COPY: COPY,
    FAT: FAT,
    QUAL: QUAL,
    ESPECIALIDADES: ESPECIALIDADES,
    EYEBROW_DEFAULT: "Clínicas de alto ticket · Google, site e Instagram",
    normNicho: normNicho,
    normVariante: normVariante,
    assignVariante: assignVariante,
    fold: fold
  };
  root.PRIME_CONTATO = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
