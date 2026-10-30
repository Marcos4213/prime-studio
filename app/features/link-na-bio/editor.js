// Fonte do editor no navegador. Se mudar este arquivo, regenere editor-inline.js
// (o teste model.test.js confere os dois).
(function () {
  "use strict";

  const $ = (sel, el) => (el || document).querySelector(sel);
  const CHIP = {
    none: "A bio ainda não foi revisada",
    drift: "A página mudou desde a revisão",
    stale: "Faz uma semana desde a última revisão",
    fresh: "Revisão em dia",
  };
  const DOOR = { whatsapp: "WhatsApp", site: "Site", instagram: "Instagram", google: "Google" };
  const URL_LABEL = {
    whatsapp: "WhatsApp com DDD",
    site: "Endereço do site",
    instagram: "Perfil",
    google: "Perfil no Google",
  };
  const URL_PLACEHOLDER = {
    whatsapp: "(11) 90000-0000",
    site: "suaclinica.com.br",
    instagram: "@suaclinica",
    google: "link do Google",
  };

  let model = null;
  let dirty = false;
  let busy = false;

  function api(path, opts) {
    return fetch(path, {
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      method: opts && opts.method ? opts.method : "GET",
      body: opts && opts.body ? JSON.stringify(opts.body) : undefined,
    }).then(async (res) => {
      let data = {};
      try {
        data = await res.json();
      } catch (err) {
        data = {};
      }
      return { ok: res.ok, status: res.status, data: data };
    });
  }

  function formatWhen(iso, withTime) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const day = date
      .toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "numeric", month: "short" })
      .replace(".", "");
    if (!withTime) return day;
    const time = date.toLocaleTimeString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
    });
    return day + ", " + time;
  }

  function flash(message, kind) {
    const el = $("#flash");
    el.hidden = !message;
    el.textContent = message || "";
    el.className = "flash" + (kind ? " is-" + kind : "");
  }

  function pressed(key) {
    const btn = document.querySelector('[data-check="' + key + '"]');
    return !!btn && btn.getAttribute("aria-pressed") === "true";
  }

  function readLinkInputs() {
    return model.draft.links.map(function (link) {
      const root = document.querySelector('[data-link="' + link.id + '"]');
      if (!root) return link;
      return {
        id: link.id,
        label: root.querySelector(".js-label").value,
        url: root.querySelector(".js-url").value,
        visible: link.visible,
      };
    });
  }

  function syncLinks() {
    model.draft.links = readLinkInputs();
  }

  function collect() {
    syncLinks();
    return {
      display_name: $("#displayName").value,
      line: $("#line").value,
      cover: model.draft.cover || "",
      links: model.draft.links.map(function (link) {
        return { id: link.id, label: link.label, url: link.url, visible: link.visible !== false };
      }),
      highlights: [0, 1, 2].map(function (i) {
        return $("#hi" + i).value;
      }),
      alignment: { site: pressed("site"), instagram: pressed("instagram"), google: pressed("google") },
    };
  }

  function clearErrors() {
    document.querySelectorAll(".field-err").forEach(function (el) {
      el.hidden = true;
      el.textContent = "";
    });
  }

  function showErrors(fields) {
    clearErrors();
    const grouped = new Map();
    (fields || []).forEach(function (field) {
      const prev = grouped.get(field.field);
      grouped.set(field.field, prev ? prev + " " + field.message : field.message);
    });
    grouped.forEach(function (message, field) {
      const el = document.querySelector('[data-err="' + field + '"]');
      if (!el) return;
      el.hidden = false;
      el.textContent = message;
    });
    const first = document.querySelector(".field-err:not([hidden])");
    if (first && first.scrollIntoView) first.scrollIntoView({ block: "nearest" });
  }

  function renderHabit() {
    if (!model) return;
    const state = dirty && model.reviewed_at ? "drift" : model.state || "none";
    const chip = $("#habitChip");
    chip.className = "habit is-" + state;
    chip.textContent = CHIP[state] || CHIP.none;

    $("#reviewDate").textContent = model.reviewed_at ? formatWhen(model.reviewed_at, false) : "Ainda sem revisão";

    const checksOn = pressed("site") && pressed("instagram") && pressed("google");
    const reviewBtn = $("#reviewBtn");
    reviewBtn.disabled = busy || !checksOn;
    reviewBtn.textContent = state === "drift" || state === "stale" ? "Revisar de novo" : "Revisei hoje";

    const ready = $("#readyBtn");
    const already = !dirty && model.state === "fresh" && model.status === "pronta";
    const canReady = !busy && !dirty && model.state === "fresh" && model.status !== "pronta";
    ready.disabled = !canReady;
    ready.textContent = already ? "Já está pronta" : "Pronta para o ok";
    $("#saveBtn").disabled = busy;

    const badge = $("#statusBadge");
    badge.textContent = model.status === "pronta" ? "Pronta para o ok" : "Rascunho";
    badge.className = "badge" + (model.status === "pronta" ? " is-ready" : "");

    const saved = $("#savedAt");
    if (model.updated_at) {
      saved.hidden = false;
      saved.textContent = "Último salvamento: " + formatWhen(model.updated_at, true);
    } else {
      saved.hidden = true;
    }
  }

  function markDirty() {
    dirty = true;
    renderPreview();
    renderHabit();
  }

  function renderPreview() {
    if (!model) return;
    const name = $("#displayName").value.trim();
    const line = $("#line").value.trim();
    $("#pvName").textContent = name;
    $("#pvLine").textContent = line;

    const slot = $("#pvCover");
    slot.replaceChildren();
    const meta = (model.covers || []).find(function (cover) {
      return cover.id === model.draft.cover;
    });
    if (meta) {
      const img = document.createElement("img");
      img.src = meta.src;
      img.alt = "";
      slot.appendChild(img);
    }

    const notes = $("#pvHighlights");
    notes.replaceChildren();
    [0, 1, 2].forEach(function (i) {
      const text = $("#hi" + i).value.trim();
      if (!text) return;
      const li = document.createElement("li");
      li.textContent = text;
      notes.appendChild(li);
    });

    const box = $("#pvLinks");
    box.replaceChildren();
    readLinkInputs().forEach(function (link) {
      if (link.visible === false || !link.label.trim() || !link.url.trim()) return;
      const el = document.createElement("div");
      el.className = "pv-link" + (link.id === "whatsapp" ? " is-primary" : "");
      el.textContent = link.label.trim();
      box.appendChild(el);
    });
  }

  function renderCovers() {
    const root = $("#covers");
    root.replaceChildren();
    (model.covers || []).forEach(function (cover) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cover-pick";
      btn.setAttribute("aria-pressed", cover.id === model.draft.cover ? "true" : "false");
      btn.setAttribute("aria-label", cover.label);
      const img = document.createElement("img");
      img.src = cover.src;
      img.alt = "";
      const caption = document.createElement("span");
      caption.textContent = cover.label;
      btn.append(img, caption);
      btn.addEventListener("click", function () {
        model.draft.cover = model.draft.cover === cover.id ? "" : cover.id;
        renderCovers();
        markDirty();
      });
      root.appendChild(btn);
    });
  }

  function renderLinks() {
    const root = $("#links");
    root.replaceChildren();
    model.draft.links.forEach(function (link, index) {
      const card = document.createElement("article");
      card.className = "door" + (link.id === "whatsapp" ? " is-primary" : "");
      card.dataset.link = link.id;

      const head = document.createElement("div");
      head.className = "door-head";
      const name = document.createElement("p");
      name.className = "door-name";
      name.textContent = link.id === "whatsapp" ? "WhatsApp · botão da página" : DOOR[link.id] || link.id;

      const moves = document.createElement("div");
      moves.className = "door-moves";
      moves.append(mini("Subir", index === 0, function () { move(link.id, -1); }));
      moves.append(mini("Descer", index === model.draft.links.length - 1, function () { move(link.id, 1); }));

      const vis = document.createElement("button");
      vis.type = "button";
      vis.className = "mini";
      vis.setAttribute("aria-pressed", link.visible !== false ? "true" : "false");
      vis.textContent = link.visible !== false ? "Visível" : "Oculta";
      vis.addEventListener("click", function () {
        syncLinks();
        const current = model.draft.links.find(function (item) { return item.id === link.id; });
        current.visible = current.visible === false;
        renderLinks();
        markDirty();
      });

      head.append(name, moves, vis);

      const labelField = field("Texto do botão", "text", link.label, "js-label", 32, "");
      const urlField = field(
        URL_LABEL[link.id] || "Destino",
        "text",
        link.url || "",
        "js-url",
        300,
        URL_PLACEHOLDER[link.id] || ""
      );
      if (link.id === "whatsapp") urlField.input.inputMode = "tel";
      if (link.id === "site" || link.id === "google") urlField.input.inputMode = "url";
      urlField.input.autocapitalize = "off";
      urlField.input.spellcheck = false;

      const err = document.createElement("p");
      err.className = "field-err";
      err.dataset.err = "links." + link.id;
      err.hidden = true;

      card.append(head, labelField.wrap, urlField.wrap, err);
      card.addEventListener("input", function () { markDirty(); });
      root.appendChild(card);
    });
  }

  function field(label, type, value, className, max, placeholder) {
    const wrap = document.createElement("label");
    wrap.className = "field";
    const span = document.createElement("span");
    span.textContent = label;
    const input = document.createElement("input");
    input.type = type;
    input.value = value;
    input.maxLength = max;
    input.placeholder = placeholder;
    input.className = className;
    input.autocomplete = "off";
    wrap.append(span, input);
    return { wrap: wrap, input: input };
  }

  function mini(text, disabled, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mini";
    btn.textContent = text;
    btn.disabled = disabled;
    btn.addEventListener("click", onClick);
    return btn;
  }

  function move(id, dir) {
    syncLinks();
    const links = model.draft.links;
    const index = links.findIndex(function (link) { return link.id === id; });
    const next = index + dir;
    if (index < 0 || next < 0 || next >= links.length) return;
    const swap = links[index];
    links[index] = links[next];
    links[next] = swap;
    renderLinks();
    markDirty();
  }

  function applyModel(data) {
    model = data;
    dirty = false;
    clearErrors();
    $("#loading").hidden = true;
    $("#bioForm").hidden = false;
    $("#who").textContent = data.client.name || "Clínica";
    $("#displayName").value = data.draft.display_name || "";
    $("#line").value = data.draft.line || "";
    ["site", "instagram", "google"].forEach(function (key) {
      const on = !!(data.draft.alignment && data.draft.alignment[key]);
      document.querySelector('[data-check="' + key + '"]').setAttribute("aria-pressed", on ? "true" : "false");
    });
    [0, 1, 2].forEach(function (i) {
      $("#hi" + i).value = (data.draft.highlights && data.draft.highlights[i]) || "";
    });
    renderCovers();
    renderLinks();
    renderPreview();
    renderHabit();
  }

  async function send(path, method, withBody) {
    if (busy) return;
    busy = true;
    renderHabit();
    clearErrors();
    const res = await api(path, { method: method, body: withBody ? collect() : undefined });
    busy = false;
    if (res.status === 401) {
      flash("Sua sessão acabou. Entre de novo na Central.");
      renderHabit();
      return;
    }
    if (res.ok && res.data && res.data.ok) {
      applyModel(res.data);
      return res.data;
    }
    showErrors(res.data && res.data.fields);
    flash((res.data && res.data.message) || "Não foi possível salvar.", "err");
    renderHabit();
    return null;
  }

  $("#bioForm").addEventListener("submit", function (event) {
    event.preventDefault();
    save();
  });

  $("#reviewBtn").addEventListener("click", async function () {
    flash("Registrando a revisão…");
    const data = await send("/api/link-na-bio/revisao", "POST", true);
    if (data) flash("Revisão registrada.", "ok");
  });

  $("#readyBtn").addEventListener("click", async function () {
    flash("Marcando a página…");
    const data = await send("/api/link-na-bio/pronta", "POST", false);
    if (data) flash("Pronta para o ok. Nada foi publicado.", "ok");
  });

  $("#logout").addEventListener("click", async function () {
    await api("/api/logout", { method: "POST" });
    location.href = "/";
  });

  ["displayName", "line", "hi0", "hi1", "hi2"].forEach(function (id) {
    $("#" + id).addEventListener("input", function () {
      const field = id === "displayName" ? "display_name" : id === "line" ? "line" : "highlights." + id.slice(2);
      const err = document.querySelector('[data-err="' + field + '"]');
      if (err) {
        err.hidden = true;
        err.textContent = "";
      }
      markDirty();
    });
  });

  document.querySelectorAll("[data-check]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const on = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", on ? "false" : "true");
      markDirty();
    });
  });

  async function save() {
    flash("Salvando…");
    const data = await send("/api/link-na-bio", "PUT", true);
    if (data) flash("Rascunho salvo.", "ok");
  }

  async function boot() {
    const res = await api("/api/link-na-bio");
    if (res.status === 401) {
      location.href = "/";
      return;
    }
    if (!res.ok || !res.data || !res.data.ok) {
      $("#loading").textContent = "Não foi possível abrir a página.";
      return;
    }
    applyModel(res.data);
  }

  boot();
})();
