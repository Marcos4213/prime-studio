// Central do Cliente — SPA. Vanilla JS, sem build.
function syncScheme() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim();
  const hex = raw.replace("#", "");
  const theme = document.querySelector('meta[name="theme-color"]');
  if (theme && raw) theme.content = raw;
  if (hex.length !== 6) return;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  document.documentElement.style.colorScheme = lum > 0.6 ? "light" : "dark";
}
syncScheme();

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const FORMATS = [
  { key: "post", ic: "▢", nm: "Post", ds: "imagem única" },
  { key: "carousel", ic: "▥", nm: "Carrossel", ds: "várias telas" },
  { key: "video", ic: "▷", nm: "Vídeo", ds: "reels / story" },
];

const NAV = [
  { id: "hoje", title: "Início", href: "/hoje", icon: "inicio" },
  { id: "estudio", title: "Estúdio", href: "/estudio", icon: "estudio" },
  { id: "presenca", title: "Presença", href: "/presenca", icon: "presenca" },
  { id: "link-na-bio", title: "Link na bio", href: "/link-na-bio", icon: "link" },
  { id: "educacao", title: "Educação", href: "/educacao", icon: "educacao" },
  { id: "comunidade", title: "Comunidade", href: "/comunidade", icon: "comunidade" },
  { id: "indicacao", title: "Indicação", href: "/indicacao", icon: "indicacao" },
];
const FRONTS = new Set(NAV.filter((item) => item.id !== "hoje").map((item) => item.id));
const MAIS = new Set(["educacao", "comunidade", "indicacao"]);

function icon(name) {
  const paths = {
    inicio: '<path d="M4 11.2 12 4l8 7.2V20a1 1 0 0 1-1 1h-5.2v-6.2H10.2V21H5a1 1 0 0 1-1-1z"/>',
    estudio: '<rect x="4" y="4" width="16" height="16" rx="3"/>',
    presenca: '<circle cx="12" cy="12" r="7"/>',
    link: '<path d="M10 13.2a4.6 4.6 0 0 0 6.5.1l1.8-1.8a4.6 4.6 0 0 0-6.5-6.5L10.6 6.2"/><path d="M14 10.8a4.6 4.6 0 0 0-6.5-.1l-1.8 1.8a4.6 4.6 0 0 0 6.5 6.5l1.2-1.2"/>',
    educacao: '<path d="M3.5 7 12 3.5 20.5 7 12 10.5z"/><path d="M6.5 10.2V16c0 .4 2.4 2.5 5.5 2.5s5.5-2.1 5.5-2.5v-5.8"/>',
    comunidade: '<circle cx="8" cy="9" r="2.2"/><circle cx="16" cy="9" r="2.2"/><path d="M4.2 18.2c.5-2.3 2.1-3.6 3.8-3.6h.4c1.6 0 3.2 1.3 3.6 3.6"/><path d="M12.2 18.2c.4-2.3 2-3.6 3.6-3.6h.4c1.7 0 3.3 1.3 3.8 3.6"/>',
    indicacao: '<path d="M12 4.5v15"/><path d="M8 8.5h5.5a2.8 2.8 0 0 1 0 5.6H8.8a2.8 2.8 0 0 0 0 5.6H16"/>',
    mais: '<circle cx="6" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18" cy="12" r="1.3"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || ""}</svg>`;
}

const state = {
  me: null,
  aiOn: false,
  format: "post",
  profile: null,
  onboarding: { completo: false, tema_amanha: "" },
  menu: [],
};

async function api(path, opts = {}) {
  const res = await fetch(path, {
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  let data = {};
  try {
    data = await res.json();
  } catch {}
  return { ok: res.ok, status: res.status, data };
}

function slugOf(href) {
  const raw = String(href || "");
  const path = raw.startsWith("#") ? raw.slice(1) : raw.replace(/^\//, "");
  return (path.split("/")[0] || "hoje").toLowerCase();
}

function saudacao(name) {
  let hour = 12;
  try {
    hour = Number(
      new Intl.DateTimeFormat("pt-BR", {
        hour: "numeric",
        hourCycle: "h23",
        timeZone: "America/Sao_Paulo",
      }).format(new Date())
    );
  } catch {}
  const part = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const n = String(name || "").trim();
  return n ? `${part}, ${n}` : part;
}

function menuItems(fromFiles) {
  const byId = new Map((Array.isArray(fromFiles) ? fromFiles : []).map((item) => [slugOf(item.href), item]));
  return NAV.map((item) => {
    if (item.id === "hoje") return item;
    const file = byId.get(item.id);
    if (!file) return item;
    return { ...item, title: file.title || item.title, href: file.href || item.href };
  });
}

// ---------- Boot ----------
async function boot() {
  const { ok, data } = await api("/api/me");
  if (ok && data.ok) {
    state.me = data.client;
    state.aiOn = data.ai_configurada;
    state.onboarding = data.onboarding || { completo: false, tema_amanha: "" };
    if (!state.onboarding.completo) showOnboarding();
    else showApp();
  } else {
    showLogin();
  }
}

function showLogin() {
  $("#boot").hidden = true;
  $("#onboardingView").hidden = true;
  $("#app").hidden = true;
  $("#loginView").hidden = false;
}

function showOnboarding() {
  $("#boot").hidden = true;
  $("#loginView").hidden = true;
  $("#app").hidden = true;
  $("#onboardingView").hidden = false;
  paintOnb(0);
}

async function showApp() {
  $("#boot").hidden = true;
  $("#loginView").hidden = true;
  $("#onboardingView").hidden = true;
  const app = $("#app");
  app.hidden = false;
  app.innerHTML = "";
  app.appendChild($("#appShell").content.cloneNode(true));
  const who = state.me.name || state.me.email;
  $$("[data-who]").forEach((el) => {
    el.textContent = who;
  });
  $$("[data-mail]").forEach((el) => {
    el.textContent = state.me.email || "";
  });
  $$("[data-logout]").forEach((el) => el.addEventListener("click", logout));
  $$("[data-perfil]").forEach((el) => el.addEventListener("click", () => openHref("/marca")));
  wireChrome();
  const { ok, data } = await api("/api/features");
  const fromFiles = ok && data.ok && Array.isArray(data.menu) ? data.menu : [];
  state.menu = menuItems(fromFiles);
  renderMenu();
  renderMarca();
  renderHistorico();
  openHref(hrefFor(paneFromHash()), { replace: true });
}

function wireChrome() {
  const shell = $("[data-shell]");
  const collapse = $("[data-collapse]");
  setCollapsed(localStorage.getItem("prime.casca.rail") === "1");
  if (collapse) {
    collapse.addEventListener("click", () => setCollapsed(!(shell && shell.classList.contains("is-collapsed"))));
  }
  $$("[data-tab]").forEach((btn) => {
    const id = btn.dataset.tab;
    if (id === "mais") {
      btn.innerHTML = `${icon("mais")}<span>Mais</span>`;
      btn.addEventListener("click", () => toggleMais());
      return;
    }
    const item = NAV.find((entry) => entry.id === id);
    if (!item) return;
    const label = item.id === "link-na-bio" ? "Link" : item.title;
    const glyph = item.id === "estudio" ? `<span class="tab-orb">${icon(item.icon)}</span>` : icon(item.icon);
    btn.innerHTML = `${glyph}<span>${esc(label)}</span>`;
    btn.addEventListener("click", () => openHref(item.href));
  });
  const mais = $("[data-mais]");
  if (mais) {
    mais.addEventListener("click", (e) => {
      if (e.target === mais) toggleMais(false);
    });
    $$("[data-go]", mais).forEach((btn) => btn.addEventListener("click", () => openHref(btn.dataset.go)));
  }
  const frame = $("[data-front]");
  if (frame) frame.addEventListener("load", () => dressFrame(frame));
  window.addEventListener("popstate", () => openHref(hrefFor(paneFromHash()), { quiet: true }));
}

function setCollapsed(collapsed) {
  const shell = $("[data-shell]");
  const collapse = $("[data-collapse]");
  if (!shell) return;
  shell.classList.toggle("is-collapsed", collapsed);
  try {
    localStorage.setItem("prime.casca.rail", collapsed ? "1" : "0");
  } catch {}
  if (collapse) {
    collapse.setAttribute("aria-pressed", collapsed ? "true" : "false");
    collapse.setAttribute("aria-label", collapsed ? "Abrir menu" : "Recolher menu");
    collapse.textContent = collapsed ? "Abrir" : "Recolher";
  }
}

function toggleMais(force) {
  const mais = $("[data-mais]");
  const tab = $('[data-tab="mais"]');
  if (!mais) return;
  const open = typeof force === "boolean" ? force : mais.hidden;
  mais.hidden = !open;
  if (tab) tab.setAttribute("aria-expanded", open ? "true" : "false");
}

function paneFromHash() {
  const raw = location.hash.replace(/^#\/?/, "").split(/[/?]/)[0];
  if (raw === "perfil") return "marca";
  if (raw === "historico" || raw === "marca") return raw;
  if (raw === "inicio" || raw === "hoje" || !raw) return "hoje";
  if (FRONTS.has(raw)) return raw;
  return "hoje";
}

function hrefFor(id) {
  if (id === "hoje") return "/hoje";
  if (id === "marca") return "/marca";
  if (id === "historico") return "/historico";
  return `/${id}`;
}

function hashFor(id) {
  if (id === "hoje") return "#inicio";
  if (id === "marca") return "#perfil";
  return `#${id}`;
}

function setActive(id) {
  $$("[data-nav]").forEach((a) => {
    const on = a.dataset.nav === id;
    a.classList.toggle("is-active", on);
    if (on) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  $$("[data-tab]").forEach((btn) => {
    const tab = btn.dataset.tab;
    const on = tab === "mais" ? MAIS.has(id) : tab === id;
    btn.classList.toggle("is-active", on);
    if (on) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  });
  $$("[data-perfil]").forEach((btn) => {
    const on = id === "marca";
    btn.classList.toggle("is-active", on);
    if (on) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  });
}

function renderMenu() {
  const box = $("[data-menu]");
  if (!box) return;
  box.innerHTML = state.menu
    .map(
      (item) =>
        `<a class="nav-link" href="${esc(hashFor(item.id))}" data-nav="${esc(item.id)}" data-href="${esc(item.href)}">${icon(item.icon)}<span class="nav-label">${esc(item.title)}</span></a>`
    )
    .join("");
  $$("a", box).forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      openHref(a.dataset.href);
    })
  );
}

function showPane(id) {
  const front = FRONTS.has(id);
  $$(".view").forEach((view) => view.classList.toggle("is-active", !front && view.dataset.view === id));
  const frame = $("[data-front]");
  const shell = $("[data-shell]");
  if (shell) shell.classList.toggle("is-front", front);
  if (frame) {
    if (front) {
      const item = state.menu.find((entry) => entry.id === id) || NAV.find((entry) => entry.id === id);
      const src = item ? item.href : `/${id}`;
      frame.hidden = false;
      frame.title = item ? item.title : "Frente";
      if (frame.dataset.src !== src) {
        frame.dataset.src = src;
        frame.src = src;
      }
    } else {
      frame.hidden = true;
    }
  }
  setActive(id);
  if (id === "historico") renderHistorico();
  if (id === "hoje") renderHoje();
}

function openHref(href, opts = {}) {
  const id = slugOf(href);
  const pane = id === "inicio" ? "hoje" : id;
  showPane(pane);
  toggleMais(false);
  if (opts.quiet) return;
  const hash = hashFor(pane);
  if (location.hash === hash) return;
  const method = opts.replace ? "replaceState" : "pushState";
  history[method](null, "", hash);
}

function dressFrame(frame) {
  let doc;
  try {
    doc = frame.contentDocument;
  } catch {
    return;
  }
  if (!doc || !doc.head || doc.getElementById("casca-dress")) return;
  const style = doc.createElement("style");
  style.id = "casca-dress";
  style.textContent = `
    header.top, header.edu-top, .theme-bar, a.central-link, .edu-toplink { display: none !important; }
    .circulo, .wrap, .ind, .edu { max-width: none !important; width: 100% !important; }
    body { background: var(--color-bg); }
    @media (max-width: 899px) {
      .circulo, .wrap, .ind, .edu, .page, main {
        padding-bottom: calc(96px + env(safe-area-inset-bottom)) !important;
      }
    }
  `;
  doc.head.appendChild(style);
  doc.addEventListener("click", (event) => {
    const link = event.target.closest && event.target.closest("a[href]");
    if (!link) return;
    let url;
    try {
      url = new URL(link.getAttribute("href"), location.origin);
    } catch {
      return;
    }
    if (url.origin !== location.origin) return;
    if (url.pathname === "/") {
      event.preventDefault();
      openHref("/estudio");
    }
  });
}

let hojeTicket = 0;
async function renderHoje() {
  const v = $('[data-view="hoje"]');
  if (!v) return;
  const ticket = ++hojeTicket;
  const nome = state.me && state.me.name;
  v.innerHTML = `
    <div class="hub">
      <header class="hub-intro">
        <p class="eyebrow">Início</p>
        <h2>${esc(saudacao(nome))}</h2>
      </header>
      <article class="block hub-card hub-task">
        <p class="eyebrow">Tarefa do dia</p>
        <h3>Montar a peça de hoje</h3>
        <p class="hint">Deixe pronta para o ok da clínica. Nada vai ao ar sozinho.</p>
      </article>
      <article class="block hub-card hub-angle">
        <p class="eyebrow">Ângulo do dia</p>
        <h3>Abrindo o ângulo…</h3>
      </article>
      <article class="block hub-card hub-presence">
        <p class="eyebrow">Presença</p>
        <h3>Olhando as portas…</h3>
      </article>
      <article class="block hub-card hub-create">
        <p class="eyebrow">Atalho</p>
        <h3>Criar post</h3>
        <p class="hint">O estúdio monta a peça no tom da clínica.</p>
        <button class="btn" id="goEstudio" type="button">Criar post</button>
      </article>
    </div>`;
  const go = $("#goEstudio");
  if (go) go.addEventListener("click", () => openHref("/estudio"));
  const { ok, data } = await api("/api/hoje");
  if (ticket !== hojeTicket || !v.isConnected) return;
  const angle = ok && data.ok ? data.angle : "O ângulo de hoje volta quando a central responder.";
  const weekday = ok && data.ok && data.weekday ? data.weekday : "";
  const tomorrow = ok && data.ok ? data.tomorrow : "";
  const presenca = ok && data.ok ? data.presenca : "A presença ainda não respondeu.";
  const tema = (ok && data.ok && data.tema_amanha) || state.onboarding.tema_amanha || "";
  const task = $(".hub-task", v);
  const angleCard = $(".hub-angle", v);
  const presence = $(".hub-presence", v);
  if (task) {
    task.innerHTML = `
      <p class="eyebrow">Tarefa do dia</p>
      <h3>Montar a peça de hoje</h3>
      <p class="hint">Deixe pronta para o ok da clínica. Nada vai ao ar sozinho.</p>
      ${tema ? `<p class="hoje-tema">Tema combinado: <em>${esc(tema)}</em>.</p>` : ""}`;
  }
  if (angleCard) {
    angleCard.innerHTML = `
      <p class="eyebrow">Ângulo do dia${weekday ? ` · ${esc(weekday)}` : ""}</p>
      <h3>${esc(angle)}</h3>
      ${tomorrow ? `<p class="hint">Amanhã muda para: ${esc(tomorrow)}</p>` : ""}`;
  }
  if (presence) {
    presence.innerHTML = `
      <p class="eyebrow">Presença</p>
      <h3>${esc(presenca)}</h3>
      <button class="btn-ghost" type="button" data-go="/presenca">Ver a presença</button>`;
    const button = $("[data-go]", presence);
    if (button) button.addEventListener("click", () => openHref(button.dataset.go));
  }
}

async function saveTema() {
  const input = $("#hojeTema");
  const btn = $("#temaSave");
  if (!input || !btn) return;
  btn.disabled = true;
  const { ok, data } = await api("/api/onboarding", {
    method: "POST",
    body: { tema_amanha: input.value },
  });
  btn.disabled = false;
  if (ok && data.ok) {
    state.onboarding = data.onboarding;
    renderHoje();
    return;
  }
  if (!$("#temaErr")) input.insertAdjacentHTML("afterend", `<p class="err" id="temaErr">Não foi possível guardar.</p>`);
}

let onbStep = 0;
function paintOnb(step) {
  onbStep = step;
  $$("[data-step]").forEach((el) => {
    el.hidden = Number(el.dataset.step) !== step;
  });
  $$("#onbBar i").forEach((bar, i) => bar.classList.toggle("is-on", i <= step));
  const count = $("#onbCount");
  if (count) count.textContent = `${step + 1} de 3`;
  const back = $("#onbBack");
  if (back) back.hidden = step === 0;
  const next = $("#onbNext");
  if (next) next.textContent = step === 2 ? "Entrar na central" : "Continuar";
  const err = $("#onbErr");
  if (err) err.hidden = true;
}

async function finishOnboarding() {
  const btn = $("#onbNext");
  const err = $("#onbErr");
  const tema = $("#temaAmanha");
  if (err) err.hidden = true;
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Entrando…";
  }
  const { ok, data } = await api("/api/onboarding", {
    method: "POST",
    body: { tema_amanha: tema ? tema.value : "" },
  });
  if (btn) btn.disabled = false;
  if (ok && data.ok) {
    state.onboarding = data.onboarding;
    showApp();
    return;
  }
  if (btn) btn.textContent = "Entrar na central";
  if (err) {
    err.textContent = "Não foi possível guardar a entrada. Tente de novo.";
    err.hidden = false;
  }
}

// ---------- Login ----------
$("#togglePass").addEventListener("click", () => {
  const input = $("#password");
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  $("#togglePass").textContent = show ? "Ocultar" : "Mostrar";
  $("#togglePass").setAttribute("aria-pressed", show ? "true" : "false");
});

$("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const err = $("#loginErr");
  err.hidden = true;
  const btn = $("#loginForm .btn");
  btn.disabled = true;
  btn.textContent = "Entrando…";
  const { ok, data } = await api("/api/login", {
    method: "POST",
    body: { email: $("#email").value, password: $("#password").value },
  });
  btn.disabled = false;
  btn.textContent = "Entrar";
  if (ok && data.ok) {
    boot();
  } else {
    err.textContent = data.error === "credenciais" ? "E-mail ou senha incorretos." : "Não foi possível entrar.";
    err.hidden = false;
  }
});

$("#onbBack").addEventListener("click", () => {
  if (onbStep > 0) paintOnb(onbStep - 1);
});

$("#onbForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (onbStep < 2) paintOnb(onbStep + 1);
  else finishOnboarding();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setNav(false);
});

async function logout() {
  await api("/api/logout", { method: "POST" });
  location.reload();
}

// ---------- Estúdio ----------
function renderEstudio() {
  const v = $('[data-view="estudio"]');
  if (!v) return;
  v.innerHTML = `
    <div class="block">
      <span class="eyebrow">O que você posta hoje?</span>
      <h2>Estúdio</h2>
      <p class="hint">Escolha o formato, diga o tema, e o estúdio monta a peça no tom da sua clínica.${
        state.aiOn ? "" : " <b class=\"warn-note\">IA não configurada: gera um exemplo.</b>"
      }</p>
      <div class="formats">
        ${FORMATS.map(
          (f) =>
            `<button class="fmt${f.key === state.format ? " is-active" : ""}" data-fmt="${f.key}">
               <span class="ic">${f.ic}</span><span class="nm">${f.nm}</span><span class="ds">${f.ds}</span>
             </button>`
        ).join("")}
      </div>
      <label class="form" style="display:block">
        <span style="font-size:.78rem;color:var(--color-muted)">Tema</span>
        <input id="theme" type="text" maxlength="400" placeholder="Ex.: a estrutura da clínica, o cuidado no atendimento…" style="margin-top:6px">
      </label>
      <div class="row">
        <button class="btn" id="genBtn">Gerar peça</button>
        <span class="spin" id="genSpin" hidden>Montando a peça…</span>
      </div>
    </div>
    <div class="result" id="result"></div>
  `;
  $$(".fmt", v).forEach((b) =>
    b.addEventListener("click", () => {
      state.format = b.dataset.fmt;
      $$(".fmt", v).forEach((x) => x.classList.toggle("is-active", x === b));
    })
  );
  $("#genBtn", v).addEventListener("click", generate);
}

async function generate() {
  const btn = $("#genBtn");
  const spin = $("#genSpin");
  btn.disabled = true;
  spin.hidden = false;
  const { ok, data } = await api("/api/generate", {
    method: "POST",
    body: { format: state.format, theme: $("#theme").value },
  });
  btn.disabled = false;
  spin.hidden = true;
  const box = $("#result");
  if (ok && data.ok) {
    box.innerHTML = renderPiece(data.piece, true);
    wirePieceActions(box, data.piece.id);
  } else {
    box.innerHTML = `<div class="block"><p class="err">Não foi possível gerar${
      data.detail ? ": " + esc(data.detail) : "."
    }</p></div>`;
  }
}

function renderPiece(piece, fresh) {
  const o = piece.output || {};
  let inner = "";
  if (piece.format === "post") {
    inner = `
      <div class="lbl">Legenda</div><p>${esc(o.caption)}</p>
      <div class="lbl">Prompt de imagem</div><div class="mono">${esc(o.imagePrompt)}</div>`;
  } else if (piece.format === "carousel") {
    inner =
      `<div class="lbl">Legenda</div><p>${esc(o.caption)}</p>` +
      (o.slides || [])
        .map(
          (s, i) =>
            `<div class="slide"><div class="lbl">Tela ${i + 1} — ${esc(s.title)}</div><div class="mono">${esc(
              s.imagePrompt
            )}</div></div>`
        )
        .join("");
  } else {
    const r = o.recording || {};
    const sc = o.script || {};
    inner = `
      <div class="lbl">Gancho</div><p>${esc(sc.hook)}</p>
      <div class="lbl">Desenvolvimento</div><p>${esc(sc.body)}</p>
      <div class="lbl">Chamada</div><p>${esc(sc.cta)}</p>
      <div class="lbl">Como gravar — ${r.mode === "narracao" ? "narração sobre imagem/vídeo" : "pessoa na câmera"}</div>
      <div class="mono">${(r.tips || []).map((t) => "• " + esc(t)).join("\n")}</div>`;
  }
  const warns = (o.warnings || []).length
    ? `<div class="warns"><b>Revisar antes de aprovar:</b><br>${o.warnings.map(esc).join("<br>")}</div>`
    : "";
  const srcBadge = `<span class="badge src-${piece.source}">${piece.source === "ia" ? "Gerado por IA" : "Exemplo"}</span>`;
  const stBadge = `<span class="badge st-${piece.status}">${piece.status}</span>`;
  const actions = fresh
    ? `<div class="row">
         <button class="btn-ghost" data-approve>Marcar como aprovado</button>
         <span class="note">Nada publica sozinho — a peça fica no histórico para o seu ok.</span>
       </div>`
    : "";
  return `<div class="block"><div class="piece">
      <div>${srcBadge}${stBadge}</div>
      <h3>${fmtName(piece.format)}${piece.theme ? " · " + esc(piece.theme) : ""}</h3>
      ${inner}${warns}
    </div>${actions}</div>`;
}

function wirePieceActions(box, id) {
  const b = $("[data-approve]", box);
  if (!b) return;
  b.addEventListener("click", async () => {
    b.disabled = true;
    const { ok, data } = await api(`/api/pieces/${id}/approve`, { method: "POST" });
    if (ok && data.ok) {
      b.textContent = "Aprovado";
      renderHistorico();
    } else {
      b.disabled = false;
    }
  });
}

function fmtName(k) {
  return (FORMATS.find((f) => f.key === k) || {}).nm || k;
}

// ---------- Marca ----------
async function renderMarca() {
  const v = $('[data-view="marca"]');
  v.innerHTML = `<div class="block"><span class="spin">Carregando perfil de marca…</span></div>`;
  const { ok, data } = await api("/api/profile");
  const p = ok && data.ok ? data.profile : { colors: [], fonts: [], tone: "", avoid: "", highlights: "" };
  state.profile = p;
  v.innerHTML = `
    <div class="block">
      <span class="eyebrow">Conta</span>
      <h2>Perfil da clínica</h2>
      <p class="hint">Cores, fontes e tom que a IA respeita ao montar cada peça. Quanto mais completo, mais parece sua clínica.</p>
      <p class="row"><button type="button" class="btn-ghost btn-xs" id="goHist">Peças guardadas</button></p>

      <div class="eyebrow" style="margin:10px 0 4px">Cores</div>
      <div class="chips" id="colorChips"></div>
      <div class="inline"><input id="colorIn" type="text" placeholder="código ou nome da cor" maxlength="24"><button class="btn-ghost btn-xs" id="addColor">Adicionar</button></div>

      <div class="eyebrow" style="margin:16px 0 4px">Fontes</div>
      <div class="chips" id="fontChips"></div>
      <div class="inline"><input id="fontIn" type="text" placeholder="Ex.: Cormorant Garamond" maxlength="60"><button class="btn-ghost btn-xs" id="addFont">Adicionar</button></div>

      <div class="form" style="margin-top:16px">
        <label for="tone">Tom da clínica</label>
        <textarea id="tone" rows="3" maxlength="1200" placeholder="Como a clínica fala: sóbria, acolhedora, direta…">${esc(p.tone)}</textarea>
        <label for="avoid">O que a clínica nunca diz</label>
        <textarea id="avoid" rows="2" maxlength="1200" placeholder="Palavras, promessas ou temas a evitar.">${esc(p.avoid)}</textarea>
        <label for="highlights">O que destaca a clínica</label>
        <textarea id="highlights" rows="2" maxlength="1200" placeholder="Diferenciais, especialidade, o que a torna única.">${esc(p.highlights)}</textarea>
        <button class="btn" id="saveBrand" style="margin-top:14px">Salvar marca</button>
        <span class="note" id="brandSaved" hidden>Marca salva.</span>
      </div>
    </div>`;

  const colors = [...(p.colors || [])];
  const fonts = [...(p.fonts || [])];
  const drawColors = () => {
    $("#colorChips").innerHTML = colors
      .map(
        (c, i) =>
          `<span class="chip"><span class="sw" style="background:${esc(c)}"></span>${esc(c)}<button data-i="${i}" data-k="c">×</button></span>`
      )
      .join("");
    $$('#colorChips button').forEach((b) => b.addEventListener("click", () => { colors.splice(+b.dataset.i, 1); drawColors(); }));
  };
  const drawFonts = () => {
    $("#fontChips").innerHTML = fonts
      .map((f, i) => `<span class="chip">${esc(f)}<button data-i="${i}">×</button></span>`)
      .join("");
    $$('#fontChips button').forEach((b) => b.addEventListener("click", () => { fonts.splice(+b.dataset.i, 1); drawFonts(); }));
  };
  drawColors();
  drawFonts();
  const hist = $("#goHist");
  if (hist) hist.addEventListener("click", () => openHref("/historico"));
  $("#addColor").addEventListener("click", () => {
    const val = $("#colorIn").value.trim();
    if (val && colors.length < 8) { colors.push(val); $("#colorIn").value = ""; drawColors(); }
  });
  $("#addFont").addEventListener("click", () => {
    const val = $("#fontIn").value.trim();
    if (val && fonts.length < 6) { fonts.push(val); $("#fontIn").value = ""; drawFonts(); }
  });
  $("#saveBrand").addEventListener("click", async () => {
    const btn = $("#saveBrand");
    btn.disabled = true;
    const { ok } = await api("/api/profile", {
      method: "PUT",
      body: {
        colors,
        fonts,
        tone: $("#tone").value,
        avoid: $("#avoid").value,
        highlights: $("#highlights").value,
      },
    });
    btn.disabled = false;
    if (ok) {
      const s = $("#brandSaved");
      s.hidden = false;
      setTimeout(() => (s.hidden = true), 2500);
    }
  });
}

// ---------- Histórico ----------
async function renderHistorico() {
  const v = $('[data-view="historico"]');
  if (!v) return;
  v.innerHTML = `<div class="block"><span class="eyebrow">Acervo</span><h2>Histórico</h2><p class="hint">Tudo que o estúdio montou para a sua clínica.</p><div class="hist" id="hist"><span class="spin">Carregando…</span></div></div>`;
  const { ok, data } = await api("/api/history");
  const list = ok && data.ok ? data.items : [];
  const box = $("#hist");
  if (!list.length) {
    box.innerHTML = `<div class="empty">Nada por aqui ainda. Crie sua primeira peça no Estúdio.</div>`;
    return;
  }
  box.innerHTML = list
    .map(
      (it) =>
        `<button class="hitem" data-id="${it.id}">
           <span><span class="t">${fmtName(it.format)}${it.theme ? " · " + esc(it.theme) : ""}</span>
           <span class="m">${new Date(it.created_at).toLocaleString("pt-BR")}</span></span>
           <span><span class="badge src-${it.source}">${it.source === "ia" ? "IA" : "exemplo"}</span><span class="badge st-${it.status}">${it.status}</span></span>
         </button>`
    )
    .join("");
  $$(".hitem", box).forEach((b) =>
    b.addEventListener("click", () => openPiece(b.dataset.id))
  );
}

async function openPiece(id) {
  const { ok, data } = await api(`/api/pieces/${id}`);
  if (!ok || !data.ok) return;
  const v = $('[data-view="historico"]');
  v.innerHTML =
    `<button class="btn-ghost btn-xs" id="backHist" style="margin-bottom:14px">← Voltar</button>` +
    renderPiece(data.piece, false);
  $("#backHist").addEventListener("click", renderHistorico);
}

boot();
