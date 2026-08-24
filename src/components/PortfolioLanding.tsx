import {
  ArrowRight, Bot, Boxes, CloudCog, Code2, Download,
  ExternalLink, Globe, MessageCircle, Network, ShieldCheck, Sparkles,
} from "lucide-react";
import data from "../data/portfolio-data.json";
import { Reveal } from "./motion";
import { GitRepoScroller } from "./GitRepoScroller";
import { githubProfile } from "../data/github-repos";
import { TechStack3D } from "./TechStack3D";
import { CapabilityShowcase3D, SelectedSystems3D } from "./CapabilitySystems3D";

const capabilities = [
  {
    icon: Bot,
    title: "Ship AI-enabled software faster",
    body: "I design agentic workflows, RAG systems and production applications—not demos disconnected from real operations.",
    proof: "LangGraph · MCP · OpenAI/Anthropic · Next.js · Supabase",
  },
  {
    icon: CloudCog,
    title: "Turn infrastructure into software",
    body: "I translate repetitive operational work into reviewed, repeatable pipelines using Python, Ansible, Terraform and CI/CD.",
    proof: "IaC · GitHub Actions · Docker · API integrations",
  },
  {
    icon: Network,
    title: "Modernise networks safely",
    body: "I bring production judgement from ISP, banking, government and multi-cloud environments to automation-led change.",
    proof: "Cisco · FTD/FMC · BGP/MPLS · SD-WAN · multi-cloud",
  },
  {
    icon: ShieldCheck,
    title: "Build safety into delivery",
    body: "Baseline, diff, rollback, idempotency and human review boundaries are designed into the system from the start.",
    proof: "Evidence trails · staged rollout · fail-loud controls",
  },
];

const cases = [
  {
    n: "01",
    title: "Cisco FMC migration as a repeatable system",
    context: "ASA → FTD transformation across enterprise data centres",
    outcome: "Replaced fragile, device-specific migration work with idempotent, stage-safe automation that resolves configuration by name across differing FMC environments.",
    proof: ["23 migration playbooks", "14 Python utilities", "6 reusable roles", "Swagger/OAS3 API maps"],
    stack: "Ansible · Python · Cisco FMC/FTD · Docker · OpenAPI",
    href: "/case-studies/fmc-ansible-migration",
  },
  {
    n: "02",
    title: "Cutovers driven by evidence, not guesswork",
    context: "Production firewall migration across M1, M2, SY3 and Azure",
    outcome: "Converted roughly 34 manual runbooks into a baseline → cutover → verify engine with timestamped evidence, structured diffs and meaningful pass/fail signals.",
    proof: ["~34 runbooks automated", "Multi-device collection", "HTML + text diffs", "Semantic exit codes"],
    stack: "pyATS/Genie · Netmiko · Paramiko · Ansible · Docker",
    href: "/case-studies/network-automation-cutover",
  },
  {
    n: "03",
    title: "A live network estate made queryable",
    context: "Topology and blast-radius analysis across ~40 devices",
    outcome: "Built an inventory-driven collector that turns interfaces, IPs, VRFs, VLANs and CDP adjacencies into an idempotent Neo4j operational graph.",
    proof: ["~40-device estate", "Queryable impact paths", "Idempotent ingestion", "Raw-output evidence"],
    stack: "Neo4j · Cypher · Python · Ansible · CDP",
    href: "/case-studies/network-topology-neo4j",
  },
];

const career = [
  ["2006", "Telecom foundations", "Radio, transmission and access networks in Colombo"],
  ["2010", "Regulated enterprise", "RBS/NatWest banking networks in London"],
  ["2012", "National ISP engineering", "BGP, MPLS and enterprise services at Exetel"],
  ["2017", "Scale and modernisation", "Telstra planning; 10+ PoPs and 200+ branch SD-WAN"],
  ["2022", "Multi-vendor consulting", "Juniper, Fortinet, Palo Alto, F5 and NSX-T"],
  ["2023+", "Automation and AI", "Enterprise infrastructure, IaC, agentic systems and products"],
];

const links = data.person.links;

export function PortfolioLanding() {
  return (
    <>
      <nav id="portfolio-start" className="portfolio-nav" aria-label="Portfolio navigation">
        <a href="#top" className="nav-brand"><img src={githubProfile.avatar} alt="Arosha Kaluarachchi"/><strong>Arosha Kaluarachchi</strong></a>
        <div className="nav-links">
          <a href="#work">Work</a><a href="#career">Career</a><a href="/build">About this build</a>
          <a href={links.github} target="_blank" rel="noreferrer">GitHub</a>
          <a href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a className="nav-cta" href="mailto:aroshak@gmail.com">Start a conversation</a>
        </div>
      </nav>

      <GitRepoScroller />

      <section className="portfolio-intro page-shell">
        <Reveal from="up">
          <div className="section-kicker">[ WHAT I BRING ]</div>
          <div className="intro-grid">
            <h1>Infrastructure depth.<br /><span>AI delivery speed.</span></h1>
            <div className="intro-copy">
              <p className="lead">I help organisations ship useful AI-enabled software and automate the infrastructure beneath it—without losing the operational discipline production systems demand.</p>
              <p>My work connects 15+ years in enterprise networking with agentic development, Infrastructure as Code, network automation and full-stack product delivery.</p>
              <div className="cta-row">
                <a className="button-primary" href="#work">Explore the work <ArrowRight size={16} /></a>
                <a className="button-secondary" href="/docs/resume.pdf" target="_blank">Résumé <Download size={15} /></a>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="evidence-strip">
          {[['15+', 'years across production networks'], ['34', 'manual runbooks automated'], ['40', 'devices modelled as a graph'], ['5+', 'AI applications built']].map(([v,l]) => <div key={l}><strong>{v}</strong><span>{l}</span></div>)}
        </div>
      </section>

      <TechStack3D />

      <CapabilityShowcase3D capabilities={capabilities} />

      <SelectedSystems3D cases={cases} />

      <section id="career" className="page-shell section-block">
        <Reveal from="up"><div className="section-heading"><div><div className="section-kicker">[ CAREER FOUNDATION ]</div><h2>Built across industries,<br />countries and layers.</h2></div><p>From radio and ISP backbones to banking, national infrastructure, multi-cloud platforms and AI products.</p></div></Reveal>
        <div className="career-track">{career.map(([year,title,desc])=><div key={year+title}><strong>{year}</strong><span><b>{title}</b>{desc}</span></div>)}</div>
        <a className="text-link" href="/docs/resume.pdf" target="_blank">View the complete résumé <ArrowRight size={14}/></a>
      </section>

      <section className="page-shell section-block">
        <div className="section-heading"><div><div className="section-kicker">[ PRODUCTS & PUBLIC WORK ]</div><h2>Building beyond<br />the infrastructure layer.</h2></div><p>Agentic products, open-source engineering and ideas shared with the wider technical community.</p></div>
        <div className="product-grid">
          <article className="feature-product"><Sparkles/><span>LIVE AI PRODUCT</span><h3>CarePilot</h3><p>An AI mobile companion that turns voice, photos and text into structured SOAP progress notes for NDIS specialists—with on-device PII scrubbing and goal-alignment checks.</p><a href="https://carepilot.au" target="_blank" rel="noreferrer">Visit carepilot.au <ExternalLink size={14}/></a></article>
          <article className="feature-product"><Code2/><span>OPEN ENGINEERING</span><h3>GitHub portfolio</h3><p>Automation tooling, AI experiments and production-oriented software work.</p><a href={links.github} target="_blank" rel="noreferrer">github.com/aroshak <Globe size={14}/></a></article>
        </div>
        <div className="linkedin-embeds">
          <article><div className="embed-label"><MessageCircle size={16}/> Network automation in practice</div><iframe src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7369235204445569024?collapsed=1" title="Arosha Kaluarachchi LinkedIn post about network automation" loading="lazy" allowFullScreen /></article>
          <article><div className="embed-label"><MessageCircle size={16}/> Tech, innovation and LLMs</div><iframe src="https://www.linkedin.com/embed/feed/update/urn:li:activity:7368970274785955840?collapsed=1" title="Arosha Kaluarachchi LinkedIn post about technology, innovation and LLMs" loading="lazy" allowFullScreen /></article>
        </div>
      </section>

      <section className="contact-section page-shell">
        <div><div className="section-kicker">[ LET'S BUILD SOMETHING USEFUL ]</div><h2>Bring me the operational problem.</h2><p>I can help turn it into software, automation or an agent-enabled system your team can operate with confidence.</p></div>
        <div className="contact-links"><a className="button-primary" href="mailto:aroshak@gmail.com">Start a conversation <ArrowRight size={16}/></a><a href={links.linkedin} target="_blank" rel="noreferrer"><MessageCircle size={16}/> LinkedIn</a><a href={links.github} target="_blank" rel="noreferrer"><Globe size={16}/> GitHub</a></div>
      </section>
      <footer className="page-shell portfolio-footer"><span>© {new Date().getFullYear()} Arosha Kaluarachchi · Melbourne, Australia</span><a href="/build"><Boxes size={14}/> How this portfolio was built</a></footer>
    </>
  );
}
