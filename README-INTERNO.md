# Prime Studio — README interno (v9)

Site: https://prime.devbrasil.online · Cloudflare Pages `prime-studio` · KV `LEADS`.

## O que está ATIVO
| Item | Detalhe |
|---|---|
| Atribuição | UTMs, fbclid, gclid, referrer (first/last touch em localStorage `prime_attr`), cookies `_fbc` (criado a partir do fbclid) e `_fbp`. Enviados com o lead e no KV. |
| Brevo (estrutura) | Pasta “Prime Studio” (32), lista “Prime Studio — Leads” (**id 33**, env `BREVO_LIST_ID=33` já setada). Atributos: NOME, WHATSAPP (já existiam), NEGOCIO, NICHO, SCORE, DOR, FAIXA, STATUS, ORIGEM, UTM_SOURCE, UTM_MEDIUM, UTM_CAMPAIGN, DATA_DIAGNOSTICO. |

## O que falta ATIVAR (Cloudflare → Pages → prime-studio → Settings → Variables and secrets, tipo *Secret*, depois novo deploy)
| Env | Ativa | Onde pegar |
|---|---|---|
| `META_PIXEL_ID` (no **app.js** `CONFIG.META_PIXEL_ID` **e** no Pages) | Pixel: PageView, ViewContent por seção, QuizStart, QuizStep, Lead, CompleteRegistration, Contact, InitiateCheckout — todos com `event_id` (dedup) e Advanced Matching (em/ph SHA-256). O evento Schedule não é mais enviado. | Gerenciador de Eventos da Meta |
| `META_CAPI_TOKEN` (+ opcional `META_TEST_EVENT_CODE`) | `/api/capi` espelha PageView, ViewContent, Contact e QuizStart. Lead e SubmitApplication saem só do `/api/lead`, com o mesmo `event_id` do navegador. | Gerenciador de Eventos → Configurações → Conversions API → Gerar token |
| `HUBSPOT_PRIVATE_TOKEN` (**ATIVO desde 23/10, testado e limpo**) | Upsert de contato por e-mail + deal (pipeline `default`). Quiz → estágio *Lead do quiz* (1467547048); booking → *Diagnóstico agendado* (1467547050), sem regredir estágio. | HubSpot → Configurações → Integrações → Apps privados (escopos: crm.objects.contacts.write/read, crm.objects.deals.write/read) |
| `BREVO_API_KEY` | `/api/lead` faz upsert do contato na lista 33 com STATUS | Brevo → SMTP & API → API Keys |
| `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` (opcional) | Aviso de lead | @BotFather |

### Propriedades HubSpot usadas (contato)
`nicho` (estetica, odontologia, harmonizacao, nutricao, fisioterapia_saude, beleza, outro_alto_padrao) · `score_presenca` · `faixa_fit` (quente/morno/frio) · `principal_dor` · `origem_lead` (`quiz`, `whatsapp`, `indicacao` ou `agenda` só quando a origem é exatamente essa; contato e as demais ficam em branco, sem fallback `agenda`) · `utm_source/medium/campaign/content/term` · `fbclid` · `nome_negocio` · `status_agendamento` (nao_agendado, agendado, reagendado, realizado, nao_compareceu, cancelado).

## Depende do Marcos / plano pago
- **Brevo**: a conta Brevo conectada tem apenas o remetente “Equipe Felinus <felinus@saudefelina.org>”. Para enviar como Prime Studio é preciso criar e validar um remetente/domínio (ex.: contato@devbrasil.online, com DKIM/DMARC). Nenhum e-mail ou campanha foi enviado.

## Endpoints
- `POST /api/lead` — lead do quiz e da página de contato (KV + índice `idx:em:` / `idx:wa:` + HubSpot + Brevo + Telegram). Com `event_id`, envia o CAPI `Lead` para deduplicar com o Pixel.
- `POST /api/capi` — Conversions API dos eventos que não são Lead (resposta `inativo` sem token). Não aceita `Schedule`.
- `GET /api/lead?key=ADMIN_KEY` — lista leads (se `ADMIN_KEY` existir).
