"use client";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCheck,
  ClipboardList,
  Clock3,
  Download,
  ScanLine,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import DashboardUi, { PanelHeader, ui } from "@/app/components/DashboardUi";
import RegistrationTable from "@/app/components/RegistrationTable";
import { useDashboard } from "@/app/components/DashboardProvider";
import { money, summarize } from "@/app/lib/domain";
import styles from "./Overview.module.css";
export default function Overview() {
  const { data, loading } = useDashboard();
  const summary = summarize(data?.registrations ?? []);
  const ready = !!data;
  const percentage = summary.confirmed
    ? Math.round((summary.arrived / summary.confirmed) * 100)
    : 0;
  const metrics = [
    {
      label: "Total registrations",
      value: String(summary.total).padStart(2, "0"),
      caption: `${summary.confirmed} confirmed · ${summary.pending} pending`,
      icon: ClipboardList,
      color: "lavender",
      href: "/registrations",
    },
    {
      label: "Confirmed participants",
      value: String(summary.confirmed).padStart(2, "0"),
      caption: "One person. One learning stack.",
      icon: Users,
      color: "peach",
      href: "/participants",
    },
    {
      label: "Confirmed registration amount",
      value: money(summary.amount),
      caption:
        data?.paymentMode === "test"
          ? "Test payments · no real money"
          : "Across confirmed registrations",
      icon: Wallet,
      color: "green",
      href: "/payments",
    },
    {
      label: "Checked in",
      value: String(summary.arrived).padStart(2, "0"),
      caption: `${summary.confirmed - summary.arrived} participants to welcome`,
      icon: ScanLine,
      color: "gold",
      href: "/check-in",
    },
  ];
  const anchor = data ? data.updatedAt * 1000 : 0;
  const dayKey = (ms: number) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(ms);
  const days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(anchor - (13 - i) * 86400_000);
    const key = dayKey(date.getTime());
    const rows = (data?.registrations ?? []).filter(
      (r) => dayKey(r.createdAt * 1000) === key,
    );
    return {
      label: new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        timeZone: "Asia/Kolkata",
      }).format(date),
      confirmed: rows.filter((r) => r.status === "confirmed").length,
      other: rows.filter((r) => r.status !== "confirmed").length,
    };
  });
  const max = Math.max(4, ...days.map((d) => d.confirmed + d.other));
  return (
    <>
      <DashboardUi
        title="Overview"
        description="Every registration. Every learning journey. All in one place."
      >
        <Link className={ui.button} href="/exports">
          <Download size={14} />
          Export data
        </Link>
        <Link className={`${ui.button} ${ui.primary}`} href="/check-in">
          <ScanLine size={15} />
          Open check-in
          <ArrowUpRight size={13} />
        </Link>
      </DashboardUi>
      <div className={styles.metrics}>
        {metrics.map((metric) => (
          <Link
            href={metric.href}
            className={`${styles.metric} ${styles[metric.color]}`}
            key={metric.label}
          >
            <div>
              <span>{metric.label}</span>
              <i>
                <metric.icon size={17} strokeWidth={1.5} />
              </i>
            </div>
            <strong>{ready ? metric.value : "—"}</strong>
            <p>
              {ready
                ? metric.caption
                : loading
                  ? "Loading event data…"
                  : "Data unavailable"}
              <ArrowUpRight size={11} />
            </p>
          </Link>
        ))}
      </div>
      <div className={styles.chartGrid}>
        <section className={ui.panel}>
          <PanelHeader
            title="Registration pulse"
            caption="A little momentum, day by day."
          />
          <div className={styles.chartLegend}>
            <span>
              <i />
              Confirmed
            </span>
            <span>
              <i />
              Other registrations
            </span>
            <small>LAST 14 DAYS · IST</small>
          </div>
          <div
            className={styles.chart}
            role="img"
            aria-label={
              ready
                ? `Registrations over the last 14 days: ${days.map((d) => `${d.label}, ${d.confirmed} confirmed and ${d.other} other`).join("; ")}`
                : "Registration chart loading"
            }
          >
            <div className={styles.axis}>
              <span>{max}</span>
              <span>{Math.ceil(max / 2)}</span>
              <span>0</span>
            </div>
            <div className={styles.plot}>
              <div className={styles.gridLines}>
                <i />
                <i />
                <i />
              </div>
              <div className={styles.bars}>
                {days.map((day, i) => (
                  <div key={i} className={styles.day}>
                    <div
                      className={styles.barTrack}
                      title={`${day.label}: ${day.confirmed} confirmed, ${day.other} other`}
                    >
                      <div
                        className={styles.bar}
                        style={{
                          height: `${Math.max(1, ((day.confirmed + day.other) / max) * 100)}%`,
                        }}
                      >
                        <div
                          style={{ flex: day.other }}
                          className={styles.other}
                        />
                        <div
                          style={{ flex: day.confirmed }}
                          className={styles.confirmed}
                        />
                      </div>
                    </div>
                    <small>{i % 4 === 0 || i === 13 ? day.label : ""}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.panelFoot}>
            <span>INDIVIDUAL REGISTRATIONS</span>
            <span>
              {data
                ? "Updated " +
                  new Intl.DateTimeFormat("en-IN", {
                    timeZone: "Asia/Kolkata",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(data.updatedAt * 1000) +
                  " IST"
                : "Awaiting data"}
              <i />
            </span>
          </div>
        </section>
        <section className={ui.panel}>
          <PanelHeader
            title="The welcome count"
            caption="From registered to right here."
          />
          <div className={styles.donutWrap}>
            <div
              className={styles.donut}
              style={{
                background: `conic-gradient(var(--color-lavender) ${percentage}%, #292534 0)`,
              }}
            >
              <div>
                <strong>{ready ? `${percentage}%` : "—"}</strong>
                <small>CHECKED IN</small>
              </div>
            </div>
          </div>
          <div className={styles.welcomeLegend}>
            <div>
              <span>
                <i />
                Arrived
              </span>
              <b>{ready ? summary.arrived : "—"}</b>
            </div>
            <div>
              <span>
                <i />
                On their way
              </span>
              <b>{ready ? summary.confirmed - summary.arrived : "—"}</b>
            </div>
          </div>
          <Link href="/check-in" className={styles.welcomeLink}>
            Welcome the next participant
            <ArrowRight size={15} />
          </Link>
        </section>
      </div>
      <div className={styles.bottomGrid}>
        <section className={ui.panel}>
          <PanelHeader
            title="Recent registrations"
            caption="The newest names in the next chapter."
            href="/registrations"
          />
          <RegistrationTable compact />
          <div className={styles.tableFoot}>
            <span>One spark of curiosity at a time.</span>
            <Sparkles size={14} />
          </div>
        </section>
        <aside className={styles.aside}>
          <section className={ui.panel}>
            <PanelHeader
              title="Learning stacks"
              caption="Three paths. Endless possibilities."
              href="/stacks"
              label="Explore"
            />
            <div className={styles.stacks}>
              {(data?.stacks ?? []).map((stack, i) => {
                const count = data!.registrations.filter(
                  (r) => r.stackId === stack.id && r.status === "confirmed",
                ).length;
                return (
                  <Link
                    href={`/registrations?stack=${stack.id}`}
                    key={stack.id}
                    className={styles.stackRow}
                  >
                    <div>
                      <span className={styles.stackNumber}>0{i + 1}</span>
                      <strong>{stack.title}</strong>
                      <small>
                        {count}
                        <span> / {stack.capacity ?? "—"}</span>
                      </small>
                    </div>
                    <div className={styles.progress}>
                      <span
                        style={{
                          width: `${stack.capacity ? Math.min(100, (count / stack.capacity) * 100) : 0}%`,
                          background: [
                            "var(--color-lavender)",
                            "var(--color-peach)",
                            "var(--color-green)",
                          ][i],
                        }}
                      />
                    </div>
                  </Link>
                );
              })}
              {!ready && <p className={styles.waiting}>Awaiting stack data…</p>}
            </div>
          </section>
          <section className={ui.panel}>
            <PanelHeader title="At a glance" />
            <div className={styles.glance}>
              <Link href="/registrations?status=confirmed">
                <span>
                  <CheckCheck size={15} />
                </span>
                <div>
                  Payment complete<small>Confirmed registrations</small>
                </div>
                <b>{ready ? summary.confirmed : "—"}</b>
                <ArrowUpRight size={12} />
              </Link>
              <Link href="/registrations?status=paid_exception">
                <span>
                  <Clock3 size={15} />
                </span>
                <div>
                  Needs a closer look<small>Payment exceptions</small>
                </div>
                <b>{ready ? summary.review : "—"}</b>
                <ArrowUpRight size={12} />
              </Link>
            </div>
          </section>
        </aside>
      </div>
      <div className={styles.closing}>
        <Sparkles size={18} />
        <span>
          Where curiosity becomes <em>creation.</em>
        </span>
        <span>EXODIA 4.0 / JANUARY ’27</span>
      </div>
    </>
  );
}
