export interface DetailGroup {
  title: string;
  items: string[];
}

export interface EntryDetails {
  summary: string;
  workstreams: DetailGroup[];
  capabilities: DetailGroup[];
  outcomes: string[];
  sources: string[];
}

const d = (summary: string, workstreams: DetailGroup[], capabilities: DetailGroup[], outcomes: string[] = [], sources = ["Portfolio record"]): EntryDetails => ({ summary, workstreams, capabilities, outcomes, sources });

export const VERIFIED_ENTRY_DETAILS: Record<string, EntryDetails> = {
  "edu-1996-ol": d("Secondary education foundation in Colombo, combining core academic subjects with sustained extracurricular participation.", [
    { title: "Subjects studied", items: ["Mathematics", "Science", "English", "Social Studies"] },
    { title: "Activities", items: ["Senior Scout — College Scout Troop", "College Maths Society", "College Wushu Society"] },
  ], [{ title: "Learning developed", items: ["Analytical foundations", "Written and spoken communication", "Teamwork, discipline, and responsibility"] }]),
  "edu-2001-al": d("University-entrance study in the Mathematics and Science stream, alongside leadership in technical and creative student societies.", [
    { title: "Subjects studied", items: ["Mathematics", "Science"] },
    { title: "Leadership", items: ["President — College Radio Club (2003/04)", "President — College Amateur Radio Club (2003/04)", "Vice President — College Photographic Society (2003/04)"] },
  ], [{ title: "Learning developed", items: ["Quantitative problem solving", "Radio communications interest", "Club leadership and coordination"] }]),
  "edu-2005-cg-tech": d("Technician Diploma in Telecommunication Systems 2730, focused on the electronic, network, and radio foundations of communications systems.", [
    { title: "Electronics", items: ["Fundamentals of Electronics & Communications 2", "Fundamentals of Electronics & Communications 3"] },
    { title: "Networks", items: ["Communication Systems & Digital Networks 2", "Communication Systems & Digital Networks 3"] },
    { title: "Radio", items: ["Radio Systems"] },
  ], [{ title: "Applied learning", items: ["Electronic communications fundamentals", "Digital network principles", "Radio-system operation"] }]),
  "cert-2006-4s7bu": d("Licensed amateur-radio operator with the call sign 4S7BU and practical operating knowledge across VHF and UHF communications.", [
    { title: "Licence scope", items: ["Licensed radio amateur", "Call sign 4S7BU", "VHF/UHF operation"] },
  ], [{ title: "Capabilities", items: ["Radio propagation", "Antenna theory", "Emergency communications protocols", "On-air operating discipline"] }]),
  "edu-2006-cg-adv": d("Advanced Technician Diploma in Telecommunication Systems 2730, extending radio and telecommunications study through an advanced project.", [
    { title: "Subjects studied", items: ["Advanced Radio Systems", "Advanced Telecommunication Systems", "Advanced Telecommunication Project"] },
  ], [{ title: "Applied learning", items: ["Advanced radio-system analysis", "Telecommunications-system design", "Project-based technical delivery"] }]),
  "work-2006-rssl": d("Honorary volunteer responsibility for the society’s daily VHF net and coordinated amateur-radio activity.", [
    { title: "Net operations", items: ["Managed the daily VHF net", "Coordinated society VHF activities", "Regular on-air coordination as 4S7BU"] },
  ], [{ title: "Skills used", items: ["Radio traffic management", "Call-sign protocols", "Clear real-time communication", "Community coordination"] }], ["Kept daily VHF activity organised and participants connected"]),
  "work-2006-suntel": d("Early-career field and operations exposure across wireless access, transmission, ISP, and telecom-site infrastructure.", [
    { title: "Wireless access", items: ["CDMA network work and site surveys", "AIRSPAN WipLL access systems", "TEMS drive testing", "WiMAX and Alvarion Walkair testing"] },
    { title: "Transmission", items: ["SDH and PDH systems", "Ericsson MiniLink-E and multiplexing", "Microwave path surveys and link budgets using Path Loss"] },
    { title: "Operations", items: ["OMC/NMS monitoring", "WOW.lk ISP operations support", "DC power, generator, and structured-cabling work"] },
  ], [{ title: "Skills used", items: ["RF field testing", "Microwave planning", "Access-network operations", "Telecom-site maintenance"] }], ["Supported access-network expansion through drive tests and site surveys", "Validated wireless and microwave deployment options"], ["Portfolio record", "Current CV"]),
  "work-2007-debug": d("Customer-facing technical role translating radio communications engineering into practical enterprise solutions.", [
    { title: "Solution design", items: ["Private Mobile Radio communication systems", "Radio trunking solutions", "Repeater solutions"] },
    { title: "Customer work", items: ["Explained RF concepts to enterprise customers", "Converted operating needs into technical proposals", "Supported consultative technical sales"] },
  ], [{ title: "Skills used", items: ["RF communications", "Requirements discovery", "Solution presentation", "Technical-to-business translation"] }], ["Designed and proposed radio communications solutions for commercial clients"]),
  "edu-2008-northumbria": d("Undergraduate study in mobile communication technologies, spanning wireless networks, mobile hardware, engineering design, and professional delivery.", [
    { title: "Networks & radio", items: ["Applied Computer Networks 1", "Mobile Communications", "Principles of Wireless Computer Networks"] },
    { title: "Engineering & delivery", items: ["Mobile Systems Hardware Technologies", "Design Technology Project", "Project Management & Professional Development", "Academic Communication"] },
  ], [{ title: "Learning developed", items: ["Wireless-network principles", "Mobile-system hardware", "Engineering project execution", "Technical and academic communication"] }], [], ["Portfolio record", "CV — qualification label requires source reconciliation"]),
  "work-2010-nsc": d("Field network engineering for RBS and NatWest environments, including voice migration, site readiness, and Cisco network commissioning.", [
    { title: "Banking estate", items: ["Network support for RBS and NatWest", "VoIP migration activity", "Site surveys, commissioning, and decommissioning"] },
    { title: "Network delivery", items: ["AT&T-coordinated deployments", "Cisco routing and switching", "OSPF, EIGRP, and VLAN configuration", "Aruba and Cisco wireless work"] },
  ], [{ title: "Skills used", items: ["Field engineering", "Cisco LAN/WAN", "VoIP migration", "Site acceptance and handover"] }], ["Supported voice and network migration across a regulated banking estate"], ["Portfolio record", "Current CV"]),
  "work-2012-exetel": d("Core and enterprise network engineering across a national ISP, from backbone routing to customer MPLS and voice services.", [
    { title: "ISP core", items: ["Cisco ISR 7200/2800, Catalyst 3500/6500", "Nexus 7000 and ASR 9000", "BGP, MPLS-VPN, ACLs, and policy-based routing"] },
    { title: "Customer delivery", items: ["Melbourne Airport QoS for VoIP", "Coca-Cola Amatil private VPN to US headquarters", "Multi-site MPLS-VPN for Seventh-day Adventist Church"] },
    { title: "Operations", items: ["MRTG, PRTG, Nagios, and Observium monitoring", "Fault isolation and service support"] },
  ], [{ title: "Skills used", items: ["Service-provider routing", "MPLS VPN design", "QoS", "Network monitoring and troubleshooting"] }], ["Delivered enterprise connectivity on top of a production ISP backbone"], ["Portfolio record", "Current CV"]),
  "cert-2015-ccnp": d("Professional Cisco credential covering enterprise routing, switching, and systematic network troubleshooting.", [
    { title: "Credential scope", items: ["Enterprise routing", "Enterprise switching", "Network troubleshooting"] },
  ], [{ title: "Capabilities", items: ["Cisco IOS networking", "Routing-protocol analysis", "Layer 2/Layer 3 fault isolation", "Production change discipline"] }], [], ["Portfolio record", "Current CV"]),
  "work-2017-telstra": d("National network capacity planning with multi-year demand forecasts, CDN growth analysis, and infrastructure investment planning.", [
    { title: "Forecasting", items: ["Three-to-five-year capacity forecasts", "Traffic and bandwidth growth modelling", "Cisco, Juniper, and vendor platform planning"] },
    { title: "Content platforms", items: ["Google cache and bandwidth planning", "Netflix cache and bandwidth planning", "Akamai cache and bandwidth planning"] },
    { title: "Investment", items: ["CAPEX and OPEX planning", "Deployment standards", "Infrastructure lifecycle planning"] },
  ], [{ title: "Skills used", items: ["Capacity modelling", "CDN demand planning", "Commercial analysis", "National network planning"] }], ["Connected demand forecasts to defensible network investment plans"], ["Portfolio record", "Current CV"]),
  "work-2017-bendigo": d("Network transformation and service innovation across provider infrastructure, banking SD-WAN, and resilient industry connectivity.", [
    { title: "Platform transformation", items: ["Modernised 10+ Points of Presence", "ASR 9000, NCS 5500, and Nexus 9000 deployments", "Core, aggregation, and edge migration"] },
    { title: "Service design", items: ["Viptela SD-WAN proof of concept for Bendigo Bank", "DIA + MPLS hybrid architecture for 200+ branches", "Sandvine subscriber management and traffic steering"] },
    { title: "Resilience", items: ["Custom L2 Xconnect failover", "4G-to-4G BGP failover for energy-sector SCADA", "EVPN deployment delivered in under three days"] },
  ], [{ title: "Skills used", items: ["BGP and MPLS", "SD-WAN", "EVPN", "Service-provider architecture", "Critical-network cutovers"] }], ["Led transformation of more than 10 national POPs", "Delivered rapid EVPN and purpose-built failover solutions"], ["Portfolio record", "Current CV"]),
  "work-2022-tecala": d("Senior engineering across varied managed-service customer environments, covering LAN/WAN, virtual networking, security, and traffic platforms.", [
    { title: "Network platforms", items: ["Enterprise LAN/WAN", "Juniper routing and switching", "VMware NSX-T virtual networking"] },
    { title: "Security & traffic", items: ["Fortinet and Palo Alto firewalls", "F5 load balancing and CGNAT", "Multi-platform firewall audits"] },
    { title: "Delivery", items: ["Customer technical delivery", "Automated documentation", "Knowledge transfer and training", "Team and task coordination"] },
  ], [{ title: "Skills used", items: ["Multi-vendor troubleshooting", "Network security", "Load balancing", "MSP delivery"] }], ["Delivered across multiple enterprise architectures within a fast-moving MSP model"], ["Portfolio record", "Current CV"]),
  "work-2023-roong": d("Independent product engineering spanning AI applications, customer automation, data retrieval, analytics, and production cloud delivery.", [
    { title: "AI systems", items: ["Built 5+ AI applications", "OpenAI GPT-4, Claude, and Gemini integration", "RAG with Supabase Vector and Pinecone", "LangGraph agent workflows"] },
    { title: "Product platform", items: ["Next.js 15 and TypeScript", "Supabase and PostgreSQL", "GCP Cloud Run deployment", "External APIs, GA4, and Google Tag Manager"] },
    { title: "Commercial delivery", items: ["AI-powered online supermarket", "Automated customer-service agents", "Product iteration toward revenue and product-market fit"] },
  ], [{ title: "Skills used", items: ["Full-stack product architecture", "LLM application engineering", "Vector search", "Cloud deployment", "Product analytics"] }], ["Shipped production AI products used by real customers", "Converted prototypes into revenue-generating services"], ["Portfolio record", "Current CV"]),
  "work-2023-civica": d("Senior network engineering across datacentre, security, multi-cloud, and infrastructure automation, with a major focus on ASA-to-FTD migration.", [
    { title: "Infrastructure", items: ["Enterprise Cisco datacentre networks", "NGFW and load balancers", "GCP, AWS, and Azure connectivity", "ISP operations support"] },
    { title: "Automation", items: ["Terraform Infrastructure as Code", "Ansible and Python automation frameworks", "GitHub Actions CI/CD", "Docker and Kubernetes", "MCP-enabled AI automation"] },
    { title: "Migration programme", items: ["Cisco ASA-to-FTD migration across M1, M2, SY3, and Azure", "23 Ansible playbooks, 14 utilities, and 6 reusable roles", "Dockerised pyATS/Netmiko cutover evidence engine", "Neo4j topology model for dependency and blast-radius analysis"] },
  ], [{ title: "Skills used", items: ["Cisco FMC/FTD", "Terraform", "Ansible", "Python", "pyATS/Genie", "Netmiko", "Neo4j/Cypher", "Cloud networking", "CI/CD"] }], ["Industrialised firewall migration through reusable automation", "Created auditable pre/post-cutover evidence", "Made live topology queryable for change-risk analysis"], ["Current CV", "Aroshas_details project documents"]),
};
