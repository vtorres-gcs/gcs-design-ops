---
last_updated: 2026-09-08
updated_by: codex-pr4-review
change_note: "Preserve the existing social workflow and document a separate opt-in production route with image handoff help."
status: active
---

# Image sourcing and external generation handoff

Use this reference only when a social layout needs an image and the user wants
help creating it. Preserve the existing HTML preview, live editing, rendering,
review and PDF delivery workflow after the image is available.

## Is generated imagery appropriate?

GCS permits AI imagery for internal mockups, non-premium social filler,
abstract backgrounds and pre-shoot concepts. Do not offer an external generator
to bypass the restrictions on client-facing brochures, advisor portraits, paid
ads or passport/ID mockups. A supplied or externally generated image is subject
to the same rules. If the intended use is unclear and changes eligibility, ask
one short question about where the image will be used.

For a restricted use, explain the issue briefly and offer an existing approved
photo or an appropriate layout without a photo. Use genuine photos for real
people and evidence; never invent a client, advisor, testimonial or event.

## Generate here or hand off

If a connected image-generation tool is available and generation is requested,
use the GCS imagery rules and relevant image skill when installed. Check the
result before incorporating it. If no tool is available, first say in the
user's language: “ℹ️ This session has no connected image-generation tool.”
If a tool is available but the user prefers an external one, say “ℹ️ We will use
your chosen external image tool.” Do not claim a missing capability in that case.
Then explain the handoff:

“📋 Copy the prompt below into Gemini or ChatGPT with image generation enabled.
Generate the image there, then upload the result here. I will check it and add
it to the design before the preview.”

Fill every field from the brief and chosen layout before displaying one fenced
`text` block. Ask only for a missing detail that materially changes the image;
do not deliver unresolved template fields as a ready-to-copy prompt.

```text
Create a realistic photograph for [specific permitted GCS use and audience].
Subject and setting: [concrete subject, action and location consistent with the brief].
Aspect ratio: [chosen ratio and useful pixel dimensions].
Composition: [subject position and camera framing]. Leave [specified side/area]
quiet and uncluttered for headline placement; do not generate the headline.
Lighting and finish: natural light, warm-neutral muted colours, subtle film
texture, realistic skin and materials, restrained editorial photography.
Exclude: text, letters, logos, watermarks, document/passport replicas, stock
handshake poses, visible AI defects, oversaturated colours and luxury clichés.
Do not imply the image depicts a real client, advisor, testimonial or event.
```

State “⏳ Waiting for the image” and the next action. When the file returns,
inspect its ratio, subject, available text space, realism and permitted use;
record it as externally AI-generated when applicable. If unsuitable, explain
one concrete correction and provide a revised prompt. Do not describe a prompt
or placeholder as a completed image.
