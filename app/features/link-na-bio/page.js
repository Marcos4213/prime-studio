import { EDITOR_JS } from "./editor-inline.js";

const EDITOR = EDITOR_JS.replace(/<\/script/gi, "<\\/script");

const CSS = `
:root{
  --serif:"Cormorant Garamond",Georgia,serif;
  --sans:"Inter",system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
  --wash:color-mix(in srgb,var(--color-primary) 12%,transparent);
  --rule:color-mix(in srgb,var(--color-primary) 32%,var(--color-line));
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{overflow-x:clip;max-width:100%}
body{
  min-height:100vh;color:var(--color-text);
  background:radial-gradient(120% 70% at 50% -10%,var(--wash) 0%,var(--color-bg) 58%);
  font:16px/1.5 var(--sans);-webkit-font-smoothing:antialiased;
}
img{max-width:100%}
button,input{font:inherit;color:inherit}
button{cursor:pointer}
:focus-visible{outline:2px solid var(--color-accent);outline-offset:2px}
[hidden]{display:none !important}
h1,h2{font-family:var(--serif);font-weight:500;line-height:1.08;letter-spacing:-.01em}
a{color:var(--color-primary);text-decoration:none}
.wrap{width:min(980px,100%);margin:0 auto;padding:0 16px 48px}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 0 8px;position:sticky;top:0;z-index:5;background:linear-gradient(180deg,var(--color-bg) 72%,transparent)}
.logo{flex:none;color:var(--color-text);font-weight:600;letter-spacing:.28em;font-size:.78rem}
.logo span{color:var(--color-gold);font-weight:300;margin-left:.35em}
.top-right{display:flex;align-items:center;gap:10px;min-width:0}
.who{color:var(--color-muted);font-size:.82rem;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:42vw}
.intro{padding:8px 0 14px}
.eyebrow{color:var(--color-primary);letter-spacing:.22em;text-transform:uppercase;font-size:.68rem;font-weight:600}
h1{font-size:clamp(2rem,7vw,2.7rem);margin:6px 0 8px}
.lead{color:var(--color-muted);font-size:.95rem;max-width:46ch}
.habit{display:inline-flex;align-items:center;gap:8px;margin-top:12px;padding:7px 12px;border-radius:999px;border:1px solid var(--color-line);color:var(--color-text);font-size:.78rem;max-width:100%}
.habit::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--color-gold);flex:none}
.habit.is-fresh::before{background:var(--color-success)}
.stage{display:flex;flex-direction:column;gap:14px;min-width:0}
.editor,.preview{min-width:0}
.preview{order:-1}
.card{
  background:linear-gradient(180deg,var(--wash),transparent 48px),var(--color-surface);
  border:1px solid var(--color-line);border-radius:18px;padding:16px;margin-bottom:12px;min-width:0;
}
.ritual{box-shadow:inset 0 0 0 1px var(--rule)}
.card h2{font-size:1.45rem;margin-bottom:4px}
.hint{color:var(--color-muted);font-size:.86rem}
.ritual-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-end;margin-bottom:12px}
.review-date{font-family:var(--serif);font-size:1.35rem;color:var(--color-primary);line-height:1;text-align:right;flex:none}
.checks{display:grid;gap:8px}
.check{
  display:flex;align-items:center;gap:10px;width:100%;text-align:left;min-height:48px;
  padding:12px;border-radius:14px;border:1px solid var(--color-line);background:var(--color-bg);color:var(--color-text);
}
.check::before{content:"";width:16px;height:16px;border-radius:50%;border:1px solid var(--rule);flex:none}
.check[aria-pressed="true"]{border-color:var(--color-accent);background:var(--color-surface-2)}
.check[aria-pressed="true"]::before{background:var(--color-accent);box-shadow:inset 0 0 0 3px var(--color-bg)}
#reviewBtn{width:100%;margin-top:12px}
.field{display:grid;gap:6px;margin-top:12px;min-width:0}
.field span,label.lbl{font-size:.78rem;color:var(--color-muted)}
.field input,.bare{
  width:100%;max-width:100%;padding:13px 14px;border-radius:12px;border:1px solid var(--color-line);
  background:var(--color-bg);color:var(--color-text);font-size:16px;
}
.field input:focus,.bare:focus{outline:none;border-color:var(--color-accent)}
.covers{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}
.cover-pick{
  position:relative;display:block;padding:0;border-radius:14px;overflow:hidden;border:1px solid var(--color-line);
  background:var(--color-bg);aspect-ratio:16/10;cursor:pointer;
}
.cover-pick img{width:100%;height:100%;object-fit:cover;display:block}
.cover-pick span{
  position:absolute;left:0;right:0;bottom:0;padding:18px 8px 6px;
  background:linear-gradient(transparent,var(--color-bg));
  color:var(--color-text);font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;text-align:left;
}
.cover-pick[aria-pressed="true"]{box-shadow:inset 0 0 0 2px var(--color-accent)}
.door{border:1px solid var(--color-line);border-radius:14px;padding:12px;margin-top:10px;background:var(--color-surface-2);min-width:0}
.door.is-primary{border-color:var(--rule);background:linear-gradient(180deg,var(--wash),var(--color-surface-2) 48px)}
.door-head{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.door-name{font-size:.82rem;color:var(--color-primary);font-weight:600;min-width:0}
.door-moves{display:flex;gap:6px}
.mini{
  background:transparent;color:var(--color-primary);border:1px solid var(--rule);
  border-radius:999px;padding:6px 10px;font-size:.75rem;font-weight:500;
}
.mini[aria-pressed="true"]{background:var(--wash);border-color:var(--color-primary)}
.mini:disabled{opacity:.35;cursor:default}
.vis{margin-left:auto}
.field-err{color:var(--color-danger);font-size:.8rem;margin-top:6px}
.actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.actions .btn,.actions .btn-ghost{width:100%}
.badge{display:inline-flex;align-items:center;border:1px solid var(--color-line);border-radius:999px;padding:4px 10px;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--color-muted)}
.badge.is-ready{color:var(--color-success);border-color:color-mix(in srgb,var(--color-success) 45%,var(--color-line))}
.quiet,.note{color:var(--color-muted);font-size:.8rem;flex:1 1 100%}
.flash{font-size:.86rem;margin-top:8px}
.flash.is-ok{color:var(--color-success)}
.flash.is-err{color:var(--color-danger)}
.btn{
  display:inline-flex;align-items:center;justify-content:center;
  background:var(--color-accent);color:var(--color-accent-text);
  font-weight:600;font-size:.95rem;padding:14px 18px;border:0;border-radius:999px;cursor:pointer;
}
.btn:disabled{opacity:.55;cursor:default}
.btn-ghost{background:transparent;color:var(--color-primary);border:1px solid var(--color-primary);border-radius:999px;padding:12px 16px;font-weight:500}
.btn-xs{padding:7px 12px;font-size:.78rem;flex:none}
.phone{
  width:min(100%,270px);margin:8px auto 0;background:var(--color-surface);
  border:1px solid var(--rule);border-radius:28px;padding:8px;
  box-shadow:0 24px 50px -28px var(--wash);
}
.screen{background:var(--color-bg);border-radius:22px;overflow:hidden}
.ear{width:64px;height:4px;border-radius:4px;background:var(--color-line);margin:8px auto}
.cover{
  height:96px;position:relative;
  background:radial-gradient(80% 90% at 80% 0%,var(--wash),transparent 60%),linear-gradient(160deg,var(--color-surface-2),var(--color-bg));
}
.cover img{width:100%;height:100%;object-fit:cover;display:block}
.screen-body{padding:12px 12px 16px}
.pv-name{font-family:var(--serif);font-size:1.55rem;line-height:1.05}
.pv-name:empty::before{content:"Nome da clínica";color:var(--color-muted)}
.pv-line{color:var(--color-muted);font-size:.82rem;margin-top:6px;overflow-wrap:anywhere}
.pv-line:empty::before{content:"A frase da clínica";color:var(--color-muted)}
.pv-notes{list-style:none;display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.pv-notes li{font-size:.72rem;color:var(--color-primary);border:1px solid var(--rule);border-radius:999px;padding:3px 8px;overflow-wrap:anywhere;max-width:100%}
.pv-links{display:grid;gap:8px;margin-top:12px}
.pv-link{border:1px solid var(--color-line);border-radius:12px;padding:10px 12px;font-size:.84rem;font-weight:600;overflow-wrap:anywhere}
.pv-link.is-primary{border:0;color:var(--color-accent-text);background:var(--color-accent)}
.gate{padding:28px 0 10px;display:grid;justify-items:start;gap:12px}
.gate .btn{margin-top:8px}
@media (min-width:640px){
  .actions .btn,.actions .btn-ghost{width:auto;flex:1 1 180px}
}
@media (min-width:900px){
  .stage{display:grid;grid-template-columns:minmax(0,1fr) 300px;column-gap:22px;align-items:start}
  .preview{order:0;position:sticky;top:76px}
  .phone{width:100%}
  .cover{height:118px}
}
@media (prefers-color-scheme:dark){
  a,.eyebrow,.review-date,.door-name,.mini,.btn-ghost,.pv-notes li{color:var(--color-text)}
  .btn-ghost{border-color:color-mix(in srgb,var(--color-gold) 55%,var(--color-line))}
  .mini{border-color:color-mix(in srgb,var(--color-gold) 45%,var(--color-line))}
}
`;

function document({ main, script }) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>Link na bio — Central do Cliente</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/tokens.css">
<style>${CSS}</style>
</head>
<body>
<div class="wrap">
${main}
</div>
${script || ""}
</body>
</html>`;
}

export function renderGatePage() {
  return document({
    main: `<header class="top"><a class="logo" href="/">PRIME<span>STUDIO</span></a></header>
<main class="gate">
  <p class="eyebrow">Presença única</p>
  <h1>Link na bio</h1>
  <p class="lead">Entre na Central para ajustar a página da clínica.</p>
  <a class="btn" href="/">Entrar na Central</a>
</main>`,
  });
}

export function renderEditorPage() {
  return document({
    main: `<header class="top">
  <a class="logo" href="/">PRIME<span>STUDIO</span></a>
  <div class="top-right">
    <span id="who" class="who"></span>
    <button class="btn-ghost btn-xs" id="logout" type="button">Sair</button>
  </div>
</header>
<header class="intro">
  <p class="eyebrow">Presença única</p>
  <h1>Link na bio</h1>
  <p class="lead">A paciente sai do Instagram e cai aqui. Em três segundos, ela precisa ver a mesma clínica do site, do perfil e do Google.</p>
  <p id="habitChip" class="habit is-none">A bio ainda não foi revisada</p>
</header>
<div class="stage">
  <form id="bioForm" class="editor" hidden autocomplete="off">
    <section class="card ritual">
      <div class="ritual-top">
        <div>
          <h2>Manter a bio atualizada</h2>
          <p class="hint">Quando o site, o Instagram ou o Google mudam, a bio muda junto. Revise uma vez por semana.</p>
        </div>
        <p id="reviewDate" class="review-date">Ainda sem revisão</p>
      </div>
      <div class="checks">
        <button type="button" class="check" data-check="site" aria-pressed="false">O site diz o mesmo</button>
        <button type="button" class="check" data-check="instagram" aria-pressed="false">O Instagram diz o mesmo</button>
        <button type="button" class="check" data-check="google" aria-pressed="false">O Google diz o mesmo</button>
      </div>
      <button type="button" class="btn" id="reviewBtn" disabled>Revisei hoje</button>
    </section>

    <section class="card">
      <h2>A página</h2>
      <p class="hint">O nome e a frase que a paciente lê ao abrir.</p>
      <label class="field"><span>Nome na bio</span><input class="bare" id="displayName" maxlength="60" autocomplete="organization"></label>
      <p class="field-err" data-err="display_name" hidden></p>
      <label class="field"><span>Frase</span><input class="bare" id="line" maxlength="110" autocomplete="off"></label>
      <p class="field-err" data-err="line" hidden></p>
      <p class="field" style="margin-bottom:0"><span>Foto da página</span></p>
      <p class="hint">Escolha o clima. As fotos são do acervo Prime, de espaços reais.</p>
      <div id="covers" class="covers"></div>
    </section>

    <section class="card">
      <h2>As quatro portas</h2>
      <p class="hint">Site, Instagram, Google e WhatsApp. A bio não abre outra história.</p>
      <div id="links"></div>
    </section>

    <section class="card">
      <h2>Três detalhes</h2>
      <p class="hint">Horário, lugar ou o que a clínica faz.</p>
      <label class="field"><span>Detalhe 1</span><input class="bare" id="hi0" maxlength="72" autocomplete="off"></label>
      <p class="field-err" data-err="highlights.0" hidden></p>
      <label class="field"><span>Detalhe 2</span><input class="bare" id="hi1" maxlength="72" autocomplete="off"></label>
      <p class="field-err" data-err="highlights.1" hidden></p>
      <label class="field"><span>Detalhe 3</span><input class="bare" id="hi2" maxlength="72" autocomplete="off"></label>
      <p class="field-err" data-err="highlights.2" hidden></p>
    </section>

    <div class="actions">
      <button class="btn" id="saveBtn" type="submit">Salvar rascunho</button>
      <button class="btn-ghost" id="readyBtn" type="button" disabled>Pronta para o ok</button>
      <span id="statusBadge" class="badge">Rascunho</span>
      <p id="savedAt" class="note" hidden></p>
      <p class="quiet">Salvar não publica. A página entra no ar com o ok da clínica e do nosso time.</p>
      <p id="flash" class="flash" hidden></p>
    </div>
  </form>
  <aside class="preview" aria-label="Prévia da página">
    <p class="eyebrow">Como a paciente vê</p>
    <div class="phone">
      <div class="screen">
        <div class="ear" aria-hidden="true"></div>
        <div id="pvCover" class="cover"></div>
        <div class="screen-body">
          <h2 id="pvName" class="pv-name"></h2>
          <p id="pvLine" class="pv-line"></p>
          <ul id="pvHighlights" class="pv-notes"></ul>
          <div id="pvLinks" class="pv-links"></div>
        </div>
      </div>
    </div>
  </aside>
</div>
<p id="loading" class="note">Abrindo a página…</p>`,
    script: `<script>${EDITOR}</script>`,
  });
}
