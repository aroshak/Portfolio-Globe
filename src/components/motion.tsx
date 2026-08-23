// ── Motion primitives — scroll reveals, 3D tilt, count-ups, progress rail ──
import {
  useEffect, useRef, useState, type ReactNode, type CSSProperties,
} from "react";

/* ── Reveal: fade + rise + de-blur on first viewport entry ── */
export function Reveal({
  children,
  delay = 0,
  className = "",
  from = "up",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  from?: "up" | "left" | "right" | "scale";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hidden: Record<string, string> = {
    up: "translateY(26px)",
    left: "translateX(-30px)",
    right: "translateX(30px)",
    scale: "scale(0.94)",
  };

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "none" : hidden[from],
    filter: visible ? "blur(0)" : "blur(6px)",
    transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms, filter 0.7s ease ${delay}ms`,
    willChange: "opacity, transform, filter",
  };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

/* ── TiltCard: perspective tilt + cursor glare on hover ── */
export function TiltCard({
  children,
  className = "",
  maxTilt = 5,
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * -2 * maxTilt;
    const ry = (px - 0.5) * 2 * maxTilt;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(4px)`;
    el.style.setProperty("--glare-x", `${px * 100}%`);
    el.style.setProperty("--glare-y", `${py * 100}%`);
    el.style.setProperty("--glare-o", "1");
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0) rotateY(0) translateZ(0)";
    el.style.setProperty("--glare-o", "0");
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`tilt-card ${className}`}
    >
      {children}
      <div className="tilt-glare" aria-hidden="true" />
    </div>
  );
}

/* ── CountUp: animate a numeric value when scrolled into view ── */
export function CountUp({
  value,
  duration = 1100,
  className = "",
}: {
  value: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const m = value.match(/^(\d+)(.*)$/);
    if (!m) return; // non-numeric — render as-is
    const target = parseInt(m[1], 10);
    const suffix = m[2] ?? "";

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(`${Math.round(target * eased)}${suffix}`);
          if (p < 1) requestAnimationFrame(tick);
        };
        setDisplay(`0${suffix}`);
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

/* ── ScrollProgress: thin cyan rail on the right edge ── */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      el.style.height = `${p * 100}%`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="fixed top-0 right-0 w-[3px] h-full z-50 pointer-events-none">
      <div className="w-full h-full bg-white/[0.03]" />
      <div
        ref={ref}
        className="absolute top-0 left-0 w-full bg-gradient-to-b from-cyan-glow/30 via-cyan-glow to-cyan-glow/60 shadow-[0_0_10px_rgba(74,222,222,0.6)]"
        style={{ height: "0%" }}
      />
    </div>
  );
}

/* ── SectionSep: animated divider between sections ── */
export function SectionSep() {
  return (
    <div className="relative w-full max-w-6xl mx-auto px-6 md:px-12" aria-hidden="true">
      <div className="section-sep relative h-px w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-glow/25 to-transparent" />
        <div className="section-sep-pulse absolute top-0 h-full w-24 bg-gradient-to-r from-transparent via-cyan-glow/80 to-transparent" />
      </div>
    </div>
  );
}
