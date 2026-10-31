// Perfil da clínica versionado. Cada gravação acrescenta uma versão.
// A migração é só aditiva. Se a tabela ainda não existe, a leitura degrada
// e a gravação recusa — este módulo não cria tabela em produção.
import { clean, nowIso, uid } from "./http.js";

export const PROFILE_FIELDS = [
  { key: "nicho", label: "Nicho", max: 20 },
  { key: "especialidades", label: "Especialidades", max: 400 },
  { key: "procedimentos", label: "Procedimentos carro-chefe", max: 400 },
  { key: "publico", label: "Público ideal", max: 400 },
  { key: "diferenciais", label: "Diferenciais", max: 400 },
  { key: "tom", label: "Tom de voz", max: 400 },
  { key: "cidade", label: "Cidade", max: 80 },
  { key: "objetivos", label: "Objetivos", max: 400 },
  { key: "objecoes", label: "Objeções comuns", max: 400 },
  { key: "provas", label: "Provas e autoridade", max: 400 },
];

const NICHO = new Set(["estetica", "odonto"]);

export function emptyClinicProfile() {
  const out = { tema_amanha: "" };
  for (const field of PROFILE_FIELDS) out[field.key] = "";
  return out;
}

export function sanitizeClinicProfile(input) {
  const src = input && typeof input === "object" ? input : {};
  const out = emptyClinicProfile();
  for (const field of PROFILE_FIELDS) {
    if (field.key === "nicho") {
      const raw = clean(src.nicho, 20).toLowerCase();
      out.nicho = raw === "odontologia" ? "odonto" : NICHO.has(raw) ? raw : "";
      continue;
    }
    out[field.key] = clean(src[field.key], field.max);
  }
  out.tema_amanha = clean(src.tema_amanha, 140);
  return out;
}

export function mergeClinicProfile(base, patch) {
  const next = sanitizeClinicProfile(base);
  if (!patch || typeof patch !== "object") return next;
  for (const field of PROFILE_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(patch, field.key)) continue;
    next[field.key] = sanitizeClinicProfile({ [field.key]: patch[field.key] })[field.key];
  }
  if (Object.prototype.hasOwnProperty.call(patch, "tema_amanha")) {
    next.tema_amanha = clean(patch.tema_amanha, 140);
  }
  return next;
}

export function completeness(profile) {
  const total = PROFILE_FIELDS.length;
  const filled = PROFILE_FIELDS.filter((field) => String(profile?.[field.key] || "").trim()).length;
  return { filled, total, percent: total ? Math.round((filled / total) * 100) : 0 };
}

export function publicClinic(record) {
  const profile = record?.profile || emptyClinicProfile();
  return {
    profile,
    version: record?.version || 0,
    created_at: record?.created_at || null,
    stored: record?.stored !== false,
    completeness: completeness(profile),
  };
}

function missingTable(err) {
  return /no such table/i.test(String(err?.message || err));
}

function rowToProfile(row) {
  return sanitizeClinicProfile(row || {});
}

export async function readLatestClinicProfile(env, clientId) {
  try {
    const row = await env.DB.prepare(
      `SELECT id, version, nicho, especialidades, procedimentos, publico, diferenciais, tom, cidade, objetivos, objecoes, provas, tema_amanha, created_at
         FROM clinic_profile_versions
        WHERE client_id = ?
        ORDER BY version DESC
        LIMIT 1`
    )
      .bind(clientId)
      .first();
    if (!row) return { profile: emptyClinicProfile(), version: 0, created_at: null, stored: true };
    return { profile: rowToProfile(row), version: Number(row.version) || 0, created_at: row.created_at, stored: true };
  } catch (err) {
    if (missingTable(err)) return { profile: emptyClinicProfile(), version: 0, created_at: null, stored: false };
    throw err;
  }
}

export async function saveClinicProfileVersion(env, clientId, patch) {
  const current = await readLatestClinicProfile(env, clientId);
  if (!current.stored) {
    const err = new Error("perfil_indisponivel");
    err.code = "perfil_indisponivel";
    throw err;
  }
  const profile = mergeClinicProfile(current.profile, patch);
  const version = (current.version || 0) + 1;
  const id = uid("pfv");
  const created = nowIso();
  await env.DB.prepare(
    `INSERT INTO clinic_profile_versions
      (id, client_id, version, nicho, especialidades, procedimentos, publico, diferenciais, tom, cidade, objetivos, objecoes, provas, tema_amanha, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      clientId,
      version,
      profile.nicho,
      profile.especialidades,
      profile.procedimentos,
      profile.publico,
      profile.diferenciais,
      profile.tom,
      profile.cidade,
      profile.objetivos,
      profile.objecoes,
      profile.provas,
      profile.tema_amanha,
      created
    )
    .run();
  if (profile.nicho === "estetica" || profile.nicho === "odonto") {
    const legacy = profile.nicho === "odonto" ? "odontologia" : "estetica";
    await env.DB.prepare("UPDATE clients SET nicho = ? WHERE id = ?").bind(legacy, clientId).run();
  }
  return { profile, version, created_at: created, stored: true };
}

function parseJsonArr(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function aiProfile(brand, clinic, client) {
  const source = clinic?.profile || clinic || {};
  return {
    colors: brand?.colors || [],
    fonts: brand?.fonts || [],
    tone: source.tom || brand?.tone || "",
    avoid: brand?.avoid || "",
    highlights: source.diferenciais || brand?.highlights || "",
    nicho: source.nicho || client?.nicho || "",
    especialidades: source.especialidades || "",
    procedimentos: source.procedimentos || "",
    publico: source.publico || "",
    cidade: source.cidade || "",
    objetivos: source.objetivos || "",
    objecoes: source.objecoes || "",
    provas: source.provas || "",
    diferenciais: source.diferenciais || "",
    tom: source.tom || "",
  };
}

export async function loadGeneratorProfile(env, client) {
  const clinic = await readLatestClinicProfile(env, client.id);
  let brand = { colors: [], fonts: [], tone: "", avoid: "", highlights: "" };
  try {
    const row = await env.DB.prepare(
      "SELECT colors, fonts, tone, avoid, highlights FROM brand_profiles WHERE client_id = ?"
    )
      .bind(client.id)
      .first();
    if (row) {
      brand = {
        colors: parseJsonArr(row.colors),
        fonts: parseJsonArr(row.fonts),
        tone: row.tone || "",
        avoid: row.avoid || "",
        highlights: row.highlights || "",
      };
    }
  } catch (err) {
    if (!missingTable(err)) throw err;
  }
  return { clinic, profile: aiProfile(brand, clinic, client) };
}
