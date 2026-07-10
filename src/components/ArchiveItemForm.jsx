import { useState } from "react";
import Modal from "./ui/Modal";
import MediaPicker from "./MediaPicker";
import { inputClass, labelClass } from "./ui/formStyles";

const EMPTY = { title: "", media_id: null, lens: "", location: "", asa: "", shutter: "" };

export default function ArchiveItemForm({ open, onClose, onSave, item }) {
  const isEditing = Boolean(item);
  const [form, setForm] = useState(() =>
    item
      ? {
          title: item.title || "",
          media_id: item.media_id || null,
          lens: item.metadata?.lens || "",
          location: item.metadata?.location || "",
          asa: item.metadata?.asa || "",
          shutter: item.metadata?.shutter || "",
        }
      : EMPTY
  );
  const [mediaAsset, setMediaAsset] = useState(() => item?.media || null);
  const [saving, setSaving] = useState(false);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const ok = await onSave({
      title: form.title,
      media_id: form.media_id,
      metadata: {
        lens: form.lens || null,
        location: form.location || null,
        asa: form.asa || null,
        shutter: form.shutter || null,
      },
    });
    setSaving(false);
    if (ok) onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? "Edit Card" : "New Card"} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <MediaPicker
          label="Image"
          type="image"
          value={mediaAsset}
          onChange={(asset) => {
            setMediaAsset(asset);
            set("media_id", asset?.id || null);
          }}
        />

        <div>
          <label className={labelClass}>Frame number</label>
          <input className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="36A" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Lens</label>
            <input className={inputClass} value={form.lens} onChange={(e) => set("lens", e.target.value)} placeholder="50mm T2.1" />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input className={inputClass} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="New Delhi" />
          </div>
          <div>
            <label className={labelClass}>ASA</label>
            <input className={inputClass} value={form.asa} onChange={(e) => set("asa", e.target.value)} placeholder="800" />
          </div>
          <div>
            <label className={labelClass}>Shutter</label>
            <input className={inputClass} value={form.shutter} onChange={(e) => set("shutter", e.target.value)} placeholder="1/50s" />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--color-border)] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-control)] px-3.5 py-2 text-[13px] font-medium text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-elevated-2)] hover:text-[var(--color-ink)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
          >
            {saving ? "Saving…" : isEditing ? "Save Changes" : "Add Card"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
