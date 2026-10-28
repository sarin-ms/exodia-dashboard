"use client";
import { useState } from "react";
import {
  Check,
  ClipboardList,
  CreditCard,
  Download,
  FileSpreadsheet,
  ScanLine,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import DashboardUi, { ui } from "@/app/components/DashboardUi";
import { useDashboard } from "@/app/components/DashboardProvider";
import {
  csvCell,
  dateTime,
  filterRegistrations,
  makeCsv,
  stackLabels,
} from "@/app/lib/domain";
import { downloadCsv } from "@/app/lib/client";
import styles from "./ExportsView.module.css";
const exports = [
  {
    id: "registrations",
    title: "Registrations",
    caption: "Student details, stack, status, and registration dates.",
    icon: ClipboardList,
  },
  {
    id: "participants",
    title: "Confirmed participants",
    caption: "Your confirmed attendee list with contact and food details.",
    icon: Users,
  },
  {
    id: "payments",
    title: "Payment summary",
    caption: "Registration amounts, order IDs, and payment references.",
    icon: CreditCard,
  },
  {
    id: "attendance",
    title: "Attendance",
    caption: "Confirmed participants and arrival times for your gate desk.",
    icon: ScanLine,
  },
  {
    id: "catering",
    title: "Catering counts",
    caption: "Confirmed vegetarian and non-vegetarian counts by stack.",
    icon: UtensilsCrossed,
  },
];
export default function ExportsView() {
  const { data, error, loading } = useDashboard();
  const [stack, setStack] = useState("all"),
    [message, setMessage] = useState("");
  const scope = filterRegistrations(
    data?.registrations ?? [],
    "",
    "all",
    stack,
  );
  function rowsFor(kind: string) {
    return kind === "participants" ||
      kind === "attendance" ||
      kind === "catering"
      ? scope.filter((r) => r.status === "confirmed")
      : scope;
  }
  function exportData(kind: string) {
    if (!data || error || loading) return;
    const rows = rowsFor(kind);
    let csv: string;
    if (kind === "catering") {
      const counts = data.stacks
        .filter((s) => stack === "all" || s.id === stack)
        .map((s) => [
          s.title,
          rows.filter((r) => r.stackId === s.id && r.food === "veg").length,
          rows.filter((r) => r.stackId === s.id && r.food === "non-veg").length,
        ]);
      csv =
        "\uFEFF" +
        [["Stack", "Vegetarian", "Non-vegetarian"], ...counts]
          .map((row) => row.map(csvCell).join(","))
          .join("\r\n");
    } else csv = makeCsv(rows, kind);
    downloadCsv(
      csv,
      `exodia-${data.preview ? "sample-" : ""}${data.paymentMode}-${kind}-${stack}.csv`,
    );
    setMessage(
      `${kind === "catering" ? "Catering counts" : `${rows.length} ${kind}`} prepared as CSV. Scope: ${stack === "all" ? "all stacks" : stackLabels[stack]}.`,
    );
  }
  return (
    <>
      <DashboardUi
        eyebrow="THE RIGHT DETAILS, READY TO GO."
        title="Exports"
        description="Useful lists for the team. Clean CSV files for the day."
      />
      <section className={styles.scope}>
        <div>
          <FileSpreadsheet size={20} />
          <div>
            <strong>Choose your export scope</strong>
            <p>
              {data
                ? `${scope.length} registrations · ${data.preview ? "Sample data" : `${data.paymentMode} payments`} · Loaded ${dateTime(data.updatedAt)} IST`
                : "Waiting for event data"}
            </p>
          </div>
        </div>
        <label>
          Learning stack
          <select
            value={stack}
            onChange={(e) => {
              setStack(e.target.value);
              setMessage("");
            }}
          >
            <option value="all">All learning stacks</option>
            {Object.entries(stackLabels).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </section>
      {message && (
        <div className={styles.success} role="status">
          <Check size={16} />
          {message}
        </div>
      )}
      <div className={styles.grid}>
        {exports.map((item) => (
          <section className={`${ui.panel} ${styles.export}`} key={item.id}>
            <div className={styles.icon}>
              <item.icon size={23} strokeWidth={1.5} />
            </div>
            <h2>{item.title}</h2>
            <p>{item.caption}</p>
            <div className={styles.exportMeta}>
              <span>
                {data ? rowsFor(item.id).length : "—"}{" "}
                {item.id === "catering" ? "confirmed participants" : "records"}
              </span>
              <span>CSV</span>
            </div>
            <button
              className={ui.button}
              disabled={!data || !!error || loading || !rowsFor(item.id).length}
              onClick={() => exportData(item.id)}
            >
              <Download size={14} />
              Download CSV
            </button>
          </section>
        ))}
      </div>
      <p className={styles.note}>
        Exports use the complete loaded list for the selected scope. To export a
        selection or a search result, use the Registrations page. Ticket tokens
        are excluded.
      </p>
    </>
  );
}
