import assert from "node:assert/strict";
import test from "node:test";
import { GEMINI_MODEL, chatInstruction, generatePiece, generateStructureCopy, redactSecrets, reviseCopy } from "./ai.js";
import { stripPatientCounts } from "./provas.js";

const SECRET = "AIzaTESTKEYSHOULDNOTLEAK123456";

function geminiResponse(payload) {
  return new Response(
    JSON.stringify({
      candidates: [{ content: { parts: [{ text: JSON.stringify(payload) }] } }],
    }),
    { status: 200, headers: { "content-type": "application/json" } }
  );
}

test("rascunho sem chave não pede para configurar IA e mostra o método", async () => {
  const result = await generatePiece({}, { format: "post", theme: "o cuidado no atendimento", profile: { nicho: "estetica" } });
  const packed = JSON.stringify(result);
  assert.equal(result.source, "mock");
  assert.equal(result.output.copyMethod.name, "AIDA");
  assert.equal(result.output.copyMethod.prime, "Método PRIME");
  assert.equal(packed.includes("configure a chave"), false);
  assert.match(result.output.caption, /A gente abre a porta/);
});

test("falha da API com chave não grava o exemplo e não devolve a chave", async () => {
  const prev = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error(`rede caiu ${SECRET} x-goog-api-key: ${SECRET}`);
  };
  try {
    const result = await generatePiece(
      { GEMINI_API_KEY: SECRET },
      { format: "post", theme: "luz da recepção", profile: { cidade: "Curitiba" } }
    );
    const packed = JSON.stringify(result);
    assert.equal(result.unavailable, true);
    assert.equal(result.motivo, "falha");
    assert.equal(result.output, undefined);
    assert.equal(result.source, undefined);
    assert.equal(packed.includes(SECRET), false);
    assert.equal(packed.includes("AIza"), false);
    assert.equal(packed.includes("Exemplo"), false);
  } finally {
    globalThis.fetch = prev;
  }
});

test("resposta do Gemini vira a legenda e o modelo flash", async () => {
  const prev = globalThis.fetch;
  let called = "";
  globalThis.fetch = async (url, opts) => {
    called = String(url);
    const headers = opts.headers || {};
    assert.equal(headers["x-goog-api-key"], SECRET);
    assert.equal(String(url).includes(SECRET), false);
    const body = JSON.parse(opts.body);
    assert.match(body.systemInstruction.parts[0].text, /AIDA/);
    assert.match(body.systemInstruction.parts[0].text, /CFM/);
    assert.equal(body.generationConfig.responseMimeType, "application/json");
    assert.equal(body.generationConfig.thinkingConfig.thinkingLevel, "low");
    return geminiResponse({
      caption: "Nosso time abre a recepção com luz natural e um convite sóbrio para conhecer o espaço.",
      imagePrompt: "Fotografia da recepção, sem pessoa e sem texto.",
    });
  };
  try {
    const result = await generatePiece(
      { GEMINI_API_KEY: SECRET },
      { format: "post", theme: "recepção", profile: { nicho: "odonto", cidade: "Curitiba" } }
    );
    assert.equal(result.source, "ia");
    assert.equal(result.model, GEMINI_MODEL);
    assert.match(called, new RegExp(`${GEMINI_MODEL}:generateContent`));
    assert.match(result.output.caption, /recepção/);
    assert.equal(result.output.copyMethod.name, "AIDA");
    assert.equal(JSON.stringify(result).includes(SECRET), false);
  } finally {
    globalThis.fetch = prev;
  }
});

test("erro HTTP da API não carrega o corpo nem a chave", async () => {
  const prev = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ error: { status: "INVALID_ARGUMENT", message: SECRET } }), { status: 400 });
  try {
    const result = await generateStructureCopy(
      { GEMINI_API_KEY: SECRET },
      { structure: "whatsapp", profile: { cidade: "Curitiba" } }
    );
    const packed = JSON.stringify(result);
    assert.equal(result.source, "mock");
    assert.equal(result.name, "AIDA");
    assert.equal(packed.includes(SECRET), false);
    assert.match(result.line, /mensagem/);
  } finally {
    globalThis.fetch = prev;
  }
});

test("bio, anúncio e site escolhem o método e podem vir do Gemini", async () => {
  const prev = globalThis.fetch;
  globalThis.fetch = async () => geminiResponse({ line: "A gente guia a visita com um convite sóbrio." });
  try {
    const bio = await generateStructureCopy({ GEMINI_API_KEY: SECRET }, { structure: "bio", profile: {} });
    const ad = await generateStructureCopy({ GEMINI_API_KEY: SECRET }, { structure: "anuncio", profile: {} });
    const site = await generateStructureCopy({ GEMINI_API_KEY: SECRET }, { structure: "site", profile: {} });
    assert.equal(bio.name, "4U");
    assert.equal(ad.name, "PAS");
    assert.equal(site.name, "StoryBrand");
    assert.equal(bio.source, "ia");
    assert.equal(site.line.includes("convite sóbrio"), true);
  } finally {
    globalThis.fetch = prev;
  }
});

test("se o flash atual não responde, o flash estável anterior entrega a legenda", async () => {
  const prev = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (url) => {
    calls += 1;
    if (String(url).includes(GEMINI_MODEL)) throw new Error("The operation was aborted due to timeout");
    return geminiResponse({
      caption: "Nosso time recebe com luz natural e um convite sóbrio.",
      imagePrompt: "Recepção sem pessoa e sem texto.",
    });
  };
  try {
    const result = await generatePiece({ GEMINI_API_KEY: SECRET }, { format: "post", theme: "recepção", profile: {} });
    assert.equal(calls >= 2, true);
    assert.equal(result.source, "ia");
    assert.equal(result.model, "gemini-3.6-flash");
    assert.equal(JSON.stringify(result).includes(SECRET), false);
  } finally {
    globalThis.fetch = prev;
  }
});

test("cota nos flashes novos tenta o flash 2.5 estável", async () => {
  const prev = globalThis.fetch;
  const models = [];
  globalThis.fetch = async (url) => {
    const model = String(url).split("/models/")[1].split(":")[0];
    models.push(model);
    if (model === "gemini-2.5-flash") {
      return geminiResponse({
        caption: "A gente abre a recepção com luz natural e um convite sóbrio.",
        imagePrompt: "Recepção sem pessoa e sem texto.",
      });
    }
    return new Response(JSON.stringify({ error: { status: "RESOURCE_EXHAUSTED" } }), { status: 429 });
  };
  try {
    const result = await generatePiece({ GEMINI_API_KEY: SECRET }, { format: "post", theme: "recepção", profile: {} });
    assert.equal(result.source, "ia");
    assert.equal(result.model, "gemini-2.5-flash");
    assert.deepEqual(models, ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-2.5-flash"]);
    assert.equal(JSON.stringify(result).includes(SECRET), false);
  } finally {
    globalThis.fetch = prev;
  }
});

test("o pedido da conversa leva o texto e a trava, sem a chave", () => {
  const instruction = chatInstruction({ instruction: "mais curto", text: "Um convite sóbrio para conhecer o espaço." });
  assert.match(instruction, /mais curto/);
  assert.match(instruction, /CFM/);
  assert.match(instruction, /antes e depois/i);
  assert.equal(instruction.includes(SECRET), false);
});

test("a conversa devolve a versão nova e não a chave", async () => {
  const prev = globalThis.fetch;
  globalThis.fetch = async (url, opts) => {
    assert.equal(String(url).includes(SECRET), false);
    const body = JSON.parse(opts.body);
    assert.match(body.contents[0].parts[0].text, /tom mais acolhedor/);
    assert.match(body.systemInstruction.parts[0].text, /CFM/);
    assert.match(body.systemInstruction.parts[0].text, /AIDA/);
    assert.match(body.systemInstruction.parts[0].text, /Curitiba/);
    assert.match(body.contents[0].parts[0].text, /a gente/);
    return geminiResponse({ text: "A gente recebe com um tom mais acolhedor e um convite sóbrio." });
  };
  try {
    const revised = await reviseCopy(
      { GEMINI_API_KEY: SECRET },
      { instruction: "tom mais acolhedor", text: "Conheça o espaço.", profile: { nicho: "odonto", cidade: "Curitiba" } }
    );
    assert.equal(revised.ok, true);
    assert.equal(revised.source, "ia");
    assert.match(revised.text, /acolhedor/);
    assert.equal(JSON.stringify(revised).includes(SECRET), false);
  } finally {
    globalThis.fetch = prev;
  }
});

test("cota na conversa não vira texto local", async () => {
  const prev = globalThis.fetch;
  const urls = [];
  globalThis.fetch = async (url) => {
    urls.push(String(url));
    return new Response(JSON.stringify({ error: { status: "RESOURCE_EXHAUSTED" } }), { status: 429 });
  };
  try {
    const revised = await reviseCopy(
      { GEMINI_API_KEY: SECRET },
      { instruction: "mais curto", text: "A gente recebe com luz natural." }
    );
    assert.equal(revised.ok, false);
    assert.equal(revised.motivo, "cota");
    assert.equal(revised.text, undefined);
    assert.equal(urls.length, 3);
    assert.equal(JSON.stringify(revised).includes(SECRET), false);
  } finally {
    globalThis.fetch = prev;
  }
});

test("sem chave a conversa não inventa texto", async () => {
  const revised = await reviseCopy({}, { instruction: "mais curto", text: "Texto da clínica." });
  assert.equal(revised.ok, false);
  assert.equal(revised.motivo, "sem_chave");
  assert.equal(revised.text, undefined);
});

test("a contagem gravada em provas não entra no pedido da legenda", async () => {
  const prev = globalThis.fetch;
  globalThis.fetch = async (_url, opts) => {
    const body = JSON.parse(opts.body);
    const packed = JSON.stringify(body);
    assert.equal(packed.includes("100mil"), false);
    assert.equal(packed.includes("paciêntes"), false);
    assert.match(packed, /Curitiba/);
    return geminiResponse({
      caption: "Mais de 100mil paciêntes conhecem o espaço.",
      imagePrompt: "Sala com Mais de 100mil paciêntes.",
    });
  };
  try {
    const result = await generatePiece(
      { GEMINI_API_KEY: SECRET },
      { format: "post", theme: "recepção", profile: { cidade: "Curitiba", provas: "Mais de 100mil paciêntes" } }
    );
    assert.equal(result.output.caption.includes("100mil"), false);
    assert.equal(result.output.caption.includes("paciêntes"), false);
    assert.equal(result.output.imagePrompt.includes("paciêntes"), false);
    assert.equal(result.output.imagePrompt.includes("100mil"), false);
    assert.equal(stripPatientCounts(result.output.caption), result.output.caption);
  } finally {
    globalThis.fetch = prev;
  }
});

test("redact corta a chave mesmo quando o texto a repete", () => {
  const out = redactSecrets(`falha ${SECRET} e AIzaOUTRAKEY1234567890`, SECRET);
  assert.equal(out.includes(SECRET), false);
  assert.equal(out.includes("AIzaOUTRA"), false);
});
