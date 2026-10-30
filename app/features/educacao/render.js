import { css } from "./styles.js";
import { DAYS, PRIME, DAY_ORDER, dayById, primeById, nextDayId, clinicClock } from "./content.js";

function esc(s) {
  return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function richTitle(title, em) {
  const i = em ? title.indexOf(em) : -1;
  if (i < 0) return esc(title);
  return `${esc(title.slice(0, i))}<em>${esc(em)}</em>${esc(title.slice(i + em.length))}`;
}

function photoSrc(id) {
  return `/educacao/media/${id}.webp`;
}

const CLIENT = `<script>
(function(){
  var KEY="prime.educacao.v1";
  var date=document.body.getAttribute("data-date")||"";
  var state={hoje:"",read:{}};
  try{
    var p=JSON.parse(localStorage.getItem(KEY)||"{}");
    if(p&&typeof p==="object"){
      state.hoje=typeof p.hoje==="string"?p.hoje:"";
      state.read=p.read&&typeof p.read==="object"?p.read:{};
    }
  }catch(e){}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}
  function onKey(key){
    if(!key)return false;
    if(key.indexOf("hoje:")===0)return state.hoje===date;
    return !!state.read[key];
  }
  function paint(){
    document.querySelectorAll("[data-mark]").forEach(function(btn){
      var key=btn.getAttribute("data-mark");
      var on=onKey(key);
      btn.classList.toggle("is-done",on);
      btn.setAttribute("aria-pressed",on?"true":"false");
      btn.textContent=on?(key.indexOf("hoje:")===0?"Feito hoje":"Leitura feita"):(btn.getAttribute("data-label")||"");
    });
    document.querySelectorAll("[data-read]").forEach(function(el){
      el.classList.toggle("is-done",onKey(el.getAttribute("data-read")));
    });
    document.querySelectorAll("[data-when-done]").forEach(function(el){
      el.hidden=state.hoje!==date;
    });
  }
  document.addEventListener("click",function(ev){
    var btn=ev.target.closest?ev.target.closest("[data-mark]"):null;
    if(!btn)return;
    var key=btn.getAttribute("data-mark");
    if(key.indexOf("hoje:")===0){
      var id=key.slice(5);
      if(state.hoje===date){state.hoje="";delete state.read["dia:"+id];}
      else{state.hoje=date;state.read["dia:"+id]=1;}
    }else if(state.read[key]){delete state.read[key];}
    else{state.read[key]=1;}
    save();
    paint();
  });
  paint();
})();
</script>`;

function layout({ title, clock, body, mainClass = "" }) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/tokens.css">
<style>
  body{margin:0;min-height:100vh;background:var(--color-bg);color:var(--color-text);font:16px/1.55 var(--sans);-webkit-font-smoothing:antialiased}
  ${css}
</style>
</head>
<body data-date="${esc(clock.iso)}" data-today="${esc(clock.id)}" style="--serif:'Cormorant Garamond',Georgia,serif;--sans:Inter,system-ui,sans-serif">
<a class="skip" href="#conteudo">Ir para a leitura</a>
<div class="edu">
<header class="edu-top">
  <a class="edu-logo" href="/"><span class="edu-word">PRIME<span>STUDIO</span></span><i class="sig" aria-hidden="true"></i></a>
  <a class="edu-toplink" href="/">Estúdio</a>
</header>
<main id="conteudo"${mainClass ? ` class="${mainClass}"` : ""}>
${body}
</main>
<footer class="foot">
  <p>Prime Studio · educação da Central</p>
  <p>Fotos de espaços reais do nosso acervo.</p>
</footer>
</div>
${CLIENT}
</body>
</html>`;
}

function hero(item, eyebrow) {
  return `<article class="hero">
  <img src="${photoSrc(item.photo)}" alt="${esc(item.alt)}" width="800" height="600" fetchpriority="high">
  <div class="hero-copy">
    <p class="eyebrow">${esc(eyebrow)}</p>
    <h1>${richTitle(item.title, item.em)}</h1>
  </div>
</article>`;
}

function prose(item) {
  return `<div class="prose">${item.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}</div>`;
}

function steps(item) {
  return `<section class="now">
  <h2>Para usar agora</h2>
  <ol class="steps">${item.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
</section>`;
}

function actions({ mark, label, studio, showDoneNote }) {
  const primaryStudio = studio
    ? `<a class="btn" href="/">Levar este tema ao estúdio</a>`
    : "";
  const markBtn = `<button class="btn${studio ? " btn-ghost" : ""}" type="button" data-mark="${esc(mark)}" data-label="${esc(label)}">${esc(label)}</button>`;
  const note = showDoneNote
    ? `<p class="done-note" data-when-done hidden>${esc(
        studio
          ? "Amanhã tem outra. A de hoje já pode virar peça no estúdio."
          : "Amanhã tem outra. A de hoje já serve na clínica."
      )}</p>`
    : "";
  const ordered = studio ? primaryStudio + markBtn : markBtn;
  return `<div class="actions">${ordered}${note}</div>`;
}

function tomorrowCard(day) {
  return `<a class="tomorrow" href="/educacao/dia/${day.id}">
  <img src="${photoSrc(day.photo)}" alt="" width="144" height="144" loading="lazy">
  <span>
    <span class="eyebrow">Amanhã · ${esc(day.weekday)}</span>
    <strong>${esc(day.title)}</strong>
    <small>A gente deixa esta para amanhã. Pode abrir se quiser adiantar.</small>
  </span>
</a>`;
}

function primeList() {
  const items = PRIME.map(
    (p) => `<li><a href="/educacao/prime/${p.id}" data-read="prime:${p.id}">
      <i aria-hidden="true">${esc(p.letter)}</i>
      <div><b>${esc(p.name)}</b><small>${esc(p.line)}</small></div>
    </a></li>`
  ).join("");
  return `<section class="trail">
  <p class="kicker">Método PRIME</p>
  <h2>A presença, em leituras curtas</h2>
  <p class="hint">Uma de cada vez. Dá para acompanhar o dia da clínica, sem virar aula.</p>
  <ol class="spine">${items}</ol>
  <a class="more textlink" href="/educacao/semana">Ver os outros dias da semana</a>
</section>`;
}

export function renderHome(date = new Date()) {
  const clock = clinicClock(date);
  const today = dayById(clock.id);
  const tomorrow = dayById(nextDayId(clock.id));
  const body = `
<p class="kicker">Educação</p>
<p class="kicker-sub">Do nosso time, para usar hoje.</p>
${hero(today, `Para hoje · ${today.weekday}`)}
${prose(today)}
${steps(today)}
${actions({
  mark: `hoje:${today.id}`,
  label: "Marcar como feito hoje",
  studio: today.studio,
  showDoneNote: true,
})}
${tomorrowCard(tomorrow)}
${primeList()}`;
  return layout({ title: "Educação — Central do Cliente", clock, body });
}

export function renderDay(id, date = new Date()) {
  const item = dayById(id);
  if (!item) return null;
  const clock = clinicClock(date);
  const isToday = item.id === clock.id;
  const eyebrow = isToday ? `Para hoje · ${item.weekday}` : `${item.weekday} · ${item.theme}`;
  const body = `
<a class="back" href="/educacao">← Hoje</a>
${hero(item, eyebrow)}
${prose(item)}
${steps(item)}
${actions({
  mark: isToday ? `hoje:${item.id}` : `dia:${item.id}`,
  label: isToday ? "Marcar como feito hoje" : "Marcar esta leitura",
  studio: item.studio,
  showDoneNote: isToday,
})}
${isToday ? tomorrowCard(dayById(nextDayId(item.id))) : ""}`;
  return layout({
    title: `${item.title} — Educação — Prime Studio`,
    clock,
    body,
  });
}

export function renderPrime(id, date = new Date()) {
  const item = primeById(id);
  if (!item) return null;
  const clock = clinicClock(date);
  const body = `
<a class="back" href="/educacao">← Hoje</a>
${hero(item, `${item.letter} · ${item.name}`)}
${prose(item)}
${steps(item)}
${actions({
  mark: `prime:${item.id}`,
  label: "Marcar esta leitura",
  studio: item.studio,
  showDoneNote: false,
})}`;
  return layout({
    title: `${item.letter} · ${item.name} — Educação — Prime Studio`,
    clock,
    body,
  });
}

export function renderWeek(date = new Date()) {
  const clock = clinicClock(date);
  const rows = DAY_ORDER.map((id) => {
    const day = dayById(id);
    const today = day.id === clock.id;
    return `<a href="/educacao/dia/${day.id}" data-read="${today ? `hoje:${day.id}` : `dia:${day.id}`}"${today ? ' class="is-today"' : ""}>
      <span class="wd">${esc(day.weekday.slice(0, 3))}</span>
      <div><b>${esc(day.title)}</b><small>${esc(today ? "Hoje · " : "")}${esc(day.theme)}</small></div>
    </a>`;
  }).join("");
  const body = `
<a class="back" href="/educacao">← Hoje</a>
<p class="kicker">Educação</p>
<h1 class="page-title">Nesta semana</h1>
<p class="kicker-sub">Sete leituras. Uma por dia. Nenhuma é aula longa.</p>
<div class="week">${rows}</div>`;
  return layout({ title: "Nesta semana — Educação — Prime Studio", clock, body });
}

export function renderNotFound(date = new Date()) {
  const clock = clinicClock(date);
  const body = `<div class="empty">
  <p class="kicker">Educação</p>
  <h1>Essa leitura <em>não está aqui</em></h1>
  <p>A de hoje continua na trilha.</p>
  <a class="btn" href="/educacao">Voltar para hoje</a>
</div>`;
  return layout({ title: "Educação — Central do Cliente", clock, body });
}
