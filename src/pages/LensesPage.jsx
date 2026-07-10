import { useState } from "react";
import { AlertTriangle, RefreshCw, Plus, Pencil, Trash2, ArrowUp, ArrowDown, Aperture } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import ServiceForm from "../components/ServiceForm";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useServicesAdmin } from "../hooks/useServicesAdmin";
import { cn } from "../utils/cn";

export default function LensesPage() {
  const { services, loading, error, refresh, create, update, remove, toggleEnabled, reorder } = useServicesAdmin();
  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editingService, setEditingService] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function openCreate() {
    setEditingService(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function openEdit(service) {
    setEditingService(service);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function handleSave(payload) {
    return editingService ? update(editingService.id, payload) : create(payload);
  }

  function move(index, direction) {
    const next = [...services];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    reorder(next.map((s) => s.id));
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-[var(--color-ink)]">Lenses</h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--color-ink-muted)]">
            Services shown on the public Lens Cabinet page — also feeds Transmit's service dropdown.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          <Plus size={15} /> Add Service
        </button>
      </div>

      {error && !loading && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-danger-soft)] px-4 py-3">
          <div className="flex items-center gap-2.5 text-[13px] text-[var(--color-danger)]">
            <AlertTriangle size={15} />
            <span>Couldn't load services: {error.message || "Unknown error"}</span>
          </div>
          <button onClick={refresh} className="flex items-center gap-1.5 rounded-[var(--radius-control)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--color-danger)] hover:bg-black/10">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface)]" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 py-16 text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-elevated-2)] text-[var(--color-ink-faint)]">
            <Aperture size={20} />
          </div>
          <h3 className="text-[14px] font-semibold text-[var(--color-ink)]">No services yet</h3>
          <p className="mt-1 max-w-sm text-[12.5px] text-[var(--color-ink-muted)]">
            Add your first service to populate the Lens Cabinet.
          </p>
          <button onClick={openCreate} className="mt-5 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]">
            Add Service
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {services.map((service, i) => (
            <div key={service.id} className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-[var(--color-elevated)]">
                {service.image?.url ? (
                  <img src={service.image.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Aperture size={16} className="text-[var(--color-ink-faint)]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[13.5px] font-medium text-[var(--color-ink)]">{service.title}</p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-medium",
                      service.enabled
                        ? "bg-[var(--color-success-soft)] text-[var(--color-success)]"
                        : "bg-white/10 text-[var(--color-ink-muted)]"
                    )}
                  >
                    {service.enabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <p className="truncate text-[11.5px] text-[var(--color-ink-muted)]">
                  {[service.specs?.focal && `${service.specs.focal}mm`, service.duration, service.price].filter(Boolean).join(" · ") || "No details yet"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="rounded-md p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-elevated-2)] disabled:opacity-30">
                  <ArrowUp size={13} />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === services.length - 1} aria-label="Move down" className="rounded-md p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-elevated-2)] disabled:opacity-30">
                  <ArrowDown size={13} />
                </button>
                <button onClick={() => toggleEnabled(service)} className="rounded-md px-2.5 py-1.5 text-[11.5px] font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-elevated-2)]">
                  {service.enabled ? "Disable" : "Enable"}
                </button>
                <button onClick={() => openEdit(service)} aria-label="Edit" className="rounded-md p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-elevated-2)]">
                  <Pencil size={13} />
                </button>
                <button onClick={() => setDeleteTarget(service)} aria-label="Delete" className="rounded-md p-1.5 text-[var(--color-ink-muted)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ServiceForm key={formKey} open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} service={editingService} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => remove(deleteTarget.id)}
        title="Delete service"
        description={`"${deleteTarget?.title || "This service"}" will be permanently removed from the Lens Cabinet and Transmit's dropdown.`}
        confirmLabel="Delete"
        tone="danger"
      />
    </DashboardLayout>
  );
}
