# Prime Studio — README interno (v9)

Site: https://prime.devbrasil.online · Cloudflare Pages `prime-studio` · KV `LEADS`.

## O que está ATIVO
| Item | Detalhe |
|---|---|
| Cal.com evento | `Diagnóstico de Presença — Prime Studio` (id 7616795) · https://cal.com/marcos-paulo-wpugxh/diagnostico · 30 min · Google Meet · buffer 10 min · antecedência 2h · janela 14 dias · pt-BR · nome do evento `Diagnóstico Prime Studio — {Scheduler}` |
| Disponibilidade | Schedule 2545007: seg–sáb 09h–18h (America/Sao_Paulo). `CONFIG.HORARIO` no app.js igual. |
| Embed | Botão “Escolher horário do diagnóstico” + `?agenda`/`#agenda`. Prefill do quiz + metadata (nicho, nicho_key, score, dor, faixa, nivel, origem, lead_id, UTMs, fbclid, fbc, fbp). Após agendar → `/confirmado.html?n=&t=&u=`. |
| Webhook Cal.com | id `0555e542…` → `POST /api/calcom` (CREATED, RESCHEDULED, CANCELLED, NO_SHOW_UPDATED, MEETING_ENDED). Assinatura HMAC com `CALCOM_WEBHOOK_SECRET` (já configurado no Pages). Atualiza o lead no KV: `agendado/remarcado/cancelado/no_show/realizado`. |
| Atribuição | UTMs, fbclid, gclid, referrer (first/last touch em localStorage `prime_attr`), cookies `_fbc` (criado a partir do fbclid) e `_fbp`. Enviados com o lead, no KV e nos metadados do booking. |
| Brevo (estrutura) | Pasta “Prime Studio” (32), lista “Prime Studio — Leads” (**id 33**, env `BREVO_LIST_ID=33` já setada). Atributos: NOME, WHATSAPP (já existiam), NEGOCIO, NICHO, SCORE, DOR, FAIXA, STATUS, ORIGEM, UTM_SOURCE, UTM_MEDIUM, UTM_CAMPAIGN, DATA_DIAGNOSTICO. |

## O que falta ATIVAR (Cloudflare → Pages → prime-studio → Settings → Variables and secrets, tipo *Secret*, depois novo deploy)
| Env | Ativa | Onde pegar |
|---|---|---|
| `META_PIXEL_ID` (no **app.js** `CONFIG.META_PIXEL_ID` **e** no Pages) | Pixel: PageView, ViewContent por seção, QuizStart, QuizStep, Lead, CompleteRegistration, Contact, InitiateCheckout, Schedule — todos com `event_id` (dedup) e Advanced Matching (em/ph SHA-256) | Gerenciador de Eventos da Meta |
| `META_CAPI_TOKEN` (+ opcional `META_TEST_EVENT_CODE`) | `/api/capi` espelha os eventos do navegador; `/api/calcom` envia `Schedule` server-side com `event_id=sched_<uid>` (mesmo id do navegador) | Gerenciador de Eventos → Configurações → Conversions API → Gerar token |
| `HUBSPOT_PRIVATE_TOKEN` (**ATIVO desde 23/10, testado e limpo**) | Upsert de contato por e-mail + deal (pipeline `default`). Quiz → estágio *Lead do quiz* (1467547048); booking → *Diagnóstico agendado* (1467547050), sem regredir estágio. | HubSpot → Configurações → Integrações → Apps privados (escopos: crm.objects.contacts.write/read, crm.objects.deals.write/read) |
| `BREVO_API_KEY` | `/api/lead` e `/api/calcom` fazem upsert do contato na lista 33 com STATUS | Brevo → SMTP & API → API Keys |
| `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` (opcional) | Aviso de lead e de agendamento/cancelamento | @BotFather |

### Propriedades HubSpot usadas (contato)
`nicho` (estetica, odontologia, harmonizacao, nutricao, fisioterapia_saude, beleza, outro_alto_padrao) · `score_presenca` · `faixa_fit` (quente/morno/frio) · `principal_dor` · `origem_lead` (quiz/whatsapp/agenda/indicacao) · `utm_source/medium/campaign/content/term` · `fbclid` · `nome_negocio` · `status_agendamento` (nao_agendado, agendado, reagendado, realizado, nao_compareceu, cancelado).

## Depende do Marcos / plano pago
- **Confirmar sábado** 9h–18h (Cal schedule 2545007 / `HORARIO`).
- **Workflows do Cal.com** (confirmação, lembrete 24h, 1h, no-show) não existem na API v2 para contas individuais e exigem plano pago (Teams). Templates prontos em `emails/` — colar em Cal.com → Workflows.
- **Redirect pós-booking nativo** (`successRedirectUrl`) é recurso do plano Teams: a API recusou. Contornado: o embed redireciona para `/confirmado.html` via evento `bookingSuccessful`. Pelo link direto do cal.com, o participante fica na tela de sucesso do Cal.
- **Remover a marca Cal.com** do embed: plano pago.
- **Brevo**: a conta Brevo conectada tem apenas o remetente “Equipe Felinus <felinus@saudefelina.org>”. Para enviar como Prime Studio é preciso criar e validar um remetente/domínio (ex.: contato@devbrasil.online, com DKIM/DMARC). Nenhum e-mail ou campanha foi enviado.

## Endpoints
- `POST /api/lead` — lead do quiz (KV + índice `idx:em:` / `idx:wa:` + HubSpot + Brevo + Telegram).
- `POST /api/calcom` — webhook do Cal.com.
- `POST /api/capi` — Conversions API (resposta `inativo` sem token).
- `GET /api/lead?key=ADMIN_KEY` — lista leads (se `ADMIN_KEY` existir).
