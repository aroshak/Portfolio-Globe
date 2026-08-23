// ── What I Deliver — Forward Deployment / agentic automation pitch ──
import {
  Bot, PlugZap, Zap, Rocket, Users, Hammer, Brain, ShieldCheck,
  ArrowRight, Crosshair,
} from "lucide-react";
import {
  servicesHeadline, capabilities, fdeSkills, proofMetrics, closingPitch,
  type Capability, type FdeSkill,
} from "../data/services";
import { Reveal, TiltCard, CountUp } from "./motion";

const CAP_ICONS: Record<string, any> = {
  bot: Bot,
  plug: PlugZap,
  zap: Zap,
  rocket: Rocket,
};

const SKILL_ICONS: Record<string, any> = {
  users: Users,
  hammer: Hammer,
  brain: Brain,
  shield: ShieldCheck,
};

function CapabilityCard({ c }: { c: Capability }) {
  const Icon = CAP_ICONS[c.icon] ?? Zap;
  return (
    <TiltCard
      className="glass rounded-2xl p-5 h-full flex flex-col transition-all hover:-translate-y-0.5"
    >
      <div className="h-0.5 w-10 rounded-full mb-4" style={{ background: c.accent, boxShadow: `0 0 8px ${c.accent}` }} />
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${c.accent}15`, border: `1px solid ${c.accent}35` }}
        >
          <Icon size={15} strokeWidth={1.7} style={{ color: c.accent }} />
        </div>
        <h3 className="font-sans text-[14px] font-semibold text-text-primary leading-tight">{c.title}</h3>
      </div>
      <p className="text-[11.5px] font-medium leading-snug mb-3" style={{ color: c.accent }}>
        {c.pitch}
      </p>
      <ul className="space-y-1.5 mt-auto">
        {c.details.map((d, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-[6px] w-1 h-1 rounded-full shrink-0" style={{ background: c.accent }} />
            <span className="text-[11px] text-text-secondary leading-relaxed">{d}</span>
          </li>
        ))}
      </ul>
    </TiltCard>
  );
}

function SkillBlock({ s }: { s: FdeSkill }) {
  const Icon = SKILL_ICONS[s.icon] ?? Users;
  return (
    <div className="glass-clear rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2.5">
        <Icon size={13} className="text-cyan-glow" strokeWidth={1.7} />
        <span className="text-[10px] tracking-[0.18em] uppercase font-semibold text-text-primary font-mono">
          {s.category}
        </span>
      </div>
      <ul className="space-y-1.5">
        {s.skills.map((sk, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-[5px] w-1 h-1 rounded-full bg-cyan-glow/60 shrink-0" />
            <span className="text-[10.5px] text-text-secondary leading-relaxed">{sk}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ServicesPanel() {
  return (
    <section id="services" className="relative w-full px-6 pt-20 md:px-12">
      <div className="mx-auto max-w-6xl">

        {/* ── HEADLINE ── */}
        <Reveal from="up" className="mb-10">
          <div className="micro-label mb-3 flex items-center gap-2">
            <Crosshair size={11} className="text-cyan-glow" />
            [ {servicesHeadline.eyebrow} ]
          </div>
          <h2 className="font-sans text-[26px] md:text-[32px] font-semibold text-text-primary leading-tight max-w-3xl mb-4">
            {servicesHeadline.title}
          </h2>
          <p className="text-[13px] text-text-secondary max-w-3xl leading-relaxed mb-4">
            {servicesHeadline.pitch}
          </p>
          <div className="inline-flex items-center gap-2 text-[12px] font-mono text-cyan-glow tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-glow shadow-[0_0_8px_#4adede]" />
            {servicesHeadline.hook}
          </div>
        </Reveal>

        {/* ── PROOF METRICS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {proofMetrics.map((m, i) => (
            <Reveal key={m.label} delay={i * 90} from="scale">
              <TiltCard className="glass-dark rounded-xl px-4 py-3.5 text-center" maxTilt={8}>
                <div className="font-sans text-[22px] font-bold text-cyan-glow leading-none mb-1">
                  <CountUp value={m.value} />
                </div>
                <div className="text-[8px] tracking-[0.18em] font-mono text-text-muted">{m.label}</div>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        {/* ── CAPABILITIES ── */}
        <Reveal from="left" className="mb-6">
          <div className="flex items-center gap-3">
            <div className="micro-label">[ 01_CAPABILITIES ]</div>
            <div className="h-px flex-1 bg-cyan-glow/15" />
          </div>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2 mb-12">
          {capabilities.map((c, i) => (
            <Reveal key={c.id} delay={i * 110} from="up">
              <CapabilityCard c={c} />
            </Reveal>
          ))}
        </div>

        {/* ── FDE SKILL MATRIX ── */}
        <Reveal from="left" className="mb-6">
          <div className="flex items-center gap-3">
            <div className="micro-label">[ 02_FORWARD_DEPLOYMENT_MATRIX ]</div>
            <div className="h-px flex-1 bg-cyan-glow/15" />
          </div>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {fdeSkills.map((s, i) => (
            <Reveal key={s.category} delay={i * 90} from="up">
              <SkillBlock s={s} />
            </Reveal>
          ))}
        </div>

        {/* ── CLOSING PITCH ── */}
        <Reveal from="scale">
          <div className="glass-dark rounded-2xl p-6 md:p-8 mb-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-glow via-cyan-glow/40 to-transparent" />
          <h3 className="font-sans text-lg font-semibold text-text-primary mb-3">{closingPitch.title}</h3>
          <p className="text-[12.5px] text-text-secondary leading-relaxed max-w-3xl mb-5">
            {closingPitch.body}
          </p>
          <a
            href="mailto:aroshak@gmail.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-cyan-glow/50 text-cyan-glow text-[11px] font-mono tracking-[0.12em] font-semibold hover:bg-cyan-glow/10 hover:shadow-[0_0_20px_rgba(74,222,222,0.25)] transition-all"
          >
            {closingPitch.cta} <ArrowRight size={13} strokeWidth={2} />
          </a>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
