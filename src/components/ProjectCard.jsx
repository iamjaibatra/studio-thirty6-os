import { useEffect, useRef, useState } from "react";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Archive as ArchiveIcon,
  Star,
  Copy,
  Play,
  Clock,
  Globe,
  EyeOff,
} from "lucide-react";
import { cn } from "../utils/cn";

export default function ProjectCard({
  project,
  onOpen,
  onEdit,
  onDelete,
  onArchive,
  onToggleFeatured,
  onTogglePublished,
  onDuplicate,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  function stop(e) {
    e.stopPropagation();
  }

  const actions = [
    { label: "Edit", icon: Pencil, onClick: () => onEdit(project) },
    {
      label: project.published ? "Unpublish" : "Publish",
      icon: project.published ? EyeOff : Globe,
      onClick: () => onTogglePublished(project),
    },
    {
      label: project.featured ? "Unfeature" : "Feature",
      icon: Star,
      onClick: () => onToggleFeatured(project),
    },
    { label: "Duplicate", icon: Copy, onClick: () => onDuplicate(project) },
    { label: "Archive", icon: ArchiveIcon, onClick: () => onArchive(project) },
    { label: "Delete", icon: Trash2, onClick: () => onDelete(project), danger: true },
  ];

  return (
    <div
      onClick={() => onOpen(project)}
      className="group relative cursor-pointer overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.6)]"
    >
      <div className="relative aspect-video overflow-hidden bg-[var(--color-elevated)]">
        {project.thumbnail_url ? (
          <img
            src={project.thumbnail_url}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--color-ink-faint)]">
            <Play size={22} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

        <div className="absolute left-2.5 top-2.5 flex gap-1.5">
          {project.featured && (
            <span className="flex items-center gap-1 rounded-full bg-[var(--color-warning-soft)] px-2 py-0.5 text-[10.5px] font-medium text-[var(--color-warning)]">
              <Star size={10} fill="currentColor" /> Featured
            </span>
          )}
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10.5px] font-medium",
              project.published
                ? "bg-[var(--color-success-soft)] text-[var(--color-success)]"
                : "bg-white/10 text-[var(--color-ink-muted)]"
            )}
          >
            {project.published ? "Published" : "Draft"}
          </span>
        </div>

        <div className="absolute right-2.5 top-2.5" ref={menuRef} onClick={stop}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/70"
            aria-label="Quick actions"
          >
            <MoreVertical size={14} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 z-10 w-40 overflow-hidden rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-elevated)] py-1 shadow-2xl animate-scale-in">
              {actions.map(({ label, icon: Icon, onClick, danger }) => (
                <button
                  key={label}
                  onClick={() => {
                    setMenuOpen(false);
                    onClick();
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12.5px] transition-colors hover:bg-[var(--color-elevated-2)]",
                    danger ? "text-[var(--color-danger)]" : "text-[var(--color-ink)]"
                  )}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-3.5">
        <h3 className="truncate text-[13.5px] font-semibold text-[var(--color-ink)]">
          {project.title}
        </h3>
        <p className="mt-0.5 truncate text-[12px] text-[var(--color-ink-muted)]">
          {project.client || "No client"}
        </p>

        <div className="mt-2.5 flex items-center justify-between text-[11.5px] text-[var(--color-ink-faint)]">
          <span className="truncate rounded-full bg-[var(--color-elevated-2)] px-2 py-0.5">
            {project.categories?.name || "Uncategorized"}
          </span>
          <div className="flex items-center gap-2.5">
            {project.duration && (
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {project.duration}
              </span>
            )}
            <span>{project.year}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
