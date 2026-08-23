# Page dependency trees

## `/` Landing page
Entry: `src/App.tsx`

- `src/components/BackgroundFX.tsx`
- `src/components/ErrorBoundary.tsx`
- `src/components/GlobeHero.tsx`
  - `src/lib/places.ts`
  - `src/lib/satellite.ts`
- `src/components/Dashboard.tsx`
  - `src/components/ProjectDetailModal.tsx`
  - `src/data/portfolio-data.json`
- `src/components/Timeline.tsx`
- `src/components/ServicesPanel.tsx`
  - `src/data/services.ts`
  - `src/components/motion.tsx`
- `src/components/BuildStory.tsx`
  - `src/data/build-story.ts`
  - `src/components/motion.tsx`
- `src/components/ProjectGrid.tsx`
  - `src/components/ProjectDetailModal.tsx`
  - `src/data/portfolio-data.json`
  - `src/data/github-repos.ts`
  - `src/data/live-products.ts`
  - `src/data/linkedin-endorsements.ts`
  - `src/components/motion.tsx`
- `src/hooks/useLayers.ts`
  - `src/data/enriched-entries.ts`
  - `src/data/portfolio-data.json`
- `src/styles/index.css`
