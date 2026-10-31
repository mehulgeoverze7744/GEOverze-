/**
 * Try-On Studio — server-side AI processing.
 *
 * API credentials are read from server-side environment variables ONLY.
 * They are never exposed to the client. The server function runs inside
 * TanStack Start's Nitro server runtime, so `process.env` is safe here.
 *
 * Required env var (set in your hosting dashboard or `.env.local`):
 *   TRYON_API_KEY=<your FAL.ai or Replicate API key>
 *   TRYON_MODEL_URL=<optional override, defaults to fal.ai CatVTON>
 *
 * The default model is FAL.ai's CatVTON virtual try-on endpoint.
 * You can swap it for any compatible API by setting TRYON_MODEL_URL.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const DEFAULT_MODEL_URL = "https://fal.run/fal-ai/cat-vton";

const TryOnInput = z.object({
  /** Base64-encoded JPEG/PNG of the user's photo (data: prefix stripped). */
  modelPhotoBase64: z.string().min(100).max(5_000_000),
  /** MIME type of the uploaded photo. */
  modelPhotoMime: z.enum(["image/jpeg", "image/png", "image/webp"]),
  /** Public URL or base64 data URI for the garment product photo. */
  garmentImageUrl: z.string().min(1).max(2_048),
  /** Human-readable garment description for the AI model. */
  garmentDescription: z.string().max(200).optional(),
  /** View to generate: "front" (default) or "back". */
  view: z.enum(["front", "back"]).default("front"),
});

export type TryOnResult =
  | { ok: true; resultUrl: string; view: "front" | "back" }
  | { ok: false; error: string };

/**
 * Runs virtual try-on via the server-side AI API.
 *
 * The function validates input with Zod before calling the external API.
 * If `TRYON_API_KEY` is not set, a clear error is returned — no credentials
 * are ever leaked in the response, regardless of error state.
 */
export const runVirtualTryOn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => TryOnInput.parse(raw))
  .handler(async ({ data }): Promise<TryOnResult> => {
    const apiKey = process.env["TRYON_API_KEY"];
    const modelUrl = process.env["TRYON_MODEL_URL"] ?? DEFAULT_MODEL_URL;

    if (!apiKey) {
      // Do NOT reveal anything about env configuration to the client —
      // only return a user-friendly message.
      return {
        ok: false,
        error:
          "Try-On Studio is not yet configured. Please contact the GVRZE team to enable this feature.",
      };
    }

    const humanImageDataUri = `data:${data.modelPhotoMime};base64,${data.modelPhotoBase64}`;

    let apiResponse: Response;
    try {
      apiResponse = await fetch(modelUrl, {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          human_image_url: humanImageDataUri,
          garment_image_url: data.garmentImageUrl,
          garment_description: data.garmentDescription ?? "clothing",
          num_inference_steps: 30,
          guidance_scale: 2.5,
          seed: 42,
        }),
        signal: AbortSignal.timeout(90_000),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      // Never include env vars or stack traces in the error message.
      return { ok: false, error: `Try-on request failed: ${message}` };
    }

    if (!apiResponse.ok) {
      return {
        ok: false,
        error: `Try-on service returned an error (${apiResponse.status}). Please try again.`,
      };
    }

    let json: unknown;
    try {
      json = await apiResponse.json();
    } catch {
      return { ok: false, error: "Unexpected response from try-on service." };
    }

    // Normalise across different API response shapes.
    const result = json as {
      image?: { url?: string };
      images?: Array<{ url?: string }>;
      output?: string | string[];
    };

    const url =
      result.image?.url ??
      result.images?.[0]?.url ??
      (typeof result.output === "string"
        ? result.output
        : Array.isArray(result.output)
          ? result.output[0]
          : undefined);

    if (!url || typeof url !== "string") {
      return { ok: false, error: "Try-on service did not return a result image." };
    }

    return { ok: true, resultUrl: url, view: data.view };
  });
