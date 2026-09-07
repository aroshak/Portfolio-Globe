export type SatellitePrecision = "verified-site" | "regional";

export interface SatelliteView {
  lat: number;
  lng: number;
  label: string;
  precision: SatellitePrecision;
}

type LocatedEntry = {
  id: string;
  org: string;
  location: { name: string; lat: number; lng: number };
};

// Career timeline pins intentionally stay at city level, which keeps the
// globe legible. The aerial panel can use a more precise, independently
// verified site without changing that story layer. Add a record here only
// when a real campus/office pin is known — never guess an historic workplace.
const VERIFIED_SITE_OVERRIDES: Record<string, Omit<SatelliteView, "precision">> = {
  "edu-1996-ol": {
    lat: 6.9054542,
    lng: 79.8538312,
    label: "Mahanama College campus · Colombo",
  },
  "edu-2001-al": {
    lat: 6.9054542,
    lng: 79.8538312,
    label: "Mahanama College campus · Colombo",
  },
  "edu-2008-northumbria": {
    lat: 54.9787691,
    lng: -1.6096401,
    label: "Northumbria University City Campus · Newcastle",
  },
  "work-2017-bendigo": {
    // 23 McLaren Street was the published principal place of business for the
    // relevant period, before the company moved its registered office in 2022.
    lat: -36.7629214,
    lng: 144.2860873,
    label: "Bendigo Telco · McLaren Street, Bendigo",
  },
  "work-2023-civica": {
    lat: -37.8125863,
    lng: 144.9565368,
    label: "Civica Melbourne office · William Street",
  },
};

export function getSatelliteView(entry: LocatedEntry): SatelliteView {
  const verified = VERIFIED_SITE_OVERRIDES[entry.id];
  if (verified) return { ...verified, precision: "verified-site" };

  return {
    lat: entry.location.lat,
    lng: entry.location.lng,
    label: entry.location.name,
    precision: "regional",
  };
}

function formatCoordinate(value: number) {
  return Number(value.toFixed(6)).toString();
}

/**
 * A same-origin, cacheable World Imagery request. The local /api route is
 * served by Vite during development and Nginx in production.
 */
export function getSatelliteImageUrl(view: SatelliteView) {
  // A site frame shows a roughly 350 m tall area. For a city-level timeline
  // pin we intentionally pull back, so the image remains honest context rather
  // than implying that the city-centre coordinate is a particular office.
  const latSpan = view.precision === "verified-site" ? 0.0032 : 0.018;
  const aspectRatio = 1600 / 600;
  const lngSpan = (latSpan * aspectRatio) / Math.cos((view.lat * Math.PI) / 180);
  const bbox = [
    view.lng - lngSpan / 2,
    view.lat - latSpan / 2,
    view.lng + lngSpan / 2,
    view.lat + latSpan / 2,
  ].map(formatCoordinate).join(",");

  const params = new URLSearchParams({
    bbox,
    bboxSR: "4326",
    size: "1600,600",
    imageSR: "4326",
    format: "jpg",
    transparent: "false",
    f: "image",
  });
  return `/api/satellite/imagery?${params.toString()}`;
}
