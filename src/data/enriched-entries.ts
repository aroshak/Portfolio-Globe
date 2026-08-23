// Enriched entry data — maps each career entry to its full context:
// technologies, achievements, related projects, journey timeline, and skills.
// This powers the "extreme detail" side panel on the globe.

import portfolioData from "./portfolio-data.json";

export interface EnrichedEntry {
  id: string;
  tab: string;
  title: string;
  org: string;
  location: { name: string; lat: number; lng: number };
  period: string;
  color: string;
  cards: { heading: string; body: string }[];
  technologies: string[];
  achievements: string[];
  relatedProjects: {
    id: string;
    title: string;
    summary: string;
    stack: string[];
    doc?: string;
    link?: string;
  }[];
  journeyContext: {
    previousRole?: { title: string; org: string; period: string };
    nextRole?: { title: string; org: string; period: string };
  };
  locationInfo: {
    city: string;
    country: string;
    mapsUrl: string;
    wikipediaQuery: string;
  };
  highlights: string[];
}

// ── Technology mapping per org ──
const ORG_TECH: Record<string, string[]> = {
  "Civica Pty Ltd": [
    "Cisco FMC/FTD", "Terraform", "Ansible", "Python", "Docker",
    "GitHub Actions CI/CD", "MCP (AI)", "GCP", "AWS", "Azure",
    "NGFW", "Load Balancers", "pyATS/Genie", "Netmiko", "Neo4j",
    "Cypher", "OpenAPI/Swagger", "CDP/LLDP",
  ],
  "Independent / ROONG": [
    "Next.js 15", "TypeScript", "Supabase", "GCP Cloud Run",
    "LangGraph", "OpenAI API", "Anthropic API", "Pinecone",
    "Supabase Vector", "RAG", "AI Agents", "React", "PostgreSQL",
  ],
  "Tecala Group": [
    "Juniper", "NSX-T", "Fortinet", "Palo Alto", "F5", "CGNAT",
    "Firewall Auditing", "Enterprise Security", "Multi-Vendor MSP",
  ],
  "Bendigo Telco": [
    "ASR 9000", "NCS 5500", "Nexus 9000", "Viptela SD-WAN", "BGP",
    "MPLS", "Sandvine", "EVPN", "L2 Xconnect", "4G Failover",
    "SCADA Networking", "Cisco IOS-XE",
  ],
  "Telstra": [
    "Capacity Planning", "Google CDN", "Netflix CDN", "Akamai CDN",
    "CAPEX/OPEX", "Forecasting", "National Infrastructure",
  ],
  "Exetel Pty Ltd": [
    "Cisco ISR 7200/2800", "Catalyst 3500/6500", "Nexus 7000",
    "ASR 9000", "BGP", "MPLS-VPN", "PBR", "QoS VoIP", "ISP Core",
  ],
  "NSC Global Pvt Ltd": [
    "Cisco", "VOIP", "RBS/NATWEST", "AT&T", "Site Surveys",
    "Network Commissioning", "Banking Networks", "Financial Services",
  ],
  "Suntel Telecom Ltd": [
    "DRA 1900", "CDMA", "AIRSPAN", "WipLL", "TEMS Drive Tester",
    "SDH", "PDH", "Microwave Links", "Path Loss", "WiMax",
    "Alvarion Walkair", "NMS", "DC Power Systems",
  ],
  "Debug Equipment Trades Ltd": [
    "PMR Systems", "Radio Trunking", "Repeater Solutions",
    "Technical Sales", "RF Engineering", "Client Solutions",
  ],
  "Radio Society of Sri Lanka": [
    "VHF Operations", "Amateur Radio", "Call Sign 4S7BU",
    "Radio Propagation", "Antenna Theory", "Emergency Communications",
  ],
  "Northumbria University": [
    "Mobile Communications", "RF Engineering", "Computer Networks",
    "Wireless Systems", "Project Management", "Hardware Technologies",
  ],
  "Mahanama College": [
    "Mathematics", "Physics", "Science", "English",
    "Radio Club", "Scouting", "Photography", "Wushu",
  ],
  "City and Guilds of London Institute": [
    "Telecommunication Systems", "Radio Systems", "Electronics",
    "Digital Networks", "Communication Systems",
  ],
  "Cisco Systems": [
    "Cisco IOS", "Cisco NX-OS", "Routing", "Switching",
    "Troubleshooting", "Enterprise Networking",
  ],
};

// ── Achievements per entry — only for experience entries ──
const ENTRY_ACHIEVEMENTS: Record<string, string[]> = {
  "work-2023-civica": [
    "Leading ASA→FTD firewall migration across M1, M2, SY3, and Azure data centres",
    "Built 23 Ansible migration playbooks, 14 Python utilities, and 6 roles for FMC automation",
    "Designed Dockerised pyATS/Netmiko cutover engine with full evidence trail",
    "Modelled ~40-device estate as a queryable Neo4j graph for blast-radius analysis",
    "Integrated AI automation with MCP (Model Context Protocol) for network operations",
  ],
  "work-2023-roong": [
    "Single-handedly architected & deployed ROONG — AI-powered e-commerce platform in production",
    "Built 5+ AI applications with RAG, vector databases, and autonomous agents",
    "Generated real revenue with active customers on a self-built platform",
    "Developed automated customer-service agents using LangGraph + OpenAI/Anthropic",
  ],
  "work-2017-bendigo": [
    "Led transformation of 10+ POPs nationwide — ASR 9000, NCS 5500, Nexus 9000",
    "Technical lead for Viptela SD-WAN POC for Bendigo Bank (200+ branches)",
    "Delivered EVPN fabric solution in under 3 days for a critical customer",
    "Built custom L2 Xconnect failover and 4G→4G BGP failover for energy sector SCADA",
  ],
  "work-2012-exetel": [
    "Managed Melbourne Airport QoS VoIP deployment",
    "Delivered Coca-Cola Amatil private VPN to US headquarters",
    "Built multi-site MPLS-VPN for Seventh Day Adventist Church across Australia",
    "Operated core ISP infrastructure with advanced BGP and policy-based routing",
  ],
  "work-2010-nsc": [
    "End-to-end network support for RBS & NATWEST — UK's largest retail banks",
    "VOIP migration across the banking estate",
    "Worked alongside AT&T on joint enterprise network deployments",
  ],
  "work-2006-suntel": [
    "Drive testing with TEMS for CDMA network expansion",
    "Microwave link planning and path surveys using Path Loss software",
    "WiMax testing and Alvarion Walkair system validation",
    "OMC/NMS operations for a national telecom provider",
  ],
  "work-2007-debug": [
    "Consultative sales of Private Mobile Radio (PMR) systems at Debug Group",
    "Designed Radio Trunking and Repeater solutions for enterprise clients",
    "Bridged RF engineering knowledge with customer-facing technical support",
  ],
  "work-2006-rssl": [
    "Volunteer leadership keeping Sri Lanka's daily VHF amateur net running",
    "On-air coordination and radio traffic management as 4S7BU",
  ],
};

// ── Projects per entry — ONLY explicit mappings, no fuzzy matching ──
// Education and certification entries never get related projects.
const ENTRY_PROJECTS: Record<string, string[]> = {
  "work-2023-civica": ["fmc-ansible", "cutover-engine", "neo4j-topology"],
  "work-2023-roong": ["roong"],
};

// ── Build enriched entries ──
function buildEnriched(): EnrichedEntry[] {
  const entries = portfolioData.entries as any[];
  const projects = (portfolioData.projects as any[]) || [];
  const projectMap = new Map(projects.map((p: any) => [p.id, p]));

  return entries.map((entry, idx, all) => {
    const tech = ORG_TECH[entry.org] || [];
    const achievements = ENTRY_ACHIEVEMENTS[entry.id] || [];

    // Only resolve projects if this entry is explicitly mapped
    const projectIds = ENTRY_PROJECTS[entry.id] || [];
    const relatedProjects = projectIds
      .map((pid) => projectMap.get(pid))
      .filter(Boolean)
      .map((p: any) => ({
        id: p.id,
        title: p.title,
        summary: p.summary,
        stack: p.stack || [],
        doc: p.doc,
        link: p.link,
      }));

    const prevEntry = idx > 0 ? all[idx - 1] : null;
    const nextEntry = idx < all.length - 1 ? all[idx + 1] : null;

    const city = entry.location.name.split(",")[0].trim();
    const country = entry.location.name.split(",")[1]?.trim() || "";
    const mapsUrl = `https://www.google.com/maps?q=${entry.location.lat},${entry.location.lng}&z=12`;
    const wikipediaQuery = encodeURIComponent(city);

    const highlights = (entry.cards || []).map((c: any) => c.body);

    const tabColor =
      entry.tab === "education" ? "#4adede" :
      entry.tab === "certifications" ? "#ffb84d" :
      "#5ab669";

    return {
      id: entry.id,
      tab: entry.tab,
      title: entry.title,
      org: entry.org,
      location: entry.location,
      period: entry.period,
      color: entry.color || tabColor,
      cards: entry.cards || [],
      technologies: tech,
      achievements,
      relatedProjects,
      journeyContext: {
        previousRole: prevEntry
          ? { title: prevEntry.title, org: prevEntry.org, period: prevEntry.period }
          : undefined,
        nextRole: nextEntry
          ? { title: nextEntry.title, org: nextEntry.org, period: nextEntry.period }
          : undefined,
      },
      locationInfo: { city, country, mapsUrl, wikipediaQuery },
      highlights,
    };
  });
}

export const enrichedEntries: EnrichedEntry[] = buildEnriched();

export function getEnrichedEntry(id: string): EnrichedEntry | undefined {
  return enrichedEntries.find((e) => e.id === id);
}

export function getEntriesByTab(tab: string): EnrichedEntry[] {
  return enrichedEntries.filter((e) => e.tab === tab);
}