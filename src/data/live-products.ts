// Live products & organisations — extracted from the live carepilot.au site
// (fetched Aug 2026). These are Arosha's shipped products, distinct from the
// public GitHub repositories (which are developer-facing code).

export interface LiveProduct {
  id: string;
  name: string;
  tagline: string;
  url: string;
  status: "live" | "offline";
  statusNote?: string;
  orgName: string;
  legal: string;
  description: string;
  summary: string;
  features: string[];
  stack: string[];
  compliance: string[];
  pricing: { tier: string; price: string; note?: string }[];
  links: { label: string; url: string; kind: "web" | "appstore" | "playstore" }[];
  accent: string;
}

export const liveProducts: LiveProduct[] = [
  {
    id: "carepilot",
    name: "CarePilot",
    tagline: "AI Mobile Companion for NDIS Specialists",
    url: "https://carepilot.au",
    status: "live",
    orgName: "CarePilot Australia",
    legal: "© 2026 CarePilot Australia · Privacy Act 1988 (Cth) compliant · independently operated, not affiliated with the NDIA",
    description:
      "An NDIS-compliant mobile companion that eliminates hours of clinical documentation — auto-generating structured SOAP progress notes from voice recordings in seconds.",
    summary:
      "CarePilot turns a carer's voice notes, photos and text snippets into Australian-clinical-standard SOAP progress notes. It scrubs PII on-device, syncs sanitized logs to Google Genkit + Gemini for synthesis, then audits each note against the client's NDIS goals — flagging gaps before export to EHR or PDF.",
    features: [
      "Multimodal capture — voice notes, medical-instruction OCR, quick text snippets",
      "On-device PII scrubbing before anything leaves the phone (offline-first local ledger)",
      "Genkit + Gemini synthesis → SOAP progress notes (Australian Clinical Standard)",
      "NDIS goal alignment checks with gap warnings when a goal is missed",
      "Compliance audit trail + one-tap EHR export / PDF clinical reports",
      "Shift coordination, agenda, billing & entitlements",
    ],
    stack: [
      "Google Genkit",
      "Gemini",
      "RevenueCat",
      "Stripe",
      "Google Calendar OAuth",
      "SAML SSO (Okta, Azure AD)",
      "EHR API",
    ],
    compliance: [
      "Privacy Act 1988 (Cth)",
      "Australian Privacy Principles (APP)",
      "HIPAA audit logs (Enterprise)",
      "SAML SSO (Okta, Azure AD)",
      "On-device PII scrubbing",
    ],
    pricing: [
      { tier: "Solo Practitioner", price: "$29.99/mo" },
      { tier: "Team License", price: "$19.99/user/mo" },
      { tier: "Enterprise", price: "Custom" },
    ],
    links: [
      { label: "Website", url: "https://carepilot.au", kind: "web" },
      { label: "App Store", url: "https://apps.apple.com/au/app/carepilot", kind: "appstore" },
      { label: "Google Play", url: "https://play.google.com/store/apps/details?id=au.com.carepilot.app", kind: "playstore" },
    ],
    accent: "#b78cff",
  },
  {
    id: "roong",
    name: "ROONG",
    tagline: "AI-powered online supermarket",
    url: "https://roong.lk",
    status: "offline",
    statusNote: "Currently offline",
    orgName: "ROONG",
    legal: "Independent / ROONG",
    description:
      "An AI-powered online supermarket for fresh produce and quality dry foods — architected and deployed single-handedly.",
    summary:
      "Next.js 15 + TypeScript front-end with Supabase backend on GCP Cloud Run. LangGraph agent workflows, RAG with vector DBs (Pinecone, Supabase Vector), and automated customer-service agents. Served real customers and generated revenue before being taken offline.",
    features: [
      "Production e-commerce platform (Next.js 15, TypeScript)",
      "Supabase backend + GCP Cloud Run hosting",
      "LangGraph agent workflows + RAG (Pinecone, Supabase Vector)",
      "Automated customer-service agents",
    ],
    stack: ["Next.js 15", "TypeScript", "Supabase", "GCP Cloud Run", "LangGraph", "OpenAI/Anthropic"],
    compliance: [],
    pricing: [],
    links: [],
    accent: "#ff4d9d",
  },
];
