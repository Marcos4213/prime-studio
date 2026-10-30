-- Presença da clínica: endereços que a própria clínica anotou e o olhar do dia.
-- Não guarda métrica, faturamento, antes e depois nem dado de saúde.

CREATE TABLE IF NOT EXISTS presence_profile (
  client_id  TEXT PRIMARY KEY,
  site       TEXT NOT NULL DEFAULT '',
  instagram  TEXT NOT NULL DEFAULT '',
  google     TEXT NOT NULL DEFAULT '',
  bio        TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS presence_looks (
  client_id  TEXT NOT NULL,
  day        TEXT NOT NULL,
  site       INTEGER NOT NULL DEFAULT 0,
  instagram  INTEGER NOT NULL DEFAULT 0,
  google     INTEGER NOT NULL DEFAULT 0,
  bio        INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (client_id, day),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);
