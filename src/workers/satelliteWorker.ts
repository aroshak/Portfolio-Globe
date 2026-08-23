/// <reference lib="webworker" />
// Satellite propagation worker (satlas pattern: TLE → satellite.js off main thread).
// Receives TLE text once, then posts propagated lat/lng/alt every 1s.
import * as satellite from "../lib/satellite";

let tles: { name: string; satrec: any }[] = [];
let timer: ReturnType<typeof setInterval> | null = null;

self.onmessage = (e: MessageEvent) => {
  const msg = e.data;
  if (msg.type === "init") {
    const lines = (msg.tle as string).trim().split("\n");
    tles = [];
    for (let i = 0; i + 2 < lines.length; i += 3) {
      const name = lines[i].trim();
      const l1 = lines[i + 1].trim();
      const l2 = lines[i + 2].trim();
      try {
        tles.push({ name, satrec: satellite.twoline2satrec(l1, l2) });
      } catch {
        /* skip malformed */
      }
    }
    if (timer) clearInterval(timer);
    const tick = () => {
      const now = new Date();
      const out: { lat: number; lng: number; alt: number; name: string }[] = [];
      for (const { name, satrec } of tles) {
        const pv = satellite.propagate(satrec, now);
        if (!pv || !pv.position || typeof pv.position.x !== "number") continue;
        const gmst = satellite.gstime(now);
        const geo = satellite.eciToGeodetic(pv.position, gmst);
        out.push({
          lat: geo.latitude * (180 / Math.PI),
          lng: geo.longitude * (180 / Math.PI),
          alt: geo.height / 6371, // km → earth radii (globe.gl altitude units)
          name,
        });
      }
      (self as any).postMessage({ type: "tick", objects: out });
    };
    tick();
    timer = setInterval(tick, 1000);
  } else if (msg.type === "stop") {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
};
