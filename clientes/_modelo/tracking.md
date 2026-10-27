# Tracking do cliente

Não grave token, senha nem dado sensível. Não invente id de pixel.

## Deste cliente

- Pixel: [preencher]
- Onde está instalado: [preencher]
- O que já dispara: [preencher]

## Padrão da agência

Deduplicação por `event_id`. Sem dado sensível. Boas práticas oficiais da Meta.

Eventos:

- `PageView`
- `ViewContent`
- `Lead`
- `SubmitApplication`, somente para lead qualificado
- `Contact`
- `QuizStart`, evento customizado

O pixel do site da Prime Studio está em `AGENTS.md` e no repositório `prime-studio-tracking`. Não copiar esse id para cá, a menos que o Marcos confirme que a campanha desta clínica usa o pixel da agência.
