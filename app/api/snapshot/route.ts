import { snapshot } from "@/app/lib/database";
import { failure, json } from "@/app/lib/http";
export async function GET() {
  try {
    return json(await snapshot());
  } catch (error) {
    return failure(error);
  }
}
