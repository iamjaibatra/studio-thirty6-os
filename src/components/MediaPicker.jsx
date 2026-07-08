import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ImagePlus, X, Upload, Check } from "lucide-react";
import Modal from "./ui/Modal";
import { listMedia, uploadMedia } from "../services/media";
import { cn } from "../utils/cn";

/**
 * Reusable asset picker: shows the current selection (if any) with a
 * thumbnail, and a button that opens a modal to browse/search the Media
 * Library or upload a new file directly.
 *
 * @param {string} label
 * @param {"image"|"video"|"logo"|"icon"|"document"} [type] - restrict picker to one type
 * @param {{ id, url, name }|null} value
 * @param {(asset: object|null) => void} onChange
 */
export default function MediaPicker({ label, type, value, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <label className="mb-1.5 block text-[12.5px] font-medium text-[var(--color-ink-muted)]">{label}</label>

      <div className="flex items-center gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-[var(--color-elevated)]">
          {value?.url ? (
            type === "video" ? (
              <video src={value.url} className="h-full w-full object-cover" muted />
            ) : (
              <img src={value.url} alt="" className="h-full w-full object-cover" />
            )
          ) : (
            <ImagePlus size={16} className="text-[var(--color-ink-faint)]" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] text-[var(--color-ink)]">{value?.name || "None selected"}</p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-1.5 text-[12px] text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-elevated-2)]"
        >
          Choose
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Clear selection"
            className="shrink-0 rounded-md p-1.5 text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-elevated-2)]"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {open && (
        <MediaPickerModal
          type={type}
          onClose={() => setOpen(false)}
          onSelect={(asset) => {
            onChange(asset);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function MediaPickerModal({ type, onClose, onSelect }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      listMedia({ type, search })
        .then(setAssets)
        .catch((err) => toast.error(err.message || "Couldn't load the media library"))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(timer);
  }, [type, search]);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const asset = await uploadMedia(file, {}, () => {});
      toast.success("Uploaded");
      onSelect(asset);
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Choose from Media Library" maxWidth="max-w-2xl">
      <div className="mb-4 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="flex-1 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[12.5px] text-[var(--color-ink)] outline-none focus:border-[var(--color-accent-border)]"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-3 py-2 text-[12px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          <Upload size={13} />
          {uploading ? "Uploading…" : "Upload new"}
        </button>
        <input ref={inputRef} type="file" accept={type ? `${type}/*` : undefined} className="hidden" onChange={handleUpload} />
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-[var(--radius-control)] bg-[var(--color-elevated)]" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <p className="py-10 text-center text-[12.5px] text-[var(--color-ink-muted)]">
          No assets found. Upload one to get started.
        </p>
      ) : (
        <div className="grid max-h-[50vh] grid-cols-4 gap-2 overflow-y-auto">
          {assets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => onSelect(asset)}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-[var(--radius-control)] bg-[var(--color-elevated)]",
                "ring-1 ring-[var(--color-border)] hover:ring-[var(--color-accent-border)]"
              )}
            >
              {asset.type === "video" ? (
                <video src={asset.url} className="h-full w-full object-cover" muted />
              ) : (
                <img src={asset.url} alt={asset.alt_text || asset.name} className="h-full w-full object-cover" />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
                <Check size={16} className="text-white" />
              </div>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
