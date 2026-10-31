// Autenticação do cliente: senha com PBKDF2 (Web Crypto) e sessões opacas no D1.
// Nenhum secret no código. O token de sessão é aleatório e validado no banco.
import { nowIso, timingSafeEqual, uid } from "./http.js";

const PBKDF2_ITERATIONS = 100000;

function bytesToHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

export async function hashPassword(password, saltHex) {
  const enc = new TextEncoder();
  const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    key,
    256
  );
  return { hash: bytesToHex(new Uint8Array(bits)), salt: bytesToHex(salt) };
}

export async function verifyPassword(password, saltHex, expectedHash) {
  const { hash } = await hashPassword(password, saltHex);
  return timingSafeEqual(hash, expectedHash);
}

export function newSessionToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToHex(bytes);
}

export async function createSession(env, clientId, ttlHours) {
  const token = newSessionToken();
  const created = new Date();
  const expires = new Date(created.getTime() + ttlHours * 3600 * 1000);
  await env.DB.prepare(
    "INSERT INTO sessions (token, client_id, created_at, expires_at) VALUES (?, ?, ?, ?)"
  )
    .bind(token, clientId, created.toISOString(), expires.toISOString())
    .run();
  return { token, expiresAt: expires.toISOString() };
}

// Resolve a sessão do cookie num cliente, limpando se expirada.
export async function getClientFromSession(env, token) {
  if (!token) return null;
  const row = await env.DB.prepare(
    `SELECT c.id, c.email, c.name, c.nicho, c.access_until, s.expires_at
       FROM sessions s JOIN clients c ON c.id = s.client_id
      WHERE s.token = ?`
  )
    .bind(token)
    .first();
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await destroySession(env, token);
    return null;
  }
  return { id: row.id, email: row.email, name: row.name, nicho: row.nicho, access_until: row.access_until };
}

export async function destroySession(env, token) {
  if (!token) return;
  await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
}

// Cria um cliente (bootstrap/admin). Retorna o id.
export async function createClient(env, { email, name, nicho, password }) {
  const { hash, salt } = await hashPassword(password);
  const id = uid("cli");
  await env.DB.prepare(
    "INSERT INTO clients (id, email, name, nicho, pass_hash, pass_salt, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(id, email.toLowerCase(), name, nicho || null, hash, salt, nowIso())
    .run();
  return id;
}
