import { proxyGet } from "@/app/lib/worker-proxy";
import { json } from "@/app/lib/http";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id)
  )
    return json({ error: "Invalid registration ID." }, 400);
  return proxyGet(request, `registrations/${id}`);
}
