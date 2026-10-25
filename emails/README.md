# Templates de e-mail (fluxo de ligação)

Fluxo atual: a paciente faz o Raio-X, o lead entra no HubSpot e o nosso time liga em até 30 minutos (horário comercial). Sem agenda, sem link de reunião.

Cole o HTML no editor de e-mail do HubSpot (ou envie manualmente). `{{ contact.firstname }}` é o token de primeiro nome do HubSpot.

| Arquivo | Quando enviar | Assunto |
|---|---|---|
| confirmacao.html | Assim que o lead entra | Recebemos seu Raio-X, {{ contact.firstname }} |
| tentativa-ligacao.html | Depois de uma ligação não atendida | {{ contact.firstname }}, tentamos te ligar |
| apos-ligacao.html | Depois da ligação de diagnóstico | Seu diagnóstico Prime Studio, {{ contact.firstname }} |
| retomada.html | 3 dias sem conseguir falar | {{ contact.firstname }}, vamos retomar o seu diagnóstico? |
