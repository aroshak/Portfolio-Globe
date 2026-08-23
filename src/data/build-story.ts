// ── Behind the Build — how this site was made ──
// Multi-agent workflow + open-source models. This section is the FDE proof:
// the portfolio about agentic automation was built by agentic automation.

export interface AgentRole {
  id: string;
  name: string;
  icon: string; // lucide key
  role: string;
  duty: string;
  accent: string;
}

export interface StackItem {
  layer: string;
  icon: string;
  items: string[];
}

export const buildHeadline = {
  eyebrow: "BUILD_PROVENANCE // META",
  title: "This site is the demo — a multi-agent workflow built it, running on open-source models.",
  pitch:
    "No dev agency, no closed-API lock-in. One human directing intent; an orchestrated swarm of specialised AI agents doing the research, implementation, and review; and open-weight models providing the reasoning — the same architecture I deploy for companies. Every commit on this site came out of that pipeline.",
  hook: "The portfolio about agentic automation was built by agentic automation.",
};

export const pipelineStages = [
  { id: "intent", label: "INTENT", desc: "Human describes the outcome in plain language" },
  { id: "plan", label: "PLAN", desc: "Lead agent maps the repo via its knowledge graph" },
  { id: "fanout", label: "FAN-OUT", desc: "Subagents run in parallel — scout, research, build" },
  { id: "verify", label: "VERIFY", desc: "Typecheck · build · Playwright smoke tests · fresh-eyes review" },
  { id: "ship", label: "SHIP", desc: "Production bundle · knowledge graph updated for next session" },
];

export const agentRoster: AgentRole[] = [
  {
    id: "lead",
    name: "Lead Agent",
    icon: "orchestrator",
    role: "Orchestrator & Integrator",
    duty: "Owns the working tree, writes the integration code, coordinates every other agent, and merges the result.",
    accent: "#4adede",
  },
  {
    id: "scout",
    name: "Scout",
    icon: "scan",
    role: "Repository Recon",
    duty: "Walks the codebase through the graphify knowledge graph — architecture, dependencies, call flows — so nobody builds blind.",
    accent: "#5ab669",
  },
  {
    id: "researcher",
    name: "Researcher",
    icon: "globe",
    role: "External Intelligence",
    duty: "Pulls live data from the real world: LinkedIn validation, API docs, submarine-cable datasets, threat feeds, TLE catalogs.",
    accent: "#ffb84d",
  },
  {
    id: "worker",
    name: "Worker",
    icon: "hammer",
    role: "Parallel Implementation",
    duty: "Executes isolated build lanes in managed worktrees — components, data pipelines, tests — handed back as reviewable artifacts.",
    accent: "#b78cff",
  },
  {
    id: "reviewer",
    name: "Reviewer",
    icon: "eye",
    role: "Independent Critique",
    duty: "Fresh-context agent with no memory of the build — catches what the builders are too close to see before anything merges.",
    accent: "#ff4d9d",
  },
  {
    id: "oracle",
    name: "Oracle",
    icon: "brain",
    role: "Architecture Counsel",
    duty: "Consulted on hard unknowns — three.js instancing traps, API design calls — before expensive mistakes get made.",
    accent: "#8aa0b0",
  },
];

export const openStack: StackItem[] = [
  {
    layer: "Reasoning",
    icon: "cpu",
    items: [
      "Open-weight models via OpenRouter — Qwen & Gemma class, no closed-API lock-in",
      "Local inference on the author's own multi-GPU node",
      "Cost: pennies per task instead of enterprise API bills",
    ],
  },
  {
    layer: "Agent Runtime",
    icon: "bot",
    items: [
      "pi coding agent + herdr runtime — open source",
      "pi-subagents: scout / researcher / worker / reviewer / oracle roles",
      "graphify knowledge graph — repo context that survives across sessions",
    ],
  },
  {
    layer: "The Site Itself",
    icon: "code",
    items: [
      "React 18 · TypeScript · Vite · Tailwind v4",
      "react-globe.gl + three.js for the globe",
      "Playwright for smoke tests — every change verified",
    ],
  },
  {
    layer: "Open Data Sources",
    icon: "database",
    items: [
      "TeleGeography submarine cables · Feodo Tracker threat feed",
      "Satlas marine infrastructure · CelesTrak TLEs",
      "Wikimedia Commons · Google Places",
    ],
  },
];

export const buildStats = [
  { value: "6", label: "AGENT ROLES" },
  { value: "100%", label: "OPEN-WEIGHT REASONING" },
  { value: "1", label: "HUMAN DIRECTING INTENT" },
  { value: "0", label: "CLOSED-API LOCK-IN" },
];

export const buildClosing = {
  title: "Why this matters",
  body:
    "Anyone can demo an agent on a toy task. The hard part — the part companies pay for — is orchestration that survives contact with a real codebase: context management, parallel work lanes, independent review, verification gates, and models you can run yourself. This site was the stress test for exactly that pipeline. If you want the same capability pointed at your workflows, that's the conversation to have.",
};
