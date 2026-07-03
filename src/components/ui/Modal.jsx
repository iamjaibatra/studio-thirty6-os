import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

export default function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    if (!open) return;

    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={cn(
          "relative w-full animate-scale-in rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-elevated)] shadow-2xl",
          maxWidth
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <h2 className="text-[15px] font-semibold text-[var(--color-ink)]">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-elevated-2)] hover:text-[var(--color-ink)]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
