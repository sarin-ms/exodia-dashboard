import type { Registration, Snapshot } from "@/app/lib/domain";
const statuses = [
  "confirmed",
  "pending_payment",
  "expired",
  "paid_exception",
  "refunded",
];
function record(value: unknown): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid object.");
}
export function assertRegistration(
  value: unknown,
): asserts value is Registration {
  record(value);
  for (const key of [
    "id",
    "reference",
    "name",
    "email",
    "phone",
    "college",
    "year",
    "gender",
    "stackId",
    "stackTitle",
  ])
    if (typeof value[key] !== "string")
      throw new Error("Missing registration field.");
  for (const key of ["amount", "createdAt", "holdExpires"])
    if (typeof value[key] !== "number" || !Number.isFinite(value[key]))
      throw new Error("Invalid numeric field.");
  for (const key of ["confirmedAt", "checkedInAt"])
    if (
      value[key] !== null &&
      (typeof value[key] !== "number" || !Number.isFinite(value[key]))
    )
      throw new Error("Invalid time.");
  for (const key of ["orderId", "paymentId", "ticketEmailStatus"])
    if (value[key] !== null && typeof value[key] !== "string")
      throw new Error("Invalid optional field.");
  if (
    !statuses.includes(String(value.status)) ||
    !["live", "test"].includes(String(value.paymentMode)) ||
    !["veg", "non-veg"].includes(String(value.food)) ||
    typeof value.emailVerified !== "boolean"
  )
    throw new Error("Invalid registration status.");
}
export function assertSnapshot(value: unknown): asserts value is Snapshot {
  record(value);
  if (
    value.preview !== false ||
    !["live", "test"].includes(String(value.paymentMode)) ||
    typeof value.updatedAt !== "number" ||
    !Array.isArray(value.registrations) ||
    !Array.isArray(value.stacks)
  )
    throw new Error("Invalid snapshot.");
  const ids = new Set<string>();
  for (const row of value.registrations) {
    assertRegistration(row);
    if (row.paymentMode !== value.paymentMode || ids.has(row.id))
      throw new Error("Inconsistent snapshot.");
    ids.add(row.id);
  }
  for (const stack of value.stacks) {
    record(stack);
    if (
      typeof stack.id !== "string" ||
      typeof stack.title !== "string" ||
      typeof stack.active !== "boolean" ||
      typeof stack.held !== "number" ||
      (stack.capacity !== null && typeof stack.capacity !== "number")
    )
      throw new Error("Invalid stack.");
  }
}
