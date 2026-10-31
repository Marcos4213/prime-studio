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
  { key: "provas", label: "Provas e autoridade. A contagem de pacientes não entra na legenda, no anúncio, na imagem nem na mensagem.", max: 400 },
];

const NICHO = new Set(["saude", "estetica", "bem-estar", "odonto"]);

export function knownNiche(raw) {
  const value = clean(raw, 20).toLowerCase();
  if (value === "odontologia") return "odonto";
  if (value === "bem estar" || value === "bem_estar" || value === "bemestar") return "bem-estar";
  if (value === "saúde") return "saude";
  return NICHO.has(value) ? value : "";
}

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
      out.nicho = knownNiche(src.nicho);
      continue;
    }
    out[field.key] = clean(src[field.key], field.max);
  }
  out.tema_amanha = clean(src.tema_amanha, 140);
  return out;
}

export function mergeClinicProfile(base, patch) {
  const next = sanitizeClinicProfile(base);
  const storedNiche = clean(base?.nicho, 20);
  if (storedNiche && !next.nicho) next.nicho = storedNiche;
  if (!patch || typeof patch !== "object") return next;
  for (const field of PROFILE_FIELDS) {
    if (field.key === "nicho") continue;
    if (!Object.prototype.hasOwnProperty.call(patch, field.key)) continue;
    next[field.key] = sanitizeClinicProfile({ [field.key]: patch[field.key] })[field.key];
  }
  if (Object.prototype.hasOwnProperty.call(patch, "nicho")) {
    const known = knownNiche(patch.nicho);
    const incoming = clean(patch.nicho, 20);
    if (known) next.nicho = known;
    else if (!incoming) next.nicho = "";
    else if (incoming.toLowerCase() === storedNiche.toLowerCase()) next.nicho = storedNiche;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "tema_amanha")) {
    next.tema_amanha = clean(patch.tema_amanha, 140);
  }
  return next;
}

function brandBits(brand) {
  const colors = Array.isArray(brand?.colors) && brand.colors.some((item) => String(item || "").trim());
  const fonts = Array.isArray(brand?.fonts) && brand.fonts.some((item) => String(item || "").trim());
  const tone = String(brand?.tone || "").trim().length > 0;
  return [colors, fonts, tone].filter(Boolean).length;
}

export function completeness(profile, brand) {
  const clinic = PROFILE_FIELDS.filter((field) => String(profile?.[field.key] || "").trim()).length;
  const total = PROFILE_FIELDS.length + 3;
  const filled = clinic + brandBits(brand);
  return { filled, total, percent: total ? Math.round((filled / total) * 100) : 0 };
}

export function publicClinic(record, brand) {
  const profile = record?.profile || emptyClinicProfile();
  return {
    profile,
    version: record?.version || 0,
    created_at: record?.created_at || null,
    stored: record?.stored !== false,
    completeness: completeness(profile, brand),
  };
}

function missingTable(err) {
  return /no such table/i.test(String(err?.message || err));
}

function rowToProfile(row) {
  const profile = sanitizeClinicProfile(row || {});
  const stored = clean(row?.nicho, 20);
  if (stored && !profile.nicho) profile.nicho = stored;
  return profile;
}

export async function readBrandProfile(env, clientId) {
  const empty = { colors: [], fonts: [], tone: "", avoid: "", highlights: "" };
  try {
    const row = await env.DB.prepare(
      "SELECT colors, fonts, tone, avoid, highlights FROM brand_profiles WHERE client_id = ?"
    )
      .bind(clientId)
      .first();
    if (!row) return empty;
    return {
      colors: parseJsonArr(row.colors),
      fonts: parseJsonArr(row.fonts),
      tone: row.tone || "",
      avoid: row.avoid || "",
      highlights: row.highlights || "",
    };
  } catch (err) {
    if (missingTable(err)) return empty;
    throw err;
  }
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
  const brand = await readBrandProfile(env, client.id);
  return { clinic, profile: aiProfile(brand, clinic, client) };
}
