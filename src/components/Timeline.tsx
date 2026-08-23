import { useState, useEffect } from "react";
import type { LayerId } from "../hooks/useLayers";

interface TimelineEntry {
  id: string;
  year: string;
  label: string;
  org: string;
  location: string;
  period: string;
  lat: number;
  lng: number;
  entry: any;
}

interface TimelineProps {
  entries: any[];
  onFlyTo: (e: TimelineEntry) => void;
}

// Short display name for the organisation
function orgShort(org: string): string {
  if (org.includes("ROONG")) return "ROONG";
  if (org.startsWith("City")) return "City & Guilds";
  if (org.includes("Independent")) return "Independent";
  return org.split(/\s+/)[0];
}

// Build an ordered timeline from entries — EVERY CV item is shown
// (dedupe by id only, never by year+location which was hiding entries)
function buildTimeline(entries: any[]): TimelineEntry[] {
  const seen = new Set<string>();
  const out = entries
    .map((e) => {
      const m = (e.period || "").match(/(\d{4})/);
      const year = m ? m[1] : e.period || "";
      return {
        id: e.id ?? e.title,
        year,
        label: e.title.split("\u2014")[0].split("-")[0].trim().slice(0, 34),
        org: orgShort(e.org || ""),
        location: e.location.name.split(",")[0],
        period: e.period || "",
        lat: e.location.lat,
        lng: e.location.lng,
        entry: e,
      };
    })
    .filter((e) => e.year)
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));
  return out.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
}

export function Timeline({ entries, onFlyTo }: TimelineProps) {
  const [active, setActive] = useState<string>("");
  const timeline = buildTimeline(entries);

  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-16 z-30 pointer-events-auto">
      <div className="glass-dark rounded-2xl px-4 py-3 flex items-center gap-1 overflow-x-auto max-w-[85vw]">
        <span className="micro-label mr-3 whitespace-nowrap">TIMELINE</span>
        {timeline.map((e, i) => (
          <div key={e.id} className="flex items-center">
            <button
              onClick={() => { setActive(e.id); onFlyTo(e); }}
              title={`${e.label} — ${e.period} (${e.location})`}
              className={`flex flex-col items-center px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${active === e.id ? "bg-cyan-glow/15 border border-cyan-glow/40" : "hover:bg-white/5 border border-transparent"}`}
            >
              <span className={`text-[12px] font-medium tracking-wide ${active === e.id ? "text-cyan-glow" : "text-text-secondary"}`}>{e.year}</span>
              <span className={`text-[8px] tracking-wide uppercase ${active === e.id ? "text-cyan-glow" : "text-text-muted"}`}>{e.org}</span>
            </button>
            {i < timeline.length - 1 && <div className="w-3 h-[1px] bg-cyan-glow/20" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Free location image (Wikipedia Commons, no API key) ──
export function useLocationImage(query: string | null) {
  const [img, setImg] = useState<string | null>(null);
  useEffect(() => {
    if (!query) { setImg(null); return; }
    let cancelled = false;
    // Wikipedia Commons API: search for an image, get a thumbnail
    const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=thumbnail&pithumbsize=400&titles=${encodeURIComponent(query)}&origin=*`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const pages = d?.query?.pages || {};
        const first = Object.values(pages)[0] as any;
        if (first?.thumbnail?.source) setImg(first.thumbnail.source);
        else setImg(null);
      })
      .catch(() => { if (!cancelled) setImg(null); });
    return () => { cancelled = true; };
  }, [query]);
  return img;
}
