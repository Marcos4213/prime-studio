# Prime Studio · Site

Site da Prime Studio: https://prime.devbrasil.online

Promessa: paciente de alto valor que pergunta o preço e some não está achando caro — está sem confiança. O nosso time arruma isso em 90 dias. O Método PRIME é o como. O preço do pacote não aparece no site.

HTML/CSS/JS estático, sem build, hospedado no Cloudflare Pages (projeto `prime-studio`) com Pages Functions.

## Estrutura
- `index.html` – página longa (remarketing e orgânico)
- `contato.html` – captura da campanha (`/contato`). Nichos: `?nicho=implantes|lentes|plastica|estetica`. Headline A/B: `?v=1` (resultado) ou `?v=7` (problema); sem `v`, sorteio 50/50 persistido em `localStorage` (`prime_ab_contato`). A variante vai no lead (KV), no HubSpot (propriedades `variante_ab` e `nicho_anuncio`, com fallback no nome do deal) e no evento Meta (`variante`)
- `obrigado.html` – confirmação depois do envio (`/obrigado`)
- `raio-x.html` – quiz do Raio-X (fluxo antigo dos anúncios; continua ativo)
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

Sem `META_CAPI_TOKEN`, o Pixel do navegador dispara, mas a Conversions API responde `inativo` e a deduplicação server-side não acontece. Crie no HubSpot as propriedades de contato `variante_ab` e `nicho_anuncio` (texto) e o valor `contato` em `origem_lead`. Se elas não existirem, o sync tenta de novo sem esses campos; a variante continua no KV e no nome do negócio.

## Repos relacionados
- [prime-studio-tracking](https://github.com/Marcos4213/prime-studio-tracking) – documentação do trackeamento avançado
- [prime-studio-conteudos](https://github.com/Marcos4213/prime-studio-conteudos) – roteiros, posts e marca
- [prime-studio-prospeccao](https://github.com/Marcos4213/prime-studio-prospeccao) – prospecção e vendas
