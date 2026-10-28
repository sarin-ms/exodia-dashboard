import DashboardUi, { ui } from "@/app/components/DashboardUi";
import RegistrationTable from "@/app/components/RegistrationTable";
export const metadata = { title: "Registrations" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; stack?: string }>;
}) {
  const { status, stack } = await searchParams;
  return (
    <>
      <DashboardUi
        eyebrow="EVERY NEW NAME IS A NEW POSSIBILITY."
        title="Registrations"
        description="Find a registration, review the details, and keep things moving."
      />
      <section className={ui.panel}>
        <RegistrationTable
          key={`${status}-${stack}`}
          initialStatus={status}
          initialStack={stack}
        />
      </section>
    </>
  );
}
