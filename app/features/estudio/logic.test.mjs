import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { dailyPair, dayKey } from "./logic.js";
import { generatePiece, brandGuard } from "../../src/lib/ai.js";

test("sexta em São Paulo e a véspera no fuso", () => {
  const friday = dailyPair(new Date("2026-10-30T15:00:00Z"));
  assert.equal(friday.todayKey, "2026-10-30");
  assert.equal(friday.today.label, "Sexta");
  assert.equal(friday.today.angle, "O que torna o atendimento humano");
  assert.equal(friday.tomorrow.label, "Sábado");

  const eve = new Date("2026-10-30T02:00:00Z");
  assert.equal(dayKey(eve), "2026-10-29");
  assert.equal(dailyPair(eve).today.label, "Quinta");
});

test("mock respeita o formato e não inventa pessoa nem prompt no vídeo", async () => {
  const post = await generatePiece({}, { format: "post", theme: "o espaço", profile: { colors: ["dourado"], fonts: ["Inter"] } });
  assert.equal(post.source, "mock");
  assert.match(post.output.imagePrompt, /dourado/);
  assert.match(post.output.imagePrompt, /equipe em rotina/i);
  assert.doesNotMatch(post.output.imagePrompt, /sem pessoa em destaque/i);
  assert.equal(post.output.script, undefined);
  assert.deepEqual(post.output.warnings, []);

  const carousel = await generatePiece({}, { format: "carousel", theme: "o acolhimento" });
  assert.ok(carousel.output.slides.length >= 3);
  assert.ok(carousel.output.slides.every((s) => s.imagePrompt));
  assert.equal(carousel.output.imagePrompt, undefined);

  const video = await generatePiece({}, { format: "video", theme: "o espaço", recordingMode: "narracao" });
  assert.equal(video.output.recording.mode, "narracao");
  assert.equal(video.output.imagePrompt, undefined);
  assert.equal(video.output.slides, undefined);
  assert.ok(video.output.script.hook);
  assert.ok(video.output.recording.tips.length);
});

test("guarda de marca aponta faturamento, antes e depois, saúde e valor", () => {
  const warnings = brandGuard({
    caption: "aumente o faturamento com antes e depois do paciente por R$ 30 e 20%",
  });
  const text = warnings.join(" ");
  assert.match(text, /faturamento/i);
  assert.match(text, /Antes e depois/);
  assert.match(text, /saúde/i);
  assert.match(text, /valor/i);
  assert.match(text, /percentual/i);
});

test("a página cabe no celular e deixa o hábito visível", () => {
  const dir = new URL(".", import.meta.url);
  const html = fs.readFileSync(new URL("page.html", dir), "utf8");
  const css = fs.readFileSync(new URL("studio.css.txt", dir), "utf8");
  const js = fs.readFileSync(new URL("client.js.txt", dir), "utf8");
  const page = html.replace("___ESTUDIO_CSS___", css).replace("___ESTUDIO_JS___", js);
  assert.equal(page.includes("___ESTUDIO_CSS___"), false);
  assert.equal(page.includes("___ESTUDIO_JS___"), false);
  assert.doesNotMatch(page, /Por que abrir de novo amanhã/);
  assert.match(page, /id="formatSec"/);
  assert.match(page, /id="theme"/);
  assert.doesNotMatch(page, /id="composer"[^>]*hidden/);
  assert.doesNotMatch(page, /id="brand"/);
  assert.doesNotMatch(page, /AIDA|StoryBrand|Treinar IA/);
  assert.match(page, /sem prompt de imagem/i);
  assert.match(page, /Nada vai ao ar sozinho/);
  assert.match(css, /overflow-x:\s*hidden/);
  assert.doesNotMatch(css, /overflow-x:\s*(auto|scroll)/);
  assert.doesNotMatch(css, /100vw/);
  assert.doesNotMatch(css + html + js, /#[0-9a-fA-F]{3,8}\b/);
  assert.doesNotMatch(css + html, /rgba?\(/);
  assert.match(html, /\/assets\/tokens\.css/);
  assert.match(css, /var\(--color-bg\)/);
  assert.match(css, /var\(--color-accent\)/);
  const tokens = fs.readFileSync(new URL("../../public/assets/tokens.css", dir), "utf8");
  assert.doesNotMatch(tokens, /PALETA PROVISÓRIA/);
  assert.match(tokens, /--color-bg:\s*#F7F5F0/);
  assert.match(tokens, /--color-surface:\s*#FFFFFF/);
  assert.match(tokens, /--color-text:\s*#1A2328/);
  assert.match(tokens, /--color-primary:\s*#0F4C5C/);
  assert.match(tokens, /--color-on-primary:\s*#FFFFFF/);
  assert.match(tokens, /--color-success:\s*#2E7D5B/);
  assert.match(tokens, /--color-gold:\s*#B08D57/);
  assert.match(tokens, /--color-accent:\s*var\(--color-primary\)/);
  assert.match(tokens, /--color-accent-text:\s*var\(--color-on-primary\)/);
  assert.match(css, /\.btn \{[^}]*background:\s*var\(--color-accent\)/);
  assert.match(css, /var\(--color-gold\)/);
  const avisoFoto = "Use fotos de pacientes apenas com autorização de uso de imagem.";
  assert.ok(js.includes(avisoFoto));
  assert.doesNotMatch(html + js.replaceAll(avisoFoto, ""), /faturamento|antes e depois|paciente/i);
  assert.match(js, /Importar foto/);
  assert.match(js, /data-chat/);
  assert.ok(js.indexOf("data-chat-err") < js.indexOf("data-chat-send"));
  assert.match(css, /html\.is-framed \.chat\.is-open[\s\S]*padding-bottom:\s*calc\(36px \+ env\(safe-area-inset-bottom\)\)/);
  const server = fs.readFileSync(new URL("server.js", dir), "utf8");
  const upload = server.slice(server.indexOf("export async function handleEstudioUpload"), server.indexOf("export async function handleEstudioChat"));
  assert.equal(upload.includes("handleEstudioUpload"), true);
  assert.doesNotMatch(upload, /brandGuard|compliance|antes e depois|CFM/i);
  assert.match(html, /recepcao\.webp/);
  assert.match(html, /sala\.webp/);
  assert.match(html, /espera\.webp/);
});
