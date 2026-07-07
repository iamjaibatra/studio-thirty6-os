import { useState } from "react";
import { Plus, Pencil, Trash2, Tag, AlertTriangle, RefreshCw } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import CategoryForm from "../components/CategoryForm";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useCategoriesAdmin } from "../hooks/useCategoriesAdmin";

export default function Categories() {
  const { categories, loading, error, refresh, createCategory, updateCategory, deleteCategory } =
    useCategoriesAdmin();

  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function openCreate() {
    setEditingCategory(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function openEdit(category) {
    setEditingCategory(category);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function handleSave(...args) {
    return editingCategory ? updateCategory(...args) : createCategory(...args);
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-[var(--color-ink)]">
            Categories
          </h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--color-ink-muted)]">
            Organize projects by type — used across filters and the project form.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          <Plus size={15} />
          New Category
        </button>
      </div>

      {error && !loading && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-danger-soft)] px-4 py-3">
          <div className="flex items-center gap-2.5 text-[13px] text-[var(--color-danger)]">
            <AlertTriangle size={15} />
            <span>Couldn't load categories: {error.message || "Unknown error"}</span>
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 rounded-[var(--radius-control)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--color-danger)] transition-colors hover:bg-black/10"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface)]" />
          ))}
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 py-16 text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-elevated-2)] text-[var(--color-ink-faint)]">
            <Tag size={20} />
          </div>
          <h3 className="text-[14px] font-semibold text-[var(--color-ink)]">No categories yet</h3>
          <p className="mt-1 max-w-sm text-[12.5px] text-[var(--color-ink-muted)]">
            Add your first category to start organizing projects.
          </p>
          <button
            onClick={openCreate}
            className="mt-5 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            New Category
          </button>
        </div>
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          {categories.map((category, i) => (
            <div
              key={category.id}
              className={`flex items-center justify-between px-4 py-3.5 ${
                i !== categories.length - 1 ? "border-b border-[var(--color-border)]" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-elevated-2)] text-[var(--color-ink-faint)]">
                  <Tag size={14} />
                </div>
                <div>
                  <p className="text-[13.5px] font-medium text-[var(--color-ink)]">{category.name}</p>
                  <p className="text-[11.5px] text-[var(--color-ink-muted)]">
                    {category.projectCount} project{category.projectCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(category)}
                  aria-label={`Edit ${category.name}`}
                  className="rounded-md p-2 text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-elevated-2)] hover:text-[var(--color-ink)]"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setDeleteTarget(category)}
                  aria-label={`Delete ${category.name}`}
                  className="rounded-md p-2 text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryForm
        key={formKey}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        category={editingCategory}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteCategory(deleteTarget.id)}
        title="Delete category"
        description={
          deleteTarget?.projectCount > 0
            ? `"${deleteTarget?.name}" is used by ${deleteTarget?.projectCount} project(s). Deleting it will leave those projects uncategorized.`
            : `"${deleteTarget?.name}" will be permanently deleted.`
        }
        confirmLabel="Delete"
        tone="danger"
      />
    </DashboardLayout>
  );
}
