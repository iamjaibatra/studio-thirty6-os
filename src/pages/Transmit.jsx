import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, RefreshCw, Plus, X } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import MediaPicker from "../components/MediaPicker";
import { inputClass, labelClass } from "../components/ui/formStyles";
import { usePageContent } from "../hooks/usePageContent";
import { getMediaByIds } from "../services/media";
import { listServices } from "../services/services";

const EMPTY_CONTENT = {
  headline_line1: "",
  headline_line2: "",
  headline_bold: "",
  description: "",
  email: "",
  location: "",
  destination_email: "",
  success_message: "",
  timeline_options: [],
  background_video_media_id: null,
  background_image_media_id: null,
};

export default function Transmit() {
  const { sections, loading, error, refresh, save } = usePageContent("transmit");

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight text-[var(--color-ink)]">Transmit</h1>
        <p className="mt-0.5 text-[12.5px] text-[var(--color-ink-muted)]">
          Controls the contact page — headline, form options, and where inquiries land.
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
        <TransmitForm sections={sections} onSave={save} />
      )}
    </DashboardLayout>
  );
}

function TransmitForm({ sections, onSave }) {
  const [content, setContent] = useState(() => ({ ...EMPTY_CONTENT, ...sections.content }));
  const [mediaById, setMediaById] = useState({});
  const [services, setServices] = useState([]);
  const [servicesError, setServicesError] = useState(null);
  const [newTimelineOption, setNewTimelineOption] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const ids = [content.background_video_media_id, content.background_image_media_id].filter(Boolean);
    if (ids.length) {
      getMediaByIds(ids)
        .then(setMediaById)
        .catch((err) => toast.error(err.message || "Couldn't load some media previews"));
    }

    listServices()
      .then((list) => setServices(list.filter((s) => s.enabled)))
      .catch((err) => setServicesError(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set(key, value) {
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  function setMediaField(key, asset) {
    setContent((prev) => ({ ...prev, [key]: asset?.id || null }));
    setMediaById((prev) => ({ ...prev, [asset?.id]: asset }));
  }

  function addTimelineOption() {
    const value = newTimelineOption.trim();
    if (!value) return;
    setContent((prev) => ({ ...prev, timeline_options: [...(prev.timeline_options || []), value] }));
    setNewTimelineOption("");
  }

  function removeTimelineOption(index) {
    setContent((prev) => ({
      ...prev,
      timeline_options: prev.timeline_options.filter((_, i) => i !== index),
    }));
  }

  async function handleSave() {
    setSaving(true);
    await onSave("content", content);
    setSaving(false);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-4 text-[14px] font-semibold text-[var(--color-ink)]">Headline &amp; Copy</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Headline line 1</label>
            <input className={inputClass} value={content.headline_line1} onChange={(e) => set("headline_line1", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Headline line 2</label>
            <input className={inputClass} value={content.headline_line2} onChange={(e) => set("headline_line2", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Headline (bold)</label>
            <input className={inputClass} value={content.headline_bold} onChange={(e) => set("headline_bold", e.target.value)} />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass}>Description</label>
          <textarea
            className={`${inputClass} min-h-[70px] resize-y`}
            value={content.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="A short line about what you do (optional)"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Public contact email</label>
            <input className={inputClass} value={content.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input className={inputClass} value={content.location} onChange={(e) => set("location", e.target.value)} />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass}>Form destination email</label>
          <input
            className={inputClass}
            value={content.destination_email}
            onChange={(e) => set("destination_email", e.target.value)}
            placeholder="Where new inquiries should be noticed — stored with each submission"
          />
          <p className="mt-1 text-[11.5px] text-[var(--color-ink-muted)]">
            Every submission is saved to the database (Supabase → <code>inquiries</code> table) regardless of
            this value — there's no separate email-sending service connected yet, so this is stored as
            metadata for now rather than triggering an email.
          </p>
        </div>

        <div className="mt-4">
          <label className={labelClass}>Success message</label>
          <input className={inputClass} value={content.success_message} onChange={(e) => set("success_message", e.target.value)} />
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-1 text-[14px] font-semibold text-[var(--color-ink)]">Timeline options</h2>
        <p className="mb-3 text-[12px] text-[var(--color-ink-muted)]">The "shoot month" dropdown on the contact form.</p>

        <div className="mb-3 flex flex-wrap gap-2">
          {(content.timeline_options || []).map((opt, i) => (
            <span key={`${opt}-${i}`} className="flex items-center gap-1.5 rounded-full bg-[var(--color-elevated-2)] px-3 py-1 text-[12px] text-[var(--color-ink)]">
              {opt}
              <button onClick={() => removeTimelineOption(i)} aria-label={`Remove ${opt}`} className="text-[var(--color-ink-faint)] hover:text-[var(--color-danger)]">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            className={inputClass}
            value={newTimelineOption}
            onChange={(e) => setNewTimelineOption(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTimelineOption())}
            placeholder="e.g. Within 30 days"
          />
          <button
            onClick={addTimelineOption}
            className="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 text-[12px] text-[var(--color-ink-muted)] hover:bg-[var(--color-elevated-2)]"
          >
            <Plus size={13} /> Add
          </button>
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-1 text-[14px] font-semibold text-[var(--color-ink)]">Services shown in the dropdown</h2>
        <p className="mb-3 text-[12px] text-[var(--color-ink-muted)]">
          Pulled live from the same services list used by the Lenses page — manage the actual services there
          (coming next) rather than here, to avoid two places editing the same data.
        </p>
        {servicesError ? (
          <p className="text-[12.5px] text-[var(--color-danger)]">Couldn't load services: {servicesError.message}</p>
        ) : services.length === 0 ? (
          <p className="text-[12.5px] text-[var(--color-ink-muted)]">No enabled services yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {services.map((s) => (
              <li key={s.id} className="rounded-full bg-[var(--color-elevated-2)] px-3 py-1 text-[12px] text-[var(--color-ink)]">
                {s.title}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-4 text-[14px] font-semibold text-[var(--color-ink)]">Background media (optional)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MediaPicker
            label="Background video"
            type="video"
            value={content.background_video_media_id ? mediaById[content.background_video_media_id] : null}
            onChange={(asset) => setMediaField("background_video_media_id", asset)}
          />
          <MediaPicker
            label="Background image"
            type="image"
            value={content.background_image_media_id ? mediaById[content.background_image_media_id] : null}
            onChange={(asset) => setMediaField("background_image_media_id", asset)}
          />
        </div>
      </section>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
