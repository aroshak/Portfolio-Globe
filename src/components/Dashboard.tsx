import { useState, useEffect, type ReactNode } from "react";
import {
  Layers, AlertTriangle, Satellite, GraduationCap,
  Briefcase, Award, Droplet, X, ExternalLink, MapPin,
  Wrench, FolderKanban, FileText, Cpu, CheckCircle2,
  Trophy, BookOpen, ListChecks, ShieldCheck,
} from "lucide-react";
import type { CableMeta, CablePath, LayerId } from "../hooks/useLayers";
import { LAYER_GROUPS } from "../hooks/useLayers";
import { CableInfoPanel } from "./CableInfoPanel";
import { getEnrichedEntry, type EnrichedEntry } from "../data/enriched-entries";
import { githubProfile } from "../data/github-repos";

const TAB_COLOR: Record<string, string> = {
  education: "#4adede",
  experience: "#5ab669",
  certifications: "#ffb84d",
};

const TAB_LABEL: Record<string, string> = {
  education: "EDUCATION",
  experience: "EXPERIENCE",
  certifications: "CERTIFICATION",
};

const ICONS: Record<string, any> = {
  grad: GraduationCap,
  brief: Briefcase,
  cert: Award,
  wave: Layers,
  droplet: Droplet,
  alert: AlertTriangle,
  sat: Satellite,
};

interface DashboardProps {
  active: Set<LayerId>;
  onToggle: (id: LayerId) => void;
  selected: any | null;
  onSelect: (entry: any) => void;
  entries: any[];
  overlayStats?: string;
  selectedCable: CablePath | null;
  onSelectCable: (cable: CablePath | null) => void;
  cableMeta: CableMeta;
}

/* ─────────────────────────────────────────────────────────────
   Panel building blocks — uniform section pattern
   ───────────────────────────────────────────────────────────── */

function Section({
  label,
  icon: Icon,
  accent,
  children,
}: {
  label: string;
  icon: any;
  accent: string;
  children: ReactNode;
}) {
  return (
    <section className="glass-clear rounded-xl border border-white/[0.07] p-3.5">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="w-7 h-7 rounded-lg flex items-center justify-center border" style={{ color: accent, borderColor: `${accent}30`, background: `${accent}0d` }}><Icon size={13} strokeWidth={1.8} /></span>
        <span className="text-[8px] tracking-[0.22em] uppercase font-semibold font-mono text-text-muted">
          {label}
        </span>
        <div className="h-px flex-1 bg-white/5" />
      </div>
      {children}
    </section>
  );
}

function StatBox({
  value,
  label,
  accent,
  icon: Icon,
}: {
  value: ReactNode;
  label: string;
  accent: string;
  icon?: any;
}) {
  return (
    <div className="glass-clear rounded-lg py-2.5 px-2 text-center">
      {Icon && <Icon size={12} className="mx-auto mb-1.5" style={{ color: accent }} />}
      <div className="text-[13px] font-semibold text-text-primary leading-tight mb-0.5">
        {value}
      </div>
      <div className="text-[7px] tracking-[0.18em] uppercase font-mono" style={{ color: accent }}>
        {label}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────── */

export function Dashboard({ active, onToggle, selected, onSelect, entries, overlayStats, selectedCable, onSelectCable, cableMeta }: DashboardProps) {
  const [enriched, setEnriched] = useState<EnrichedEntry | null>(null);

  useEffect(() => {
    if (!selected) {
      setEnriched(null);
      return;
    }
    const e = getEnrichedEntry(selected.id);
    setEnriched(e || null);
  }, [selected]);

  /* ── Shared HUD ── */
  const hud = (
    <>
      <header className="hero-command-header pointer-events-auto">
        <a className="hero-brand" href="https://arosha.au" aria-label="Arosha Kaluarachchi home">
          <span className="hero-avatar-wrap"><img src={githubProfile.avatar} alt="Arosha Kaluarachchi"/><i /></span>
          <span className="hero-identity"><b>Arosha Kaluarachchi</b><small>Senior Network Engineer · AI & Automation</small></span>
        </a>
      </header>

      <aside className="absolute left-4 top-20 bottom-28 w-[244px] pointer-events-auto z-20">
        <div className="glass-dark rounded-2xl p-4 h-full flex flex-col gap-4 overflow-y-auto">
          <div className="text-[9px] tracking-[0.2em] uppercase text-text-muted font-semibold font-mono flex items-center gap-2">
            <Cpu size={12} className="text-cyan-glow" />
            Layer Control
          </div>
          {LAYER_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="text-[8px] tracking-[0.16em] uppercase text-text-muted mb-2 font-mono">{group.label}</div>
              <div className="space-y-1">
                {group.layers.map((layer) => {
                  const Icon = ICONS[layer.icon] ?? Layers;
                  const isOn = active.has(layer.id);
                  return (
                    <button key={layer.id} onClick={() => onToggle(layer.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-200 border ${
                        isOn ? "bg-cyan-glow/10 border-cyan-glow/40 text-text-primary shadow-[0_0_10px_rgba(74,222,222,0.12)]"
                             : "border-white/5 text-text-secondary hover:bg-white/5 hover:text-text-primary hover:border-white/10"
                      }`}>
                      <Icon size={14} className={isOn ? "text-cyan-glow" : "text-text-muted"} strokeWidth={1.6} />
                      <span className="text-[11px] font-medium tracking-wide flex-1 text-left">{layer.label}</span>
                      <span className={`w-1.5 h-1.5 rounded-full transition-all ${isOn ? "bg-cyan-glow shadow-[0_0_8px_#4adede]" : "bg-text-muted/40"}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="absolute bottom-4 left-4 pointer-events-auto z-20">
        <div className="glass-dark rounded-full px-3 py-2 flex items-center gap-2 text-[10px] font-mono text-text-secondary">
          <Layers size={12} className="text-cyan-glow" strokeWidth={1.6} />
          <span>{entries.length} NODES</span>
          {overlayStats && (
            <>
              <span className="text-text-muted">·</span>
              <span className="text-alert-amber">{overlayStats}</span>
            </>
          )}
          <span className="text-text-muted">·</span>
          <span className="text-text-primary">{[...active].join(" / ").toUpperCase()}</span>
        </div>
      </div>
      <div className="absolute bottom-4 right-4 pointer-events-auto z-20">
        <div className="glass-dark rounded-full px-3 py-2 text-[10px] font-mono text-text-muted">
          🖱 drag · scroll · hover pins
        </div>
      </div>
    </>
  );

  if (selectedCable) {
    return <div className="absolute inset-0 pointer-events-none z-20 select-none">{hud}<CableInfoPanel cable={selectedCable} meta={cableMeta} onClose={() => onSelectCable(null)} /></div>;
  }

  if (!selected || !enriched) {
    return <div className="absolute inset-0 pointer-events-none z-20 select-none">{hud}</div>;
  }

  /* ── Selection active ── */
  const color = TAB_COLOR[enriched.tab] ?? "#4adede";
  const title = enriched.title.split("\u2014")[0].split("-")[0].trim();
  const mapsUrl = enriched.locationInfo.mapsUrl;
  const primaryCount = enriched.workstreams.reduce((sum, group) => sum + group.items.length, 0);
  const skillCount = enriched.capabilities.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className="absolute inset-0 pointer-events-none z-20 select-none">
      {hud}

      {/* ══════════════════ SIDE PANEL ══════════════════ */}
      <aside key={enriched.id} className="info-panel-reveal absolute right-4 top-16 bottom-8 w-[460px] pointer-events-auto z-30">
        <div className="glass-dark rounded-2xl h-full overflow-y-auto">
          <div className="panel-cascade flex flex-col gap-3 p-4">

            {/* ── HERO: portfolio-owned identity, never external entity copy ── */}
            <div className="relative w-full h-40 rounded-xl overflow-hidden shrink-0 border"
              style={{ boxShadow: `0 8px 32px rgba(0,0,0,0.5), inset 0 0 0 1px ${color}33` }}>
              <div className="absolute inset-0 overflow-hidden bg-space-deep">
                <div className="absolute inset-0 opacity-80" style={{ background: `radial-gradient(circle at 20% 20%, ${color}55, transparent 38%), radial-gradient(circle at 85% 100%, ${color}22, transparent 45%), linear-gradient(135deg, #101923, #050810)` }} />
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
                <div className="absolute right-8 top-7 h-20 w-20 rounded-full border opacity-30" style={{ borderColor: color, boxShadow: `0 0 30px ${color}44, inset 0 0 20px ${color}33` }} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#060a12] via-[#060a12]/35 to-transparent" />

              {/* close */}
              <button onClick={() => onSelect(null)}
                className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-black/50 backdrop-blur border border-white/15 text-text-secondary hover:text-text-primary hover:bg-black/70 transition-all flex items-center justify-center">
                <X size={13} />
              </button>

              {/* tab badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="text-[8px] tracking-[0.18em] font-semibold font-mono px-2 py-1 rounded backdrop-blur bg-black/50 border"
                  style={{ color, borderColor: `${color}66` }}>
                  {TAB_LABEL[enriched.tab]}
                </span>
                <span className="text-[8px] text-text-muted font-mono bg-black/40 backdrop-blur px-1.5 py-1 rounded flex items-center gap-1"><ShieldCheck size={9} style={{ color }} /> PORTFOLIO RECORD</span>
              </div>

              {/* identity */}
              <div className="absolute bottom-3 left-4 right-4">
                <div className="text-[9px] tracking-[0.14em] uppercase font-semibold mb-0.5" style={{ color }}>
                  {enriched.org}
                </div>
                <div className="text-[16px] font-semibold text-text-primary leading-snug">
                  {title}
                </div>
                <div className="flex items-center gap-3 mt-1 text-[9px] font-mono text-text-muted">
                  <span className="flex items-center gap-1">
                    <MapPin size={10} /> {enriched.location.name}
                  </span>
                  <span>·</span>
                  <span>{enriched.period}</span>
                </div>
              </div>
            </div>

            {/* ── STATS ROW ── */}
            <div className="grid grid-cols-3 gap-2">
              <StatBox accent={color} icon={ListChecks} value={primaryCount} label={enriched.tab === "education" ? "Study items" : "Work items"} />
              <StatBox accent={color} icon={Wrench} value={skillCount} label="Capabilities" />
              <StatBox accent={color} icon={Trophy} value={enriched.outcomes.length} label="Outcomes" />
            </div>

            <Section label="Record summary" icon={BookOpen} accent={color}>
              <p className="text-[12px] text-text-secondary leading-relaxed">{enriched.summary}</p>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-1 text-[9px] font-mono hover:underline" style={{ color }}>
                <MapPin size={9} /> LOCATION COORDINATES <ExternalLink size={8} />
              </a>
            </Section>

            <Section label={enriched.tab === "education" ? "Study breakdown" : enriched.tab === "certifications" ? "Credential breakdown" : "Work breakdown"} icon={ListChecks} accent={color}>
              <div className="grid grid-cols-2 gap-2">
                {enriched.workstreams.map((group) => (
                  <div key={group.title} className="glass-clear rounded-lg p-3 border border-white/[0.05]">
                    <div className="text-[9px] tracking-[0.12em] uppercase font-semibold font-mono mb-2" style={{ color }}>{group.title}</div>
                    <ul className="space-y-1.5">{group.items.map((item) => <li key={item} className="flex gap-2 text-[10.5px] leading-relaxed text-text-secondary"><CheckCircle2 size={10} className="mt-0.5 shrink-0" style={{ color }} />{item}</li>)}</ul>
                  </div>
                ))}
              </div>
            </Section>

            <Section label={enriched.tab === "education" ? "Learning & capability" : "Skills & systems"} icon={Wrench} accent={color}>
              <div className="space-y-2">
                {enriched.capabilities.map((group) => (
                  <div key={group.title}>
                    <div className="text-[8px] uppercase tracking-[0.14em] font-mono text-text-muted mb-1.5">{group.title}</div>
                    <div className="flex flex-wrap gap-1.5">{group.items.map((item) => <span key={item} className="text-[9px] px-2 py-1 rounded-md border font-mono" style={{ borderColor: `${color}35`, color, background: `${color}0b` }}>{item}</span>)}</div>
                  </div>
                ))}
              </div>
              </Section>

            {enriched.outcomes.length > 0 && <Section label="Evidence & outcomes" icon={Trophy} accent={color}><ul className="space-y-2">{enriched.outcomes.map((item) => <li key={item} className="flex items-start gap-2.5"><span className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} /><span className="text-[12px] text-text-secondary leading-relaxed">{item}</span></li>)}</ul></Section>}

            {/* ── DEPLOYMENTS ── */}
            {enriched.relatedProjects.length > 0 && (
              <Section label="Deployments" icon={FolderKanban} accent={color}>
                <div className="space-y-2">
                  {enriched.relatedProjects.map((p) => (
                    <div key={p.id} className="glass-clear rounded-lg p-3">
                      <div className="text-[12px] font-semibold text-text-primary mb-1">{p.title}</div>
                      <p className="text-[11px] text-text-secondary leading-relaxed mb-2">{p.summary}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {p.stack.slice(0, 5).map((s) => (
                          <span key={s} className="text-[8px] px-1.5 py-0.5 rounded border border-white/10 text-text-muted font-mono">{s}</span>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        {p.doc && (
                          <a href={`/docs/${p.doc.split("/").pop()}`} className="text-[9px] font-mono hover:underline flex items-center gap-1" style={{ color }}>
                            <FileText size={9} /> WRITE-UP
                          </a>
                        )}
                        {p.link && (
                          <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-[9px] font-mono hover:underline flex items-center gap-1" style={{ color }}>
                            <ExternalLink size={9} /> VISIT
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section label="Source control" icon={ShieldCheck} accent={color}>
              <div className="flex flex-wrap gap-1.5">{enriched.sources.map((source) => <span key={source} className="flex items-center gap-1 text-[8px] px-2 py-1 rounded border border-white/10 text-text-muted font-mono"><CheckCircle2 size={9} style={{ color }} />{source.toUpperCase()}</span>)}</div>
            </Section>

            {/* ── FOOTER ── */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span className="text-[9px] font-mono text-text-muted">
                {enriched.location.lat.toFixed(4)}, {enriched.location.lng.toFixed(4)}
              </span>
              <span className="text-[9px] font-mono text-text-muted">
                NODE_{enriched.id.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(-4)}
              </span>
              <button onClick={() => onSelect(null)}
                className="text-[9px] font-mono tracking-[0.15em] hover:underline" style={{ color }}>
                DISMISS
              </button>
            </div>

          </div>
        </div>
      </aside>
    </div>
  );
}
