import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { Activity, Building2, Cable, Clock3, ExternalLink, Gauge, MapPin, RadioTower, Route, Server, ShieldCheck, X } from "lucide-react";
import { fetchCableDetails, type CableDetails, type CableMeta, type CablePath } from "../hooks/useLayers";

function Module({ icon: Icon, title, children }: { icon: any; title: string; children: ReactNode }) {
  return <section className="glass-clear rounded-xl border border-white/[0.07] p-3.5">
    <header className="flex items-center gap-2 mb-3">
      <span className="w-7 h-7 rounded-lg bg-cyan-glow/10 border border-cyan-glow/20 flex items-center justify-center"><Icon size={13} className="text-cyan-glow" /></span>
      <span className="text-[9px] tracking-[0.2em] uppercase font-semibold font-mono text-text-secondary">{title}</span>
      <span className="h-px flex-1 bg-white/[0.06]" />
    </header>
    {children}
  </section>;
}

function MetricDial({ icon: Icon, value, unit, label }: { icon: any; value: string; unit?: string; label: string }) {
  return <div className="glass-clear rounded-xl p-3 flex items-center gap-3 min-w-0">
    <div className="relative w-12 h-12 shrink-0 rounded-full border border-cyan-glow/25 flex items-center justify-center shadow-[inset_0_0_18px_rgba(74,222,222,0.08)]">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="2"/><circle cx="24" cy="24" r="21" fill="none" stroke="#4adede" strokeWidth="2" strokeLinecap="round" strokeDasharray="88 132"/></svg>
      <Icon size={15} className="text-cyan-glow" />
    </div>
    <div className="min-w-0"><div className="text-base font-semibold text-text-primary leading-none truncate">{value}<span className="text-[9px] text-text-muted ml-1 font-mono">{unit}</span></div><div className="text-[7px] tracking-[0.12em] uppercase text-text-muted font-mono mt-1.5 leading-tight">{label}</div></div>
  </div>;
}

function parseLengthKm(length: string | null): number | null {
  if (!length) return null;
  const value = Number(length.replace(/[^0-9.]/g, ""));
  return Number.isFinite(value) && value > 0 ? value : null;
}

function ApiTelemetryLoader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(116, 74, false);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 116 / 74, 0.1, 20);
    camera.position.z = 4.2;
    const group = new THREE.Group();
    scene.add(group);
    const cyan = new THREE.LineBasicMaterial({ color: 0x4adede, transparent: true, opacity: 0.85 });
    const dim = new THREE.LineBasicMaterial({ color: 0x2a8a8a, transparent: true, opacity: 0.35 });
    [0.72, 1.05, 1.38].forEach((radius, index) => {
      const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 72 }, (_, i) => {
          const angle = i / 72 * Math.PI * 2;
          return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
        })
      ), index === 1 ? cyan : dim);
      ring.rotation.x = index === 0 ? 0.8 : index === 2 ? -0.65 : 0.15;
      group.add(ring);
    });
    const nodes = new THREE.Points(
      new THREE.BufferGeometry().setFromPoints(Array.from({ length: 26 }, (_, i) => {
        const a = i * 2.399;
        const r = 0.35 + (i % 8) * 0.13;
        return new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, (i % 3 - 1) * 0.13);
      })),
      new THREE.PointsMaterial({ color: 0xe8f4f8, size: 0.045, transparent: true, opacity: 0.8 })
    );
    group.add(nodes);
    let frame = 0;
    const animate = () => {
      group.rotation.z += 0.008;
      group.rotation.y += 0.004;
      nodes.rotation.z -= 0.012;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(frame);
      scene.traverse((object: any) => {
        object.geometry?.dispose?.();
        if (Array.isArray(object.material)) object.material.forEach((m: any) => m.dispose());
        else object.material?.dispose?.();
      });
      renderer.dispose();
    };
  }, []);
  return <div className="relative w-[116px] h-[74px] shrink-0" aria-hidden="true"><canvas ref={canvasRef} className="absolute inset-0 w-full h-full"/><span className="absolute inset-0 flex items-center justify-center w-1.5 h-1.5 m-auto rounded-full bg-cyan-glow shadow-[0_0_12px_#4adede]"/></div>;
}

export function CableInfoPanel({ cable, meta, onClose }: { cable: CablePath; meta: CableMeta; onClose: () => void }) {
  const [details, setDetails] = useState<CableDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    setDetails(null); setError(null);
    fetchCableDetails(cable.id).then((value) => { if (!cancelled) setDetails(value); }).catch((reason) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "Metadata unavailable"); });
    return () => { cancelled = true; };
  }, [cable.id]);

  const latency = useMemo(() => {
    const km = parseLengthKm(details?.length ?? null);
    return km ? { oneWay: km / 204, rtt: km / 102 } : null;
  }, [details?.length]);
  const age = details?.rfs_year ? Math.max(0, new Date().getFullYear() - details.rfs_year) : null;

  return <aside className="absolute right-4 top-16 bottom-8 w-[460px] pointer-events-auto z-40">
    <div className="glass-dark rounded-2xl h-full overflow-y-auto border border-cyan-glow/15"><div className="p-4 flex flex-col gap-3">
      <header className="relative overflow-hidden rounded-xl border border-cyan-glow/20 bg-space-deep/50 backdrop-blur-xl p-4">
        <div className={`absolute inset-0 opacity-30 ${error ? "bg-[radial-gradient(circle_at_55%_100%,#ffb84d99,transparent_48%)]" : "bg-[radial-gradient(circle_at_80%_20%,#4adede55,transparent_45%)]"}`}/>
        <div className="relative flex items-start gap-3"><span className="w-11 h-11 rounded-xl bg-cyan-glow/10 border border-cyan-glow/30 flex items-center justify-center shadow-[0_0_20px_rgba(74,222,222,.12)]"><Cable size={20} className="text-cyan-glow"/></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2 mb-1"><span className="text-[8px] tracking-[0.2em] font-mono text-cyan-glow">CABLE INTELLIGENCE</span>{details && <span className={`text-[7px] px-2 py-0.5 rounded-full border font-mono ${details.is_planned ? "text-alert-amber border-alert-amber/30" : "text-[#5ab669] border-[#5ab669]/30"}`}>{details.is_planned ? "PLANNED" : "ACTIVE"}</span>}</div><h2 className="text-lg font-semibold text-text-primary leading-tight">{details?.name ?? cable.name}</h2><p className="text-[9px] text-text-muted font-mono mt-1">SYSTEM ID · {cable.id.toUpperCase()}</p></div><button onClick={onClose} aria-label="Close cable details" className="w-8 h-8 rounded-lg border border-white/10 text-text-secondary hover:text-white hover:bg-white/5 flex items-center justify-center"><X size={14}/></button></div>
        <div className={`absolute left-8 right-8 bottom-3 h-5 blur-xl transition-opacity ${error ? "opacity-70 bg-alert-amber/30" : "opacity-0"}`}/><div className="relative mt-4 flex items-center gap-2 text-cyan-glow"><span className="w-2 h-2 rounded-full bg-cyan-glow shadow-[0_0_8px_#4adede]"/><span className="h-px flex-1 bg-gradient-to-r from-cyan-glow/70 via-cyan-glow/20 to-cyan-glow/70"/><Route size={14}/><span className="h-px flex-1 bg-gradient-to-r from-cyan-glow/70 via-cyan-glow/20 to-cyan-glow/70"/><span className="w-2 h-2 rounded-full bg-cyan-glow shadow-[0_0_8px_#4adede]"/></div>
      </header>

      {!details && !error && <div className="glass-clear rounded-xl px-5 py-3 flex items-center gap-4 overflow-hidden"><ApiTelemetryLoader/><div><div className="text-[8px] tracking-[0.2em] text-cyan-glow font-mono mb-1.5">API HANDSHAKE</div><div className="text-[11px] text-text-primary font-medium">Acquiring system metadata</div><div className="flex gap-1 mt-2">{[0,1,2,3,4].map((i) => <span key={i} className="w-4 h-0.5 bg-cyan-glow/60 animate-pulse" style={{ animationDelay: `${i * 120}ms` }}/>)}</div></div></div>}
      {error && <div className="rounded-xl border border-alert-amber/25 bg-alert-amber/5 p-4 text-[11px] text-text-secondary"><div className="font-mono text-alert-amber text-[9px] mb-1">METADATA DEGRADED</div>{error}<div className="mt-2 text-text-muted">Route name and geometry remain available from the cable snapshot.</div></div>}

      {details && <>
        <div className="grid grid-cols-2 gap-2"><MetricDial icon={RadioTower} value={details.length ?? "—"} label="Cable length"/><MetricDial icon={Clock3} value={age == null ? "—" : String(age)} unit={age == null ? "" : "YRS"} label={`In service · ${details.rfs ?? "unknown"}`}/><MetricDial icon={Gauge} value={latency ? latency.oneWay.toFixed(1) : "—"} unit={latency ? "MS" : ""} label="Theoretical one-way floor"/><MetricDial icon={Activity} value={latency ? latency.rtt.toFixed(1) : "—"} unit={latency ? "MS" : ""} label="Theoretical RTT floor"/></div>
        <Module icon={MapPin} title="Landing points"><div className="space-y-2">{details.landing_points.map((point, index) => <div key={`${point.id}-${index}`} className="flex items-center gap-3 rounded-lg bg-white/[0.025] border border-white/[0.05] px-3 py-2.5"><span className="w-6 h-6 rounded-full border border-cyan-glow/20 flex items-center justify-center text-[8px] font-mono text-cyan-glow">{String(index + 1).padStart(2,"0")}</span><div><div className="text-[11px] text-text-primary">{point.name}</div><div className="text-[8px] font-mono text-text-muted uppercase">{point.country}</div></div></div>)}</div></Module>
        <div className="grid grid-cols-2 gap-2"><Module icon={Building2} title="Ownership"><p className="text-[11px] leading-relaxed text-text-primary">{details.owners || "Not published"}</p></Module><Module icon={Server} title="Supplier"><p className="text-[11px] leading-relaxed text-text-primary">{details.suppliers || "Not published"}</p></Module></div>
        {details.notes && <Module icon={Cable} title="System notes"><p className="text-[11px] leading-relaxed text-text-secondary">{details.notes}</p></Module>}
        <Module icon={ShieldCheck} title="Source & methodology"><div className="space-y-2 text-[9px] font-mono text-text-muted"><div className="flex justify-between gap-4"><span>DATA SOURCE</span><a href={meta.sourceUrl} target="_blank" rel="noreferrer" className="text-cyan-glow hover:underline">TeleGeography <ExternalLink size={8} className="inline"/></a></div><div className="flex justify-between gap-4"><span>FEED STATE</span><span className="text-text-secondary">{meta.status.toUpperCase()}</span></div><p className="pt-2 border-t border-white/[0.06] leading-relaxed">Latency is a calculated propagation floor using route length ÷ 204,000 km/s fibre speed. It excludes routing, equipment, repeaters, queueing and path variation; it is not a live measurement.</p>{details.url && <a href={details.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-cyan-glow hover:underline">OFFICIAL SYSTEM SITE <ExternalLink size={9}/></a>}</div></Module>
      </>}
    </div></div>
  </aside>;
}
