import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import MediaPicker from "../components/MediaPicker";
import { inputClass, labelClass } from "../components/ui/formStyles";
import { usePageContent } from "../hooks/usePageContent";
import { getMediaByIds } from "../services/media";
import { cn } from "../utils/cn";

const EMPTY_HERO = {
  eyebrow: "",
  headline_plain: "",
  headline_bold: "",
  subheading: "",
  button_text: "",
  button_link: "playback",
  background_video_media_id: null,
  fallback_image_media_id: null,
  ambient_video_media_id: null,
};

const EMPTY_HUD = { iso: "", aperture: "", shutter: "", white_balance: "", lens: "", battery_percent: "" };

const MODE_LINKS = ["shoot", "playback", "archive", "edit", "lenses", "transmit"];

export default function Homepage() {
  const { sections, loading, error, refresh, save } = usePageContent("shoot");

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight text-[var(--color-ink)]">Homepage</h1>
        <p className="mt-0.5 text-[12.5px] text-[var(--color-ink-muted)]">
          Controls the Shoot hero — the first thing visitors see.
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
        <HomepageForm sections={sections} onSave={save} />
      )}
    </DashboardLayout>
  );
}

function HomepageForm({ sections, onSave }) {
  const [hero, setHero] = useState(() => ({ ...EMPTY_HERO, ...sections.hero }));
  const [hud, setHud] = useState(() => ({ ...EMPTY_HUD, ...sections.hud }));
  const [mediaById, setMediaById] = useState({});
  const [savingHero, setSavingHero] = useState(false);
  const [savingHud, setSavingHud] = useState(false);

  useEffect(() => {
    const ids = [hero.background_video_media_id, hero.fallback_image_media_id, hero.ambient_video_media_id].filter(
      Boolean
    );
    if (ids.length) getMediaByIds(ids).then(setMediaById);
    // Only resolve on mount — subsequent picks already carry their own asset object via setMediaField.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setHeroField(key, value) {
    setHero((prev) => ({ ...prev, [key]: value }));
  }

  function setMediaField(key, asset) {
    setHero((prev) => ({ ...prev, [key]: asset?.id || null }));
    setMediaById((prev) => ({ ...prev, [asset?.id]: asset }));
  }

  async function handleSaveHero() {
    setSavingHero(true);
    await onSave("hero", hero);
    setSavingHero(false);
  }

  async function handleSaveHud() {
    setSavingHud(true);
    const cleaned = {
      ...hud,
      iso: hud.iso ? Number(hud.iso) : null,
      aperture: hud.aperture ? Number(hud.aperture) : null,
      shutter: hud.shutter ? Number(hud.shutter) : null,
      white_balance: hud.white_balance ? Number(hud.white_balance) : null,
      battery_percent: hud.battery_percent ? Number(hud.battery_percent) : null,
    };
    await onSave("hud", cleaned);
    setSavingHud(false);
  }

  return (
    <div className="space-y-8">
          <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="mb-4 text-[14px] font-semibold text-[var(--color-ink)]">Hero</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <MediaPicker
                label="Background video"
                type="video"
                value={hero.background_video_media_id ? mediaById[hero.background_video_media_id] : null}
                onChange={(asset) => setMediaField("background_video_media_id", asset)}
              />
              <MediaPicker
                label="Fallback image"
                type="image"
                value={hero.fallback_image_media_id ? mediaById[hero.fallback_image_media_id] : null}
                onChange={(asset) => setMediaField("fallback_image_media_id", asset)}
              />
              <MediaPicker
                label="Ambient loop (optional)"
                type="video"
                value={hero.ambient_video_media_id ? mediaById[hero.ambient_video_media_id] : null}
                onChange={(asset) => setMediaField("ambient_video_media_id", asset)}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Eyebrow</label>
                <input className={inputClass} value={hero.eyebrow} onChange={(e) => setHeroField("eyebrow", e.target.value)} placeholder="New Delhi · Est. 2018" />
              </div>
              <div>
                <label className={labelClass}>Subheading</label>
                <input className={inputClass} value={hero.subheading} onChange={(e) => setHeroField("subheading", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Headline (plain part)</label>
                <input className={inputClass} value={hero.headline_plain} onChange={(e) => setHeroField("headline_plain", e.target.value)} placeholder="Visual" />
              </div>
              <div>
                <label className={labelClass}>Headline (bold part)</label>
                <input className={inputClass} value={hero.headline_bold} onChange={(e) => setHeroField("headline_bold", e.target.value)} placeholder="Production" />
              </div>
              <div>
                <label className={labelClass}>Button text</label>
                <input className={inputClass} value={hero.button_text} onChange={(e) => setHeroField("button_text", e.target.value)} placeholder="Enter Playback →" />
              </div>
              <div>
                <label className={labelClass}>Button link</label>
                <select className={cn(inputClass, "appearance-none")} value={hero.button_link} onChange={(e) => setHeroField("button_link", e.target.value)}>
                  {MODE_LINKS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={handleSaveHero}
                disabled={savingHero}
                className="rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
              >
                {savingHero ? "Saving…" : "Save Hero"}
              </button>
            </div>
          </section>

          <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="mb-1 text-[14px] font-semibold text-[var(--color-ink)]">Camera HUD (optional)</h2>
            <p className="mb-4 text-[12px] text-[var(--color-ink-muted)]">
              Decorative readouts on the hero. Leave blank to keep the defaults.
            </p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>ISO</label>
                <input type="number" className={inputClass} value={hud.iso} onChange={(e) => setHud((p) => ({ ...p, iso: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Aperture (f/)</label>
                <input type="number" step="0.1" className={inputClass} value={hud.aperture} onChange={(e) => setHud((p) => ({ ...p, aperture: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Shutter (1/x)</label>
                <input type="number" className={inputClass} value={hud.shutter} onChange={(e) => setHud((p) => ({ ...p, shutter: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>White balance (K)</label>
                <input type="number" className={inputClass} value={hud.white_balance} onChange={(e) => setHud((p) => ({ ...p, white_balance: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Lens</label>
                <input className={inputClass} value={hud.lens} onChange={(e) => setHud((p) => ({ ...p, lens: e.target.value }))} placeholder="50mm" />
              </div>
              <div>
                <label className={labelClass}>Battery %</label>
                <input type="number" className={inputClass} value={hud.battery_percent} onChange={(e) => setHud((p) => ({ ...p, battery_percent: e.target.value }))} />
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={handleSaveHud}
                disabled={savingHud}
                className="rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
              >
                {savingHud ? "Saving…" : "Save HUD"}
              </button>
            </div>
          </section>
    </div>
  );
}
