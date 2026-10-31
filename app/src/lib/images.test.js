import assert from "node:assert/strict";
import test from "node:test";
import { IMAGE_MODEL, extractGeneratedImage, imageMotivo, imagePrompt } from "./images.js";

const SECRET = "AIzaTESTKEYSHOULDNOTLEAK123456";

test("o prompt da imagem gerada leva paleta e compliance", () => {
  const prompt = imagePrompt({
    kind: "post",
    profile: { cidade: "Curitiba", nicho: "odonto" },
    caption: "Convite sóbrio para conhecer o espaço.",
    theme: "recepção",
    fromPhoto: false,
  });
  assert.match(prompt, /#0F4C5C/);
  assert.match(prompt, /#F7F5F0/);
  assert.match(prompt, /#B08D57/);
  assert.match(prompt, /antes e depois/i);
  assert.match(prompt, /CFM/);
  assert.equal(prompt.includes(SECRET), false);
});

test("compor a partir da foto continua sob compliance", () => {
  const prompt = imagePrompt({ kind: "capa", profile: {}, caption: "oi", fromPhoto: true });
  assert.match(prompt, /foto enviada como base/);
  assert.match(prompt, /resultado clínico/);
  assert.match(prompt, /antes e depois/i);
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
