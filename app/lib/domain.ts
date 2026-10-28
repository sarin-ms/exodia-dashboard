export type PaymentMode = "test" | "live";
export type RegistrationStatus =
  "confirmed" | "pending_payment" | "expired" | "paid_exception" | "refunded";
export type Registration = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  year: string;
  gender: string;
  food: "veg" | "non-veg";
  stackId: string;
  stackTitle: string;
  amount: number;
  status: RegistrationStatus;
  paymentMode: PaymentMode;
  orderId: string | null;
  paymentId: string | null;
  createdAt: number;
  confirmedAt: number | null;
  holdExpires: number;
  checkedInAt: number | null;
  emailVerified: boolean;
  ticketEmailStatus: string | null;
};
export type Stack = {
  id: string;
  title: string;
  capacity: number | null;
  active: boolean;
  held: number;
};
export type Snapshot = {
  registrations: Registration[];
  stacks: Stack[];
  updatedAt: number;
  paymentMode: PaymentMode;
  preview: boolean;
};
export const statusLabels: Record<RegistrationStatus, string> = {
  confirmed: "Confirmed",
  pending_payment: "Pending payment",
  expired: "Expired",
  paid_exception: "Needs review",
  refunded: "Refunded",
};
export const stackLabels: Record<string, string> = {
  "agentic-ai": "Agentic AI",
  "embedded-systems": "Embedded Systems",
  godot: "Game Development",
};
export function money(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}
export function dateTime(seconds: number | null, dateOnly = false) {
  return seconds === null
    ? "—"
    : new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        ...(!dateOnly ? { hour: "2-digit", minute: "2-digit" } : {}),
      }).format(new Date(seconds * 1000));
}
export function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
export function summarize(rows: Registration[]) {
  const confirmed = rows.filter((r) => r.status === "confirmed");
  return {
    total: rows.length,
    confirmed: confirmed.length,
    pending: rows.filter((r) => r.status === "pending_payment").length,
    review: rows.filter((r) => r.status === "paid_exception").length,
    amount: confirmed.reduce((sum, r) => sum + r.amount, 0),
    arrived: confirmed.filter((r) => r.checkedInAt !== null).length,
    veg: confirmed.filter((r) => r.food === "veg").length,
    nonVeg: confirmed.filter((r) => r.food === "non-veg").length,
  };
}
export function filterRegistrations(
  rows: Registration[],
  query: string,
  status = "all",
  stack = "all",
) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return rows.filter(
    (r) =>
      (status === "all" ||
        r.status === status ||
        (status === "arrived" &&
          r.status === "confirmed" &&
          r.checkedInAt !== null) ||
        (status === "waiting" &&
          r.status === "confirmed" &&
          r.checkedInAt === null)) &&
      (stack === "all" || r.stackId === stack) &&
      terms.every((term) =>
        [
          r.name,
          r.email,
          r.phone,
          r.college,
          r.reference,
          r.orderId,
          r.paymentId,
        ].some((v) => v?.toLowerCase().includes(term)),
      ),
  );
}
export function parseTicket(input: string, site = "https://exodiacec.in") {
  const value = input.trim();
  if (/^EX4-[A-F0-9]{16}$/i.test(value))
    return { reference: value.toUpperCase() };
  if (/^[a-f0-9]{64}$/i.test(value)) return { token: value.toLowerCase() };
  try {
    const url = new URL(value, site);
    if (
      url.origin !== new URL(site).origin ||
      url.pathname !== "/ticket" ||
      url.search
    )
      throw new Error();
    const token = new URLSearchParams(url.hash.slice(1)).get("token");
    if (!token || !/^[a-f0-9]{64}$/i.test(token)) throw new Error();
    return { token: token.toLowerCase() };
  } catch {
    throw new Error(
      "Enter an EX4 reference, a 64-character ticket token, or an Exodia /ticket#token=… link.",
    );
  }
}
export function csvCell(value: unknown) {
  let text = String(value ?? "");
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text))
    text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export function makeCsv(rows: Registration[], kind: string) {
  const columns: [string, (r: Registration) => unknown][] = [
    ["Reference", (r) => r.reference],
    ["Name", (r) => r.name],
    ["Status", (r) => statusLabels[r.status]],
    ["Stack", (r) => r.stackTitle],
    ...(kind === "payments"
      ? ([
          ["Amount (INR)", (r: Registration) => r.amount / 100],
          ["Order ID", (r: Registration) => r.orderId],
          ["Payment ID", (r: Registration) => r.paymentId],
        ] as [string, (r: Registration) => unknown][])
      : ([
          ["College", (r: Registration) => r.college],
          ["Year", (r: Registration) => r.year],
          ["Email", (r: Registration) => r.email],
          ["Phone", (r: Registration) => r.phone],
          ["Food", (r: Registration) => r.food],
        ] as [string, (r: Registration) => unknown][])),
    ["Payment mode", (r) => r.paymentMode],
    ["Registered (IST)", (r) => dateTime(r.createdAt)],
    ["Check-in (IST)", (r) => dateTime(r.checkedInAt)],
  ];
  return (
    "\uFEFF" +
    [
      columns.map(([label]) => csvCell(label)).join(","),
      ...rows.map((row) =>
        columns.map(([, getter]) => csvCell(getter(row))).join(","),
      ),
    ].join("\r\n")
  );
}
