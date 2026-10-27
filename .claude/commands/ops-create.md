---
description: Build or improve a GCS deliverable aligned with the GCS design system (../gcs-design-system)
argument-hint: <what to build or improve, e.g. "FAQ section for the Golden Visa landing page">
---

Task: $ARGUMENTS

Build or change this deliverable so it follows the GCS design system. The design
system is the sibling checkout `../gcs-design-system`
(`/Volumes/GCS - DISK 1T/GCS 2026/Github/gcs-design-system`) and it wins over
local habits.

## 0. Pick the right skill first

Check the project skills in `skills/` (auto-loaded via `.claude/skills`) and use
the matching one before building by hand:

- Social posts, carousels, stories: `design-social-media`
- Brochure / print PDF: `design-brochure-pdf`; editable PPTX brochure: `design-brochure-builder`
- PowerPoint deck: `design-pptx`
- Word doc, letter, report: `design-docx`
- WordPress / Elementor section or page: `design-elementor`
- Tables and charts: `design-table-chart`
- Imagery: `design-image-generator`

If a skill matches, follow it; the rules below still apply. If none matches,
search the org-installed skills, then build following this command.

## 1. Load the source of truth (before designing)

1. Read `../gcs-design-system/CLAUDE.md` (brand rules, golden rule, imagery,
   component inventory).
2. Skim `../gcs-design-system/readme.md`, "Content Fundamentals" section, when
   the task includes copy.
3. Find the closest existing piece for this task and read it:
   - Sections: `../gcs-design-system/components/core/sections/` (`*.jsx` plus any
     `*.reference.html` / `*.card.html` visual source of truth)
   - Primitives: `../gcs-design-system/components/core/primitives/` (`*.jsx`,
     `*.prompt.md` when present)
   - Templates: `../gcs-design-system/templates/` (brochures, letterheads, ppc,
     slides, social-media)
   - Tokens: `../gcs-design-system/tokens/*.css`
   - Assets: `../gcs-design-system/assets/` (logos, icons, flags, fonts, images)
4. Check `output/` for a previous deliverable of the same type and reuse its
   structure when it fits.

If the DS folder is not reachable, stop and tell the user to add it to the
session (`claude --add-dir ../gcs-design-system`). Do not design from memory.

## 2. Build rules

- Reuse before creating: compose from existing DS sections, primitives and
  templates. Create a new component only when the DS has no suitable one, and
  say why.
- Tokens only. No raw hex, no hardcoded fonts, spacing or radii. Link or inline
  the CSS custom properties from `../gcs-design-system/tokens/`.
- Actions use the DS `Button` sizes (`ds-small | ds-default | ds-large`) and
  styles. Never hand-roll a button.
- Icons: Material Symbols fetched from `google/material-design-icons` (or the DS
  `assets/icons/`). Never draw an icon.
- Flags: only from `../gcs-design-system/assets/flags/`. Never AI-generate a flag.
- Imagery: approved DS photography only (`assets/images/`), compressed. AI
  imagery only where `design-image-generator` allows it.
- Copy: UK English, calm and factual, Title Case CTAs. No promised returns,
  guarantees, urgency or superlatives. Investment / funds content keeps the
  "intermediary, no investment advice" line. For wording questions use the
  `gcs-brand-messaging` skill.
- Radius 0 (except avatars, badges, circular play), flat white cards with 1px
  border, no gradients or textures on UI surfaces.
- Output: follow the "Output" rules in this repo's `CLAUDE.md`. Asset paths
  must resolve from the saved location.

## 3. Verify (do not skip)

1. Open the deliverable in the browser pane (`preview_start` with a `file://`
   URL, or a local static server for HTML; render PDF/PNG for print and social).
2. Compare it to the matching DS `*.reference.html` / `*.card.html` or template
   (open that file in the browser pane too). Check type, spacing, colour, radius
   and states.
3. For web pieces, check mobile width (375px) and console errors.
4. Run the `gcs-design-auditor` agent on the new output and fix what it flags.

## 4. Report

Say, briefly: which skill and DS pieces were reused, any new component created
and why, any place where the DS and existing output disagree, the output path,
and what was not verified.
