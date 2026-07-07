import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getProject } from "../services/projects";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getProject(id)
      .then((data) => !cancelled && setProject(data))
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <DashboardLayout>
      <button
        onClick={() => navigate("/projects")}
        className="mb-5 flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={14} />
        Back to Projects
      </button>

      {loading && (
        <div className="flex items-center gap-2 text-[var(--color-ink-muted)]">
          <Loader2 size={16} className="animate-spin" />
          Loading project…
        </div>
      )}

      {error && (
        <p className="text-[13px] text-[var(--color-danger)]">
          Couldn't load this project: {error.message}
        </p>
      )}

      {!loading && !error && project === null && (
        <p className="text-[13px] text-[var(--color-ink-muted)]">
          This project doesn't exist or may have been deleted.
        </p>
      )}

      {project && (
        <div className="max-w-3xl">
          <div className="aspect-video overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-elevated)]">
            {project.video ? (
              <video src={project.video} controls className="h-full w-full" />
            ) : project.thumbnail ? (
              <img src={project.thumbnail} alt={project.title} className="h-full w-full object-cover" />
            ) : null}
          </div>

          <h1 className="mt-5 text-[22px] font-semibold text-[var(--color-ink)]">{project.title}</h1>
          <p className="mt-1 text-[13px] text-[var(--color-ink-muted)]">
            {project.client} · {project.category || "Uncategorized"} · {project.year}
            {project.duration ? ` · ${project.duration}` : ""}
          </p>

          {project.description && (
            <p className="mt-4 whitespace-pre-wrap text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
              {project.description}
            </p>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
