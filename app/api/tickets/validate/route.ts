import { validateTicket } from "@/app/lib/database";
import { failure, json, readJson, sameOrigin, ApiError } from "@/app/lib/http";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const body = await readJson(request);
    if (typeof body.ticket !== "string" || body.ticket.length > 1000)
      throw new ApiError(400, "Enter a ticket or registration reference.");
    try {
      return json(await validateTicket(body.ticket));
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        400,
        error instanceof Error ? error.message : "Invalid ticket.",
      );
    }
  } catch (error) {
    return failure(error);
  }
}
