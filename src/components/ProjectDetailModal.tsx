import { useEffect } from "react";
import { X, ExternalLink, Star, GitFork, Calendar, Code2, FileText, GitBranch } from "lucide-react";

// Unified shape for the archive — both GitHub repos and internal projects
// are mapped into this before being shown in the modal.
export interface ArchiveItem {
  id: string;
  title: string;
  category: string;
  accent: string;
  description: string;
  summary: string;
  highlights: string[];
  usage?: string[];
  stack: string[];
  meta: { label: string; value: string }[];
  links: { label: string; url: string; external?: boolean }[];
  source: "github" | "internal";
}

interface Props {
  item: ArchiveItem | null;
  onClose: () => void;
}

const META_ICONS: Record<string, any> = {
  Language: Code2,
  License: FileText,
  Stars: Star,
  Forks: GitFork,
  Created: Calendar,
  Updated: Calendar,
  Branch: GitBranch,
};

export function ProjectDetailModal({ item, onClose }: Props) {
  // Close on Escape + lock body scroll while open
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
        style={{ background: "linear-gradient(180deg, #0d141b 0%, #080d12 100%)" }}
      >
        {/* Accent header strip */}
        <div
          className="h-1 w-full rounded-t-2xl"
          style={{ background: `linear-gradient(90deg, ${item.accent}, transparent)` }}
        />

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-1">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                style={{
                  background: `${item.accent}18`,
                  borderColor: `${item.accent}40`,
                  color: item.accent,
                }}
              >
                {item.source === "github" ? (
                  <GitBranch size={18} strokeWidth={1.7} />
                ) : (
                  <FileText size={18} strokeWidth={1.7} />
                )}
              </div>
              <div className="min-w-0">
                <div
                  className="text-[9px] tracking-[0.2em] uppercase font-semibold"
                  style={{ color: item.accent }}
                >
                  {item.category}
                </div>
                <h2 className="text-lg font-semibold text-text-primary leading-tight truncate">
                  {item.title}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-lg border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors flex items-center justify-center shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Description line */}
          <p className="text-[13px] text-text-secondary mb-4">{item.description}</p>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {item.meta.map((m) => {
              const Icon = META_ICONS[m.label] ?? null;
              return (
                <div
                  key={m.label}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/8 bg-white/[0.03] text-[10px] text-text-secondary font-mono"
                >
                  {Icon && <Icon size={11} strokeWidth={1.7} />}
                  <span className="text-text-muted">{m.label}:</span>
                  <span className="text-text-primary">{m.value}</span>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mb-6">
            <div className="text-[9px] tracking-[0.18em] uppercase text-text-muted font-semibold mb-2">
              Overview
            </div>
            <p className="text-[13px] text-text-secondary leading-relaxed">{item.summary}</p>
          </div>

          {/* Highlights */}
          {item.highlights.length > 0 && (
            <div className="mb-6">
              <div className="text-[9px] tracking-[0.18em] uppercase text-text-muted font-semibold mb-3">
                Key Capabilities
              </div>
              <ul className="space-y-2">
                {item.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span
                      className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: item.accent, boxShadow: `0 0 6px ${item.accent}` }}
                    />
                    <span className="text-[12.5px] text-text-secondary leading-relaxed">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Stack */}
          {item.usage && item.usage.length > 0 && (
            <div className="mb-6">
              <div className="text-[9px] tracking-[0.18em] uppercase text-text-muted font-semibold mb-3">How to use it</div>
              <ol className="space-y-2">
                {item.usage.map((step, i) => <li key={step} className="flex items-start gap-3"><span className="project-step" style={{borderColor:`${item.accent}55`,color:item.accent}}>{i+1}</span><span className="text-[12.5px] text-text-secondary leading-relaxed">{step}</span></li>)}
              </ol>
            </div>
          )}

          {/* Stack */}
          {item.stack.length > 0 && (
            <div className="mb-6">
              <div className="text-[9px] tracking-[0.18em] uppercase text-text-muted font-semibold mb-3">
                Technology Stack
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.stack.map((s) => (
                  <span
                    key={s}
                    className="text-[10px] px-2 py-1 rounded-md border font-mono"
                    style={{ borderColor: `${item.accent}30`, color: item.accent }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="pt-4 border-t border-white/8 flex flex-wrap gap-3">
            {item.links.map((l) => (
              <a
                key={l.label}
                href={l.url}
                target={l.external === false ? undefined : "_blank"}
                rel={l.external === false ? undefined : "noopener noreferrer"}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-glow/30 text-cyan-glow text-[11px] tracking-wider font-semibold hover:bg-cyan-glow/10 transition-colors"
              >
                {l.label.toUpperCase()}
                {l.external !== false && <ExternalLink size={12} strokeWidth={2} />}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
