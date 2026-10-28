"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { api } from "@/app/lib/client";
import type { Snapshot } from "@/app/lib/domain";
import styles from "./DashboardProvider.module.css";
type State = {
  data: Snapshot | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  preview: boolean;
  mainSite: string;
  search: string;
  setSearch: (value: string) => void;
};
const Context = createContext<State | null>(null);
export function useDashboard() {
  const value = useContext(Context);
  if (!value) throw new Error("Dashboard provider missing.");
  return value;
}
export default function DashboardProvider({
  children,
  preview,
  mainSite,
}: {
  children: React.ReactNode;
  preview: boolean;
  mainSite: string;
}) {
  const [data, setData] = useState<Snapshot | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const controller = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    controller.current?.abort();
    const ctrl = new AbortController();
    controller.current = ctrl;
    setLoading(true);
    setError("");
    try {
      const next = await api<Snapshot>("/api/snapshot", {
        signal: ctrl.signal,
      });
      if (!ctrl.signal.aborted) setData(next);
    } catch (cause) {
      if (!ctrl.signal.aborted) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to load registrations.",
        );
      }
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, []);
  useEffect(() => {
    const initial = setTimeout(() => void refresh(), 0);
    return () => {
      clearTimeout(initial);
      controller.current?.abort();
    };
  }, [refresh]);
  return (
    <Context.Provider
      value={{
        data,
        loading,
        error,
        refresh,
        preview,
        mainSite,
        search,
        setSearch,
      }}
    >
      {error && (
        <div className={styles.error} role="alert">
          <span>
            {data ? "Refresh failed. Showing the last loaded data. " : ""}
            {error}
          </span>
          <button onClick={() => void refresh()}>Try again</button>
        </div>
      )}
      {children}
    </Context.Provider>
  );
}
