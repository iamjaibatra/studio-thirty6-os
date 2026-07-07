import { useRef } from "react";
import toast from "react-hot-toast";
import { ImagePlus, Video, RotateCcw, Loader2, CheckCircle2, X } from "lucide-react";
import { cn } from "../utils/cn";

const MAX_SIZE_MB = { image: 20, video: 1024 };

/**
 * @param {"image"|"video"} kind
 * @param {string} label
 * @param {string|null} previewUrl - object URL (new file) or existing stored URL
 * @param {number} progress - 0-100
 * @param {"idle"|"uploading"|"done"|"error"} status
 * @param {(file: File) => void} onSelectFile
 * @param {() => void} onRemove
 */
export default function UploadProgress({
  kind = "image",
  label,
  previewUrl,
  progress = 0,
  status = "idle",
  onSelectFile,
  onRemove,
}) {
  const inputRef = useRef(null);
  const accept = kind === "image" ? "image/*" : "video/*";

  function handleChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const maxMb = MAX_SIZE_MB[kind];
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`That file is too large — keep ${kind}s under ${maxMb}MB.`);
      return;
    }

    onSelectFile(file);
  }

  function handleRemove(e) {
    e.stopPropagation();
    onRemove();
  }

  return (
    <div>
      <label className="mb-1.5 block text-[12.5px] font-medium text-[var(--color-ink-muted)]">
        {label}
      </label>

      <div
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[var(--radius-control)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] transition-colors hover:border-[var(--color-accent-border)]",
          kind === "image" ? "aspect-video" : "h-24"
        )}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {previewUrl && kind === "image" && (
          <img
            src={previewUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {previewUrl && kind === "video" && status !== "uploading" && (
          <div className="flex items-center gap-2 text-[12.5px] text-[var(--color-ink-muted)]">
            <Video size={16} />
            <span>Video attached</span>
          </div>
        )}

        {!previewUrl && status === "idle" && (
          <div className="flex flex-col items-center gap-1.5 text-[var(--color-ink-faint)]">
            {kind === "image" ? <ImagePlus size={20} /> : <Video size={20} />}
            <span className="text-[12px]">Click to upload</span>
            <span className="text-[10.5px]">Up to {MAX_SIZE_MB[kind]}MB</span>
          </div>
        )}

        {status === "uploading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 backdrop-blur-sm">
            <Loader2 size={18} className="animate-spin text-[var(--color-accent)]" />
            <div className="h-1 w-2/3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[11px] text-[var(--color-ink-muted)]">{progress}%</span>
          </div>
        )}

        {previewUrl && status !== "uploading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/50 group-hover:opacity-100">
            <span className="flex items-center gap-1.5 text-[12px] font-medium text-white">
              <RotateCcw size={13} /> Replace
            </span>
          </div>
        )}

        {previewUrl && status !== "uploading" && (
          <button
            type="button"
            onClick={handleRemove}
            aria-label={`Remove ${label.toLowerCase()}`}
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-[var(--color-danger)]"
          >
            <X size={12} />
          </button>
        )}

        {status === "done" && !previewUrl && (
          <CheckCircle2 size={16} className="absolute right-2 top-2 text-[var(--color-success)]" />
        )}
      </div>
    </div>
  );
}
