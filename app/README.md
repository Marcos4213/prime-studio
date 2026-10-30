# Central do Cliente — app (MVP Fases 0-2)

Produto do cliente da Prime Studio: uma central com o **estúdio de post com IA** no centro.
App + API em **Cloudflare Workers**, banco em **D1**, **R2** reservado para o banco de vídeos (Fase 5).

Separado do site de marketing (que é Pages, na raiz do repo). Conceito: `docs/central-do-cliente.md` no Project.

> **Não fazer deploy sem o OK do Marcos.** Nenhum secret no código: chaves só via ambiente.

## O que entra neste MVP
- Casca com **login** do cliente (sessão em cookie, validada no D1), **primeiro acesso** curto e menu das frentes.
- **Menu:** `features/load.js` lê `features/<frente>/feature.json` (`title`, `href`, `order`) e a casca monta a navegação. Cada frente mantém o próprio `feature.json`. O primeiro segmento do `href` abre a seção da casca quando ela já existe (`/estudio`, `/marca`, `/historico`); um caminho novo fica no menu até a tela da frente existir.
- **Estúdio**: escolha de formato (post, carrossel, vídeo) → tema → peça montada no tom da clínica.
- **Perfil de marca** por cliente (cores, fontes, tom, o que evitar, destaques) — a memória da marca.
- **Histórico** do que foi gerado, por cliente. Nada publica sozinho (status `rascunho` → `aprovado`, ação humana).
- IA numa rota de API que lê a chave do ambiente; **sem chave, responde um exemplo (mock)**, para rodar sem publicar.

## Arquitetura
- `src/index.js` — Worker: roteia `/api/*` e serve o front (`public/`) via binding `ASSETS`.
- `src/lib/http.js` — helpers HTTP, cookies, comparação em tempo constante.
- `src/lib/auth.js` — senha PBKDF2 (Web Crypto) + sessões opacas no D1.
- `src/lib/ai.js` — geração (IA real OpenAI-compatível ou mock) + guarda de regras de marca.
- `public/` — SPA (HTML/CSS/JS, sem build), mobile compacto. A cor fica só em `public/assets/tokens.css` (paleta provisória, não aprovada). As frentes usam os nomes `--color-bg`, `--color-surface`, `--color-surface-2`, `--color-text`, `--color-muted`, `--color-accent`, `--color-accent-text`, `--color-line`, `--color-danger`.
- `migrations/0001_init.sql` — schema do D1.

## Bindings (wrangler.toml)
- `DB` — D1 (`clients`, `sessions`, `brand_profiles`, `pieces`, `referrals`).
- `VIDEOS` — R2, **reservado** para o banco de vídeos (ainda não usado em código).
- `ASSETS` — front estático.
- Vars não-secretas: `AI_BASE_URL`, `AI_MODEL`, `SESSION_TTL_HOURS`.

## Rodar local (sem publicar)
```bash
cd app
npm install
npx wrangler d1 create prime-central        # preenche database_id no wrangler.toml
npm run db:migrate:local                     # aplica o schema no D1 local
cp .dev.vars.example .dev.vars               # opcional: preencher AI_API_KEY e ADMIN_KEY
npm test                                      # menu das frentes
npm run dev                                   # http://localhost:8787 (grava o menu e sobe o worker; não publica)
```
Sem `AI_API_KEY`, o estúdio gera um exemplo (mock). Com a chave, gera de verdade.

### Criar o primeiro cliente (bootstrap)
A rota de admin só liga com `ADMIN_KEY` no ambiente (senão responde 404).
```bash
curl -X POST http://localhost:8787/api/admin/clients \
  -H "x-admin-key: $ADMIN_KEY" -H "content-type: application/json" \
  -d '{"email":"voce@clinica.com","name":"Clínica Exemplo","nicho":"estetica","password":"trocar-depois"}'
```
Depois é só entrar pela tela de login com esse e-mail e senha.

## Regras de marca (aplicadas ao que a IA gera)
Sem promessa de faturamento, sem antes e depois, sem dado de saúde, sem número inventado.
Nada publica sozinho. Chaves de IA só em variável de ambiente (`.dev.vars` local ou `wrangler secret put` em produção).

## O que falta para publicar
Ver a seção "O que falta para publicar" no PR / resumo. Em resumo: criar os recursos (D1, R2) e
setar os secrets (`AI_API_KEY`, `ADMIN_KEY`) com `wrangler secret put`, aplicar as migrações no remoto,
e só então `wrangler deploy` — **com o OK do Marcos**.
