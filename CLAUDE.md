# gcs-design-ops

Working directory for GCS design work. Design system lives at a sibling repo.

## Caveman mode

Toda vez que algo for pedido no chat, invoque a skill `caveman` primeiro, antes de qualquer outra ação.

## Design System

Path: `/Volumes/GCS - DISK 1T/GCS 2026/Github/gcs-design-system` (`../gcs-design-system`). Subfolders: `tokens/`, `components/core/`, `templates/`, `assets/`.

- Before building anything, read the DS `CLAUDE.md` (brand rules, repo map, component inventory).
- Use project skills in `skills/` first (auto-loaded via `.claude/skills`); if none matches, search org-installed skills. For a build with no matching skill, use `/ops-create`.
- Never hardcode colors, fonts, spacing, or radii — always pull from the DS tokens.

## Output

Save all deliverables to `output/<type>/`: `pages`, `sections`, `components`, `brochures`, `social`, `slides`, `pptx`, `docs`, `images`.

Filenames: `[type]-[topic]-[YYYY-MM-DD].<ext>` — e.g. `output/pages/page-golden-visa-portugal-2026-09-10.html`.
