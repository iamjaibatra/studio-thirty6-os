import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Copy, Trash2 } from "lucide-react";
import Modal from "./ui/Modal";
import ConfirmDialog from "./ui/ConfirmDialog";
import { inputClass, labelClass } from "./ui/formStyles";

export default function MediaDetailModal({ asset, onClose, onSave, onDelete, checkUsage }) {
  const [name, setName] = useState(() => asset?.name ?? "");
  const [altText, setAltText] = useState(() => asset?.alt_text ?? "");
  const [tagsText, setTagsText] = useState(() => (asset?.tags ?? []).join(", "));
  const [saving, setSaving] = useState(false);
  const [usageCount, setUsageCount] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!asset?.id) return;
    let cancelled = false;
    checkUsage(asset.id).then((count) => {
      if (!cancelled) setUsageCount(count);
    });
    return () => {
      cancelled = true;
    };
  }, [asset?.id, checkUsage]);

  if (!asset) return null;

  async function handleSave() {
    setSaving(true);
    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const ok = await onSave(asset.id, { name, altText, tags });
    setSaving(false);
    if (ok) onClose();
  }

  function copyUrl() {
    navigator.clipboard.writeText(asset.url).then(
      () => toast.success("URL copied"),
      () => toast.error("Couldn't copy URL")
    );
  }

  return (
    <>
      <Modal open={Boolean(asset)} onClose={onClose} title="Edit Asset" maxWidth="max-w-lg">
        <div className="mb-4 overflow-hidden rounded-[var(--radius-control)] bg-[var(--color-elevated)]">
          {asset.type === "video" ? (
            <video src={asset.url} controls className="max-h-64 w-full" />
          ) : (
            <img src={asset.url} alt={asset.alt_text || asset.name} className="max-h-64 w-full object-contain" />
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className={labelClass}>Name</label>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Alt text</label>
            <input
              className={inputClass}
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe this asset for accessibility"
            />
          </div>
          <div>
            <label className={labelClass}>Tags (comma separated)</label>
            <input
              className={inputClass}
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="hero, logo, dark"
            />
          </div>
          <div>
            <label className={labelClass}>URL</label>
            <div className="flex gap-2">
              <input className={inputClass} value={asset.url} readOnly />
              <button
                onClick={copyUrl}
                className="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 text-[12px] text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-elevated-2)]"
              >
                <Copy size={12} /> Copy
              </button>
            </div>
          </div>

          {usageCount !== null && (
            <p className="text-[11.5px] text-[var(--color-ink-muted)]">
              Used in {usageCount} place{usageCount === 1 ? "" : "s"} across the site.
            </p>
          )}
        </div>

        <div className="mt-5 flex justify-between border-t border-[var(--color-border)] pt-4">
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 rounded-[var(--radius-control)] px-3 py-2 text-[13px] font-medium text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger-soft)]"
          >
            <Trash2 size={14} /> Delete
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-[var(--radius-control)] px-3.5 py-2 text-[13px] font-medium text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-elevated-2)] hover:text-[var(--color-ink)]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await onDelete(asset);
          onClose();
        }}
        title="Delete asset"
        description={
          usageCount > 0
            ? `This asset is used in ${usageCount} place(s). Deleting it will leave those references broken.`
            : `"${asset.name}" will be permanently deleted from storage.`
        }
        confirmLabel="Delete"
        tone="danger"
      />
    </>
  );
}
