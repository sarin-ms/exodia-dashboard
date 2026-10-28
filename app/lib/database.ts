import "server-only";
import { dataMode } from "@/app/lib/config";
import { assertRegistration, assertSnapshot } from "@/app/lib/contracts";
import type { Registration, Snapshot } from "@/app/lib/domain";
import { ApiError } from "@/app/lib/http";
import { createPreview } from "@/app/content/preview-data";

const globals = globalThis as typeof globalThis & { exodiaPreview?: Snapshot };
function preview() {
  return (globals.exodiaPreview ??= createPreview());
}

// Calls the main website's Worker and existing D1 binding, never the account API.
export async function workerRequest(path: string, init: RequestInit = {}) {
  const base = new URL(
    process.env.EXODIA_ADMIN_API_BASE_URL || "https://api.exodiacec.in",
  );
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname);
  if (
    (base.protocol !== "https:" && !(base.protocol === "http:" && local)) ||
    base.username ||
    base.password ||
    base.search ||
    base.hash ||
    base.pathname !== "/"
  )
    throw new ApiError(503, "Configure a valid Exodia Worker API origin.");
  const token = process.env.EXODIA_ADMIN_API_TOKEN ?? "";
  if (!/^[a-f0-9]{64}$/.test(token))
    throw new ApiError(
      503,
      "The dashboard's Worker service token is not configured.",
    );
  if (!path.startsWith("/api/admin/") || path.includes(".."))
    throw new ApiError(400, "Invalid Worker operation.");
  let response: Response;
  try {
    response = await fetch(base.origin + path, {
      ...init,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(20_000),
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
      },
    });
  } catch {
    throw new ApiError(
      502,
      "The Exodia Worker could not be reached. Please try again.",
    );
  }
  if (!response.ok) {
    let payload: { error?: string } = {};
    try {
      payload = await response.json();
    } catch {
      /* Show a bounded generic failure. */
    }
    if (response.status === 401 || response.status === 403)
      throw new ApiError(
        502,
        "The Worker service token does not match the dashboard configuration.",
      );
    if (response.status === 404 && path === "/api/admin/snapshot")
      throw new ApiError(
        503,
        "Deploy the dashboard API routes to the main Exodia Worker first.",
      );
    throw new ApiError(
      response.status,
      typeof payload.error === "string"
        ? payload.error
        : "The Exodia Worker could not complete this request.",
    );
  }
  return response;
}
async function workerJson(
  path: string,
  init: RequestInit = {},
): Promise<unknown> {
  const response = await workerRequest(path, init);
  try {
    return await response.json();
  } catch {
    throw new ApiError(
      502,
      "The Exodia Worker returned an unreadable response.",
    );
  }
}
export async function snapshot(): Promise<Snapshot> {
  if (dataMode() === "preview")
    return { ...preview(), updatedAt: Math.floor(Date.now() / 1000) };
  const result = await workerJson("/api/admin/snapshot");
  try {
    assertSnapshot(result);
  } catch {
    throw new ApiError(
      502,
      "The Exodia Worker returned an invalid dashboard snapshot.",
    );
  }
  return result;
}
export async function validateTicket(input: string): Promise<Registration> {
  if (dataMode() !== "preview") {
    const result = await workerJson("/api/admin/tickets/validate", {
      method: "POST",
      body: JSON.stringify({ ticket: input }),
    });
    try {
      assertRegistration(result);
    } catch {
      throw new ApiError(
        502,
        "The Exodia Worker returned invalid attendee details.",
      );
    }
    return result;
  }
  const row = preview().registrations.find(
    (r) => r.reference === input.trim().toUpperCase(),
  );
  if (!row)
    throw new ApiError(
      404,
      "Preview mode accepts sample EX4 references from Registrations.",
    );
  if (row.status !== "confirmed")
    throw new ApiError(409, "This registration is not confirmed.");
  return row;
}
export async function checkIn(id: string): Promise<Registration> {
  if (
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id)
  )
    throw new ApiError(400, "Invalid registration ID.");
  if (dataMode() !== "preview") {
    const result = await workerJson("/api/admin/check-in", {
      method: "POST",
      body: JSON.stringify({ registrationId: id }),
    });
    try {
      assertRegistration(result);
      if (result.id !== id || result.checkedInAt === null) throw new Error();
    } catch {
      throw new ApiError(
        502,
        "Arrival may have been recorded. Validate the ticket again before retrying.",
      );
    }
    return result;
  }
  const row = preview().registrations.find((r) => r.id === id);
  if (!row || row.status !== "confirmed")
    throw new ApiError(409, "This registration is not eligible for admission.");
  if (row.checkedInAt !== null)
    throw new ApiError(
      409,
      "Already checked in. Validate again to see the original arrival.",
    );
  row.checkedInAt = Math.floor(Date.now() / 1000);
  return row;
}
