// Telas da casca (Início e Leads) vivem no index.html: recarregar não pode dar 404.
export const SHELL_PATHS = new Set(["/hoje", "/hoje/", "/leads", "/leads/"]);
export function isShellPath(path) { return SHELL_PATHS.has(path); }
export function shellIndexRequest(request) {
  const url = new URL(request.url);
  url.pathname = "/";
  url.search = "";
  return new Request(url.toString(), { method: "GET", headers: request.headers });
}
