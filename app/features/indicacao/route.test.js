import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { handleIndicacao } from "./route.js";
import { gateHtml, pageHtml } from "./page.js";

function visible(html) {
  return html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<script[\s\S]*?<\/script>/g, "");
}

function db(referrals) {
  const sqls = [];
  return {
    sqls,
    prepare(sql) {
      sqls.push(sql);
      const state = { sql, binds: [] };
      const api = {
        bind(...args) {
          state.binds = args;
          return api;
        },
        async all() {
          const clientId = state.binds[0];
          return { results: referrals.filter((r) => r.referrer_client_id === clientId) };
        },
        async first() {
          if (state.sql.includes("FROM sessions")) {
            const token = state.binds[0];
            if (token !== "ok") return null;
            return {
              id: "cli_serra",
              email: "serra@clinica.com",
              name: "Clínica Serra",
              nicho: "estetica",
              access_until: null,
              expires_at: new Date(Date.now() + 3600_000).toISOString(),
            };
          }
          return null;
        },
        async run() {
          if (state.sql.startsWith("INSERT INTO referrals")) {
            referrals.push({
              id: state.binds[0],
              referrer_client_id: state.binds[1],
              referred_name: state.binds[2],
              referred_contact: state.binds[3],
              referrer_type: state.binds[4],
              status: "novo",
              created_at: state.binds[5],
            });
          }
          return { meta: { changes: 1 } };
        },
      };
      return api;
    },
  };
}

function req(path, { method = "GET", cookie = "", body } = {}) {
  return new Request("https://central.test" + path, {
    method,
    headers: {
      cookie,
      "content-type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

test("página sem sessão explica os dois lados e pede entrada", () => {
  const html = gateHtml();
  assert.match(html, /Indique uma clínica/);
  assert.match(html, /Quem indica ganha/);
  assert.match(html, /Entrar na central/);
  assert.match(html, /60 dias/);
  assert.match(html, /15%/);
  assert.match(html, /sala\.webp/);
  assert.equal(/faturamento|R\$|meses/.test(visible(html)), false);
  assert.doesNotMatch(html, /id="indForm"/);
});

test("página logada traz o fluxo e não inventa valor", () => {
  const html = pageHtml("Clínica Serra");
  assert.match(html, /Indicar esta clínica/);
  assert.match(html, /60 dias/);
  assert.match(html, /15%/);
  assert.match(html, /overflow-x:hidden/);
  assert.match(html, /Clínica Serra/);
  assert.equal(/faturamento|R\$|meses/.test(visible(html)), false);
  assert.match(html, /minmax\(0,1fr\) minmax\(0,1fr\)/);
  assert.doesNotMatch(html, /class="e"/);
  assert.doesNotMatch(html, /minmax\(0,1fr\) auto/);
  assert.match(html, /\[hidden\]\{display:none !important\}/);
  assert.match(html, /\/assets\/tokens\.css/);
  assert.equal(/#[0-9a-fA-F]{3,8}/.test(html), false);
  assert.match(html, /var\(--color-bg\)/);
  assert.match(html, /var\(--color-accent\)/);
  assert.doesNotMatch(pageHtml("</script><img src=x>"), /<\/script><img/);
});

test("foto, script e indicação ficam isolados por cliente", async () => {
  const referrals = [
    {
      id: "ind_outra",
      referrer_client_id: "cli_outra",
      referred_name: "Não pode aparecer",
      referred_contact: "11911112222",
      referrer_type: "cliente",
      status: "novo",
      created_at: "2026-10-01T00:00:00.000Z",
    },
  ];
  const env = { DB: db(referrals) };
  const photo = await handleIndicacao(req("/indicacao/media/sala.webp"), env, new URL("https://central.test/indicacao/media/sala.webp"));
  assert.equal(photo.headers.get("content-type"), "image/webp");
  const bytes = new Uint8Array(await photo.arrayBuffer());
  assert.equal(String.fromCharCode(...bytes.subarray(0, 4)), "RIFF");

  const anon = await handleIndicacao(req("/indicacao"), env, new URL("https://central.test/indicacao"));
  assert.match(await anon.text(), /Entrar na central/);

  const page = await handleIndicacao(
    req("/indicacao", { cookie: "central_session=ok" }),
    env,
    new URL("https://central.test/indicacao")
  );
  assert.match(await page.text(), /Clínica Serra/);

  const denied = await handleIndicacao(req("/api/indicacao"), env, new URL("https://central.test/api/indicacao"));
  assert.equal(denied.status, 401);

  const created = await handleIndicacao(
    req("/api/indicacao", {
      method: "POST",
      cookie: "central_session=ok",
      body: { referred_name: "Clínica Aurora", referred_contact: "(11) 98888-7777", referrer_type: "profissional" },
    }),
    env,
    new URL("https://central.test/api/indicacao")
  );
  const payload = await created.json();
  assert.equal(created.status, 200);
  assert.equal(payload.item.status, "novo");
  assert.equal(payload.item.referrer_type, "profissional");
  assert.equal(payload.whatsapp.includes("wa.me/5511988887777"), true);
  assert.equal(/faturamento|[0-9]{2,}|%|meses/.test(payload.share), false);

  const list = await handleIndicacao(
    req("/api/indicacao", { cookie: "central_session=ok" }),
    env,
    new URL("https://central.test/api/indicacao")
  );
  const data = await list.json();
  assert.equal(data.items.length, 1);
  assert.equal(data.items[0].referred_name, "Clínica Aurora");
  assert.equal(data.rewards.cliente.indicador.dias, 60);
  assert.equal(data.rewards.cliente.indicado.percentual, 15);
  assert.equal(data.rewards.profissional.indicador.valor, null);
  assert.equal(data.rewards.profissional.indicador.comissao_dinheiro, false);
  assert.equal(env.DB.sqls.some((sql) => /^\s*UPDATE/i.test(sql)), false);
});

test("tokens.css fecha Petróleo Clínico no modo claro e não avisa paleta provisória", () => {
  const tokens = readFileSync(new URL("../../public/assets/tokens.css", import.meta.url), "utf8");
  assert.doesNotMatch(tokens, /PALETA PROVISÓRIA/);
  const light = tokens.split("@media")[0];
  assert.match(light, /--color-bg: #F7F5F0;/);
  assert.match(light, /--color-surface: #FFFFFF;/);
  assert.match(light, /--color-surface-2: #F7F5F0;/);
  assert.match(light, /--color-text: #1A2328;/);
  assert.match(light, /--color-primary: #0F4C5C;/);
  assert.match(light, /--color-on-primary: #FFFFFF;/);
  assert.match(light, /--color-success: #2E7D5B;/);
  assert.match(light, /--color-gold: #B08D57;/);
  assert.match(light, /--color-accent: var\(--color-primary\);/);
  assert.match(light, /--color-accent-text: var\(--color-on-primary\);/);
  assert.match(tokens, /prefers-color-scheme: dark/);
  assert.match(tokens, /--color-accent: var\(--color-gold\);/);
  assert.match(tokens, /--color-accent-text: #1A2328;/);
  assert.match(tokens, /--color-text: #F7F5F0;/);
  assert.equal(gateHtml().includes("#"), false);
});

test("feature.json expõe title, href e order", () => {
  const feature = JSON.parse(readFileSync(new URL("./feature.json", import.meta.url), "utf8"));
  assert.deepEqual(Object.keys(feature).sort(), ["href", "order", "title"]);
  assert.equal(feature.title, "Indicação");
  assert.equal(feature.href, "/indicacao");
  assert.equal(feature.order, 70);
});
