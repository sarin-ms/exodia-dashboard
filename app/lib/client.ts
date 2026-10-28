export class RequestError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    signal: init.signal ?? AbortSignal.timeout(20_000),
  });
  const result = await response.json();
  if (!response.ok)
    throw new RequestError(
      response.status,
      typeof result.error === "string"
        ? result.error
        : "The request failed. Please try again.",
    );
  return result as T;
}
export function downloadCsv(text: string, name: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/csv;charset=utf-8;" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
