import { proxyGet } from "@/app/lib/worker-proxy";
export function GET(request: Request) {
  return proxyGet(request, "exports");
}
