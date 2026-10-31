-- Central do Cliente — schema inicial (MVP, Fases 0-2 do roadmap).
-- Banco por cliente: clientes, perfil de marca, histórico do estúdio, indicações.
-- Sem dado de saúde, sem paciente. Nenhum secret aqui.

CREATE TABLE IF NOT EXISTS clients (
  id           TEXT PRIMARY KEY,
  email        TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  nicho        TEXT,                       -- estetica | odontologia | saude | outro
  pass_hash    TEXT NOT NULL,              -- PBKDF2-SHA256 (hex). Nunca a senha em claro.
  pass_salt    TEXT NOT NULL,              -- salt (hex)
  access_until TEXT,                       -- ISO8601: tempo de central (recorrência/indicação)
  created_at   TEXT NOT NULL
);

-- Sessões opacas: token aleatório validado no banco (sem secret de assinatura).
CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  client_id  TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sessions_client ON sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- Memória da marca (branding do lead): cores, fontes, tom. Alimenta a IA.
CREATE TABLE IF NOT EXISTS brand_profiles (
  client_id  TEXT PRIMARY KEY,
  colors     TEXT,                         -- JSON: ["#0b0a08", "#c8a25a", ...]
  fonts      TEXT,                         -- JSON: ["Cormorant Garamond", "Inter"]
  tone       TEXT,                         -- descrição do tom da clínica
  avoid      TEXT,                         -- o que a clínica nunca diz
  highlights TEXT,                         -- o que a destaca no nicho
  updated_at TEXT NOT NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Histórico do que o estúdio gerou. Nada publica sozinho: status começa em 'rascunho'.
CREATE TABLE IF NOT EXISTS pieces (
  id         TEXT PRIMARY KEY,
  client_id  TEXT NOT NULL,
  format     TEXT NOT NULL,                -- post | carousel | video
  theme      TEXT,
  output     TEXT NOT NULL,               -- JSON do que foi montado (texto, prompts, roteiro)
  source     TEXT NOT NULL,               -- ia | mock
  status     TEXT NOT NULL DEFAULT 'rascunho',  -- rascunho | aprovado
  created_at TEXT NOT NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_pieces_client ON pieces(client_id, created_at DESC);

-- Indicações (estrutura já prevista; Fase 6 usa de fato).
CREATE TABLE IF NOT EXISTS referrals (
  id                  TEXT PRIMARY KEY,
  referrer_client_id  TEXT NOT NULL,
  referred_name       TEXT,
  referred_contact    TEXT,
  referrer_type       TEXT NOT NULL DEFAULT 'cliente',  -- cliente | profissional
  status              TEXT NOT NULL DEFAULT 'novo',      -- novo | em_contato | fechado | sem_retorno
  created_at          TEXT NOT NULL,
  FOREIGN KEY (referrer_client_id) REFERENCES clients(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_referrals_ref ON referrals(referrer_client_id);
