"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Mail,
  ScanLine,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";
import DashboardUi, {
  EmptyState,
  LoadingState,
  StatusBadge,
  ui,
} from "@/app/components/DashboardUi";
import { useDashboard } from "@/app/components/DashboardProvider";
import { dateTime, initials, money } from "@/app/lib/domain";
import styles from "./RegistrationDetail.module.css";
export default function RegistrationDetail({ id }: { id: string }) {
  const { data, loading, error } = useDashboard();
  const [copied, setCopied] = useState(false),
    [copyError, setCopyError] = useState(false);
  if (!data)
    return loading ? (
      <LoadingState />
    ) : (
      <EmptyState
        title="Registration unavailable"
        description="Reload event data to try again."
      />
    );
  const row = data.registrations.find((r) => r.id === id);
  if (!row)
    return (
      <EmptyState
        title="Registration not found"
        description="This reference is not in the selected payment mode."
      >
        <Link href="/registrations" className={ui.button}>
          Back to registrations
        </Link>
      </EmptyState>
    );
  const groups = [
    {
      title: "Student details",
      icon: UserRound,
      fields: [
        ["Full name", row.name],
        ["Email", row.email],
        ["Phone", row.phone],
        ["College", row.college],
        ["Year of study", `Year ${row.year}`],
        ["Gender", row.gender === "male" ? "Male" : "Female"],
        [
          "Food preference",
          row.food === "veg" ? "Vegetarian" : "Non-vegetarian",
        ],
      ],
    },
    {
      title: "Payment & registration",
      icon: Wallet,
      fields: [
        ["Registration amount", money(row.amount)],
        ["Payment mode", row.paymentMode.toUpperCase()],
        ["Order ID", row.orderId ?? "No order created"],
        ["Payment ID", row.paymentId ?? "Awaiting payment"],
        ["Registered", dateTime(row.createdAt) + " IST"],
        [
          "Confirmed",
          row.confirmedAt
            ? dateTime(row.confirmedAt) + " IST"
            : "Not confirmed",
        ],
        ["Hold expires", dateTime(row.holdExpires) + " IST"],
      ],
    },
  ];
  return (
    <>
      <Link href="/registrations" className={styles.back}>
        <ArrowLeft size={13} />
        Back to registrations
      </Link>
      <DashboardUi
        eyebrow={row.reference}
        title="Registration details"
        description="The full picture, from first registration to first hello."
      >
        {row.status === "confirmed" && (
          <Link
            href={`/check-in?reference=${row.reference}`}
            className={`${ui.button} ${ui.primary}`}
          >
            <ScanLine size={14} />
            Open at gate desk
          </Link>
        )}
      </DashboardUi>
      <section className={`${ui.panel} ${styles.identity}`}>
        <span className={styles.avatar}>{initials(row.name)}</span>
        <div>
          <h2>{row.name}</h2>
          <p>
            {row.stackTitle} <span>·</span> {row.college}
          </p>
        </div>
        <StatusBadge status={row.status} />
        <button
          className={ui.button}
          aria-label="Copy registration reference"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(row.reference);
              setCopied(true);
              setCopyError(false);
            } catch {
              setCopyError(true);
            }
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}{" "}
          {copied ? "Copied" : "Copy reference"}
        </button>
        {copyError && (
          <small role="status">Select and copy {row.reference}</small>
        )}
      </section>
      <div className={styles.grid}>
        {groups.map((group) => (
          <section key={group.title} className={`${ui.panel} ${styles.card}`}>
            <h2>
              <group.icon size={17} />
              {group.title}
            </h2>
            <dl>
              {group.fields.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
      <div className={styles.grid}>
        <section className={`${ui.panel} ${styles.card}`}>
          <h2>
            <ShieldCheck size={17} />
            Gate status
          </h2>
          <div className={styles.gateState}>
            <StatusBadge
              status={row.checkedInAt !== null ? "arrived" : "waiting"}
            />
            <p>
              {row.checkedInAt !== null
                ? `Arrival recorded ${dateTime(row.checkedInAt)} IST`
                : row.status === "confirmed"
                  ? "Ready to validate at the gate desk."
                  : "Payment must be confirmed before admission."}
            </p>
          </div>
          {error && (
            <p className={styles.stale}>
              This information may be out of date. Refresh before admitting.
            </p>
          )}
        </section>
        <section className={`${ui.panel} ${styles.card}`}>
          <h2>
            <Mail size={17} />
            Email status
          </h2>
          <dl>
            <div>
              <dt>Email verification</dt>
              <dd>{row.emailVerified ? "Verified" : "Not verified"}</dd>
            </div>
            <div>
              <dt>Ticket email</dt>
              <dd>{row.ticketEmailStatus ?? "Not queued"}</dd>
            </div>
          </dl>
          <p className={styles.note}>
            A sent status records the email service response. It does not
            confirm delivery or opening.
          </p>
        </section>
      </div>
    </>
  );
}
