# Portfolio Globe

An interactive portfolio for engineers whose work spans locations, organisations, technologies, and projects. The site combines a Three.js career globe, a 3D GitHub repository carousel, detailed case-study readers, a career timeline, product links, and professional contact information.

This repository can be reused as a template. Most personal content is stored in typed data files, so another person can customise it without rewriting the visual components.

## Features

- Interactive Three.js globe with career and education locations
- Education, experience, certification, infrastructure, and live-data layers
- Dynamic GitHub repository discovery through GitHub's public API
- 3D GitHub repository carousel with project-detail and usage panels
- Detailed Markdown case-study reader with a generated table of contents
- Career, capabilities, products, LinkedIn, résumé, and contact sections
- Separate “About this build” page
- Responsive layouts and reduced-motion support
- Vite, React, TypeScript, Tailwind CSS, Three.js, and `react-globe.gl`

## Run locally

Requirements:

- Node.js 20 or newer
- npm

```bash
git clone https://github.com/aroshak/Portfolio-Globe.git
cd Portfolio-Globe
npm install
npm run dev
```

Vite prints the local and network URLs in the terminal. To use a specific port:

```bash
npm run dev -- --port 5101
```

Create a production build with:

```bash
npm run build
npm run preview
```

## Reuse it for another person

The main personal data lives in [`src/data/portfolio-data.json`](src/data/portfolio-data.json). Start by replacing the `person`, `home`, `journey`, `entries`, and `projects` values in that file.

### 1. Update identity and contact details

Edit the `person` object:

```json
{
  "person": {
    "name": "Your Name",
    "title": "Your professional title",
    "tagline": "A concise statement of what you bring",
    "location": "City, Country",
    "email": "you@example.com",
    "workEmail": "you@example.com",
    "links": {
      "github": "https://github.com/your-account",
      "linkedin": "https://www.linkedin.com/in/your-profile",
      "site": "https://your-product-or-site.example"
    }
  }
}
```

Also update:

- The email links and written positioning in [`src/components/PortfolioLanding.tsx`](src/components/PortfolioLanding.tsx)
- The GitHub profile in [`src/data/github-repos.ts`](src/data/github-repos.ts)
- LinkedIn details in [`src/data/linkedin-endorsements.ts`](src/data/linkedin-endorsements.ts)
- The page title and metadata in [`index.html`](index.html)

### 2. Set the globe’s home location

Set `home` using decimal latitude and longitude:

```json
{
  "home": {
    "name": "Melbourne, AU",
    "lat": -37.8136,
    "lng": 144.9631,
    "zoom": 0.05
  }
}
```

You can find coordinates using OpenStreetMap or another mapping service. Latitude ranges from `-90` to `90`; longitude ranges from `-180` to `180`.

### 3. Add education

Add an object to `entries` with a unique ID and `tab: "education"`:

```json
{
  "id": "edu-2020-example",
  "tab": "education",
  "title": "Bachelor of Engineering",
  "org": "Example University",
  "location": {
    "name": "Sydney, AU",
    "lat": -33.8688,
    "lng": 151.2093
  },
  "period": "2017 – 2020",
  "cards": [
    {
      "heading": "Degree",
      "body": "Describe the qualification, specialisation, results, and relevant work."
    },
    {
      "heading": "Key subjects",
      "body": "List only subjects or projects that strengthen the professional story."
    }
  ]
}
```

### 4. Add work experience

Use `tab: "experience"`:

```json
{
  "id": "work-2024-example",
  "tab": "experience",
  "title": "Senior Platform Engineer",
  "org": "Example Organisation",
  "location": {
    "name": "Melbourne, AU",
    "lat": -37.8136,
    "lng": 144.9631
  },
  "period": "Jan 2024 – Present",
  "cards": [
    {
      "heading": "Mandate",
      "body": "Explain the environment, scale, responsibilities, and business problem."
    },
    {
      "heading": "Outcomes",
      "body": "Describe systems built, risks reduced, delivery improved, or operations automated."
    }
  ]
}
```

Good portfolio experience copy explains ownership and outcomes. Avoid pasting a list of generic job duties.

### 5. Add certifications

Use `tab: "certifications"`:

```json
{
  "id": "cert-2025-example",
  "tab": "certifications",
  "title": "Certification Name",
  "org": "Issuing Organisation",
  "location": {
    "name": "Remote",
    "lat": 0,
    "lng": 0
  },
  "period": "2025",
  "cards": [
    {
      "heading": "Scope",
      "body": "Explain what the certification validates and how it relates to your work."
    }
  ]
}
```

If the certification has no meaningful physical location, use the issuer’s location or a consistent neutral coordinate rather than inventing a personal location.

### 6. Update the journey arcs

The `journey` array draws chronological arcs between places:

```json
{
  "from": "Sydney",
  "to": "Melbourne",
  "label": "Example Organisation (2024)",
  "year": 2024
}
```

The `from` and `to` place names must match city names used at the beginning of an entry’s `location.name`. For example, `"Melbourne, AU"` produces the city key `"Melbourne"`.

If you use cities not currently listed in the fallback map, add them to the `cities` map in [`src/hooks/useLayers.ts`](src/hooks/useLayers.ts).

### 7. Enrich timeline entries

[`src/data/enriched-entries.ts`](src/data/enriched-entries.ts) contains supporting descriptions, technologies, project relationships, and visual metadata used by the globe interface. Keep its keys aligned with the entry IDs in `portfolio-data.json`.

When adding an entry such as `work-2024-example`, search that file for the existing ID maps and add the same ID where appropriate.

## Dynamic GitHub projects

The repository carousel is dynamic. On page load, the application requests public repositories from:

```text
https://api.github.com/users/aroshak/repos?per_page=100&sort=updated
```

The loader is implemented by `loadGitHubRepos()` in [`src/data/github-repos.ts`](src/data/github-repos.ts).

Its behaviour is:

1. Read a valid repository response from browser `localStorage`, when available.
2. Refresh public repositories from GitHub every 15 minutes.
3. Exclude repositories that are forks.
4. Merge live GitHub metadata with locally curated portfolio descriptions.
5. Append curated projects that are temporarily missing from the API response.
6. Fall back to the complete local project list when GitHub is unavailable, rate-limited, or blocked.

Live values from GitHub include:

- Repository URL
- Primary language
- Stars and forks
- Licence metadata
- Creation and update dates
- Public topics
- Archive status

This means newly created public repositories appear automatically. They receive a generic but usable project panel until you add a curated entry.

GitHub's unauthenticated API is intentionally used so no secret token is shipped to the browser. It has a lower rate limit than authenticated requests, which is why the application caches results and always keeps a local fallback.

## Curate important GitHub projects

Repository cards are defined in [`src/data/github-repos.ts`](src/data/github-repos.ts).

First update `githubProfile`:

```ts
export const githubProfile = {
  login: "your-account",
  url: "https://github.com/your-account",
  avatar: "https://github.com/your-account.png?size=160",
  name: "Your Name",
  publicRepos: 10,
  followers: 0,
  following: 0,
  joined: "Jan 2020",
};
```

Then add one object per repository:

```ts
{
  id: "example-project",
  name: "example-project",
  url: "https://github.com/your-account/example-project",
  description: "One-line project description",
  summary: "A clear explanation of the problem, system, and value.",
  highlights: [
    "Important capability or outcome",
    "Architecture or safety decision",
    "Testing, deployment, or operational detail"
  ],
  usage: [
    "Clone the repository.",
    "Configure the documented environment variables.",
    "Install dependencies and start the application.",
    "Follow the repository README for production deployment."
  ],
  stack: ["TypeScript", "React", "Docker"],
  language: "TypeScript",
  stars: 0,
  forks: 0,
  license: "MIT",
  created: "Jan 2026",
  updated: "Aug 2026",
  category: "AI Tooling",
  accent: "#4adede",
  featured: true
}
```

The `usage` steps appear in the project-detail panel when someone selects a Three.js card.

The merger matches API repositories to curated entries by repository name, case-insensitively. Keep the curated `name` identical to the actual GitHub repository name. For example:

```ts
name: "Portfolio-Globe"
```

When a match exists, GitHub supplies the changing metadata while the local entry supplies the carefully written:

- Summary
- Capabilities and outcomes
- Usage instructions
- Technology stack
- Category and accent colour
- Featured status

Uncurated repositories are still displayed. Their detail panels direct visitors to the repository README for project-specific setup information.

The Three.js carousel implementation is in [`src/components/GitRepoScroller.tsx`](src/components/GitRepoScroller.tsx). It rebuilds its 3D cards after dynamic GitHub data arrives. Normally you should update the curated data rather than editing its rendering code.

### Change the GitHub account used for automatic discovery

Update both `githubProfile` and the API URL inside `loadGitHubRepos()`:

```ts
const response = await fetch(
  "https://api.github.com/users/YOUR_ACCOUNT/repos?per_page=100&sort=updated"
);
```

Also change the cache key when publishing a fork for another person:

```ts
const repoCacheKey = "your_name_github_repos_v1";
```

Changing the cache key prevents a browser from briefly displaying repository data cached for the previous portfolio owner.

### Force an immediate GitHub refresh

Repository data normally refreshes after 15 minutes. During development, remove the cache from the browser console:

```js
localStorage.removeItem("portfolio_github_repos_v1")
location.reload()
```

## Portfolio Globe as a project

This repository is included in its own project system as `Portfolio-Globe`. Its curated card explains:

- The interactive career globe
- Dynamic GitHub discovery
- The 3D project carousel
- Markdown case-study rendering
- How other professionals can reuse the portfolio

Keep that entry in `src/data/github-repos.ts` if you want your fork to demonstrate its own implementation. Rename it and update its repository URL when your fork uses a different GitHub project name.

The `/build` page also contains an “Open source / reusable” panel that links to the repository and this README. Update that URL in [`src/components/BuildPage.tsx`](src/components/BuildPage.tsx) when reusing the project.

## Update products

Live and historical products are stored in [`src/data/live-products.ts`](src/data/live-products.ts).

Set each product’s status accurately:

```ts
status: "live"
```

or:

```ts
status: "offline"
```

Do not link to an unavailable product as though it is live. Use the `statusNote` field to explain historical or temporarily unavailable products.

The featured product on the main landing page is currently written in [`src/components/PortfolioLanding.tsx`](src/components/PortfolioLanding.tsx). Update that component when changing which product receives the prominent placement.

## Add case studies

Place Markdown source documents in `public/docs/`:

```text
public/docs/my-project.md
```

Register the page in `CASE_STUDIES` inside [`src/components/CaseStudyPage.tsx`](src/components/CaseStudyPage.tsx):

```ts
"my-project": {
  file: "my-project.md",
  label: "My Project",
  summary: "A concise description shown above the article."
}
```

The reader route is then:

```text
/case-studies/my-project
```

Link to that route from the `cases` array in `PortfolioLanding.tsx`. The reader automatically builds its table of contents from level-two and level-three Markdown headings.

Recommended case-study structure:

```markdown
# Project title

## The problem
## Constraints and risk
## Solution architecture
## Important engineering decisions
## Safety and testing
## Outcomes
## Technology stack
```

Never place passwords, tokens, internal IP addresses, confidential customer data, or private infrastructure exports in public case studies.

## Update LinkedIn content

Profile information, recommendations, and activity summaries live in [`src/data/linkedin-endorsements.ts`](src/data/linkedin-endorsements.ts).

The two interactive LinkedIn embeds on the landing page are in `PortfolioLanding.tsx`. LinkedIn embeds may produce console warnings from LinkedIn’s own video and tracking scripts. Those requests are controlled by LinkedIn and are not generated by this application.

To replace an embed, use LinkedIn’s official embed URL:

```tsx
<iframe
  src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:POST_ID?collapsed=1"
  title="Descriptive title"
  loading="lazy"
  allowFullScreen
/>
```

## Replace the résumé

Replace:

```text
public/docs/resume.pdf
```

Keep the filename unchanged or update every `/docs/resume.pdf` link in the source.

Before publishing, verify that the résumé does not expose private addresses, personal phone numbers, references’ contact details, or employer-confidential information.

## Visual design

Global styling is in [`src/styles/index.css`](src/styles/index.css). Core colours are defined through Tailwind’s theme variables near the top of that file:

```css
--color-space-bg: #050810;
--color-cyan-glow: #4adede;
--color-text-primary: #e8f4f8;
--color-text-secondary: #8aa0b0;
```

Globe textures live in `public/textures/`. Ensure any replacement imagery is appropriately licensed and compressed for web delivery.

## Routes

The application uses a lightweight pathname switch in [`src/App.tsx`](src/App.tsx):

- `/` — globe and main portfolio
- `/build` — how the portfolio was built
- `/case-studies/:slug` — Markdown case-study reader

The included [`vercel.json`](vercel.json) configures SPA rewrites and API behaviour for Vercel deployment.

## Docker and VPS deployment

The portfolio ships as a multi-stage Docker image. Node builds the Vite application, then Nginx serves the static production bundle, handles SPA route fallbacks and proxies the TeleGeography submarine-cable endpoints that otherwise lack browser CORS headers.

Build and run it locally:

```bash
docker build -t portfolio-globe .
docker run --rm --name portfolio-globe -p 5100:80 portfolio-globe
curl http://127.0.0.1:5100/healthz
```

The container includes a health check and runs independently of other applications on the host. Production uses the container name `portfolio-globe` and publishes it on host port `5100`; an existing reverse proxy can route a dedicated domain to `127.0.0.1:5100`.

Nginx compresses and caches the large cable GeoJSON response and gives the upstream enough time to complete on a cold cache. The deployment gate warms that cache and validates that at least 700 TeleGeography cable features are available from the newly started container before the workflow reports success.

### Automated delivery

The [`deploy-vps.yml`](.github/workflows/deploy-vps.yml) workflow runs on every push to `main`:

1. Install locked dependencies with Node 20.
2. Typecheck and create the production Vite build.
3. Install Chromium and run the Playwright browser suite.
4. Build a versioned Docker image and publish it to GitHub Container Registry.
5. Connect to the VPS, replace only the `portfolio-globe` container and verify `/healthz` before declaring success.

Configure these GitHub Actions secrets in the repository or its `production` environment:

| Secret | Purpose |
| --- | --- |
| `VPS_HOST` | VPS hostname or IP address |
| `VPS_PORT` | SSH port, normally `22` |
| `VPS_USERNAME` | SSH account permitted to run Docker |
| `VPS_PASSWORD` | SSH password; prefer replacing this with a deploy key later |

The deployment uses the workflow-scoped `GITHUB_TOKEN` for GHCR authentication. No VPS credential, registry token or private environment value belongs in the repository.

## Before publishing your version

- Replace every name, email address, social link, and product URL.
- Replace the GitHub avatar and repository data.
- Change the dynamic GitHub API username and browser cache key.
- Update the `/build` repository link to point to your fork.
- Replace the résumé.
- Remove case studies you do not own.
- Check every location and timeline date.
- Mark unavailable products as offline.
- Search the repository for the original owner’s name and email.
- Run `npm run build`.
- Test the globe, repository carousel, modals, case-study routes, external links, and mobile layout.
- Test both a successful GitHub API response and the curated offline fallback.
- Confirm `.env` remains ignored by Git.

Useful final checks:

```bash
rg -n "Arosha|aroshak|carepilot|civica" src public index.html
npm run build
git status
```

## Security and privacy

- Never commit `.env`; only commit `.env.example` with placeholder values.
- Do not store credentials in JSON, Markdown, client-side TypeScript, or Vite variables.
- Anything shipped to the browser is public, including `VITE_*` environment variables.
- Sanitize screenshots, topology data, device exports, logs, and case-study evidence.
- Link to private repositories only when visitors actually have permission to access them.

## License

No general-purpose open-source licence is currently declared for this portfolio. Add a `LICENSE` file before distributing a reusable fork under specific licence terms. Third-party libraries and datasets retain their respective licences and terms.
