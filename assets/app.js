/* ===================== CONFIGURAÇÃO — EDITE AQUI ===================== */
const CONFIG = {
  // Página de agendamento do Google Agenda (link curto, usado nos botões)
  GOOGLE_AGENDA_URL: "https://calendar.app.google/PLmXdrdHxs4c8Lin8",
  // URL de incorporação (embed). O link curto bloqueia iframe (X-Frame-Options: SAMEORIGIN);
  // a URL completa com ?gv=true permite. Se trocar a agenda, atualize as duas.
  GOOGLE_AGENDA_EMBED: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1j7mGcU4UXRXWgmIymupwfC9P9LONQCbPkMWm3m07snl1rEEZ-JKZEG5nZxa5UgzSuA524q1YS?gv=true",
  EMBED_AGENDA: true,             // leads quentes veem a agenda embutida
  WHATSAPP_NUMERO: "5511913221587",
  META_PIXEL_ID: "",              // preencha para ativar o Pixel (Lead, Schedule, Contact)
  WEBHOOK_URL: "",                // opcional: salvar leads (ex. Google Apps Script)
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
const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target);} }),{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));

/* ---------- Quiz ---------- */
// p = pontos de presença (quanto mais, melhor presença); f = pontos de fit comercial
const QUESTIONS = [
  { id:"subnicho", q:"Qual é a especialidade da sua clínica?", opts:[
    {t:"Harmonização facial"},{t:"Estética de beleza (Nanoglam, cílios, sobrancelha)"},
    {t:"Estética corporal/facial em clínica"},{t:"Odonto estética (lentes/facetas)"},{t:"Implantes / reabilitação oral"},{t:"Outra"}]},
  { id:"origem", q:"Como chega a maioria dos seus clientes hoje?", opts:[
    {t:"Indicação / boca a boca", p:5, opp:"canal"},{t:"Instagram orgânico", p:15, opp:"canal"},
    {t:"Google", p:25},{t:"Tráfego pago", p:25},{t:"Não sei dizer", p:0, opp:"canal"}]},
  { id:"google", q:"Quando alguém busca seu serviço no Google na sua cidade, sua clínica aparece?", opts:[
    {t:"Sim, entre os primeiros e com boas avaliações", p:40},{t:"Aparece, mas com poucas avaliações", p:20, opp:"reputacao"},
    {t:"Não aparece", p:0, opp:"google"},{t:"Nunca verifiquei", p:5, opp:"google"}]},
  { id:"site", q:"Sua clínica tem site?", opts:[
    {t:"Sim, e ele gera contatos", p:35},{t:"Sim, mas está desatualizado", p:15, opp:"site"},
    {t:"Não, só Instagram / link na bio", p:5, opp:"site"},{t:"Não tenho", p:0, opp:"site"}]},
  { id:"objetivo", q:"Qual é seu principal objetivo nos próximos 90 dias?", opts:[
    {t:"Atrair mais pacientes de alto ticket", f:30},{t:"Ser referência na minha cidade", f:25},
    {t:"Organizar a presença digital", f:15},{t:"Ainda estou pesquisando", f:0}]},
  { id:"faturamento", q:"Faturamento mensal aproximado da clínica", opts:[
    {t:"Acima de R$ 100 mil", f:35, perfil:"alto"},{t:"R$ 40 mil a R$ 100 mil", f:30, perfil:"alto"},
    {t:"R$ 15 mil a R$ 40 mil", f:20, perfil:"medio"},{t:"Até R$ 15 mil", f:5, perfil:"baixo"},{t:"Prefiro não informar", f:10, perfil:"medio"}]},
  { id:"momento", q:"Quando pretende começar e quem decide?", opts:[
    {t:"Agora / até 30 dias — eu decido", f:35},{t:"Até 30 dias — decido com sócio", f:25},
    {t:"Em 2 a 3 meses", f:10},{t:"Sem previsão", f:0}]}
];

const OPPS = {
  google:"Colocar sua clínica no mapa: Google Meu Negócio completo para aparecer nas buscas locais da sua especialidade.",
  reputacao:"Rotina de avaliações no Google para transformar quem já foi atendido em prova para quem está decidindo.",
  site:"Site mobile-first com páginas por procedimento, levando o visitante direto para o WhatsApp.",
  canal:"Criar um canal previsível de novos pacientes além da indicação, para não depender só do boca a boca.",
  imagem:"Revisar bio, destaques e identidade do Instagram para transmitir o padrão premium da clínica.",
  escala:"Medir de onde vêm os contatos do WhatsApp e só então escalar com tráfego pago.",
  perfil:"Definir o posicionamento: qual procedimento e qual público sua clínica quer ser a primeira escolha."
};

let i = 0; const ans = {}; const stage = document.getElementById("stage");
const bar = document.getElementById("bar"), stepLbl = document.getElementById("stepLbl");
const TOTAL = QUESTIONS.length + 1;
let started = false;

function progress(n){ bar.style.width = (n/TOTAL*100)+"%"; stepLbl.textContent = n<TOTAL ? `Etapa ${n+1} de ${TOTAL}` : "Resultado"; }

function renderQ(){
  progress(i); const Q = QUESTIONS[i];
  stage.innerHTML = `<p class="q">${esc(Q.q)}</p>` + Q.opts.map((o,k)=>`<button class="opt" data-k="${k}">${esc(o.t)}</button>`).join("") + (i>0?`<button class="back" id="back">← Voltar</button>`:"");
  const bk=document.getElementById("back"); if(bk) bk.onclick=()=>{i--;renderQ();};
  stage.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{
    if(!started){started=true; track("ViewContent",{content_name:"quiz_start"});}
    ans[Q.id] = Q.opts[+b.dataset.k]; i++; i<QUESTIONS.length ? renderQ() : renderForm();
  });
}

function renderForm(){
  progress(QUESTIONS.length);
  const subs = QUESTIONS[0].opts.map(o=>`<option ${o.t===ans.subnicho.t?"selected":""}>${esc(o.t)}</option>`).join("");
  stage.innerHTML = `<p class="q">Para onde enviamos seu Raio-X?</p>
  <label for="nome">Seu nome</label><input id="nome" autocomplete="name">
  <label for="wpp">WhatsApp (com DDD)</label><input id="wpp" inputmode="tel" autocomplete="tel" placeholder="(11) 99999-9999">
  <label for="clinica">Nome da clínica</label><input id="clinica">
  <label for="sub">Especialidade</label><select id="sub">${subs}</select>
  <label for="ig">@ do Instagram (opcional)</label><input id="ig" placeholder="@suaclinica">
  <p class="err" id="err"></p>
  <button class="btn" id="ver" style="margin-top:12px">Ver meu resultado</button>
  <p class="micro">Ao continuar, você concorda com a <a href="privacidade.html" target="_blank" style="color:var(--gold2)">Política de Privacidade</a>.</p>`;
  document.getElementById("ver").onclick = ()=>{
    const v = id=>document.getElementById(id).value.trim();
    const lead = {nome:v("nome"), whatsapp:v("wpp").replace(/\D/g,""), clinica:v("clinica"), subnicho:v("sub"), instagram:v("ig")};
    if(!lead.nome || lead.whatsapp.length<10 || !lead.clinica){ document.getElementById("err").textContent="Preencha nome, WhatsApp com DDD e nome da clínica."; return; }
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
  const msg = `Olá! Sou ${lead.nome}, da ${lead.clinica}. Fiz o Raio-X de Presença da Prime Studio e minha nota foi ${nota}/100. Quero entender como melhorar.`;
  return `https://wa.me/${CONFIG.WHATSAPP_NUMERO}?text=${encodeURIComponent(msg)}`;
}

function renderResult(lead){
  const r = compute(); progress(TOTAL);
  track("Lead",{content_name:"raio_x", value:r.nota, status:r.nivel});
  if(CONFIG.WEBHOOK_URL){ fetch(CONFIG.WEBHOOK_URL,{method:"POST",mode:"no-cors",body:JSON.stringify({...lead, ...r, respostas:Object.fromEntries(Object.entries(ans).map(([k,v])=>[k,v.t])), data:new Date().toISOString()})}).catch(()=>{}); }
  const wa = waLink(lead, r.nota);
  const agendaBtn = `<a class="btn" id="bAg" href="${esc(CONFIG.GOOGLE_AGENDA_URL)}" target="_blank" rel="noopener">Agendar meu diagnóstico</a>`;
  const waBtn = (cls)=>`<a class="btn ${cls}" id="bWa" href="${esc(wa)}" target="_blank" rel="noopener">Receber meu Raio-X no WhatsApp</a>`;
  const msgs = {
    quente:"Seu momento e seu perfil combinam com o Método PRIME. Escolha um horário para o seu diagnóstico gratuito:",
    morno:"Vamos te enviar o Raio-X completo pelo WhatsApp com os próximos passos:",
    frio:"Comece pelas oportunidades abaixo. Quando quiser, fale com a gente ou agende uma conversa:"
  };
  let ctas = r.nivel==="quente" ? agendaBtn + waBtn("ghost")
           : r.nivel==="morno" ? waBtn("")
           : waBtn("") + agendaBtn.replace('class="btn"','class="btn ghost"') + `<a class="btn ghost" href="${esc(CONFIG.CONTEUDO_URL)}">Conhecer o Método PRIME</a>`;
  stage.innerHTML = `<div class="score-wrap"><div class="ring" style="--v:${r.nota}"><span>${r.nota}<small>/100</small></span></div>
  <div><p class="step" style="margin:0">Nota de presença digital</p><p class="q" style="margin:4px 0">${esc(lead.nome.split(" ")[0])}, este é o seu Raio-X</p><span class="tag">${esc(lead.clinica)} · ${esc(lead.subnicho)}</span></div></div>
  <p class="step" style="margin-top:28px">3 oportunidades para sua clínica</p>
  <ol class="opps">${r.opps.map(o=>`<li>${esc(OPPS[o])}</li>`).join("")}</ol>
  <p style="margin-top:18px">${msgs[r.nivel]}</p>
  <div class="ctas">${ctas}</div>
  ${r.nivel==="quente" && CONFIG.EMBED_AGENDA ? `<div class="embed"><iframe src="${esc(CONFIG.GOOGLE_AGENDA_EMBED)}" title="Agendar diagnóstico"></iframe></div>`:""}`;
  stage.dataset.nivel = r.nivel;
  const ag=document.getElementById("bAg"); if(ag) ag.onclick=()=>track("Schedule",{status:r.nivel});
  const w=document.getElementById("bWa"); if(w) w.onclick=()=>track("Contact",{status:r.nivel});
  document.getElementById("quiz").scrollIntoView({behavior:"smooth"});
}

renderQ();
