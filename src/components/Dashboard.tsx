import { useState, useEffect, type ReactNode } from "react";
import {
  Shield, Layers, AlertTriangle, Satellite, GraduationCap,
  Briefcase, Award, Droplet, X, ExternalLink, MapPin,
  Star, ChevronLeft, ChevronRight, Calendar,
  Wrench, FolderKanban, FileText, Crosshair, Cpu, Activity,
  Trophy, BookOpen, Info,
} from "lucide-react";
import type { CableMeta, CablePath, LayerId } from "../hooks/useLayers";
import { LAYER_GROUPS } from "../hooks/useLayers";
import { CableInfoPanel } from "./CableInfoPanel";
import { getEnrichedEntry, type EnrichedEntry } from "../data/enriched-entries";
import { fetchPlaceInfo, type PlaceInfo } from "../lib/places";

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
  const [placeInfo, setPlaceInfo] = useState<PlaceInfo | null>(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (!selected) {
      setEnriched(null);
      setPlaceInfo(null);
      setImgLoading(false);
      setImgFailed(false);
      return;
    }
    let cancelled = false;
    const e = getEnrichedEntry(selected.id);
    setEnriched(e || null);
    setPlaceInfo(null);
    setImgFailed(false);

    // Search the actual entity: "Mahanama College, Colombo" etc.
    const city = selected.location.name.split(",")[0].trim();
    const query = `${selected.org}, ${city}`;
    setImgLoading(true);
    fetchPlaceInfo(query, { lat: selected.location.lat, lng: selected.location.lng }).then((info) => {
      if (cancelled) return;
      setPlaceInfo(info);
      setImgLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  /* ── Shared HUD ── */
  const hud = (
    <>
      <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 pointer-events-auto z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glass-dark flex items-center justify-center relative overflow-hidden glare-sweep">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-glow/15 to-transparent" />
            <Shield size={17} className="text-cyan-glow relative z-10" strokeWidth={1.5} />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-medium tracking-[0.2em] text-text-primary">
              AROSHA<span className="text-cyan-glow">.NET</span>
            </div>
            <div className="text-[9px] tracking-[0.18em] uppercase text-text-muted">Network Operations Command</div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="glass-dark rounded-full px-3 py-1.5 flex items-center gap-2">
            <Activity size={10} className="text-cyan-glow" />
            <span className="text-[9px] font-mono text-text-secondary tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-glow shadow-[0_0_8px_#4adede] animate-pulse inline-block mr-1.5" />
              SYS_ONLINE
            </span>
          </div>
          <div className="glass-dark rounded-full px-3 py-1.5">
            <span className="text-[9px] font-mono text-text-muted tracking-wider flex items-center gap-1.5">
              <Crosshair size={9} className="text-text-muted" />
              MELBOURNE, AU
            </span>
          </div>
        </div>
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
  const photo = placeInfo?.photoUri ?? null;
  const mapsUrl = placeInfo?.googleMapsUri || enriched.locationInfo.mapsUrl;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 select-none">
      {hud}

      {/* ══════════════════ SIDE PANEL ══════════════════ */}
      <aside className="absolute right-4 top-16 bottom-8 w-[460px] pointer-events-auto z-30">
        <div className="glass-dark rounded-2xl h-full overflow-y-auto">
          <div className="flex flex-col gap-3 p-4">

            {/* ── HERO: entity image + identity overlay ── */}
            <div className="relative w-full h-40 rounded-xl overflow-hidden shrink-0 border"
              style={{ boxShadow: `0 8px 32px rgba(0,0,0,0.5), inset 0 0 0 1px ${color}33` }}>
              {photo && !imgFailed ? (
                <img src={photo} alt={placeInfo?.displayName || enriched.org}
                  onLoad={() => setImgLoading(false)} onError={() => { setImgFailed(true); setImgLoading(false); }}
                  className="absolute inset-0 w-full h-full object-cover" />
              ) : imgLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-space-deep">
                  <div className="w-6 h-6 border-2 border-cyan-glow/40 border-t-cyan-glow rounded-full animate-spin" />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-space-deep">
                  <div className="absolute inset-0 opacity-70" style={{ background: `radial-gradient(circle at 28% 20%, ${color}45, transparent 42%), linear-gradient(135deg, #101923, #050810)` }} />
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
                  <span className="relative text-[11px] font-mono text-text-secondary tracking-[0.2em] text-center px-8">
                    {enriched.org.toUpperCase()}<small className="block mt-2 text-[8px] text-text-muted">{enriched.location.name.toUpperCase()}</small>
                  </span>
                </div>
              )}
              {/* gradient scrim */}
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
                {placeInfo?.photoAttribution && (
                  <span className="text-[8px] text-text-muted font-mono bg-black/40 backdrop-blur px-1.5 py-1 rounded">
                    📷 {placeInfo.photoAttribution}
                  </span>
                )}
              </div>

              {/* identity */}
              <div className="absolute bottom-3 left-4 right-4">
                <div className="text-[9px] tracking-[0.14em] uppercase font-semibold mb-0.5" style={{ color }}>
                  {placeInfo?.displayName || enriched.org}
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
              <StatBox accent={color} icon={Trophy} value={enriched.achievements.length} label="Outcomes" />
              <StatBox accent={color} icon={Wrench} value={enriched.technologies.length} label="Core systems" />
              <StatBox accent={color} icon={FolderKanban} value={enriched.relatedProjects.length} label="Linked projects" />
            </div>

            {/* ── ABOUT / ADDRESS ── */}
            {(placeInfo?.formattedAddress || placeInfo?.editorialSummary) && (
              <Section label="Entity Intel" icon={Info} accent={color}>
                <div className="grid grid-cols-[50px_1fr] gap-y-2 text-[11px]">
                  {placeInfo.formattedAddress && (
                    <>
                      <span className="text-[9px] font-mono text-text-muted pt-0.5">ADDR</span>
                      <span className="text-text-secondary leading-relaxed">{placeInfo.formattedAddress}</span>
                    </>
                  )}
                  {placeInfo.editorialSummary && (
                    <>
                      <span className="text-[9px] font-mono text-text-muted pt-0.5">INFO</span>
                      <span className="text-text-secondary leading-relaxed italic">{placeInfo.editorialSummary}</span>
                    </>
                  )}
                  <span className="text-[9px] font-mono text-text-muted pt-0.5">LINK</span>
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:underline font-mono text-[10px]" style={{ color }}>
                    Open in Google Maps <ExternalLink size={9} />
                  </a>
                  <span className="text-[9px] font-mono text-text-muted pt-0.5">SOURCE</span>
                  <span className="text-text-secondary text-[10px] font-mono">
                    {placeInfo.source === "google" ? "Google Places" : "Wikipedia / Wikimedia Commons"}
                  </span>
                </div>
              </Section>
            )}

            {/* ── BRIEFING ── */}
            <Section label="Briefing" icon={BookOpen} accent={color}>
              <div className="space-y-3">
                {(enriched.cards || []).map((c, i) => (
                  <div key={i} className="border-l-2 pl-3" style={{ borderColor: `${color}66` }}>
                    <div className="text-[9px] tracking-[0.14em] uppercase font-semibold font-mono mb-1" style={{ color }}>
                      {c.heading}
                    </div>
                    <div className="text-[12px] text-text-secondary leading-relaxed">{c.body}</div>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── ACHIEVEMENTS ── */}
            {enriched.achievements.length > 0 && (
              <Section label="Achievements" icon={Trophy} accent={color}>
                <ul className="space-y-2">
                  {enriched.achievements.map((a, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                      <span className="text-[12px] text-text-secondary leading-relaxed">{a}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* ── SYSTEMS ── */}
            {enriched.technologies.length > 0 && (
              <Section label="Systems" icon={Wrench} accent={color}>
                <div className="flex flex-wrap gap-1.5">
                  {enriched.technologies.map((t) => (
                    <span key={t} className="text-[9px] px-2 py-1 rounded-md border font-mono"
                      style={{ borderColor: `${color}30`, color, background: `${color}08` }}>
                      {t}
                    </span>
                  ))}
                </div>
              </Section>
            )}

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

            {/* ── TRAJECTORY ── */}
            {(enriched.journeyContext.previousRole || enriched.journeyContext.nextRole) && (
              <Section label="Trajectory" icon={Calendar} accent={color}>
                <div className="flex items-stretch gap-2">
                  {enriched.journeyContext.previousRole && (
                    <div className="flex-1 glass-clear rounded-lg p-2.5">
                      <div className="text-[8px] font-mono text-text-muted flex items-center gap-1 mb-1">
                        <ChevronLeft size={9} /> PREVIOUS
                      </div>
                      <div className="text-[10.5px] text-text-primary font-semibold leading-snug">
                        {enriched.journeyContext.previousRole.title.split("\u2014")[0].split("-")[0].trim()}
                      </div>
                      <div className="text-[9px] text-text-muted mt-0.5">{enriched.journeyContext.previousRole.org}</div>
                      <div className="text-[8px] font-mono text-text-muted mt-0.5">{enriched.journeyContext.previousRole.period}</div>
                    </div>
                  )}
                  {enriched.journeyContext.nextRole && (
                    <div className="flex-1 glass-clear rounded-lg p-2.5">
                      <div className="text-[8px] font-mono text-text-muted flex items-center gap-1 justify-end mb-1">
                        NEXT <ChevronRight size={9} />
                      </div>
                      <div className="text-[10.5px] text-text-primary font-semibold leading-snug">
                        {enriched.journeyContext.nextRole.title.split("\u2014")[0].split("-")[0].trim()}
                      </div>
                      <div className="text-[9px] text-text-muted mt-0.5">{enriched.journeyContext.nextRole.org}</div>
                      <div className="text-[8px] font-mono text-text-muted mt-0.5">{enriched.journeyContext.nextRole.period}</div>
                    </div>
                  )}
                </div>
              </Section>
            )}

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
