import { Plus, X } from "lucide-react";
import { inputClass, labelClass } from "./ui/formStyles";

/**
 * @param {{role: string, name: string}[]} credits
 * @param {(credits: object[]) => void} onChange
 */
export default function CreditsEditor({ credits, onChange }) {
  function updateRow(index, key, value) {
    const next = credits.map((row, i) => (i === index ? { ...row, [key]: value } : row));
    onChange(next);
  }

  function addRow() {
    onChange([...credits, { role: "", name: "" }]);
  }

  function removeRow(index) {
    onChange(credits.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className={labelClass}>Credits</label>

      <div className="space-y-2">
        {credits.map((row, i) => (
          <div key={i} className="flex gap-2">
            <input
              className={inputClass}
              value={row.role}
              onChange={(e) => updateRow(i, "role", e.target.value)}
              placeholder="Director"
            />
            <input
              className={inputClass}
              value={row.name}
              onChange={(e) => updateRow(i, "name", e.target.value)}
              placeholder="Name"
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              aria-label="Remove credit"
              className="shrink-0 rounded-[var(--radius-control)] border border-[var(--color-border)] px-2.5 text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-2 flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-1.5 text-[12px] text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-elevated-2)]"
      >
        <Plus size={13} /> Add credit
      </button>
    </div>
  );
}
