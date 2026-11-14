import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

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

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
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

const LEGACY_HOSTS = new Set(["geoverze.com", "www.geoverze.com", "www.gvrze.com"]);
const CANONICAL_HOST = "gvrze.com";

function redirectLegacyHost(request: Request): Response | null {
  if (request.method === "POST") return null;
  const host = (request.headers.get("host") ?? "").split(":")[0]?.toLowerCase() ?? "";
  if (!LEGACY_HOSTS.has(host)) return null;
  const dest = new URL(request.url);
  dest.protocol = "https:";
  dest.host = CANONICAL_HOST;
  dest.port = "";
  return Response.redirect(dest.toString(), 301);
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const legacyRedirect = redirectLegacyHost(request);
      if (legacyRedirect) return legacyRedirect;
      const url = new URL(request.url);
      if (request.method === "POST" && url.pathname === "/api/webhooks/razorpay") {
        const { handleRazorpayWebhookRequest } =
          await import("./lib/payments/razorpayWebhookHandler");
        return handleRazorpayWebhookRequest(request);
      }
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
