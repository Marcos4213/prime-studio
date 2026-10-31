import assert from "node:assert/strict";
import test from "node:test";
import { IMAGE_MODEL, extractGeneratedImage, generateClinicImage, imageMotivo, imagePrompt, imageRequest } from "./images.js";

const SECRET = "AIzaTESTKEYSHOULDNOTLEAK123456";

test("o prompt da imagem gerada leva paleta e compliance", () => {
  const prompt = imagePrompt({
    kind: "post",
    profile: { cidade: "Curitiba", nicho: "odonto", colors: ["areia"], tom: "sóbrio" },
    caption: "Convite sóbrio para conhecer o espaço.",
    theme: "recepção",
    fromPhoto: false,
  });
  assert.match(prompt, /#0F4C5C/);
  assert.match(prompt, /#F7F5F0/);
  assert.match(prompt, /#B08D57/);
  assert.match(prompt, /antes e depois/i);
  assert.match(prompt, /CFM/);
  assert.match(prompt, /simulando resultado/i);
  assert.match(prompt, /Curitiba/);
  assert.match(prompt, /areia/);
  assert.match(prompt, /sóbrio/);
  assert.equal(prompt.includes(SECRET), false);
});

test("compor a partir da foto continua sob compliance", () => {
  const prompt = imagePrompt({ kind: "capa", profile: {}, caption: "oi", fromPhoto: true });
  assert.match(prompt, /foto enviada como base/);
  assert.match(prompt, /resultado clínico/);
  assert.match(prompt, /antes e depois/i);
  assert.match(prompt, /não entra na trava/i);
  assert.doesNotMatch(prompt, /simulando resultado/i);
});

test("a imagem gerada não é o eco da foto enviada", () => {
  const input = "FOTOBASE";
  const found = extractGeneratedImage(
    {
      steps: [
        { type: "user_input", content: [{ type: "image", data: input, mime_type: "image/jpeg" }] },
        { type: "model_output", content: [{ type: "image", data: "GERADA", mime_type: "image/png" }] },
      ],
    },
    input
  );
  assert.equal(found.b64, "GERADA");
  assert.equal(found.mime, "image/png");
});

test("output_image tem prioridade", () => {
  const found = extractGeneratedImage({ output_image: { data: "DIRETA", mime_type: "image/png" } }, "");
  assert.equal(found.b64, "DIRETA");
});

test("cota e indisponibilidade viram motivo curto", () => {
  assert.equal(imageMotivo(429), "cota");
  assert.equal(imageMotivo(503), "indisponivel");
  assert.equal(IMAGE_MODEL, "gemini-nano-banana-2.1");
});

test("o pedido da imagem é texto puro, sem mime png no formato", () => {
  const body = imageRequest({ model: IMAGE_MODEL, prompt: "recepção", ratio: "4:5", photo: null, simple: false });
  assert.equal(body.input, "recepção");
  assert.equal(body.response_format.type, "image");
  assert.equal(body.response_format.aspect_ratio, "4:5");
  assert.equal(body.response_format.image_size, "1K");
  assert.equal(body.response_format.mime_type, undefined);
  const withPhoto = imageRequest({
    model: IMAGE_MODEL,
    prompt: "enquadre",
    ratio: "1:1",
    photo: { b64: "FOTO", mime: "image/png" },
    simple: true,
  });
  assert.equal(withPhoto.input[0].type, "image");
  assert.equal(withPhoto.input[0].data, "FOTO");
  assert.equal(withPhoto.input[1].text, "enquadre");
  assert.equal(withPhoto.response_format.image_size, undefined);
});

test("a imagem também sai de inlineData", () => {
  const found = extractGeneratedImage({
    candidates: [{ content: { parts: [{ inlineData: { data: "GERADA", mimeType: "image/png" } }] } }],
  }, "");
  assert.equal(found.b64, "GERADA");
});

test("400 no formato completo repete sem image_size e não vaza a chave", async () => {
  const prev = globalThis.fetch;
  const bodies = [];
  globalThis.fetch = async (url, opts) => {
    bodies.push(JSON.parse(opts.body));
    assert.equal(String(url).includes(SECRET), false);
    assert.equal(String(opts.body).includes(SECRET), false);
    if (bodies.length === 1) return new Response("{}", { status: 400 });
    return new Response(JSON.stringify({ output_image: { data: btoa("ok"), mime_type: "image/png" } }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  try {
    const made = await generateClinicImage(
      { GEMINI_API_KEY: SECRET },
      { kind: "post", ratio: "4:5", caption: "Convite sóbrio.", profile: { cidade: "Curitiba" } }
    );
    assert.equal(made.ok, true);
    assert.equal(bodies.length, 2);
    assert.equal(typeof bodies[0].input, "string");
    assert.equal(bodies[0].response_format.mime_type, undefined);
    assert.equal(bodies[1].response_format.image_size, undefined);
    assert.match(bodies[0].input, /antes e depois/i);
    assert.equal(JSON.stringify(made).includes(SECRET), false);
  } finally {
    globalThis.fetch = prev;
  }
});
