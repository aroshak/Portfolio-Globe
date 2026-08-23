import { useEffect, useState } from "react";

export interface SatObject {
  lat: number;
  lng: number;
  alt: number; // earth radii (globe.gl altitude units)
  name: string;
}

// ── TLE source: try CelesTrak live, fall back to bundled stations.tle ──
async function loadTLEText(): Promise<string> {
  try {
    const res = await fetch("https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle", {
      headers: { "User-Agent": "portfolio-globe/0.1 (aroshak@gmail.com)" },
    });
    if (res.ok) {
      const text = await res.text();
      if (text && text.includes("1 ") && text.split("\n").length > 6) return text;
    }
  } catch {
    /* fall through to bundled */
  }
  const res = await fetch("/data/stations.tle");
  return res.text();
}

export function useSatellites(enabled: boolean): SatObject[] {
  const [objects, setObjects] = useState<SatObject[]>([]);

  useEffect(() => {
    if (!enabled) {
      setObjects([]);
      return;
    }
    let worker: Worker | null = null;
    let cancelled = false;
    loadTLEText().then((tle) => {
      if (cancelled || !tle) return;
      worker = new Worker(new URL("../workers/satelliteWorker.ts", import.meta.url), {
        type: "module",
      });
      worker.onmessage = (e: MessageEvent) => {
        if (e.data.type === "tick") setObjects(e.data.objects as SatObject[]);
      };
      worker.postMessage({ type: "init", tle });
    }).catch(() => {
      if (!cancelled) setObjects([]);
    });
    return () => {
      cancelled = true;
      if (worker) {
        worker.postMessage({ type: "stop" });
        worker.terminate();
      }
    };
  }, [enabled]);

  return objects;
}
