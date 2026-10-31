-- Perfil da clínica versionado (treino da IA).
-- Só aditivo: cria a tabela de versões. Não apaga nem altera dados existentes.
-- Não aplicar no D1 de produção sem o OK do Marcos.

CREATE TABLE IF NOT EXISTS clinic_profile_versions (
  id              TEXT PRIMARY KEY,
  client_id       TEXT NOT NULL,
  version         INTEGER NOT NULL,
  nicho           TEXT,
  especialidades  TEXT,
  procedimentos   TEXT,
  publico         TEXT,
  diferenciais    TEXT,
  tom             TEXT,
  cidade          TEXT,
  objetivos       TEXT,
  objecoes        TEXT,
  provas          TEXT,
  tema_amanha     TEXT,
  created_at      TEXT NOT NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  UNIQUE (client_id, version)
);

CREATE INDEX IF NOT EXISTS idx_clinic_profile_versions_client
  ON clinic_profile_versions (client_id, version DESC);
