// LinkedIn endorsements, recommendations, and activity — hand-curated from
// Arosha's public LinkedIn profile (au.linkedin.com/in/arosha-kalu).
// These are displayed on the portfolio to show real-world professional validation.

export interface LinkedInEndorsement {
  id: string;
  name: string;
  headline: string;
  relationship: string;
  text: string;
  date: string;
  avatar?: string;
}

export interface LinkedInActivity {
  id: string;
  type: "post" | "comment" | "share";
  text: string;
  date: string;
  link?: string;
  engagement?: { likes: number; comments: number };
}

export const linkedinProfile = {
  name: "Arosha Kaluarachchi",
  headline: "Senior Network Engineer at CIVICA | Network Automation · AI Innovation Leader",
  location: "Oakleigh South, Victoria, Australia",
  url: "https://au.linkedin.com/in/arosha-kalu",
  summary:
    "Meet an accomplished Engineer and AI Innovation Leader with over 10 years of proven experience delivering transformative technical solutions across health, utility, government, and enterprise sectors. Spearheaded the transformation of critical infrastructure at CIVICA, leading the ASA→FTD firewall migration programme across M1, M2, SY3, and Azure data centres.",
  topSkills: [
    "Network Automation",
    "Cisco Firepower / FTD",
    "Ansible",
    "Python",
    "Terraform",
    "Neo4j",
    "Docker",
    "AI / LLM Integration",
    "Multi-Cloud (GCP, AWS, Azure)",
    "Network Security",
    "BGP / MPLS",
    "SD-WAN (Viptela)",
  ],
};

export const linkedinRecommendations: LinkedInEndorsement[] = [
  {
    id: "rec-01",
    name: "Hussein Adeiye",
    headline: "Network Engineer",
    relationship: "Worked together at Exetel",
    text: "Arosha possesses some great qualities that makes him stand out as a network Engineer. He is an effective communicator and team player. He collaborates and gets easily integrated with the team. He works with a high degree of independence and takes ownership of issues. He is a keen learner and thrives in challenging environments.",
    date: "2020",
    avatar: "HA",
  },
];

export const linkedinActivity: LinkedInActivity[] = [
  {
    id: "act-01",
    type: "post",
    text: "Network automation, Cisco FMC migration — sharing insights from the ASA→FTD transformation programme at CIVICA. Automated 34+ manual runbooks with Ansible, Python, and pyATS.",
    date: "2025",
    link: "https://www.linkedin.com/posts/arosha-kalu_networkautomation-cisco-fmc-activity-7369235242450079745-yYPA",
    engagement: { likes: 12, comments: 3 },
  },
  {
    id: "act-02",
    type: "post",
    text: "Tech & Innovation — LLMs and AI agents are reshaping how we build and operate infrastructure. The bridge between networking and AI is where the future lies. Built an MCP server that lets AI agents SSH into Cisco devices.",
    date: "2025",
    link: "https://www.linkedin.com/posts/arosha-kalu_tech-innovation-llms-activity-7368970274785955840-mFhj",
    engagement: { likes: 8, comments: 2 },
  },
  {
    id: "act-03",
    type: "post",
    text: "HealthTech, IT Community & Mental Clarity — sharing thoughts on wellbeing in high-pressure technical roles. Building CarePilot, an NDIS-compliant AI companion for healthcare workers.",
    date: "2025",
    link: "https://www.linkedin.com/posts/arosha-kalu_healthtech-itcommunity-mentalclarity-activity-7425726937299574784-rzsi",
    engagement: { likes: 15, comments: 4 },
  },
];