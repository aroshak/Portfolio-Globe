import { useEffect, useMemo, useState } from "react";
import { Crosshair, MapPin, Satellite } from "lucide-react";
import type { EnrichedEntry } from "../data/enriched-entries";
import { getSatelliteImageUrl, getSatelliteView } from "../lib/satellite-imagery";

interface EntitySatelliteHeroProps {
  entry: EnrichedEntry;
  accent: string;
}

export function EntitySatelliteHero({ entry, accent }: EntitySatelliteHeroProps) {
  const view = useMemo(() => getSatelliteView(entry), [entry]);
  const imageUrl = useMemo(() => getSatelliteImageUrl(view), [view]);
  const [imageFailed, setImageFailed] = useState(false);

  // A new record must get a fresh attempt even if a previous remote request
  // failed while the user was offline.
  useEffect(() => setImageFailed(false), [imageUrl]);

  const viewLabel = view.precision === "verified-site" ? "VERIFIED SITE" : "REGIONAL CONTEXT";

  return (
    <div
      className="entity-satellite-hero"
      data-testid="entity-satellite-hero"
      data-satellite-precision={view.precision}
      style={{ "--satellite-accent": accent } as React.CSSProperties}
    >
      {!imageFailed ? (
        <img
          key={imageUrl}
          data-testid="entity-satellite-image"
          className="entity-satellite-image"
          src={imageUrl}
          alt={`Satellite view of ${view.label}`}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="entity-satellite-fallback" data-testid="entity-satellite-fallback">
          <Satellite size={22} />
          <span>IMAGERY LINK STANDBY</span>
        </div>
      )}

      <div className="entity-satellite-colour" aria-hidden="true" />
      <div className="entity-satellite-grid" aria-hidden="true" />
      <div className="entity-satellite-scan" aria-hidden="true" />
      <div className="entity-satellite-reticle" aria-hidden="true">
        <Crosshair size={28} strokeWidth={1} />
      </div>
      <div className="entity-satellite-telemetry" aria-hidden="true">
        <Satellite size={10} />
        <span>{viewLabel}</span>
      </div>
      <div className="entity-satellite-coordinates" aria-hidden="true">
        <MapPin size={9} />
        <span>{view.lat.toFixed(4)} / {view.lng.toFixed(4)}</span>
      </div>
      <span className="entity-satellite-attribution" aria-hidden="true">WORLD IMAGERY · ESRI</span>
    </div>
  );
}
