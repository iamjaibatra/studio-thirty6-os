import { useState } from "react";
import { Plus, X, GripVertical } from "lucide-react";
import { MediaPickerModal } from "./MediaPicker";

/**
 * @param {object[]} assets - ordered list of { id, url, name }
 * @param {(assets: object[]) => void} onChange
 */
export default function GalleryPicker({ assets, onChange }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  function addAsset(asset) {
    if (!assets.some((a) => a.id === asset.id)) {
      onChange([...assets, asset]);
    }
    setPickerOpen(false);
  }

  function removeAsset(id) {
    onChange(assets.filter((a) => a.id !== id));
  }

  function moveAsset(index, direction) {
    const next = [...assets];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      <label className="mb-1.5 block text-[12.5px] font-medium text-[var(--color-ink-muted)]">
        Gallery images
      </label>

      <div className="flex flex-wrap gap-2">
        {assets.map((asset, i) => (
          <div
            key={asset.id}
            className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-elevated)]"
          >
            <img src={asset.url} alt={asset.alt_text || asset.name} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAsset(asset.id)}
              aria-label={`Remove ${asset.name}`}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-[var(--color-danger)] group-hover:opacity-100"
            >
              <X size={11} />
            </button>
            {assets.length > 1 && (
              <button
                type="button"
                onClick={() => moveAsset(i, -1)}
                disabled={i === 0}
                aria-label="Move earlier"
                className="absolute bottom-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-[var(--color-accent)] group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-0"
              >
                <GripVertical size={11} />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-dashed border-[var(--color-border-strong)] text-[var(--color-ink-faint)] transition-colors hover:border-[var(--color-accent-border)] hover:text-[var(--color-accent)]"
        >
          <Plus size={18} />
        </button>
      </div>

      {pickerOpen && (
        <MediaPickerModal type="image" onClose={() => setPickerOpen(false)} onSelect={addAsset} />
      )}
    </div>
  );
}
