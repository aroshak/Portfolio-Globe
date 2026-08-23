// ── BackgroundFX — persistent Three.js layer behind the page body ──
// Starfield + drifting particle network (evolved from the original cyber
// portfolio). Reacts to mouse (parallax) and scroll (depth rotation).
import { useEffect, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 110;
const LINK_DIST = 140;

export function BackgroundFX() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050810, 0.0009);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      3000
    );
    camera.position.z = 620;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    /* ── Starfield: distant shell, slow scroll-driven rotation ── */
    const starCount = 900;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starCol = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      // random point on a large spherical shell
      const r = 1600 + Math.random() * 900;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi) - 400;
      // 85% faint white, 15% cyan accent
      const cyan = Math.random() < 0.15;
      const b = 0.35 + Math.random() * 0.45;
      starCol[i * 3] = cyan ? 0.29 * b : b;
      starCol[i * 3 + 1] = cyan ? 0.87 * b : b;
      starCol[i * 3 + 2] = cyan ? 0.87 * b : b;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starCol, 3));
    const starMat = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    /* ── Particle network: nodes + dynamic link lines ── */
    const netGroup = new THREE.Group();
    scene.add(netGroup);

    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(PARTICLE_COUNT * 3);
    const pCol = new Float32Array(PARTICLE_COUNT * 3);
    const velocities: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 1800;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 1100;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 460;
      velocities.push({
        x: (Math.random() - 0.5) * 0.35,
        y: (Math.random() - 0.5) * 0.35,
        z: (Math.random() - 0.5) * 0.25,
      });
      // ~10% magenta accents, rest cyan
      const accent = Math.random() < 0.1;
      if (accent) {
        pCol[i * 3] = 1.0; pCol[i * 3 + 1] = 0.3; pCol[i * 3 + 2] = 0.62;
      } else {
        pCol[i * 3] = 0.29; pCol[i * 3 + 1] = 0.87; pCol[i * 3 + 2] = 0.87;
      }
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(pCol, 3));
    const pMat = new THREE.PointsMaterial({
      size: 3.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(pGeo, pMat);
    netGroup.add(particles);

    const lineGeo = new THREE.BufferGeometry();
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x4adede,
      transparent: true,
      opacity: 0.07,
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    netGroup.add(lines);

    /* ── Interaction state ── */
    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    let scrollY = window.scrollY;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX - window.innerWidth / 2;
      mouseY = e.clientY - window.innerHeight / 2;
    };
    const onScroll = () => { scrollY = window.scrollY; };
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    /* ── Animation loop ── */
    let raf = 0;
    const linePositions: number[] = [];

    function animate() {
      raf = requestAnimationFrame(animate);

      // mouse parallax (gentle)
      targetX += (mouseX - targetX) * 0.02;
      targetY += (mouseY - targetY) * 0.02;
      camera.position.x = targetX * 0.05;
      camera.position.y = -targetY * 0.05;
      camera.lookAt(scene.position);

      // scroll: stars rotate for depth, network drifts
      stars.rotation.y = scrollY * 0.00012;
      stars.rotation.x = scrollY * 0.00005;
      netGroup.rotation.y = scrollY * 0.00006;
      netGroup.position.y = scrollY * 0.02;

      // particle drift + reflection at bounds
      const pos = pGeo.attributes.position.array as Float32Array;
      linePositions.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        pos[i3] += velocities[i].x;
        pos[i3 + 1] += velocities[i].y;
        pos[i3 + 2] += velocities[i].z;
        if (Math.abs(pos[i3]) > 900) velocities[i].x *= -1;
        if (Math.abs(pos[i3 + 1]) > 550) velocities[i].y *= -1;
        if (Math.abs(pos[i3 + 2]) > 230) velocities[i].z *= -1;

        // links
        for (let j = i + 1; j < PARTICLE_COUNT; j++) {
          const j3 = j * 3;
          const dx = pos[i3] - pos[j3];
          const dy = pos[i3 + 1] - pos[j3 + 1];
          const dz = pos[i3 + 2] - pos[j3 + 2];
          const dist = dx * dx + dy * dy + dz * dz;
          if (dist < LINK_DIST * LINK_DIST) {
            linePositions.push(
              pos[i3], pos[i3 + 1], pos[i3 + 2],
              pos[j3], pos[j3 + 1], pos[j3 + 2]
            );
          }
        }
      }
      pGeo.attributes.position.needsUpdate = true;
      lineGeo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(linePositions, 3)
      );

      stars.rotation.z += 0.00002;
      renderer.render(scene, camera);
    }
    animate();

    // pause when tab hidden
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else animate();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.dispose();
      starGeo.dispose();
      pGeo.dispose();
      lineGeo.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
