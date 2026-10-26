# Prime Studio — instruções para agentes

Referência autocontida para qualquer agente neste repositório. As cinco frentes estão também em `.cursor/rules/`, com `alwaysApply: true`:

- `.cursor/rules/site-e-funil.mdc`
- `.cursor/rules/trackeamento.mdc`
- `.cursor/rules/conteudos-e-criativos.mdc`
- `.cursor/rules/prospeccao-e-vendas.mdc`
- `.cursor/rules/clientes.mdc`

A Prime Studio é a agência de presença digital premium do Marcos Paulo para clínicas de estética, odontologia e saúde. O Marcos conduz o trabalho. A entrega é por pull request. Deploy, envio de mensagem e publicação só com o OK do Marcos.

## Método e posicionamento

O Método PRIME tem cinco passos: Perfil, Reputação, Imagem, Marca no site, Escala.

Site, Instagram, Google e link na bio formam uma presença só, que precisa ser entendida em 3 segundos. A oferta é presença digital integrada. A comunicação é presença digital agressiva, fala como "nosso time" ou "a gente", com tom premium e humanizado.

Fotos reais, de banco gratuito, coerentes com o nicho. Sem ilustração. No mobile o layout é compacto e sem rolagem horizontal. O visual da Prime Studio é escuro com dourado.

Fica de fora da comunicação:

- Promessa de faturamento.
- Antes e depois.
- Dado de saúde em anúncio.
- Número inventado.
- Disclaimer ou rótulo explicando bloco.

Não invente número nem dado de clínica. Não grave secret no código: secret só por variável de ambiente.

## Repositórios

Conta GitHub `Marcos4213`. Repositórios privados.

- `prime-studio` — este site. Páginas: home, `/raio-x`, `/links`, `/guia`. Funções: `/api/lead` e `/api/capi`. Site no ar: https://prime.devbrasil.online. Cloudflare Pages, projeto `prime-studio`.
- `prime-studio-tracking` — Meta Pixel, API de Conversões, HubSpot e playbook de otimização.
- `prime-studio-conteudos` — roteiros, criativos, Instagram e brandboard.
- `prime-studio-prospeccao` — prospecção, apresentação para clientes e roteiro de vendas.

## 1. Site e Funil

Regra: `.cursor/rules/site-e-funil.mdc`.

O funil não tem agenda nem calendário. O lead cai no HubSpot e o time entra em contato. O único botão opcional é o WhatsApp.

Em vídeo e anúncio, a fala é: "um especialista do nosso time analisa sua presença e entra em contato em instantes". As palavras "ligação" e "30 minutos" ficam fora de vídeo e anúncio. "Ligação" continua sendo o nome do estágio no HubSpot.

Os anúncios levam direto para `/raio-x`, com o quiz na primeira tela. O site longo serve para remarketing e tráfego orgânico.

## 2. Trackeamento Avançado

Regra: `.cursor/rules/trackeamento.mdc`. Repositório `prime-studio-tracking`.

Seguir as boas práticas oficiais da Meta. Deduplicação por `event_id`. Sem dado sensível.

Eventos padrão:

- `PageView`
- `ViewContent`
- `Lead`
- `SubmitApplication`, somente para lead qualificado
- `Contact`
- `QuizStart`, evento customizado

Pixel da Prime Studio: `997004479351209`.

## 3. Conteúdos e Criativos

Regra: `.cursor/rules/conteudos-e-criativos.mdc`. Repositório `prime-studio-conteudos`.

Roteiro, anúncio, Instagram e brandboard seguem o posicionamento, o visual e a lista do que fica de fora da comunicação. Em vídeo e anúncio, usar a fala do funil e deixar "ligação" e "30 minutos" de fora.

## 4. Prospecção e Vendas

Regra: `.cursor/rules/prospeccao-e-vendas.mdc`. Repositório `prime-studio-prospeccao`.

A ordem do playbook é: lista, abordagem, diagnóstico pelo `/raio-x`, qualificação, HubSpot, proposta.

A qualificação começa em R$ 30 mil de faturamento por mês. No HubSpot o estágio é "Ligação". O diagnóstico usa https://prime.devbrasil.online/raio-x.

## 5. Clientes

Regra: `.cursor/rules/clientes.mdc`.

O modelo reutilizável fica em `clientes/_modelo`, com briefing, checklist de onboarding do Método PRIME, entregáveis (site, Instagram, Google, link na bio), tracking por cliente e relatório mensal. `clientes/README.md` explica como abrir um cliente novo, copiando `clientes/_modelo`.

Não criar cliente real. Não inventar dado de clínica. A pasta `clientes/` fica fora do que o Cloudflare Pages publica.

## Publicação deste site

O Cloudflare Pages publica `dist/`, não a raiz. Gere o output com:

```
node tools/prepare-pages-output.mjs
wrangler pages deploy dist --project-name prime-studio
```

O script não copia `clientes/`. Não fazer deploy da raiz (`.`). Não fazer deploy sem o OK do Marcos.

O GitHub Pages legacy deste repositório publica a branch `main`. O `_config.yml` exclui `clientes/` no build do Jekyll. Não recriar `.nojekyll`: com ele, o Jekyll não roda e a exclusão deixa de valer.
