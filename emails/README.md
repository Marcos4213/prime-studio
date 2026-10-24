# Templates de e-mail (Cal.com Workflows)

Cole o HTML em Cal.com → Workflows → ação "Enviar e-mail ao participante" (editor HTML). Variáveis no padrão do Cal.com.

| Arquivo | Gatilho | Assunto |
|---|---|---|
| confirmacao.html | Quando o evento é agendado | Confirmado: seu Diagnóstico Prime Studio em {EVENT_DATE_DD/MM} às {EVENT_TIME_HH:mm} |
| lembrete-24h.html | 24h antes do evento | Amanhã, {EVENT_TIME_HH:mm}: seu Diagnóstico Prime Studio |
| lembrete-1h.html | 1h antes do evento | Em 1 hora: Diagnóstico Prime Studio ({EVENT_TIME_HH:mm}) |
| no-show.html | Quando o participante não comparece (No-show) | {ATTENDEE_FIRST_NAME}, vamos remarcar seu diagnóstico? |