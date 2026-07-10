import { useState } from "react";
import { AlertTriangle, RefreshCw, Plus, X, Pencil, Trash2, ArrowUp, ArrowDown, Image as ImageIcon } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import ArchiveItemForm from "../components/ArchiveItemForm";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { inputClass, labelClass } from "../components/ui/formStyles";
import { usePageContent } from "../hooks/usePageContent";
import { useArchiveItems } from "../hooks/useArchiveItems";

const EMPTY_CONTENT = {
  about_headline_prefix: "",
  about_headline_bold: "",
  about_headline_line2: "",
  about_headline_line3: "",
  studio_description_1: "",
  studio_description_2: "",
  director: "",
  camera: "",
  lenses: "",
  grade_suite: "",
  production_name: "",
  scene: "",
  take: "",
  footer_text: "",
  stats: [],
};

export default function ArchivePage() {
  const { sections, loading, error, refresh, save } = usePageContent("archive");

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight text-[var(--color-ink)]">Archive Page</h1>
        <p className="mt-0.5 text-[12.5px] text-[var(--color-ink-muted)]">
          The public website's Archive page — studio info, stats, and contact-sheet cards. Not to be
          confused with the "Archive" tab in the sidebar (that's archived/deleted projects).
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
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface)]" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <ArchiveContentForm sections={sections} onSave={save} />
          <ArchiveItemsSection />
        </div>
      )}
    </DashboardLayout>
  );
}

function ArchiveContentForm({ sections, onSave }) {
  const [content, setContent] = useState(() => ({ ...EMPTY_CONTENT, ...sections.content }));
  const [newStatValue, setNewStatValue] = useState("");
  const [newStatLabel, setNewStatLabel] = useState("");
  const [saving, setSaving] = useState(false);

  function set(key, value) {
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  function addStat() {
    if (!newStatValue.trim() || !newStatLabel.trim()) return;
    setContent((prev) => ({ ...prev, stats: [...(prev.stats || []), { value: newStatValue, label: newStatLabel }] }));
    setNewStatValue("");
    setNewStatLabel("");
  }

  function removeStat(index) {
    setContent((prev) => ({ ...prev, stats: prev.stats.filter((_, i) => i !== index) }));
  }

  async function handleSave() {
    setSaving(true);
    await onSave("content", content);
    setSaving(false);
  }

  return (
    <>
      <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-4 text-[14px] font-semibold text-[var(--color-ink)]">About the studio</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Headline start</label>
            <input className={inputClass} value={content.about_headline_prefix} onChange={(e) => set("about_headline_prefix", e.target.value)} placeholder="We" />
          </div>
          <div>
            <label className={labelClass}>Headline (bold)</label>
            <input className={inputClass} value={content.about_headline_bold} onChange={(e) => set("about_headline_bold", e.target.value)} placeholder="observe" />
          </div>
          <div>
            <label className={labelClass}>Headline line 2</label>
            <input className={inputClass} value={content.about_headline_line2} onChange={(e) => set("about_headline_line2", e.target.value)} placeholder="before we" />
          </div>
          <div>
            <label className={labelClass}>Headline line 3</label>
            <input className={inputClass} value={content.about_headline_line3} onChange={(e) => set("about_headline_line3", e.target.value)} placeholder="shoot." />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className={labelClass}>Description — paragraph 1</label>
            <textarea className={`${inputClass} min-h-[70px] resize-y`} value={content.studio_description_1} onChange={(e) => set("studio_description_1", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Description — paragraph 2</label>
            <textarea className={`${inputClass} min-h-[70px] resize-y`} value={content.studio_description_2} onChange={(e) => set("studio_description_2", e.target.value)} />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass}>Footer text (optional)</label>
          <input className={inputClass} value={content.footer_text} onChange={(e) => set("footer_text", e.target.value)} placeholder="e.g. Est. 2018 — New Delhi" />
        </div>
      </section>

      <section className="mt-8 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-4 text-[14px] font-semibold text-[var(--color-ink)]">Production desk &amp; clapper board</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Director</label>
            <input className={inputClass} value={content.director} onChange={(e) => set("director", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Primary camera</label>
            <input className={inputClass} value={content.camera} onChange={(e) => set("camera", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Lenses</label>
            <input className={inputClass} value={content.lenses} onChange={(e) => set("lenses", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Grade suite</label>
            <input className={inputClass} value={content.grade_suite} onChange={(e) => set("grade_suite", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Production name</label>
            <input className={inputClass} value={content.production_name} onChange={(e) => set("production_name", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Scene</label>
            <input className={inputClass} value={content.scene} onChange={(e) => set("scene", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Take</label>
            <input className={inputClass} value={content.take} onChange={(e) => set("take", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-1 text-[14px] font-semibold text-[var(--color-ink)]">Statistics</h2>
        <p className="mb-3 text-[12px] text-[var(--color-ink-muted)]">The number strip in the about panel.</p>

        <div className="mb-3 flex flex-wrap gap-2">
          {(content.stats || []).map((s, i) => (
            <span key={i} className="flex items-center gap-1.5 rounded-full bg-[var(--color-elevated-2)] px-3 py-1 text-[12px] text-[var(--color-ink)]">
              <strong>{s.value}</strong> {s.label}
              <button onClick={() => removeStat(i)} aria-label="Remove stat" className="text-[var(--color-ink-faint)] hover:text-[var(--color-danger)]">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <input className={inputClass} value={newStatValue} onChange={(e) => setNewStatValue(e.target.value)} placeholder="72" />
          <input className={inputClass} value={newStatLabel} onChange={(e) => setNewStatLabel(e.target.value)} placeholder="Projects" />
          <button onClick={addStat} className="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 text-[12px] text-[var(--color-ink-muted)] hover:bg-[var(--color-elevated-2)]">
            <Plus size={13} /> Add
          </button>
        </div>
      </section>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </>
  );
}

function ArchiveItemsSection() {
  const { items, loading, error, refresh, create, update, remove, reorder } = useArchiveItems();
  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function openCreate() {
    setEditingItem(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function openEdit(item) {
    setEditingItem(item);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function handleSave(payload) {
    return editingItem ? update(editingItem.id, payload) : create(payload);
  }

  function move(index, direction) {
    const next = [...items];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    reorder(next.map((item) => item.id));
  }

  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-[var(--color-ink)]">Contact sheet cards</h2>
          <p className="text-[12px] text-[var(--color-ink-muted)]">The film-negative frames on the Archive page.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          <Plus size={15} /> Add Card
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-danger-soft)] px-4 py-3">
          <span className="text-[12.5px] text-[var(--color-danger)]">Couldn't load cards: {error.message}</span>
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
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-[12.5px] text-[var(--color-ink-muted)]">No cards yet — add the first one.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={item.id} className="flex items-center gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] p-2.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-[var(--color-elevated)]">
                {item.media?.url ? (
                  <img src={item.media.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon size={16} className="text-[var(--color-ink-faint)]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-[var(--color-ink)]">{item.title || "Untitled"}</p>
                <p className="truncate text-[11.5px] text-[var(--color-ink-muted)]">
                  {[item.metadata?.lens, item.metadata?.location].filter(Boolean).join(" · ") || "No metadata"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="rounded-md p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-elevated-2)] disabled:opacity-30">
                  <ArrowUp size={13} />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down" className="rounded-md p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-elevated-2)] disabled:opacity-30">
                  <ArrowDown size={13} />
                </button>
                <button onClick={() => openEdit(item)} aria-label="Edit" className="rounded-md p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-elevated-2)]">
                  <Pencil size={13} />
                </button>
                <button onClick={() => setDeleteTarget(item)} aria-label="Delete" className="rounded-md p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ArchiveItemForm key={formKey} open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} item={editingItem} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => remove(deleteTarget.id)}
        title="Delete card"
        description={`"${deleteTarget?.title || "This card"}" will be permanently removed from the Archive page.`}
        confirmLabel="Delete"
        tone="danger"
      />
    </section>
  );
}
