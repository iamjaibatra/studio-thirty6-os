import { useEffect, useState } from "react";
import Modal from "./ui/Modal";
import MediaPicker from "./MediaPicker";
import { inputClass, labelClass } from "./ui/formStyles";
import { listProjects } from "../services/projects";
import { cn } from "../utils/cn";

export default function TimelineStageForm({ open, onClose, onSave, stage }) {
  const isEditing = Boolean(stage);
  const [label, setLabel] = useState(() => stage?.label || "");
  const [description, setDescription] = useState(() => stage?.description || "");
  const [mediaAsset, setMediaAsset] = useState(() => stage?.media || null);
  const [projectId, setProjectId] = useState(() => stage?.project_id || "");
  const [projects, setProjects] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listProjects({}).then(setProjects).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const ok = await onSave({
      label,
      description: description || null,
      media_id: mediaAsset?.id || null,
      project_id: projectId || null,
    });
    setSaving(false);
    if (ok) onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? "Edit Stage" : "New Stage"} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Stage name</label>
          <input className={inputClass} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Brief" />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            className={cn(inputClass, "min-h-[70px] resize-y")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What happens in this stage?"
          />
        </div>

        <MediaPicker label="Stage media — image or video (optional)" value={mediaAsset} onChange={setMediaAsset} />

        <div>
          <label className={labelClass}>Linked project (optional)</label>
          <select className={cn(inputClass, "appearance-none")} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">None</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11.5px] text-[var(--color-ink-muted)]">
            Shown as "Case study: [project]" in the preview monitor when this stage is selected.
          </p>
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
            {saving ? "Saving…" : isEditing ? "Save Changes" : "Add Stage"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
