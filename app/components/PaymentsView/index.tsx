"use client";
import { AlertCircle, Clock3, Receipt, Wallet } from "lucide-react";
import DashboardUi, { ui } from "@/app/components/DashboardUi";
import { useDashboard } from "@/app/components/DashboardProvider";
import RegistrationTable from "@/app/components/RegistrationTable";
import { money, summarize } from "@/app/lib/domain";
import styles from "./PaymentsView.module.css";
export default function PaymentsView() {
  const { data } = useDashboard();
  const totals = summarize(data?.registrations ?? []);
  const metrics = [
    {
      label: "Confirmed registration amount",
      value: money(totals.amount),
      icon: Wallet,
    },
    { label: "Confirmed payments", value: totals.confirmed, icon: Receipt },
    { label: "Pending payment", value: totals.pending, icon: Clock3 },
    { label: "Payment exceptions", value: totals.review, icon: AlertCircle },
  ];
  return (
    <>
      <DashboardUi
        eyebrow="A CLEARER VIEW OF EVERY PAYMENT."
        title="Payments"
        description="Registration amounts and Razorpay references, together in one place."
      />
      <div className={styles.metrics}>
        {metrics.map((m) => (
          <div key={m.label} className={ui.panel}>
            <m.icon size={18} />
            <span>{m.label}</span>
            <strong>{data ? m.value : "—"}</strong>
          </div>
        ))}
      </div>
      <div className={ui.notice}>
        {data?.preview
          ? "Sample payment references. "
          : data?.paymentMode === "test"
            ? "Razorpay test payments. No real money was collected. "
            : "Live payment mode. "}
        Amounts below describe registrations. Use Razorpay for settlement,
        refund amounts, and payment-attempt history.
      </div>
      <section className={ui.panel}>
        <RegistrationTable view="payments" />
      </section>
    </>
  );
}
