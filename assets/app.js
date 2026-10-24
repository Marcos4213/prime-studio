/* ===================== CONFIGURAÇÃO — EDITE AQUI ===================== */
const CONFIG = {
  // Endpoint que salva o lead (Cloudflare Pages Function em /functions/api/lead.js).
  // No GitHub Pages não existe; o site cai automaticamente no WhatsApp.
  LEAD_API: "/api/lead",
  // Horário comercial (America/Sao_Paulo) para a promessa "ligação em até 30 minutos"
  HORARIO: { dias:[1,2,3,4,5,6], inicio:9, fim:18 },   // seg–sáb, 9h–18h (sábado a confirmar)
  WHATSAPP_NUMERO: "5511913221587",
  // Opção 3 (agenda). Placeholder: trocar pelo link do Cal.com quando estiver pronto.
  AGENDA_URL: "https://cal.com/marcos-paulo-wpugxh/diagnostico",
  CAL_LINK: "marcos-paulo-wpugxh/diagnostico",   // Cal.com: Diagnóstico de Presença (30 min, Google Meet)
  CAL_BRAND: "#c8a25a",
  META_PIXEL_ID: "",              // preencha para ativar o Pixel (inativo vazio)
  CAPI_URL: "/api/capi",           // Conversions API (só envia se META_PIXEL_ID e, no servidor, META_CAPI_TOKEN existirem)
  CONTEUDO_URL: "#metodo"
};
/* ======================================================================= */

/* ---------- Atribuição (UTMs, fbclid, _fbc/_fbp) ---------- */
const ATTR = (()=>{
  const q=new URLSearchParams(location.search), keys=["utm_source","utm_medium","utm_campaign","utm_content","utm_term","fbclid","gclid"];
  let s={}; try{ s=JSON.parse(localStorage.getItem("prime_attr"))||{}; }catch(e){}
  const now={}; keys.forEach(k=>{ const v=q.get(k); if(v) now[k]=v.slice(0,200); });
  if(Object.keys(now).length){ s.last={...now, ts:Date.now(), landing:location.pathname}; if(!s.first) s.first=s.last; }
  if(!s.first) s.first={ref:document.referrer.slice(0,200), ts:Date.now(), landing:location.pathname};
  if(now.fbclid){ const fbc=`fb.1.${Date.now()}.${now.fbclid}`; document.cookie=`_fbc=${fbc};path=/;max-age=7776000;SameSite=Lax`; }
  try{ localStorage.setItem("prime_attr",JSON.stringify(s)); }catch(e){}
  return s;
})();
const cookie=n=>(document.cookie.match(new RegExp("(?:^|; )"+n+"=([^;]*)"))||[])[1]||"";
function attribution(){ const l=ATTR.last||{}, f=ATTR.first||{};
  return { utm_source:l.utm_source||f.utm_source||"", utm_medium:l.utm_medium||f.utm_medium||"", utm_campaign:l.utm_campaign||f.utm_campaign||"", utm_content:l.utm_content||f.utm_content||"", utm_term:l.utm_term||f.utm_term||"", fbclid:l.fbclid||f.fbclid||"", gclid:l.gclid||f.gclid||"", referrer:f.ref||"", landing:f.landing||"", fbc:cookie("_fbc"), fbp:cookie("_fbp") }; }
function origem(){ const lp=document.body.dataset.origemLead; if(lp) return lp; const a=attribution(); return a.utm_source ? `utm:${a.utm_source}` : a.fbclid ? "meta_ads" : a.gclid ? "google_ads" : a.referrer && !a.referrer.includes(location.host) ? "referral" : "direto"; }
async function sha256(v){ if(!v||!crypto.subtle) return ""; const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(String(v).trim().toLowerCase())); return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join(""); }
const uid=()=> (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2));

/* ---------- Meta Pixel + Conversions API (inativos sem META_PIXEL_ID) ---------- */
let PX_USER={};   // em/ph já em SHA-256 (Advanced Matching)
if (CONFIG.META_PIXEL_ID) {
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', CONFIG.META_PIXEL_ID);
}
const STD=new Set(["PageView","ViewContent","Lead","CompleteRegistration","Contact","Schedule","InitiateCheckout"]);
function track(ev, data, eid){
  if(!CONFIG.META_PIXEL_ID) return null;
  const event_id=eid||uid(), params={...(data||{})};
  try{ fbq(STD.has(ev)?"track":"trackCustom", ev, params, {eventID:event_id}); }catch(e){}
  if(CONFIG.CAPI_URL){
    const body=JSON.stringify({event_name:ev, event_id, params, url:location.href, user:PX_USER, fbc:cookie("_fbc"), fbp:cookie("_fbp")});
    try{ navigator.sendBeacon ? navigator.sendBeacon(CONFIG.CAPI_URL, new Blob([body],{type:"application/json"})) : fetch(CONFIG.CAPI_URL,{method:"POST",body,keepalive:true,headers:{"content-type":"application/json"}}); }catch(e){}
  }
  return event_id;
}
async function setMatch(email, phone){
  PX_USER={em:await sha256(email), ph:await sha256(String(phone||"").replace(/\D/g,""))};
  if(CONFIG.META_PIXEL_ID){ try{ fbq('init', CONFIG.META_PIXEL_ID, {em:PX_USER.em, ph:PX_USER.ph}); }catch(e){} }
}
track("PageView");
// ViewContent por seção (uma vez por seção)
if("IntersectionObserver" in window){ const seen=new Set(); const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting && !seen.has(e.target.id)){ seen.add(e.target.id); track("ViewContent",{content_name:"secao_"+e.target.id, content_category:"secao"}); } }),{threshold:.4}); document.querySelectorAll("section[id]").forEach(s=>io.observe(s)); }
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

/* ---------- UI geral ---------- */
document.getElementById("yr").textContent = new Date().getFullYear();
const nav = document.getElementById("nav");
addEventListener("scroll", ()=>nav.classList.toggle("scrolled", scrollY>30), {passive:true});
const footWa = document.getElementById("footWa");
footWa.href = `https://wa.me/${CONFIG.WHATSAPP_NUMERO}?text=${encodeURIComponent("Olá! Vim pelo site da Prime Studio e quero saber mais sobre o Método PRIME.")}`;
footWa.onclick = ()=>track("Contact",{content_name:"whatsapp_rodape", origem:origem()});

/* ---------- Cases (EXEMPLOS de projeto — substitua por cases reais) ---------- */
const ART = {
  harm:`<svg viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><defs><linearGradient id="hg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9d6bf"/><stop offset="1" stop-color="#b9906a"/></linearGradient><radialGradient id="hr" cx=".7" cy=".25" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="400" height="520" fill="url(#hg)"/><rect width="400" height="520" fill="url(#hr)"/><path d="M230 70c-70 0-110 60-105 140 3 45 20 70 15 100-6 35-40 55-40 95 0 35 30 65 90 115" fill="none" stroke="#5a4029" stroke-width="2.2" opacity=".55"/><path d="M175 230c12 8 26 8 38 0M190 300c10 6 22 6 32 0" stroke="#5a4029" stroke-width="2" fill="none" opacity=".45"/><circle cx="300" cy="380" r="70" fill="none" stroke="#fff" stroke-opacity=".5"/><circle cx="300" cy="380" r="100" fill="none" stroke="#fff" stroke-opacity=".25"/></svg>`,
  odonto:`<svg viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><defs><linearGradient id="og" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16324a"/><stop offset="1" stop-color="#0b1a28"/></linearGradient><linearGradient id="ot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d9e6ef"/></linearGradient></defs><rect width="400" height="520" fill="url(#og)"/><circle cx="200" cy="250" r="150" fill="#9fc3dc" opacity=".12"/><path d="M95 250q105 95 210 0" fill="none" stroke="#c7dcea" stroke-width="2" opacity=".6"/><g fill="url(#ot)">${[0,1,2,3,4,5].map(k=>`<rect x="${112+k*30}" y="${222+Math.abs(k-2.5)*6}" width="25" height="${48-Math.abs(k-2.5)*5}" rx="11"/>`).join("")}</g><path d="M60 120 Q200 60 340 120" stroke="#d7b46a" stroke-width="1.5" fill="none" opacity=".8"/><circle cx="330" cy="420" r="4" fill="#d7b46a"/><circle cx="70" cy="400" r="2.5" fill="#d7b46a"/></svg>`,
  est:`<svg viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><defs><linearGradient id="eg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dfe4d6"/><stop offset="1" stop-color="#9aa58a"/></linearGradient></defs><rect width="400" height="520" fill="url(#eg)"/><ellipse cx="200" cy="300" rx="120" ry="160" fill="#f4f1e8" opacity=".55"/><g fill="none" stroke="#4f5a40" stroke-width="1.6" opacity=".6"><path d="M90 470C150 360 160 250 120 120"/><path d="M120 300c-30-10-50-30-55-60M128 230c25-12 40-32 42-58M118 380c30-6 52-24 62-50"/></g><circle cx="280" cy="150" r="46" fill="#fff" opacity=".5"/><circle cx="280" cy="150" r="22" fill="#c9b48a" opacity=".7"/></svg>`
};
const CASES = [
  { id:"harm", nicho:"Harmonização facial", nome:"Maison Aurora", url:"maisonaurora.com.br",
    resumo:"Página por procedimento com narrativa de naturalidade, agenda online e WhatsApp sempre à mão.",
    t:{a:"#a07a4f",bgc:"#f7f0e7",ink:"#2b2118",soft:"#eadccb"},
    h1:"Beleza <em>natural</em>, assinada com precisão.", sub:"Harmonização facial com planejamento individual e foco em resultados equilibrados.",
    servs:[["Preenchimento labial","Volume e contorno respeitando a proporção do rosto."],["Toxina botulínica","Suavização de linhas de expressão com naturalidade."],["Bioestimuladores","Firmeza e qualidade de pele de forma gradual."]],
    band:"Cada rosto pede um plano. O seu começa com uma avaliação.", },
  { id:"odonto", nicho:"Odonto estética · Lentes", nome:"Lumière Odonto", url:"lumiereodonto.com.br",
    resumo:"Página de alto padrão para lentes de contato dental, com etapas do tratamento e captação via WhatsApp.",
    t:{a:"#c9a35d",bgc:"#0f1d2b",ink:"#f1ede4",soft:"#1d3245"}, dark:true,
    h1:"O sorriso que você <em>sempre quis</em> mostrar.", sub:"Lentes de contato dental e facetas com planejamento digital do sorriso.",
    servs:[["Lentes de contato dental","Lâminas ultrafinas para forma, cor e alinhamento."],["Facetas em porcelana","Durabilidade e brilho natural para casos complexos."],["Planejamento digital","Visualize a proposta do sorriso antes de começar."]],
    band:"Agende sua avaliação e conheça o seu novo sorriso." },
  { id:"est", nicho:"Estética facial e corporal", nome:"Essence Clinique", url:"essenceclinique.com.br",
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
  <div class="info"><h3>${c.nome}</h3><p><strong>${c.nicho}.</strong> ${c.resumo}</p></div></button>`).join("");
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
/* ---------- Quiz (overlay dedicado) ---------- */
// Nichos e banco de copies: nicho x faixa de nota x dor principal
const NICHOS = {
  estetica:{t:"Estética facial e corporal", p:"paciente", ps:"pacientes", unid:"avaliações de protocolo", item:"protocolo", local:"clínica"},
  odonto:{t:"Odontologia (lentes, facetas, implantes)", p:"paciente", ps:"pacientes", unid:"avaliações de lentes e implantes", item:"tratamento", local:"consultório"},
  harmo:{t:"Harmonização facial", p:"paciente", ps:"pacientes", unid:"consultas de harmonização", item:"procedimento", local:"clínica"},
  nutri:{t:"Nutrição", p:"paciente", ps:"pacientes", unid:"primeiras consultas", item:"acompanhamento", local:"consultório"},
  fisio:{t:"Fisioterapia e saúde", p:"paciente", ps:"pacientes", unid:"novos pacientes em tratamento", item:"tratamento", local:"clínica"},
  beleza:{t:"Beleza (studio, cílios, sobrancelha, cabelo)", p:"cliente", ps:"clientes", unid:"clientes recorrentes na agenda", item:"serviço", local:"studio"},
  outro:{t:"Outro negócio de alto padrão", p:"cliente", ps:"clientes", unid:"novos clientes", item:"serviço", local:"negócio"}
};
const HEAD = {
  estetica:["Sua clínica entrega mais do que a internet mostra.","Sua estética já aparece. Ainda não convence.","Base forte. Agora é transformar presença em protocolo fechado."],
  odonto:["Quem procura lentes na sua cidade ainda não encontra você.","Seu consultório aparece, mas não transmite o valor do tratamento.","Presença sólida. Falta virar agenda de casos de alto valor."],
  harmo:["Seu resultado é natural. Sua presença ainda é invisível.","A paciente te encontra, compara e ainda hesita.","Você já é referência. Falta escalar com previsibilidade."],
  nutri:["Seu atendimento é sério. Seu perfil ainda não mostra isso.","Você aparece, mas parece mais um nutri entre muitos.","Boa autoridade. Agora é lotar a agenda de primeiras consultas."],
  fisio:["Quem sente dor procura no Google, e encontra outra clínica.","Sua clínica aparece, mas não explica por que tratar com você.","Presença boa. Falta canal previsível de pacientes particulares."],
  beleza:["Seu trabalho é premium. Seu perfil ainda parece comum.","A cliente gosta do seu feed, mas não sente segurança para agendar.","Você já atrai. Agora é encher a agenda com quem paga o seu valor."],
  outro:["Seu negócio entrega alto padrão. A presença digital ainda não.","Você aparece, mas não se diferencia de quem cobra menos.","Base sólida. Falta transformar presença em agenda previsível."]
};
const DOR = {
  agenda:{t:"Agenda com buracos ou irregular", d:N=>`Agenda irregular quase sempre é falta de fluxo constante de ${N.ps} novos: hoje você depende de indicação e de momentos de sorte, e não de um caminho que leva quem pesquisa até o seu WhatsApp.`},
  preco:{t:"Chegam pedindo só preço", d:N=>`Quando o ${N.p} chega perguntando só o preço, é porque a sua presença não mostrou o valor antes da conversa. Ele compara você com o mais barato porque não viu diferença.`},
  visib:{t:"Pouca gente nova me encontra", d:N=>`Quem procura ${N.item} na sua região pesquisa no Google e no Instagram antes de chamar. Se ${N.local==="clínica"?"a sua":"o seu"} ${N.local} não aparece bem ali, esse ${N.p} vai para quem aparece.`},
  valor:{t:"Meu perfil não transmite meu nível", d:N=>`O seu atendimento é de alto padrão, mas o perfil, o site e o WhatsApp ainda passam uma imagem comum. O ${N.p} decide em segundos se você "parece caro e confiável".`}
};
const OPP = {
  estetica:{google:"Google Meu Negócio com fotos reais da clínica e rotina de avaliações de quem fez protocolo.",insta:"Destaques de Resultados, Protocolos e Depoimentos para a paciente entender o processo antes de chamar.",site:"Páginas por protocolo (flacidez, gordura localizada, manchas) que levam direto à avaliação.",wpp:"WhatsApp Business com catálogo de protocolos e horários de avaliação.",canal:"Campanha local para \"estética + bairro\" quando a base estiver pronta."},
  odonto:{google:"Aparecer em \"lentes de contato dental\" e \"implante\" na sua cidade, com avaliações e fotos do consultório.",insta:"Destaques de Casos, Planejamento e Depoimentos para justificar o investimento do tratamento.",site:"Página de lentes e de implantes com etapas, tempo e o que está incluso, sem expor preço.",wpp:"Fluxo de WhatsApp que agenda a avaliação e envia o que levar.",canal:"Rotina de pedidos de indicação de pacientes satisfeitos."},
  harmo:{google:"Perfil no Google para \"harmonização facial\" na sua região, com avaliações que citam resultado natural.",insta:"Destaques de Resultados naturais, Procedimentos e Antes/Depois com contexto ético.",site:"Páginas por procedimento (lábios, mandíbula, full face) que respondem às dúvidas antes da consulta.",wpp:"WhatsApp com catálogo e mensagem de avaliação individual, sem cair no \"quanto custa?\".",canal:"Conteúdo e campanha para pacientes de alto ticket na sua cidade."},
  nutri:{google:"Aparecer em \"nutricionista + especialidade\" na sua cidade, com avaliações de quem teve resultado.",insta:"Destaques de Método, Depoimentos e Como funciona o acompanhamento.",site:"Página do seu método de acompanhamento com a jornada do paciente e agenda online.",wpp:"WhatsApp que agenda a primeira consulta e envia o pré-questionário.",canal:"Parcerias e conteúdo que levam a uma primeira consulta, não só a seguidores."},
  fisio:{google:"Aparecer quando alguém busca \"fisioterapia + dor\" no seu bairro, com avaliações e horários.",insta:"Destaques de Tratamentos, Equipe e Depoimentos de recuperação.",site:"Páginas por condição (coluna, joelho, pós-operatório) que convertem em avaliação particular.",wpp:"WhatsApp com triagem rápida e horários de avaliação.",canal:"Canal de pacientes particulares além de convênio e indicação médica."},
  beleza:{google:"Perfil do Google do studio com fotos de trabalhos e avaliações recentes.",insta:"Destaques de Trabalhos, Cuidados, Valores sob consulta e Localização com ícones da marca.",site:"Link da bio organizado com serviços, agenda e localização.",wpp:"WhatsApp com catálogo de serviços e agendamento de retorno.",canal:"Rotina de retorno e indicação para manter a agenda recorrente."},
  outro:{google:"Google Meu Negócio completo com avaliações e fotos do seu espaço.",insta:"Bio, destaques e identidade que transmitem o seu padrão.",site:"Site mobile-first com páginas por serviço levando ao WhatsApp.",wpp:"WhatsApp Business com catálogo e horários organizados.",canal:"Canal previsível de novos clientes além da indicação."}
};
const PERDA = {baixa:"6 a 12", media:"3 a 6", alta:"1 a 3"};
const QUESTIONS = [
  {id:"nicho", q:"Qual é o seu segmento?", opts:Object.entries(NICHOS).map(([k,n])=>({t:n.t,k}))},
  {id:"dor", q:"Qual é a sua maior dor hoje?", opts:Object.entries(DOR).map(([k,d])=>({t:d.t,k}))},
  {id:"origem", q:"Como chega a maioria dos seus novos clientes?", opts:[{t:"Indicação / boca a boca",p:5,w:"canal"},{t:"Instagram orgânico",p:12,w:"canal"},{t:"Google",p:20},{t:"Tráfego pago",p:20},{t:"Não sei dizer",p:0,w:"canal"}]},
  {id:"google", q:"Quando alguém busca o seu serviço no Google na sua cidade, você aparece?", opts:[{t:"Sim, entre os primeiros e com boas avaliações",p:30},{t:"Aparece, mas com poucas avaliações",p:15,w:"google"},{t:"Não aparece",p:0,w:"google"},{t:"Nunca verifiquei",p:3,w:"google"}]},
  {id:"insta", q:"O seu Instagram transmite o nível do seu atendimento?", opts:[{t:"Sim, bio, destaques e feed no padrão",p:25},{t:"Mais ou menos, falta organização",p:12,w:"insta"},{t:"Não, parece amador",p:3,w:"insta"},{t:"Quase não uso",p:0,w:"insta"}]},
  {id:"site", q:"E o site?", opts:[{t:"Tenho e ele gera contatos",p:25},{t:"Tenho, mas está desatualizado",p:12,w:"site"},{t:"Só link na bio",p:5,w:"site"},{t:"Não tenho",p:0,w:"site"}]},
  {id:"faturamento", q:"Faturamento mensal aproximado", opts:[{t:"Acima de R$ 100 mil",f:35},{t:"R$ 40 mil a R$ 100 mil",f:30},{t:"R$ 15 mil a R$ 40 mil",f:20},{t:"Até R$ 15 mil",f:5},{t:"Prefiro não informar",f:10}]},
  {id:"momento", q:"Quando você quer resolver isso?", opts:[{t:"Agora, nos próximos 30 dias",f:35},{t:"Em 1 a 3 meses",f:15},{t:"Só estou pesquisando",f:0}]}
];
const DOR_W = {agenda:"wpp", preco:"insta", visib:"google", valor:"site"};
const SK="prime_rx";
let st = (()=>{ try{ return JSON.parse(sessionStorage.getItem(SK))||{} }catch(e){ return {} } })();
st.ans = st.ans||{}; st.i = st.i||0;
const save=()=>{ try{ sessionStorage.setItem(SK, JSON.stringify(st)); }catch(e){} };
const qx=document.getElementById("qx"), qs=document.getElementById("qxStage"), qbar=document.getElementById("qxBar"), qstep=document.getElementById("qxStep"), qback=document.getElementById("qxBack");
const TOTAL = QUESTIONS.length + 1;
let lastFocus=null;
function openQuiz(src){
  lastFocus=document.activeElement; qx.hidden=false; document.documentElement.classList.add("qx-on");
  if(!st.started){ st.started=true; save(); track("QuizStart",{src, origem:origem()}); } render(); setTimeout(()=>qx.querySelector("button.opt, input, .btn")?.focus(),60);
}
function closeQuiz(){ qx.hidden=true; document.documentElement.classList.remove("qx-on"); lastFocus&&lastFocus.focus&&lastFocus.focus(); }
document.querySelectorAll("[data-quiz]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();openQuiz(b.dataset.cta||"quiz");}));
document.getElementById("qxClose").onclick=closeQuiz;
addEventListener("keydown",e=>{ if(e.key==="Escape" && !qx.hidden) closeQuiz(); });
qback.onclick=()=>{ if(st.view==="result"){ st.view="form"; } else if(st.view==="form"){ st.view=null; st.i=QUESTIONS.length-1; } else if(st.i>0){ st.i--; } save(); render(); };
function prog(n,label){ qbar.style.width=(n/TOTAL*100)+"%"; qstep.textContent=label; qback.style.visibility=(n>0)?"visible":"hidden"; }
function render(){ if(st.view==="result" && st.lead) return renderResult(); if(st.view==="form") return renderForm(); renderQ(); }
function anim(){ qs.classList.remove("in"); void qs.offsetWidth; qs.classList.add("in"); qx.scrollTop=0; }
function renderQ(){
  const Q=QUESTIONS[st.i]; prog(st.i, `Pergunta ${st.i+1} de ${QUESTIONS.length}`);
  const cur=st.ans[Q.id];
  qs.innerHTML=`<h2 class="qx-q">${esc(Q.q)}</h2><div class="qx-opts">`+Q.opts.map((o,k)=>`<button class="opt${cur&&cur.t===o.t?" sel":""}" data-k="${k}">${esc(o.t)}</button>`).join("")+`</div>`;
  anim();
  qs.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{
    const o=Q.opts[+b.dataset.k];
    if(Q.id==="nicho" && o.k==="outro"){
      qs.querySelector(".qx-opts").innerHTML=`<label for="outroQ">Qual é o seu segmento?</label><input id="outroQ" placeholder="Ex.: dermatologia, spa, medicina integrativa" value="${esc(st.outro||"")}"><p class="err" id="errQ"></p><button class="btn" id="okQ">Continuar →</button>`;
      const inp=document.getElementById("outroQ"); inp.focus();
      const go=()=>{ const t=inp.value.trim(); if(t.length<2){document.getElementById("errQ").textContent="Conte qual é o seu segmento.";return;} st.outro=t; st.ans.nicho=o; st.i++; save(); render(); };
      document.getElementById("okQ").onclick=go; inp.onkeydown=e=>{ if(e.key==="Enter") go(); }; return;
    }
    b.classList.add("sel"); st.ans[Q.id]=o; save(); track("QuizStep",{step:st.i+1, pergunta:Q.id, resposta:o.t});
    setTimeout(()=>{ if(st.i<QUESTIONS.length-1){ st.i++; } else { st.view="form"; } save(); render(); },180);
  });
}
function pxParams(r){ return {nicho:(NICHOS[r.nk]||{}).t||"", score:r.nota, value:r.nota, currency:"BRL", dor:(DOR[r.dk]||{}).t||"", faixa:r.faixa, status:r.nivel}; }
function compute(){
  let p=0,f=0; const weak=[];
  QUESTIONS.forEach(Q=>{const a=st.ans[Q.id]||{}; p+=a.p||0; f+=a.f||0; if(a.w && !weak.includes(a.w)) weak.push(a.w);});
  const nk=(st.ans.nicho||{}).k||"outro", dk=(st.ans.dor||{}).k||"visib";
  const order=[DOR_W[dk], ...weak, "google","insta","site","wpp","canal"]; const opps=[...new Set(order)].slice(0,3);
  const nota=Math.min(100,p), fit=Math.min(100,f);
  const faixa = nota<40?"baixa":nota<70?"media":"alta";
  return {nota, fit, nivel: fit>=60?"quente":fit>=30?"morno":"frio", nk, dk, faixa, opps};
}
function renderForm(){
  const r=compute(); prog(QUESTIONS.length, "Último passo");
  const L=st.lead||{};
  qs.innerHTML=`<div class="qx-lock"><div class="ring blur" style="--v:${r.nota}"><span>${r.nota}<small>/100</small></span></div><p class="k">🔒 Seu Raio-X está pronto</p></div>
  <h2 class="qx-q">Para onde enviamos o seu diagnóstico?</h2>
  <p class="qx-sub">Você vê o resultado na hora, nesta tela, e recebe uma cópia.</p>
  <label for="nome">Seu nome</label><input id="nome" autocomplete="name" value="${esc(L.nome||"")}">
  <label for="wpp">WhatsApp (com DDD)</label><input id="wpp" inputmode="tel" autocomplete="tel" placeholder="(11) 99999-9999" value="${esc(L.whatsapp||"")}">
  <label for="email">E-mail</label><input id="email" type="email" inputmode="email" autocomplete="email" placeholder="voce@clinica.com.br" value="${esc(L.email||"")}">
  <label for="clinica">Nome da clínica, consultório ou studio</label><input id="clinica" value="${esc(L.clinica||"")}">
  <p class="err" id="err"></p>
  <button class="btn" id="ver">Revelar meu Raio-X <span aria-hidden="true">→</span></button>
  <p class="micro">Sem spam. Ao continuar, você concorda com a <a href="privacidade.html" target="_blank">Política de Privacidade</a>.</p>`;
  anim();
  document.getElementById("ver").onclick=()=>{
    const v=id=>document.getElementById(id).value.trim();
    const lead={nome:v("nome"), whatsapp:v("wpp").replace(/\D/g,""), email:v("email"), clinica:v("clinica")};
    if(!lead.nome || lead.whatsapp.length<10 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email) || !lead.clinica){ document.getElementById("err").textContent="Preencha nome, WhatsApp com DDD, um e-mail válido e o nome do seu negócio."; return; }
    st.lead=lead; st.view="result"; save();
    const respostas=Object.fromEntries(Object.entries(st.ans).map(([k,o])=>[k,o.t]));
    const N=NICHOS[r.nk];
    sendLead({...lead, origem_lead:document.body.dataset.origemLead||"site", nicho_key:r.nk, origem:origem(), atribuicao:attribution(), faixa:r.faixa, subnicho: r.nk==="outro" ? "Outro: "+(st.outro||"") : N.t, segmento_outro: st.outro||"", dor: DOR[r.dk].t, nota:r.nota, fit:r.fit, nivel:r.nivel, ligacao:false, respostas, pagina:location.href});
    const pp=pxParams(r); setMatch(lead.email, "55"+lead.whatsapp.replace(/^55/,"")).then(()=>{ const eid=track("Lead",{content_name:"raio_x", ...pp}); if(eid){ st.leadEventId=eid; save(); } });
    renderResult();
  };
}
async function sendLead(payload){ try{ const x=await fetch(CONFIG.LEAD_API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}); const d=await x.json().catch(()=>({})); if(d.id){ try{ st.leadId=d.id; save(); }catch(_){} } return x.ok; }catch(e){ return false; } }
function renderResult(){
  const r=compute(), L=st.lead, N=NICHOS[r.nk], nome=L.nome.split(" ")[0];
  prog(TOTAL, "Seu Raio-X");
  if(!st.crSent){ st.crSent=true; save(); track("CompleteRegistration",{content_name:"raio_x_resultado", ...pxParams(r)}); }
  const seg = r.nk==="outro" && st.outro ? st.outro : N.t;
  const head = HEAD[r.nk][{baixa:0,media:1,alta:2}[r.faixa]];
  const perda = PERDA[r.faixa];
  const msgWa = `Olá! Sou ${L.nome}, da ${L.clinica} (${seg}). Fiz o Raio-X de Presença e minha nota foi ${r.nota}/100. Minha maior dor: ${DOR[r.dk].t.toLowerCase()}. Quero entender o meu diagnóstico.`;
  const msgAg = `Olá! Sou ${L.nome}, da ${L.clinica} (${seg}). Fiz o Raio-X (nota ${r.nota}/100) e quero agendar o diagnóstico gratuito. Quais horários vocês têm?`;
  const wa = t=>`https://wa.me/${CONFIG.WHATSAPP_NUMERO}?text=${encodeURIComponent(t)}`;
  const agHref = CONFIG.AGENDA_URL || wa(msgAg);
  qs.innerHTML=`<div class="score-wrap"><div class="ring" style="--v:${r.nota}"><span>${r.nota}<small>/100</small></span></div>
   <div><p class="k">${esc(nome)}, este é o seu Raio-X</p><span class="tag">${esc(L.clinica)} · ${esc(seg)}</span></div></div>
   <h2 class="qx-q res">${esc(head)}</h2>
   <p class="qx-diag">${esc(DOR[r.dk].d(N))}</p>
   <div class="qx-loss"><b>${perda} ${esc(N.unid)}</b><span>por mês é o que um negócio com a sua nota costuma deixar com a concorrência <small>(estimativa)</small>.</span></div>
   <p class="k" style="margin-top:22px">3 oportunidades para ${N.local==="clínica"?"a sua":"o seu"} ${esc(N.local)}</p>
   <ol class="opps">${r.opps.map(o=>`<li>${esc(OPP[r.nk][o])}</li>`).join("")}</ol>
   <div class="qx-ctas">
     <div><a class="btn" id="bWa" href="${esc(wa(msgWa))}" target="_blank" rel="noopener">Falar no WhatsApp agora</a><p class="micro">Cada semana sem ajuste são ${esc(N.ps)} que pesquisaram você e fecharam com outro. Resposta dos fundadores, sem vendedor.</p></div>
     <div><a class="btn ghost" id="bAg" href="${esc(agHref)}" target="_blank" rel="noopener">Escolher horário do diagnóstico</a><p class="micro">Conversa curta e gratuita. Você sai com o plano ${N.local==="clínica"?"da sua":"do seu"} ${esc(N.local)}, mesmo que não contrate.</p></div>
   </div>`;
  anim();
  document.getElementById("bWa").onclick=()=>track("Contact",{content_name:"whatsapp_resultado", ...pxParams(r)});
  document.getElementById("bAg").onclick=e=>{ e.preventDefault(); track("InitiateCheckout",{content_name:"agenda_aberta", ...pxParams(r)}); closeQuiz();
    openAgenda({name:L.nome, email:L.email, whatsapp:"+55"+L.whatsapp.replace(/^55/,""), negocio:L.clinica, nicho:seg, score:r.nota, dor:DOR[r.dk].t}); };
}

/* ---------- Cal.com (agenda do diagnóstico) ---------- */
let calReady=false;
function loadCal(){
  if(calReady) return; calReady=true;
  (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
  Cal("init","diag",{origin:"https://cal.com"});
  Cal.ns.diag("ui",{theme:"dark",cssVarsPerTheme:{dark:{"cal-brand":CONFIG.CAL_BRAND},light:{"cal-brand":CONFIG.CAL_BRAND}},hideEventTypeDetails:false,layout:"month_view"});
  let done=false; const ok=(e)=>{ if(done) return; done=true; let pp={}; try{ if(st.lead){ pp=pxParams(compute()); } }catch(_){}
    const d=(e&&e.detail&&e.detail.data)||{}; const bu=d.uid||(d.booking&&d.booking.uid)||"";
    track("Schedule",{content_name:"diagnostico", ...pp}, bu?"sched_"+bu:undefined); try{ st.agendado=true; save(); }catch(_){} const q=new URLSearchParams({n:(st.lead&&st.lead.nome||"").split(" ")[0]||"", t:d.startTime||(d.booking&&d.booking.startTime)||"", u:d.uid||(d.booking&&d.booking.uid)||""});
    setTimeout(()=>{ location.href="confirmado.html?"+q.toString(); },1200); };
  Cal.ns.diag("on",{action:"bookingSuccessful",callback:ok});
  Cal.ns.diag("on",{action:"bookingSuccessfulV2",callback:ok});
}
function openAgenda(pre){
  loadCal(); pre=pre||{}; const s=(typeof st!=="undefined"&&st.lead)?st.lead:null;
  if(!pre.name && s){ const r=compute(); pre={name:s.nome,email:s.email,whatsapp:"+55"+s.whatsapp.replace(/^55/,""),negocio:s.clinica,nicho:(NICHOS[r.nk]||{}).t,score:r.nota,dor:(DOR[r.dk]||{}).t}; }
  const config={layout:"month_view",theme:"dark",lang:"pt"};
  if(pre.name) config.name=pre.name; if(pre.email) config.email=pre.email; if(pre.whatsapp) config.whatsapp=pre.whatsapp; if(pre.negocio) config.negocio=pre.negocio;
  if(pre.nicho) config["metadata[nicho]"]=pre.nicho; if(pre.score!=null) config["metadata[score]"]=String(pre.score); if(pre.dor) config["metadata[dor]"]=pre.dor;
  const at=attribution(); config["metadata[origem]"]= s ? "quiz" : origem(); if(document.body.dataset.origemLead) config["metadata[origem_lead]"]=document.body.dataset.origemLead;
  ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","fbclid","gclid","fbc","fbp"].forEach(k=>{ if(at[k]) config["metadata["+k+"]"]=String(at[k]).slice(0,200); });
  if(s && s.email) config["metadata[lead_email]"]=s.email;
  if(s){ try{ const rr=compute(); config["metadata[faixa]"]=rr.faixa; config["metadata[nicho_key]"]=rr.nk; config["metadata[nivel]"]=rr.nivel; }catch(_){} } if(st.leadId) config["metadata[lead_id]"]=st.leadId;
  Cal.ns.diag("modal",{calLink:CONFIG.CAL_LINK,config});
}
document.querySelectorAll("[data-agenda]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();openAgenda();}));
if(/[?&]agenda\b/.test(location.search) || location.hash==="#agenda") setTimeout(()=>openAgenda(),400);
