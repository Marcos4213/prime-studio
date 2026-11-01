# Templates de e-mail

Fluxo atual: a clínica faz o Raio-X ou deixa os dados em /contato, o lead entra no HubSpot e o nosso time entra em contato. Estes e-mails não prometem horário de retorno. Depois do fechamento, Google, site, link na bio, Instagram com 3 posts e display com QR ficam prontos em até 7 dias. Os 90 dias seguintes são só acompanhamento de ajustes.

Cole o HTML no editor de e-mail do HubSpot (ou envie manualmente). `{{ contact.firstname }}` é o token de primeiro nome do HubSpot.

| Arquivo | Quando enviar | Assunto |
|---|---|---|
| confirmacao.html | Assim que o lead entra | Recebemos seu Raio-X, {{ contact.firstname }} |
| tentativa-ligacao.html | Depois de uma tentativa sem resposta | {{ contact.firstname }}, o nosso time tentou falar com você |
| apos-ligacao.html | Depois da conversa de diagnóstico | Seu diagnóstico Prime Studio, {{ contact.firstname }} |
| retomada.html | 3 dias sem conseguir falar | {{ contact.firstname }}, vamos retomar o seu diagnóstico? |
