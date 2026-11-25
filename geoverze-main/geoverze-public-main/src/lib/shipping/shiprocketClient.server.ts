/**
 * Server-only Shiprocket API client. Never import from browser code.
 *
 * Live API calls are disabled unless SHIPROCKET_LIVE_ENABLED=true and credentials exist.
 */

const SHIPROCKET_API_BASE = "https://apiv2.shiprocket.in/v1/external";

export type ShiprocketConfig = {
  email: string;
  password: string;
  pickupLocation: string;
  channelId: string;
};

export type ShiprocketApiError = {
  code: "missing_credentials" | "auth_failed" | "http_error" | "live_disabled" | "invalid_response";
  message: string;
  status?: number;
};

type TokenCache = {
  token: string;
  expiresAt: number;
};

let cachedToken: TokenCache | null = null;

const API_TIMEOUT_MS = Number(process.env["SHIPROCKET_API_TIMEOUT_MS"] ?? 25_000);

type FetchFn = typeof fetch;
let fetchImpl: FetchFn = fetch;

/** Test-only: inject mocked fetch for Shiprocket HTTP. */
export function setShiprocketFetchForTests(fn: FetchFn | null): void {
  fetchImpl = fn ?? fetch;
}

function fetchWithTimeout(input: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  return fetchImpl(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timeout));
}

function readConfig(): ShiprocketConfig | null {
  const email = process.env["SHIPROCKET_EMAIL"]?.trim() ?? "";
  const password = process.env["SHIPROCKET_PASSWORD"]?.trim() ?? "";
  const pickupLocation = process.env["SHIPROCKET_PICKUP_LOCATION"]?.trim() ?? "";
  const channelId = process.env["SHIPROCKET_CHANNEL_ID"]?.trim() ?? "";
  if (!email || !password) return null;
  return { email, password, pickupLocation, channelId };
}

export function shiprocketLiveEnabled(): boolean {
  return (process.env["SHIPROCKET_LIVE_ENABLED"] ?? "").trim().toLowerCase() === "true";
}

export function shiprocketConfigured(): boolean {
  return readConfig() !== null;
}

export function clearShiprocketTokenCache(): void {
  cachedToken = null;
}

async function authenticate(): Promise<{ token: string } | ShiprocketApiError> {
  const config = readConfig();
  if (!config) {
    return { code: "missing_credentials", message: "SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD not set" };
  }
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return { token: cachedToken.token };
  }

  const response = await fetchWithTimeout(`${SHIPROCKET_API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: config.email, password: config.password }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    return {
      code: "auth_failed",
      message: `Shiprocket auth ${response.status}: ${body.slice(0, 200)}`,
      status: response.status,
    };
  }

  const data = (await response.json().catch(() => null)) as { token?: string } | null;
  if (!data?.token) {
    return { code: "invalid_response", message: "Shiprocket auth response missing token" };
  }

  cachedToken = { token: data.token, expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000 };
  return { token: data.token };
}

async function authorizedFetch(
  path: string,
  init: RequestInit = {},
  allowRetry = true,
): Promise<Response | ShiprocketApiError> {
  if (!shiprocketLiveEnabled()) {
    return { code: "live_disabled", message: "SHIPROCKET_LIVE_ENABLED is not true" };
  }
  const auth = await authenticate();
  if ("code" in auth) return auth;

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${auth.token}`);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetchWithTimeout(`${SHIPROCKET_API_BASE}${path}`, { ...init, headers });
    if (response.status === 401 && allowRetry) {
      clearShiprocketTokenCache();
      return authorizedFetch(path, init, false);
    }
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "timeout";
    return { code: "http_error", message: `Shiprocket request failed: ${message}` };
  }
}

export type ServiceabilityInput = {
  pickupPincode: string;
  deliveryPincode: string;
  weightKg: number;
  cod?: boolean;
};

export async function checkServiceability(
  input: ServiceabilityInput,
): Promise<{ ok: true; raw: unknown } | { ok: false; error: ShiprocketApiError }> {
  const params = new URLSearchParams({
    pickup_postcode: input.pickupPincode,
    delivery_postcode: input.deliveryPincode,
    weight: String(input.weightKg),
    cod: input.cod ? "1" : "0",
  });
  const response = await authorizedFetch(`/courier/serviceability?${params.toString()}`);
  if ("code" in response) return { ok: false, error: response };
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    return {
      ok: false,
      error: { code: "http_error", message: body.slice(0, 240), status: response.status },
    };
  }
  const raw = await response.json().catch(() => ({}));
  return { ok: true, raw };
}

export type ShiprocketOrderLine = {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  hsn?: string;
};

export type CreateShipmentOrderInput = {
  gstoreOrderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  lines: ShiprocketOrderLine[];
  subtotalRupee: number;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
  weightKg: number;
};

export async function createAdhocOrder(
  input: CreateShipmentOrderInput,
): Promise<{ ok: true; raw: unknown } | { ok: false; error: ShiprocketApiError }> {
  const config = readConfig();
  const orderDate = new Date().toISOString().slice(0, 10);

  const payload = {
    order_id: input.gstoreOrderId,
    order_date: orderDate,
    pickup_location: config?.pickupLocation || "Primary",
    channel_id: config?.channelId || undefined,
    billing_customer_name: input.customerName,
    billing_last_name: "",
    billing_address: input.shippingAddress.line1,
    billing_address_2: input.shippingAddress.line2,
    billing_city: input.shippingAddress.city,
    billing_pincode: input.shippingAddress.pincode,
    billing_state: input.shippingAddress.state,
    billing_country: input.shippingAddress.country,
    billing_email: input.customerEmail,
    billing_phone: input.customerPhone,
    shipping_is_billing: true,
    order_items: input.lines,
    payment_method: "Prepaid",
    sub_total: input.subtotalRupee,
    length: input.lengthCm,
    breadth: input.breadthCm,
    height: input.heightCm,
    weight: input.weightKg,
    comment: `GVRZE ${input.orderNumber}`,
  };

  const response = await authorizedFetch("/orders/create/adhoc", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if ("code" in response) return { ok: false, error: response };
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    return {
      ok: false,
      error: { code: "http_error", message: body.slice(0, 240), status: response.status },
    };
  }
  const raw = await response.json().catch(() => ({}));
  return { ok: true, raw };
}

export async function assignAwb(shipmentId: string | number): Promise<
  { ok: true; raw: unknown } | { ok: false; error: ShiprocketApiError }
> {
  const response = await authorizedFetch("/courier/assign/awb", {
    method: "POST",
    body: JSON.stringify({ shipment_id: shipmentId }),
  });
  if ("code" in response) return { ok: false, error: response };
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    return {
      ok: false,
      error: { code: "http_error", message: body.slice(0, 240), status: response.status },
    };
  }
  const raw = await response.json().catch(() => ({}));
  return { ok: true, raw };
}

export async function schedulePickup(shipmentIds: Array<string | number>): Promise<
  { ok: true; raw: unknown } | { ok: false; error: ShiprocketApiError }
> {
  const response = await authorizedFetch("/courier/generate/pickup", {
    method: "POST",
    body: JSON.stringify({ shipment_id: shipmentIds }),
  });
  if ("code" in response) return { ok: false, error: response };
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    return {
      ok: false,
      error: { code: "http_error", message: body.slice(0, 240), status: response.status },
    };
  }
  const raw = await response.json().catch(() => ({}));
  return { ok: true, raw };
}

export async function trackByAwb(awb: string): Promise<
  { ok: true; raw: unknown } | { ok: false; error: ShiprocketApiError }
> {
  const response = await authorizedFetch(`/courier/track/awb/${encodeURIComponent(awb)}`);
  if ("code" in response) return { ok: false, error: response };
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    return {
      ok: false,
      error: { code: "http_error", message: body.slice(0, 240), status: response.status },
    };
  }
  const raw = await response.json().catch(() => ({}));
  return { ok: true, raw };
}