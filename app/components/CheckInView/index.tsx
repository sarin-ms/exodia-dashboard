"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Camera,
  Check,
  CircleCheck,
  Clock3,
  Keyboard,
  LoaderCircle,
  ScanLine,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import DashboardUi, { ui } from "@/app/components/DashboardUi";
import { useDashboard } from "@/app/components/DashboardProvider";
import QrCamera from "@/app/components/QrCamera";
import { api, RequestError } from "@/app/lib/client";
import { dateTime, initials, type Registration } from "@/app/lib/domain";
import styles from "./CheckInView.module.css";
type Phase =
  | "idle"
  | "validating"
  | "ready"
  | "checking"
  | "success"
  | "already"
  | "error"
  | "uncertain";
export default function CheckInView({
  reference = "",
}: {
  reference?: string;
}) {
  const { refresh, preview } = useDashboard();
  const [input, setInput] = useState(reference),
    [camera, setCamera] = useState(false),
    [cameraError, setCameraError] = useState("");
  const [phase, setPhase] = useState<Phase>("idle"),
    [ticket, setTicket] = useState<Registration | null>(null),
    [message, setMessage] = useState("");
  const readController = useRef<AbortController | null>(null),
    sequence = useRef(0),
    writing = useRef(false),
    mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      readController.current?.abort();
    };
  }, []);
  const validate = useCallback(async (value: string) => {
    if (writing.current) return;
    readController.current?.abort();
    const ctrl = new AbortController();
    readController.current = ctrl;
    const version = ++sequence.current;
    setCamera(false);
    setTicket(null);
    setMessage("");
    setPhase("validating");
    try {
      const row = await api<Registration>("/api/tickets/validate", {
        method: "POST",
        body: JSON.stringify({ ticket: value }),
        signal: ctrl.signal,
      });
      if (ctrl.signal.aborted || version !== sequence.current) return;
      setTicket(row);
      setPhase(row.checkedInAt === null ? "ready" : "already");
    } catch (cause) {
      if (!ctrl.signal.aborted && version === sequence.current) {
        setPhase("error");
        setMessage(
          cause instanceof Error
            ? cause.message
            : "Unable to validate this ticket.",
        );
      }
    }
  }, []);
  function reset() {
    if (writing.current) return;
    readController.current?.abort();
    sequence.current++;
    setTicket(null);
    setPhase("idle");
    setMessage("");
    setInput("");
  }
  async function commit() {
    if (writing.current || !ticket || phase !== "ready") return;
    writing.current = true;
    setPhase("checking");
    try {
      const row = await api<Registration>("/api/check-in", {
        method: "POST",
        body: JSON.stringify({ registrationId: ticket.id }),
      });
      void refresh();
      if (mounted.current) {
        setTicket(row);
        setPhase("success");
      }
    } catch (cause) {
      if (!mounted.current) return;
      setPhase("uncertain");
      setMessage(
        cause instanceof RequestError && cause.status === 409
          ? cause.message
          : "The response could not be confirmed. Validate this ticket again to check whether arrival was recorded.",
      );
    } finally {
      writing.current = false;
    }
  }
  const busy = phase === "validating" || phase === "checking";
  return (
    <>
      <DashboardUi
        eyebrow="MAKE THE FIRST MOMENT A GOOD ONE."
        title="Gate check-in"
        description="Scan. Verify. Welcome them to Exodia."
      >
        <Link className={ui.button} href="/registrations">
          <Search size={14} />
          Find a registration
        </Link>
      </DashboardUi>
      {preview && (
        <div className={ui.notice}>
          Preview check-ins use the sample EX4 references in Registrations. Live
          mode accepts the private ticket link, its token, or the registration
          reference.
        </div>
      )}
      <div className={styles.layout}>
        <section className={`${ui.panel} ${styles.scanner}`}>
          <div className={styles.sectionHeading}>
            <div>
              <h2>Ticket scanner</h2>
              <p>One participant. One pass. One welcome.</p>
            </div>
            <span>
              <i />
              GATE DESK
            </span>
          </div>
          <QrCamera
            active={camera}
            onDecode={(value) => {
              setInput(value);
              void validate(value);
            }}
            onError={(error) => {
              setCamera(false);
              setCameraError(error);
            }}
          />
          <div className={styles.cameraControls}>
            <button
              disabled={busy}
              className={`${ui.button} ${camera ? "" : ui.primary}`}
              onClick={() => {
                if (camera) setCamera(false);
                else {
                  reset();
                  setCameraError("");
                  setCamera(true);
                }
              }}
            >
              {camera ? <X size={14} /> : <Camera size={14} />}{" "}
              {camera ? "Stop camera" : "Start camera"}
            </button>
            <span>Rear camera recommended</span>
          </div>
          {cameraError && (
            <div className={styles.error} role="alert">
              <AlertCircle size={15} />
              {cameraError}
            </div>
          )}
          <div className={styles.divider}>
            <span />
            OR ENTER IT MANUALLY
            <span />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void validate(input);
            }}
            className={styles.form}
          >
            <label htmlFor="ticket">
              <Keyboard size={14} />
              Ticket link, token, or EX4 reference
            </label>
            <div>
              <input
                id="ticket"
                value={input}
                disabled={phase === "checking"}
                maxLength={1000}
                autoComplete="off"
                spellCheck={false}
                placeholder="EX4-0000000000000003"
                onChange={(e) => {
                  readController.current?.abort();
                  sequence.current++;
                  setInput(e.target.value);
                  setTicket(null);
                  setPhase("idle");
                  setMessage("");
                }}
              />
              <button
                className={`${ui.button} ${ui.primary}`}
                disabled={busy || !input.trim()}
                type="submit"
              >
                {phase === "validating" ? (
                  <LoaderCircle className={styles.spin} size={15} />
                ) : (
                  <ArrowRight size={15} />
                )}
                Validate
              </button>
            </div>
            <p>
              Can’t find the ticket? Search the attendee’s name, email, or phone
              in registrations.
            </p>
          </form>
        </section>
        <div>
          <section
            className={`${ui.panel} ${styles.verification}`}
            aria-live="polite"
          >
            <div className={styles.sectionHeading}>
              <div>
                <h2>Attendee verification</h2>
                <p>Check the details before admission.</p>
              </div>
              <ShieldCheck size={18} />
            </div>
            {phase === "idle" ? (
              <div className={styles.empty}>
                <span>
                  <Users size={33} strokeWidth={1.2} />
                </span>
                <h3>Waiting for the next hello.</h3>
                <p>
                  Scan a ticket or enter its reference.
                  <br />
                  The attendee’s details will appear here.
                </p>
                <div>
                  01 Scan <ArrowRight size={11} />
                  02 Verify <ArrowRight size={11} />
                  03 Welcome
                </div>
              </div>
            ) : phase === "validating" ? (
              <div className={styles.empty}>
                <LoaderCircle size={25} className={styles.spin} />
                <p>Validating ticket…</p>
              </div>
            ) : (
              <div className={styles.result}>
                {["success", "already", "error", "uncertain"].includes(
                  phase,
                ) && (
                  <div
                    className={`${styles.outcome} ${phase === "success" ? styles.success : styles.warning}`}
                  >
                    {phase === "success" ? (
                      <CircleCheck size={29} />
                    ) : phase === "already" ? (
                      <Clock3 size={29} />
                    ) : (
                      <AlertCircle size={29} />
                    )}
                    <h3>
                      {phase === "success"
                        ? "You’re all set. Welcome!"
                        : phase === "already"
                          ? "Already checked in"
                          : phase === "uncertain"
                            ? "Arrival needs confirmation"
                            : "Ticket couldn’t be validated"}
                    </h3>
                    <p>
                      {phase === "success" || phase === "already"
                        ? `${phase === "already" ? "Previous arrival" : "Arrival recorded"} · ${dateTime(ticket?.checkedInAt ?? null)} IST`
                        : message}
                    </p>
                  </div>
                )}
                {ticket && (
                  <>
                    <div className={styles.person}>
                      <span>{initials(ticket.name)}</span>
                      <h3>{ticket.name}</h3>
                      <p>{ticket.reference}</p>
                    </div>
                    <dl className={styles.details}>
                      <div>
                        <dt>College</dt>
                        <dd>{ticket.college}</dd>
                      </div>
                      <div>
                        <dt>Learning stack</dt>
                        <dd>{ticket.stackTitle}</dd>
                      </div>
                      <div>
                        <dt>Year of study</dt>
                        <dd>Year {ticket.year}</dd>
                      </div>
                      <div>
                        <dt>Food preference</dt>
                        <dd>
                          {ticket.food === "veg"
                            ? "Vegetarian"
                            : "Non-vegetarian"}
                        </dd>
                      </div>
                    </dl>
                    {phase === "ready" && (
                      <p className={styles.eligible}>
                        <BadgeCheck size={15} />
                        Confirmed registration · Ready for check-in
                      </p>
                    )}
                    {(phase === "ready" || phase === "checking") && (
                      <button
                        className={`${ui.button} ${ui.primary} ${styles.fullWidth}`}
                        onClick={() => void commit()}
                        disabled={phase === "checking"}
                      >
                        {phase === "checking" ? (
                          <LoaderCircle size={16} className={styles.spin} />
                        ) : (
                          <Check size={16} />
                        )}{" "}
                        {phase === "checking"
                          ? "Recording arrival…"
                          : "Confirm check-in"}
                      </button>
                    )}
                    {phase === "uncertain" && (
                      <button
                        className={`${ui.button} ${ui.primary} ${styles.fullWidth}`}
                        onClick={() => void validate(input)}
                      >
                        Validate again
                      </button>
                    )}
                  </>
                )}
                {phase !== "checking" && (
                  <button
                    className={`${ui.button} ${styles.fullWidth}`}
                    onClick={reset}
                  >
                    Next attendee
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            )}
          </section>
          <div className={styles.tip}>
            <ScanLine size={20} />
            <div>
              <strong>A check-in belongs to one person.</strong>
              <p>
                Confirm the attendee’s identity before recording arrival.
                Scanning alone does not check them in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
