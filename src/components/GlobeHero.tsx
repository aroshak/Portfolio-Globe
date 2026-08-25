import { useEffect, useMemo, useRef, useState } from "react";
import Globe, { GlobeMethods } from "react-globe.gl";
import type { LayerId } from "../hooks/useLayers";
import type { CablePath, ThreatRing, MarinePoint } from "../hooks/useLayers";
import { useSatellites } from "../hooks/useSatellites";
import { Minus, Plus, RotateCcw, Pause, Play } from "lucide-react";

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
  wrapper.dataset.soundInteractive = "true";
  wrapper.dataset.opensPanel = "true";
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
  const [spinEnabled, setSpinEnabled] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(33);
  const [selectedInfra, setSelectedInfra] = useState<any | null>(null);
  const sats = useSatellites(active.has("satellites"));
  const introDone = useRef(false);
  const layerSignature = [...active].sort().join("|");
  const previousLayers = useRef(layerSignature);
  const introTimers = useRef<number[]>([]);
  const flightTimer = useRef<number | null>(null);

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
    const t = window.setTimeout(() => {
      g.pointOfView({ lat: home.lat, lng: home.lng, altitude: 2.2 }, 2200);
      // After intro completes, idle rotation takes over.
      const inner = window.setTimeout(() => {
        introDone.current = true;
        const controls = g.controls() as any;
        if (controls) controls.autoRotate = !selected && !selectedCable && spinEnabled;
      }, 2500);
      introTimers.current.push(inner);
    }, 600);
    introTimers.current.push(t);
    return () => { introTimers.current.forEach(window.clearTimeout); introTimers.current = []; };
  }, [home.lat, home.lng]);

  // A layer change returns to a whole-world operational view.
  useEffect(() => {
    if (previousLayers.current === layerSignature) return;
    previousLayers.current = layerSignature;
    const g = globeRef.current;
    if (!g) return;
    g.pointOfView({ lat: 12, lng: 20, altitude: 2.8 }, 1400);
  }, [layerSignature]);

  // Rotate slowly while browsing; any selected record pauses the globe.
  useEffect(() => {
    const controls = globeRef.current?.controls() as any;
    if (!controls) return;
    controls.autoRotateSpeed = .32;
    controls.autoRotate = spinEnabled && !selected && !selectedCable;
  }, [spinEnabled, selected, selectedCable, layerSignature]);

  // Fly-to from timeline
  useEffect(() => {
    const g = globeRef.current;
    if (!g || !flyTarget) return;
    introTimers.current.forEach(window.clearTimeout);
    introTimers.current = [];
    introDone.current = true;
    const controls = g.controls() as any;
    if (controls) {
      controls.autoRotate = false;
      controls.enabled = false;
    }
    if (flightTimer.current !== null) window.clearTimeout(flightTimer.current);
    // First travel above the destination so long-distance moves are obvious,
    // then descend to the selected pin for the detail view.
    g.pointOfView({ lat: flyTarget.lat, lng: flyTarget.lng, altitude: 2.15 }, 1800);
    flightTimer.current = window.setTimeout(() => {
      g.pointOfView({ lat: flyTarget.lat, lng: flyTarget.lng, altitude: 0.42 }, 2600);
      window.setTimeout(() => { if (controls) controls.enabled = true; }, 2700);
    }, 1950);
    return () => { if (flightTimer.current !== null) window.clearTimeout(flightTimer.current); };
  }, [flyTarget]);

  const adjustZoom = (delta: number) => {
    const g = globeRef.current;
    if (!g) return;
    const current = g.pointOfView() as { lat: number; lng: number; altitude: number };
    g.pointOfView({ ...current, altitude: Math.min(4, Math.max(.35, current.altitude + delta)) }, 450);
  };

  const setZoom = (level: number) => {
    const g = globeRef.current;
    if (!g) return;
    const current = g.pointOfView() as { lat: number; lng: number; altitude: number };
    const altitude = 4 - (Math.min(100, Math.max(0, level)) / 100) * 3.65;
    setZoomLevel(level);
    g.pointOfView({ ...current, altitude }, 0);
  };

  const resetWorld = () => {
    setZoomLevel(33);
    globeRef.current?.pointOfView({ lat: 12, lng: 20, altitude: 2.8 }, 900);
  };

  const selectNearbyCable = ({ lat, lng }: { lat: number; lng: number }) => {
    if (!active.has("cables")) return;
    let nearest: CablePath | null = null;
    let best = 2.25;
    for (const cable of cables) {
      const step = Math.max(1, Math.floor(cable.coords.length / 120));
      for (let index = 0; index < cable.coords.length; index += step) {
        const point = cable.coords[index];
        const latDelta = point[1] - lat;
        const rawLng = Math.abs(point[0] - lng);
        const lngDelta = Math.min(rawLng, 360 - rawLng) * Math.cos(lat * Math.PI / 180);
        const distance = Math.hypot(latDelta, lngDelta);
        if (distance < best) { best = distance; nearest = cable; }
      }
    }
    if (nearest) onSelectCable(nearest);
  };

  // ── Points: one shared layer, every point carries its own hover label ──
  // (satlas pattern: colour-coded categories + hover info)
  const marineColor: Record<string, string> = {
    offshore_platform: "#ffb84d",
    offshore_wind_turbine: "#5ab669",
  };
  const pointsData = useMemo(() => {
    const cv = activeEntries.map((e) => ({
      id: e.id,
      lat: e.location.lat,
      lng: e.location.lng,
      alt: selected?.id === e.id ? 0.07 : 0.012,
      r: selected?.id === e.id ? 0.34 : 0.024,
      color: selected?.id === e.id ? "#ffffff" : TAB_COLOR[e.tab] ?? "#4adede",
      label: tip(e.org, `${e.title} · ${e.period}`, TAB_COLOR[e.tab] ?? "#4adede"),
    }));
    const marinePts = active.has("marine")
      ? marine.map((m) => ({
          kind: "marine",
          source: m,
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
          kind: "threat",
          source: t,
          lat: t.lat,
          lng: t.lng,
          alt: 0.016,
          r: 0.065,
          color: threatColor(t.family),
          label: tip(
            `⚠ ${t.family || "Observed threat source"}`,
            `${t.ip}${t.country ? ` · ${t.country}` : ""}${t.reports ? ` · ${t.reports.toLocaleString()} reports` : ""}${t.targets ? ` · ${t.targets.toLocaleString()} targets` : ""} · ${t.provider || "Open threat feed"}`,
            threatColor(t.family)
          ),
        }))
      : [];
    return [...cv, ...marinePts, ...satPts, ...threatPts];
  }, [activeEntries, active, marine, sats, threats, selected?.id]);

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
  const threatRings = active.has("threats") ? threats : [];
  const visibleRings = useMemo(() => [
    ...threatRings.map((ring) => ({ ...ring, kind: "threat" as const })),
    ...(selected?.location ? [{
      lat: selected.location.lat,
      lng: selected.location.lng,
      kind: "selection" as const,
      family: "",
    }] : []),
  ], [threatRings, selected]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <div className="globe-scene-layer"><Globe
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
        onPointClick={(point: any) => { if (point.kind) setSelectedInfra(point); }}
        onPointHover={(point: any) => { if (containerRef.current) containerRef.current.style.cursor = point ? "pointer" : "default"; }}
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
        onPathHover={(path: any) => { if (containerRef.current) containerRef.current.style.cursor = path ? "pointer" : "default"; }}
        pathDashLength={0.1}
        pathDashGap={0.008}
        pathDashAnimateTime={12000}
        // Threat intel — pulsing rings coloured per botnet family
        ringsData={visibleRings}
        ringLat="lat"
        ringLng="lng"
        ringColor={(r: any) => {
          if (r.kind === "selection") return (t: number) => `rgba(255,255,255,${1 - t})`;
          const c = threatColor((r as ThreatRing).family);
          return (t: number) => hexToRgba(c, 1 - t);
        }}
        ringMaxRadius={(r: any) => r.kind === "selection" ? 2.4 : 4}
        ringPropagationSpeed={(r: any) => r.kind === "selection" ? 1.25 : 2}
        ringRepeatPeriod={(r: any) => r.kind === "selection" ? 650 : 900}
        onZoom={(view: { altitude: number }) => {
          const level = ((4 - view.altitude) / 3.65) * 100;
          setZoomLevel(Math.round(Math.min(100, Math.max(0, level))));
        }}
        onGlobeClick={selectNearbyCable}
      /></div>
      <div className="canvas-controls-dock">
      <div className="canvas-controls hero-cascade-item hero-cascade-2 glass-dark" aria-label="Globe controls">
        <button title="Zoom out" aria-label="Zoom out" onClick={() => adjustZoom(.38)}><Minus size={12} /></button>
        <label className="zoom-slider-shell" title={`Zoom ${zoomLevel}%`}>
          <span className="zoom-slider-readout">ZOOM <b>{String(zoomLevel).padStart(3, "0")}</b></span>
          <span className="zoom-slider-track" aria-hidden="true"><i style={{ width:`${zoomLevel}%` }}/><em style={{ left:`${zoomLevel}%` }}/></span>
          <input aria-label="Globe zoom" type="range" min="0" max="100" step="1" value={zoomLevel} onChange={(event) => setZoom(Number(event.target.value))}/>
        </label>
        <button title="Zoom in" aria-label="Zoom in" onClick={() => adjustZoom(-.38)}><Plus size={12} /></button>
        <span className="canvas-control-divider" />
        <button title="Show whole world" aria-label="Show whole world" onClick={resetWorld}><RotateCcw size={11} /></button>
        <button className={spinEnabled ? "is-active" : ""} title={spinEnabled ? "Pause rotation" : "Resume rotation"} aria-label={spinEnabled ? "Pause rotation" : "Resume rotation"} onClick={() => setSpinEnabled((value) => !value)}>{spinEnabled ? <Pause size={11} /> : <Play size={11} />}</button>
      </div>
      </div>
      {selectedInfra && <div className="infra-quick-card glass-dark">
        <button onClick={() => setSelectedInfra(null)}>×</button>
        <small>{selectedInfra.kind === "threat" ? "THREAT SOURCE" : "MARINE INFRASTRUCTURE"}</small>
        <strong>{selectedInfra.kind === "threat" ? selectedInfra.source.ip : selectedInfra.source.category.replaceAll("_", " ")}</strong>
        {selectedInfra.kind === "threat" ? <><span>{selectedInfra.source.country || "Unknown region"} · {selectedInfra.source.provider || "Open threat feed"}</span><em>{(selectedInfra.source.reports || 0).toLocaleString()} reports · {(selectedInfra.source.targets || 0).toLocaleString()} targets</em></> : <><span>Detection confidence {(selectedInfra.source.score * 100).toFixed(0)}%</span><em>Satlas marine infrastructure dataset</em></>}
      </div>}
    </div>
  );
}
