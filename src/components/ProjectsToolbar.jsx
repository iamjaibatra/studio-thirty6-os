import { Search, Plus, X } from "lucide-react";
import { cn } from "../utils/cn";

const YEAR_RANGE = Array.from({ length: 16 }, (_, i) => new Date().getFullYear() + 1 - i);

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "alphabetical", label: "A–Z" },
  { value: "updated", label: "Recently updated" },
];

const selectClass =
  "rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[12.5px] text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-accent-border)] appearance-none cursor-pointer";

export default function ProjectsToolbar({
  filters,
  onFilterChange,
  onReset,
  categories,
  onNewProject,
}) {
  const hasActiveFilters =
    filters.search || filters.categoryId || filters.year || filters.featured !== null;

  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-[var(--color-ink)]">
            Projects
          </h1>
          <p className="mt-0.5 text-[12.5px] text-[var(--color-ink-muted)]">
            Every film, commercial, and shoot in one place.
          </p>
        </div>

        <button
          onClick={onNewProject}
          className="flex items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          <Plus size={15} />
          New Project
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]"
          />
          <input
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            placeholder="Search by title, client, or description…"
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-8 pr-3 text-[12.5px] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent-border)]"
          />
        </div>

        <select
          className={selectClass}
          value={filters.categoryId}
          onChange={(e) => onFilterChange("categoryId", e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={filters.year}
          onChange={(e) => onFilterChange("year", e.target.value)}
        >
          <option value="">All years</option>
          {YEAR_RANGE.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={filters.featured === null ? "" : String(filters.featured)}
          onChange={(e) =>
            onFilterChange("featured", e.target.value === "" ? null : e.target.value === "true")
          }
        >
          <option value="">Featured &amp; not</option>
          <option value="true">Featured only</option>
          <option value="false">Not featured</option>
        </select>

        <select
          className={cn(selectClass, "ml-auto")}
          value={filters.sort}
          onChange={(e) => onFilterChange("sort", e.target.value)}
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              Sort: {s.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 rounded-[var(--radius-control)] px-2.5 py-2 text-[12px] text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-elevated-2)] hover:text-[var(--color-ink)]"
          >
            <X size={12} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
