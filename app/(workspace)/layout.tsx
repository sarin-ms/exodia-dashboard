import DashboardProvider from "@/app/components/DashboardProvider";
import DashboardShell from "@/app/components/DashboardShell";
import { dataMode, mainSite } from "@/app/lib/config";
export const dynamic = "force-dynamic";
export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider preview={dataMode() === "preview"} mainSite={mainSite}>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  );
}
