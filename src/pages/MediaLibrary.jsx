import { useRef, useState } from "react";
import { Upload, Library, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import MediaAssetCard from "../components/MediaAssetCard";
import MediaDetailModal from "../components/MediaDetailModal";
import { useMediaLibrary } from "../hooks/useMediaLibrary";

const TYPES = [
  { value: "", label: "All types" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "logo", label: "Logos" },
  { value: "icon", label: "Icons" },
  { value: "document", label: "Documents" },
];

export default function MediaLibrary() {
  const {
    assets,
    loading,
    error,
    filters,
    updateFilter,
    uploads,
    refresh,
    uploadMedia,
    updateMedia,
    deleteMedia,
    checkUsage,
  } = useMediaLibrary();

  const [selected, setSelected] = useState(null);
  const inputRef = useRef(null);

  function handleFileChange(e) {
    if (e.target.files?.length) uploadMedia(e.target.files);
    e.target.value = "";
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-[var(--color-ink)]">
            Media Library
          </h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--color-ink-muted)]">
            Upload once, reuse everywhere — projects, services, archive, timeline.
          </p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          <Upload size={15} />
          Upload
        </button>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <input
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          placeholder="Search by name or alt text…"
          className="min-w-[220px] flex-1 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[12.5px] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent-border)]"
        />
        <select
          value={filters.type}
          onChange={(e) => updateFilter("type", e.target.value)}
          className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[12.5px] text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-accent-border)]"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {uploads.length > 0 && (
        <div className="mb-5 space-y-2">
          {uploads.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[12px]"
            >
              {u.status === "uploading" && <Loader2 size={14} className="animate-spin text-[var(--color-accent)]" />}
              <span className="flex-1 truncate text-[var(--color-ink-muted)]">{u.name}</span>
              <span className="text-[var(--color-ink-faint)]">
                {u.status === "uploading" ? `${u.progress}%` : u.status === "done" ? "Done" : "Failed"}
              </span>
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-danger-soft)] px-4 py-3">
          <div className="flex items-center gap-2.5 text-[13px] text-[var(--color-danger)]">
            <AlertTriangle size={15} />
            <span>Couldn't load the media library: {error.message || "Unknown error"}</span>
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 rounded-[var(--radius-control)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--color-danger)] transition-colors hover:bg-black/10"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface)]" />
          ))}
        </div>
      )}

      {!loading && !error && assets.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 py-20 text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-elevated-2)] text-[var(--color-ink-faint)]">
            <Library size={20} />
          </div>
          <h3 className="text-[14px] font-semibold text-[var(--color-ink)]">No assets yet</h3>
          <p className="mt-1 max-w-sm text-[12.5px] text-[var(--color-ink-muted)]">
            Upload images, videos, logos, icons, or documents to reuse across the site.
          </p>
          <button
            onClick={() => inputRef.current?.click()}
            className="mt-5 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            Upload Files
          </button>
        </div>
      )}

      {!loading && !error && assets.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {assets.map((asset) => (
            <MediaAssetCard key={asset.id} asset={asset} onClick={() => setSelected(asset)} />
          ))}
        </div>
      )}

      <MediaDetailModal
        key={selected?.id || "none"}
        asset={selected}
        onClose={() => setSelected(null)}
        onSave={updateMedia}
        onDelete={deleteMedia}
        checkUsage={checkUsage}
      />
    </DashboardLayout>
  );
}
