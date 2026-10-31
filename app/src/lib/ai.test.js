import assert from "node:assert/strict";
import test from "node:test";
import { GEMINI_MODEL, generatePiece, generateStructureCopy, redactSecrets } from "./ai.js";

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
  assert.match(result.output.caption, /A gente chama atenção/);
});

test("falha da API cai no rascunho e não devolve a chave", async () => {
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
    assert.equal(result.source, "mock");
    assert.equal(result.output.copyMethod.name, "AIDA");
    assert.equal(packed.includes(SECRET), false);
    assert.equal(packed.includes("AIza"), false);
    assert.equal(packed.includes("configure a chave"), false);
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
    assert.equal(result.name, "PAS");
    assert.equal(packed.includes(SECRET), false);
    assert.match(result.line, /presença/);
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
    assert.equal(result.model, "gemini-2.5-flash");
    assert.equal(JSON.stringify(result).includes(SECRET), false);
  } finally {
    globalThis.fetch = prev;
  }
});

test("redact corta a chave mesmo quando o texto a repete", () => {
  const out = redactSecrets(`falha ${SECRET} e AIzaOUTRAKEY1234567890`, SECRET);
  assert.equal(out.includes(SECRET), false);
  assert.equal(out.includes("AIzaOUTRA"), false);
});
