import { useEffect, useMemo, useState, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ArrowRight, BookOpen, Clock3, Download, Mail } from "lucide-react";
import { BackgroundFX } from "./BackgroundFX";

const CASE_STUDIES: Record<string, { file: string; label: string; summary: string }> = {
  "fmc-ansible-migration": {
    file: "fmc_ansible_migration.md",
    label: "Cisco FMC Ansible Migration",
    summary: "Idempotent, stage-safe configuration migration for enterprise ASA → FTD transformation.",
  },
  "network-automation-cutover": {
    file: "network_automation_cutover.md",
    label: "Network Automation Cutover Engine",
    summary: "A baseline → cutover → verify system that replaces manual validation with evidence-backed decisions.",
  },
  "network-topology-neo4j": {
    file: "network_topology_neo4j.md",
    label: "Network Topology → Neo4j",
    summary: "A queryable operational graph for topology exploration and change-impact analysis.",
  },
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[`*_]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function textFromChildren(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(textFromChildren).join("");
  if (children && typeof children === "object" && "props" in children) return textFromChildren((children as any).props.children);
  return "";
}

export function CaseStudyPage({ slug }: { slug: string }) {
  const study = CASE_STUDIES[slug];
  const [markdown, setMarkdown] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!study) return;
    fetch(`/docs/${study.file}`).then((r) => {
      if (!r.ok) throw new Error(`Unable to load case study (${r.status})`);
      return r.text();
    }).then(setMarkdown).catch((e) => setError(e.message));
  }, [study]);

  const headings = useMemo(() => markdown.split("\n").flatMap((line) => {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    return match ? [{ level: match[1].length, text: match[2].replace(/[`*_]/g, ""), id: slugify(match[2]) }] : [];
  }), [markdown]);

  const components: Components = {
    h1: ({ children }) => <h1>{children}</h1>,
    h2: ({ children }) => { const text = textFromChildren(children); return <h2 id={slugify(text)}>{children}</h2>; },
    h3: ({ children }) => { const text = textFromChildren(children); return <h3 id={slugify(text)}>{children}</h3>; },
    a: ({ href, children }) => <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{children}</a>,
  };

  if (!study) return <main className="doc-page"><div className="doc-error"><h1>Case study not found</h1><a href="/">Return to portfolio</a></div></main>;

  return <main className="doc-page">
    <BackgroundFX />
    <header className="subpage-header page-shell doc-header">
      <a href="/#work"><ArrowLeft size={15}/> Selected work</a>
      <span>CASE STUDY · AROSHA KALUARACHCHI</span>
    </header>
    <section className="doc-hero page-shell">
      <div className="section-kicker">[ ENGINEERING CASE STUDY ]</div>
      <h1>{study.label}</h1>
      <p>{study.summary}</p>
      <div className="doc-meta"><span><BookOpen size={14}/> Detailed technical write-up</span><span><Clock3 size={14}/> Approximately {Math.max(4, Math.round(markdown.split(/\s+/).length / 220))} min read</span></div>
    </section>
    <div className="doc-layout page-shell">
      <aside className="doc-toc">
        <div>ON THIS PAGE</div>
        <nav>{headings.map((h) => <a key={h.id} className={h.level === 3 ? "toc-sub" : ""} href={`#${h.id}`}>{h.text}</a>)}</nav>
        <a className="doc-download" href={`/docs/${study.file}`} download><Download size={14}/> Download Markdown</a>
      </aside>
      <article className="markdown-body">
        {error ? <div className="doc-error"><h2>Unable to load this case study</h2><p>{error}</p></div> : markdown ? <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{markdown}</ReactMarkdown> : <div className="doc-loading">Loading case study…</div>}
        <footer className="doc-end"><div><span>Have a similar operational challenge?</span><h2>Let’s turn it into a dependable system.</h2></div><a href="mailto:aroshak@gmail.com">Start a conversation <Mail size={15}/><ArrowRight size={15}/></a></footer>
      </article>
    </div>
  </main>;
}
