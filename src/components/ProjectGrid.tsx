import { useState } from "react";
import { ExternalLink, GitBranch, Star, FileText, Globe, Apple, Play, Store, ShieldCheck, Tag, MessageCircle, ThumbsUp, Calendar, Quote } from "lucide-react";
import data from "../data/portfolio-data.json";
import { githubRepos, githubProfile, type GitHubRepo } from "../data/github-repos";
import { liveProducts, type LiveProduct } from "../data/live-products";
import { ProjectDetailModal, type ArchiveItem } from "./ProjectDetailModal";
import { linkedinProfile, linkedinRecommendations, linkedinActivity } from "../data/linkedin-endorsements";
import { Reveal } from "./motion";

// ── Map a GitHub repo → unified ArchiveItem ──
function repoToItem(r: GitHubRepo): ArchiveItem {
  return {
    id: r.id,
    title: r.name,
    category: r.category,
    accent: r.accent,
    description: r.description,
    summary: r.summary,
    highlights: r.highlights,
    stack: r.stack,
    meta: [
      { label: "Language", value: r.language },
      { label: "License", value: r.license },
      { label: "Stars", value: String(r.stars) },
      { label: "Forks", value: String(r.forks) },
      { label: "Updated", value: r.updated },
    ],
    links: [{ label: "Open on GitHub", url: r.url }],
    source: "github",
  };
}

// ── Map an internal project (portfolio-data.json) → ArchiveItem ──
function internalToItem(p: any): ArchiveItem {
  const links: ArchiveItem["links"] = [];
  if (p.doc) links.push({ label: "Read the write-up", url: `/docs/${p.doc.split("/").pop()}`, external: false });
  if (p.link) links.push({ label: "Live site", url: p.link });
  return {
    id: p.id,
    title: p.title,
    category: p.tag || "Network Engineering",
    accent: "#4adede",
    description: p.repo ? `${p.repo} · ${p.location?.name ?? ""}` : p.location?.name ?? "",
    summary: p.summary,
    highlights: (p.summary ?? "").split(". ").filter(Boolean).map((s: string) => (s.endsWith(".") ? s : s + ".")),
    stack: p.stack || [],
    meta: [
      { label: "Location", value: p.location?.name ?? "—" },
      { label: "Branch", value: p.repo ?? "internal" },
    ],
    links,
    source: "internal",
  };
}

// ── Map a LiveProduct → unified ArchiveItem (for the detail modal) ──
function liveToItem(p: LiveProduct): ArchiveItem {
  return {
    id: p.id,
    title: p.name,
    category: p.status === "live" ? "Live Product" : "Product (offline)",
    accent: p.accent,
    description: p.tagline,
    summary: p.summary,
    highlights: p.features,
    stack: p.stack,
    meta: [
      { label: "Status", value: p.status === "live" ? "LIVE" : "OFFLINE" },
      { label: "Org", value: p.orgName },
    ],
    links: [
      { label: "Website", url: p.url },
      ...p.links.filter((l) => l.kind !== "web").map((l) => ({ label: l.label, url: l.url })),
    ],
    source: "internal",
  };
}

function LiveProductCard({ p, onOpen }: { p: LiveProduct; onOpen: () => void }) {
  const live = p.status === "live";
  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all hover:border-white/20"
      style={{ background: "linear-gradient(180deg, #0d141b 0%, #080d12 100%)", borderColor: `${p.accent}30` }}
    >
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${p.accent}, transparent)` }} />
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <span
                className={`inline-flex items-center gap-1.5 text-[9px] tracking-[0.15em] uppercase font-semibold px-2 py-0.5 rounded-full border ${
                  live ? "text-[#5ab669] border-[#5ab669]/40" : "text-text-muted border-white/15"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${live ? "bg-[#5ab669] shadow-[0_0_6px_#5ab669] animate-pulse" : "bg-text-muted"}`} />
                {live ? "LIVE" : "OFFLINE"}
              </span>
            </div>
            <h3 className="font-sans text-lg font-semibold text-text-primary">{p.name}</h3>
            <div className="text-[12px] text-text-secondary">{p.tagline}</div>
          </div>
        </div>

        {/* Org / legal */}
        <div className="text-[11px] text-text-muted font-mono mb-3 leading-relaxed">
          {p.orgName}
          <span className="block text-[10px] text-text-muted/70">{p.legal}</span>
        </div>

        {/* Description */}
        <p className="text-[12px] text-text-secondary leading-relaxed mb-4">{p.description}</p>

        {/* Features */}
        <div className="mb-4">
          <div className="text-[9px] tracking-[0.18em] uppercase text-text-muted font-semibold mb-2">What it does</div>
          <ul className="space-y-1.5">
            {p.features.slice(0, 5).map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: p.accent }} />
                <span className="text-[12px] text-text-secondary leading-snug">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Stack + compliance */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {p.stack.map((s) => (
            <span key={s} className="text-[9px] px-1.5 py-0.5 rounded border font-mono" style={{ borderColor: `${p.accent}30`, color: p.accent }}>
              {s}
            </span>
          ))}
        </div>
        {p.compliance.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {p.compliance.map((c) => (
              <span key={c} className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border border-white/10 text-text-muted font-mono">
                <ShieldCheck size={10} className="text-text-muted" strokeWidth={1.7} />
                {c}
              </span>
            ))}
          </div>
        )}

        {/* Pricing */}
        {p.pricing.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {p.pricing.map((t) => (
              <div key={t.tier} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/8 bg-white/[0.03]">
                <Tag size={10} className="text-text-muted" strokeWidth={1.7} />
                <span className="text-[10px] text-text-muted">{t.tier}</span>
                <span className="text-[10px] text-text-primary font-semibold">{t.price}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {live && (
            <a href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#5ab669]/40 text-[#5ab669] text-[10px] tracking-wider font-semibold hover:bg-[#5ab669]/10 transition-colors">
              <Globe size={12} strokeWidth={2} /> VISIT
            </a>
          )}
          {p.links.filter((l) => l.kind === "appstore").map((l) => (
            <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 text-text-secondary text-[10px] tracking-wider font-semibold hover:text-text-primary hover:bg-white/5 transition-colors">
              <Apple size={12} strokeWidth={2} /> {l.label.toUpperCase()}
            </a>
          ))}
          {p.links.filter((l) => l.kind === "playstore").map((l) => (
            <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 text-text-secondary text-[10px] tracking-wider font-semibold hover:text-text-primary hover:bg-white/5 transition-colors">
              <Play size={12} strokeWidth={2} /> {l.label.toUpperCase()}
            </a>
          ))}
          <button onClick={onOpen} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-glow/30 text-cyan-glow text-[10px] tracking-wider font-semibold hover:bg-cyan-glow/10 transition-colors">
            <FileText size={12} strokeWidth={2} /> DOSSIER
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({ item, onOpen }: { item: ArchiveItem; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="text-left glass rounded-xl p-5 transition-all hover:border-cyan-glow/40 hover:-translate-y-0.5 group"
    >
      <div className="flex items-start justify-between mb-2">
        <span
          className="text-[8px] tracking-[0.15em] uppercase font-semibold px-2 py-0.5 rounded-full border"
          style={{ borderColor: `${item.accent}40`, color: item.accent }}
        >
          {item.category}
        </span>
        {item.source === "github" && <GitBranch size={14} className="text-text-muted group-hover:text-cyan-glow transition-colors" strokeWidth={1.7} />}
      </div>

      <h3 className="font-sans text-sm font-semibold text-text-primary mb-2 group-hover:text-cyan-glow transition-colors">
        {item.title}
      </h3>
      <p className="text-[11px] text-text-secondary leading-relaxed mb-3 line-clamp-3">
        {item.description}
      </p>

      {item.stack.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {item.stack.slice(0, 4).map((s) => (
            <span key={s} className="text-[8px] px-1.5 py-0.5 rounded border border-white/10 text-text-muted font-mono">
              {s}
            </span>
          ))}
          {item.stack.length > 4 && <span className="text-[8px] text-text-muted font-mono self-center">+{item.stack.length - 4}</span>}
        </div>
      )}

      <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-[9px] text-text-muted font-mono">
        <span className="text-cyan-glow tracking-wider font-semibold">▶ OPEN</span>
        {item.source === "github" && (
          <span className="ml-auto flex items-center gap-1">
            <Star size={10} /> {item.meta.find((m) => m.label === "Stars")?.value ?? 0}
          </span>
        )}
      </div>
    </button>
  );
}

export function ProjectGrid() {
  const [selected, setSelected] = useState<ArchiveItem | null>(null);
  const ghItems = githubRepos.map(repoToItem);
  const internalItems = (data.projects as any[])
    .filter((p) => p.id !== "roong") // roong is now shown under Live Products (offline)
    .map(internalToItem);
  const featuredGh = githubRepos.filter((r) => r.featured);
  const restGh = githubRepos.filter((r) => !r.featured);

  return (
    <section id="projects" className="relative min-h-screen w-full px-6 py-20 md:px-12">
      <div className="mx-auto max-w-6xl">
        {/* ── Archive intro ── */}
        <Reveal from="up" className="mb-10">
          <div className="micro-label mb-1">[ PROJECT_ARCHIVE ]</div>
          <h2 className="font-sans text-2xl font-semibold text-text-primary mb-2">
            Interactive Career Archive
          </h2>
          <p className="text-xs text-text-secondary max-w-2xl leading-relaxed">
            Every system I've designed, built and shipped — from datacentre migration
            automation to AI products and public open-source tooling. Click any card to
            open its full dossier.
          </p>
        </Reveal>

        {/* ── GitHub profile banner ── */}
        <Reveal from="up" delay={100}>
        <a
          href={githubProfile.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block glass rounded-2xl p-5 mb-10 hover:border-cyan-glow/40 transition-all"
        >
          <div className="flex items-center gap-4">
            <img
              src={githubProfile.avatar}
              alt={githubProfile.login}
              className="w-14 h-14 rounded-full border border-white/15"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-sans text-base font-semibold text-text-primary">@{githubProfile.login}</span>
                <span className="text-[10px] text-text-muted font-mono">· joined {githubProfile.joined}</span>
              </div>
              <div className="text-[11px] text-text-secondary font-mono mt-0.5">
                {githubProfile.publicRepos} public repositories
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-cyan-glow font-semibold tracking-wider">
              GITHUB <ExternalLink size={13} strokeWidth={2} />
            </div>
          </div>
        </a>
        </Reveal>

        {/* ── Live products & organisations ── */}
        <Reveal from="left" className="mb-6">
        <div className="flex items-center gap-3">
          <div className="micro-label">[ 01_LIVE_PRODUCTS ]</div>
          <div className="h-px flex-1 bg-cyan-glow/15" />
          <Store size={14} className="text-text-muted" />
        </div>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2 mb-10">
          {liveProducts.map((p, i) => (
            <Reveal key={p.id} delay={i * 120} from="up">
              <LiveProductCard p={p} onOpen={() => setSelected(liveToItem(p))} />
            </Reveal>
          ))}
        </div>

        {/* ── Public GitHub repositories ── */}
        <Reveal from="left" className="mb-6">
          <div className="flex items-center gap-3">
            <div className="micro-label">[ 02_PUBLIC_REPOSITORIES ]</div>
            <div className="h-px flex-1 bg-cyan-glow/15" />
            <GitBranch size={14} className="text-text-muted" />
          </div>
        </Reveal>

        {featuredGh.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            {featuredGh.map((r, i) => (
              <Reveal key={r.id} delay={i * 100} from="up">
                <Card item={repoToItem(r)} onOpen={() => setSelected(repoToItem(r))} />
              </Reveal>
            ))}
          </div>
        )}
        {restGh.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3 mb-10">
            {restGh.map((r, i) => (
              <Reveal key={r.id} delay={(i % 3) * 100} from="up">
                <Card item={repoToItem(r)} onOpen={() => setSelected(repoToItem(r))} />
              </Reveal>
            ))}
          </div>
        )}

        {/* ── Internal / professional projects ── */}
        <Reveal from="left" className="mb-6">
          <div className="flex items-center gap-3">
            <div className="micro-label">[ 03_PROFESSIONAL_PROJECTS ]</div>
            <div className="h-px flex-1 bg-cyan-glow/15" />
            <Globe size={14} className="text-text-muted" />
          </div>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2">
          {internalItems.map((item, i) => (
            <Reveal key={item.id} delay={i * 110} from="up">
              <Card item={item} onOpen={() => setSelected(item)} />
            </Reveal>
          ))}
        </div>

        {/* ── Contact / uplink ── */}
        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="micro-label mb-3">[ 04_UPLINK ]</div>
          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:${data.person.email}`}
              className="pill border border-cyan-glow/30 text-text-primary hover:border-cyan-glow hover:text-cyan-glow"
            >
              {data.person.email}
            </a>
            <a
              href="/docs/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="pill border border-cyan-glow/30 text-text-primary hover:border-cyan-glow hover:text-cyan-glow"
            >
              RESUME (PDF)
            </a>
            <a
              href={githubProfile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="pill border border-cyan-glow/30 text-text-primary hover:border-cyan-glow hover:text-cyan-glow"
            >
              GITHUB / {githubProfile.login}
            </a>
            <a
              href={linkedinProfile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="pill border border-cyan-glow/30 text-text-primary hover:border-cyan-glow hover:text-cyan-glow"
            >
              LINKEDIN / {linkedinProfile.name.split(" ")[0].toUpperCase()}
            </a>
            {data.person.links.site && (
              <a
                href={data.person.links.site}
                target="_blank"
                rel="noopener noreferrer"
                className="pill border border-cyan-glow/30 text-text-primary hover:border-cyan-glow hover:text-cyan-glow"
              >
                CAREPILOT.AU
              </a>
            )}
          </div>
        </div>

        {/* ── LinkedIn Profile & Endorsements ── */}
        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="micro-label">[ 05_LINKEDIN_VALIDATION ]</div>
            <div className="h-px flex-1 bg-cyan-glow/15" />
            <MessageCircle size={14} className="text-text-muted" />
          </div>

          {/* LinkedIn profile summary */}
          <div className="glass rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-mono text-lg font-bold"
                style={{ background: "#0077B5", color: "#fff" }}
              >
                AK
              </div>
              <div>
                <div className="font-sans text-sm font-semibold text-text-primary">{linkedinProfile.name}</div>
                <div className="text-[11px] text-text-secondary">{linkedinProfile.headline}</div>
                <div className="text-[10px] text-text-muted font-mono">{linkedinProfile.location}</div>
              </div>
              <a
                href={linkedinProfile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#0077B5]/40 text-[#0077B5] text-[10px] tracking-wider font-semibold hover:bg-[#0077B5]/10 transition-colors"
              >
                VIEW PROFILE <ExternalLink size={11} strokeWidth={2} />
              </a>
            </div>
            <p className="text-[12px] text-text-secondary leading-relaxed mb-3">
              {linkedinProfile.summary}
            </p>
            {/* Top Skills */}
            <div className="flex flex-wrap gap-1.5">
              {linkedinProfile.topSkills.map((s) => (
                <span
                  key={s}
                  className="text-[9px] px-2 py-0.5 rounded-full border border-[#0077B5]/30 text-[#0077B5] font-mono"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {linkedinRecommendations.length > 0 && (
            <div className="mb-6">
              <div className="text-[9px] tracking-[0.18em] uppercase text-text-muted font-semibold mb-3 flex items-center gap-2">
                <Quote size={12} className="text-cyan-glow" /> RECOMMENDATIONS
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {linkedinRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="glass rounded-xl p-4 border-l-2"
                    style={{ borderLeftColor: "#0077B5" }}
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold font-mono"
                        style={{ background: "#0077B5", color: "#fff" }}
                      >
                        {rec.avatar || rec.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-text-primary">{rec.name}</div>
                        <div className="text-[9px] text-text-muted">{rec.headline}</div>
                      </div>
                      <span className="ml-auto text-[9px] text-text-muted font-mono">{rec.date}</span>
                    </div>
                    <p className="text-[12px] text-text-secondary leading-relaxed italic">
                      "{rec.text}"
                    </p>
                    <div className="mt-2 text-[9px] text-text-muted font-mono">
                      {rec.relationship}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {linkedinActivity.length > 0 && (
            <div>
              <div className="text-[9px] tracking-[0.18em] uppercase text-text-muted font-semibold mb-3 flex items-center gap-2">
                <Calendar size={12} className="text-cyan-glow" /> RECENT ACTIVITY
              </div>
              <div className="space-y-2">
                {linkedinActivity.map((act) => (
                  <a
                    key={act.id}
                    href={act.link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block glass rounded-xl p-3 hover:border-cyan-glow/40 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[8px] tracking-[0.12em] uppercase font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          color: act.type === "post" ? "#4adede" : "#ffb84d",
                          background:
                            act.type === "post"
                              ? "rgba(74,222,222,0.12)"
                              : "rgba(255,184,77,0.12)",
                        }}
                      >
                        {act.type}
                      </span>
                      <span className="text-[9px] text-text-muted font-mono">{act.date}</span>
                      {act.engagement && (
                        <span className="ml-auto flex items-center gap-1 text-[9px] text-text-muted font-mono">
                          <ThumbsUp size={10} /> {act.engagement.likes}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-secondary leading-relaxed">{act.text}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 text-center">
            <a
              href={linkedinProfile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-cyan-glow font-mono tracking-wider hover:underline"
            >
              [ VIEW FULL LINKEDIN PROFILE → ]
            </a>
          </div>
        </div>

        <div className="mt-10 text-center text-[8px] text-text-muted font-mono">
          {data.person.name.toUpperCase().replace(" ", "_")} // SPACE_OPERATIONS // ARCHIVE v0.4
        </div>
      </div>

      {/* ── Detail modal (opens up on card click) ── */}
      <ProjectDetailModal item={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
