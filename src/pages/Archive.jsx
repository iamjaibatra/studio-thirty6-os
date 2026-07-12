import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, Archive as ArchiveIcon } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import { listArchiveLog } from "../services/archiveLog";

export default function Archive() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function refresh() {
    setLoading(true);
    setError(null);
    listArchiveLog()
      .then(setItems)
      .catch(setError)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timer = setTimeout(refresh, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight text-[var(--color-ink)]">Archive</h1>
        <p className="mt-0.5 text-[12.5px] text-[var(--color-ink-muted)]">
          Projects removed from active use via the "Archive" action on the Projects page. Read-only —
          this is a lightweight log (title/category/media/date), not a full project snapshot.
        </p>
      </div>

      {error && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-danger-soft)] px-4 py-3">
          <div className="flex items-center gap-2.5 text-[13px] text-[var(--color-danger)]">
            <AlertTriangle size={15} />
            <span>Couldn't load the archive: {error.message || "Unknown error"}</span>
          </div>
          <button onClick={refresh} className="flex items-center gap-1.5 rounded-[var(--radius-control)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--color-danger)] hover:bg-black/10">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface)]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 py-16 text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-elevated-2)] text-[var(--color-ink-faint)]">
            <ArchiveIcon size={20} />
          </div>
          <h3 className="text-[14px] font-semibold text-[var(--color-ink)]">Nothing archived yet</h3>
          <p className="mt-1 max-w-sm text-[12.5px] text-[var(--color-ink-muted)]">
            Projects you archive from the Projects page will show up here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 px-4 py-3.5 ${i !== items.length - 1 ? "border-b border-[var(--color-border)]" : ""}`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-[var(--color-elevated)]">
                {item.url ? (
                  <img src={item.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ArchiveIcon size={14} className="text-[var(--color-ink-faint)]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-[var(--color-ink)]">{item.title || "Untitled"}</p>
                <p className="truncate text-[11.5px] text-[var(--color-ink-muted)]">
                  {[item.category, new Date(item.created_at).toLocaleDateString()].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
