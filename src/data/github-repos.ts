// Arosha's public GitHub repositories — enriched with hand-written summaries
// derived from each repo's README, package.json and source tree (fetched via
// the GitHub API, Aug 2026). Used by the "Project Archive" section.

export interface GitHubRepo {
  id: string;
  name: string;
  url: string;
  description: string;
  summary: string;
  highlights: string[];
  usage?: string[];
  stack: string[];
  language: string;
  stars: number;
  forks: number;
  license: string;
  created: string;
  updated: string;
  category: string;
  accent: string;
  featured?: boolean;
}

export interface GitHubProfile {
  login: string;
  url: string;
  avatar: string;
  name: string;
  publicRepos: number;
  followers: number;
  following: number;
  joined: string;
}

export const githubProfile: GitHubProfile = {
  login: "aroshak",
  url: "https://github.com/aroshak",
  avatar: "https://avatars.githubusercontent.com/u/58761606?v=4",
  name: "Arosha Kaluarachchi",
  publicRepos: 6,
  followers: 0,
  following: 1,
  joined: "Dec 2019",
};

export const githubRepos: GitHubRepo[] = [
  {
    id: "portfolio-globe",
    name: "Portfolio-Globe",
    url: "https://github.com/aroshak/Portfolio-Globe",
    description: "Reusable interactive portfolio with a Three.js career globe and GitHub project explorer",
    summary:
      "An open, reusable engineering portfolio built with React, TypeScript and Three.js. It maps education and career history onto an interactive globe, presents GitHub repositories in a 3D carousel, renders Markdown engineering case studies as readable pages, and includes a detailed guide so other professionals can adapt the system for their own career.",
    highlights: [
      "Interactive globe for education, experience, certifications and infrastructure layers",
      "Dynamic GitHub repository discovery with curated project enrichment and cached fallback",
      "3D repository carousel with detailed project and usage panels",
      "Markdown case-study reader with responsive typography and generated navigation",
      "Comprehensive reuse guide covering content, privacy, deployment and customisation",
    ],
    usage: [
      "Clone the repository and run `npm install`.",
      "Update identity, education, experience and certification data in `src/data/portfolio-data.json`.",
      "Update the GitHub profile and optional curated repository descriptions in `src/data/github-repos.ts`.",
      "Run `npm run dev`, then follow the README before building and publishing your version.",
    ],
    stack: ["React", "TypeScript", "Three.js", "Vite", "Tailwind CSS"],
    language: "TypeScript",
    stars: 0,
    forks: 0,
    license: "Repository terms",
    created: "Aug 2026",
    updated: "Aug 2026",
    category: "Open Portfolio System",
    accent: "#4adede",
    featured: true,
  },
  {
    id: "cisco-ssh-mcp",
    name: "cisco-ssh-mcp",
    url: "https://github.com/aroshak/cisco-ssh-mcp",
    description: "MCP server for SSH connections to Cisco network devices",
    summary:
      "A Model Context Protocol (MCP) server that gives an AI agent (Cline, Claude, etc.) a set of tools to SSH into Cisco routers and switches — the bridge between my two worlds: enterprise networking and AI. An LLM can connect, run commands, enter config mode, apply changes and parse show output on real infrastructure, all through a typed tool interface.",
    highlights: [
      "6 MCP tools: cisco_connect, cisco_exec, cisco_config, cisco_show, cisco_send_raw, cisco_list_connections",
      "Multiple concurrent SSH sessions to different devices at once",
      "Config-mode support with optional save, plus structured show-command parsing",
      "Password and private-key auth, per-connection IDs and timeouts",
      "Built on @modelcontextprotocol/sdk + ssh2 + commander, MIT-licensed",
    ],
    usage: ["Clone the repository and install the Node.js dependencies.", "Configure Cisco device credentials using the documented environment settings.", "Start the MCP server and register it with an MCP-compatible client such as Claude or Cline.", "Ask the connected agent to inspect devices or run explicitly reviewed commands."],
    stack: ["TypeScript", "MCP SDK", "ssh2", "Node.js", "Commander"],
    language: "TypeScript",
    stars: 3,
    forks: 1,
    license: "MIT",
    created: "Jun 2025",
    updated: "Apr 2026",
    category: "AI × Networking",
    accent: "#4adede",
    featured: true,
  },
  {
    id: "lockforms",
    name: "LockForms",
    url: "https://github.com/aroshak/Lockforms",
    description: "Secure, self-hostable form builder — Typeform beauty, localhost security",
    summary:
      "A full-stack form builder that clones Typeform's one-question-at-a-time experience but runs entirely on your own infrastructure. Ships in two modes: SaaS (multi-tenant) and Appliance (on-premises Docker, air-gapped, with RSA license enforcement). This is my largest single codebase — ~357 KB of TypeScript.",
    highlights: [
      "Drag-and-drop builder (@dnd-kit) with 14+ question types incl. signature, file upload, rating",
      "Conditional logic jumps, 4 transition styles, 7 themes, keyboard shortcuts",
      "Typeform-style renderer with Framer Motion animations, password-protected forms",
      "JWT sessions, bcrypt hashing, strict CSP, DOMPurify, RSA license signing for appliance mode",
      "Next.js 14 + Prisma + PostgreSQL + Docker, with Playwright test suite",
    ],
    usage: ["Choose the SaaS or self-hosted appliance deployment mode.", "Configure PostgreSQL and the required environment variables.", "Run the Next.js application directly or deploy the Docker-based appliance.", "Create a form, publish it and share the generated response URL."],
    stack: ["Next.js 14", "TypeScript", "Prisma", "PostgreSQL", "Docker", "Framer Motion", "dnd-kit"],
    language: "TypeScript",
    stars: 0,
    forks: 0,
    license: "Private",
    created: "Mar 2026",
    updated: "Mar 2026",
    category: "Full-Stack Product",
    accent: "#5ab669",
    featured: true,
  },
  {
    id: "agentic-dev-env",
    name: "Agentic_Dev_env",
    url: "https://github.com/aroshak/Agentic_Dev_env",
    description: "Portable agentic dev environment — one API key, one script, any workload",
    summary:
      "Infrastructure-as-code that recreates a complete AI-agent development environment on any machine. One OpenRouter API key + one idempotent setup.sh script provisions the pi coding agent, subagents (scout/researcher/worker/reviewer/oracle), web access, knowledge-graph tooling and skills — everything pinned to cheap open-weights models.",
    highlights: [
      "Single-command setup: cp .env.example .env → ./setup.sh → pi",
      "Composes herdr (runtime), pi-subagents, pi-web-access, graphify knowledge graphs",
      "Three.js + web-browse skills, graphifyy CLI via uv",
      "Idempotent setup — safe to re-run on WSL/macOS/Linux",
    ],
    usage: ["Copy `.env.example` to `.env` and add an OpenRouter API key.", "Run `./setup.sh` on WSL, macOS or Linux.", "Launch `pi` to use the provisioned agent environment.", "Re-run the setup safely whenever configuration needs to be reconciled."],
    stack: ["Shell", "IaC", "OpenRouter", "Node.js", "graphify", "uv"],
    language: "Shell",
    stars: 0,
    forks: 0,
    license: "n/a",
    created: "Aug 2026",
    updated: "Aug 2026",
    category: "AI Tooling",
    accent: "#ffb84d",
  },
  {
    id: "terraformlab",
    name: "TerraformLab",
    url: "https://github.com/aroshak/TerraformLab",
    description: "Terraform and IaC — Azure resource provisioning lab",
    summary:
      "A Terraform lab for provisioning Azure infrastructure declaratively. main.tf builds a resource group, virtual network, subnet and public IP in Australia East using the hashicorp/azurerm provider — the building blocks of multi-cloud network automation.",
    highlights: [
      "azurerm provider (v3) with required_providers pinning",
      "Resource group → VNet (10.0.0.0/16) → subnet (10.0.1.0/24) → public IP",
      "Australia East region — mirrors production Azure footprint",
      "Committed state + lock file for reproducible runs",
    ],
    usage: ["Install Terraform and authenticate to an Azure subscription.", "Review the provider, region and network address values in `main.tf`.", "Run `terraform init`, inspect `terraform plan`, then apply the reviewed plan.", "Use `terraform destroy` when the disposable lab is no longer required."],
    stack: ["Terraform", "HCL", "Azure", "azurerm"],
    language: "HCL",
    stars: 0,
    forks: 0,
    license: "n/a",
    created: "2025",
    updated: "Aug 2025",
    category: "Infrastructure as Code",
    accent: "#8aa0b0",
  },
  {
    id: "roong-lk",
    name: "roong.lk",
    url: "https://github.com/aroshak/roong.lk",
    description: "Roong.lk — Next.js e-commerce for fresh produce and dry foods",
    summary:
      "An AI-powered online supermarket I architected and deployed single-handedly — a production product serving real customers and generating revenue. Next.js 15 front-end, Supabase backend, GCP Cloud Run, LangGraph agents and OpenAI/Anthropic APIs for RAG and automated customer-service.",
    highlights: [
      "Production e-commerce serving real customers (roong.lk)",
      "Next.js 15 + TypeScript + Supabase + GCP Cloud Run",
      "LangGraph agent workflows, RAG with vector DBs (Pinecone, Supabase Vector)",
      "Automated customer-service agents",
    ],
    usage: ["Clone the repository and configure the documented Supabase and AI-provider environment variables.", "Install dependencies and start the Next.js development server.", "Connect the required Supabase, vector-store and model services for the complete agent workflow.", "Deploy the production container to Cloud Run or a compatible platform."],
    stack: ["Next.js 15", "TypeScript", "Supabase", "GCP Cloud Run", "LangGraph", "OpenAI"],
    language: "TypeScript",
    stars: 0,
    forks: 0,
    license: "n/a",
    created: "2025",
    updated: "Mar 2025",
    category: "AI Product",
    accent: "#ff4d9d",
    featured: true,
  },
  {
    id: "root",
    name: "root",
    url: "https://github.com/aroshak/root",
    description: "Account bootstrap repository",
    summary:
      "The repository created when the GitHub account was opened in December 2019 — a placeholder marking the start of the public profile. Included for completeness of the archive.",
    highlights: ["Created Dec 2019 — the account's first repo"],
    usage: ["This is an archive/placeholder repository and does not provide a runnable application."],
    stack: [],
    language: "—",
    stars: 0,
    forks: 0,
    license: "n/a",
    created: "Dec 2019",
    updated: "Dec 2019",
    category: "Archive",
    accent: "#4a6070",
  },
];

interface GitHubApiRepo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  license: { spdx_id?: string; name?: string } | null;
  created_at: string;
  updated_at: string;
  topics?: string[];
  archived: boolean;
  fork: boolean;
}

const repoCacheKey = "portfolio_github_repos_v1";
const repoCacheAge = 1000 * 60 * 15;

function formatGitHubDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", { month: "short", year: "numeric" }).format(new Date(value));
}

function mergeGitHubRepo(repo: GitHubApiRepo): GitHubRepo {
  const curated = githubRepos.find((item) => item.name.toLowerCase() === repo.name.toLowerCase());
  if (curated) return {
    ...curated,
    url: repo.html_url,
    description: curated.description || repo.description || "Public GitHub repository",
    language: repo.language || curated.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    license: repo.license?.spdx_id || repo.license?.name || curated.license,
    created: formatGitHubDate(repo.created_at),
    updated: formatGitHubDate(repo.updated_at),
  };
  return {
    id: `github-${repo.id}`,
    name: repo.name,
    url: repo.html_url,
    description: repo.description || "Public engineering repository",
    summary: repo.description
      ? `${repo.description}. Open the repository for its source code, documentation, setup instructions and current development history.`
      : "A public GitHub repository. Open the repository to review its source code, README, setup instructions and current development history.",
    highlights: [
      repo.language ? `Primary language: ${repo.language}` : "Public source repository",
      ...(repo.topics || []).slice(0, 3).map((topic) => `Topic: ${topic}`),
      repo.archived ? "Archived project retained for reference" : "Actively available on GitHub",
    ],
    usage: [
      "Open the repository on GitHub.",
      "Read its README and inspect the dependency or configuration files.",
      "Clone the repository and follow its project-specific setup instructions.",
    ],
    stack: [repo.language, ...(repo.topics || []).slice(0, 4)].filter(Boolean) as string[],
    language: repo.language || "—",
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    license: repo.license?.spdx_id || repo.license?.name || "Not specified",
    created: formatGitHubDate(repo.created_at),
    updated: formatGitHubDate(repo.updated_at),
    category: repo.archived ? "Archive" : "GitHub Project",
    accent: repo.archived ? "#4a6070" : "#4adede",
  };
}

export async function loadGitHubRepos(): Promise<GitHubRepo[]> {
  try {
    const cached = JSON.parse(localStorage.getItem(repoCacheKey) || "null");
    if (cached?.timestamp && Date.now() - cached.timestamp < repoCacheAge && Array.isArray(cached.repos)) return cached.repos;
  } catch { /* ignore invalid cache */ }
  try {
    const response = await fetch("https://api.github.com/users/aroshak/repos?per_page=100&sort=updated", {
      headers: { Accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status}`);
    const apiRepos = await response.json() as GitHubApiRepo[];
    const live = apiRepos.filter((repo) => !repo.fork).map(mergeGitHubRepo);
    const missingCurated = githubRepos.filter((curated) => !live.some((repo) => repo.name.toLowerCase() === curated.name.toLowerCase()));
    const merged = [...live, ...missingCurated].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.updated.localeCompare(a.updated));
    localStorage.setItem(repoCacheKey, JSON.stringify({ timestamp: Date.now(), repos: merged }));
    return merged;
  } catch {
    return githubRepos;
  }
}
