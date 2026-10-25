# v17: site premium em MacBook + iPhone (renderizado pelo app.js a partir de CASES) + mini cards Google/IG.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).parent))
from mock16 import phone, google, ig, CSS as CSS16, q, R

def devices(k=0):
    ph = phone(f'<div class="p17-site" data-fit="390"><div class="mini m17" data-site="{k}"></div></div>', "p-site")
    return f'''<div class="dev17" aria-hidden="true">
      <div class="mbp"><div class="mbp-lid"><i class="mbp-cam"></i><div class="mbp-scr" data-fit="1280"><div class="mini m17" data-site="{k}"></div></div></div><div class="mbp-base"></div></div>
      {ph}
    </div>'''

def comp_cards():
    return f'''<div class="cmp">
      <article class="cmp-c reveal">{google(False)}<div><h3>Google</h3><p>Quem pesquisa encontra nota, avaliações e o caminho direto para o seu site.</p></div></article>
      <article class="cmp-c reveal">{ig(False)}<div><h3>Instagram</h3><p>O perfil apresenta a clínica. O site confirma a escolha.</p></div></article>
    </div>'''

CSS17 = q(r'''
/* ===== v17 site em MacBook + iPhone ===== */
.dev17{position:relative;width:100%;max-width:600px;margin:0 auto;padding:0 0 4% 0}
.mbp{width:90%;position:relative}
.mbp-lid{position:relative;background:#0c0c0d;border-radius:16px 16px 6px 6px;padding:2.4% 2.4% 3.2%;box-shadow:inset 0 0 0 1.5px #3b3b3e,0 40px 70px -35px rgba(0,0,0,.9)}
.mbp-cam{position:absolute;top:1%;left:50%;width:5px;height:5px;margin-left:-2.5px;border-radius:50%;background:#2a2a2d}
.mbp-scr{position:relative;aspect-ratio:16/10;overflow:hidden;border-radius:4px;background:#fff}
.mbp-base{position:relative;height:clamp(8px,2.2vw,14px);margin:0 -6%;background:linear-gradient(#e2e2e5,#a3a3a8 60%,#6f6f74);border-radius:2px 2px 16px 16px/2px 2px 10px 10px}
.mbp-base::before{content:"";position:absolute;top:0;left:42%;right:42%;height:45%;background:#8c8c91;border-radius:0 0 8px 8px}
.dev17 .p16{--w:clamp(96px,27vw,168px);position:absolute;right:0;bottom:0;z-index:2;filter:drop-shadow(0 20px 30px rgba(0,0,0,.55))}
.p17-site{position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;background:#fff}
.p-site .p16-sb{background:#f7f0e7}
.mini.m17{position:absolute;top:0;left:0;transform-origin:0 0;pointer-events:none;width:1280px}.p17-site .mini.m17{width:390px;top:54q}
.m17 .tpl{animation:m17 22s ease-in-out 1.2s infinite alternate}
@keyframes m17{0%,12%{transform:translateY(0)}88%,100%{transform:translateY(-38%)}}
@media(prefers-reduced-motion:reduce){.m17 .tpl{animation:none}}
.tpl.mob .t-menu{display:none}.tpl.mob .t-nav{padding:18px 22px}.tpl.mob .t-nav .t-cta{display:none}
.tpl.mob .t-hero{grid-template-columns:1fr;padding:18px 22px 40px}.tpl.mob h1{font-size:2.5rem;line-height:1.05}
.tpl.mob .t-grid,.tpl.mob .t-steps{grid-template-columns:1fr}.tpl.mob .t-sec{padding-left:22px;padding-right:22px}
.cmp{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:30px}
.cmp-c{background:#0f0e0c;color:#efe9dc;border:1px solid rgba(200,162,90,.25);border-radius:20px;padding:20px 14px 18px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:16px;min-width:0}
.cmp-c .p16{--w:clamp(118px,36vw,220px)}
.cmp-c>div:last-child h3{font-family:"Cormorant Garamond",serif;font-size:1.5rem;color:var(--gold)}.cmp-c>div:last-child p{color:#bdb5a4;font-size:.9rem;line-height:1.45;margin-top:4px}
.dor17{padding:70px 0;border-bottom:1px solid var(--line)}.dor17 h2{max-width:22ch;margin-inline:auto}.dor17 .lead{margin-inline:auto}
.hero h1.h17{font-size:clamp(2.1rem,5vw,3.7rem);line-height:1.08}
.lp-steps li:nth-child(4){border-color:rgba(200,162,90,.7);box-shadow:0 10px 30px -12px rgba(200,162,90,.45)}
.hero .facts{grid-template-columns:repeat(3,auto)}
.tab.hl{border-color:rgba(200,162,90,.7)}.tab.hl b{color:var(--gold)}
.ent-c.big{grid-column:1/-1;background:#0f0e0c;color:#efe9dc;border-color:rgba(200,162,90,.4)}.ent-c.big b{font-size:1.3rem;color:var(--gold)}.ent-c.big p{color:#cfc7b5}
.ent-x{margin-top:16px;text-align:center;font-size:.92rem;opacity:.75}
@media(max-width:760px){.ent{grid-template-columns:1fr}.hero-grid>.dev17{margin-top:8px}.cmp{gap:10px}.cmp-c{padding:16px 10px}}
''')

def write_css():
    st = R/"assets/style.css"; css = st.read_text(); m = "/* ===== v16 mockups"
    if m in css: css = css[:css.index(m)].rstrip()+"\n"
    st.write_text(css + CSS16 + CSS17 + (R/"tools/v18.css").read_text())

if __name__ == "__main__":
    write_css(); print("css ok")
