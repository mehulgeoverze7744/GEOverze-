/**
 * Pure Razorpay credential helpers. Safe to unit-test.
 * Never log Key Secret, Authorization headers, or Base64 credentials.
 */

export type RazorpayKeyPrefix = "rzp_test_" | "rzp_live_" | "other" | "missing";
export type RazorpayCredentialSource = "dotenv-local" | "runtime" | "missing";

export type RazorpayCredentialPair = {
  keyId: string;
  keySecret: string;
  source: RazorpayCredentialSource;
};

/** Trim BOM, wrapping quotes, surrounding whitespace, and trailing inline comments. */
export function stripEnvValue(value: string | undefined | null): string {
  let next = typeof value === "string" ? value : "";
  if (next.charCodeAt(0) === 0xfeff) next = next.slice(1);
  next = next.trim();
  if (
    (next.startsWith('"') && next.endsWith('"') && next.length >= 2) ||
    (next.startsWith("'") && next.endsWith("'") && next.length >= 2)
  ) {
    next = next.slice(1, -1).trim();
  }
  const comment = next.search(/\s+#/);
  if (comment >= 0) next = next.slice(0, comment).trim();
  return next;
}

export function classifyRazorpayKeyPrefix(keyId: string): RazorpayKeyPrefix {
  if (!keyId) return "missing";
  if (keyId.startsWith("rzp_test_")) return "rzp_test_";
  if (keyId.startsWith("rzp_live_")) return "rzp_live_";
  return "other";
}

export function razorpayKeyFingerprint(keyId: string): string {
  if (!keyId) return "";
  return keyId.slice(-4);
}

export function secretLooksLikeKeyId(secret: string): boolean {
  return /^rzp_(test|live)_/.test(secret);
}

export function isPlaceholderSecret(value: string): boolean {
  const lowered = value.toLowerCase();
  return (
    lowered === "your_webhook_secret" ||
    lowered === "whsec_xxxx" ||
    lowered === "changeme" ||
    lowered === "placeholder" ||
    lowered === "your_key_secret" ||
    lowered === "xxxx"
  );
}

export function usableRazorpaySecret(value: string | undefined | null): string {
  const trimmed = stripEnvValue(value);
  if (!trimmed || isPlaceholderSecret(trimmed)) return "";
  return trimmed;
}

/**
 * Resolve Key ID + Key Secret from one source only.
 * Never mix .env.local Key ID with a process.env secret (or vice versa).
 */
export function resolveRazorpayCredentialPair(input: {
  allowLocal: boolean;
  localKeyId: string;
  localKeySecret: string;
  runtimeKeyId: string;
  runtimeKeySecret: string;
}): RazorpayCredentialPair {
  const localId = stripEnvValue(input.localKeyId);
  const localSecret = usableRazorpaySecret(input.localKeySecret);
  const runtimeId = stripEnvValue(input.runtimeKeyId);
  const runtimeSecret = usableRazorpaySecret(input.runtimeKeySecret);

  if (input.allowLocal && localId && localSecret) {
    return { keyId: localId, keySecret: localSecret, source: "dotenv-local" };
  }
  if (runtimeId && runtimeSecret) {
    return { keyId: runtimeId, keySecret: runtimeSecret, source: "runtime" };
  }
  if (input.allowLocal && (localId || localSecret)) {
    return {
      keyId: localId,
      keySecret: localSecret,
      source: "missing",
    };
  }
  return {
    keyId: runtimeId,
    keySecret: runtimeSecret,
    source: "missing",
  };
}

export function encodeRazorpayBasicAuth(keyId: string, keySecret: string): string {
  return Buffer.from(`${keyId}:${keySecret}`, "utf8").toString("base64");
}

function redactSecrets(text: string): string {
  return text
    .replace(/rzp_(test|live)_[A-Za-z0-9]+/g, "rzp_$1_***")
    .replace(/Basic\s+[A-Za-z0-9+/=]+/gi, "Basic ***")
    .replace(/Bearer\s+\S+/gi, "Bearer ***");
}

export function parseRazorpayErrorBody(bodyText: string): {
  code: string;
  description: string;
} {
  try {
    const parsed = JSON.parse(bodyText) as {
      error?: { code?: string; description?: string; reason?: string };
    };
    const code = stripEnvValue(parsed?.error?.code);
    const description = stripEnvValue(
      parsed?.error?.description || parsed?.error?.reason,
    );
    return {
      code: redactSecrets(code),
      description: redactSecrets(description),
    };
  } catch {
    return { code: "", description: "" };
  }
}

export function formatRazorpayHttpError(input: {
  status: number;
  method: string;
  path: string;
  bodyText: string;
  keyPrefix: RazorpayKeyPrefix;
  secretConfigured: boolean;
  secretLooksLikeKeyId: boolean;
}): string {
  const parsed = parseRazorpayErrorBody(input.bodyText);
  const endpoint = `${input.method} ${input.path}`;

  if (input.status === 401) {
    const parts = [
      `Razorpay authentication failed (401) on ${endpoint}.`,
      `Server Key ID prefix: ${input.keyPrefix}.`,
      input.secretConfigured ? "Key Secret is present." : "Key Secret is missing.",
    ];
    if (input.secretLooksLikeKeyId) {
      parts.push(
        "RAZORPAY_KEY_SECRET looks like a Key ID. Use the Key Secret from dashboard.razorpay.com → Settings → API Keys, not the Key ID.",
      );
    }
    if (parsed.description) {
      parts.push(`Razorpay said: "${parsed.description}".`);
    }
    parts.push(
      "Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel Production to a matching pair from the same mode (TEST keys start with rzp_test_), then redeploy. Do not mix a build-time VITE_RAZORPAY_KEY_ID with a different runtime secret.",
    );
    return parts.join(" ");
  }

  const detail = parsed.description
    ? `${parsed.code ? parsed.code + ": " : ""}${parsed.description}`
    : `HTTP ${input.status}`;
  return `Razorpay API error (${input.status}) on ${endpoint}: ${detail}`;
}
