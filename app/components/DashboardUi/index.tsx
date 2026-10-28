import Link from "next/link";
import { ArrowUpRight, Inbox, LoaderCircle } from "lucide-react";
import { statusLabels, type RegistrationStatus } from "@/app/lib/domain";
import styles from "./DashboardUi.module.css";
export default function DashboardUi({
  eyebrow = "A LITTLE CLARITY. A LOT OF POSSIBILITY.",
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={styles.heading}>
      <div>
        <div className={styles.eyebrow}>{eyebrow}</div>
        <h1>
          {title}
          <span>.</span>
        </h1>
        <p>{description}</p>
      </div>
      <div className={styles.actions}>{children}</div>
    </div>
  );
}
export function StatusBadge({
  status,
}: {
  status: RegistrationStatus | "arrived" | "waiting";
}) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      <i />
      {status === "arrived"
        ? "Checked in"
        : status === "waiting"
          ? "Not checked in"
          : statusLabels[status]}
    </span>
  );
}
export function PanelHeader({
  title,
  caption,
  href,
  label = "View all",
}: {
  title: string;
  caption?: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className={styles.panelHeader}>
      <div>
        <h2>{title}</h2>
        {caption && <p>{caption}</p>}
      </div>
      {href && (
        <Link href={href}>
          {label}
          <ArrowUpRight size={14} />
        </Link>
      )}
    </div>
  );
}
export function EmptyState({
  title = "A little quiet. For now.",
  description = "Registrations will appear here as they come in.",
  children,
}: {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={styles.empty}>
      <span>
        <Inbox size={26} strokeWidth={1.4} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function LoadingState() {
  return (
    <div className={styles.loading} role="status">
      <LoaderCircle size={22} /> Loading the workspace…
    </div>
  );
}
export const ui = styles;
