import DashboardUi, { ui } from "@/app/components/DashboardUi";
import RegistrationTable from "@/app/components/RegistrationTable";
export const metadata = { title: "Participants" };
export default function Page() {
  return (
    <>
      <DashboardUi
        eyebrow="THE PEOPLE BEHIND THE POSSIBILITIES."
        title="Participants"
        description="Confirmed participants, their learning stacks, food preferences, and arrivals."
      />
      <section className={ui.panel}>
        <RegistrationTable view="participants" />
      </section>
    </>
  );
}
