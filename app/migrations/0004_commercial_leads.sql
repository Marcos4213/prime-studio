-- Caderno comercial de leads. Só aditivo.
-- Sem dado de saúde, procedimento, queixa ou paciente.
-- Não aplicar no D1 de produção sem o OK do Marcos.
-- Não apaga, não reescreve e não atualiza linha existente.

CREATE TABLE IF NOT EXISTS commercial_leads (
  id              TEXT PRIMARY KEY,
  client_id       TEXT NOT NULL,
  name            TEXT NOT NULL,
  contact         TEXT NOT NULL DEFAULT '',
  origin          TEXT NOT NULL DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'aberto',
  servico         TEXT NOT NULL DEFAULT '',
  valor_centavos  INTEGER,
  whatsapp        TEXT NOT NULL DEFAULT '',
  historico       TEXT NOT NULL DEFAULT '',
  contatos        TEXT NOT NULL DEFAULT '',
  ultimo_contato  TEXT,
  created_at      TEXT NOT NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_commercial_leads_client
  ON commercial_leads (client_id, created_at DESC);
