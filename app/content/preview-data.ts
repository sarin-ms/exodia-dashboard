import {
  stackLabels,
  type Registration,
  type Snapshot,
} from "@/app/lib/domain";
const names = [
  "Adithya Menon",
  "Malavika Nair",
  "Arjun Krishna",
  "Devika S",
  "Mohammed Farhan",
  "Ananya Raj",
  "Sidharth Prasad",
  "Fathima Sana",
  "Niranjan K",
  "Megha Mohan",
  "Abhinav Das",
  "Gopika R",
  "Rohan Thomas",
  "Sneha Suresh",
  "Vishnu R",
  "Diya Mathew",
  "Akash Nair",
  "Aiswarya S",
];
const colleges = [
  "College of Engineering Chengannur",
  "College of Engineering Trivandrum",
  "TKM College of Engineering",
  "Model Engineering College",
  "Rajagiri School of Engineering",
  "Government Engineering College Thrissur",
];
export function createPreview(): Snapshot {
  const anchor = Math.floor(Date.now() / 1000);
  const registrations: Registration[] = Array.from(
    { length: 126 },
    (_, i): Registration => {
      const status =
        i % 17 === 0
          ? "paid_exception"
          : i % 13 === 0
            ? "refunded"
            : i % 9 === 0
              ? "expired"
              : i % 7 === 0
                ? "pending_payment"
                : "confirmed";
      const stackId = ["agentic-ai", "embedded-systems", "godot"][i % 3];
      const createdAt =
        anchor - Math.floor((126 - i) / 10) * 86400 - (i % 10) * 1900;
      return {
        id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
        reference: `EX4-${(i + 1).toString(16).padStart(16, "0").toUpperCase()}`,
        name: names[i % names.length],
        email: `student${i + 1}@example.com`,
        phone: `+91900000${String(i + 1).padStart(4, "0")}`,
        college: colleges[i % colleges.length],
        year: String((i % 4) + 1),
        gender: i % 2 ? "female" : "male",
        food: i % 5 < 2 ? "veg" : "non-veg",
        stackId,
        stackTitle: stackLabels[stackId],
        amount: 79900,
        status,
        paymentMode: "test",
        orderId: `order_preview${i + 1}`,
        paymentId: ["confirmed", "paid_exception", "refunded"].includes(status)
          ? `pay_preview${i + 1}`
          : null,
        createdAt,
        confirmedAt: status === "confirmed" ? createdAt + 75 : null,
        holdExpires:
          status === "pending_payment" ? anchor + 300 : createdAt + 600,
        checkedInAt:
          status === "confirmed" && i % 4 === 0 ? anchor - i * 60 : null,
        emailVerified: true,
        ticketEmailStatus: status === "confirmed" ? "sent" : null,
      };
    },
  ).sort((a, b) => b.createdAt - a.createdAt);
  return {
    registrations,
    stacks: Object.entries(stackLabels).map(([id, title]) => ({
      id,
      title,
      capacity: 60,
      active: true,
      held: registrations.filter(
        (r) => r.stackId === id && r.status === "pending_payment",
      ).length,
    })),
    updatedAt: anchor,
    paymentMode: "test",
    preview: true,
  };
}
