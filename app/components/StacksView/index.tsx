"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  Cpu,
  Gamepad2,
  Layers3,
  Leaf,
  UtensilsCrossed,
} from "lucide-react";
import DashboardUi, {
  LoadingState,
  EmptyState,
  ui,
} from "@/app/components/DashboardUi";
import { useDashboard } from "@/app/components/DashboardProvider";
import { summarize } from "@/app/lib/domain";
import styles from "./StacksView.module.css";
const icons = [Bot, Cpu, Gamepad2],
  captions = [
    "Think. Plan. Act.",
    "Sense. Connect. Respond.",
    "Imagine. Create. Play.",
  ];
export default function StacksView() {
  const { data, loading } = useDashboard();
  const totals = summarize(data?.registrations ?? []);
  return (
    <>
      <DashboardUi
        eyebrow="THREE PATHS. ENDLESS POSSIBILITIES."
        title="Learning stacks"
        description="Keep an eye on seats, participants, and the details that make the day work."
      />
      {!data ? (
        loading ? (
          <LoadingState />
        ) : (
          <EmptyState title="Stack data unavailable" />
        )
      ) : (
        <>
          <div className={styles.grid}>
            {data.stacks.map((stack, i) => {
              const confirmed = data.registrations.filter(
                  (r) => r.stackId === stack.id && r.status === "confirmed",
                ),
                remaining =
                  stack.capacity === null
                    ? null
                    : Math.max(
                        0,
                        stack.capacity - confirmed.length - stack.held,
                      ),
                Icon = icons[i % 3];
              return (
                <section
                  key={stack.id}
                  className={`${ui.panel} ${styles.stack}`}
                >
                  <div className={styles.stackTop}>
                    <span>STACK 0{i + 1}</span>
                    <span>{stack.active ? "ACTIVE" : "INACTIVE"}</span>
                  </div>
                  <div
                    className={`${styles.stackIcon} ${styles[stack.id.replaceAll("-", "")]}`}
                  >
                    <Icon size={31} strokeWidth={1.3} />
                  </div>
                  <h2>{stack.title}</h2>
                  <p>{captions[i % 3]}</p>
                  <div className={styles.occupancy}>
                    <strong>{confirmed.length}</strong>
                    <span>/ {stack.capacity ?? "—"} seats confirmed</span>
                  </div>
                  <div className={styles.progress}>
                    <span
                      style={{
                        width: `${stack.capacity ? Math.min(100, (confirmed.length / stack.capacity) * 100) : 0}%`,
                      }}
                    />
                    <i
                      style={{
                        width: `${stack.capacity ? Math.min(100, (stack.held / stack.capacity) * 100) : 0}%`,
                      }}
                    />
                  </div>
                  <dl>
                    <div>
                      <dt>Available seats</dt>
                      <dd>{remaining ?? "Not configured"}</dd>
                    </div>
                    <div>
                      <dt>Active payment holds</dt>
                      <dd>{stack.held}</dd>
                    </div>
                    <div>
                      <dt>Checked in</dt>
                      <dd>
                        {confirmed.filter((r) => r.checkedInAt !== null).length}
                      </dd>
                    </div>
                  </dl>
                  <Link href={`/registrations?stack=${stack.id}`}>
                    View registrations
                    <ArrowUpRight size={15} />
                  </Link>
                </section>
              );
            })}
          </div>
          <section className={`${ui.panel} ${styles.food}`}>
            <div className={styles.foodIntro}>
              <UtensilsCrossed size={23} />
              <h2>A seat at the table.</h2>
              <p>Food preferences across confirmed registrations.</p>
            </div>
            <div>
              <Leaf size={19} />
              <strong>
                {totals.veg}
                <span>Vegetarian</span>
              </strong>
            </div>
            <div>
              <UtensilsCrossed size={19} />
              <strong>
                {totals.nonVeg}
                <span>Non-vegetarian</span>
              </strong>
            </div>
            <Link href="/exports" className={ui.button}>
              Export catering counts
              <ArrowUpRight size={13} />
            </Link>
          </section>
          <div className={styles.note}>
            <Layers3 size={14} />
            Available seats exclude confirmed registrations and active payment
            holds in the selected payment mode.
          </div>
        </>
      )}
    </>
  );
}
