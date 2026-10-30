-- Primeiro acesso da Central: a clínica conclui a entrada e, se quiser,
-- deixa o tema de conteúdo para voltar amanhã.
-- Não é dado de saúde, não é meta, não é número.

CREATE TABLE IF NOT EXISTS client_onboarding (
  client_id    TEXT PRIMARY KEY,
  completed_at TEXT NOT NULL,
  tema_amanha  TEXT,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);
