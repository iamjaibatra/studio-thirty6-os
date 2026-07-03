import { FolderOpen } from "lucide-react";
import ProjectCard from "./ProjectCard";

export default function ProjectGrid({
  projects,
  loading,
  onOpen,
  onEdit,
  onDelete,
  onArchive,
  onToggleFeatured,
  onDuplicate,
  onNewProject,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            <div className="aspect-video bg-[var(--color-elevated)]" />
            <div className="space-y-2 p-3.5">
              <div className="h-3 w-3/4 rounded bg-[var(--color-elevated)]" />
              <div className="h-2.5 w-1/2 rounded bg-[var(--color-elevated)]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!projects.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 py-20 text-center">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-elevated-2)] text-[var(--color-ink-faint)]">
          <FolderOpen size={20} />
        </div>
        <h3 className="text-[14px] font-semibold text-[var(--color-ink)]">
          No projects match these filters
        </h3>
        <p className="mt-1 max-w-sm text-[12.5px] text-[var(--color-ink-muted)]">
          Try adjusting your search or filters, or add the first project to this workspace.
        </p>
        <button
          onClick={onNewProject}
          className="mt-5 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          New Project
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onOpen={onOpen}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
          onToggleFeatured={onToggleFeatured}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  );
}
