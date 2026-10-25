# Gera os mockups realistas (v16): iPhone 15 Pro + Instagram + Google. Injeta em index.html e raio-x.html.
import re, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
def q(css): return re.sub(r'(-?\d*\.?\d+)q\b', lambda m: f'calc({m.group(1)}*var(--u))', css)

SB = '''<div class="p16-sb"><b>9:41</b><span><svg viewBox="0 0 18 12" aria-hidden="true"><rect x="0" y="7.5" width="3" height="4.5" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg><svg viewBox="0 0 17 12" aria-hidden="true"><path d="M8.5 2.4c2.4 0 4.6.9 6.3 2.5l1.2-1.3A10.6 10.6 0 0 0 8.5.6 10.6 10.6 0 0 0 1 3.6l1.2 1.3a8.9 8.9 0 0 1 6.3-2.5z"/><path d="M8.5 6c1.4 0 2.6.5 3.6 1.4l1.2-1.3a7 7 0 0 0-9.6 0l1.2 1.3c1-.9 2.2-1.4 3.6-1.4z"/><path d="M8.5 9.4l1.9-2a2.8 2.8 0 0 0-3.8 0z"/></svg><svg viewBox="0 0 28 13" aria-hidden="true"><rect x=".5" y=".5" width="24" height="12" rx="3.8" fill="none" stroke="currentColor" opacity=".35"/><rect x="2" y="2" width="21" height="9" rx="2.5"/><path d="M26 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" opacity=".4"/></svg></span></div><i class="p16-di"></i>'''
def phone(inner, cls=""):
    return f'<div class="p16 {cls}"><i class="p16-k a"></i><i class="p16-k u"></i><i class="p16-k d"></i><i class="p16-k p"></i><div class="p16-bz"><div class="p16-scr">{SB}{inner}<i class="p16-hi"></i></div></div></div>'

S = lambda d, w=1.8: f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{d}</svg>'
I = {
 'chev': S('<path d="M7 10l5 5 5-5"/>',2.2),
 'threads': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.9 11.1c-.1 0-.2-.1-.3-.1-.2-3-1.8-4.7-4.6-4.7-1.7 0-3.1.7-3.9 2l1.5 1c.6-.9 1.6-1.1 2.4-1.1 1 0 1.7.3 2.2.9.3.4.6 1 .7 1.7-.8-.1-1.6-.2-2.5-.1-2.5.1-4.1 1.6-4 3.6.1 1 .6 1.9 1.4 2.4.7.5 1.6.7 2.6.6 1.3-.1 2.3-.6 3-1.4.5-.7.9-1.5 1-2.6.6.4 1.1.8 1.3 1.4.4 1 .4 2.6-.9 3.9-1.2 1.2-2.6 1.7-4.7 1.7-2.4 0-4.2-.8-5.3-2.3-1.1-1.4-1.6-3.4-1.6-5.9s.6-4.5 1.6-5.9C8 4.6 9.8 3.8 12.2 3.8s4.3.8 5.5 2.3c.6.7 1 1.6 1.3 2.7l1.8-.5c-.4-1.3-.9-2.4-1.7-3.4C17.6 3 15.3 2 12.2 2 9.2 2 6.9 3 5.4 4.9 4.1 6.6 3.4 9 3.4 12s.7 5.4 2 7.1C6.9 21 9.2 22 12.2 22c2.6 0 4.4-.7 5.9-2.2 2-2 1.9-4.4 1.3-5.9-.5-1.1-1.4-2-2.5-2.8zm-4.6 4.6c-1.1.1-2.2-.4-2.2-1.4 0-.7.5-1.6 2.2-1.6h.6c.6 0 1.2.1 1.7.2-.2 2.4-1.3 2.8-2.3 2.8z"/></svg>',
 'plus': S('<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 8v8M8 12h8"/>'),
 'menu': S('<path d="M4 6h16M4 12h16M4 18h16"/>',2),
 'link': S('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2"/>',2),
 'addp': S('<circle cx="10" cy="8" r="3.6"/><path d="M3.5 19.5c.8-3.6 3.4-5.6 6.5-5.6s5.7 2 6.5 5.6"/><path d="M19 8v6M16 11h6"/>'),
 'grid': S('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>',1.7),
 'reels': S('<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M3 8.5h18M8.2 3.2l2.6 5.3M13.6 3.2l2.6 5.3"/><path d="M10.2 11.6v5.2l4.4-2.6z" fill="currentColor"/>',1.7),
 'tag': S('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="10" r="3"/><path d="M6.4 20.5c.9-2.9 3-4.5 5.6-4.5s4.7 1.6 5.6 4.5"/>',1.7),
 'home': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 23h-6.5a1 1 0 0 1-1-1v-5.5a2.5 2.5 0 0 0-5 0V22a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V11.5a1 1 0 0 1 .3-.7l10-10a1 1 0 0 1 1.4 0l10 10a1 1 0 0 1 .3.7V22a1 1 0 0 1-1 1z"/></svg>',
 'send': S('<path d="M21.5 2.5L10 13.5"/><path d="M21.5 2.5l-7 19-4.5-8-8-4.5z"/>',1.9),
 'search': S('<circle cx="10.5" cy="10.5" r="7"/><path d="M16 16l5.5 5.5"/>',2),
 'verif': '<svg class="vf" viewBox="0 0 40 40" aria-hidden="true"><path fill="#0095F6" d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h6.234L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Z"/><path fill="#fff" d="m17.2 27.3-6.2-6.3 2.3-2.3 3.9 3.9 8.5-8.5 2.3 2.3z"/></svg>',
}
IMG = lambda n, extra="": f'<img src="/assets/img/{n}.webp" alt="" loading="lazy" decoding="async"{extra}>'

def ig(before):
    if before:
        user, name, cat = "clinicaaurora.estetica", "Clínica Aurora Estética", "Saúde/beleza"
        av = '<span class="i6-av"><span class="i6-avi logo">Aurora</span></span>'
        stats = ("412","1.180","903")
        bio = '<p>✨💉 estética e beleza 💉✨</p><p>promoções toda semana!!</p><p>chama no direct 👇👇</p>'
        link = ""
        hls = [("hl-c1","🤍"),("hl-c2","promo"),("hl-c3","..."),("hl-c4","novo")]
        hl = "".join(f'<span class="i6-h"><i class="i6-hc raw {c}"></i><em>{t}</em></span>' for c,t in hls)
        tiles = ['<i class="i6t xpromo"><b>PROMOÇÃO</b><span>DA SEMANA</span></i>', '<i class="i6t xph xf1">'+IMG("sala")+'</i>', '<i class="i6t xtxt"><span>Feliz sexta, meninas!! 💕</span></i>',
                 '<i class="i6t xph xf2">'+IMG("beleza")+'</i>', '<i class="i6t xpromo xb2"><b>AGENDE JÁ</b><span>chama no direct</span></i>', '<i class="i6t xph xf3">'+IMG("recepcao")+'</i>']
        btns = '<span class="i6-b pri">Seguir</span><span class="i6-b">Mensagem</span><span class="i6-b sq">'+I['addp']+'</span>'
        vf = ""
    else:
        user, name, cat = "maisonverelle", "Maison Verelle", "Clínica de harmonização facial"
        av = '<span class="i6-av rg"><span class="i6-avi">'+IMG("consulta")+'</span></span>'
        stats = ("128","9.420","310")
        bio = '<p>Harmonização facial com resultado natural.</p><p>Avaliação individual com especialista.</p><p>Jardins · São Paulo</p>'
        link = '<p class="i6-lk">'+I['link']+'<span>Maison Verelle · site</span></p>'
        hls = [("consulta","Tratamentos"),("recepcao","Clínica"),("sala","Protocolos"),("tricologia","Equipe"),("dental","Dúvidas")]
        hl = "".join(f'<span class="i6-h"><i class="i6-hc">{IMG(c)}</i><em>{t}</em></span>' for c,t in hls)
        tiles = ['<i class="i6t xph xw1">'+IMG("consulta")+'</i>', '<i class="i6t xcover"><span>Como é o<br><em>cuidado</em></span></i>', '<i class="i6t xph xw2">'+IMG("recepcao")+'</i>',
                 '<i class="i6t xph xw3">'+IMG("sala")+'</i>', '<i class="i6t xph xw4">'+IMG("tricologia")+'</i>', '<i class="i6t xcover xdk"><span>Como é a<br><em>avaliação</em></span></i>']
        btns = '<span class="i6-b pri">Seguir</span><span class="i6-b">Mensagem</span><span class="i6-b">Contato</span><span class="i6-b sq">'+I['addp']+'</span>'
        vf = I['verif']
    inner = f'''<div class="i6 {'bf' if before else 'af'}">
<div class="i6-top"><b class="i6-u">{user}{vf}{I['chev']}</b><span class="i6-ti">{I['threads']}{I['plus']}{I['menu']}</span></div>
<div class="i6-hd">{av}<div class="i6-st"><b class="i6-nm">{name}</b><div class="i6-ct"><span><b>{stats[0]}</b>posts</span><span><b>{stats[1]}</b>seguidores</span><span><b>{stats[2]}</b>seguindo</span></div></div></div>
<div class="i6-bio"><p class="i6-cat">{cat}</p>{bio}{link}</div>
<div class="i6-bts">{btns}</div>
<div class="i6-hls">{hl}</div>
<div class="i6-tabs"><span class="on">{I['grid']}</span><span>{I['reels']}</span><span>{I['tag']}</span></div>
<div class="i6-grid">{''.join(tiles)}{''.join(tiles[:3])}</div>
<div class="i6-nav">{I['home']}{I['reels']}{I['send']}{I['search']}<i class="i6-me">{'' if before else IMG('consulta')}</i></div>
</div>'''
    return phone(inner, "p-ig")

GLOGO = '<svg class="g-g" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>'
MIC = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M12 15a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v7a3 3 0 0 0 3 3z"/><path fill="#34A853" d="M11 18.9V22h2v-3.1A7 7 0 0 0 19 12h-2a5 5 0 0 1-5 5z"/><path fill="#FBBC04" d="M7 12H5a7 7 0 0 0 6 6.9V17a5 5 0 0 1-4-5z"/><path fill="#EA4335" d="M12 15a3 3 0 0 1-3-3V5h0v7"/></svg>'
LENS = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12.5" r="3.2" fill="#4285F4"/><path fill="none" stroke="#EA4335" stroke-width="2.2" d="M4 9V7a3 3 0 0 1 3-3h2"/><path fill="none" stroke="#FBBC04" stroke-width="2.2" d="M4 15v2a3 3 0 0 0 3 3h2"/><path fill="none" stroke="#4285F4" stroke-width="2.2" d="M15 4h2a3 3 0 0 1 3 3v2"/><circle cx="18.5" cy="18.5" r="1.8" fill="#34A853"/></svg>'
GS = lambda d: f'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{d}</svg>'
GI = {
 'call': GS('<path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6a1 1 0 0 0-1 .2l-2.2 2.2a15 15 0 0 1-6.6-6.6l2.2-2.2a1 1 0 0 0 .3-1A11 11 0 0 1 8.5 4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1 17 17 0 0 0 17 17 1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1z"/>'),
 'dir': GS('<path d="M21.7 11.3l-9-9a1 1 0 0 0-1.4 0l-9 9a1 1 0 0 0 0 1.4l9 9a1 1 0 0 0 1.4 0l9-9a1 1 0 0 0 0-1.4zM14 14.5V12h-4v3H8v-4a1 1 0 0 1 1-1h5V7.5l3.5 3.5z"/>'),
 'web': GS('<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 6h-2.9a15.7 15.7 0 0 0-1.4-3.6A8 8 0 0 1 18.9 8zM12 4c.8 1.2 1.5 2.5 1.9 4h-3.8c.4-1.4 1.1-2.8 1.9-4zM4.3 14a8.2 8.2 0 0 1 0-4h3.4a16.5 16.5 0 0 0 0 4zm.8 2h3a15.7 15.7 0 0 0 1.4 3.6A8 8 0 0 1 5.1 16zm3-8h-3a8 8 0 0 1 4.3-3.6C8.8 5.6 8.4 6.8 8.1 8zM12 20c-.8-1.2-1.5-2.5-1.9-4h3.8c-.4 1.4-1.1 2.8-1.9 4zm2.3-6H9.7a14.7 14.7 0 0 1 0-4h4.6a14.7 14.7 0 0 1 0 4zm.3 5.6c.6-1.1 1.1-2.3 1.4-3.6h2.9a8 8 0 0 1-4.3 3.6zm1.8-5.6a16.5 16.5 0 0 0 0-4h3.4a8.2 8.2 0 0 1 0 4z"/>'),
 'save': GS('<path d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2zm0 15-5-2.2L7 18V5h10z"/>'),
 'share': GS('<path d="M18 16.1c-.8 0-1.5.3-2 .8l-7.1-4.2a3 3 0 0 0 0-1.4L15.9 7a3 3 0 1 0-1-2.2c0 .2 0 .5.1.7L8 9.6a3 3 0 1 0 0 4.4l7.1 4.2-.1.7a3 3 0 1 0 3-2.8z"/>'),
 'cam': GS('<path d="M9 3 7.2 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>'),
}
def stars(n):
    full = int(n); half = n-full >= .5
    out = ""
    for i in range(5):
        cls = "on" if i < full else ("hf" if i == full and half else "")
        out += f'<i class="{cls}"></i>'
    return f'<span class="g-stars">{out}</span>'
def chips(lst):
    return "".join(f'<span class="g-chip{" pri" if i==0 and lst[0][0] in ("call","web") else ""}">{GI[k]}{t}</span>' for i,(k,t) in enumerate(lst))
def rev(ini, color, who, n, when, txt, reply=None):
    r = f'<div class="g-rv"><div class="g-rh"><i class="g-ra" style="background:{color}">{ini}</i><div><b>{who}</b><span>{stars(n)} {when}</span></div></div><p>{txt}</p>'
    if reply: r += f'<p class="g-rp"><b>Resposta do proprietário</b>{reply}</p>'
    return r + '</div>'
def google(before):
    if before:
        photos = '<div class="g-ph empty">'+GI['cam']+'</div>'
        name, rt, cnt, sub = "Clínica Aurora", 3.8, "9", "Clínica de estética · Moema"
        hours = '<p class="g-hr muted">Horário de funcionamento não informado</p>'
        ch = chips([("dir","Rotas"),("save","Salvar"),("share","Compartilhar")])
        revs = rev("R","#7cb342","Renata M.",2,"há 3 meses","Mandei mensagem e demoraram dois dias para responder.") + rev("J","#8e24aa","Juliana S.",4,"há 8 meses","Gostei do atendimento.")
    else:
        photos = '<div class="g-ph"><i class="a">'+IMG("recepcao")+'</i><i class="b">'+IMG("consulta")+'</i><i class="c">'+IMG("sala")+'</i></div>'
        name, rt, cnt, sub = "Maison Verelle", 4.9, "186", "Harmonização facial · Jardins"
        hours = '<p class="g-hr"><b>Aberto</b> ⋅ Fecha às 19:00</p>'
        ch = chips([("web","Site"),("call","Ligar"),("dir","Rotas"),("save","Salvar"),("share","Compartilhar")])
        revs = rev("C","#1e88e5","Camila R.",5,"há 2 semanas","Resultado natural, exatamente como conversamos na avaliação. Equipe muito atenciosa.","Obrigada, Camila! Foi um prazer cuidar de você.") + rev("P","#f4511e","Patrícia L.",5,"há 1 mês","Clínica linda e explicaram cada etapa do procedimento.")
    inner = f'''<div class="g {'bf' if before else 'af'}">
<div class="g-top"><span class="g-mn">{S('<path d="M4 7h16M4 12h16M4 17h16"/>',2)}</span><span class="g-wm"><i style="color:#4285F4">G</i><i style="color:#EA4335">o</i><i style="color:#FBBC05">o</i><i style="color:#4285F4">g</i><i style="color:#34A853">l</i><i style="color:#EA4335">e</i></span><i class="g-me">M</i></div>
<div class="g-sb">{GLOGO}<span class="g-q">harmonização facial jardins</span><span class="g-ic">{MIC}{LENS}</span></div>
<div class="g-tabs"><span class="on">Tudo</span><span>Mapas</span><span>Imagens</span><span>Notícias</span><span>Vídeos</span></div>
<div class="g-kp">{photos}
<h4 class="g-nm">{name}</h4>
<p class="g-rt"><span>{str(rt).replace('.',',')}</span>{stars(rt)}<span class="g-cn">({cnt})</span></p>
<p class="g-sub">{sub}</p>{hours}
<div class="g-chips">{ch}</div>
<p class="g-h5">Avaliações</p>{revs}</div></div>'''
    return phone(inner, "p-g")

CSS = q(r'''
/* ===== v16 mockups realistas (gerado por tools/mock16.py) ===== */
.p16{--w:clamp(206px,58vw,232px);width:var(--w);position:relative;flex:none;border-radius:calc(var(--w)*.168);padding:calc(var(--w)*.011);background:linear-gradient(140deg,#a9a8a4 0%,#5d5c59 14%,#d9d8d3 38%,#7b7a76 62%,#b8b7b2 84%,#5b5a57 100%);box-shadow:0 1px 0 rgba(255,255,255,.25) inset,0 34px 60px -28px rgba(0,0,0,.75),0 12px 24px -16px rgba(0,0,0,.6)}
@media(min-width:860px){.p16{--w:270px}}
.p16-bz{border-radius:calc(var(--w)*.158);background:#050505;padding:calc(var(--w)*.026);box-shadow:inset 0 0 0 calc(var(--w)*.004) #2a2a2a}
.p16-scr{position:relative;aspect-ratio:393/852;border-radius:calc(var(--w)*.132);overflow:hidden;background:#fff;container-type:inline-size;--u:calc(100cqw/393);font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",Roboto,Arial,sans-serif;color:#000;-webkit-font-smoothing:antialiased;line-height:1.3;text-align:left;letter-spacing:0;isolation:isolate}
.p16-scr::after{content:"";position:absolute;inset:0;z-index:20;pointer-events:none;background:linear-gradient(118deg,rgba(255,255,255,.16) 0%,rgba(255,255,255,0) 28%,rgba(255,255,255,0) 70%,rgba(255,255,255,.05) 100%)}
.p16-scr *{box-sizing:border-box;margin:0;padding:0;font-style:normal}
.p16-scr img{display:block;width:100%;height:100%;object-fit:cover}
.p16-k{position:absolute;width:calc(var(--w)*.012);border-radius:2px;background:linear-gradient(90deg,#6e6d69,#c9c8c3,#7b7a76)}
.p16-k.a{left:calc(var(--w)*-.009);top:17%;height:5%}.p16-k.u{left:calc(var(--w)*-.009);top:25%;height:8.5%}.p16-k.d{left:calc(var(--w)*-.009);top:35.5%;height:8.5%}.p16-k.p{right:calc(var(--w)*-.009);top:28%;height:13%}
.p16-di{position:absolute;top:11q;left:50%;transform:translateX(-50%);width:124q;height:36q;border-radius:20q;background:#000;z-index:15}
.p16-sb{position:relative;z-index:14;height:54q;display:flex;align-items:center;justify-content:space-between;padding:4q 32q 0 52q;color:#000}
.p16-sb b{font-size:17q;font-weight:600;letter-spacing:-.2q}
.p16-sb span{display:flex;gap:6q;align-items:center}.p16-sb svg{height:12q;width:auto;fill:currentColor}.p16-sb svg:last-child{height:13q}
.p16-hi{position:absolute;z-index:16;bottom:8q;left:50%;transform:translateX(-50%);width:138q;height:5q;border-radius:3q;background:#000}
.dev .p16{margin:0 auto}
/* Instagram */
.i6{font-size:14q;color:#000}
.i6-top{height:44q;display:flex;align-items:center;justify-content:space-between;padding:0 16q}
.i6-u{display:flex;align-items:center;gap:4q;font-size:22q;font-weight:700;letter-spacing:-.3q;white-space:nowrap}
.i6-u .vf{width:15q;height:15q}.i6-u>svg:last-child{width:16q;height:16q}
.i6-ti{display:flex;gap:20q}.i6-ti svg{width:25q;height:25q}
.i6-hd{display:flex;align-items:center;gap:22q;padding:8q 16q 0}
.i6-av{width:90q;height:90q;border-radius:50%;flex:none;display:grid;place-items:center}
.i6-av.rg{background:conic-gradient(from 210deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5,#feda75)}
.i6-avi{position:relative;width:84q;height:84q;border-radius:50%;overflow:hidden;border:3q solid #fff;display:grid;place-items:center}
.i6-av:not(.rg) .i6-avi{width:90q;height:90q;border:.5px solid #dbdbdb}
.i6-avi img{position:absolute;inset:0}
.i6-avi.logo{background:#f7c8d8;color:#c2185b;font:italic 600 19q Georgia,serif}
.i6-st{flex:1;min-width:0}
.i6-nm{display:block;font-size:15q;font-weight:600;margin-bottom:6q;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.i6-ct{display:flex;justify-content:space-between;padding-right:12q}
.i6-ct span{display:flex;flex-direction:column;font-size:14q;line-height:1.25}.i6-ct b{font-size:17q;font-weight:600}
.i6-bio{padding:12q 16q 0;font-size:14q;line-height:18q}
.i6-cat{color:#737373}
.i6-lk{display:flex;align-items:center;gap:4q;color:#00376b;font-weight:600}.i6-lk svg{width:14q;height:14q;transform:rotate(-45deg)}
.i6-bts{display:flex;gap:6q;padding:14q 16q 0}
.i6-b{flex:1;height:32q;border-radius:8q;background:#efefef;display:grid;place-items:center;font-size:14q;font-weight:600}
.i6-b.pri{background:#0095f6;color:#fff}.i6-b.sq{flex:0 0 34q}.i6-b svg{width:16q;height:16q}
.i6-hls{display:flex;gap:15q;padding:16q 16q 0;overflow:hidden}
.i6-h{display:flex;flex-direction:column;align-items:center;gap:5q;flex:none;width:64q}
.i6-hc{width:64q;height:64q;border-radius:50%;border:1px solid #dbdbdb;padding:3q;display:block;overflow:hidden;background:#fff}
.i6-hc img{border-radius:50%}
.i6-h em{font-size:12q;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:68q}
.i6-hc.raw{background-clip:content-box}
.hl-c1{background:#fde2ea}.hl-c2{background:#f48fb1}.hl-c3{background:#ffe082}.hl-c4{background:#b39ddb}
.af .i6-hc img{filter:sepia(.25) saturate(.8) brightness(1.02)}
.i6-tabs{display:flex;margin-top:14q;height:44q;border-bottom:.5px solid #dbdbdb}
.i6-tabs span{flex:1;display:grid;place-items:center;color:#8e8e8e;position:relative}.i6-tabs span.on{color:#000}
.i6-tabs span.on::after{content:"";position:absolute;bottom:-.5px;left:0;right:0;height:1q;min-height:1px;background:#000}
.i6-tabs svg{width:24q;height:24q}
.i6-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px}
.i6-grid .i6t{aspect-ratio:3/4;overflow:hidden;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.i6-grid .i6t img{position:absolute;inset:0}
.bf .i6t.xph img{filter:saturate(1.35) contrast(1.1) brightness(1.08)}.bf .xf1 img{object-position:20% 50%}.bf .xf2 img{object-position:80% 30%;filter:saturate(1.5) hue-rotate(-12deg)}
.i6t.xpromo{background:linear-gradient(160deg,#ff4f9a,#ff9a3c);color:#fff;font-family:Arial,sans-serif}.i6t.xpromo b{font-size:15q;font-weight:900;line-height:1}.i6t.xpromo span{font-size:10q;margin-top:4q;font-weight:700}
.i6t.xpromo.xb2{background:#7e3ff2}.i6t.xtxt{background:#fff6b3;color:#c2185b;padding:10q;font:600 13q "Comic Sans MS","Chalkboard SE",cursive}
.af .i6t.xph img{filter:sepia(.28) saturate(.75) contrast(.98) brightness(1.03)}
.af .xw1 img{object-position:35% 50%}.af .xw2 img{object-position:60% 50%}.af .xw3 img{object-position:50% 40%}.af .xw4 img{object-position:45% 50%}
.i6t.xcover{background:#efe6d8;color:#3b2f22}.i6t.xcover.xdk{background:#2b241c;color:#efe2cc}
.i6t.xcover span{font:500 17q/1.05 "Cormorant Garamond",Georgia,serif}.i6t.xcover em{font-style:italic;color:#a8823f}
.i6-nav{position:absolute;z-index:12;left:0;right:0;bottom:0;height:84q;background:#fff;border-top:.5px solid #dbdbdb;display:flex;justify-content:space-around;align-items:flex-start;padding-top:12q}
.i6-nav svg{width:26q;height:26q}
.i6-me{width:27q;height:27q;border-radius:50%;overflow:hidden;display:block;border:1.5q solid #000;padding:1.5q;background:#f7c8d8 content-box}.i6-me img{border-radius:50%}
/* Google */
.g{font-family:Roboto,"Google Sans",Arial,-apple-system,sans-serif;color:#1f1f1f;font-size:14q}
.g-top{display:flex;align-items:center;justify-content:space-between;padding:4q 14q 0;height:48q}
.g-mn svg{width:24q;height:24q;color:#5f6368}
.g-wm{font:500 25q/1 "Google Sans","Product Sans",Roboto,Arial,sans-serif;letter-spacing:-1q}
.g-me{width:32q;height:32q;border-radius:50%;background:#7b1fa2;color:#fff;display:grid;place-items:center;font-size:15q;font-weight:500}
.g-sb{margin:8q 14q 0;height:48q;border-radius:24q;background:#fff;box-shadow:0 1px 6px rgba(32,33,36,.28);display:flex;align-items:center;gap:12q;padding:0 14q}
.g-g{width:20q;height:20q;flex:none}.g-q{flex:1;font-size:16q;color:#1f1f1f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.g-ic{display:flex;gap:14q}.g-ic svg{width:22q;height:22q}
.g-tabs{display:flex;gap:22q;padding:0 18q;margin-top:12q;border-bottom:1px solid #ebebeb;font-size:14q;color:#5f6368;white-space:nowrap;overflow:hidden}
.g-tabs span{padding:10q 0 11q;position:relative}.g-tabs .on{color:#1f1f1f;font-weight:500}
.g-tabs .on::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:3q;border-radius:3q 3q 0 0;background:#1f1f1f}
.g-kp{padding:14q 16q 0}
.g-ph{height:150q;border-radius:12q;overflow:hidden;display:grid;grid-template-columns:2fr 1fr;grid-template-rows:1fr 1fr;gap:2q}
.g-ph .a{grid-row:1/3}.g-ph i{display:block;overflow:hidden}
.g-ph.empty{display:grid;grid-template-columns:1fr;place-items:center;background:#f1f3f4;color:#bdc1c6}.g-ph.empty svg{width:40q;height:40q}
.g-nm{font:400 24q/1.2 "Google Sans",Roboto,Arial,sans-serif;margin-top:14q;color:#1f1f1f}
.g-rt{display:flex;align-items:center;gap:5q;margin-top:4q;color:#4d5156}
.g-stars{display:inline-flex;gap:1q}.g-stars i{width:14q;height:14q;display:block;background:#dadce0;clip-path:polygon(50% 0,61.8% 35.4%,100% 38.2%,69.1% 61.8%,79.4% 100%,50% 76.4%,20.6% 100%,30.9% 61.8%,0 38.2%,38.2% 35.4%)}
.g-stars i.on{background:#fbbc04}.g-stars i.hf{background:linear-gradient(90deg,#fbbc04 50%,#dadce0 50%)}
.g-cn{color:#4d5156}
.g-sub{color:#4d5156;margin-top:2q}
.g-hr{margin-top:2q;color:#4d5156}.g-hr b{color:#188038;font-weight:500}.g-hr.muted{color:#70757a}
.g-chips{display:flex;gap:8q;margin:14q -16q 0 0;overflow:hidden;white-space:nowrap}
.g-chip{flex:none;display:inline-flex;align-items:center;gap:7q;height:36q;padding:0 15q 0 13q;border-radius:18q;border:1px solid #c4c7c5;color:#0b57d0;font-size:14q;font-weight:500}
.g-chip svg{width:18q;height:18q}.g-chip.pri{background:#0b57d0;border-color:#0b57d0;color:#fff}
.g-h5{font:400 18q "Google Sans",Roboto,Arial,sans-serif;margin-top:22q;padding-top:16q;border-top:1px solid #ebebeb}
.g-rv{margin-top:14q}
.g-rh{display:flex;gap:10q;align-items:center}.g-rh b{display:block;font-size:14q;font-weight:500}.g-rh span{display:flex;align-items:center;gap:6q;font-size:12q;color:#70757a}
.g-rh .g-stars i{width:11q;height:11q}
.g-ra{width:32q;height:32q;border-radius:50%;color:#fff;display:grid;place-items:center;font-size:15q;font-weight:500;flex:none}
.g-rv>p{margin-top:6q;line-height:20q;color:#1f1f1f}
.g-rp{margin-top:8q !important;padding-left:10q;border-left:2q solid #dadce0;color:#4d5156 !important;font-size:13q}.g-rp b{display:block;font-weight:500;color:#1f1f1f}
''')

def inject(path, sec_id, figs):
    p = R/path; s = p.read_text()
    a = s.index(f'id="{sec_id}"'); b = s.index('<div class="ba', a); e = s.index('<a class="bridge', b)
    blk = f'<div class="ba phones devs reveal">\n' + "\n".join(f'      <figure class="dev {k}"><figcaption class="tagba{" ok" if k=="after" else ""}">{"Antes" if k=="before" else "Depois"}</figcaption>{h}</figure>' for k,h in figs) + '\n    </div>\n  \n    '
    s = s[:b] + blk + s[e:]; p.write_text(s)

if __name__ == "__main__":
    inject("index.html", "google", [("before", google(True)), ("after", google(False))])
    inject("index.html", "instagram", [("before", ig(True)), ("after", ig(False))])
    rx = (R/"raio-x.html").read_text()
    sid = re.search(r'<section[^>]*id="([^"]+)"[^>]*>(?:(?!</section>).)*?class="ba phones', rx, re.S).group(1)
    inject("raio-x.html", sid, [("before", ig(True)), ("after", ig(False))])
    css = (R/"assets/style.css").read_text()
    m = "/* ===== v16 mockups"
    if m in css: css = css[:css.index(m)].rstrip()+"\n"
    (R/"assets/style.css").write_text(css + CSS)
    print("ok", sid)
