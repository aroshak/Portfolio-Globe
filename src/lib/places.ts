// ── Google Places via Maps JavaScript API ──
// Fully client-side: loads the Maps JS API with the Places (New) library,
// then uses Place.searchByText() to get entity info + photos.
// No proxy, no CORS issues. PlacePhoto.getUrl() returns a directly-loadable
// image URL. Requires VITE_GOOGLE_PLACES_API_KEY in .env.

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string;

const CACHE_PREFIX = "places_full_v4_";
const CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7;

export interface PlaceInfo {
  displayName: string;
  formattedAddress: string;
  googleMapsUri: string;
  rating: number | null;
  userRatingCount: number | null;
  editorialSummary: string | null;
  primaryType: string | null;
  primaryTypeDisplayName: string | null;
  photoUri: string | null;
  photoAttribution: string | null;
  types: string[];
  source: "google" | "wikipedia";
}

interface CacheEntry {
  data: PlaceInfo;
  ts: number;
}

function getCached(key: string): PlaceInfo | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.ts > CACHE_MAX_AGE) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache(key: string, data: PlaceInfo) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* ignore */ }
}

// ── Load the Maps JS API exactly once (importLibrary pattern) ──
let apiPromise: Promise<any> | null = null;

function loadPlacesApi(): Promise<any> {
  if (apiPromise) return apiPromise;
  apiPromise = (async () => {
    const w = window as any;
    if (w.google?.maps?.places?.Place) return w.google.maps.places.Place;

    // Inject the Maps JS API bootstrap if not already present
    if (!w.google?.maps?.importLibrary) {
      await new Promise<void>((resolve, reject) => {
        const cb = "__gmapsReady_" + Date.now();
        w[cb] = () => {
          delete w[cb];
          resolve();
        };
        const s = document.createElement("script");
        s.src =
          `https://maps.googleapis.com/maps/api/js?key=${API_KEY}` +
          `&loading=async&callback=${cb}&v=weekly`;
        s.async = true;
        s.onerror = () => {
          delete w[cb];
          reject(new Error("Google Maps API failed to load"));
        };
        document.head.appendChild(s);
      });
    }

    // Dynamically load the places library
    const placesLib = await w.google.maps.importLibrary("places");
    return placesLib.Place;
  })();
  apiPromise.catch(() => {
    apiPromise = null; // allow retry on next call
  });
  return apiPromise;
}

async function fetchWikipediaPlaceInfo(query: string): Promise<PlaceInfo | null> {
  const url = new URL("https://en.wikipedia.org/w/rest.php/v1/search/page");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "1");
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) return null;
  const result = await response.json();
  const page = result?.pages?.[0];
  if (!page) return null;

  return {
    displayName: page.title || query,
    formattedAddress: "",
    googleMapsUri: "",
    rating: null,
    userRatingCount: null,
    editorialSummary: page.description || null,
    primaryType: null,
    primaryTypeDisplayName: "Wikipedia article",
    photoUri: page.thumbnail?.url || null,
    photoAttribution: page.thumbnail?.url ? "Wikimedia Commons" : null,
    types: [],
    source: "wikipedia",
  };
}

/**
 * Fetch full Google Places info for a specific entity.
 * Pass org name + location, e.g. "Mahanama College, Colombo" or
 * "Northumbria University, Newcastle upon Tyne".
 */
export async function fetchPlaceInfo(query: string): Promise<PlaceInfo | null> {
  const cacheKey = query.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  const cached = getCached(cacheKey);
  if (cached) return cached;

  if (API_KEY && API_KEY !== "YOUR_API_KEY_HERE") try {
    const Place = await loadPlacesApi();

    const { places } = await Place.searchByText({
      textQuery: query,
      fields: [
        "displayName",
        "formattedAddress",
        "googleMapsUri",
        "rating",
        "userRatingCount",
        "editorialSummary",
        "primaryType",
        "primaryTypeDisplayName",
        "types",
        "photos",
      ],
      maxResultCount: 1,
    });

    const place = places?.[0];
    if (!place) return null;

    // Photo: getUrl() returns a directly-loadable image URL
    let photoUri: string | null = null;
    let photoAttribution: string | null = null;
    const photo = place.photos?.[0];
    if (photo) {
      try {
        photoUri = photo.getUrl({ maxWidth: 800 });
      } catch { /* ignore */ }
      photoAttribution = photo.authorAttributions?.[0]?.displayName ?? null;
    }

    const info: PlaceInfo = {
      displayName: place.displayName?.text ?? query,
      formattedAddress: place.formattedAddress ?? "",
      googleMapsUri: place.googleMapsUri ?? "",
      rating: typeof place.rating === "number" ? place.rating : null,
      userRatingCount: typeof place.userRatingCount === "number" ? place.userRatingCount : null,
      editorialSummary: place.editorialSummary ?? null,
      primaryType: place.primaryType ?? null,
      primaryTypeDisplayName: place.primaryTypeDisplayName?.text ?? null,
      photoUri,
      photoAttribution,
      types: place.types ?? [],
      source: "google",
    };

    setCache(cacheKey, info);
    return info;
  } catch (err) {
    console.warn("[places] fetch failed:", err);
  }

  // Keyless fallback: Wikimedia's official search endpoint returns a lead
  // thumbnail and description and supports browser CORS. This keeps every
  // card useful in local previews and deployments where Google Places is not
  // configured, while retaining clear source attribution.
  try {
    const info = await fetchWikipediaPlaceInfo(query);
    if (info) setCache(cacheKey, info);
    return info;
  } catch (err) {
    console.warn("[places] Wikipedia fallback failed:", err);
    return null;
  }
}
