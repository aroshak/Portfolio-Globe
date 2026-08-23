# Arosha Kaluarachchi Portfolio Design System

## Product and audience

This portfolio sells Arosha to engineering leaders, CTOs, infrastructure/platform heads, consultancies, public-sector organisations, and hiring teams. It must connect 15+ years of enterprise network engineering with current AI-agent product delivery, code acceleration, network automation, and Infrastructure as Code. Visitors should understand his value in under 30 seconds, find evidence quickly, and reach GitHub, LinkedIn, résumé, or email without hunting.

## Information architecture

- Landing: interactive globe hero; compact business-value proposition; evidence metrics; capability pillars; selected case studies; career credibility; products and public work; social proof; contact CTA.
- Work: detailed case studies for FMC migration, cutover automation, Neo4j topology, AI products, and GitHub projects.
- Career: complete experience, education, certifications, and résumé.
- About this build: the portfolio's multi-agent development method, visualisation architecture, and open-source stack.

## Visual direction

Preserve the distinctive mission-control / network-operations atmosphere, but make the content below the hero editorial, calm, and easy to scan. The globe remains the cinematic signature. Below it, use a disciplined 12-column grid, generous whitespace, fewer nested glass cards, larger readable type, strong section hierarchy, and deliberate cyan guide-lines. Avoid a wall of equal cards.

## Tokens

- Canvas: `#050810`; raised section `#080d14`; card `#0d141b`
- Primary text: `#e8f4f8`; secondary `#8aa0b0`; muted `#4a6070`
- Accent cyan: `#4adede`; accent dim: `#2a8a8a`
- Supporting status only: green `#5ab669`, amber `#ffb84d`, red `#ff4d4d`
- Font: Inter / Space Grotesk / system sans. JetBrains Mono only for labels, metadata, and technical annotations.
- Display scale: 56–72px hero; 38–48px section headlines; 20–24px card headlines; 16–18px body; minimum 14px supporting copy.
- Max content width: 1180px; 24px mobile gutters; 48px desktop gutters; 96–128px section spacing.
- Radius: 16px cards, 12px controls, full pills.
- Borders: 1px white at 8–12% or cyan at 14–22%; glows used sparingly around active/primary elements.

## Components

- Sticky minimal top navigation with name/monogram, Work, Career, About this build, GitHub, LinkedIn, and a primary contact CTA.
- Section introductions use a mono eyebrow, a large plain-language headline, and one concise paragraph.
- Evidence strip uses large numeric proof with a short explanation, not unlabeled vanity numbers.
- Case-study rows are asymmetric: outcome and business risk on the left; system, stack, and proof on the right.
- Capability pillars map to business outcomes: ship AI-enabled software faster; automate infrastructure safely; modernise networks without losing control; connect agents to operational systems.
- CTA buttons have clear hierarchy: solid cyan primary, transparent bordered secondary.
- Footer repeats identity, location, availability, social links, résumé, and email.

## Content principles

- Lead with employer value, then technical proof.
- Use first-person ownership accurately: architected, built, extended, automated, modelled, led.
- State scale only where supported: 15+ years, ~40-device estate, 23 playbooks, 14 utilities, 6 roles, 34 manual runbooks replaced, 10+ PoPs, 200+ branches, 5+ AI applications.
- Emphasise safe change: idempotency, pre/post baselines, rollback controls, human review boundaries, documented APIs, credential hygiene, Docker reproducibility.
- Do not invent client results, savings, uptime, percentages, testimonials, or certifications.

## Motion and responsiveness

Use motion to clarify sequence: restrained scroll reveals, numeric count-ups, subtle cyan line progress. Respect `prefers-reduced-motion`. On mobile, collapse grids to one column, keep 16px body text, turn the nav into a compact menu, and preserve direct contact/social actions.
