/* ===================== CONFIGURAÇÃO — EDITE AQUI ===================== */
const CONFIG = {
  // Endpoint que salva o lead (Cloudflare Pages Function em /functions/api/lead.js).
  // No GitHub Pages não existe; o site cai automaticamente no WhatsApp.
  LEAD_API: "/api/lead",
  // Horário comercial (America/Sao_Paulo) para a promessa "ligação em até 30 minutos"
  HORARIO: { dias:[1,2,3,4,5], inicio:9, fim:18 },   // seg–sex, 9h–18h  [CONFIRMAR COM MARCOS]
  WHATSAPP_NUMERO: "5511913221587",
  // Opção 3 (agenda). Placeholder: trocar pelo link do Cal.com quando estiver pronto.
  AGENDA_URL: "https://calendar.app.google/PLmXdrdHxs4c8Lin8",
  META_PIXEL_ID: "",              // preencha para ativar o Pixel (Lead, Schedule, Contact)
  CONTEUDO_URL: "#metodo"
};
/* ======================================================================= */

if (CONFIG.META_PIXEL_ID) {
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', CONFIG.META_PIXEL_ID); fbq('track', 'PageView');
}
function track(ev, data){ if (window.fbq) fbq('track', ev, data || {}); }
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

/* ---------- UI geral ---------- */
document.getElementById("yr").textContent = new Date().getFullYear();
const nav = document.getElementById("nav");
addEventListener("scroll", ()=>nav.classList.toggle("scrolled", scrollY>30), {passive:true});
const footWa = document.getElementById("footWa");
footWa.href = `https://wa.me/${CONFIG.WHATSAPP_NUMERO}?text=${encodeURIComponent("Olá! Vim pelo site da Prime Studio e quero saber mais sobre o Método PRIME.")}`;
footWa.onclick = ()=>track("Contact",{content_name:"rodape"});

/* ---------- Cases (EXEMPLOS de projeto — substitua por cases reais) ---------- */
const ART = {
  harm:`<svg viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><defs><linearGradient id="hg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9d6bf"/><stop offset="1" stop-color="#b9906a"/></linearGradient><radialGradient id="hr" cx=".7" cy=".25" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="400" height="520" fill="url(#hg)"/><rect width="400" height="520" fill="url(#hr)"/><path d="M230 70c-70 0-110 60-105 140 3 45 20 70 15 100-6 35-40 55-40 95 0 35 30 65 90 115" fill="none" stroke="#5a4029" stroke-width="2.2" opacity=".55"/><path d="M175 230c12 8 26 8 38 0M190 300c10 6 22 6 32 0" stroke="#5a4029" stroke-width="2" fill="none" opacity=".45"/><circle cx="300" cy="380" r="70" fill="none" stroke="#fff" stroke-opacity=".5"/><circle cx="300" cy="380" r="100" fill="none" stroke="#fff" stroke-opacity=".25"/></svg>`,
  odonto:`<svg viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><defs><linearGradient id="og" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16324a"/><stop offset="1" stop-color="#0b1a28"/></linearGradient><linearGradient id="ot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d9e6ef"/></linearGradient></defs><rect width="400" height="520" fill="url(#og)"/><circle cx="200" cy="250" r="150" fill="#9fc3dc" opacity=".12"/><path d="M95 250q105 95 210 0" fill="none" stroke="#c7dcea" stroke-width="2" opacity=".6"/><g fill="url(#ot)">${[0,1,2,3,4,5].map(k=>`<rect x="${112+k*30}" y="${222+Math.abs(k-2.5)*6}" width="25" height="${48-Math.abs(k-2.5)*5}" rx="11"/>`).join("")}</g><path d="M60 120 Q200 60 340 120" stroke="#d7b46a" stroke-width="1.5" fill="none" opacity=".8"/><circle cx="330" cy="420" r="4" fill="#d7b46a"/><circle cx="70" cy="400" r="2.5" fill="#d7b46a"/></svg>`,
  est:`<svg viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><defs><linearGradient id="eg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dfe4d6"/><stop offset="1" stop-color="#9aa58a"/></linearGradient></defs><rect width="400" height="520" fill="url(#eg)"/><ellipse cx="200" cy="300" rx="120" ry="160" fill="#f4f1e8" opacity=".55"/><g fill="none" stroke="#4f5a40" stroke-width="1.6" opacity=".6"><path d="M90 470C150 360 160 250 120 120"/><path d="M120 300c-30-10-50-30-55-60M128 230c25-12 40-32 42-58M118 380c30-6 52-24 62-50"/></g><circle cx="280" cy="150" r="46" fill="#fff" opacity=".5"/><circle cx="280" cy="150" r="22" fill="#c9b48a" opacity=".7"/></svg>`
};
const CASES = [
  { id:"harm", nicho:"Harmonização facial", nome:"Maison Aurora", url:"maisonaurora.exemplo",
    resumo:"Página por procedimento com narrativa de naturalidade, agenda online e WhatsApp sempre à mão.",
    t:{a:"#a07a4f",bgc:"#f7f0e7",ink:"#2b2118",soft:"#eadccb"},
    h1:"Beleza <em>natural</em>, assinada com precisão.", sub:"Harmonização facial com planejamento individual e foco em resultados equilibrados.",
    servs:[["Preenchimento labial","Volume e contorno respeitando a proporção do rosto."],["Toxina botulínica","Suavização de linhas de expressão com naturalidade."],["Bioestimuladores","Firmeza e qualidade de pele de forma gradual."]],
    band:"Cada rosto pede um plano. O seu começa com uma avaliação.", },
  { id:"odonto", nicho:"Odonto estética · Lentes", nome:"Lumière Odonto", url:"lumiereodonto.exemplo",
    resumo:"Página de alto padrão para lentes de contato dental, com etapas do tratamento e captação via WhatsApp.",
    t:{a:"#c9a35d",bgc:"#0f1d2b",ink:"#f1ede4",soft:"#1d3245"}, dark:true,
    h1:"O sorriso que você <em>sempre quis</em> mostrar.", sub:"Lentes de contato dental e facetas com planejamento digital do sorriso.",
    servs:[["Lentes de contato dental","Lâminas ultrafinas para forma, cor e alinhamento."],["Facetas em porcelana","Durabilidade e brilho natural para casos complexos."],["Planejamento digital","Visualize a proposta do sorriso antes de começar."]],
    band:"Agende sua avaliação e conheça o seu novo sorriso." },
  { id:"est", nicho:"Estética facial e corporal", nome:"Essence Clinique", url:"essenceclinique.exemplo",
    resumo:"Site com protocolos organizados por objetivo, linguagem acolhedora e agenda integrada.",
    t:{a:"#6e7b55",bgc:"#f3f2ec",ink:"#26291f",soft:"#e2e4d7"},
    h1:"Cuidado que se <em>sente</em> e se vê.", sub:"Protocolos faciais e corporais em clínica, com avaliação personalizada.",
    servs:[["Protocolos faciais","Limpeza, viço e tratamento de manchas."],["Estética corporal","Tecnologias para contorno e firmeza."],["Bem-estar","Experiência completa em ambiente reservado."]],
    band:"Descubra o protocolo ideal para o seu objetivo." }
];
function tplHTML(c){
  const st = `--a:${c.t.a};--bgc:${c.t.bgc};--ink:${c.t.ink};--soft:${c.t.soft}`;
  const card = c.dark ? "background:#14283a;border-color:#22394f;color:#f1ede4" : "";
  return `<div class="tpl ${c.dark?"dark":""}" style="${st}">
  <div class="t-note">Exemplo de projeto · página-modelo ilustrativa</div>
  <div class="t-nav"><span class="t-logo">${c.nome}</span><span class="t-menu"><span>Tratamentos</span><span>Clínica</span><span>Contato</span></span><span class="t-cta">Agendar avaliação</span></div>
  <div class="t-hero"><div><p class="t-eb">${c.nicho}</p><h1>${c.h1}</h1><p>${c.sub}</p><p style="margin-top:28px"><span class="t-cta">Agendar avaliação</span> &nbsp; <span style="font-size:.85rem;opacity:.7">ou fale no WhatsApp</span></p></div><div class="t-img">${ART[c.id]}</div></div>
  <div class="t-sec"><p class="t-eb">Tratamentos</p><h2>Procedimentos</h2><div class="t-grid">${c.servs.map((s,k)=>`<div class="t-card" style="${card}"><div class="ic">${["I","II","III"][k]}</div><h3>${s[0]}</h3><p>${s[1]}</p></div>`).join("")}</div></div>
  <div class="t-sec" style="padding-top:0"><p class="t-eb">Como funciona</p><h2>Sua jornada</h2><div class="t-steps"><div><h3>Contato</h3><p>Pelo WhatsApp ou agenda online.</p></div><div><h3>Avaliação</h3><p>Conversa e análise individual.</p></div><div><h3>Plano</h3><p>Proposta personalizada.</p></div><div><h3>Acompanhamento</h3><p>Retornos e cuidados.</p></div></div></div>
  <div class="t-band"><h2>${c.band}</h2><p style="margin:14px 0 26px">Atendimento com hora marcada.</p><span class="t-cta">Agendar avaliação</span></div>
  <div class="t-foot"><span>${c.nome} · endereço da clínica</span><span>Instagram · WhatsApp</span></div>
  <div class="t-wa">✆</div></div>`;
}
const grid = document.getElementById("cases-grid");
grid.innerHTML = CASES.map((c,k)=>`<button class="case reveal" data-k="${k}" aria-label="Ver projeto ${c.nome} em tela cheia">
  <div class="frame"><div class="mini">${tplHTML(c)}</div></div>
  <div class="info"><span class="ex">Exemplo de projeto</span><h3>${c.nome}</h3><p><strong>${c.nicho}.</strong> ${c.resumo}</p></div></button>`).join("");
function fitMinis(){ grid.querySelectorAll(".frame").forEach(f=>{ f.querySelector(".mini").style.transform=`scale(${f.clientWidth/1280})`; }); }
addEventListener("resize", fitMinis); fitMinis();
const modal=document.getElementById("modal"), mBody=document.getElementById("modalBody");
grid.querySelectorAll(".case").forEach(b=>b.onclick=()=>{
  const c=CASES[+b.dataset.k]; mBody.innerHTML=tplHTML(c); document.getElementById("modalUrl").textContent="https://"+c.url;
  modal.hidden=false; document.body.classList.add("lock"); mBody.scrollTop=0; document.getElementById("modalClose").focus();
});
function closeModal(){ modal.hidden=true; document.body.classList.remove("lock"); }
document.getElementById("modalClose").onclick=closeModal;
addEventListener("keydown",e=>{ if(e.key==="Escape" && !modal.hidden) closeModal(); });

/* ---------- Animações ---------- */
const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target);} }),{threshold:0,rootMargin:"0px 0px -8% 0px"});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));
// fallback: nada fica invisível se o observer falhar
setTimeout(()=>document.querySelectorAll(".reveal:not(.in)").forEach(el=>{const r=el.getBoundingClientRect(); if(r.top<innerHeight) el.classList.add("in");}),1500);
addEventListener("load",()=>setTimeout(()=>{ if(!("IntersectionObserver" in window)) document.querySelectorAll(".reveal").forEach(e=>e.classList.add("in")); },0));

/* ---------- v2: interações ---------- */
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const PRIME = [
  ["P","Perfil","Posicionamento claro antes de qualquer post.","Raio-X da presença atual",["Definição do procedimento-âncora","Perfil do paciente ideal","Mensagem e diferenciais da clínica"]],
  ["R","Reputação","Quem pesquisa precisa encontrar prova.","Google Meu Negócio completo",["Categorias, fotos e serviços otimizados","Rotina de pedidos de avaliação","Respostas profissionais às avaliações"]],
  ["I","Imagem","O Instagram precisa parecer o preço que você cobra.","Bio, destaques e identidade",["Bio com promessa e chamada","Destaques que respondem objeções","Linha visual coerente com o alto padrão"]],
  ["M","Marca no site","Um site que vende o tratamento antes da consulta.","Site mobile-first e rápido",["Páginas por procedimento","Botão de WhatsApp e agenda online","Estrutura pensada para o Google"]],
  ["E","Escala","Mais contatos, com medição.","Crescimento previsível",["Origem dos contatos medida","Agenda e WhatsApp integrados","Tráfego pago quando a base estiver pronta"]]
];
const tabs=document.getElementById("tabs"), panel=document.getElementById("panel");
tabs.innerHTML=PRIME.map((t,k)=>`<button class="tab" role="tab" aria-selected="${k===0}" aria-controls="panel" aria-label="Etapa ${k+1}: ${t[0]} de ${t[1]}" data-k="${k}"><b>${t[0]}</b><span>${t[1]}</span><i class="pg"></i></button>`).join("");
let tabTimer=null, cur=0, manual=false;
function showTab(k){
  cur=k; const t=PRIME[k]; tabs.querySelectorAll(".tab").forEach((b,j)=>b.setAttribute("aria-selected",j===k));
  panel.classList.remove("anim"); void panel.offsetWidth; panel.classList.add("anim");
  panel.innerHTML=`<div class="L">${t[0]}</div><div><p class="k">Etapa ${k+1} de 5 · ${t[1]}</p><h3>${t[2]}</h3><p style="margin-top:10px">${t[3]}.</p></div><ul>${t[4].map(x=>`<li>${x}</li>`).join("")}</ul>`;
}
function stopAuto(){ clearInterval(tabTimer); tabTimer=null; tabs.classList.remove("auto"); }
function startAuto(){ if(RM||manual||tabTimer) return; tabs.classList.remove("auto"); void tabs.offsetWidth; tabs.classList.add("auto"); tabTimer=setInterval(()=>{showTab((cur+1)%5); tabs.classList.remove("auto"); void tabs.offsetWidth; tabs.classList.add("auto");},6000); }
tabs.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{manual=true;stopAuto();showTab(+b.dataset.k);});
showTab(0);
if(!RM && "IntersectionObserver" in window){ new IntersectionObserver(es=>es.forEach(e=>{ e.isIntersecting?startAuto():stopAuto(); }),{threshold:.25}).observe(tabs); }

function animateCount(el){
  const to=+el.dataset.to, pre=el.dataset.pre||""; if(RM){el.textContent=pre+to;return;}
  const t0=performance.now(), d=1200;
  (function f(t){const k=Math.min(1,(t-t0)/d); el.textContent=pre+Math.round(to*(1-Math.pow(1-k,3))); if(k<1) requestAnimationFrame(f);})(t0);
}
const co=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ animateCount(e.target); co.unobserve(e.target);} }),{threshold:.6});
document.querySelectorAll(".count").forEach(el=>co.observe(el));
// anel ilustrativo do hero
const hr=document.getElementById("heroRing"), hn=document.getElementById("heroNum");
if(hr){ const go=()=>{ const to=72; if(RM){hr.style.setProperty("--v",to);hn.innerHTML=to+"<small>/100</small>";return;}
  const t0=performance.now(); (function f(t){const k=Math.min(1,(t-t0)/1600),v=Math.round(to*(1-Math.pow(1-k,3))); hr.style.setProperty("--v",v); hn.innerHTML=v+"<small>/100</small>"; if(k<1) requestAnimationFrame(f);})(t0); };
  setTimeout(go,400); document.querySelector(".dash-rows").classList.add("in"); }

// stagger de entrada
document.querySelectorAll(".grid3,.steps3,.cases,.faq,.facts").forEach(g=>[...g.children].forEach((c,k)=>c.style.setProperty("--d",(k*0.08)+"s")));

// tilt 3D (só com mouse)
if(!RM && matchMedia("(hover:hover) and (pointer:fine)").matches){
  document.querySelectorAll(".tilt,.case").forEach(el=>{
    el.addEventListener("mousemove",e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      el.style.transform=`perspective(900px) rotateY(${x*8}deg) rotateX(${-y*8}deg) translateY(-4px)`;});
    el.addEventListener("mouseleave",()=>el.style.transform="");
  });
}
// barra de progresso + sticky CTA
const sb=document.getElementById("scrollbar"), nv=document.getElementById("nav");
function onScroll(){ const h=document.documentElement; sb.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+"%";
  nv.classList.toggle("scrolled", scrollY>10); }
addEventListener("scroll",onScroll,{passive:true});
document.querySelectorAll("[data-cta]").forEach(a=>a.addEventListener("click",()=>track("ViewContent",{content_name:"cta_"+a.dataset.cta})));

const rot=document.getElementById("rot");
if(rot && !RM){ const W=["harmonização","lentes de contato dental","implantes","tricologia","nutrição","dermatologia","studios de beleza premium"]; let wi=0;
  setInterval(()=>{ rot.classList.add("out"); setTimeout(()=>{ wi=(wi+1)%W.length; rot.textContent=W[wi]; rot.classList.remove("out"); },350); },2400); }
/* ---------- Quiz ---------- */
// p = pontos de presença (quanto mais, melhor presença); f = pontos de fit comercial
const OUTRO = "Outro segmento de saúde/beleza";
const QUESTIONS = [
  { id:"subnicho", q:"Qual é o seu segmento?", opts:[
    {t:"Harmonização facial"},{t:"Estética de beleza (Nanoglam, cílios, sobrancelha)"},
    {t:"Estética corporal/facial em clínica"},{t:"Odonto estética (lentes/facetas)"},{t:"Implantes / reabilitação oral"},
    {t:"Tricologia"},{t:"Nutrição"},{t:"Dermatologia"},{t:"Fisioterapia / estética"},{t:"Studio de beleza premium"},{t:OUTRO}]},
  { id:"origem", q:"Como chega a maioria dos seus clientes hoje?", opts:[
    {t:"Indicação / boca a boca", p:5, opp:"canal"},{t:"Instagram orgânico", p:15, opp:"canal"},
    {t:"Google", p:25},{t:"Tráfego pago", p:25},{t:"Não sei dizer", p:0, opp:"canal"}]},
  { id:"google", q:"Quando alguém busca seu serviço no Google na sua cidade, você aparece?", opts:[
    {t:"Sim, entre os primeiros e com boas avaliações", p:40},{t:"Aparece, mas com poucas avaliações", p:20, opp:"reputacao"},
    {t:"Não aparece", p:0, opp:"google"},{t:"Nunca verifiquei", p:5, opp:"google"}]},
  { id:"site", q:"Seu negócio tem site?", opts:[
    {t:"Sim, e ele gera contatos", p:35},{t:"Sim, mas está desatualizado", p:15, opp:"site"},
    {t:"Não, só Instagram / link na bio", p:5, opp:"site"},{t:"Não tenho", p:0, opp:"site"}]},
  { id:"objetivo", q:"Qual é seu principal objetivo nos próximos 90 dias?", opts:[
    {t:"Atrair mais pacientes de alto ticket", f:30},{t:"Ser referência na minha cidade", f:25},
    {t:"Organizar a presença digital", f:15},{t:"Ainda estou pesquisando", f:0}]},
  { id:"faturamento", q:"Faturamento mensal aproximado do negócio", opts:[
    {t:"Acima de R$ 100 mil", f:35, perfil:"alto"},{t:"R$ 40 mil a R$ 100 mil", f:30, perfil:"alto"},
    {t:"R$ 15 mil a R$ 40 mil", f:20, perfil:"medio"},{t:"Até R$ 15 mil", f:5, perfil:"baixo"},{t:"Prefiro não informar", f:10, perfil:"medio"}]},
  { id:"momento", q:"Quando pretende começar e quem decide?", opts:[
    {t:"Agora / até 30 dias — eu decido", f:35},{t:"Até 30 dias — decido com sócio", f:25},
    {t:"Em 2 a 3 meses", f:10},{t:"Sem previsão", f:0}]}
];

function termos(sub){
  const x=(sub||"").toLowerCase();
  if(/studio|beleza|nanoglam/.test(x)) return {item:"serviço",itens:"serviços",pessoa:"cliente",pessoas:"clientes",local:"studio"};
  if(/nutri/.test(x)) return {item:"atendimento",itens:"atendimentos",pessoa:"paciente",pessoas:"pacientes",local:"consultório"};
  if(/fisio|tricolog|dermato/.test(x)) return {item:"tratamento",itens:"tratamentos",pessoa:"paciente",pessoas:"pacientes",local:"clínica ou consultório"};
  if(/outro/.test(x)) return {item:"serviço",itens:"serviços",pessoa:"paciente ou cliente",pessoas:"pacientes ou clientes",local:"negócio"};
  return {item:"procedimento",itens:"procedimentos",pessoa:"paciente",pessoas:"pacientes",local:"clínica"};
}
const OPPS = {
  google:T=>`Colocar seu ${T.local==="clínica"?"negócio":T.local.split(" ")[0]} no mapa: Google Meu Negócio completo para aparecer nas buscas locais do seu segmento.`,
  reputacao:T=>`Rotina de avaliações no Google para transformar quem já foi atendido em prova para o próximo ${T.pessoa} que está decidindo.`,
  site:T=>`Site mobile-first com páginas por ${T.item}, levando o visitante direto para o WhatsApp.`,
  canal:T=>`Criar um canal previsível de novos ${T.pessoas} além da indicação, para não depender só do boca a boca.`,
  imagem:T=>"Revisar bio, destaques e identidade do Instagram para transmitir o seu padrão premium.",
  escala:T=>"Medir de onde vêm os contatos do WhatsApp e só então escalar com tráfego pago.",
  perfil:T=>`Definir o posicionamento: qual ${T.item} e qual público você quer liderar como primeira escolha.`
};


let i = 0; const ans = {}; const stage = document.getElementById("stage");
const bar = document.getElementById("bar"), stepLbl = document.getElementById("stepLbl");
const TOTAL = QUESTIONS.length + 1;
let started = false;
let segOutro = "";

function progress(n){ bar.style.width = (n/TOTAL*100)+"%"; stepLbl.textContent = n<TOTAL ? `Etapa ${n+1} de ${TOTAL}` : "Resultado"; }

function renderQ(){
  progress(i); const Q = QUESTIONS[i];
  stage.innerHTML = `<p class="q">${esc(Q.q)}</p>` + Q.opts.map((o,k)=>`<button class="opt" data-k="${k}">${esc(o.t)}</button>`).join("") + (i>0?`<button class="back" id="back">← Voltar</button>`:"");
  const bk=document.getElementById("back"); if(bk) bk.onclick=()=>{i--;renderQ();};
  stage.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{
    if(!started){started=true; track("ViewContent",{content_name:"quiz_start"});}
    const o = Q.opts[+b.dataset.k];
    if(Q.id==="subnicho" && o.t===OUTRO){
      stage.querySelectorAll(".opt").forEach(x=>x.style.display=x===b?"":"none");
      b.insertAdjacentHTML("afterend",`<label for="outroQ">Qual é o seu segmento?</label><input id="outroQ" placeholder="Ex.: podologia, medicina integrativa, spa" value="${esc(segOutro)}"><p class="err" id="errQ"></p><button class="btn" id="okQ" style="margin-top:8px">Continuar →</button>`);
      const inp=document.getElementById("outroQ"); inp.focus(); inp.oninput=()=>{document.getElementById("errQ").textContent="";};
      const go=()=>{ const t=inp.value.trim(); if(t.length<2){document.getElementById("errQ").textContent="Conte qual é o seu segmento para continuar.";return;} segOutro=t; ans[Q.id]=o; i++; renderQ(); };
      document.getElementById("okQ").onclick=go; inp.onkeydown=e=>{ if(e.key==="Enter") go(); };
      return;
    }
    ans[Q.id] = o; i++; i<QUESTIONS.length ? renderQ() : renderForm();
  });
}

function renderForm(){
  progress(QUESTIONS.length);
  const subs = QUESTIONS[0].opts.map(o=>`<option ${o.t===ans.subnicho.t?"selected":""}>${esc(o.t)}</option>`).join("");
  stage.innerHTML = `<p class="q">Para onde enviamos seu Raio-X?</p>
  <label for="nome">Seu nome</label><input id="nome" autocomplete="name">
  <label for="wpp">WhatsApp (com DDD)</label><input id="wpp" inputmode="tel" autocomplete="tel" placeholder="(11) 99999-9999">
  <label for="clinica">Nome da clínica, consultório ou studio</label><input id="clinica">
  <label for="sub">Segmento</label><select id="sub">${subs}</select>
  <div id="outroWrap" ${ans.subnicho.t===OUTRO?"":"hidden"}><label for="outro">Qual segmento? (obrigatório)</label><input id="outro" value="${esc(segOutro)}" placeholder="Ex.: podologia, spa, medicina integrativa"></div>
  <label for="ig">@ do Instagram (opcional)</label><input id="ig" placeholder="@seuperfil">
  <p class="err" id="err"></p>
  <button class="btn" id="ver" style="margin-top:12px">Ver meu resultado</button>
  <p class="micro">Ao continuar, você concorda com a <a href="privacidade.html" target="_blank" style="color:var(--gold2)">Política de Privacidade</a>.</p>`;
  const sel=document.getElementById("sub"); sel.onchange=()=>{document.getElementById("outroWrap").hidden = sel.value!==OUTRO;};
  document.getElementById("ver").onclick = ()=>{
    const v = id=>document.getElementById(id).value.trim();
    const lead = {nome:v("nome"), whatsapp:v("wpp").replace(/\D/g,""), clinica:v("clinica"), subnicho:v("sub"), instagram:v("ig")};
    if(!lead.nome || lead.whatsapp.length<10 || !lead.clinica){ document.getElementById("err").textContent="Preencha nome, WhatsApp com DDD e nome do seu negócio."; return; }
    if(lead.subnicho===OUTRO){ const t=v("outro"); if(t.length<2){ document.getElementById("err").textContent="Informe qual é o seu segmento."; return; } segOutro=t; lead.segmento_outro=t; lead.subnicho="Outro: "+t; }
    renderResult(lead);
  };
}

function compute(){
  let p=0,f=0; const opps=[];
  QUESTIONS.forEach(Q=>{const a=ans[Q.id]; p+=a.p||0; f+=a.f||0; if(a.opp && !opps.includes(a.opp)) opps.push(a.opp);});
  ["imagem","perfil","escala"].forEach(o=>{ if(opps.length<3) opps.push(o); });
  const nota = Math.min(100, p);          // nota de presença 0-100 (máx: 25+40+35)
  const fit = Math.min(100, f);           // fit comercial 0-100 (máx: 30+35+35)
  const nivel = fit>=70 ? "quente" : fit>=40 ? "morno" : "frio";
  return {nota, fit, nivel, opps:opps.slice(0,3), perfil:(ans.faturamento||{}).perfil};
}

function waLink(lead, nota){
  const msg = `Olá! Sou ${lead.nome}, da ${lead.clinica} (${lead.subnicho}). Fiz o Raio-X de Presença da Prime Studio e minha nota foi ${nota}/100. Quero entender como melhorar.`;
  return `https://wa.me/${CONFIG.WHATSAPP_NUMERO}?text=${encodeURIComponent(msg)}`;
}

function emHorario(d=new Date()){
  const parts=new Intl.DateTimeFormat("en-US",{timeZone:"America/Sao_Paulo",weekday:"short",hour:"numeric",hour12:false}).formatToParts(d);
  const wd={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[parts.find(x=>x.type==="weekday").value];
  const h=+parts.find(x=>x.type==="hour").value%24;
  return CONFIG.HORARIO.dias.includes(wd) && h>=CONFIG.HORARIO.inicio && h<CONFIG.HORARIO.fim - 0.5;
}
let leadId=null;
async function sendLead(payload){
  try{
    const r=await fetch(CONFIG.LEAD_API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    if(!r.ok) return false; const j=await r.json(); if(j.id) leadId=j.id; return !!j.ok;
  }catch(e){ return false; }
}
function renderResult(lead){
  const r = compute(); progress(TOTAL);
  const respostas=Object.fromEntries(Object.entries(ans).map(([k,v])=>[k,v.t]));
  const base={...lead, nota:r.nota, fit:r.fit, nivel:r.nivel, respostas, pagina:location.href};
  track("Lead",{content_name:"raio_x", value:r.nota, status:r.nivel});
  const firstSend = sendLead({...base, ligacao:false});
  const wa = waLink(lead, r.nota);
  const dentro = emHorario();
  const prazo = dentro ? "em até 30 minutos" : "no próximo horário comercial";
  const hor = `${["dom","seg","ter","qua","qui","sex","sáb"].filter((_,k)=>CONFIG.HORARIO.dias.includes(k)).join(", ")}, ${CONFIG.HORARIO.inicio}h às ${CONFIG.HORARIO.fim}h`;
  const intro = { quente:"Seu momento e seu perfil combinam com o Método PRIME.", morno:"Há oportunidades claras para o seu negócio.", frio:"Comece pelas oportunidades acima, e conte com a gente quando quiser." }[r.nivel];
  stage.innerHTML = `<div class="score-wrap"><div class="ring" style="--v:${r.nota}"><span>${r.nota}<small>/100</small></span></div>
  <div><p class="step" style="margin:0">Nota de presença digital</p><p class="q" style="margin:4px 0">${esc(lead.nome.split(" ")[0])}, este é o seu Raio-X</p><span class="tag">${esc(lead.clinica)} · ${esc(lead.subnicho)}</span></div></div>
  <p class="step" style="margin-top:28px">3 oportunidades para você</p>
  <ol class="opps">${r.opps.map(o=>`<li>${esc(OPPS[o](termos(lead.subnicho)))}</li>`).join("")}</ol>
  <div class="callbox">
    <p class="k">Próximo passo · ${esc(intro)}</p>
    <h3>Receba uma ligação de diagnóstico ${prazo}</h3>
    <p>Não é venda. É só para entender o seu negócio e explicar o seu Raio-X. Ligamos para <b>${esc(lead.whatsapp.replace(/^(\d{2})(\d{4,5})(\d{4})$/,"($1) $2-$3"))}</b>.</p>
    <button class="btn" id="bCall">Quero receber a ligação</button>
    <p class="micro">Horário comercial: ${hor}.${dentro?"":" Fora desse horário, ligamos no próximo horário comercial."}</p>
  </div>
  <p class="step" style="margin-top:24px">Prefere outro caminho?</p>
  <div class="ctas">
    <a class="btn ghost" id="bWa" href="${esc(wa)}" target="_blank" rel="noopener">2 · Falar agora no WhatsApp</a>
    <a class="btn ghost" id="bAg" href="${esc(CONFIG.AGENDA_URL)}" target="_blank" rel="noopener">3 · Escolher um horário na agenda</a>
  </div>`;
  stage.dataset.nivel = r.nivel;
  document.getElementById("bCall").onclick = async (e)=>{
    const btn=e.currentTarget; btn.disabled=true; btn.textContent="Enviando…";
    track("Contact",{content_name:"pedido_ligacao", status:r.nivel});
    await firstSend; const ok = await sendLead({...base, ligacao:true, id:leadId});
    const box=btn.closest(".callbox");
    if(ok){ box.innerHTML=`<p class="k">Pedido recebido</p><h3>Pronto! Vamos te ligar ${prazo}.</h3><p>Se preferir adiantar, mande um oi no WhatsApp.</p>`; box.dataset.status="ok"; }
    else {
      // Sem servidor (ex. GitHub Pages) ou falha: o pedido segue pelo WhatsApp, que avisa o Marcos na hora
      const msg=`Olá! Sou ${lead.nome}, da ${lead.clinica} (${lead.subnicho}). Fiz o Raio-X de Presença (nota ${r.nota}/100) e quero receber a ligação de diagnóstico no ${lead.whatsapp}.`;
      box.innerHTML=`<p class="k">Quase lá</p><h3>Confirme seu pedido pelo WhatsApp</h3><p>Abrimos uma mensagem pronta. É só enviar.</p><a class="btn" href="https://wa.me/${CONFIG.WHATSAPP_NUMERO}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">Enviar pedido no WhatsApp</a>`; box.dataset.status="fallback";
    }
  };
  document.getElementById("bAg").onclick=()=>track("Schedule",{status:r.nivel});
  document.getElementById("bWa").onclick=()=>track("Contact",{content_name:"whatsapp",status:r.nivel});
  document.getElementById("quiz").scrollIntoView({behavior:"smooth"});
}

renderQ();
