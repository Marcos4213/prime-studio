// Tela da presença. Monta o que a API devolve. Não inventa número.

const root = document.querySelector("#presenca[data-boot]");
if (root) mountPresenca(root);

export async function mountPresenca(host) {
  const ui = { focus: "", open: "" };
  paintLoading(host);
  try {
    paint(host, await loadView(), ui);
  } catch (err) {
    paintError(host, err);
  }

  host.addEventListener("click", async (event) => {
    const mark = event.target.closest(".mark");
    if (!mark || !host.contains(mark)) return;
    const id = mark.dataset.id;
    const seen = mark.getAttribute("aria-pressed") !== "true";
    ui.focus = `mark:${id}`;
    mark.disabled = true;
    try {
      paint(host, await post("/api/presenca/olhar", { id, seen }), ui);
    } catch (err) {
      mark.disabled = false;
      setLive(host, err.message || "Não foi possível guardar agora.");
    }
  });

  host.addEventListener("submit", async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.classList.contains("field")) return;
    event.preventDefault();
    const id = form.dataset.id;
    const input = form.querySelector("input");
    const button = form.querySelector("button");
    const note = form.querySelector(".form-note");
    ui.open = id;
    ui.focus = `save:${id}`;
    button.disabled = true;
    note.textContent = "";
    note.classList.remove("is-err");
    try {
      paint(host, await post("/api/presenca/endereco", { id, address: input.value }), ui);
    } catch (err) {
      button.disabled = false;
      note.textContent = err.message || "Não foi possível guardar agora.";
      note.classList.add("is-err");
    }
  });
}

async function loadView() {
  const res = await fetch("/api/presenca", {
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw friendly("Entre na central para ver a presença.", true);
  if (data.error === "sem_tabela") {
    throw friendly("A presença ainda não tem onde ser guardada. Falta aplicar a migração desta tela.");
  }
  if (!res.ok || !data.ok) throw friendly("Não foi possível abrir a presença agora.");
  return data;
}

async function post(path, body) {
  const res = await fetch(path, {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (data.error === "endereco_invalido") throw friendly("Este endereço não serve.");
  if (data.error === "sem_tabela") {
    throw friendly("A presença ainda não tem onde ser guardada. Falta aplicar a migração desta tela.");
  }
  if (res.status === 401) throw friendly("Entre na central para ver a presença.", true);
  if (!res.ok || !data.ok) throw friendly("Não foi possível guardar agora.");
  return data;
}

function paintLoading(host) {
  host.replaceChildren(p("loading", "Abrindo a presença…"));
}

function paintError(host, err) {
  const box = el("div", "note");
  box.append(p("", err.message || "Não foi possível abrir a presença agora."));
  if (err.login) {
    const a = el("a", "", "Ir para a central");
    a.href = "/";
    box.append(a);
  }
  host.replaceChildren(box);
}

function paint(host, view, ui) {
  const channels = Array.isArray(view.channels) ? view.channels : [];
  const frag = document.createDocumentFragment();

  frag.append(p("eyebrow", "Olhar de hoje"));
  frag.append(el("p", "date", view.today?.label || ""));
  frag.append(el("h1", "", "Presença"));
  frag.append(p("lede", "Site, Instagram, Google e o link na bio. Uma presença só."));
  if (view.clinic) frag.append(p("clinic", view.clinic));

  const habit = el("section", "habit");
  habit.append(el("h2", "", "O hábito"));
  habit.append(p("hint", "Marque a porta que você abriu hoje."));
  for (const ch of channels) habit.append(habitRow(ch));
  const summary = p("summary", view.summary || "Nenhuma porta vista hoje.");
  summary.setAttribute("aria-live", "polite");
  habit.append(summary);
  if (view.days_label) habit.append(p("memory", view.days_label));
  frag.append(habit);

  frag.append(el("h2", "doors-title", "As portas"));
  const doors = el("div", "doors");
  for (const ch of channels) doors.append(doorCard(ch, ui.open));
  frag.append(doors);

  host.replaceChildren(frag);
  if (ui.focus) host.querySelector(`[data-focus="${cssEscape(ui.focus)}"]`)?.focus();
}

function habitRow(ch) {
  const row = el("div", "habit-row");
  const button = el("button", "mark");
  button.type = "button";
  button.dataset.id = ch.id;
  button.dataset.focus = `mark:${ch.id}`;
  button.setAttribute("aria-pressed", ch.seen ? "true" : "false");
  const tick = el("span", "tick");
  tick.setAttribute("aria-hidden", "true");
  const text = el("span");
  text.append(el("strong", "", ch.title || ""));
  text.append(el("small", "", ch.look || ""));
  button.append(tick, text);
  row.append(button);
  const href = safeHref(ch.href);
  if (href) {
    const a = el("a", "open", "Abrir");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    row.append(a);
  }
  return row;
}

function doorCard(ch, openId) {
  const card = el("article", "door");
  const shot = el("div", "shot");
  shot.dataset.id = ch.id || "";
  if (ch.photo) {
    const img = document.createElement("img");
    img.src = ch.photo;
    img.alt = ch.photo_alt || "";
    img.decoding = "async";
    img.addEventListener("error", () => img.remove());
    shot.append(img);
  }
  const body = el("div", "door-body");
  const top = el("div", "door-top");
  top.append(el("h3", "", ch.title || ""));
  top.append(p("role", ch.role || ""));
  body.append(top);
  body.append(p("line", ch.line || ""));
  body.append(pill());
  body.append(addressLine(ch));
  body.append(addressForm(ch, openId === ch.id));
  card.append(shot, body);
  return card;
}

function pill() {
  const node = el("span", "pill");
  const dot = document.createElement("i");
  dot.setAttribute("aria-hidden", "true");
  node.append(dot, document.createTextNode("Sem leitura"));
  return node;
}

function addressLine(ch) {
  const href = safeHref(ch.href);
  const line = el("p", href ? "addr" : "addr is-empty");
  if (!ch.address) {
    line.textContent = "Endereço ainda não anotado.";
    return line;
  }
  if (href) {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = ch.address;
    line.append(a);
  } else {
    line.textContent = ch.address;
  }
  return line;
}

function addressForm(ch, open) {
  const details = el("details", "addr-form");
  if (open) details.open = true;
  const summary = el("summary", "", ch.address ? "Alterar endereço" : "Anotar endereço");
  const form = el("form", "field");
  form.dataset.id = ch.id || "";
  const label = el("label", "", ch.address_label || "Endereço");
  const inputId = `addr-${ch.id}`;
  label.htmlFor = inputId;
  const input = document.createElement("input");
  input.id = inputId;
  input.name = "address";
  input.type = "text";
  input.maxLength = 300;
  input.autocomplete = "off";
  input.spellcheck = false;
  input.inputMode = ch.input_mode === "url" ? "url" : "text";
  input.placeholder = ch.placeholder || "https://";
  input.value = ch.address || "";
  const button = el("button", "save", "Salvar");
  button.type = "submit";
  button.dataset.focus = `save:${ch.id}`;
  const note = p("form-note", "");
  form.append(label, input, button, note);
  details.append(summary, form);
  return details;
}

function setLive(host, message) {
  const node = host.querySelector(".summary");
  if (node) node.textContent = message;
}

function safeHref(value) {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

function friendly(message, login = false) {
  const err = new Error(message);
  err.login = login;
  return err;
}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null && text !== "") node.textContent = text;
  return node;
}

function p(cls, text) {
  return el("p", cls, text);
}

function cssEscape(value) {
  if (window.CSS && typeof CSS.escape === "function") return CSS.escape(value);
  return String(value).replace(/"/g, '\\"');
}
