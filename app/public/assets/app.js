// Central do Cliente — SPA. Vanilla JS, sem build.
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const FORMATS = [
  { key: "post", ic: "▢", nm: "Post", ds: "imagem única" },
  { key: "carousel", ic: "▥", nm: "Carrossel", ds: "várias telas" },
  { key: "video", ic: "▷", nm: "Vídeo", ds: "reels / story" },
];

const state = { me: null, aiOn: false, format: "post", profile: null };

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

// ---------- Boot ----------
async function boot() {
  const { ok, data } = await api("/api/me");
  if (ok && data.ok) {
    state.me = data.client;
    state.aiOn = data.ai_configurada;
    showApp();
  } else {
    showLogin();
  }
}

function showLogin() {
  $("#app").hidden = true;
  $("#loginView").hidden = false;
}

function showApp() {
  $("#loginView").hidden = true;
  const app = $("#app");
  app.hidden = false;
  app.innerHTML = "";
  app.appendChild($("#appShell").content.cloneNode(true));
  $("[data-who]").textContent = state.me.name || state.me.email;
  $("[data-logout]").addEventListener("click", logout);
  $$(".tab").forEach((t) =>
    t.addEventListener("click", () => switchTab(t.dataset.tab))
  );
  renderEstudio();
  renderMarca();
  renderHistorico();
}

function switchTab(tab) {
  $$(".tab").forEach((t) => t.classList.toggle("is-active", t.dataset.tab === tab));
  $$(".view").forEach((v) => v.classList.toggle("is-active", v.dataset.view === tab));
  if (tab === "historico") renderHistorico();
}

// ---------- Login ----------
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
        state.aiOn ? "" : " <b style='color:var(--warn)'>IA não configurada: gera um exemplo.</b>"
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
        <span style="font-size:.78rem;color:var(--mut)">Tema</span>
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

      <div class="lbl" style="color:var(--gold);font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;margin:10px 0 4px">Cores</div>
      <div class="chips" id="colorChips"></div>
      <div class="inline"><input id="colorIn" type="text" placeholder="#c8a25a ou nome" maxlength="24"><button class="btn-ghost btn-xs" id="addColor">Adicionar</button></div>

      <div class="lbl" style="color:var(--gold);font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;margin:16px 0 4px">Fontes</div>
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
