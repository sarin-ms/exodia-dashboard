import "server-only";
import { allowedOrigin } from "@/app/lib/origin";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function json(value: unknown, status = 200) {
  return Response.json(value, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}
export function failure(cause: unknown) {
  return json(
    {
      error:
        cause instanceof ApiError
          ? cause.message
          : "The request could not be completed. Check your connection and try again.",
    },
    cause instanceof ApiError ? cause.status : 500,
  );
}
export function sameOrigin(request: Request) {
  if (
    !allowedOrigin(
      request.headers.get("origin"),
      request.url,
      process.env.DASHBOARD_ORIGIN,
    )
  )
    throw new ApiError(403, "This request must come from the dashboard.");
}
export async function readJson(
  request: Request,
): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new ApiError(415, "Send a JSON request.");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "A request body is required.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 4096) {
      await reader.cancel();
      throw new ApiError(413, "The request is too large.");
    }
    chunks.push(value);
  }
  try {
    const data = JSON.parse(Buffer.concat(chunks).toString());
    if (!data || typeof data !== "object" || Array.isArray(data))
      throw new Error();
    return data;
  } catch {
    throw new ApiError(400, "Invalid JSON request.");
  }
}
