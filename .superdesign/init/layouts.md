# Shared layout

## App
Path: `src/App.tsx`
Single-page shell: persistent background, full-viewport globe hero with HUD, then portfolio sections.

```tsx
import { useState } from "react";
import { useLayers } from "./hooks/useLayers";
import { GlobeHero } from "./components/GlobeHero";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Dashboard } from "./components/Dashboard";
import { Timeline } from "./components/Timeline";
import { ServicesPanel } from "./components/ServicesPanel";
import { BuildStory } from "./components/BuildStory";
import { ProjectGrid } from "./components/ProjectGrid";
import { BackgroundFX } from "./components/BackgroundFX";
import { ScrollProgress, SectionSep } from "./components/motion";

export default function App() {
  const { active, toggle, activeEntries, arcsData, cables, threats, marine, home } = useLayers();
  const [selected, setSelected] = useState<any | null>(null);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; id: string } | null>(null);
  const overlayStats = [active.has("cables") ? `${cables.length} CABLES` : "", active.has("marine") ? `${marine.length} MARINE` : "", active.has("threats") ? `${threats.length} THREATS` : "", active.has("satellites") ? "SATS_LIVE" : ""].filter(Boolean).join(" · ");
  return <main className="relative w-full bg-space-bg"><BackgroundFX /><ScrollProgress /><section className="relative h-dvh w-screen overflow-hidden"><ErrorBoundary><GlobeHero active={active} activeEntries={activeEntries} arcsData={arcsData} cables={cables} threats={threats} marine={marine} home={home} selected={selected} onSelect={setSelected} flyTarget={flyTarget} /></ErrorBoundary><Dashboard active={active} onToggle={toggle} selected={selected} onSelect={setSelected} entries={activeEntries} overlayStats={overlayStats} /><Timeline entries={activeEntries} onFlyTo={(e) => setFlyTarget({ lat: e.lat, lng: e.lng, id: e.id + Date.now() })} /></section><ServicesPanel /><SectionSep /><BuildStory /><SectionSep /><ProjectGrid /></main>;
}
```

There is currently no global header/footer or router. Hero navigation is embedded in `Dashboard.tsx`.
