/**
 * Client-side photo helpers for Try-On Studio.
 *
 * Photos are resized in memory and never written to storage. The resulting
 * object URL is revoked by the studio when the session resets.
 */

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AcceptedMime = (typeof ACCEPTED_MIME_TYPES)[number];

const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.9;

export type TryOnImagePayload = {
  objectUrl: string;
  base64: string;
  mime: AcceptedMime;
};

export function isAcceptedImage(file: File): file is File & { type: AcceptedMime } {
  return (ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type);
}

function stripDataUrl(dataUrl: string): { mime: string; base64: string } {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return { mime: "image/jpeg", base64: dataUrl };
  return { mime: match[1] ?? "image/jpeg", base64: match[2] ?? "" };
}

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not encode the image."));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("Could not read the encoded image."));
        reader.readAsDataURL(blob);
      },
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}

async function resizeBlob(source: Blob): Promise<string> {
  const bitmap = await createImageBitmap(source);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Could not prepare the image.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvasToJpeg(canvas);
}

export async function fileToTryOnPayload(file: File): Promise<TryOnImagePayload> {
  if (!isAcceptedImage(file)) {
    throw new Error("Please upload a JPEG, PNG or WebP image.");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("Image is too large. Maximum file size is 10 MB.");
  }

  const objectUrl = URL.createObjectURL(file);
  const dataUrl = await resizeBlob(file);
  const { base64 } = stripDataUrl(dataUrl);
  return { objectUrl, base64, mime: "image/jpeg" };
}

/** Fetch a same-origin garment asset and encode it for the try-on API. */
export async function urlToTryOnPayload(
  url: string,
): Promise<{ base64: string; mime: AcceptedMime }> {
  const response = await fetch(url, { credentials: "same-origin" });
  if (!response.ok) {
    throw new Error("Could not load the selected garment image.");
  }
  const blob = await response.blob();
  const dataUrl = await resizeBlob(blob);
  const { base64 } = stripDataUrl(dataUrl);
  return { base64, mime: "image/jpeg" };
}
