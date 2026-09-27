---
name: design-image-generator
metadata:
  last_updated: 2026-09-11
  updated_by: victor-gcs-image-organization
  change_note: "Added project/folder destination mapping, Magnific tagging, and default Nano Banana Pro 2K model"
description: >
  Create production-ready prompts, generate images, or review supplied images
  for Global Citizen Solutions using the available image-generation capability.
  Enforces GCS subject, style, messaging-pillar, AI-eligibility, realism, and
  provenance rules. Use for on-brand mockups, concepts, abstract backgrounds,
  permitted social imagery, and corporate/editorial photography concepts. Not
  for video, or for AI use cases prohibited by the bundled imagery guideline.
  Not for iconography either: icon sourcing and rendering (Material Symbols,
  inline SVG icons) is governed per-skill (see gcs-social-media, gcs-brochure,
  etc.); this skill covers photographic and illustrative imagery only.
---

# GCS Image Generator

Create prompts, generate images, or review images for Global Citizen Solutions
without creating a second visual style. The skill is tool-independent: use the
image-generation or image-inspection capability available in the current
environment and follow that tool's actual schema.

## Self-contained source

Always read [imagery guideline](references/imagery-guideline.md). It controls
subjects, visual tone, messaging-pillar mapping, technical ratios, and AI
eligibility.

Load [corporate photography](references/corporate-photography.md) only for
corporate, professional, executive, office, urban, mobility, or human-centred
editorial scenes.

Load [visual references](references/visual-references.md) when the user supplies
reference images, asks about the existing GCS examples, or a maintained reference
set is available. It identifies the existing illustrative examples and their
status; do not create a competing gallery.

This folder is portable. Do not require a design-system checkout, a specific
provider, a named MCP server, or machine-specific paths. If a full design-system
repo is present and its imagery rules conflict with the bundled guideline, the
repo is the newer authority; report the drift instead of silently merging rules.

## Select the mode

Infer the requested mode:

- **Prompt** — return a finished, tool-ready prompt without generating.
- **Generate** — create the image and return the result with provenance.
- **Review** — inspect a supplied image against brand and realism rules.
- **Refine** — edit or regenerate from supplied imagery when the user asks.

If the request is clear, do not ask the user to select a mode. Otherwise use
this short opening, translated naturally into the user's language:

> 🖼️ I can create an image, prepare a prompt, or help improve an existing image
> in the GCS style. What would you like to do?
>
> 1. **Create an image** — describe the idea and I will prepare a first version.
> 2. **Review an image** — attach it and I will check its style and quality.
> 3. **Get a ready-to-copy prompt** — use it in another image tool.
> 4. **Adjust an image** — attach it and describe the change.
>
> Reply with a number or describe what you need. You can also ask for help.

Adapt this opening to known capability: when generation is unavailable, say
“I can prepare a prompt for you to generate elsewhere” instead of promising an
image in this session. Keep Review available when inspection is supported.

Accept a number against the most recent menu; do not make the user repeat the
label. Ask only the next missing decision that changes the result. Use simple
numbered choices when helpful, allow free text and “I don't know”, and recommend
a sensible default for optional creative choices. Never default an unknown use
case through the eligibility gate.

Explain terms when they first matter: for example, “16:9, a wide horizontal
image for a slide or website”. Infer camera, brand pillar, and technical choices
from the brief rather than making the user learn them. If asked for help, give a
short example for the current step instead of restarting the intake.

Use concise, truthful progress and delivery labels paired with text, in the
user's language: ℹ️ Preparing the prompt, 🖼️ Generating, ✅ Prompt ready,
✅ Image ready for review, or ⚠️ Input needed. Show a state only when it applies;
“image ready” does not mean approved for publication. Keep emojis in conversation
and status text, not inside the generated image or production prompt.

## Image availability and tool capability

Use supplied images and context first. Only when unclear whether the user wants
to use an existing image or make a new one, ask:

1. **Use an image I already have** — attach the original.
2. **Create a new image** — describe the subject and where it will be used.

Do not show this second menu after the user's mode choice already answered it.
For Review or Refine, ask for the missing image instead of inventing its details.

Check the actual capabilities exposed in this session. Do not assume that an
application name determines capability: a Claude session may have a connected
image tool; a different session may not. Use an available generation/editing tool
according to its actual instructions. If inspection is unavailable, explain that
you cannot yet assess the image rather than claiming a visual review.

### When generation or editing is unavailable

After resolving necessary context and applying the eligibility gate, continue
with a useful handoff instead of stopping at “I cannot generate images”:

1. Explain plainly: “This session has no connected image-generation tool. I can
   prepare the prompt for you; no image has been generated here.” For editing,
   name the unavailable editing capability instead.
2. Return one complete, scene-specific prompt in a fenced `text` code block so
   it can be copied in one action. Follow the requested prompt language; keep
   instructions to the user in their language. Put ratio, composition, GCS style,
   relevant exclusions, and any required reference instructions in the prompt.
   Do not expose unresolved placeholders or tool-specific switches.
3. Explain the next steps as a short numbered list: open an image-capable
   Gemini or ChatGPT session (or the user's chosen tool), attach any required
   original/reference images, paste the prompt, generate, and save the result.
   State that the destination must support the requested generation or edit;
   do not claim every account or session has that capability. Do not send files
   to another service automatically.
4. Invite the user to return to this conversation with the generated image for
   a GCS style, realism, and crop review. Preserve the brief; do not restart it.

For a refinement handoff, the prompt must state what to change and what to
preserve, and instruct the destination tool to use the attached original. Do not
write a recreation prompt for a logo or person's identity in place of the image.
If the original or a required decision is missing, ask for that first.

The same eligibility rules apply to external prompts: do not supply a forbidden
AI-generation prompt as a workaround. State “✅ Prompt ready — image not yet
generated”, then the copyable prompt and next steps. Record actual provenance
only after generation; never invent a model, result path, or successful review.

## Eligibility gate

Run this before writing a prompt or changing an image:

| Intended use | AI generation |
|---|---|
| Internal mockup or prototype | ✅ Allowed |
| Non-premium social filler | ✅ Allowed |
| Abstract background without people | ✅ Allowed |
| Pre-shoot concept visualisation | ✅ Allowed |
| Client-facing brochure or case study | ❌ Use approved real photography |
| Advisor, employee, or real client portrait | ❌ Use the real supplied person/photo |
| Paid advertisement | ❌ Use approved real photography |
| Passport or identity-document mockup | ❌ Prohibited |

A fictional corporate person may appear only in an otherwise eligible concept,
prototype, or non-premium context. Never present a synthetic person as a real
advisor, employee, client, speaker, testimonial author, or identifiable person.

If the intended use is unclear and changes eligibility, ask one concise
question. If prohibited, explain the rule and suggest the real alternative; do
not generate a near-equivalent workaround.

## Intake

Use supplied context first. Resolve only missing choices that materially affect
the result:

- intended use and audience;
- subject and scene;
- orientation, aspect ratio, and placement;
- required people, representation, action, expression, and wardrobe;
- relevant messaging pillar;
- category and project destination (map to the real Magnific/local folder
  taxonomy in [Project and folder destination](#project-and-folder-destination);
  ask only if intended use does not map clearly);
- supplied logos, people, places, products, or style references;
- prompt-only, generation, review, or edit.

Do not infer that an existing image is an approved visual reference merely
because it is stored near brand assets.

## Build the prompt

Construct one coherent scene in this order:

1. subject, action, and environment;
2. composition, crop, camera position, and negative space;
3. light direction and softness;
4. lens/look appropriate to the scene;
5. warm-neutral, muted, filmic grade;
6. realistic material, skin, fabric, and architectural detail;
7. exclusions relevant to the scene;
8. intended aspect ratio or placement.

Map the scene to one messaging pillar when relevant:

- **Optionality** — multiple jurisdictions, cosmopolitan context, considered
  international perspective;
- **Security and Access** — stable architecture, institutions, calm permanence;
- **Family and Future Generations** — authentic, understated
  multi-generational moments.

Use the guideline vocabulary as a base, not as a block that must be appended
verbatim. Do not pass provider-specific switches or pseudo-parameters unless the
selected tool supports them.

## Corporate and human scenes

For applicable requests, use references/corporate-photography.md.

- A close portrait may use an 85 mm portrait look, but this is not a universal
  requirement.
- Use wider, appropriate framing for groups, environmental portraits,
  architecture, and city scenes.
- Expressions should feel composed, attentive, and credible rather than
  exaggerated, celebratory, or posed like generic stock photography.
- Airports and transit environments are acceptable only when mobility is
  materially relevant. They must feel calm and purposeful, never like holiday
  or luxury-travel advertising.
- Diversity should be intentional when specified and credible when inferred;
  avoid stereotypes or tokenistic compositions.

## Reference images

- Inspect references before generating or editing.
- Use only references relevant to the current scene.
- Pass a real logo, face, product, or location through the tool's supported
  reference-image mechanism; do not approximate identity or branding in text.
- Extract transferable qualities such as lighting, framing, colour grade,
  texture, and candidness. Do not clone a person's identity or copy a
  composition too closely unless the user explicitly requests an edit of that
  image.
- An authorised brand/design reviewer must mark a permanent reference as
  approved or rejected. Record that decision in the manifest described in
  references/visual-references.md.

## Generate or refine

Use the session's available image-generation capability directly. Follow its
rules for attached images, local paths, recent conversation images, model
selection, aspect ratio, and result handling.

Default model: Google Nano Banana Pro at 2K resolution, unless the session
exposes a different tool or the user specifies another model. Follow the
active tool's actual schema; do not force a model name the tool does not
recognise.

- Start with one strong image unless the user asks for variants.
- Generate multiple images only when comparison adds value.
- Do not silently regenerate because the first result is imperfect. Show the
  result and iterate when the user asks, except when an obvious tool failure
  produced no usable image.
- For edits, preserve requested identity, product, layout, and protected brand
  elements. Do not rebuild a supplied logo or person's face from a text
  description.

## Review

For a supplied image, return:

- **Eligibility:** ✅ allowed / ⚠️ needs approval / ❌ prohibited;
- **Brand fit:** subject, pillar, sentiment, grade, and setting;
- **Realism:** anatomy, hands, skin, fabric, reflections, architecture, text,
  and logos;
- **Composition:** crop, focus, negative space, hierarchy, and placement fit;
- **Required fixes:** concrete changes before use;
- **Verdict:** ✅ ready / ⚠️ revise / ❌ do not use.

Do not declare a candidate image permanently approved or rejected on behalf of
the brand/design owner.

## Project and folder destination

Organise every generated image into a project/category destination instead of
one flat gallery. Map the intended use to a destination folder:

| Intended use / scene | Destination |
|---|---|
| Client/lifestyle portrait, family, multi-generational | `Clients & Lifestyle` (under `00 Masters`) |
| Skyline, architecture, country/map imagery | `Country` (under `00 Masters`) |
| Office, corporate, team editorial | `Office & Corporate` (under `00 Masters`) |
| Brochure, report, brand asset | `Reports & Brand` (under `00 Masters`) |
| Paid advertisement (PPC, Google/Meta Ads) | `PPC Campaigns` (under `10 Campaigns`) |
| Organic social post, story, or carousel | `SM Feed` (under `10 Campaigns`) |
| Internal prototype, draft, exploration | `90 WIP` |
| Explicit user test/sandbox request | `Teste` |

If the intended use does not map clearly, ask: “Where will this image be
used? (social media, site/country, corporate, brochure/report, paid ad,
draft)”.

**When a Magnific/Freepik-style project-management tool is connected in this
session** (folder listing, tagging, and creation-search capabilities):

1. Resolve the brand's project by name (e.g. `GCS`) using the tool's folder
   listing — never hardcode a folder or project identifier in this skill; look
   it up by name every time, since identifiers are workspace-specific.
2. Navigate to the destination subfolder from the table above by name. If it
   does not exist yet, create it with the matching name before generating.
3. Generate or save the creation inside that resolved folder, using the
   reference the tool returns rather than an assumed ID.

**When no such tool is connected** (local generation or handoff), mirror the
same destination names as local subdirectories under `ai-image-gallery/`
(e.g. `ai-image-gallery/00 Masters/Clients & Lifestyle/`) instead of one flat
folder.

## Output and provenance

When the tool returns an image, prefer its native result or local output file.
Do not download a remote copy merely to work around display restrictions.

When saving a local production artifact:

- save under the resolved destination subdirectory from
  [Project and folder destination](#project-and-folder-destination);
- name it {description}_{timestamp}_ai.{ext};
- keep the _ai suffix;
- save a same-basename JSON sidecar when the environment supports local files.

Suggested sidecar:

~~~json
{
  "model": "actual model or provider",
  "prompt": "full prompt used",
  "references": ["reference filenames or identifiers"],
  "params": {
    "aspectRatio": "16:9",
    "resolution": "2K"
  },
  "pillar": "Optionality",
  "intendedUse": "internal prototype",
  "eligibility": "allowed",
  "created": "ISO-8601 timestamp"
}
~~~

If the environment returns only an inline generation, provide the same
provenance in the handoff instead of fabricating a local path.

### Tagging (when a project-management tool is connected)

When the connected tool supports custom tags and review statuses on a
creation:

1. Tag every generated image `ai` and set its review status to the
   tool's equivalent of "Needs review" — never set an "Approved" status;
   only a brand/design reviewer approves.
2. Add content tags relevant to the scene when they already exist in that
   project's vocabulary: messaging pillar, subject/scene, country, programme,
   format/use, and event, following that project's own tag list.
3. When a clearly relevant tag does not exist yet in the vocabulary, create it
   in the same project and apply it immediately — do not stop to ask first;
   this auto-creation is expected default behaviour.
4. Never overwrite a review status a human reviewer already set explicitly
   earlier in this conversation.

## QA before handoff

- Reconfirm eligibility against the image's actual intended use.
- Inspect hands, facial features, teeth, jewellery, eyewear, and accessories.
- Check incidental text, flags, political symbols, logos, reflections, and
  architectural geometry.
- Confirm skin and fabric texture remain natural.
- Confirm the grade is warm-neutral, muted, and filmic rather than saturated,
  HDR, tropical, or beauty-retouched.
- Confirm the subject feels calm, considered, and institutional rather than
  promotional, glamorous, or generic stock.
- Confirm the crop and resolution fit the requested placement.
- Preserve _ai labelling and provenance when saved.

## Guardrails

- One canonical skill: do not create a parallel corporate-image generator.
- The eligibility gate overrides an attractive prompt or output.
- Real references override textual approximation for identities and logos.
- Camera guidance is scene-specific; never force 85 mm or shallow depth of field
  onto architecture, groups, maps, or compositions that need context.
- Do not add visible text, flags, passports, or logos unless explicitly
  supplied and eligible.
- Re-run eligibility when the intended use changes during the conversation.
