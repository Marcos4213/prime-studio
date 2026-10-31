import assert from "node:assert/strict";
import test from "node:test";
import { isShellPath, shellIndexRequest } from "./shell-routes.js";

test("início e leads recarregam o index da casca", () => {
  assert.equal(isShellPath("/hoje"), true);
  assert.equal(isShellPath("/hoje/"), true);
  assert.equal(isShellPath("/leads"), true);
  assert.equal(isShellPath("/leads/"), true);
  assert.equal(isShellPath("/"), false);
  assert.equal(isShellPath("/api/leads"), false);
  assert.equal(isShellPath("/api/hoje"), false);
  assert.equal(isShellPath("/leadsx"), false);
  assert.equal(isShellPath("/estudio"), false);

  const next = shellIndexRequest(new Request("https://central.example/leads/?origem=1"));
  const url = new URL(next.url);
  assert.equal(url.pathname, "/");
  assert.equal(url.search, "");
  assert.equal(next.method, "GET");
});
