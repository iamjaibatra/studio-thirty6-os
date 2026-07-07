import { useState } from "react";
import Modal from "./ui/Modal";
import { inputClass, labelClass } from "./ui/formStyles";
import { cn } from "../utils/cn";

export default function CategoryForm({ open, onClose, onSave, category }) {
  const isEditing = Boolean(category);
  const [name, setName] = useState(category?.name ?? "");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    setSubmitting(true);
    const ok = isEditing ? await onSave(category.id, name) : await onSave(name);
    setSubmitting(false);
    if (ok) onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? "Edit Category" : "New Category"} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} noValidate>
        <label className={labelClass}>Name</label>
        <input
          autoFocus
          className={cn(inputClass, error && "border-[var(--color-danger)]")}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Music Videos"
        />
        {error && <p className="mt-1 text-[11.5px] text-[var(--color-danger)]">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-[var(--radius-control)] px-3.5 py-2 text-[13px] font-medium text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-elevated-2)] hover:text-[var(--color-ink)] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
          >
            {submitting ? "Saving…" : isEditing ? "Save Changes" : "Create Category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
