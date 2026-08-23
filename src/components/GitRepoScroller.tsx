import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ChevronLeft, ChevronRight, GitBranch, MousePointer2 } from "lucide-react";
import { githubRepos, loadGitHubRepos, type GitHubRepo } from "../data/github-repos";
import { ProjectDetailModal, type ArchiveItem } from "./ProjectDetailModal";

function repoToItem(repo: GitHubRepo): ArchiveItem {
  return {
    id: repo.id,
    title: repo.name,
    category: repo.category,
    accent: repo.accent,
    description: repo.description,
    summary: repo.summary,
    highlights: repo.highlights,
    usage: repo.usage,
    stack: repo.stack,
    meta: [
      { label: "Language", value: repo.language }, { label: "License", value: repo.license },
      { label: "Stars", value: String(repo.stars) }, { label: "Forks", value: String(repo.forks) },
      { label: "Updated", value: repo.updated },
    ],
    links: [{ label: "Open on GitHub", url: repo.url }],
    source: "github",
  };
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.closePath();
}

function cardTexture(repo: GitHubRepo) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024; canvas.height = 600;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, 1024, 600);
  gradient.addColorStop(0, "#111b25"); gradient.addColorStop(1, "#070c12");
  roundedRect(ctx, 4, 4, 1016, 592, 42); ctx.save(); ctx.clip(); ctx.fillStyle = gradient; ctx.fill();
  ctx.strokeStyle = `${repo.accent}80`; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = repo.accent; ctx.fillRect(0, 0, 1024, 8);
  ctx.font = "600 22px JetBrains Mono, monospace"; ctx.fillText(repo.category.toUpperCase(), 64, 76, 850);
  ctx.fillStyle = "#e8f4f8"; ctx.font = "700 52px Inter, sans-serif"; ctx.fillText(repo.name, 64, 164, 860);
  ctx.fillStyle = "#8aa0b0"; ctx.font = "400 29px Inter, sans-serif";
  const words = repo.description.split(" "); let line = ""; let y = 235; let rows = 0;
  for (const word of words) { const test = `${line}${word} `; if (ctx.measureText(test).width > 840 && rows < 2) { ctx.fillText(line, 64, y, 840); line = `${word} `; y += 42; rows++; } else line = test; }
  ctx.fillText(line, 64, y, 840);
  ctx.fillStyle = "#4a6070"; ctx.font = "500 20px JetBrains Mono, monospace"; ctx.fillText(repo.stack.slice(0, 4).join("  ·  "), 64, 445, 830);
  ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.beginPath(); ctx.moveTo(64, 492); ctx.lineTo(960, 492); ctx.stroke();
  ctx.fillStyle = "#c8d8df"; ctx.font = "600 20px Inter, sans-serif"; ctx.fillText("SELECT TO OPEN PROJECT DETAILS", 64, 548, 760);
  ctx.fillStyle = repo.accent; ctx.beginPath(); ctx.arc(938, 540, 9, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4; return texture;
}

export function GitRepoScroller() {
  const mountRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const [selected, setSelected] = useState<ArchiveItem | null>(null);
  const [active, setActive] = useState(0);
  const [repos, setRepos] = useState<GitHubRepo[]>(githubRepos);

  useEffect(() => { loadGitHubRepos().then(setRepos); }, []);

  const move = (direction: number) => {
    targetRef.current = Math.max(0, Math.min(repos.length - 1, Math.round(targetRef.current + direction)));
    setActive(targetRef.current);
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 100); camera.position.set(0, 0, 8.2);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    const group = new THREE.Group(); scene.add(group);
    const meshes = repos.map((repo, index) => {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(4.65, 2.72), new THREE.MeshBasicMaterial({ map: cardTexture(repo), transparent: true, side: THREE.DoubleSide }));
      mesh.userData = { repo, index }; group.add(mesh); return mesh;
    });
    const resize = () => { const { width, height } = mount.getBoundingClientRect(); renderer.setSize(width, height, false); camera.aspect = width / Math.max(height, 1); camera.position.z = camera.aspect < 1.25 ? 8.65 : 7.65; camera.updateProjectionMatrix(); };
    resize(); const observer = new ResizeObserver(resize); observer.observe(mount);
    const pointer = new THREE.Vector2(); const raycaster = new THREE.Raycaster();
    let dragged = false, downX = 0, startTarget = 0;
    const point = (event: PointerEvent) => { const r = renderer.domElement.getBoundingClientRect(); pointer.x = ((event.clientX-r.left)/r.width)*2-1; pointer.y = -((event.clientY-r.top)/r.height)*2+1; };
    const onDown = (e: PointerEvent) => { dragged=false; downX=e.clientX; startTarget=targetRef.current; renderer.domElement.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => { if (!renderer.domElement.hasPointerCapture(e.pointerId)) return; const d=(downX-e.clientX)/260; if(Math.abs(d)>.05) dragged=true; targetRef.current=Math.max(0,Math.min(repos.length-1,startTarget+d)); };
    const onUp = (e: PointerEvent) => { renderer.domElement.releasePointerCapture(e.pointerId); targetRef.current=Math.round(targetRef.current); setActive(targetRef.current); if(!dragged){ point(e); raycaster.setFromCamera(pointer,camera); const hit=raycaster.intersectObjects(meshes)[0]; if(hit) setSelected(repoToItem(hit.object.userData.repo)); } };
    const onWheel = (e: WheelEvent) => { e.preventDefault(); targetRef.current=Math.max(0,Math.min(repos.length-1,targetRef.current+(e.deltaY+e.deltaX)*.0025)); setActive(Math.round(targetRef.current)); };
    renderer.domElement.addEventListener("pointerdown",onDown); renderer.domElement.addEventListener("pointermove",onMove); renderer.domElement.addEventListener("pointerup",onUp); renderer.domElement.addEventListener("wheel",onWheel,{passive:false});
    let frame=0;
    const render = () => { currentRef.current += (targetRef.current-currentRef.current)*.075; meshes.forEach((mesh,i)=>{ const d=i-currentRef.current; mesh.position.set(d*4.02, -Math.abs(d)*.13, -Math.abs(d)*1.5); mesh.rotation.y=-d*.13; const scale=1-Math.min(Math.abs(d)*.13,.4); mesh.scale.setScalar(scale); (mesh.material as THREE.MeshBasicMaterial).opacity=1-Math.min(Math.abs(d)*.26,.76); }); renderer.render(scene,camera); frame=requestAnimationFrame(render); }; render();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); renderer.domElement.removeEventListener("pointerdown",onDown); renderer.domElement.removeEventListener("pointermove",onMove); renderer.domElement.removeEventListener("pointerup",onUp); renderer.domElement.removeEventListener("wheel",onWheel); meshes.forEach(m=>{m.geometry.dispose(); (m.material as THREE.MeshBasicMaterial).map?.dispose(); (m.material as THREE.MeshBasicMaterial).dispose();}); renderer.dispose(); renderer.domElement.remove(); };
  }, [repos]);

  return <section className="repo-showcase" aria-labelledby="repo-showcase-title">
    <div className="repo-showcase-head page-shell"><div><div className="section-kicker">[ GITHUB / SELECTED REPOSITORIES ]</div><h2 id="repo-showcase-title">Explore the systems behind the work.</h2></div><div className="repo-controls"><span><MousePointer2 size={13}/> Drag, scroll or select</span><button onClick={()=>move(-1)} aria-label="Previous repository"><ChevronLeft/></button><button onClick={()=>move(1)} aria-label="Next repository"><ChevronRight/></button></div></div>
    <div ref={mountRef} className="repo-canvas" />
    <div className="repo-tabs page-shell">{repos.map((repo,i)=><button className={i===active?"active":""} key={repo.id} onClick={()=>{targetRef.current=i;setActive(i)}}><GitBranch size={12}/>{repo.name}</button>)}</div>
    <ProjectDetailModal item={selected} onClose={()=>setSelected(null)}/>
  </section>;
}
