# Clientes

Pasta interna da Prime Studio. Não é página do site e não entra no output do Cloudflare Pages.

O Cloudflare Pages publica `dist/`, gerado por `node tools/prepare-pages-output.mjs`. Esse script não copia `clientes/`. O deploy é `wrangler pages deploy dist --project-name prime-studio`, e só com o OK do Marcos. Não fazer deploy da raiz.

O GitHub Pages legacy também publica a branch `main`. O `_config.yml` na raiz exclui `clientes/` no Jekyll. Não recriar `.nojekyll`.

## Abrir um cliente novo

Copie o modelo. Não preencha o modelo: ele fica só com placeholders.

```
cp -a clientes/_modelo clientes/<slug>
```

Troque `<slug>` por um identificador curto da clínica, sem espaço e sem dado sensível. Não copie por cima de `clientes/_modelo`. Não crie a pasta de um cliente real enquanto o Marcos não pedir.

Preencha os arquivos só com o que a clínica informou. Não invente faturamento, avaliação, audiência, resultado nem dado de saúde. Não grave token, senha nem outro secret.

## O que tem no modelo

O checklist segue o Método PRIME: Perfil, Reputação, Imagem, Marca no site, Escala.

- `briefing.md`
- `checklist-onboarding.md`
- `entregaveis/site.md`
- `entregaveis/instagram.md`
- `entregaveis/google.md`
- `entregaveis/link-na-bio.md`
- `tracking.md`
- `relatorio-mensal.md`
- `contrato.md`
- `comprovantes.md`
- `aceite.md`

## Ordem da entrega

Contrato, comprovante, onboarding, produção, aceite, relatório.

1. Contrato — `contrato.md`
2. Comprovante — `comprovantes.md`
3. Onboarding — `briefing.md` e `checklist-onboarding.md`
4. Produção — `entregaveis/` na ordem do Método PRIME
5. Aceite — `aceite.md`
6. Relatório — `relatorio-mensal.md`
