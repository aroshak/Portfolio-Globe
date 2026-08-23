// ── Forward Deployment positioning — what Arosha delivers to companies ──
// Marketing copy for the "What I Deliver" section, engineered for
// Forward Deployment Engineer roles (agentic workflows + automation).

export interface Capability {
  id: string;
  icon: string; // lucide icon key
  title: string;
  pitch: string; // one-line hook
  details: string[]; // 3 proof bullets
  accent: string;
}

export const servicesHeadline = {
  eyebrow: "FORWARD DEPLOYMENT // AGENTIC AUTOMATION",
  title: "I embed with your team, find the manual work, and replace it with autonomous agents.",
  pitch:
    "Most companies have hundreds of processes that still run on human keystrokes — runbooks, migrations, reports, customer responses. I turn those into production-grade agentic workflows: LLM agents that connect to your real systems, execute the work, verify the result, and leave an evidence trail. I've spent 15 years inside enterprise infrastructure, and the last 3 years teaching AI agents to operate it.",
  hook: "You don't hire me to consult. You hire me to ship.",
};

export const capabilities: Capability[] = [
  {
    id: "agentic-workflows",
    icon: "bot",
    title: "Agentic Workflow Engineering",
    pitch: "Your business processes, rebuilt as autonomous agent pipelines.",
    details: [
      "Design and build multi-step agent systems with LangGraph, RAG, and vector search",
      "Agents that plan, execute tool calls, self-verify, and escalate when needed",
      "Shipped 5+ AI products this way — ROONG e-commerce, CarePilot clinical notes, LockForms",
    ],
    accent: "#b78cff",
  },
  {
    id: "mcp-integration",
    icon: "plug",
    title: "MCP & System Integration",
    pitch: "I give AI agents safe, typed access to your real infrastructure.",
    details: [
      "Built cisco-ssh-mcp — an MCP server letting AI agents SSH into live Cisco devices",
      "Tool interfaces over SSH, REST APIs, databases, and legacy CLIs",
      "The bridge layer most AI teams can't build: agents that touch production safely",
    ],
    accent: "#4adede",
  },
  {
    id: "automation-at-scale",
    icon: "zap",
    title: "Operations Automation",
    pitch: "Manual runbooks replaced with idempotent, evidence-backed pipelines.",
    details: [
      "Automated 34+ manual runbooks across a 40-device estate — zero lost changes",
      "23 Ansible playbooks + 14 Python utilities for firewall migration at scale",
      "Dockerised cutover engines: baseline → change → verify, with diff reports",
    ],
    accent: "#5ab669",
  },
  {
    id: "rapid-deployment",
    icon: "rocket",
    title: "Rapid Field Deployment",
    pitch: "From customer problem to production app in weeks, not quarters.",
    details: [
      "Single-handedly architected & shipped ROONG — a revenue-generating AI supermarket",
      "CarePilot: voice → clinical SOAP notes, live on App Store & Google Play",
      "Full-stack delivery: Next.js, Supabase, GCP Cloud Run, CI/CD — no hand-offs needed",
    ],
    accent: "#ffb84d",
  },
];

export interface FdeSkill {
  category: string;
  icon: string;
  skills: string[];
}

export const fdeSkills: FdeSkill[] = [
  {
    category: "Customer Discovery",
    icon: "users",
    skills: [
      "Translate messy customer problems into buildable specs",
      "15 years of consultative roles — banking, healthcare, energy, government",
      "Technical sales background — I speak both engineer and executive",
    ],
  },
  {
    category: "Build & Ship",
    icon: "hammer",
    skills: [
      "Full-stack TypeScript / Python / infrastructure",
      "Prototype → production with CI/CD on GCP, AWS, Azure",
      "Docker-first reproducible delivery",
    ],
  },
  {
    category: "AI Engineering",
    icon: "brain",
    skills: [
      "LLM orchestration: LangGraph, OpenAI, Anthropic, MCP",
      "RAG pipelines with Pinecone & Supabase Vector",
      "Local inference: multi-GPU clusters, vLLM, open-weights",
    ],
  },
  {
    category: "Enterprise Reality",
    icon: "shield",
    skills: [
      "Regulated environments: banking (RBS/NATWEST), healthcare (NDIS), utilities",
      "Security posture: no plaintext credentials, audit trails, rollback-first",
      "Multi-cloud: GCP, AWS, Azure datacentre operations",
    ],
  },
];

export const proofMetrics = [
  { value: "15+", label: "YEARS ENTERPRISE INFRA" },
  { value: "34+", label: "RUNBOOKS AUTOMATED" },
  { value: "5+", label: "AI PRODUCTS SHIPPED" },
  { value: "3", label: "AUTOMATION TOOLCHAINS" },
];

export const closingPitch = {
  title: "The FDE profile, proven in production",
  body:
    "Forward Deployment needs people who can walk into a customer's environment, understand the work, and build the automation that does it — in production, under real constraints. That's not a role I'm applying for. That's the last three years of my career: enterprise networks automated with Ansible and pyATS, then AI agents wired into them with MCP, then entire products shipped on top. Give me a workflow that still needs a human in the loop, and I'll build the agent that earns its place there.",
  cta: "LET'S TALK ABOUT WHAT I CAN AUTOMATE FOR YOU",
};
