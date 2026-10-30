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

const VIEWS = new Set(["hoje", "estudio", "marca", "historico"]);
const EXISTING = [
  { id: "estudio", title: "Estúdio", href: "/estudio", order: 10 },
  { id: "marca", title: "Marca", href: "/marca", order: 20 },
  { id: "historico", title: "Histórico", href: "/historico", order: 30 },
];

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

function assemble(fromFiles) {
  const features = Array.isArray(fromFiles) ? fromFiles : [];
  const slugs = new Set(features.map((f) => slugOf(f.href)));
  const extras = EXISTING.filter((e) => !slugs.has(e.id));
  const rest = [...features, ...extras].sort(
    (a, b) => a.order - b.order || String(a.title).localeCompare(String(b.title), "pt")
  );
  return [{ id: "hoje", title: "Hoje", href: "/hoje", order: 0 }, ...rest];
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
  $$("[data-logout]").forEach((el) => el.addEventListener("click", logout));
  wireNav();
  const { ok, data } = await api("/api/features");
  const fromFiles = ok && data.ok && Array.isArray(data.menu) ? data.menu : [];
  state.menu = assemble(fromFiles);
  renderMenu();
  renderEstudio();
  renderMarca();
  renderHistorico();
  switchTab("hoje");
}

function wireNav() {
  const toggle = $("[data-nav-toggle]");
  const scrim = $("[data-nav-scrim]");
  if (toggle) toggle.addEventListener("click", () => setNav(!$("[data-rail]").classList.contains("is-open")));
  if (scrim) scrim.addEventListener("click", () => setNav(false));
}

function setNav(open) {
  const rail = $("[data-rail]");
  if (!rail) return;
  rail.classList.toggle("is-open", open);
  const scrim = $("[data-nav-scrim]");
  const toggle = $("[data-nav-toggle]");
  if (scrim) scrim.hidden = !open;
  if (toggle) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.textContent = open ? "Fechar" : "Menu";
  }
  document.body.classList.toggle("nav-open", open);
}

function setActive(id) {
  $$("[data-nav]").forEach((a) => {
    const on = a.dataset.nav === id;
    a.classList.toggle("is-active", on);
    if (on) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

function renderMenu() {
  const box = $("[data-menu]");
  if (!box) return;
  box.innerHTML = state.menu
    .map(
      (item) =>
        `<a class="nav-link" href="${esc(item.href)}" data-nav="${esc(slugOf(item.href))}" data-href="${esc(item.href)}">${esc(item.title)}</a>`
    )
    .join("");
  $$("a", box).forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      openHref(a.dataset.href);
    })
  );
}

function switchTab(tab, activeId = tab) {
  $$(".view").forEach((v) => v.classList.toggle("is-active", v.dataset.view === tab));
  setActive(activeId);
  setNav(false);
  if (tab === "historico") renderHistorico();
  if (tab === "hoje") renderHoje();
}

function openHref(href) {
  const id = slugOf(href);
  if (VIEWS.has(id)) {
    switchTab(id, id);
    return;
  }
  const item = state.menu.find((m) => slugOf(m.href) === id);
  const title = item ? item.title : "Frente";
  const view = $('[data-view="externa"]');
  if (view) {
    view.innerHTML = `<div class="block">
      <span class="eyebrow">Frente</span>
      <h2>${esc(title)}</h2>
      <p class="hint">O caminho já está no menu. A tela desta frente ainda não foi ligada.</p>
      <button type="button" class="btn-ghost" id="backHoje">Voltar para hoje</button>
    </div>`;
    const back = $("#backHoje");
    if (back) back.addEventListener("click", () => openHref("/hoje"));
  }
  switchTab("externa", id);
}

function renderHoje() {
  const v = $('[data-view="hoje"]');
  if (!v) return;
  const tema = state.onboarding.tema_amanha || "";
  const temaBlock = tema
    ? `<p class="hoje-tema">Para amanhã: <em>${esc(tema)}</em>.</p>
       <button type="button" class="btn-ghost btn-xs" id="temaEdit">Ajustar tema</button>
       <div class="form hoje-edit" id="temaEditor" hidden>
         <label for="hojeTema">Tema de amanhã</label>
         <input id="hojeTema" maxlength="140" autocomplete="off" value="${esc(tema)}">
         <button type="button" class="btn-ghost" id="temaSave">Guardar tema</button>
       </div>`
    : `<div class="form hoje-edit">
         <label for="hojeTema">Tema de amanhã</label>
         <input id="hojeTema" maxlength="140" autocomplete="off" placeholder="Ex.: um detalhe do espaço da clínica">
         <button type="button" class="btn-ghost" id="temaSave">Guardar tema</button>
       </div>`;
  const fronts = state.menu.filter((m) => slugOf(m.href) !== "hoje" && slugOf(m.href) !== "estudio");
  const list = fronts.length
    ? `<ul class="hoje-frentes">${fronts
        .map((f) => `<li><button type="button" data-go="${esc(f.href)}">${esc(f.title)}</button></li>`)
        .join("")}</ul>`
    : "";
  v.innerHTML = `
    <div class="block hoje">
      <span class="eyebrow">Hoje</span>
      <h2>${esc(saudacao(state.me && state.me.name))}</h2>
      <p class="hoje-q">O que a clínica posta hoje?</p>
      <p class="hint">Abra o estúdio, monte a peça e deixe para o ok. Amanhã, faça de novo.</p>
      <div class="row"><button class="btn" id="goEstudio" type="button">Abrir o estúdio</button></div>
      ${temaBlock}
    </div>
    <div class="block">
      <span class="eyebrow">Neste acesso</span>
      <h2>O resto da central</h2>
      ${list}
      <p class="note">Presença, link na bio, educação, comunidade e indicação aparecem no menu quando cada frente está ligada.</p>
    </div>`;
  $("#goEstudio").addEventListener("click", () => openHref("/estudio"));
  const edit = $("#temaEdit");
  if (edit) {
    edit.addEventListener("click", () => {
      $("#temaEditor").hidden = false;
      edit.hidden = true;
    });
  }
  const save = $("#temaSave");
  if (save) save.addEventListener("click", saveTema);
  $$("[data-go]", v).forEach((b) => b.addEventListener("click", () => openHref(b.dataset.go)));
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
  v.innerHTML = `
    <div class="block">
      <span class="eyebrow">O que você posta hoje?</span>
      <h2>Estúdio</h2>
      <p class="hint">Escolha o formato, diga o tema, e o estúdio monta a peça no tom da sua clínica.${
        state.aiOn ? "" : " <b style='color:var(--color-accent)'>IA não configurada: gera um exemplo.</b>"
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
      <span class="eyebrow">Memória da marca</span>
      <h2>Marca da clínica</h2>
      <p class="hint">Cores, fontes e tom que a IA respeita ao montar cada peça. Quanto mais completo, mais parece sua clínica.</p>

      <div class="lbl" style="color:var(--color-accent);font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;margin:10px 0 4px">Cores</div>
      <div class="chips" id="colorChips"></div>
      <div class="inline"><input id="colorIn" type="text" placeholder="código ou nome da cor" maxlength="24"><button class="btn-ghost btn-xs" id="addColor">Adicionar</button></div>

      <div class="lbl" style="color:var(--color-accent);font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;margin:16px 0 4px">Fontes</div>
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
