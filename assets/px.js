/* Prime Studio · Meta Pixel + Conversions API (camada única de rastreamento)
   - 1 init por página (com correspondência avançada salva de envios anteriores, já em SHA-256)
   - Só eventos PADRÃO para otimização + 1 personalizado (QuizStart)
   - Cada evento vai pelo navegador (eventID) e pelo servidor (/api/capi, mesmo event_id) -> deduplicação
   - Nada de saúde/dor/procedimento em parâmetros; URL enviada sem query string */
(function(){
  var PIXEL_ID="997004479351209", CAPI="/api/capi";
  var STD={PageView:1,ViewContent:1,Lead:1,SubmitApplication:1,Contact:1};
  var ALLOWED={PageView:1,ViewContent:1,Lead:1,SubmitApplication:1,Contact:1,QuizStart:1};
  var KEYS=["utm_source","utm_medium","utm_campaign","utm_content","utm_term","fbclid","gclid"];
  function ls(k,v){ try{ if(v===undefined) return JSON.parse(localStorage.getItem(k)||"null"); localStorage.setItem(k,JSON.stringify(v)); }catch(e){ return null; } }
  // Atribuição: first/last touch. NÃO gravamos _fbc (o Pixel cria o cookie oficial; evita _fbc duplicado).
  var ATTR=(function(){ var q=new URLSearchParams(location.search), s=ls("prime_attr")||{}, now={};
    KEYS.forEach(function(k){ var v=q.get(k); if(v) now[k]=v.slice(0,200); });
    if(Object.keys(now).length){ now.ts=Date.now(); now.landing=location.pathname; s.last=now; if(!s.first) s.first=now; }
    if(!s.first) s.first={ref:document.referrer.slice(0,200), ts:Date.now(), landing:location.pathname};
    ls("prime_attr",s); return s; })();
  function cookie(n){ return (document.cookie.match(new RegExp("(?:^|; )"+n+"=([^;]*)"))||[])[1]||""; }
  function fbc(){ var c=cookie("_fbc"); if(c) return c; var l=ATTR.last||{}; return l.fbclid ? "fb.1."+(l.ts||Date.now())+"."+l.fbclid : ""; }
  function attribution(){ var l=ATTR.last||{}, f=ATTR.first||{}, o={}; KEYS.forEach(function(k){ o[k]=l[k]||f[k]||""; }); o.referrer=f.ref||""; o.landing=f.landing||""; o.fbc=fbc(); o.fbp=cookie("_fbp"); return o; }
  function uid(){ return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2); }
  async function sha(v){ v=String(v||"").trim().toLowerCase(); if(!v||!crypto.subtle) return ""; var b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v)); return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,"0");}).join(""); }
  function norm(s){ return String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z]/g,""); }
  function phone(w){ var d=String(w||"").replace(/\D/g,""); if(!d) return ""; return d.length<=11 ? "55"+d : d; }
  var USER=ls("prime_um")||{};   // hashes de envios anteriores (mesmo navegador)
  // Pixel: carregado e iniciado UMA vez
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  var initData={}; ["em","ph","fn","ln","external_id"].forEach(function(k){ if(USER[k]) initData[k]=USER[k]; }); initData.country=USER.country||"885036a0da3dff3c3e05bc79bf49382b12bc5098514ed57ce0875aba1aa2c40d";
  fbq('init', PIXEL_ID, initData);
  function track(ev, params, opts){
    if(!ALLOWED[ev]) return null; opts=opts||{};
    var id=opts.eventId||uid(), p=Object.assign({},params||{});
    try{ fbq(STD[ev]?"track":"trackCustom", ev, p, {eventID:id}); }catch(e){}
    if(!opts.serverSends){ // Lead/SubmitApplication: o servidor envia junto com o /api/lead
      var body=JSON.stringify({event_name:ev, event_id:id, params:p, url:location.origin+location.pathname, user:USER, fbc:fbc(), fbp:cookie("_fbp")});
      try{ navigator.sendBeacon ? navigator.sendBeacon(CAPI,new Blob([body],{type:"application/json"})) : fetch(CAPI,{method:"POST",body:body,keepalive:true,headers:{"content-type":"application/json"}}); }catch(e){}
    }
    return id;
  }
  // Salva correspondência avançada (hash) para as próximas páginas/eventos deste navegador
  async function match(email, whats, nome){
    var parts=String(nome||"").trim().split(/\s+/), d=String(whats||"").replace(/\D/g,"").replace(/^55(?=\d{10,11}$)/,"");
    var u={em:await sha(email), ph:await sha(phone(whats)), fn:await sha(norm(parts[0])), ln:await sha(norm(parts.slice(1).join(""))), country:initData.country, external_id:await sha(d)};
    Object.keys(u).forEach(function(k){ if(!u[k]) delete u[k]; }); USER=Object.assign({},USER,u); ls("prime_um",USER); return USER;
  }
  var vc=false; function viewContent(name){ if(vc) return; vc=true; track("ViewContent",{content_name:name||location.pathname.replace(/\W/g,"")||"home"}); }
  window.PRIME={track:track, match:match, uid:uid, attribution:attribution, cookie:cookie, viewContent:viewContent, attr:ATTR};
  track("PageView");
  // ViewContent: 1 por página, quando a pessoa realmente consome (50% de rolagem ou 15 s)
  var t=setTimeout(function(){viewContent();},15000);
  addEventListener("scroll",function h(){ if(scrollY+innerHeight>=document.documentElement.scrollHeight*.5){ clearTimeout(t); viewContent(); removeEventListener("scroll",h); } },{passive:true});
})();
