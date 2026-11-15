import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import {
  SupabaseConfigError,
  formatSupabaseEnvDiagnosticsForLog,
  getSupabaseEnvDiagnostics,
} from "./lib/supabase/env";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

function applyRuntimeBindings(bindings: unknown): void {
  if (!bindings || typeof bindings !== "object") return;
  for (const [key, value] of Object.entries(bindings as Record<string, unknown>)) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!trimmed) continue;
    if (typeof process !== "undefined" && process.env && !process.env[key]) {
      process.env[key] = trimmed;
    }
  }
}

function logSsrFailure(error: unknown): void {
  if (error instanceof SupabaseConfigError) {
    console.error(
      `[admin:ssr] ${error.message}`,
      error.diagnostics
        ? formatSupabaseEnvDiagnosticsForLog(error.diagnostics)
        : formatSupabaseEnvDiagnosticsForLog(getSupabaseEnvDiagnostics()),
    );
    return;
  }
  console.error(error);
  if (!isSupabaseEnvHealthy()) {
    console.error(
      `[admin:ssr] env check`,
      formatSupabaseEnvDiagnosticsForLog(getSupabaseEnvDiagnostics()),
    );
  }
}

function isSupabaseEnvHealthy(): boolean {
  const diagnostics = getSupabaseEnvDiagnostics();
  return diagnostics.missingRequired.length === 0;
}

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  const captured = consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`);
  logSsrFailure(captured);
  return new Response(renderErrorPage(captured), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    applyRuntimeBindings(env);
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      logSsrFailure(error);
      return new Response(renderErrorPage(error), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
