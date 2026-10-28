"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  X,
} from "lucide-react";
import { useDashboard } from "@/app/components/DashboardProvider";
import {
  EmptyState,
  LoadingState,
  StatusBadge,
  ui,
} from "@/app/components/DashboardUi";
import {
  dateTime,
  filterRegistrations,
  initials,
  makeCsv,
  money,
  stackLabels,
  statusLabels,
} from "@/app/lib/domain";
import { downloadCsv } from "@/app/lib/client";
import styles from "./RegistrationTable.module.css";
export default function RegistrationTable({
  compact = false,
  view = "registrations",
  initialStatus = "all",
  initialStack = "all",
}: {
  compact?: boolean;
  view?: "registrations" | "participants" | "payments";
  initialStatus?: string;
  initialStack?: string;
}) {
  const { data, loading, error, search, setSearch } = useDashboard();
  const [status, setStatus] = useState(initialStatus),
    [stack, setStack] = useState(initialStack),
    [page, setPage] = useState(1),
    [sort, setSort] = useState("newest"),
    [selected, setSelected] = useState<Set<string>>(new Set());
  const rows = useMemo(() => {
    let list = filterRegistrations(
      data?.registrations ?? [],
      compact ? "" : search,
      compact ? "all" : status,
      compact ? "all" : stack,
    );
    if (view === "participants")
      list = list.filter((r) => r.status === "confirmed");
    return list.sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : sort === "oldest"
          ? a.createdAt - b.createdAt
          : b.createdAt - a.createdAt,
    );
  }, [data, search, status, stack, compact, sort, view]);
  const size = compact ? 5 : 10,
    pageCount = Math.max(1, Math.ceil(rows.length / size)),
    current = Math.min(page, pageCount);
  const visible = compact
    ? rows.slice(0, 5)
    : rows.slice((current - 1) * size, current * size);
  const selection = rows.filter((r) => selected.has(r.id));
  function reset() {
    setSearch("");
    setStatus("all");
    setStack("all");
    setPage(1);
    setSelected(new Set());
  }
  if (!data)
    return loading ? (
      <LoadingState />
    ) : (
      <EmptyState
        title="Registration data unavailable"
        description="Use Try again in the connection message to reload."
      />
    );
  return (
    <div>
      {!compact && (
        <>
          <div className={styles.toolbar}>
            <label className={styles.search}>
              <Search size={16} />
              <input
                aria-label="Filter registrations"
                placeholder="Search name, reference, college, email…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              {search && (
                <button aria-label="Clear search" onClick={() => setSearch("")}>
                  <X size={14} />
                </button>
              )}
            </label>
            <div className={styles.filters}>
              <select
                aria-label="Filter by status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All statuses</option>
                {view === "participants" ? (
                  <>
                    <option value="arrived">Checked in</option>
                    <option value="waiting">Not checked in</option>
                  </>
                ) : (
                  Object.entries(statusLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))
                )}
              </select>
              <select
                aria-label="Filter by learning stack"
                value={stack}
                onChange={(e) => {
                  setStack(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All stacks</option>
                {Object.entries(stackLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.resultBar}>
            <span>
              <b>{rows.length}</b> {view}
              {selection.length > 0 && (
                <span>
                  {" "}
                  · {selection.length} selected{" "}
                  <button onClick={() => setSelected(new Set())}>Clear</button>
                </span>
              )}
            </span>
            <div>
              <label className={styles.sort}>
                <ArrowDownUp size={12} />
                <select
                  aria-label="Sort registrations"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="name">Name A–Z</option>
                </select>
              </label>
              <button
                disabled={!rows.length || !!error || loading}
                className={`${ui.button} ${ui.small}`}
                onClick={() =>
                  downloadCsv(
                    makeCsv(selection.length ? selection : rows, view),
                    `exodia-${data.preview ? "sample-" : ""}${data.paymentMode}-${view}.csv`,
                  )
                }
              >
                <Download size={12} />
                {selection.length ? "Export selected" : "Export matching"}
              </button>
            </div>
          </div>
        </>
      )}
      {!rows.length ? (
        <EmptyState
          title="No registrations found"
          description="Try a different search or clear the filters."
        >
          <button className={ui.button} onClick={reset}>
            Clear filters
          </button>
        </EmptyState>
      ) : (
        <>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <caption className={styles.srOnly}>
                {view} ·{" "}
                {data.preview ? "sample data" : data.paymentMode + " payments"}
              </caption>
              <thead>
                <tr>
                  {!compact && (
                    <th className={styles.checkbox}>
                      <input
                        type="checkbox"
                        aria-label="Select all matching registrations"
                        checked={
                          rows.length > 0 && selection.length === rows.length
                        }
                        onChange={(e) =>
                          setSelected(
                            e.target.checked
                              ? new Set(rows.map((r) => r.id))
                              : new Set(),
                          )
                        }
                      />
                    </th>
                  )}
                  <th>
                    {view === "participants" ? "PARTICIPANT" : "REGISTRATION"}
                  </th>
                  <th>{view === "payments" ? "PAYMENT" : "LEARNING STACK"}</th>
                  <th>{view === "participants" ? "FOOD" : "STATUS"}</th>
                  <th>
                    {view === "participants"
                      ? "ARRIVAL"
                      : view === "payments"
                        ? "AMOUNT"
                        : "REGISTERED"}
                  </th>
                  <th>
                    <span className={styles.srOnly}>Open details</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.id}>
                    {!compact && (
                      <td className={styles.checkbox}>
                        <input
                          type="checkbox"
                          aria-label={`Select ${row.reference}`}
                          checked={selected.has(row.id)}
                          onChange={(e) => {
                            const next = new Set(selected);
                            if (e.target.checked) next.add(row.id);
                            else next.delete(row.id);
                            setSelected(next);
                          }}
                        />
                      </td>
                    )}
                    <td>
                      <Link
                        href={`/registrations/${row.id}`}
                        className={styles.person}
                      >
                        <span
                          className={`${styles.initial} ${styles[row.stackId.replaceAll("-", "")]}`}
                        >
                          {initials(row.name)}
                        </span>
                        <span>
                          <strong>{row.name}</strong>
                          <small>
                            {view === "participants"
                              ? row.college
                              : row.reference}
                          </small>
                        </span>
                      </Link>
                    </td>
                    <td>
                      {view === "payments" ? (
                        <div className={styles.payment}>
                          <span>{row.paymentId ?? "Awaiting payment"}</span>
                          <small>{row.orderId ?? "No order"}</small>
                        </div>
                      ) : (
                        <span className={styles.stack}>
                          <i
                            className={styles[row.stackId.replaceAll("-", "")]}
                          />
                          {row.stackTitle}
                        </span>
                      )}
                    </td>
                    <td>
                      {view === "participants" ? (
                        <span
                          className={`${styles.food} ${row.food === "veg" ? styles.veg : ""}`}
                        >
                          <i />
                          {row.food === "veg" ? "Veg" : "Non-veg"}
                        </span>
                      ) : (
                        <StatusBadge status={row.status} />
                      )}
                    </td>
                    <td>
                      {view === "participants" ? (
                        <StatusBadge
                          status={
                            row.checkedInAt !== null ? "arrived" : "waiting"
                          }
                        />
                      ) : view === "payments" ? (
                        <strong className={styles.amount}>
                          {money(row.amount)}
                        </strong>
                      ) : (
                        <span className={styles.date}>
                          {dateTime(row.createdAt, true)}
                        </span>
                      )}
                    </td>
                    <td>
                      <Link
                        className={styles.open}
                        href={`/registrations/${row.id}`}
                        aria-label={`View ${row.name}, ${row.reference}`}
                      >
                        <ArrowUpRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!compact && (
            <div className={styles.pagination}>
              <span>
                Showing {(current - 1) * size + 1}–
                {Math.min(current * size, rows.length)} of {rows.length}
              </span>
              <div>
                <button
                  aria-label="Previous page"
                  disabled={current === 1}
                  onClick={() => setPage(current - 1)}
                >
                  <ChevronLeft size={15} />
                </button>
                <span>
                  Page {current} of {pageCount}
                </span>
                <button
                  aria-label="Next page"
                  disabled={current === pageCount}
                  onClick={() => setPage(current + 1)}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
