export function pageDocument() {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>Presença — Central do Cliente</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/tokens.css">
<link rel="stylesheet" href="/presenca/presenca.css">
</head>
<body>
<div class="wrap">
  <header class="top">
    <a class="logo" href="/">PRIME<span>STUDIO</span></a>
    <a class="back" href="/">Central</a>
  </header>
  <main id="presenca" data-boot>
    <p class="loading">Abrindo a presença…</p>
  </main>
</div>
<script type="module" src="/presenca/client.js"></script>
</body>
</html>`;
}
