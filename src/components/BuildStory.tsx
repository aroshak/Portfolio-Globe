// ── Behind the Build — multi-agent workflow + open-source models ──
import {
  Network, ScanSearch, Globe, Hammer, Eye, Brain,
  Cpu, Bot, Code2, Database, ChevronRight, GitBranch,
} from "lucide-react";
import {
  buildHeadline, pipelineStages, agentRoster, openStack, buildStats, buildClosing,
} from "../data/build-story";
import { Reveal, TiltCard, CountUp } from "./motion";

const AGENT_ICONS: Record<string, any> = {
  orchestrator: Network,
  scan: ScanSearch,
  globe: Globe,
  hammer: Hammer,
  eye: Eye,
  brain: Brain,
};

const STACK_ICONS: Record<string, any> = {
  cpu: Cpu,
  bot: Bot,
  code: Code2,
  database: Database,
};

export function BuildStory() {
  return (
    <section id="build-story" className="relative w-full px-6 py-20 md:px-12">
      <div className="mx-auto max-w-6xl">

        {/* ── HEADLINE ── */}
        <Reveal from="up" className="mb-10">
          <div className="micro-label mb-3 flex items-center gap-2">
            <GitBranch size={11} className="text-cyan-glow" />
            [ {buildHeadline.eyebrow} ]
          </div>
          <h2 className="font-sans text-[24px] md:text-[30px] font-semibold text-text-primary leading-tight max-w-3xl mb-4">
            {buildHeadline.title}
          </h2>
          <p className="text-[13px] text-text-secondary max-w-3xl leading-relaxed mb-4">
            {buildHeadline.pitch}
          </p>
          <div className="inline-flex items-center gap-2 text-[12px] font-mono text-cyan-glow tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-glow shadow-[0_0_8px_#4adede]" />
            {buildHeadline.hook}
          </div>
        </Reveal>

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {buildStats.map((s, i) => (
            <Reveal key={s.label} delay={i * 90} from="scale">
              <TiltCard className="glass-dark rounded-xl px-4 py-3.5 text-center" maxTilt={8}>
                <div className="font-sans text-[20px] font-bold text-cyan-glow leading-none mb-1">
                  <CountUp value={s.value} />
                </div>
                <div className="text-[8px] tracking-[0.18em] font-mono text-text-muted">{s.label}</div>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        {/* ── PIPELINE ── */}
        <Reveal from="left" className="mb-6">
          <div className="flex items-center gap-3">
            <div className="micro-label">[ 01_AGENT_PIPELINE ]</div>
            <div className="h-px flex-1 bg-cyan-glow/15" />
          </div>
        </Reveal>
        <Reveal from="scale">
        <div className="glass-dark rounded-2xl p-5 md:p-6 mb-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-glow via-cyan-glow/30 to-transparent" />
          <div className="flex flex-col md:flex-row items-stretch gap-2 md:gap-0">
            {pipelineStages.map((st, i) => (
              <div key={st.id} className="flex items-center flex-1 min-w-0">
                <div className="flex-1 glass-clear rounded-xl p-3.5 text-center min-w-0">
                  <div className="text-[10px] font-mono font-semibold tracking-[0.16em] text-cyan-glow mb-1.5">
                    {String(i + 1).padStart(2, "0")} · {st.label}
                  </div>
                  <div className="text-[10px] text-text-secondary leading-relaxed">{st.desc}</div>
                </div>
                {i < pipelineStages.length - 1 && (
                  <ChevronRight size={16} className="text-cyan-glow/40 shrink-0 mx-1 hidden md:block" strokeWidth={2} />
                )}
              </div>
            ))}
          </div>
        </div>
        </Reveal>

        {/* ── AGENT ROSTER ── */}
        <Reveal from="left" className="mb-6">
          <div className="flex items-center gap-3">
            <div className="micro-label">[ 02_AGENT_ROSTER ]</div>
            <div className="h-px flex-1 bg-cyan-glow/15" />
          </div>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {agentRoster.map((a, i) => {
            const Icon = AGENT_ICONS[a.icon] ?? Bot;
            return (
              <Reveal key={a.id} delay={i * 100} from="up">
              <TiltCard
                className="glass rounded-2xl p-5 transition-all hover:-translate-y-0.5 h-full"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${a.accent}15`, border: `1px solid ${a.accent}35` }}
                  >
                    <Icon size={16} strokeWidth={1.7} style={{ color: a.accent }} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-sans text-[13px] font-semibold text-text-primary">{a.name}</div>
                    <div className="text-[9px] font-mono tracking-[0.12em] uppercase" style={{ color: a.accent }}>
                      {a.role}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed">{a.duty}</p>
              </TiltCard>
              </Reveal>
            );
          })}
        </div>

        {/* ── OPEN STACK ── */}
        <Reveal from="left" className="mb-6">
          <div className="flex items-center gap-3">
            <div className="micro-label">[ 03_OPEN_SOURCE_STACK ]</div>
            <div className="h-px flex-1 bg-cyan-glow/15" />
          </div>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {openStack.map((s, i) => {
            const Icon = STACK_ICONS[s.icon] ?? Code2;
            return (
              <Reveal key={s.layer} delay={i * 90} from="up">
              <div className="glass-clear rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={13} className="text-cyan-glow" strokeWidth={1.7} />
                  <span className="text-[10px] tracking-[0.18em] uppercase font-semibold text-text-primary font-mono">
                    {s.layer}
                  </span>
                </div>
                <ul className="space-y-2">
                  {s.items.map((it, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-[5px] w-1 h-1 rounded-full bg-cyan-glow/60 shrink-0" />
                      <span className="text-[10.5px] text-text-secondary leading-relaxed">{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
              </Reveal>
            );
          })}
        </div>

        {/* ── CLOSING ── */}
        <Reveal from="scale">
        <div className="glass-dark rounded-2xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-glow via-cyan-glow/40 to-transparent" />
          <h3 className="font-sans text-lg font-semibold text-text-primary mb-3">{buildClosing.title}</h3>
          <p className="text-[12.5px] text-text-secondary leading-relaxed max-w-3xl">
            {buildClosing.body}
          </p>
        </div>
        </Reveal>

      </div>
    </section>
  );
}
