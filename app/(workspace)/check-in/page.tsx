import CheckInView from "@/app/components/CheckInView";
export const metadata = { title: "Gate check-in" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;
  return <CheckInView reference={reference} />;
}
