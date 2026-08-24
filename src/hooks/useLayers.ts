import { useState, useCallback, useMemo, useEffect } from "react";
import data from "../data/portfolio-data.json";

export type LayerId =
  | "education"
  | "experience"
  | "certifications"
  | "cables"
  | "marine"
  | "satellites"
  | "threats";

export interface LayerDef {
  id: LayerId;
  label: string;
  group: "cv" | "network" | "live";
  icon: string;
  num: string;
  defaultOn?: boolean;
}

export const LAYER_GROUPS: { label: string; layers: LayerDef[] }[] = [
  {
    label: "MY STORY",
    layers: [
      { id: "education", label: "Education", group: "cv", icon: "grad", num: "01", defaultOn: true },
      { id: "experience", label: "Experience", group: "cv", icon: "brief", num: "02" },
      { id: "certifications", label: "Certifications", group: "cv", icon: "cert", num: "03" },
    ],
  },
  {
    label: "NETWORK OPS",
    layers: [
      { id: "cables", label: "Submarine Cables", group: "network", icon: "wave", num: "04" },
      { id: "marine", label: "Marine Infra", group: "network", icon: "droplet", num: "05" },
      { id: "threats", label: "Threat Intel", group: "network", icon: "alert", num: "06" },
    ],
  },
  {
    label: "LIVE DATA",
    layers: [{ id: "satellites", label: "Satellites", group: "live", icon: "sat", num: "07" }],
  },
];

const CV_LAYERS: LayerId[] = ["education", "experience", "certifications"];

// ── Submarine cables: bundled TeleGeography GeoJSON (same dataset as the
//    official globe.gl demo), so it renders same-origin with no CORS risk. ──
export interface CablePath {
  coords: [number, number][];
  id: string;
  name: string;
  color: string;
}
export interface CableLandingPoint {
  id: string;
  name: string;
  country: string;
  is_tbd?: boolean | null;
}
export interface CableDetails {
  id: string;
  name: string;
  length: string | null;
  landing_points: CableLandingPoint[];
  owners: string | null;
  suppliers: string | null;
  rfs: string | null;
  rfs_year: number | null;
  is_planned: boolean;
  url: string | null;
  notes: string | null;
}
export interface CableMeta {
  status: "idle" | "loading" | "live" | "snapshot" | "error";
  source: string;
  sourceUrl: string;
  fetchedAt?: string;
  error?: string;
}

interface CableLoadResult {
  paths: CablePath[];
  meta: CableMeta;
}

const CABLE_API_URL = "/api/telegeography/cables";
const CABLE_SNAPSHOT_URL = "/data/cables.geojson";
const CABLE_SOURCE_URL = "https://www.submarinecablemap.com";
let _cablesCache: CableLoadResult | null = null;
const _cableDetailsCache = new Map<string, CableDetails>();

export async function fetchCableDetails(id: string): Promise<CableDetails> {
  const safeId = id.trim().toLowerCase();
  if (!/^[a-z0-9-]+$/.test(safeId)) throw new Error("Invalid cable identifier");
  const cached = _cableDetailsCache.get(safeId);
  if (cached) return cached;
  const response = await fetch(`/api/telegeography/cable/${encodeURIComponent(safeId)}`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Cable metadata returned HTTP ${response.status}`);
  const raw = await response.json();
  if (!raw?.id || !raw?.name) throw new Error("Cable metadata response is invalid");
  const details: CableDetails = {
    id: String(raw.id),
    name: String(raw.name),
    length: raw.length ? String(raw.length) : null,
    landing_points: Array.isArray(raw.landing_points) ? raw.landing_points.map((point: any) => ({
      id: String(point.id ?? ""),
      name: String(point.name ?? "Unknown landing point"),
      country: String(point.country ?? ""),
      is_tbd: point.is_tbd ?? null,
    })) : [],
    owners: raw.owners ? String(raw.owners) : null,
    suppliers: raw.suppliers ? String(raw.suppliers) : null,
    rfs: raw.rfs ? String(raw.rfs) : null,
    rfs_year: Number.isFinite(raw.rfs_year) ? Number(raw.rfs_year) : null,
    is_planned: Boolean(raw.is_planned),
    url: raw.url ? String(raw.url) : null,
    notes: raw.notes ? String(raw.notes) : null,
  };
  _cableDetailsCache.set(safeId, details);
  return details;
}

function parseCableGeoJson(geo: any): CablePath[] {
  if (geo?.type !== "FeatureCollection" || !Array.isArray(geo.features)) {
    throw new Error("TeleGeography returned invalid GeoJSON");
  }
  const out: CablePath[] = [];
  geo.features.forEach((feature: any) => {
    if (feature?.geometry?.type !== "MultiLineString" || !Array.isArray(feature.geometry.coordinates)) return;
    const properties = feature.properties ?? {};
    feature.geometry.coordinates.forEach((coords: number[][], segmentIndex: number) => {
      if (!Array.isArray(coords) || coords.length < 2) return;
      out.push({
        coords: coords as [number, number][],
        id: String(properties.id ?? properties.feature_id ?? `cable-${out.length}-${segmentIndex}`),
        name: String(properties.name ?? "Unnamed cable"),
        color: String(properties.color ?? "#5ab669"),
      });
    });
  });
  if (!out.length) throw new Error("TeleGeography GeoJSON contained no cable paths");
  return out;
}

async function fetchCableGeoJson(url: string, timeoutMs: number) {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`${url} returned HTTP ${res.status}`);
  return res.json();
}

async function loadCables(): Promise<CableLoadResult> {
  if (_cablesCache) return _cablesCache;
  try {
    // The full global cable GeoJSON is ~740 KB uncompressed. Production VPS
    // links can legitimately take longer than a local Vite proxy, especially
    // on the first uncached request, so allow the body to finish streaming.
    const geo = await fetchCableGeoJson(CABLE_API_URL, 60000);
    _cablesCache = {
      paths: parseCableGeoJson(geo),
      meta: {
        status: "live",
        source: "TeleGeography live API",
        sourceUrl: CABLE_SOURCE_URL,
        fetchedAt: new Date().toISOString(),
      },
    };
  } catch (liveError) {
    try {
      const geo = await fetchCableGeoJson(CABLE_SNAPSHOT_URL, 30000);
      _cablesCache = {
        paths: parseCableGeoJson(geo),
        meta: {
          status: "snapshot",
          source: "TeleGeography bundled snapshot",
          sourceUrl: CABLE_SOURCE_URL,
          error: liveError instanceof Error ? liveError.message : "Live cable API unavailable",
        },
      };
    } catch (snapshotError) {
      throw new Error(
        `Unable to load live or bundled cable data: ${snapshotError instanceof Error ? snapshotError.message : "unknown error"}`
      );
    }
  }
  return _cablesCache;
}

// ── Threat intel: Feodo Tracker C2 blocklist → geolocate via ipwho.is
//    (HTTPS + CORS-safe; the old http://ip-api.com broke on HTTPS pages).
//    Cached in localStorage for 1h. ──
export interface ThreatRing {
  lat: number;
  lng: number;
  ip: string;
  family: string;
  country: string;
  reports?: number;
  targets?: number;
  provider?: string;
}

// Geolocate a batch of IPs via ipwho.is with limited concurrency
async function geolocateBatch(ips: string[], concurrency = 5): Promise<ThreatRing[]> {
  const out: ThreatRing[] = [];
  let i = 0;
  async function worker() {
    while (i < ips.length) {
      const ip = ips[i++];
      try {
        const r = await fetch(`https://ipwho.is/${ip}`);
        if (!r.ok) continue;
        const d = await r.json();
        if (d?.success && typeof d.latitude === "number" && typeof d.longitude === "number") {
          out.push({ lat: d.latitude, lng: d.longitude, ip, family: "", country: d.country_code || "" });
        }
      } catch { /* skip unreachable IPs */ }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, ips.length) }, () => worker()));
  return out;
}

let _threatPromise: Promise<ThreatRing[]> | null = null;
async function loadThreats(): Promise<ThreatRing[]> {
  if (_threatPromise) return _threatPromise;
  _threatPromise = (async () => {
    const cacheKey = "threats_geo_v4";
    const cacheTsKey = "threats_geo_ts_v4";
    const maxAge = 1000 * 60 * 60; // 1h
    const cached = localStorage.getItem(cacheKey);
    const ts = Number(localStorage.getItem(cacheTsKey) || 0);
    if (cached && Date.now() - ts < maxAge) {
      try {
        return JSON.parse(cached) as ThreatRing[];
      } catch {
        /* ignore */
      }
    }
    // DShield exposes browser-safe CORS JSON and recent observed source counts.
    // Feodo remains a secondary C2 source, but its active list may legitimately
    // be empty following botnet takedowns.
    let sample: any[] = [];
    let provider = "SANS ISC / DShield";
    try {
      const dshield = await fetch("https://isc.sans.edu/api/topips/records/60?json");
      if (dshield.ok) sample = (await dshield.json()).map((item: any) => ({ ip_address: item.source, malware: "Observed attacker", reports: Number(item.reports || 0), targets: Number(item.targets || 0) }));
    } catch { /* use secondary source */ }
    if (!sample.length) {
      provider = "abuse.ch / Feodo Tracker";
      const response = await fetch("https://feodotracker.abuse.ch/downloads/ipblocklist.json");
      const arr = (await response.json()) as any[];
      sample = arr.filter((item) => item.ip_address).slice(0, 60);
    }
    if (!sample.length) return [];
    const ips = sample.map((item) => item.ip_address as string);
    const metaMap = new Map(sample.map((item) => [item.ip_address, item]));
    const geo = await geolocateBatch(ips);
    const out: ThreatRing[] = geo.map((g) => ({
      ...g,
      family: metaMap.get(g.ip)?.malware || "Observed attacker",
      reports: metaMap.get(g.ip)?.reports,
      targets: metaMap.get(g.ip)?.targets,
      provider,
    }));
    localStorage.setItem(cacheKey, JSON.stringify(out));
    localStorage.setItem(cacheTsKey, String(Date.now()));
    return out;
  })();
  return _threatPromise;
}

// ── Marine infrastructure: allenai/satlas offshore points (turbines +
//    platforms), bundled + sampled locally. Subsampled with a stride so the
//    layer stays fast with per-point tooltips (no merged geometry). ──
export interface MarinePoint {
  lat: number;
  lng: number;
  category: string;
  score: number;
}
export interface MarineMeta {
  status: "idle" | "loading" | "ready" | "error";
  source: string;
  sourceUrl: string;
  error?: string;
}
let _marineCache: MarinePoint[] | null = null;
async function loadMarine(): Promise<MarinePoint[]> {
  if (_marineCache) return _marineCache;
  const res = await fetch("/data/marine-sampled.geojson");
  if (!res.ok) throw new Error(`Marine snapshot returned HTTP ${res.status}`);
  const geo = await res.json();
  if (geo?.type !== "FeatureCollection" || !Array.isArray(geo.features)) {
    throw new Error("Marine snapshot is not a GeoJSON FeatureCollection");
  }
  const feats = geo.features as any[];
  const stride = Math.max(1, Math.floor(feats.length / 600)); // cap ~600 points
  const out: MarinePoint[] = [];
  feats.forEach((f, i) => {
    if (i % stride !== 0) return;
    if (f?.geometry?.type !== "Point") return;
    const [lng, lat] = f.geometry.coordinates ?? [];
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    out.push({
      lat,
      lng,
      category: String(f.properties?.category ?? "marine_infrastructure"),
      score: Number(f.properties?.score ?? 0),
    });
  });
  if (!out.length) throw new Error("Marine snapshot contained no valid points");
  _marineCache = out;
  return _marineCache;
}

export function useLayers() {
  const [active, setActive] = useState<Set<LayerId>>(new Set(["education"]));
  const [cables, setCables] = useState<CablePath[]>([]);
  const [cableMeta, setCableMeta] = useState<CableMeta>({
    status: "idle",
    source: "TeleGeography",
    sourceUrl: CABLE_SOURCE_URL,
  });
  const [threats, setThreats] = useState<ThreatRing[]>([]);
  const [marine, setMarine] = useState<MarinePoint[]>([]);
  const [marineMeta, setMarineMeta] = useState<MarineMeta>({
    status: "idle",
    source: "Satlas marine infrastructure snapshot",
    sourceUrl: "https://satlas.allen.ai/",
  });

  const toggle = useCallback((id: LayerId) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Lazy load network/live layers only when first enabled
  useEffect(() => {
    if (!active.has("cables")) return;
    setCableMeta((meta) => ({ ...meta, status: "loading", error: undefined }));
    loadCables()
      .then(({ paths, meta }) => {
        setCables(paths);
        setCableMeta(meta);
      })
      .catch((error) => {
        setCables([]);
        setCableMeta({
          status: "error",
          source: "TeleGeography",
          sourceUrl: CABLE_SOURCE_URL,
          error: error instanceof Error ? error.message : "Cable data unavailable",
        });
      });
  }, [active.has("cables")]);
  useEffect(() => {
    if (active.has("threats")) loadThreats().then(setThreats).catch(() => {});
  }, [active.has("threats")]);
  useEffect(() => {
    if (!active.has("marine")) return;
    setMarineMeta((meta) => ({ ...meta, status: "loading", error: undefined }));
    loadMarine()
      .then((points) => {
        setMarine(points);
        setMarineMeta((meta) => ({ ...meta, status: "ready" }));
      })
      .catch((error) => {
        setMarine([]);
        setMarineMeta((meta) => ({
          ...meta,
          status: "error",
          error: error instanceof Error ? error.message : "Marine data unavailable",
        }));
      });
  }, [active.has("marine")]);

  const activeEntries = useMemo(
    () => data.entries.filter((e: any) => active.has(e.tab as LayerId)),
    [active]
  );

  const cities = useMemo(() => {
    const m: Record<string, { lat: number; lng: number }> = {};
    (data.entries as any[]).forEach((e) => {
      const city = e.location.name.split(",")[0].trim();
      m[city] = { lat: e.location.lat, lng: e.location.lng };
    });
    m["Colombo"] = m["Colombo"] || { lat: 6.9271, lng: 79.8612 };
    m["Newcastle upon Tyne"] = m["Newcastle upon Tyne"] || { lat: 54.9783, lng: -1.6178 };
    m["London"] = m["London"] || { lat: 51.5074, lng: -0.1278 };
    m["Sydney"] = m["Sydney"] || { lat: -33.8688, lng: 151.2093 };
    m["Bendigo"] = m["Bendigo"] || { lat: -36.757, lng: 144.2794 };
    m["Melbourne"] = m["Melbourne"] || { lat: -37.8136, lng: 144.9631 };
    return m;
  }, []);

  const arcsData = useMemo(
    () =>
      (data.journey as any[]).map((j) => {
        const from = cities[j.from];
        const to = cities[j.to];
        return {
          startLat: from?.lat ?? 0,
          startLng: from?.lng ?? 0,
          endLat: to?.lat ?? 0,
          endLng: to?.lng ?? 0,
          color: ["#4adede", "#2a8a8a"],
          label: j.label,
          year: j.year,
        };
      }),
    [cities]
  );

  return { active, toggle, activeEntries, arcsData, cables, cableMeta, threats, marine, marineMeta, home: data.home };
}
