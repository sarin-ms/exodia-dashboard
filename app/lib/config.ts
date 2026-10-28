import "server-only";
export function dataMode() {
  const value = process.env.EXODIA_DATA_MODE ?? "live";
  if (value !== "live" && value !== "preview")
    throw new Error("EXODIA_DATA_MODE must be live or preview.");
  return value;
}
export const mainSite = process.env.MAIN_SITE_URL || "https://exodiacec.in";
