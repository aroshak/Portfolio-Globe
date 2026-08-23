# Extractable components

## GlobeHero
- Source: `src/components/GlobeHero.tsx`
- Category: layout
- Description: Interactive 3D globe and career-location visualization.
- Extractable props: active layers, selected entry, fly target
- Hardcoded: globe textures and map visual treatment

## Dashboard
- Source: `src/components/Dashboard.tsx`
- Category: layout
- Description: Hero HUD, identity/navigation panels, layer controls, entry detail.
- Extractable props: selected item, active layers, overlay metrics
- Hardcoded: icon system and HUD typography

## TiltCard
- Source: `src/components/motion.tsx`
- Category: basic
- Description: Pointer-reactive glass card with glare.
- Extractable props: className, maxTilt, children
- Hardcoded: transform and glare behavior

## Reveal
- Source: `src/components/motion.tsx`
- Category: basic
- Description: Intersection-observer entrance wrapper.
- Extractable props: direction, delay, className, children
- Hardcoded: animation timing

## ProjectDetailModal
- Source: `src/components/ProjectDetailModal.tsx`
- Category: basic
- Description: Unified project, repository, and product detail overlay.
- Extractable props: item, onClose
- Hardcoded: modal structure and external-link treatment
