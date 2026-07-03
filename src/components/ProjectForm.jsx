import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "./ui/Modal";
import UploadProgress from "./UploadProgress";
import ProjectFormFields from "./ProjectFormFields";
import { inputClass, labelClass } from "./ui/formStyles";
import { useUploadField } from "../hooks/useUploadField";
import { slugify, withUniqueSuffix } from "../utils/slug";
import { cn } from "../utils/cn";

const EMPTY_FORM = {
  title: "",
  slug: "",
  client: "",
  category_id: "",
  year: new Date().getFullYear(),
  description: "",
  duration: "",
  featured: false,
  published: false,
};

function initialFormFor(project) {
  if (!project) return EMPTY_FORM;
  return {
    title: project.title ?? "",
    slug: project.slug ?? "",
    client: project.client ?? "",
    category_id: project.category_id ?? "",
    year: project.year ?? new Date().getFullYear(),
    description: project.description ?? "",
    duration: project.duration ?? "",
    featured: Boolean(project.featured),
    published: Boolean(project.published),
  };
}

/**
 * Note: the parent (Projects.jsx) remounts this component with a fresh
 * `key` every time the modal is opened, so state below only ever needs to
 * be initialized once per mount rather than re-synced via an effect.
 */
export default function ProjectForm({ open, onClose, onSave, project, categories }) {
  const isEditing = Boolean(project);
  const [form, setForm] = useState(() => initialFormFor(project));
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  const thumbnail = useUploadField("thumbnails", project?.thumbnail_url ?? null);
  const video = useUploadField("videos", project?.video_url ?? null);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleTitleChange(value) {
    set("title", value);
    if (!slugTouched) set("slug", slugify(value));
  }

  function handleSlugChange(value) {
    setSlugTouched(true);
    set("slug", slugify(value));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Give the project a title first.");
      return;
    }

    let slug = form.slug.trim() || slugify(form.title);
    if (!isEditing) slug = withUniqueSuffix(slug);

    setSubmitting(true);
    try {
      const [thumbnailUrl, videoUrl] = await Promise.all([
        thumbnail.upload(slug),
        video.upload(slug),
      ]);

      await onSave({
        ...form,
        slug,
        year: form.year ? Number(form.year) : null,
        category_id: form.category_id || null,
        thumbnail_url: thumbnailUrl,
        video_url: videoUrl,
      });

      onClose();
    } catch (err) {
      toast.error(err.message || "Something went wrong while saving.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Project" : "New Project"}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UploadProgress
            kind="image"
            label="Thumbnail"
            previewUrl={thumbnail.previewUrl}
            progress={thumbnail.progress}
            status={thumbnail.status}
            onSelectFile={thumbnail.selectFile}
          />
          <UploadProgress
            kind="video"
            label="Video"
            previewUrl={video.previewUrl}
            progress={video.progress}
            status={video.status}
            onSelectFile={video.selectFile}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Title</label>
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="The Last Light"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input
              className={cn(inputClass, "font-mono text-[12px]")}
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="the-last-light"
            />
          </div>
        </div>

        <ProjectFormFields form={form} set={set} categories={categories} />

        <div className="flex justify-end gap-2 border-t border-[var(--color-border)] pt-4">
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
            {submitting ? "Saving…" : isEditing ? "Save Changes" : "Create Project"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
