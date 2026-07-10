import { useState } from "react";
import { Plus, X } from "lucide-react";
import Modal from "./ui/Modal";
import MediaPicker from "./MediaPicker";
import Toggle from "./ui/Toggle";
import { inputClass, labelClass } from "./ui/formStyles";
import { cn } from "../utils/cn";

const EMPTY = {
  title: "",
  description: "",
  focal: "",
  aperture_spec: "",
  format: "",
  dof: "",
  deliverables: [],
  duration: "",
  price: "",
  enabled: true,
};

export default function ServiceForm({ open, onClose, onSave, service }) {
  const isEditing = Boolean(service);
  const [form, setForm] = useState(() => {
    if (!service) return EMPTY;
    const specs = service.specs || {};
    return {
      title: service.title || "",
      description: service.description || "",
      focal: specs.focal || "",
      aperture_spec: specs.aperture_spec || "",
      format: specs.format || "",
      dof: specs.dof || "",
      deliverables: Array.isArray(specs.deliverables) ? specs.deliverables : [],
      duration: service.duration || "",
      price: service.price || "",
      enabled: service.enabled ?? true,
    };
  });
  const [iconAsset, setIconAsset] = useState(() => service?.icon || null);
  const [imageAsset, setImageAsset] = useState(() => service?.image || null);
  const [videoAsset, setVideoAsset] = useState(() => service?.video || null);
  const [newDeliverable, setNewDeliverable] = useState("");
  const [saving, setSaving] = useState(false);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addDeliverable() {
    const value = newDeliverable.trim();
    if (!value) return;
    set("deliverables", [...form.deliverables, value]);
    setNewDeliverable("");
  }

  function removeDeliverable(i) {
    set("deliverables", form.deliverables.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const ok = await onSave({
      title: form.title,
      description: form.description || null,
      duration: form.duration || null,
      price: form.price || null,
      enabled: form.enabled,
      icon_media_id: iconAsset?.id || null,
      image_media_id: imageAsset?.id || null,
      video_media_id: videoAsset?.id || null,
      specs: {
        focal: form.focal || null,
        aperture_spec: form.aperture_spec || null,
        format: form.format || null,
        dof: form.dof || null,
        deliverables: form.deliverables,
      },
    });
    setSaving(false);
    if (ok) onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? "Edit Service" : "New Service"} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MediaPicker label="Icon" type="icon" value={iconAsset} onChange={setIconAsset} />
          <MediaPicker label="Image" type="image" value={imageAsset} onChange={setImageAsset} />
          <MediaPicker label="Video" type="video" value={videoAsset} onChange={setVideoAsset} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Title</label>
            <input className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Brand Films" />
          </div>
          <div>
            <label className={labelClass}>Focal length label</label>
            <input className={inputClass} value={form.focal} onChange={(e) => set("focal", e.target.value)} placeholder="24" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea className={cn(inputClass, "min-h-[70px] resize-y")} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className={labelClass}>Aperture / type</label>
            <input className={inputClass} value={form.aperture_spec} onChange={(e) => set("aperture_spec", e.target.value)} placeholder="T1.5 · Ultra-wide" />
          </div>
          <div>
            <label className={labelClass}>Format</label>
            <input className={inputClass} value={form.format} onChange={(e) => set("format", e.target.value)} placeholder="4K · ProRes" />
          </div>
          <div>
            <label className={labelClass}>DOF</label>
            <input className={inputClass} value={form.dof} onChange={(e) => set("dof", e.target.value)} placeholder="Deep" />
          </div>
          <div>
            <label className={labelClass}>Duration</label>
            <input className={inputClass} value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="60s – 5min" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Deliverables</label>
          <div className="mb-2 flex flex-wrap gap-2">
            {form.deliverables.map((d, i) => (
              <span key={i} className="flex items-center gap-1.5 rounded-full bg-[var(--color-elevated-2)] px-3 py-1 text-[12px] text-[var(--color-ink)]">
                {d}
                <button type="button" onClick={() => removeDeliverable(i)} aria-label={`Remove ${d}`} className="text-[var(--color-ink-faint)] hover:text-[var(--color-danger)]">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className={inputClass}
              value={newDeliverable}
              onChange={(e) => setNewDeliverable(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDeliverable())}
              placeholder="e.g. Campaign cutdowns"
            />
            <button type="button" onClick={addDeliverable} className="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 text-[12px] text-[var(--color-ink-muted)] hover:bg-[var(--color-elevated-2)]">
              <Plus size={13} /> Add
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Price (optional)</label>
            <input className={inputClass} value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="Starting at ₹2,50,000" />
          </div>
          <Toggle label="Enabled" checked={form.enabled} onChange={(v) => set("enabled", v)} />
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
            {saving ? "Saving…" : isEditing ? "Save Changes" : "Add Service"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
