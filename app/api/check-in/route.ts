import { checkIn } from "@/app/lib/database";
import { failure, json, readJson, sameOrigin, ApiError } from "@/app/lib/http";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const body = await readJson(request);
    if (typeof body.registrationId !== "string")
      throw new ApiError(400, "Choose a validated attendee.");
    return json(await checkIn(body.registrationId));
  } catch (error) {
    return failure(error);
  }
}
