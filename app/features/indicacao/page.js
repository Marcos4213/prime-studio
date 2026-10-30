import { COPY } from "./rewards.js";

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
[hidden]{display:none !important}
html,body{overflow-x:hidden;max-width:100%}
body{background:var(--color-bg);color:var(--color-text);font:16px/1.45 "Inter",system-ui,-apple-system,Segoe UI,Roboto,sans-serif;-webkit-font-smoothing:antialiased;min-height:100vh}
img{max-width:100%;display:block}
a{color:inherit}
button,input{font:inherit;max-width:100%}
h1,h2{font-family:"Cormorant Garamond",Georgia,serif;font-weight:500;line-height:1.05;letter-spacing:-.02em}
.ind{width:min(640px,100%);margin:0 auto;padding:14px 16px 40px}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:4px 0 12px;flex-wrap:wrap}
.logo{color:var(--color-text);font-weight:600;letter-spacing:.18em;font-size:.78rem;text-decoration:none;min-width:0}
.logo span{color:var(--color-gold);font-weight:300;margin-left:.35em}
.back{color:var(--color-primary);text-decoration:none;font-size:.82rem;border:1px solid var(--color-primary);border-radius:999px;padding:6px 12px;flex:none}
.hero{position:relative;height:132px;border-radius:18px;overflow:hidden;border:1px solid var(--color-line);margin-bottom:14px}
.hero img{width:100%;height:100%;object-fit:cover;object-position:center 62%}
.hero figcaption{position:absolute;left:0;right:0;bottom:0;padding:36px 14px 12px;background:linear-gradient(180deg,transparent,var(--color-bg))}
.eyebrow{color:var(--color-primary);letter-spacing:.22em;text-transform:uppercase;font-size:.66rem;font-weight:600}
h1{font-size:clamp(1.7rem,7vw,2.35rem)}
.lede{color:var(--color-muted);font-size:.92rem;margin:0 0 12px}
.seg{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:4px;background:var(--color-surface);border:1px solid var(--color-line);border-radius:14px;padding:4px;margin-bottom:8px}
.seg button{min-width:0;border:0;border-radius:10px;background:transparent;color:var(--color-muted);padding:10px 6px;font-weight:600;font-size:.9rem;cursor:pointer}
.seg button.is-on{background:var(--color-surface-2);color:var(--color-primary);box-shadow:inset 0 0 0 1px var(--color-primary)}
.hint{color:var(--color-muted);font-size:.8rem;min-height:1.2em;margin:0 0 12px}
.pair{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;margin-bottom:8px}
.reward{background:var(--color-surface);border:1px solid var(--color-line);border-radius:16px;padding:12px 14px;min-width:0;position:static}
.reward .who{color:var(--color-muted);font-size:.72rem;letter-spacing:.08em;text-transform:uppercase}
.reward .forma{font-size:.95rem;margin-top:2px;overflow-wrap:anywhere}
.reward .valor{font-family:"Cormorant Garamond",Georgia,serif;font-style:italic;color:var(--color-primary);font-size:1.45rem;line-height:1;margin-top:4px}
.nota{color:var(--color-muted);font-size:.78rem;margin:0 0 14px}
.passos{list-style:none;display:grid;gap:6px;margin:0 0 14px}
.passos li{display:flex;gap:8px;align-items:baseline;min-width:0;color:var(--color-text);font-size:.88rem}
.passos b{flex:none;width:1.1rem;color:var(--color-primary);font-family:"Cormorant Garamond",Georgia,serif;font-size:1.15rem;font-weight:500}
.passos span{min-width:0;overflow-wrap:anywhere}
.form{display:grid;gap:6px}
.form label{font-size:.75rem;color:var(--color-muted);margin-top:6px}
.form input{width:100%;padding:13px 14px;border-radius:12px;border:1px solid var(--color-line);background:var(--color-bg);color:var(--color-text);font-size:16px}
.form input:focus{outline:none;border-color:var(--color-primary)}
.btn{display:flex;align-items:center;justify-content:center;width:100%;margin-top:12px;background:var(--color-accent);color:var(--color-accent-text);font-weight:600;font-size:.98rem;padding:14px 16px;border:0;border-radius:999px;cursor:pointer;text-decoration:none;text-align:center}
.btn:disabled{opacity:.55;cursor:default}
.btn-ghost{display:flex;align-items:center;justify-content:center;width:100%;margin-top:8px;background:transparent;color:var(--color-primary);border:1px solid var(--color-primary);border-radius:999px;padding:12px 16px;cursor:pointer;text-decoration:none;text-align:center}
.err{color:var(--color-danger);font-size:.84rem;min-height:1.2em}
.done{background:var(--color-surface);border:1px solid var(--color-primary);border-radius:16px;padding:16px;margin-top:4px}
.done h2{font-size:1.6rem;margin-bottom:6px}
.done p{color:var(--color-muted);font-size:.9rem;overflow-wrap:anywhere}
.list{margin-top:22px}
.list h2{font-size:1.35rem;margin-bottom:8px}
.empty{color:var(--color-muted);font-size:.88rem;padding:8px 0 4px}
.item{background:var(--color-surface);border:1px solid var(--color-line);border-radius:14px;padding:12px 14px;margin-bottom:8px;min-width:0}
.item h3{font-size:.98rem;font-weight:600;overflow-wrap:anywhere}
.item p{color:var(--color-muted);font-size:.78rem;margin-top:3px;overflow-wrap:anywhere}
.gate{padding-top:8px}
.gate .btn{margin-top:16px}
@media (min-width:720px){
  .pair{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;align-items:stretch}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

function doc(body, boot) {
  const bootJson = boot ? JSON.stringify(boot).replace(/</g, "\\u003c") : "";
  const data = boot
    ? `<script type="application/json" id="indicacao-boot">${bootJson}</script><script src="/indicacao/app.js" defer></script>`
    : "";
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>Indicação — Central do Cliente</title>
<link rel="stylesheet" href="/assets/tokens.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>
<div class="ind">
<header class="top">
  <a class="logo" href="/">PRIME<span>STUDIO</span></a>
  <a class="back" href="/">Central</a>
</header>
${body}
</div>
${data}
</body>
</html>`;
}

function hero() {
  return `<figure class="hero">
  <img src="/indicacao/media/sala.webp" alt="Sala de espera de clínica, clara e silenciosa." width="800" height="533">
  <figcaption>
    <span class="eyebrow">Indicação</span>
    <h1>Indique uma clínica</h1>
  </figcaption>
</figure>`;
}

function passos(list) {
  return `<ol class="passos">${list
    .map((p, i) => `<li><b>${i + 1}</b><span>${p}</span></li>`)
    .join("")}</ol>`;
}

export function gateHtml() {
  const c = COPY.cliente;
  return doc(`<main class="gate">
  ${hero()}
  <p class="lede">Quem indica ganha. Quem chega também.</p>
  <div class="pair">
    <article class="reward"><p class="who">${c.indicadorTitulo}</p><p class="forma">${c.indicadorForma}</p><p class="valor">${c.indicadorValor}</p></article>
    <article class="reward"><p class="who">${c.indicadoTitulo}</p><p class="forma">${c.indicadoForma}</p><p class="valor">${c.indicadoValor}</p></article>
  </div>
  <p class="nota">${c.nota}</p>
  <a class="btn" href="/">Entrar na central</a>
</main>`);
}

export function pageHtml(clinicName) {
  const c = COPY.cliente;
  const boot = { clinic: clinicName || "", copy: COPY };
  return doc(
    `<main>
  ${hero()}
  <p class="lede">Quem indica ganha. Quem chega também.</p>
  <div class="seg" role="tablist" aria-label="Quem indica">
    <button type="button" class="is-on" data-type="cliente" role="tab" aria-selected="true">Cliente</button>
    <button type="button" data-type="profissional" role="tab" aria-selected="false">Profissional</button>
  </div>
  <p class="hint" id="hint">${c.hint}</p>
  <div class="pair" id="pair">
    <article class="reward">
      <p class="who" id="whoA">${c.indicadorTitulo}</p>
      <p class="forma" id="formaA">${c.indicadorForma}</p>
      <p class="valor" id="valorA">${c.indicadorValor}</p>
    </article>
    <article class="reward">
      <p class="who" id="whoB">${c.indicadoTitulo}</p>
      <p class="forma" id="formaB">${c.indicadoForma}</p>
      <p class="valor" id="valorB">${c.indicadoValor}</p>
    </article>
  </div>
  <p class="nota" id="nota">${c.nota}</p>
  ${passos(c.passos)}
  <form class="form" id="indForm">
    <input type="hidden" id="referrerType" name="referrer_type" value="cliente">
    <label for="nome">Nome da clínica</label>
    <input id="nome" name="referred_name" required maxlength="120" autocomplete="organization" placeholder="Clínica que você quer indicar">
    <label for="contato">WhatsApp</label>
    <input id="contato" name="referred_contact" required maxlength="80" inputmode="tel" autocomplete="tel" placeholder="DDD e número">
    <button class="btn" id="send" type="submit">Indicar esta clínica</button>
    <p class="err" id="formErr" role="alert"></p>
  </form>
  <div class="done" id="done" hidden></div>
  <section class="list" aria-live="polite">
    <h2>Suas indicações</h2>
    <div id="lista"><p class="empty">Carregando…</p></div>
  </section>
</main>`,
    boot
  );
}

export const BROWSER_JS = String.raw`
(function () {
  var bootEl = document.getElementById("indicacao-boot");
  if (!bootEl) return;
  var boot = JSON.parse(bootEl.textContent);
  var type = "cliente";
  var form = document.getElementById("indForm");
  var done = document.getElementById("done");
  var lista = document.getElementById("lista");

  function text(id, value) {
    var n = document.getElementById(id);
    if (n) n.textContent = value;
  }

  function setType(next) {
    type = next === "profissional" ? "profissional" : "cliente";
    var copy = boot.copy[type];
    text("hint", copy.hint);
    text("whoA", copy.indicadorTitulo);
    text("formaA", copy.indicadorForma);
    text("valorA", copy.indicadorValor);
    text("whoB", copy.indicadoTitulo);
    text("formaB", copy.indicadoForma);
    text("valorB", copy.indicadoValor);
    text("nota", copy.nota);
    var steps = document.querySelectorAll(".passos span");
    for (var i = 0; i < steps.length; i++) steps[i].textContent = copy.passos[i] || "";
    var hidden = document.getElementById("referrerType");
    if (hidden) hidden.value = type;
    var buttons = document.querySelectorAll("[data-type]");
    for (var j = 0; j < buttons.length; j++) {
      var on = buttons[j].getAttribute("data-type") === type;
      buttons[j].classList.toggle("is-on", on);
      buttons[j].setAttribute("aria-selected", on ? "true" : "false");
    }
  }

  var tabs = document.querySelectorAll("[data-type]");
  for (var t = 0; t < tabs.length; t++) {
    tabs[t].addEventListener("click", function () { setType(this.getAttribute("data-type")); });
  }

  function el(tag, cls, value) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (value != null) n.textContent = value;
    return n;
  }

  var statusLabel = { novo: "Recebida", em_contato: "Em conversa", fechado: "Fechada", sem_retorno: "Sem retorno" };

  function renderList(items) {
    lista.replaceChildren();
    if (!items || !items.length) {
      lista.appendChild(el("p", "empty", "Nenhuma indicação ainda. O caminho é o formulário aqui em cima."));
      return;
    }
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var card = el("article", "item");
      card.appendChild(el("h3", null, it.referred_name || "Clínica"));
      var when = "";
      try { when = new Date(it.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }); } catch (e) { when = ""; }
      var bits = [it.referred_contact || "", statusLabel[it.status] || it.status || "", when];
      if (it.referrer_type === "profissional") bits.push("Como profissional");
      card.appendChild(el("p", null, bits.filter(Boolean).join(" · ")));
      lista.appendChild(card);
    }
  }

  function loadList() {
    return fetch("/api/indicacao", { credentials: "same-origin", headers: { accept: "application/json" } })
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (r) {
        if (!r.ok || !r.data || !r.data.ok) {
          lista.replaceChildren(el("p", "empty", "Não foi possível carregar suas indicações."));
          return;
        }
        renderList(r.data.items || []);
      })
      .catch(function () {
        lista.replaceChildren(el("p", "empty", "Não foi possível carregar suas indicações."));
      });
  }

  function showDone(data) {
    form.hidden = true;
    done.hidden = false;
    done.replaceChildren();
    done.appendChild(el("h2", null, "Indicação registrada"));
    var nome = data.item && data.item.referred_name ? data.item.referred_name : "a clínica";
    done.appendChild(el("p", null, "O nosso time entra em contato com " + nome + ". A mensagem só sai se você enviar."));
    if (data.whatsapp) {
      var a = el("a", "btn", "Avisar no WhatsApp");
      a.href = data.whatsapp;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      done.appendChild(a);
    }
    var copyBtn = el("button", "btn-ghost", "Copiar recado");
    copyBtn.type = "button";
    copyBtn.addEventListener("click", function () {
      var share = data.share || "";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(share).then(function () { copyBtn.textContent = "Recado copiado"; });
      } else {
        copyBtn.textContent = share;
      }
    });
    done.appendChild(copyBtn);
    var again = el("button", "btn-ghost", "Indicar outra");
    again.type = "button";
    again.addEventListener("click", function () {
      form.hidden = false;
      form.reset();
      done.hidden = true;
      setType(type);
      document.getElementById("nome").focus();
    });
    done.appendChild(again);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var err = document.getElementById("formErr");
    var btn = document.getElementById("send");
    err.textContent = "";
    btn.disabled = true;
    btn.textContent = "Registrando…";
    fetch("/api/indicacao", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        referred_name: document.getElementById("nome").value,
        referred_contact: document.getElementById("contato").value,
        referrer_type: type
      })
    }).then(function (res) {
      return res.json().then(function (data) { return { ok: res.ok, data: data }; });
    }).then(function (r) {
      btn.disabled = false;
      btn.textContent = "Indicar esta clínica";
      if (!r.ok || !r.data || !r.data.ok) {
        err.textContent = "Diga o nome da clínica e um WhatsApp.";
        return;
      }
      showDone(r.data);
      loadList();
    }).catch(function () {
      btn.disabled = false;
      btn.textContent = "Indicar esta clínica";
      err.textContent = "Não foi possível registrar agora.";
    });
  });

  setType("cliente");
  loadList();
})();
`;
