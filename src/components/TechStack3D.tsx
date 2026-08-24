import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  siAnsible, siAnthropic, siCisco, siCitrix, siDocker, siF5, siFortinet,
  siGithub, siGithubactions, siGooglecloud, siJunipernetworks, siKubernetes,
  siLangchain, siModelcontextprotocol, siN8n, siNeo4j, siNextdotjs, siNginx,
  siNodedotjs, siPaloaltonetworks, siReact, siSupabase, siTerraform,
  siTypescript, siPython, siWireguard, type SimpleIcon,
} from "simple-icons";

const ICONS: Record<string, SimpleIcon> = {
  ansible: siAnsible, anthropic: siAnthropic, cisco: siCisco, citrix: siCitrix,
  docker: siDocker, f5: siF5, fortinet: siFortinet, github: siGithub,
  githubactions: siGithubactions, googlecloud: siGooglecloud,
  junipernetworks: siJunipernetworks, kubernetes: siKubernetes,
  langchain: siLangchain, modelcontextprotocol: siModelcontextprotocol, n8n: siN8n,
  neo4j: siNeo4j, nextdotjs: siNextdotjs, nginx: siNginx,
  nodedotjs: siNodedotjs, paloaltonetworks: siPaloaltonetworks, python: siPython,
  react: siReact, supabase: siSupabase, terraform: siTerraform,
  typescript: siTypescript, wireguard: siWireguard,
};

function bundledLogoUrl(slug: string): string | undefined {
  const icon = ICONS[slug];
  if (!icon) return undefined;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4adede" d="${icon.path}"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

type TechItem = readonly [name: string, iconSlug: string, category: string, officialLogoUrl?: string];
const TECH: readonly TechItem[] = [
  ["Cisco", "cisco", "NETWORK"], ["Fortinet", "fortinet", "SECURITY"], ["Juniper", "junipernetworks", "NETWORK"],
  ["Palo Alto", "paloaltonetworks", "SECURITY"], ["F5", "f5", "TRAFFIC"], ["Docker", "docker", "PLATFORM"],
  ["Kubernetes", "kubernetes", "PLATFORM"], ["Ansible", "ansible", "AUTOMATION"], ["Terraform", "terraform", "IaC"],
  ["Python", "python", "CODE"], ["Node.js", "nodedotjs", "RUNTIME"], ["TypeScript", "typescript", "CODE"],
  ["React", "react", "UI"], ["Next.js", "nextdotjs", "FULL STACK"], ["GitHub", "github", "SOURCE"],
  ["GitHub Actions", "githubactions", "CI/CD"], ["AWS", "amazonwebservices", "CLOUD"], ["Azure", "microsoftazure", "CLOUD"],
  ["Google Cloud", "googlecloud", "CLOUD"], ["Supabase", "supabase", "DATA"], ["Neo4j", "neo4j", "GRAPH"],
  ["OpenAI", "openai", "AI"], ["Anthropic", "anthropic", "AI"], ["LangGraph", "langchain", "AGENTS"],
  ["Pinecone", "pinecone", "VECTOR"], ["pyATS", "cisco", "TESTING"], ["Netmiko", "python", "AUTOMATION"],
  ["Viptela SD-WAN", "cisco", "SD-WAN"], ["Citrix NetScaler", "citrix", "ADC / TRAFFIC"], ["Firepower (FTD)", "cisco", "NGFW"],
  ["NGINX", "nginx", "WEB / PROXY"], ["BGP", "cisco", "ROUTING"], ["MPLS", "cisco", "TRANSPORT"], ["VPN", "wireguard", "SECURE ACCESS"],
  ["OpenClaw", "", "AI AGENT", "https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/pixel-lobster.svg"],
  ["n8n", "n8n", "WORKFLOW AUTOMATION"], ["Hermes Agent", "", "AI AGENT", "https://raw.githubusercontent.com/NousResearch/hermes-agent/main/assets/banner.png"],
  ["Pi Coding Agent", "", "CODING AGENT"], ["MCP", "modelcontextprotocol", "AGENT PROTOCOL"], ["RAG", "", "AI ARCHITECTURE"],
  ["Claude Code CLI", "anthropic", "CODING AGENT"], ["Codex CLI", "openai", "CODING AGENT"],
];

function cardTexture(renderer: THREE.WebGLRenderer, name: string, slug: string, category: string, officialLogoUrl?: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512; canvas.height = 600;
  const ctx = canvas.getContext("2d")!;
  const draw = (logo?: HTMLImageElement) => {
    ctx.clearRect(0, 0, 512, 600);
    const gradient = ctx.createLinearGradient(0, 0, 512, 600);
    gradient.addColorStop(0, "rgba(15,27,38,.96)"); gradient.addColorStop(1, "rgba(5,10,16,.92)");
    ctx.fillStyle = gradient; ctx.fillRect(8, 8, 496, 584);
    ctx.strokeStyle = "rgba(112,235,239,.38)"; ctx.lineWidth = 2; ctx.strokeRect(9, 9, 494, 582);
    ctx.fillStyle = "rgba(74,222,222,.09)"; ctx.fillRect(10, 10, 492, 8);
    if (logo) {
      const maxSize = 200;
      const ratio = Math.min(maxSize / logo.naturalWidth, maxSize / logo.naturalHeight);
      const width = logo.naturalWidth * ratio, height = logo.naturalHeight * ratio;
      const x = 256 - width / 2, y = 216 - height / 2;
      const logoCanvas = document.createElement("canvas");
      logoCanvas.width = Math.ceil(width); logoCanvas.height = Math.ceil(height);
      const logoCtx = logoCanvas.getContext("2d")!;
      logoCtx.drawImage(logo, 0, 0, width, height);
      logoCtx.globalCompositeOperation = "source-in";
      logoCtx.fillStyle = "#4adede";
      logoCtx.fillRect(0, 0, width, height);
      ctx.drawImage(logoCanvas, x, y, width, height);
    }
    else { ctx.fillStyle = "#4adede"; ctx.font = "600 112px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText(name.slice(0, 2).toUpperCase(), 256, 270); }
    ctx.textAlign = "center"; ctx.fillStyle = "#e8f4f8"; ctx.font = "600 42px Inter, sans-serif"; ctx.fillText(name, 256, 405);
    ctx.fillStyle = "#4adede"; ctx.font = "500 20px monospace"; ctx.fillText(category, 256, 455);
    ctx.fillStyle = "#4a6070"; ctx.font = "16px monospace"; ctx.fillText("SYSTEM CAPABILITY", 256, 526);
  };
  draw();
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const logoSource = officialLogoUrl || bundledLogoUrl(slug);
  if (logoSource) {
    const image = new Image(); image.crossOrigin = "anonymous";
    image.onload = () => { draw(image); texture.needsUpdate = true; };
    image.src = logoSource;
  }
  return texture;
}

export function TechStack3D() {
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = host.current; if (!el) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(39, 1, .1, 100); camera.position.set(0, .05, 6.35);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75)); el.appendChild(renderer.domElement);
    const group = new THREE.Group(); scene.add(group);
    const cards = TECH.map(([name, slug, category, officialLogoUrl], index) => {
      const material = new THREE.MeshBasicMaterial({ map: cardTexture(renderer, name, slug, category, officialLogoUrl), transparent: true, depthWrite: false });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.28, 2.68), material);
      mesh.userData.index = index; group.add(mesh); return mesh;
    });
    let progress = 0, target = 0, dragging = false, lastX = 0, frame = 0, lastActive = -1;
    const layout = () => {
      cards.forEach((card, index) => {
        let offset = index - progress;
        while (offset > TECH.length / 2) offset -= TECH.length;
        while (offset < -TECH.length / 2) offset += TECH.length;
        const angle = offset * .34;
        card.position.set(Math.sin(angle) * 8.8, -Math.abs(offset) * .018, -Math.abs(offset) * .66);
        card.rotation.y = -angle * .46;
        const scale = Math.max(.56, 1 - Math.abs(offset) * .072); card.scale.setScalar(scale);
        (card.material as THREE.MeshBasicMaterial).opacity = Math.max(.2, 1 - Math.abs(offset) * .115);
      });
      const nearest = ((Math.round(progress) % TECH.length) + TECH.length) % TECH.length;
      if (nearest !== lastActive) { lastActive = nearest; setActive(nearest); }
    };
    const resize = () => { const w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    const ro = new ResizeObserver(resize); ro.observe(el); resize();
    const down = (e: PointerEvent) => { dragging = true; lastX = e.clientX; renderer.domElement.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => { if (!dragging) return; target -= (e.clientX - lastX) * .012; lastX = e.clientX; };
    const up = () => { dragging = false; target = Math.round(target); };
    const wheel = (e: WheelEvent) => { target += (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * .0025; };
    renderer.domElement.addEventListener("pointerdown", down); renderer.domElement.addEventListener("pointermove", move); renderer.domElement.addEventListener("pointerup", up); renderer.domElement.addEventListener("wheel", wheel, { passive: true });
    const tick = () => { if (!dragging) target += .0018; progress += (target - progress) * .065; layout(); renderer.render(scene, camera); frame = requestAnimationFrame(tick); }; tick();
    return () => { cancelAnimationFrame(frame); ro.disconnect(); cards.forEach((card) => { card.geometry.dispose(); const material = card.material as THREE.MeshBasicMaterial; material.map?.dispose(); material.dispose(); }); renderer.dispose(); renderer.domElement.remove(); };
  }, []);

  return <section className="tech-stack-section page-shell" aria-label="Technology stack">
    <div className="tech-stack-head"><div><div className="section-kicker">[ TECHNOLOGY STACK ]</div><p>{TECH.length} technologies across network, security, cloud, automation and AI</p></div><span>DRAG / SCROLL TO EXPLORE</span></div>
    <div ref={host} className="tech-stack-webgl" />
    <div className="tech-stack-active"><i /> <b>{TECH[active][0]}</b><span>{TECH[active][2]}</span><em>{String(active + 1).padStart(2, "0")} / {TECH.length}</em></div>
  </section>;
}
