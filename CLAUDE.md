# gcs-design-ops

Working directory for GCS design work. Design system lives at a sibling repo.

## Caveman mode

Toda vez que algo for pedido no chat, invoque a skill `caveman` primeiro, antes de qualquer outra ação.

## Design System

Path: `/Volumes/GCS - DISK 1T/GCS 2026/Github/gcs-design-system`

At the start of every session:
1. Read `/Volumes/GCS - DISK 1T/GCS 2026/Github/gcs-design-system/CLAUDE.md` for brand rules, repo map, and component inventory.
2. Read `/Volumes/GCS - DISK 1T/GCS 2026/Github/gcs-design-system/readme.md` for full design system documentation.

When building any UI, asset, brochure, social, or template:
- Tokens → `/Volumes/GCS - DISK 1T/GCS 2026/Github/gcs-design-system/tokens/`
- Components → `/Volumes/GCS - DISK 1T/GCS 2026/Github/gcs-design-system/components/core/`
- Templates → `/Volumes/GCS - DISK 1T/GCS 2026/Github/gcs-design-system/templates/`
- Assets (logos, icons, flags) → `/Volumes/GCS - DISK 1T/GCS 2026/Github/gcs-design-system/assets/`
- Skills → check `/Volumes/GCS - DISK 1T/GCS 2026/Github/gcs-design-ops/skills` first; if no match there, search skills installed in org


Never hardcode colors, fonts, spacing, or radii — always pull from the tokens above.

## Output

All deliverables must be saved to `/Volumes/GCS - DISK 1T/GCS 2026/Github/gcs-design-ops/output/`.

Organize by type:
- `output/pages/` — full pages (landing pages, WordPress pages)
- `output/sections/` — individual sections/blocks
- `output/components/` — standalone components
- `output/brochures/` — brochures and print pieces
- `output/social/` — social media assets
- `output/slides/` — slide decks
- `output/pptx/` — PowerPoint decks
- `output/docs/` — Word docs, reports
- `output/images/` — generated/processed images

Use descriptive filenames: `[type]-[topic]-[date].html` — e.g. `page-golden-visa-portugal-2026-09-10.html`.
