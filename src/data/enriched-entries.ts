import portfolioData from "./portfolio-data.json";
import { VERIFIED_ENTRY_DETAILS, type DetailGroup } from "./verified-entry-details";

export interface EnrichedEntry {
  id: string; tab: string; title: string; org: string;
  location: { name: string; lat: number; lng: number };
  period: string; color: string; summary: string;
  workstreams: DetailGroup[]; capabilities: DetailGroup[]; outcomes: string[]; sources: string[];
  relatedProjects: { id: string; title: string; summary: string; stack: string[]; doc?: string; link?: string }[];
  locationInfo: { city: string; country: string; mapsUrl: string };
}

const ENTRY_PROJECTS: Record<string, string[]> = {
  "work-2023-civica": ["fmc-ansible", "cutover-engine", "neo4j-topology"],
  "work-2023-roong": ["roong"],
};

function buildEnriched(): EnrichedEntry[] {
  const entries = portfolioData.entries as any[];
  const projects = (portfolioData.projects as any[]) || [];
  const projectMap = new Map(projects.map((project: any) => [project.id, project]));
  return entries.map((entry) => {
    const detail = VERIFIED_ENTRY_DETAILS[entry.id];
    if (!detail) throw new Error(`Missing verified detail record for ${entry.id}`);
    const relatedProjects = (ENTRY_PROJECTS[entry.id] || []).map((id) => projectMap.get(id)).filter(Boolean) as any[];
    const [city, country = ""] = entry.location.name.split(",").map((part: string) => part.trim());
    const tabColor = entry.tab === "education" ? "#4adede" : entry.tab === "certifications" ? "#ffb84d" : "#5ab669";
    return {
      ...entry, ...detail, color: entry.color || tabColor, relatedProjects,
      locationInfo: { city, country, mapsUrl: `https://www.google.com/maps?q=${entry.location.lat},${entry.location.lng}&z=12` },
    };
  });
}

export const enrichedEntries: EnrichedEntry[] = buildEnriched();
export const getEnrichedEntry = (id: string) => enrichedEntries.find((entry) => entry.id === id);
export const getEntriesByTab = (tab: string) => enrichedEntries.filter((entry) => entry.tab === tab);
