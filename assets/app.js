/* ===================== CONFIGURAÇÃO — EDITE AQUI ===================== */
const CONFIG = {
  // Endpoint que salva o lead (Cloudflare Pages Function em /functions/api/lead.js).
  // No GitHub Pages não existe; o site cai automaticamente no WhatsApp.
  LEAD_API: "/api/lead",
  // Horário comercial (America/Sao_Paulo) para a promessa "ligação em até 30 minutos"
  HORARIO: { dias:[1,2,3,4,5,6], inicio:9, fim:18 },   // seg–sáb, 9h–18h (sábado a confirmar)
  WHATSAPP_NUMERO: "5511913221587",
  // Opção 3 (agenda). Placeholder: trocar pelo link do Cal.com quando estiver pronto.
  CAL_BRAND: "#c8a25a",
  META_PIXEL_ID: "997004479351209",              // preencha para ativar o Pixel (inativo vazio)
  CAPI_URL: "/api/capi",           // Conversions API (só envia se META_PIXEL_ID e, no servidor, META_CAPI_TOKEN existirem)
  CONTEUDO_URL: "#metodo"
};
/* ======================================================================= */

/* ---------- Atribuição + Pixel/CAPI: ver assets/px.js (window.PRIME) ---------- */
const attribution=()=>window.PRIME.attribution(), cookie=window.PRIME.cookie;
function origem(){ const lp=document.body.dataset.origemLead; if(lp) return lp; const a=attribution(); return a.utm_source ? `utm:${a.utm_source}` : a.fbclid ? "meta_ads" : a.gclid ? "google_ads" : a.referrer && !a.referrer.includes(location.host) ? "referral" : "direto"; }

const uid=window.PRIME.uid;
function track(ev, data, eid, serverSends){ return window.PRIME.track(ev, data, {eventId:eid, serverSends}); }
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

/* ---------- UI geral ---------- */
document.getElementById("yr").textContent = new Date().getFullYear();
const nav = document.getElementById("nav");
addEventListener("scroll", ()=>nav.classList.toggle("scrolled", scrollY>30), {passive:true});
const footWa = document.getElementById("footWa");
footWa.href = `https://wa.me/${CONFIG.WHATSAPP_NUMERO}?text=${encodeURIComponent("Olá, time Prime Studio! Vim pelo site e quero saber mais sobre o Método PRIME.")}`;
footWa.onclick = ()=>track("Contact",{content_name:"whatsapp_rodape"});

/* ---------- Cases (EXEMPLOS de projeto — substitua por cases reais) ---------- */
const CASES = [
  { id:"ver", nicho:"Harmonização facial", nome:"Maison Verelle",
    resumo:"Site em tons de creme e dourado, com equipe, espaço e depoimentos à vista e WhatsApp a um toque.",
    t:{a:"#a07a4f",bgc:"#f7f0e7",ink:"#2b2118",soft:"#eadccb"},
    h1:"Beleza <em>natural</em>, assinada com precisão.", sub:"Harmonização facial com planejamento individual e foco em resultados equilibrados.",
    servs:[["Preenchimento labial","Volume e contorno respeitando a proporção do rosto."],["Toxina botulínica","Suavização de linhas de expressão com naturalidade."],["Bioestimuladores","Firmeza e qualidade de pele de forma gradual."]],
    team:[["Dra. Helena Duarte","Harmonização facial"],["Dra. Marina Lacerda","Dermatologia estética"],["Dra. Beatriz Sallum","Biomedicina estética"]],
    amb:["Recepção","Sala de espera","Lounge","Área de atendimento"],
    deps:[["Carolina M.","Saí me sentindo eu mesma, só mais descansada. Explicaram cada etapa com calma."],["Juliana P.","A clínica é linda e o cuidado vai do primeiro contato ao retorno."],["Regina A.","Gostei de não sentir pressão nenhuma na avaliação."]],
    band:"Cada rosto pede um plano. O seu começa com uma avaliação." },
  { id:"sol", nicho:"Odontologia estética", nome:"Solenne Odonto",
    resumo:"Site claro e moderno para lentes e implantes, com planejamento do sorriso, equipe e consultórios.",
    t:{a:"#2b7a99",bgc:"#f5f9fb",ink:"#13283a",soft:"#dfeaf0"},
    h1:"O sorriso que você <em>sempre quis</em> mostrar.", sub:"Lentes de contato dental, implantes e ortodontia com planejamento digital do sorriso.",
    servs:[["Lentes de contato dental","Lâminas ultrafinas para forma, cor e alinhamento."],["Clareamento","Sorriso mais claro com acompanhamento profissional."],["Implantes","Reabilitação com planejamento digital e conforto."]],
    team:[["Dra. Camila Rezende","Lentes e reabilitação oral"],["Dra. Luiza Fontes","Ortodontia"],["Dra. Renata Okada","Implantodontia"]],
    amb:["Consultório","Sala de planejamento","Atendimento","Recepção"],
    deps:[["Ana L.","Vi o planejamento do meu sorriso antes de começar. Isso me deixou muito segura."],["Fernanda C.","Pontualidade e cuidado em todas as consultas."],["Rafael T.","Tinha receio de dentista e fui muito bem acolhido."]],
    band:"Agende sua avaliação e conheça o planejamento do seu sorriso." },
  { id:"ave", nicho:"Dermatologia e bem-estar", nome:"Clinique Avelline",
    resumo:"Site sofisticado de dermatologia e bem-estar, com protocolos por objetivo, equipe e espaço reservado.",
    t:{a:"#6f7b5e",bgc:"#f2f0ea",ink:"#23261f",soft:"#e1e2d6"},
    h1:"Cuidado que se <em>sente</em> e se vê.", sub:"Dermatologia clínica e protocolos de pele em um espaço reservado, com avaliação personalizada.",
    servs:[["Peelings e renovação","Textura e luminosidade com acompanhamento médico."],["Protocolos de pele","Rotina pensada para o seu tipo de pele."],["Bem-estar","Experiência completa em ambiente reservado."]],
    team:[["Dra. Isabela Moraes","Dermatologia clínica"],["Dra. Patrícia Viana","Estética facial e corporal"],["Dra. Sofia Brandão","Medicina do bem-estar"]],
    amb:["Recepção","Corredor","Sala de protocolos","Suíte reservada"],
    deps:[["Larissa N.","Ambiente silencioso e equipe gentil. Virou o meu momento da semana."],["Teresa G.","Montaram um protocolo pensado para a minha rotina."],["Marta S.","Tudo muito bem explicado, sem pressa nenhuma."]],
    band:"Descubra o protocolo ideal para a sua pele." }
];
const STK="/assets/img/stock/";
function IM(f,ws,alt,sz,lite,eager){ const u=w=>`${STK}${f}-v18-${w}.webp`;
  return `<img src="${u(ws[0])}"${!lite&&ws.length>1?` srcset="${ws.map(w=>u(w)+" "+w+"w").join(", ")}" sizes="${sz}"`:""} alt="${alt}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async">`; }
function tplHTML(c,lite){
  const st = `--a:${c.t.a};--bgc:${c.t.bgc};--ink:${c.t.ink};--soft:${c.t.soft}`, f=n=>c.id+"-"+n;
  return `<div class="tpl" style="${st}">
  <div class="t-nav"><span class="t-logo">${c.nome}</span><span class="t-menu"><span>Tratamentos</span><span>Equipe</span><span>Espaço</span><span>Contato</span></span><span class="t-cta">Agendar avaliação</span></div>
  <div class="t-hero"><div><p class="t-eb">${c.nicho}</p><h1>${c.h1}</h1><p>${c.sub}</p><p style="margin-top:28px"><span class="t-cta">Agendar avaliação</span> &nbsp; <span style="font-size:.85rem;opacity:.7">ou fale no WhatsApp</span></p></div><div class="t-img">${IM(f("hero1"),[800,1600],c.nicho+" em "+c.nome,"(max-width:760px) 100vw, 50vw",lite,!lite)}</div></div>
  <div class="t-sec"><p class="t-eb">Tratamentos</p><h2>Procedimentos</h2><div class="t-grid">${c.servs.map((s,k)=>`<div class="t-card"><div class="t-pi">${IM(f("proc"+(k+1)),[800],s[0],"",lite)}</div><div class="t-cb"><h3>${s[0]}</h3><p>${s[1]}</p></div></div>`).join("")}</div></div>
  <div class="t-sec t-alt"><p class="t-eb">Nossa equipe</p><h2>Quem cuida de você</h2><div class="t-team">${c.team.map((m,k)=>`<figure>${IM(f("team"+(k+1)),[400,800],m[0],"(max-width:760px) 33vw, 22vw",lite)}<figcaption><b>${m[0]}</b><span>${m[1]}</span></figcaption></figure>`).join("")}</div></div>
  <div class="t-sec"><p class="t-eb">O espaço</p><h2>Um ambiente pensado para você</h2><div class="t-gal">${c.amb.map((a,k)=>`<figure>${IM(f("amb"+(k+1)),[800,1600],a,k===0?"(max-width:760px) 100vw, 60vw":"(max-width:760px) 50vw, 30vw",lite)}<figcaption>${a}</figcaption></figure>`).join("")}</div></div>
  <div class="t-sec t-alt"><p class="t-eb">Depoimentos</p><h2>Quem já passou por aqui</h2><div class="t-deps">${c.deps.map((d,k)=>`<blockquote><p>“${d[1]}”</p><footer>${IM(f("dep"+(k+1)),[200,400],d[0],"56px",lite)}<b>${d[0]}</b></footer></blockquote>`).join("")}</div></div>
  <div class="t-sec"><p class="t-eb">Como funciona</p><h2>Sua jornada</h2><div class="t-steps"><div><h3>Contato</h3><p>Pelo WhatsApp, em poucos toques.</p></div><div><h3>Avaliação</h3><p>Conversa e análise individual.</p></div><div><h3>Plano</h3><p>Proposta personalizada.</p></div><div><h3>Acompanhamento</h3><p>Retornos e cuidado contínuo.</p></div></div></div>
  <div class="t-band"><h2>${c.band}</h2><p style="margin:14px 0 26px">Atendimento com hora marcada.</p><span class="t-cta">Agendar avaliação</span></div>
  <div class="t-foot"><span>${c.nome}</span><span>Instagram · WhatsApp</span></div>
  <div class="t-wa">✆</div></div>`;
}
const grid = document.getElementById("cases-grid");
grid.innerHTML = CASES.map((c,k)=>`<button class="case reveal" data-k="${k}" aria-label="Ver projeto ${c.nome} em tela cheia">
  <div class="frame"><div class="mini">${tplHTML(c,1)}</div></div>
  <div class="info"><h3>${c.nome}</h3><p><strong>${c.nicho}.</strong> ${c.resumo}</p></div></button>`).join("");
function fitMinis(){ grid.querySelectorAll(".frame").forEach(f=>{ f.querySelector(".mini").style.transform=`scale(${f.clientWidth/1280})`; }); }
addEventListener("resize", fitMinis); fitMinis();
// v17: site em MacBook + iPhone (mesmo projeto dos cases)
document.querySelectorAll("[data-site]").forEach(el=>{ const c=CASES[+el.dataset.site||0]; el.innerHTML=tplHTML(c,1); if(el.closest("[data-fit='390']")) el.firstElementChild.classList.add("mob"); });
function fitDev(){ document.querySelectorAll("[data-fit]").forEach(f=>{ const m=f.querySelector(".mini"); if(m) m.style.transform=`scale(${f.clientWidth/+f.dataset.fit})`; }); }
addEventListener("resize", fitDev); fitDev();
const modal=document.getElementById("modal"), mBody=document.getElementById("modalBody");
grid.querySelectorAll(".case").forEach(b=>b.onclick=()=>{
  const c=CASES[+b.dataset.k]; mBody.innerHTML=tplHTML(c); document.getElementById("modalUrl").textContent=c.nome;
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
  ["P","Perfil","Perfil que responde antes da pergunta.","Estratégia e posicionamento",["Procedimento-âncora e paciente ideal definidos","Mensagem que mostra por que você, e não outro","Bio e destaques que respondem dúvidas antes do direct"]],
  ["R","Reputação","Reputação que gera confiança.","Google e prova social",["Google Meu Negócio completo e otimizado","Rotina de avaliações e respostas profissionais","Depoimentos e casos organizados com ética"]],
  ["I","Imagem","Imagem à altura do seu cuidado.","Identidade e conteúdo",["Identidade visual coerente com o seu ticket","Linha editorial que vende o tratamento, não o preço","Fotos e criativos que mostram o seu padrão"]],
  ["M","Marca no site","Marca no site que confirma a escolha.","Site que converte",["Páginas por procedimento","WhatsApp sempre a um toque","Estrutura pensada para o Google"]],
  ["E","Escala","Crescimento que preserva o seu valor.","Mais pacientes certas",["Google e Instagram levando a paciente certa ao seu site","Anúncios só quando o site está pronto para receber","Origem de cada contato medida"]]
];
const tabs=document.getElementById("tabs"), panel=document.getElementById("panel");
tabs.innerHTML=PRIME.map((t,k)=>`<button class="tab${k===3?" hl":""}" role="tab" aria-selected="${k===0}" aria-controls="panel" aria-label="Etapa ${k+1}: ${t[0]} de ${t[1]}" data-k="${k}"><b>${t[0]}</b><span>${t[1]}</span><i class="pg"></i></button>`).join("");
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

const rot=document.getElementById("rot");
if(rot && !RM){ const W=["dentistas","dermatologistas","nutricionistas","tricologistas","esteticistas","harmonizadoras"]; let wi=0;
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
  preco:{t:"Chegam pedindo só preço", d:N=>`Quando o ${N.p} chega perguntando só o preço, é porque a sua presença não mostrou o valor antes da conversa. Ele compara você com o mais barato porque não viu diferença.`},
  valor:{t:"Meu site e meu perfil não transmitem meu nível", d:N=>`O seu atendimento é de alto padrão, mas o perfil, o site e o WhatsApp ainda passam uma imagem comum. O ${N.p} decide em segundos se você "parece caro e confiável".`},
  visib:{t:"Pouca gente nova me encontra", d:N=>`Quem procura ${N.item} na sua região pesquisa no Google e no Instagram antes de chamar. Se ${N.local==="clínica"?"a sua":"o seu"} ${N.local} não aparece bem ali, esse ${N.p} vai para quem aparece.`},
  agenda:{t:"Agenda com buracos ou irregular", d:N=>`Agenda irregular quase sempre é falta de fluxo constante de ${N.ps} novos: hoje você depende de indicação e de momentos de sorte, e não de um caminho que leva quem pesquisa até o seu WhatsApp.`}
};
const OPP = {
  estetica:{google:"Google Meu Negócio com fotos reais da clínica e rotina de avaliações de quem fez protocolo.",insta:"Destaques de Protocolos, Clínica e Dúvidas para a paciente entender o processo antes de chamar.",site:"Páginas por protocolo (flacidez, gordura localizada, manchas) que levam direto à avaliação.",wpp:"WhatsApp Business com catálogo de protocolos e horários de avaliação.",canal:"Campanha local para \"estética + bairro\" quando a base estiver pronta."},
  odonto:{google:"Aparecer em \"lentes de contato dental\" e \"implante\" na sua cidade, com avaliações e fotos do consultório.",insta:"Destaques de Casos, Planejamento e Depoimentos para justificar o investimento do tratamento.",site:"Página de lentes e de implantes com etapas, tempo e o que está incluso, sem expor preço.",wpp:"Fluxo de WhatsApp que agenda a avaliação e envia o que levar.",canal:"Rotina de pedidos de indicação de pacientes satisfeitos."},
  harmo:{google:"Perfil no Google para \"harmonização facial\" na sua região, com avaliações que citam resultado natural.",insta:"Destaques de Procedimentos, Bastidores e Dúvidas, com o caminho para o seu site.",site:"Páginas por procedimento (lábios, mandíbula, full face) que respondem às dúvidas antes da consulta.",wpp:"WhatsApp com catálogo e mensagem de avaliação individual, sem cair no \"quanto custa?\".",canal:"Conteúdo e campanha para pacientes de alto ticket na sua cidade."},
  nutri:{google:"Aparecer em \"nutricionista + especialidade\" na sua cidade, com avaliações de quem teve resultado.",insta:"Destaques de Método, Depoimentos e Como funciona o acompanhamento.",site:"Página do seu método de acompanhamento com a jornada do paciente e agenda online.",wpp:"WhatsApp que agenda a primeira consulta e envia o pré-questionário.",canal:"Parcerias e conteúdo que levam a uma primeira consulta, não só a seguidores."},
  fisio:{google:"Aparecer quando alguém busca \"fisioterapia + dor\" no seu bairro, com avaliações e horários.",insta:"Destaques de Tratamentos, Equipe e Depoimentos de recuperação.",site:"Páginas por condição (coluna, joelho, pós-operatório) que convertem em avaliação particular.",wpp:"WhatsApp com triagem rápida e horários de avaliação.",canal:"Canal de pacientes particulares além de convênio e indicação médica."},
  beleza:{google:"Perfil do Google do studio com fotos de trabalhos e avaliações recentes.",insta:"Destaques de Trabalhos, Cuidados, Valores sob consulta e Localização com ícones da marca.",site:"Link da bio organizado com serviços, agenda e localização.",wpp:"WhatsApp com catálogo de serviços e agendamento de retorno.",canal:"Rotina de retorno e indicação para manter a agenda recorrente."},
  outro:{google:"Google Meu Negócio completo com avaliações e fotos do seu espaço.",insta:"Bio, destaques e identidade que transmitem o seu padrão.",site:"Site mobile-first com páginas por serviço levando ao WhatsApp.",wpp:"WhatsApp Business com catálogo e horários organizados.",canal:"Canal previsível de novos clientes além da indicação."}
};
const QUESTIONS = [
  {id:"nicho", q:"Qual é o seu segmento?", opts:Object.entries(NICHOS).map(([k,n])=>({t:n.t,k}))},
  {id:"dor", q:"Qual é a sua maior dor hoje?", opts:Object.entries(DOR).map(([k,d])=>({t:d.t,k}))},
  {id:"origem", q:"Como chega a maioria dos seus novos clientes?", opts:[{t:"Indicação / boca a boca",p:5,w:"canal"},{t:"Instagram orgânico",p:12,w:"canal"},{t:"Google",p:20},{t:"Tráfego pago",p:20},{t:"Não sei dizer",p:0,w:"canal"}]},
  {id:"site", q:"Sua clínica tem um site que transmite o seu nível?", opts:[{t:"Tenho e ele gera contatos",p:25},{t:"Tenho, mas está desatualizado",p:12,w:"site"},{t:"Só link na bio",p:5,w:"site"},{t:"Não tenho",p:0,w:"site"}]},
  {id:"google", q:"Quando alguém busca o seu serviço no Google na sua cidade, você aparece?", opts:[{t:"Sim, entre os primeiros e com boas avaliações",p:30},{t:"Aparece, mas com poucas avaliações",p:15,w:"google"},{t:"Não aparece",p:0,w:"google"},{t:"Nunca verifiquei",p:3,w:"google"}]},
  {id:"insta", q:"O seu Instagram transmite o nível do seu atendimento?", opts:[{t:"Sim, bio, destaques e feed no padrão",p:25},{t:"Mais ou menos, falta organização",p:12,w:"insta"},{t:"Não, parece amador",p:3,w:"insta"},{t:"Quase não uso",p:0,w:"insta"}]},
  {id:"faturamento", q:"Qual o faturamento mensal do negócio hoje?", opts:[{t:"Até R$10 mil",f:5,fk:"ate_10k"},{t:"R$10–30 mil",f:15,fk:"10_30k"},{t:"R$30–80 mil",f:28,fk:"30_80k"},{t:"R$80–150 mil",f:33,fk:"80_150k"},{t:"Acima de R$150 mil",f:35,fk:"acima_150k"}]},
  {id:"momento", q:"Quando você quer resolver isso?", opts:[{t:"Agora, nos próximos 30 dias",f:35},{t:"Em 1 a 3 meses",f:15},{t:"Só estou pesquisando",f:0}]}
];
const LPQ=document.body.classList.contains("lp-quiz");
if(LPQ){ const keep=["nicho","dor","site","google","faturamento"]; for(let i=QUESTIONS.length-1;i>=0;i--) if(!keep.includes(QUESTIONS[i].id)) QUESTIONS.splice(i,1); }
const MAXP=QUESTIONS.reduce((a,Q)=>a+Math.max(0,...Q.opts.map(o=>o.p||0)),0)||100, MAXF=QUESTIONS.reduce((a,Q)=>a+Math.max(0,...Q.opts.map(o=>o.f||0)),0)||70;
const QUALF = new Set(["30_80k","80_150k","acima_150k"]);
function emHorario(){ const d=new Date(new Date().toLocaleString("en-US",{timeZone:"America/Sao_Paulo"})); const h=d.getHours(); return CONFIG.HORARIO.dias.includes(d.getDay()) && h>=CONFIG.HORARIO.inicio && h<CONFIG.HORARIO.fim; }
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
  if(!st.started){ st.started=true; save(); track("QuizStart",{content_name:"raio_x"}); } render(); setTimeout(()=>qx.querySelector("button.opt, input, .btn")?.focus(),60);
}
function closeQuiz(){ if(LPQ) return; qx.hidden=true; document.documentElement.classList.remove("qx-on"); lastFocus&&lastFocus.focus&&lastFocus.focus(); }
document.querySelectorAll("[data-quiz]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();openQuiz(b.dataset.cta||"quiz");}));
document.getElementById("qxClose").onclick=closeQuiz;
addEventListener("keydown",e=>{ if(e.key==="Escape" && !qx.hidden) closeQuiz(); });
if(LPQ){ qx.hidden=false; if(!st.started){ st.started=true; save(); track("QuizStart",{content_name:"raio_x"}); } render(); }
qback.onclick=()=>{ if(st.view==="result"){ st.view="form"; } else if(st.view==="form"){ st.view=null; st.i=QUESTIONS.length-1; } else if(st.i>0){ st.i--; } save(); render(); };
function prog(n,label){ qbar.style.width=(n/TOTAL*100)+"%"; qstep.textContent=label; qback.style.visibility=(n>0)?"visible":"hidden"; }
function render(){ if(st.view==="result" && st.lead) return renderResult(); if(st.view==="form") return renderForm(); renderQ(); }
function anim(){ qs.classList.remove("in"); void qs.offsetWidth; qs.classList.add("in"); qx.scrollTop=0; if(LPQ && scrollY>qx.offsetTop) scrollTo(0,qx.offsetTop-70); }
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
    b.classList.add("sel"); st.ans[Q.id]=o; save();
    setTimeout(()=>{ if(st.i<QUESTIONS.length-1){ st.i++; } else { st.view="form"; } save(); render(); },180);
  });
}
function pxParams(r){ const fk=(st.ans.faturamento||{}).fk||""; return {content_name:"raio_x", faixa_faturamento:fk, lead_type:QUALF.has(fk)?"qualificado":"nao_qualificado"}; }
function compute(){
  let p=0,f=0; const weak=[];
  QUESTIONS.forEach(Q=>{const a=st.ans[Q.id]||{}; p+=a.p||0; f+=a.f||0; if(a.w && !weak.includes(a.w)) weak.push(a.w);});
  const nk=(st.ans.nicho||{}).k||"outro", dk=(st.ans.dor||{}).k||"visib";
  const order=[DOR_W[dk], ...weak, "google","insta","site","wpp","canal"]; const opps=[...new Set(order)].slice(0,3);
  const nota=Math.min(100,Math.round(p*100/MAXP)), fit=Math.min(100,LPQ?Math.round(f*70/MAXF):f);
  const faixa = nota<40?"baixa":nota<70?"media":"alta";
  return {nota, fit, nivel: fit>=60?"quente":fit>=30?"morno":"frio", nk, dk, faixa, opps};
}
function renderForm(){
  const r=compute(); prog(QUESTIONS.length, "Último passo");
  const L=st.lead||{};
  qs.innerHTML=`<div class="qx-lock"><div class="ring blur" style="--v:${r.nota}"><span>${r.nota}<small>/100</small></span></div><p class="k">🔒 Seu Raio-X está pronto</p></div>
  <h2 class="qx-q">Para quem é este diagnóstico?</h2>
  <p class="qx-sub">Você vê o resultado na hora. Com o seu Instagram em mãos, nosso time já abre os seus perfis para o diagnóstico.</p>
  <label for="nome">Seu nome</label><input id="nome" autocomplete="name" value="${esc(L.nome||"")}">
  <label for="wpp">WhatsApp (com DDD)</label><input id="wpp" inputmode="tel" autocomplete="tel" placeholder="(11) 99999-9999" value="${esc(L.whatsapp||"")}">
  <label for="email">E-mail</label><input id="email" type="email" inputmode="email" autocomplete="email" placeholder="voce@clinica.com.br" value="${esc(L.email||"")}">
  <label for="clinica">Nome da clínica, consultório ou studio</label><input id="clinica" value="${esc(L.clinica||"")}">
  <label for="insta">Instagram do negócio</label><input id="insta" autocapitalize="off" autocomplete="off" placeholder="@suaclinica" value="${esc(L.instagram||"")}">
  <label for="site">Site, se tiver</label><input id="site" type="url" inputmode="url" autocapitalize="off" placeholder="suaclinica.com.br" value="${esc(L.site||"")}">
  <p class="err" id="err"></p>
  <button class="btn" id="ver">Revelar meu Raio-X <span aria-hidden="true">→</span></button>
  <p class="micro">Sem spam. Ao continuar, você concorda com a <a href="privacidade.html" target="_blank">Política de Privacidade</a>.</p>`;
  anim();
  document.getElementById("ver").onclick=()=>{
    const v=id=>document.getElementById(id).value.trim();
    const lead={nome:v("nome"), whatsapp:v("wpp").replace(/\D/g,"").replace(/^55(?=\d{10,11}$)/,""), email:v("email"), clinica:v("clinica"), instagram:"@"+v("insta").replace(/^@+/,"").replace(/^https?:\/\/(www\.)?instagram\.com\//i,"").replace(/[/?].*$/,""), site:v("site")};
    if(lead.nome.length<2 || !/^\d{10,11}$/.test(lead.whatsapp) || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(lead.email) || lead.clinica.length<2 || lead.instagram.length<3){ document.getElementById("err").textContent="Preencha nome, WhatsApp com DDD, um e-mail válido, o nome do negócio e o Instagram."; return; }
    st.lead=lead; st.view="result"; save();
    const respostas=Object.fromEntries(Object.entries(st.ans).map(([k,o])=>[k,o.t]));
    const N=NICHOS[r.nk];
    const fat=st.ans.faturamento||{}; st.qual=QUALF.has(fat.fk); save();
    st.leadEid=st.leadEid||uid(); st.qualEid=st.qualEid||uid(); save(); const leadEid=st.leadEid, qualEid=st.qualEid;
    sendLead({...lead, event_id:leadEid, event_id_qual:qualEid, faturamento:fat.fk||"", origem_lead:document.body.dataset.origemLead||"site", nicho_key:r.nk, origem:origem(), atribuicao:attribution(), faixa:r.faixa, subnicho: r.nk==="outro" ? "Outro: "+(st.outro||"") : N.t, segmento_outro: st.outro||"", dor: DOR[r.dk].t, nota:r.nota, fit:r.fit, nivel:st.qual?"quente":"frio", ligacao:st.qual, respostas, pagina:location.href});
    if(!st.leadSent){ st.leadSent=true; save(); const pp=pxParams(r); window.PRIME.match(lead.email, lead.whatsapp, lead.nome); track("Lead",pp,leadEid,true); if(st.qual) track("SubmitApplication",pp,qualEid,true); }
    renderResult();
  };
}
async function sendLead(payload){ try{ const x=await fetch(CONFIG.LEAD_API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}); const d=await x.json().catch(()=>({})); if(d.id){ try{ st.leadId=d.id; save(); }catch(_){} } return x.ok; }catch(e){ return false; } }
function renderResult(){
  const r=compute(), L=st.lead, N=NICHOS[r.nk], nome=L.nome.split(" ")[0];
  prog(TOTAL, "Seu Raio-X");
  const seg = r.nk==="outro" && st.outro ? st.outro : N.t;
  const head = HEAD[r.nk][{baixa:0,media:1,alta:2}[r.faixa]];
  const msgWa = `Olá, time Prime Studio! Sou ${L.nome}, da ${L.clinica} (${seg}). Fiz o Raio-X de Presença, minha nota foi ${r.nota}/100 e minha maior dor hoje é ${DOR[r.dk].t.toLowerCase()}. Meu Instagram é ${L.instagram}. Quero adiantar o meu diagnóstico.`;
  const wa = t=>`https://wa.me/${CONFIG.WHATSAPP_NUMERO}?text=${encodeURIComponent(t)}`;
  const quando = emHorario() ? "em até 30 minutos" : "no início do próximo horário de atendimento";
  const fim = st.qual
   ? `<div class="qx-call"><p class="k">Diagnóstico por ligação</p><h3>Pronto, ${esc(nome)}. Nosso time vai te ligar ${quando} com seus perfis já abertos.</h3><p>Na ligação, analisamos ${N.local==="clínica"?"a sua":"o seu"} ${esc(N.local)} com você e entendemos seus objetivos. Deixe o WhatsApp por perto.</p>
      <a class="btn ghost" id="bWa" href="${esc(wa(msgWa))}" target="_blank" rel="noopener">Prefere adiantar? Fale no WhatsApp</a></div>`
   : `<div class="qx-call"><h3>Obrigado, ${esc(nome)}. Seu próximo passo é fortalecer a base.</h3><p>Pelo momento do seu negócio, o melhor caminho agora é estruturar a sua presença com o nosso guia gratuito. Quando estiver pronto para o próximo nível, estaremos aqui.</p>
      <a class="btn" id="bGuia" href="/guia?utm_source=quiz">Ler o guia gratuito</a></div>`;
  qs.innerHTML=`<div class="score-wrap"><div class="ring" style="--v:${r.nota}"><span>${r.nota}<small>/100</small></span></div>
   <div><p class="k">${esc(nome)}, este é o seu Raio-X</p><span class="tag">${esc(L.clinica)} · ${esc(seg)}</span></div></div>
   <h2 class="qx-q res">${esc(head)}</h2>
   <p class="qx-diag">${esc(DOR[r.dk].d(N))}</p>
   <p class="k" style="margin-top:22px">3 oportunidades para ${N.local==="clínica"?"a sua":"o seu"} ${esc(N.local)}</p>
   <ol class="opps">${r.opps.map(o=>`<li>${esc(OPP[r.nk][o])}</li>`).join("")}</ol>
   ${fim}`;
  anim();
  const bw=document.getElementById("bWa"); if(bw) bw.onclick=()=>track("Contact",{content_name:"whatsapp_resultado", faixa_faturamento:pxParams(r).faixa_faturamento});
}

