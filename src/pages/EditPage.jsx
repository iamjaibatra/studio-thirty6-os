import { useState } from "react";
import { AlertTriangle, RefreshCw, Plus, Pencil, Trash2, ArrowUp, ArrowDown, Film } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import TimelineStageForm from "../components/TimelineStageForm";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { inputClass, labelClass } from "../components/ui/formStyles";
import { usePageContent } from "../hooks/usePageContent";
import { useTimelineStages } from "../hooks/useTimelineStages";

const EMPTY_DEFAULTS = {
  exposure: 50, contrast: 50, highlights: 50, shadows: 50, saturation: 50, temperature: 50, grain: 0,
  grade_profile: "", grade_intensity: 100, transform_scale: 100, transform_x: 960, transform_y: 540,
};

export default function EditPage() {
  const { sections, loading, error, refresh, save } = usePageContent("edit");

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight text-[var(--color-ink)]">Edit</h1>
        <p className="mt-0.5 text-[12.5px] text-[var(--color-ink-muted)]">
          Controls the Edit page's timeline stages and the color grader panel's default values.
        </p>
      </div>

      {error && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-danger-soft)] px-4 py-3">
          <div className="flex items-center gap-2.5 text-[13px] text-[var(--color-danger)]">
            <AlertTriangle size={15} />
            <span>Couldn't load this page's content: {error.message || "Unknown error"}</span>
          </div>
          <button onClick={refresh} className="flex items-center gap-1.5 rounded-[var(--radius-control)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--color-danger)] hover:bg-black/10">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface)]" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <StagesSection />
          <GraderDefaultsForm sections={sections} onSave={save} />
        </div>
      )}
    </DashboardLayout>
  );
}

function StagesSection() {
  const { stages, loading, error, refresh, create, update, remove, reorder } = useTimelineStages();
  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editingStage, setEditingStage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function openCreate() {
    setEditingStage(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function openEdit(stage) {
    setEditingStage(stage);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function handleSave(payload) {
    return editingStage ? update(editingStage.id, payload) : create(payload);
  }

  function move(index, direction) {
    const next = [...stages];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    reorder(next.map((s) => s.id));
  }

  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-[var(--color-ink)]">Timeline stages</h2>
          <p className="text-[12px] text-[var(--color-ink-muted)]">
            The project bin, preview captions, and main timeline track are all built from this list.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          <Plus size={15} /> Add Stage
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-danger-soft)] px-4 py-3">
          <span className="text-[12.5px] text-[var(--color-danger)]">Couldn't load stages: {error.message}</span>
          <button onClick={refresh} className="text-[12px] font-medium text-[var(--color-danger)] hover:underline">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-[var(--radius-control)] bg-[var(--color-elevated)]" />
          ))}
        </div>
      ) : stages.length === 0 ? (
        <p className="py-6 text-center text-[12.5px] text-[var(--color-ink-muted)]">No stages yet — add the first one.</p>
      ) : (
        <div className="space-y-2">
          {stages.map((stage, i) => (
            <div key={stage.id} className="flex items-center gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] p-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-[var(--color-elevated)] text-[var(--color-ink-faint)]">
                <Film size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-[var(--color-ink)]">{stage.label}</p>
                <p className="truncate text-[11.5px] text-[var(--color-ink-muted)]">
                  {stage.description || "No description"}
                  {stage.project ? ` · Linked: ${stage.project.title}` : ""}
                  {stage.video ? " · Has video" : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="rounded-md p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-elevated-2)] disabled:opacity-30">
                  <ArrowUp size={13} />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === stages.length - 1} aria-label="Move down" className="rounded-md p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-elevated-2)] disabled:opacity-30">
                  <ArrowDown size={13} />
                </button>
                <button onClick={() => openEdit(stage)} aria-label="Edit" className="rounded-md p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-elevated-2)]">
                  <Pencil size={13} />
                </button>
                <button onClick={() => setDeleteTarget(stage)} aria-label="Delete" className="rounded-md p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TimelineStageForm key={formKey} open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} stage={editingStage} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => remove(deleteTarget.id)}
        title="Delete stage"
        description={`"${deleteTarget?.label || "This stage"}" will be permanently removed from the Edit page's timeline.`}
        confirmLabel="Delete"
        tone="danger"
      />
    </section>
  );
}

function GraderDefaultsForm({ sections, onSave }) {
  const [defaults, setDefaults] = useState(() => ({ ...EMPTY_DEFAULTS, ...sections.grader_defaults }));
  const [saving, setSaving] = useState(false);

  function set(key, value) {
    setDefaults((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const cleaned = {
      ...defaults,
      exposure: Number(defaults.exposure),
      contrast: Number(defaults.contrast),
      highlights: Number(defaults.highlights),
      shadows: Number(defaults.shadows),
      saturation: Number(defaults.saturation),
      temperature: Number(defaults.temperature),
      grain: Number(defaults.grain),
      grade_intensity: Number(defaults.grade_intensity),
      transform_scale: Number(defaults.transform_scale),
      transform_x: Number(defaults.transform_x),
      transform_y: Number(defaults.transform_y),
    };
    await onSave("grader_defaults", cleaned);
    setSaving(false);
  }

  const sliderFields = [
    ["exposure", "Exposure"], ["contrast", "Contrast"], ["highlights", "Highlights"],
    ["shadows", "Shadows"], ["saturation", "Saturation"], ["temperature", "Temperature"], ["grain", "Grain"],
  ];

  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h2 className="mb-1 text-[14px] font-semibold text-[var(--color-ink)]">Effects &amp; Color panel defaults</h2>
      <p className="mb-4 text-[12px] text-[var(--color-ink-muted)]">
        These sliders aren't tied to individual stages in the current design (they never were) — this sets
        the values the grader panel opens with.
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {sliderFields.map(([key, label]) => (
          <div key={key}>
            <label className={labelClass}>{label}</label>
            <input type="number" min="0" max="100" className={inputClass} value={defaults[key]} onChange={(e) => set(key, e.target.value)} />
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Grade profile label</label>
          <input className={inputClass} value={defaults.grade_profile} onChange={(e) => set("grade_profile", e.target.value)} placeholder="Log-C → Rec.709" />
        </div>
        <div>
          <label className={labelClass}>Grade intensity (0–100)</label>
          <input type="number" min="0" max="100" className={inputClass} value={defaults.grade_intensity} onChange={(e) => set("grade_intensity", e.target.value)} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Transform scale</label>
          <input type="number" step="0.1" className={inputClass} value={defaults.transform_scale} onChange={(e) => set("transform_scale", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Position X</label>
          <input type="number" step="0.1" className={inputClass} value={defaults.transform_x} onChange={(e) => set("transform_x", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Position Y</label>
          <input type="number" step="0.1" className={inputClass} value={defaults.transform_y} onChange={(e) => set("transform_y", e.target.value)} />
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Defaults"}
        </button>
      </div>
    </section>
  );
}
