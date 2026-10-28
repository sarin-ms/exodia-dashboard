import "server-only";
import { workerRequest } from "@/app/lib/database";
import { ApiError, failure } from "@/app/lib/http";
export async function proxyGet(request: Request, operation: string) {
  try {
    const query = new URL(request.url).searchParams;
    for (const key of query.keys())
      if (
        !["cursor", "limit", "status", "stack", "search", "kind"].includes(key)
      )
        throw new ApiError(400, "Unsupported query parameter.");
    if (query.toString().length > 2000)
      throw new ApiError(400, "The query is too long.");
    const response = await workerRequest(
      `/api/admin/${operation}${query.size ? "?" + query.toString() : ""}`,
    );
    const headers = new Headers({
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Type":
        response.headers.get("Content-Type") ?? "application/json",
    });
    const disposition = response.headers.get("Content-Disposition");
    if (disposition) headers.set("Content-Disposition", disposition);
    return new Response(response.body, { headers });
  } catch (error) {
    return failure(error);
  }
}
