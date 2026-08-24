import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ArrowRight, Bot, CheckCircle2, CloudCog, Network, ShieldCheck, type LucideIcon } from "lucide-react";
import { siAnsible, siCisco, siDocker, siFortinet, siNeo4j, siPython, siTerraform, type SimpleIcon } from "simple-icons";
import { Reveal } from "./motion";

type Capability = { icon: LucideIcon; title: string; body: string; proof: string };
type CaseStudy = { n: string; title: string; context: string; outcome: string; proof: string[]; stack: string; href: string };

function Brand({ icon, label }: { icon: SimpleIcon; label: string }) {
  return <svg className="showcase-brand" viewBox="0 0 24 24" role="img" aria-label={`${label} logo`}><path d={icon.path} fill="currentColor" /></svg>;
}

function DepthField({ className = "" }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, 1, .1, 100); camera.position.z = 9;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); el.appendChild(renderer.domElement);
    const positions = new Float32Array(330);
    for (let i = 0; i < 110; i++) { positions[i * 3] = (Math.random() - .5) * 15; positions[i * 3 + 1] = (Math.random() - .5) * 8; positions[i * 3 + 2] = (Math.random() - .5) * 6; }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0x4adede, size: .035, transparent: true, opacity: .38 });
    const points = new THREE.Points(geometry, material); scene.add(points);
    let frame = 0, mx = 0, my = 0;
    const resize = () => { const r = el.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / Math.max(r.height, 1); camera.updateProjectionMatrix(); };
    const pointer = (e: PointerEvent) => { const r = el.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5; };
    const animate = () => { points.rotation.y += .0008; points.rotation.x += (my * .08 - points.rotation.x) * .025; camera.position.x += (mx * .35 - camera.position.x) * .025; renderer.render(scene, camera); frame = requestAnimationFrame(animate); };
    resize(); animate(); window.addEventListener("resize", resize); el.parentElement?.addEventListener("pointermove", pointer);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); el.parentElement?.removeEventListener("pointermove", pointer); geometry.dispose(); material.dispose(); renderer.dispose(); renderer.domElement.remove(); };
  }, []);
  return <div ref={host} className={`showcase-depth ${className}`} aria-hidden="true" />;
}

const brands = [[siPython], [siTerraform, siAnsible, siDocker], [siCisco, siFortinet], [] as SimpleIcon[]];
const flows = [["INTENT", "AGENTS", "PRODUCT"], ["STATE", "PIPELINE", "REPEATABLE"], ["ESTATE", "MODEL", "CHANGE"], ["BASELINE", "VERIFY", "ROLLBACK"]];
const defaults = [Bot, CloudCog, Network, ShieldCheck];

export function CapabilityShowcase3D({ capabilities }: { capabilities: Capability[] }) {
  return <section className="page-shell section-block showcase-section capability-showcase"><DepthField />
    <Reveal from="up"><div className="section-heading showcase-heading"><div><div className="section-kicker">[ HOW I CAN HELP ]</div><h2>From operational problem<br />to dependable system.</h2></div><p>I work across the boundary most teams struggle to bridge: infrastructure expertise, software delivery and practical AI.</p></div></Reveal>
    <div className="capability-3d-grid">{capabilities.map((item, i) => { const Icon = item.icon || defaults[i]; return <Reveal key={item.title} delay={i * 80} from="up"><article className="capability-3d-card"><div className="capability-orbit" aria-hidden="true" /><header><div className="capability-3d-icon"><Icon size={25} /></div><span>0{i + 1} / SYSTEM CAPABILITY</span><div className="capability-brands">{brands[i].map(icon => <Brand key={icon.slug} icon={icon} label={icon.title} />)}</div></header><h3>{item.title}</h3><p>{item.body}</p><div className="capability-proof">{item.proof}</div><div className="capability-flow">{flows[i].map((step, j) => <div key={step} className="contents"><b>{step}</b>{j < 2 && <i><span /></i>}</div>)}</div></article></Reveal>; })}</div>
  </section>;
}

const diagrams = [
  [{ icon: siCisco, a: "ASA SOURCE", b: "OBJECTS / ACL / NAT" }, { icon: siPython, a: "NORMALISE", b: "PARSE + MAP" }, { icon: siAnsible, a: "ORCHESTRATE", b: "23 PLAYBOOKS" }, { a: "FMC / FTD", b: "API DEPLOY" }],
  [{ a: "BASELINE", b: "PRE-CHANGE STATE" }, { icon: siAnsible, a: "CUTOVER", b: "STAGED EXECUTION" }, { icon: siPython, a: "DIFF ENGINE", b: "PYATS / GENIE" }, { a: "DECISION", b: "PASS / FAIL" }],
  [{ icon: siCisco, a: "ESTATE", b: "~40 DEVICES" }, { icon: siPython, a: "COLLECT", b: "SSH / CDP" }, { a: "MODEL", b: "VRF / VLAN / IP" }, { icon: siNeo4j, a: "GRAPH", b: "CYPHER QUERY" }],
];
const telemetry = [["OPENAPI / OAS3", "IDEMPOTENT RESOLUTION", "VERIFIED"], ["TIMESTAMPED EVIDENCE", "HTML + TEXT DIFF", "ROLLBACK READY"], ["IDEMPOTENT INGEST", "RELATIONSHIP MAP", "BLAST RADIUS READY"]];

export function SelectedSystems3D({ cases }: { cases: CaseStudy[] }) {
  return <section id="work" className="page-shell section-block showcase-section systems-showcase"><DepthField className="systems-depth" />
    <Reveal from="up"><div className="section-heading showcase-heading"><div><div className="section-kicker">[ SELECTED SYSTEMS // LIVE ARCHITECTURE STORIES ]</div><h2>Complex change,<br />made repeatable.</h2></div><p>Three examples of turning high-risk infrastructure work into observable, reviewable automation.</p></div></Reveal>
    <div className="systems-3d-list">{cases.map((item, i) => <Reveal key={item.n} delay={i * 90} from="up"><article className="system-3d-card"><div className="system-3d-number">{item.n}</div><div className="system-3d-story"><span>{item.context}</span><h3>{item.title}</h3><p>{item.outcome}</p><div className="system-proof-pills">{item.proof.map(p => <b key={p}><CheckCircle2 size={11} />{p}</b>)}</div><a href={item.href}>Read the case study <ArrowRight size={14} /></a></div><div className="system-diagram-3d"><div className="system-flow-nodes">{diagrams[i].map((node, j) => <div className="contents" key={node.a}><div className="system-flow-node">{node.icon ? <Brand icon={node.icon} label={node.icon.title} /> : <CheckCircle2 size={20} />}<b>{node.a}</b><span>{node.b}</span></div>{j < 3 && <i className="system-flow-line"><span /></i>}</div>)}</div><div className="system-telemetry">{telemetry[i].map((t, j) => <span className={j === 2 ? "healthy" : ""} key={t}>{t}</span>)}</div><small>{item.stack}</small></div></article></Reveal>)}</div>
  </section>;
}
