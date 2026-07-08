import { Image as ImageIcon, Video, FileText, Sparkles, Shapes } from "lucide-react";

const ICON_BY_TYPE = { image: ImageIcon, video: Video, logo: Shapes, icon: Sparkles, document: FileText };

export default function MediaAssetCard({ asset, onClick }) {
  const Icon = ICON_BY_TYPE[asset.type] || FileText;

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] text-left transition-colors hover:border-[var(--color-border-strong)]"
    >
      <div className="flex aspect-square items-center justify-center overflow-hidden bg-[var(--color-elevated)]">
        {asset.type === "image" || asset.type === "logo" || asset.type === "icon" ? (
          <img src={asset.url} alt={asset.alt_text || asset.name} className="h-full w-full object-cover" loading="lazy" />
        ) : asset.type === "video" ? (
          <video src={asset.url} className="h-full w-full object-cover" muted />
        ) : (
          <Icon size={22} className="text-[var(--color-ink-faint)]" />
        )}
      </div>
      <div className="p-2.5">
        <p className="truncate text-[12px] font-medium text-[var(--color-ink)]">{asset.name}</p>
        <p className="mt-0.5 text-[10.5px] uppercase tracking-wide text-[var(--color-ink-faint)]">{asset.type}</p>
      </div>
    </button>
  );
}
