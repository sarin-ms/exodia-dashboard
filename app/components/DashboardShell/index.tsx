"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Download,
  FlaskConical,
  Layers3,
  LayoutDashboard,
  Menu,
  RefreshCw,
  ScanLine,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useDashboard } from "@/app/components/DashboardProvider";
import styles from "./DashboardShell.module.css";
const navigation = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/registrations", label: "Registrations", icon: ClipboardList },
  { href: "/participants", label: "Participants", icon: Users },
  { href: "/stacks", label: "Learning stacks", icon: Layers3 },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/check-in", label: "Gate check-in", icon: ScanLine },
  { href: "/exports", label: "Exports", icon: Download },
];
export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(),
    router = useRouter(),
    dialog = useRef<HTMLDialogElement>(null),
    searchInput = useRef<HTMLInputElement>(null);
  const {
    preview,
    data,
    loading,
    error,
    refresh,
    mainSite,
    search,
    setSearch,
  } = useDashboard();
  const title =
    navigation.find((n) =>
      n.href === "/" ? pathname === "/" : pathname.startsWith(n.href),
    )?.label ?? "Registration details";
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (event.target as HTMLElement).tagName,
        )
      ) {
        event.preventDefault();
        searchInput.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  function navigationContent(mobile = false) {
    return (
      <>
        <div className={styles.brandRow}>
          <Link
            href="/"
            className={styles.brand}
            aria-label="Exodia overview"
            onClick={() => dialog.current?.close()}
          >
            exodia<span>4.0</span>
          </Link>
          {mobile && (
            <button
              className={styles.iconButton}
              aria-label="Close navigation"
              onClick={() => dialog.current?.close()}
            >
              <X size={20} />
            </button>
          )}
        </div>
        <div className={styles.workspaceLabel}>
          <i /> THE CONTROL ROOM
        </div>
        <div className={styles.navCaption}>WORKSPACE</div>
        <nav aria-label="Main navigation">
          {navigation.map((n) => {
            const active =
              n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`${styles.navItem} ${active ? styles.active : ""}`}
                onClick={() => dialog.current?.close()}
              >
                <n.icon size={18} strokeWidth={1.65} />
                <span>{n.label}</span>
                {active && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.gateCard}>
            <ScanLine size={23} />
            <strong>The next hello starts here.</strong>
            <p>One scan. A new possibility.</p>
            <Link href="/check-in" onClick={() => dialog.current?.close()}>
              Open gate scanner <ArrowUpRight size={14} />
            </Link>
          </div>
          <a
            className={styles.website}
            href={mainSite}
            target="_blank"
            rel="noreferrer"
          >
            Visit Exodia website <ArrowUpRight size={14} />
          </a>
          <div className={styles.signature}>
            <span>IEDC BOOTCAMP CEC</span>
            <small>WHERE CURIOSITY BECOMES CREATION</small>
          </div>
        </div>
      </>
    );
  }
  return (
    <div className={styles.shell}>
      <a className={styles.skip} href="#main-content">
        Skip to content
      </a>
      <aside className={styles.sidebar}>{navigationContent()}</aside>
      <dialog
        ref={dialog}
        className={styles.mobileDialog}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className={styles.mobileSidebar}>{navigationContent(true)}</div>
      </dialog>
      <div className={styles.mainColumn}>
        <header className={styles.topbar}>
          <div className={styles.breadcrumb}>
            <button
              className={`${styles.iconButton} ${styles.mobileMenu}`}
              aria-label="Open navigation"
              onClick={() => dialog.current?.showModal()}
            >
              <Menu size={21} />
            </button>
            <span className={styles.breadcrumbRoot}>Workspace</span>
            <ChevronRight size={13} />
            <span>{title}</span>
          </div>
          <div className={styles.topbarActions}>
            <form
              className={styles.search}
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                router.push("/registrations");
              }}
            >
              <Search size={15} />
              <input
                ref={searchInput}
                aria-label="Search registrations"
                placeholder="Search registrations…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <kbd>/</kbd>
            </form>
            <span
              className={`${styles.connection} ${error ? styles.disconnected : ""}`}
            >
              <i />
              {preview
                ? "Preview"
                : error
                  ? "Connection issue"
                  : loading
                    ? "Connecting"
                    : "Connected"}
            </span>
            <button
              className={styles.iconButton}
              aria-label="Refresh data"
              disabled={loading}
              onClick={() => void refresh()}
            >
              <RefreshCw size={16} className={loading ? styles.spinning : ""} />
            </button>
            <div className={styles.avatar} title="Exodia organizer">
              EX
            </div>
          </div>
        </header>
        <div className={styles.modeBar}>
          <div>
            {preview ? <FlaskConical size={13} /> : <Sparkles size={13} />}
            <span>{preview ? "PREVIEW WORKSPACE" : "ORGANIZER WORKSPACE"}</span>
            <span className={styles.modeDescription}>
              {preview
                ? "Explore with sample data. Check-ins reset when the server restarts."
                : "Exodia 4.0 · All Kerala Technical Learning Gala"}
            </span>
          </div>
          <span className={styles.modeTag}>
            {preview
              ? "SAMPLE DATA"
              : `${data?.paymentMode.toUpperCase() ?? "…"} PAYMENTS`}
          </span>
        </div>
        <main id="main-content" className={styles.content}>
          {children}
        </main>
        <footer className={styles.footer}>
          <span>
            EXODIA 4.0 <span>/ Organizer workspace</span>
          </span>
          <span>
            Curiosity. Connection. Creation. <Sparkles size={12} />
          </span>
        </footer>
      </div>
    </div>
  );
}
