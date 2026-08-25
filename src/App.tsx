import { useEffect, useRef, useState } from "react";
import { useLayers, type CablePath } from "./hooks/useLayers";
import { GlobeHero } from "./components/GlobeHero";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Dashboard } from "./components/Dashboard";
import { Timeline } from "./components/Timeline";
import { PortfolioLanding } from "./components/PortfolioLanding";
import { BuildPage } from "./components/BuildPage";
import { CaseStudyPage } from "./components/CaseStudyPage";
import { BackgroundFX } from "./components/BackgroundFX";
import { PageCascadeFX, ScrollProgress, SectionSep } from "./components/motion";
import { ChevronDown } from "lucide-react";
import { BackToTop } from "./components/BackToTop";

function HomePage() {
  const { active, toggle, activeEntries, arcsData, cables, cableMeta, threats, threatMeta, marine, marineMeta, home } = useLayers();
  const [selected, setSelected] = useState<any | null>(null);
  const [selectedCable, setSelectedCable] = useState<CablePath | null>(null);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; id: string } | null>(null);
  const clickSound = useRef<HTMLAudioElement | null>(null);
  const hoverSound = useRef<HTMLAudioElement | null>(null);
  const menuOpenSound = useRef<HTMLAudioElement | null>(null);
  const suppressNextClickSound = useRef(false);

  useEffect(() => {
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    const resetHome = () => {
      if ((window.location.pathname.replace(/\/$/, "") || "/") === "/") window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };
    resetHome();
    const frame = window.requestAnimationFrame(resetHome);
    window.addEventListener("pageshow", resetHome);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pageshow", resetHome);
      history.scrollRestoration = previousRestoration;
    };
  }, []);

  useEffect(() => {
    const audio = new Audio("/sounds/menu-open.wav");
    audio.preload = "auto";
    audio.volume = .2;
    menuOpenSound.current = audio;
    audio.load();
    let played = false;
    const playBoot = () => {
      if (played) return;
      audio.currentTime = 0;
      void audio.play().then(() => { played = true; }).catch(() => undefined);
    };
    const timer = window.setTimeout(playBoot, 420);
    const unlock = () => {
      if (!played) suppressNextClickSound.current = true;
      playBoot();
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
    };
    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("keydown", unlock, true);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
      audio.pause();
    };
  }, []);

  const playSound = (ref: typeof clickSound, src: string, volume: number) => {
    const audio = ref.current || new Audio(src);
    ref.current = audio;
    audio.volume = volume;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  };
  const openEntry = (entry: any | null) => {
    setSelected(entry);
    if (entry) {
      setSelectedCable(null);
      playSound(menuOpenSound, "/sounds/menu-open.wav", .28);
    }
  };
  const openCable = (cable: CablePath | null) => {
    setSelectedCable(cable);
    if (cable) {
      setSelected(null);
      playSound(menuOpenSound, "/sounds/menu-open.wav", .28);
    }
  };

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
    active.has("threats")
      ? threatMeta.status === "loading"
        ? "THREAT FEED LOADING"
        : threatMeta.status === "error"
          ? "THREAT FEED ERROR"
          : `${threats.length} THREATS`
      : "",
    active.has("satellites") ? "SATS_LIVE" : "",
  ].filter(Boolean).join(" · ");

  return (
    <main id="top" className="relative w-full bg-space-bg">
      {/* Persistent 3D background + scroll progress rail */}
      <BackgroundFX />
      <PageCascadeFX />
      <ScrollProgress />
      <BackToTop />

      <section className="globe-floating relative h-dvh w-screen overflow-hidden"
        onClickCapture={(event) => {
          const target = (event.target as HTMLElement).closest("button,a,[data-sound-interactive]");
          if (suppressNextClickSound.current) suppressNextClickSound.current = false;
          else if (target && !target.closest("[data-opens-panel]")) playSound(clickSound, "/sounds/click.wav", .24);
        }}
        onPointerOverCapture={(event) => {
          const target = (event.target as HTMLElement).closest("button,a,[data-sound-interactive]");
          const previous = (event.relatedTarget as HTMLElement | null)?.closest?.("button,a,[data-sound-interactive]");
          if (target && target !== previous) playSound(hoverSound, "/sounds/hover_over.wav", .14);
        }}>
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
            onSelect={openEntry}
            selectedCable={selectedCable}
            onSelectCable={openCable}
            flyTarget={flyTarget}
          />
        </ErrorBoundary>
        <Dashboard
          active={active}
          onToggle={(id) => {
            toggle(id);
            setSelected(null);
            setSelectedCable(null);
            setFlyTarget(null);
            if (id === "cables" && active.has("cables")) setSelectedCable(null);
          }}
          selected={selected}
          onSelect={openEntry}
          selectedCable={selectedCable}
          onSelectCable={openCable}
          cableMeta={cableMeta}
          marineMeta={marineMeta}
          threatMeta={threatMeta}
          entries={activeEntries}
          overlayStats={overlayStats}
        />
        <Timeline
          entries={activeEntries}
          onFlyTo={(e) => {
            setSelected(e.entry);
            setSelectedCable(null);
            playSound(menuOpenSound, "/sounds/menu-open.wav", .28);
            setFlyTarget({ lat: e.lat, lng: e.lng, id: e.id + "-" + Date.now() });
          }}
        />
        <button className="hero-scroll-cue" aria-label="Scroll to portfolio content" onClick={() => document.getElementById("portfolio-start")?.scrollIntoView({ behavior:"smooth", block:"start" })}>
          <span>EXPLORE</span><ChevronDown size={14}/>
        </button>
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
