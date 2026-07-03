import { cn } from "../../utils/cn";
import { labelClass } from "./formStyles";

export default function Toggle({ label, checked, onChange }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-[var(--radius-control)] border px-3 text-[12.5px] font-medium transition-colors",
          checked
            ? "border-[var(--color-accent-border)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
            : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink-muted)]"
        )}
      >
        <span
          className={cn(
            "relative h-4 w-7 shrink-0 rounded-full transition-colors",
            checked ? "bg-[var(--color-accent)]" : "bg-[var(--color-elevated-2)]"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform",
              checked ? "translate-x-3.5" : "translate-x-0.5"
            )}
          />
        </span>
        {checked ? "On" : "Off"}
      </button>
    </div>
  );
}
