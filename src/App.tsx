import { useState } from "react";
import { useLayers, type CablePath } from "./hooks/useLayers";
import { GlobeHero } from "./components/GlobeHero";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Dashboard } from "./components/Dashboard";
import { Timeline } from "./components/Timeline";
import { PortfolioLanding } from "./components/PortfolioLanding";
import { BuildPage } from "./components/BuildPage";
import { CaseStudyPage } from "./components/CaseStudyPage";
import { BackgroundFX } from "./components/BackgroundFX";
import { ScrollProgress, SectionSep } from "./components/motion";

function HomePage() {
  const { active, toggle, activeEntries, arcsData, cables, cableMeta, threats, marine, marineMeta, home } = useLayers();
  const [selected, setSelected] = useState<any | null>(null);
  const [selectedCable, setSelectedCable] = useState<CablePath | null>(null);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; id: string } | null>(null);

  // Live overlay counts for the HUD telemetry bar
  const overlayStats = [
    active.has("cables")
      ? cableMeta.status === "loading"
        ? "CABLES LOADING"
        : cableMeta.status === "error"
          ? "CABLES ERROR"
          : `${cables.length} CABLE PATHS · ${cableMeta.status.toUpperCase()}`
      : "",
    active.has("marine")
      ? marineMeta.status === "loading"
        ? "MARINE LOADING"
        : marineMeta.status === "error"
          ? "MARINE ERROR"
          : `${marine.length} MARINE NODES`
      : "",
    active.has("threats") ? `${threats.length} THREATS` : "",
    active.has("satellites") ? "SATS_LIVE" : "",
  ].filter(Boolean).join(" · ");

  return (
    <main id="top" className="relative w-full bg-space-bg">
      {/* Persistent 3D background + scroll progress rail */}
      <BackgroundFX />
      <ScrollProgress />

      <section className="globe-floating relative h-dvh w-screen overflow-hidden">
        <ErrorBoundary>
          <GlobeHero
            active={active}
            activeEntries={activeEntries}
            arcsData={arcsData}
            cables={cables}
            threats={threats}
            marine={marine}
            home={home}
            selected={selected}
            onSelect={(entry) => { setSelected(entry); if (entry) setSelectedCable(null); }}
            selectedCable={selectedCable}
            onSelectCable={(cable) => { setSelectedCable(cable); if (cable) setSelected(null); }}
            flyTarget={flyTarget}
          />
        </ErrorBoundary>
        <Dashboard
          active={active}
          onToggle={(id) => {
            toggle(id);
            if (id === "cables" && active.has("cables")) setSelectedCable(null);
          }}
          selected={selected}
          onSelect={(entry) => { setSelected(entry); if (entry) setSelectedCable(null); }}
          selectedCable={selectedCable}
          onSelectCable={setSelectedCable}
          cableMeta={cableMeta}
          entries={activeEntries}
          overlayStats={overlayStats}
        />
        <Timeline
          entries={activeEntries}
          onFlyTo={(e) => {
            setSelected(e.entry);
            setSelectedCable(null);
            setFlyTarget({ lat: e.lat, lng: e.lng, id: e.id + "-" + Date.now() });
          }}
        />
      </section>

      <SectionSep />
      <PortfolioLanding />
    </main>
  );
}

export default function App() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  if (path === "/build") return <BuildPage />;
  if (path.startsWith("/case-studies/")) return <CaseStudyPage slug={path.split("/").pop() || ""} />;
  return <HomePage />;
}
