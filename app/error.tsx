"use client";
import { EmptyState, ui } from "@/app/components/DashboardUi";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <EmptyState
      title="The workspace hit a snag."
      description="Try reloading this view. Your last recorded check-ins remain saved."
    >
      <button className={ui.button} onClick={reset}>
        Try again
      </button>
    </EmptyState>
  );
}
