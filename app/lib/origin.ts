export function allowedOrigin(
  origin: string | null,
  requestUrl: string,
  canonical?: string,
) {
  if (!origin || origin === "null") return false;
  try {
    const source = new URL(origin),
      target = new URL(canonical ?? requestUrl);
    if (
      source.origin !== origin ||
      !["http:", "https:"].includes(source.protocol)
    )
      return false;
    if (source.origin === target.origin) return true;
    const loopback = ["127.0.0.1", "localhost", "[::1]"];
    return (
      !canonical &&
      source.protocol === target.protocol &&
      source.port === target.port &&
      loopback.includes(source.hostname) &&
      loopback.includes(target.hostname)
    );
  } catch {
    return false;
  }
}
