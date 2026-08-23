import { useEffect, useMemo, useRef, useState } from "react";
import Globe, { GlobeMethods } from "react-globe.gl";
import type { LayerId } from "../hooks/useLayers";
import type { CablePath, ThreatRing, MarinePoint } from "../hooks/useLayers";
import { useSatellites } from "../hooks/useSatellites";

interface GlobeHeroProps {
  active: Set<LayerId>;
  activeEntries: any[];
  arcsData: any[];
  cables: CablePath[];
  threats: ThreatRing[];
  marine: MarinePoint[];
  home: { lat: number; lng: number };
  selected: any | null;
  onSelect: (e: any) => void;
  selectedCable: CablePath | null;
  onSelectCable: (cable: CablePath | null) => void;
  flyTarget: { lat: number; lng: number; id: string } | null;
}

const TAB_COLOR: Record<string, string> = {
  education: "#4adede",
  experience: "#5ab669",
  certifications: "#ffb84d",
};

// ── Shared tooltip markup for point/path hover labels ──
function tip(title: string, sub: string, accent: string): string {
  return `<div style="
    background:rgba(6,11,19,0.62);
    backdrop-filter:blur(14px) saturate(125%);
    border:1px solid ${accent}55;
    border-left:2px solid ${accent};
    border-radius:6px;
    padding:5px 9px;
    font-family:'Inter',sans-serif;
    max-width:240px;
    box-shadow:0 4px 16px rgba(0,0,0,0.5);">
    <div style="font-size:10.5px;font-weight:600;color:#e8f4f8;line-height:1.3;">${title}</div>
    ${sub ? `<div style="font-size:8.5px;color:#8aa0b0;font-family:'JetBrains Mono',monospace;margin-top:2px;line-height:1.35;">${sub}</div>` : ""}
  </div>`;
}

// ── Botnet family → colour (globalthreatmap-style threat levels) ──
const FAMILY_COLOR: Record<string, string> = {
  QakBot: "#ff4d4d",
  Emotet: "#ff6b35",
  TrickBot: "#ff4d9d",
  BumbleBee: "#ffb84d",
  Dridex: "#ff4dff",
  SocGholish: "#ff8080",
};
function threatColor(family: string): string {
  return FAMILY_COLOR[family] ?? "#ff4d4d";
}
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── Build a floating label for the globe ──
// Always visible. Small collapsed state; expands on hover to show full details.
// Click opens the side panel.
function buildLabel(entry: any, onSelect: (e: any) => void): HTMLDivElement {
  const color = TAB_COLOR[entry.tab] ?? "#4adede";
  const cityName = entry.location.name.split(",")[0].trim();
  const title = entry.title.split("\u2014")[0].split("-")[0].trim();
  const cardCount = (entry.cards || []).length;

  const wrapper = document.createElement("div");
  wrapper.style.cssText =
    "display:flex;flex-direction:column;align-items:center;cursor:pointer;pointer-events:auto;";

  wrapper.innerHTML = `
    <!-- Collapsed label (always visible) -->
    <div class="globe-label-collapsed" style="
      display:flex;
      flex-direction:column;
      align-items:center;
      transition:opacity 0.25s;">
      <div style="
        background:rgba(6,11,19,0.52);
        backdrop-filter:blur(12px) saturate(125%);
        -webkit-backdrop-filter:blur(12px) saturate(125%);
        border:1px solid ${color}66;
        border-radius:7px;
        padding:3px 8px;
        white-space:nowrap;
        font-family:'Inter',sans-serif;
        font-size:10px;
        font-weight:500;
        color:#e8f4f8;
        box-shadow:0 0 10px ${color}33,0 4px 12px rgba(0,0,0,0.4);
        line-height:1.3;
        transition:all 0.2s;">
        <span style="color:${color};font-weight:600;">${cityName}</span>
        <span style="color:#4a6070;margin:0 3px;">·</span>
        <span style="font-size:8px;letter-spacing:0.06em;color:#8aa0b0;">${entry.period}</span>
      </div>
      <div style="width:1px;height:6px;background:${color}66;"></div>
      <div style="width:8px;height:8px;border-radius:50%;background:${color};box-shadow:0 0 8px ${color},0 0 0 2px ${color}33;"></div>
    </div>

    <!-- Expanded card (hidden, shown on hover) -->
    <div class="globe-label-expanded" style="
      display:none;
      flex-direction:column;
      margin-top:3px;
      transition:opacity 0.25s;">
      <div style="
        background:rgba(6,11,19,0.60);
        backdrop-filter:blur(20px) saturate(130%);
        -webkit-backdrop-filter:blur(20px) saturate(130%);
        border:1px solid ${color}55;
        border-left:3px solid ${color};
        border-radius:10px;
        padding:8px 11px;
        width:220px;
        font-family:'Inter','Space Grotesk',sans-serif;
        color:#e8f4f8;
        box-shadow:0 0 24px ${color}22,0 8px 40px rgba(0,0,0,0.55);
        line-height:1.35;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
          <span style="font-family:'JetBrains Mono',monospace;font-size:7px;letter-spacing:0.16em;text-transform:uppercase;color:${color};background:${color}18;padding:2px 5px;border-radius:3px;border:1px solid ${color}40;">${entry.tab.toUpperCase()}</span>
          <span style="font-family:'JetBrains Mono',monospace;font-size:8px;color:#4a6070;">${entry.period}</span>
        </div>
        <div style="font-size:8.5px;letter-spacing:0.08em;text-transform:uppercase;color:${color};margin-bottom:1px;font-weight:600;">${entry.org}</div>
        <div style="font-size:11.5px;font-weight:600;color:#e8f4f8;margin-bottom:2px;line-height:1.3;">${title}</div>
        ${(entry.cards || []).slice(0, 2).map((c: any) =>
          `<div style="margin-top:3px;">
            <div style="font-family:'JetBrains Mono',monospace;font-size:6.5px;letter-spacing:0.12em;text-transform:uppercase;color:${color};margin-bottom:1px;">▸ ${c.heading}</div>
            <div style="font-size:9.5px;line-height:1.4;color:#a0b8c4;">${c.body.slice(0, 80)}${c.body.length > 80 ? '…' : ''}</div>
          </div>`
        ).join("")}
        <div style="margin-top:6px;padding-top:4px;border-top:1px solid ${color}22;font-family:'JetBrains Mono',monospace;font-size:7px;letter-spacing:0.12em;text-transform:uppercase;color:${color};text-align:right;">
          ▶ CLICK FOR FULL DOSSIER  ·  ${cardCount} records
        </div>
      </div>
    </div>`;

  // Hover: hide collapsed, show expanded
  wrapper.addEventListener("mouseenter", () => {
    const collapsed = wrapper.querySelector(".globe-label-collapsed") as HTMLElement;
    const expanded = wrapper.querySelector(".globe-label-expanded") as HTMLElement;
    if (collapsed) collapsed.style.opacity = "0";
    if (expanded) { expanded.style.display = "flex"; expanded.style.opacity = "1"; }
  });
  wrapper.addEventListener("mouseleave", () => {
    const collapsed = wrapper.querySelector(".globe-label-collapsed") as HTMLElement;
    const expanded = wrapper.querySelector(".globe-label-expanded") as HTMLElement;
    if (collapsed) collapsed.style.opacity = "1";
    if (expanded) { expanded.style.opacity = "0"; setTimeout(() => { if (expanded) expanded.style.display = "none"; }, 250); }
  });

  // Click → open side panel
  wrapper.addEventListener("click", (e) => {
    e.stopPropagation();
    onSelect(entry);
  });

  return wrapper;
}

export function GlobeHero({
  active,
  activeEntries,
  arcsData,
  cables,
  threats,
  marine,
  home,
  selected,
  onSelect,
  selectedCable,
  onSelectCable,
  flyTarget,
}: GlobeHeroProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<[number, number]>([
    typeof window !== "undefined" ? window.innerWidth : 1280,
    typeof window !== "undefined" ? window.innerHeight : 800,
  ]);
  const sats = useSatellites(active.has("satellites"));
  const introDone = useRef(false);
  const marineFocused = useRef(false);

  // Responsive sizing
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize([el.clientWidth, el.clientHeight]);
    });
    ro.observe(el);
    setSize([el.clientWidth, el.clientHeight]);
    return () => ro.disconnect();
  }, []);

  // Camera intro — fly to home, then disable auto-rotate
  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    g.pointOfView({ lat: 12, lng: 80, altitude: 3.2 }, 0);
    const t = setTimeout(() => {
      g.pointOfView({ lat: home.lat, lng: home.lng, altitude: 2.2 }, 2200);
      // After intro completes, stop auto-rotate
      setTimeout(() => {
        introDone.current = true;
        const controls = g.controls() as any;
        if (controls) controls.autoRotate = false;
      }, 2500);
    }, 600);
    return () => clearTimeout(t);
  }, [home.lat, home.lng]);

  // Fly-to from timeline
  useEffect(() => {
    const g = globeRef.current;
    if (!g || !flyTarget) return;
    g.pointOfView({ lat: flyTarget.lat, lng: flyTarget.lng, altitude: 1.4 }, 1800);
  }, [flyTarget]);

  // Marine infrastructure is densest around the North Sea. Focus that region
  // once the lazy snapshot is ready so enabling the layer produces an
  // immediately visible result instead of leaving the user over Melbourne.
  useEffect(() => {
    const enabled = active.has("marine");
    if (!enabled) {
      marineFocused.current = false;
      return;
    }
    if (!marine.length || marineFocused.current || !globeRef.current) return;
    marineFocused.current = true;
    globeRef.current.pointOfView({ lat: 55, lng: 3, altitude: 1.65 }, 1600);
  }, [active, marine.length]);

  // ── Points: one shared layer, every point carries its own hover label ──
  // (satlas pattern: colour-coded categories + hover info)
  const marineColor: Record<string, string> = {
    offshore_platform: "#ffb84d",
    offshore_wind_turbine: "#5ab669",
  };
  const pointsData = useMemo(() => {
    const cv = activeEntries.map((e) => ({
      lat: e.location.lat,
      lng: e.location.lng,
      alt: 0.012,
      r: 0.024,
      color: TAB_COLOR[e.tab] ?? "#4adede",
      label: tip(e.org, `${e.title} · ${e.period}`, TAB_COLOR[e.tab] ?? "#4adede"),
    }));
    const marinePts = active.has("marine")
      ? marine.map((m) => ({
          lat: m.lat,
          lng: m.lng,
          alt: 0.012,
          // globe.gl's point radius is in angular degrees. The previous
          // 0.012 value was effectively sub-pixel at normal camera distance.
          r: m.category === "offshore_platform" ? 0.16 : 0.11,
          color: marineColor[m.category] ?? "#8aa0b0",
          label: tip(
            m.category === "offshore_wind_turbine" ? "Offshore Wind Turbine" : "Offshore Platform",
            `detection confidence ${(m.score * 100).toFixed(0)}% · Satlas dataset`,
            marineColor[m.category] ?? "#8aa0b0"
          ),
        }))
      : [];
    const satPts = active.has("satellites")
      ? sats.map((s) => {
          const altKm = Math.round(s.alt * 6371);
          return {
            lat: s.lat,
            lng: s.lng,
            alt: Math.max(0.03, s.alt),
            r: 0.016,
            color: "#e8f4f8",
            label: tip(s.name, `altitude ${altKm} km · live TLE`, "#e8f4f8"),
          };
        })
      : [];
    const threatPts = active.has("threats")
      ? threats.map((t) => ({
          lat: t.lat,
          lng: t.lng,
          alt: 0.004,
          r: 0.014,
          color: threatColor(t.family),
          label: tip(
            `⚠ ${t.family || "Botnet"} C2`,
            `${t.ip}${t.country ? ` · ${t.country}` : ""} · Feodo Tracker`,
            threatColor(t.family)
          ),
        }))
      : [];
    return [...cv, ...marinePts, ...satPts, ...threatPts];
  }, [activeEntries, active, marine, sats, threats]);

  // Always show floating labels for all active entries.
  // Entries sharing the same coordinates (e.g. several Colombo roles) are
  // fanned out in a small spiral so every label stays visible.
  const htmlElementsData = useMemo(() => {
    const groupCount: Record<string, number> = {};
    return activeEntries.map((e: any) => {
      const key = `${e.location.lat.toFixed(2)},${e.location.lng.toFixed(2)}`;
      groupCount[key] = (groupCount[key] ?? 0) + 1;
      const idx = groupCount[key];
      if (idx === 1) return e;
      const angle = idx * 2.2;
      const radius = 0.55 * Math.ceil(idx / 6);
      return {
        ...e,
        location: {
          ...e.location,
          lat: e.location.lat + Math.sin(angle) * radius,
          lng: e.location.lng + Math.cos(angle) * radius * 1.4,
        },
      };
    });
  }, [activeEntries]);

  const cablesPaths = useMemo(
    () => (active.has("cables") ? cables : []),
    [cables, active]
  );
  const threatRings = useMemo(
    () => (active.has("threats") ? threats : []),
    [threats, active]
  );

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Globe
        ref={globeRef as any}
        width={size[0]}
        height={size[1]}
        backgroundColor="#050810"
        backgroundImageUrl="https://cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
        globeImageUrl="/textures/earth-night.jpg"
        bumpImageUrl="/textures/earth-bump-8k.jpg"
        showAtmosphere
        atmosphereColor="#4adede"
        atmosphereAltitude={0.18}
        // 3D glowing dots — never merged, so every point keeps its hover label
        pointsData={pointsData}
        pointsMerge={false}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude="alt"
        pointRadius="r"
        pointResolution={12}
        pointLabel={(d: any) => d.label || ""}
        // Always-visible floating labels
        htmlElementsData={htmlElementsData}
        htmlLat={(d: any) => d.location.lat}
        htmlLng={(d: any) => d.location.lng}
        htmlElement={(d: any) => buildLabel(d, onSelect)}
        // Journey arcs
        arcsData={arcsData}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcAltitudeAutoScale={0.4}
        arcStroke={0.5}
        arcDashLength={0.45}
        arcDashGap={0.35}
        arcDashInitialGap={() => Math.random() * 0.8}
        arcDashAnimateTime={2200}
        // Submarine cables — TeleGeography data with per-cable hover names
        // (matches the official globe.gl submarine-cables example)
        pathsData={cablesPaths}
        pathPoints="coords"
        pathPointLat={(p: number[]) => p[1]}
        pathPointLng={(p: number[]) => p[0]}
        pathColor={(p: any) => {
          const cable = p as CablePath;
          if (!selectedCable) return cable.color;
          return cable.id === selectedCable.id ? cable.color : "rgba(90,120,135,0.16)";
        }}
        pathLabel={(p: any) => tip((p as CablePath).name, "submarine cable · TeleGeography", (p as CablePath).color)}
        pathStroke={(p: any) => (selectedCable?.id === (p as CablePath).id ? 1.8 : 1.05)}
        onPathClick={(p: any) => onSelectCable(p as CablePath)}
        pathDashLength={0.1}
        pathDashGap={0.008}
        pathDashAnimateTime={12000}
        // Threat intel — pulsing rings coloured per botnet family
        ringsData={threatRings}
        ringLat="lat"
        ringLng="lng"
        ringColor={(r: any) => {
          const c = threatColor((r as ThreatRing).family);
          return (t: number) => hexToRgba(c, 1 - t);
        }}
        ringMaxRadius={4}
        ringPropagationSpeed={2}
        ringRepeatPeriod={900}
      />
    </div>
  );
}
