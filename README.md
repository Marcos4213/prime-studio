# Prime Studio · Site + Raio-X de Presença

Site da Prime Studio (Método PRIME): https://prime.devbrasil.online

HTML/CSS/JS estático, sem build, hospedado no Cloudflare Pages (projeto `prime-studio`) com Pages Functions.

## Estrutura
- `index.html` – página longa (remarketing e orgânico)
- `raio-x.html` – quiz do Raio-X de Presença (destino dos anúncios)
- `confirmado.html`, `links.html`, `guia.html`, `privacidade.html`
- `assets/` – CSS, JS (`app.js`) e `px.js` (Meta Pixel)
- `functions/api/lead.js` – lead → KV + HubSpot + Meta CAPI
- `functions/api/capi.js` – espelho CAPI dos demais eventos
- `emails/`, `lib/`, `shots/`

## Deploy
```
wrangler pages deploy . --project-name prime-studio            # produção
wrangler pages deploy . --project-name prime-studio --branch X # prévia em https://X.prime-studio-953.pages.dev
```
Secrets (nunca no código): `META_CAPI_TOKEN`, `HUBSPOT_PRIVATE_TOKEN`, `ADMIN_KEY`, `NOTIFY_WEBHOOK`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, opcional `META_TEST_EVENT_CODE`.

## Repos relacionados
- [prime-studio-tracking](https://github.com/Marcos4213/prime-studio-tracking) – documentação do trackeamento avançado
- [prime-studio-conteudos](https://github.com/Marcos4213/prime-studio-conteudos) – roteiros, posts e marca
- [prime-studio-prospeccao](https://github.com/Marcos4213/prime-studio-prospeccao) – prospecção e vendas
