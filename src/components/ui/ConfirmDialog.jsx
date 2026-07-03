import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import { cn } from "../../utils/cn";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  tone = "danger", // "danger" | "default"
}) {
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            tone === "danger"
              ? "bg-[var(--color-danger-soft)] text-[var(--color-danger)]"
              : "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
          )}
        >
          <AlertTriangle size={16} />
        </div>
        <p className="text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
          {description}
        </p>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onClose}
          disabled={submitting}
          className="rounded-[var(--radius-control)] px-3.5 py-2 text-[13px] font-medium text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-elevated-2)] hover:text-[var(--color-ink)] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={submitting}
          className={cn(
            "rounded-[var(--radius-control)] px-3.5 py-2 text-[13px] font-medium text-white transition-colors disabled:opacity-50",
            tone === "danger"
              ? "bg-[var(--color-danger)] hover:brightness-110"
              : "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]"
          )}
        >
          {submitting ? "Working…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
