import Link from "next/link";
import { EmptyState, ui } from "@/app/components/DashboardUi";
export default function NotFound() {
  return (
    <EmptyState
      title="This page wandered off."
      description="Head back to the Exodia workspace to find what you need."
    >
      <Link className={ui.button} href="/">
        Back to overview
      </Link>
    </EmptyState>
  );
}
