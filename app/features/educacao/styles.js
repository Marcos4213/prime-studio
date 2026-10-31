/* Layout da Educação. Cor só via tokens.css — nenhum hex aqui. */
export const css = `
*,*::before,*::after{box-sizing:border-box}
html,body{overflow-x:hidden;max-width:100%}
body,h1,h2,p,ol,ul{margin:0;padding:0}
img{max-width:100%;height:auto}
.skip{position:absolute;left:12px;top:-40px;background:var(--color-accent);color:var(--color-accent-text);padding:8px 12px;border-radius:999px;z-index:9;text-decoration:none}
.skip:focus{top:12px}
.edu{width:min(560px,100%);margin:0 auto;padding:0 16px calc(36px + env(safe-area-inset-bottom));color:var(--color-text)}
.edu-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 0 8px}
.edu-logo{display:inline-flex;flex-direction:column;align-items:flex-start;gap:5px;color:var(--color-text);text-decoration:none;font-weight:600;letter-spacing:.22em;font-size:.72rem;line-height:1}
.edu-word{white-space:nowrap}
.edu-logo span{color:var(--color-primary);font-weight:300;margin-left:.35em}
.sig{display:block;width:22px;height:2px;background:var(--color-gold);border-radius:1px}
.edu-toplink{color:var(--color-accent);text-decoration:none;font-weight:600;font-size:.78rem;flex:none;padding:8px 2px}
.kicker{margin-top:14px;color:var(--color-accent);letter-spacing:.24em;text-transform:uppercase;font-size:.68rem;font-weight:600}
.kicker-sub{color:var(--color-muted);font-size:.92rem;margin:6px 0 14px;max-width:34ch}
.hero{position:relative;border-radius:20px;overflow:hidden;border:1px solid var(--color-line)}
.hero img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;object-position:center}
.hero-copy{position:absolute;left:0;right:0;bottom:0;padding:104px 16px 28px;background:linear-gradient(180deg,transparent 0%,var(--color-bg) 46%,var(--color-bg) 100%)}
.eyebrow{color:var(--color-accent);letter-spacing:.16em;text-transform:uppercase;font-size:.66rem;font-weight:600}
.edu h1,.edu h2{font-family:var(--serif);font-weight:500;letter-spacing:-.015em;line-height:1.08;overflow-wrap:anywhere;color:var(--color-text)}
.hero h1{font-size:clamp(1.85rem,7.4vw,2.55rem);margin-top:6px;padding-bottom:.18em}
.page-title{font-size:clamp(2rem,8vw,2.7rem);margin:8px 0}
.prose{margin-top:16px;display:grid;gap:10px}
.prose p{color:var(--color-text);font-size:.98rem}
.now{margin-top:18px;background:var(--color-surface);border:1px solid var(--color-line);border-radius:18px;padding:14px 14px 6px}
.now h2{font-size:1.35rem;margin-bottom:4px}
.steps{list-style:none;counter-reset:s;padding:0}
.steps li{counter-increment:s;position:relative;padding:11px 0 11px 36px;border-top:1px solid var(--color-line);color:var(--color-text);font-size:.92rem}
.steps li:before{content:counter(s);position:absolute;left:0;top:11px;width:24px;height:24px;border-radius:50%;background:var(--color-surface);color:var(--color-primary);border:1px solid var(--color-gold);display:grid;place-items:center;font-size:.75rem;font-weight:600}
.actions{display:grid;gap:10px;margin-top:16px}
.edu .btn,.edu .btn-ghost{display:flex;align-items:center;justify-content:center;width:100%;min-height:48px;text-align:center;text-decoration:none;border-radius:999px;padding:12px 18px;cursor:pointer}
.edu .btn{border:0;color:var(--color-on-primary);font-weight:600;background:var(--color-primary)}
.edu .btn-ghost{background:transparent;color:var(--color-accent);border:1px solid var(--color-accent);font-weight:500}
.edu .btn.is-done{background:transparent;color:var(--color-accent);border:1px solid var(--color-accent)}
.edu .btn:focus-visible,.edu .btn-ghost:focus-visible,.tomorrow:focus-visible,.spine a:focus-visible,.week a:focus-visible,.edu-toplink:focus-visible,.edu-logo:focus-visible,.textlink:focus-visible{outline:2px solid var(--color-accent);outline-offset:3px}
.done-note{font-family:var(--serif);font-style:italic;color:var(--color-accent);font-size:1.28rem;line-height:1.25}
.tomorrow{display:flex;gap:12px;align-items:center;margin-top:22px;padding:10px;border-radius:18px;border:1px solid var(--color-accent);background:var(--color-surface);text-decoration:none;color:inherit;min-width:0}
.tomorrow img{width:72px;height:72px;flex:none;object-fit:cover;border-radius:12px;border:1px solid var(--color-line)}
.tomorrow span{min-width:0;display:block}
.tomorrow strong{display:block;font-family:var(--serif);font-size:1.28rem;font-weight:500;line-height:1.15;margin:3px 0;color:var(--color-text)}
.tomorrow small{display:block;color:var(--color-muted);font-size:.78rem}
.trail{margin-top:28px}
.trail h2{font-size:1.7rem;margin:4px 0 6px}
.trail .hint{color:var(--color-muted);font-size:.88rem;margin-bottom:12px;max-width:38ch}
.spine,.week{list-style:none;display:grid;gap:8px;padding:0;margin:0}
.week{margin-top:14px}
.spine a,.week a{display:flex;gap:12px;align-items:center;min-height:52px;padding:10px 12px;border-radius:14px;border:1px solid var(--color-line);background:var(--color-surface);text-decoration:none;color:inherit;min-width:0}
.spine i{flex:none;width:36px;height:36px;border-radius:50%;border:1px solid var(--color-gold);color:var(--color-primary);background:var(--color-surface);display:grid;place-items:center;font-family:var(--serif);font-style:normal;font-size:1.15rem}
.spine a.is-done i{background:var(--color-accent);color:var(--color-accent-text);border-color:var(--color-accent)}
.spine div,.week div{min-width:0}
.spine b{display:block;font-size:.92rem;font-weight:600;color:var(--color-text)}
.spine small,.week small{display:block;color:var(--color-muted);font-size:.78rem;line-height:1.35}
.more{display:inline-block;margin-top:14px;color:var(--color-accent);font-size:.88rem}
.back{display:inline-flex;align-items:center;min-height:44px;margin:6px 0 12px;color:var(--color-accent);text-decoration:none;font-size:.9rem}
.week a.is-today{border-color:var(--color-accent)}
.week a.is-done b:after{content:" · lida";color:var(--color-accent);font-weight:500}
.wd{flex:none;width:46px;color:var(--color-accent);font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;font-weight:600}
.week b{display:block;font-family:var(--serif);font-size:1.15rem;font-weight:500;line-height:1.15;color:var(--color-text)}
.foot{margin-top:28px;color:var(--color-muted);font-size:.75rem;letter-spacing:.04em}
.foot p+p{margin-top:4px}
.empty{padding:12px 0 28px}
.empty h1{margin:8px 0 10px}
.empty p{color:var(--color-muted);margin-bottom:16px}
.edu em{color:var(--color-accent);font-style:italic}
@media (min-width:900px){
  .edu{width:min(960px,100%)}
  .hero{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(16rem,.95fr);overflow:visible;align-items:stretch}
  .hero img{height:100%;min-height:280px;aspect-ratio:auto}
  .hero-copy{position:relative;display:flex;flex-direction:column;justify-content:flex-end;padding:28px 28px 36px;background:var(--color-bg)}
}
@media (prefers-color-scheme: dark){
  .edu-logo span{color:var(--color-text)}
  .steps li:before,.spine i{color:var(--color-accent)}
  .edu .btn:not(.btn-ghost):not(.is-done){background:var(--color-gold);color:var(--color-on-primary)}
}
@media (prefers-reduced-motion: reduce){*{transition:none!important;animation:none!important}}
`;
