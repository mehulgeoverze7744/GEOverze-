/**
 * Try-On Studio — server-side AI adapter.
 *
 * Credentials live in server environment variables only. They are never sent
 * to the browser. Swap providers with TRYON_PROVIDER without changing the UI.
 *
 * Required:
 *   TRYON_API_KEY=<provider secret>
 *
 * Optional:
 *   TRYON_PROVIDER=fal | fashn     (default: fal)
 *   TRYON_MODEL_URL=<override URL>
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const DEFAULT_FAL_URL = "https://fal.run/fal-ai/cat-vton";
const DEFAULT_FASHN_URL = "https://api.fashn.ai/v1/run";
const FASHN_STATUS_URL = "https://api.fashn.ai/v1/status";

const TryOnInput = z.object({
  modelPhotoBase64: z.string().min(80).max(6_000_000),
  modelPhotoMime: z.enum(["image/jpeg", "image/png", "image/webp"]),
  garmentImageBase64: z.string().min(80).max(6_000_000),
  garmentImageMime: z.enum(["image/jpeg", "image/png", "image/webp"]),
  garmentDescription: z.string().max(200).optional(),
  view: z.enum(["front", "back"]).default("front"),
});

export type TryOnResult =
  | { ok: true; resultUrl: string; view: "front" | "back" }
  | { ok: false; error: string; code?: "not_configured" | "provider" };

export type TryOnStatus = {
  configured: boolean;
};

function providerName(): "fal" | "fashn" {
  const raw = (process.env["TRYON_PROVIDER"] ?? "fal").trim().toLowerCase();
  return raw === "fashn" ? "fashn" : "fal";
}

function dataUri(mime: string, base64: string): string {
  return `data:${mime};base64,${base64}`;
}

function firstImageUrl(json: unknown): string | undefined {
  if (!json || typeof json !== "object") return undefined;
  const record = json as Record<string, unknown>;

  const image = record.image;
  if (image && typeof image === "object" && typeof (image as { url?: unknown }).url === "string") {
    return (image as { url: string }).url;
  }

  const images = record.images;
  if (Array.isArray(images) && images[0] && typeof images[0] === "object") {
    const url = (images[0] as { url?: unknown }).url;
    if (typeof url === "string") return url;
  }

  const output = record.output;
  if (typeof output === "string") return output;
  if (Array.isArray(output) && typeof output[0] === "string") return output[0];

  if (typeof record.result === "string") return record.result;
  return undefined;
}

async function runFal(params: {
  apiKey: string;
  modelUrl: string;
  human: string;
  garment: string;
  description: string;
}): Promise<TryOnResult> {
  let response: Response;
  try {
    response = await fetch(params.modelUrl, {
      method: "POST",
      headers: {
        Authorization: `Key ${params.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        human_image_url: params.human,
        cloth_image_url: params.garment,
        cloth_type: "upper",
        garment_description: params.description,
      }),
      signal: AbortSignal.timeout(90_000),
    });
  } catch {
    return { ok: false, error: "Try-on request failed. Please try again.", code: "provider" };
  }

  if (!response.ok) {
    return {
      ok: false,
      error: "Try-on service returned an error. Please try again.",
      code: "provider",
    };
  }

  const json: unknown = await response.json().catch(() => null);
  const url = firstImageUrl(json);
  if (!url) {
    return { ok: false, error: "Try-on service did not return a result image.", code: "provider" };
  }
  return { ok: true, resultUrl: url, view: "front" };
}

async function runFashn(params: {
  apiKey: string;
  modelUrl: string;
  human: string;
  garment: string;
}): Promise<TryOnResult> {
  let started: Response;
  try {
    started = await fetch(params.modelUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model_image: params.human,
        garment_image: params.garment,
        category: "tops",
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    return { ok: false, error: "Try-on request failed. Please try again.", code: "provider" };
  }

  if (!started.ok) {
    return {
      ok: false,
      error: "Try-on service returned an error. Please try again.",
      code: "provider",
    };
  }

  const startJson = (await started.json().catch(() => null)) as { id?: string } | null;
  const jobId = startJson?.id;
  if (!jobId) {
    const direct = firstImageUrl(startJson);
    if (direct) return { ok: true, resultUrl: direct, view: "front" };
    return { ok: false, error: "Try-on service did not start a job.", code: "provider" };
  }

  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 2_000));
    let status: Response;
    try {
      status = await fetch(`${FASHN_STATUS_URL}/${jobId}`, {
        headers: { Authorization: `Bearer ${params.apiKey}` },
        signal: AbortSignal.timeout(20_000),
      });
    } catch {
      continue;
    }
    if (!status.ok) continue;
    const json = (await status.json().catch(() => null)) as {
      status?: string;
      output?: string[];
      error?: string;
    } | null;
    if (!json) continue;
    if (json.status === "completed") {
      const url = json.output?.[0] ?? firstImageUrl(json);
      if (url) return { ok: true, resultUrl: url, view: "front" };
      return {
        ok: false,
        error: "Try-on service did not return a result image.",
        code: "provider",
      };
    }
    if (json.status === "failed") {
      return {
        ok: false,
        error: "Try-on generation failed. Please try another photo.",
        code: "provider",
      };
    }
  }

  return { ok: false, error: "Try-on timed out. Please try again.", code: "provider" };
}

export const getTryOnStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<TryOnStatus> => ({
    configured: Boolean(process.env["TRYON_API_KEY"]),
  }),
);

export const runVirtualTryOn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => TryOnInput.parse(raw))
  .handler(async ({ data }): Promise<TryOnResult> => {
    const apiKey = process.env["TRYON_API_KEY"];
    if (!apiKey) {
      return {
        ok: false,
        code: "not_configured",
        error:
          "AI try-on is not configured yet. Add TRYON_API_KEY to the server environment (optional: TRYON_PROVIDER=fal|fashn, TRYON_MODEL_URL) and reload. Your photo was not stored.",
      };
    }

    const provider = providerName();
    const human = dataUri(data.modelPhotoMime, data.modelPhotoBase64);
    const garment = dataUri(data.garmentImageMime, data.garmentImageBase64);
    const description = data.garmentDescription ?? "upper-body garment";

    const result =
      provider === "fashn"
        ? await runFashn({
            apiKey,
            modelUrl: process.env["TRYON_MODEL_URL"] ?? DEFAULT_FASHN_URL,
            human,
            garment,
          })
        : await runFal({
            apiKey,
            modelUrl: process.env["TRYON_MODEL_URL"] ?? DEFAULT_FAL_URL,
            human,
            garment,
            description,
          });

    if (result.ok) {
      return { ok: true, resultUrl: result.resultUrl, view: data.view };
    }
    return result;
  });
