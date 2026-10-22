---
last_updated: 2026-09-11
updated_by: victor-gcs-image-organization
change_note: "Noted default model change to Nano Banana Pro 2K relative to existing 1K examples"
---

# Visual reference governance

Use this reference when the user supplies images for style, identity, location,
product, composition, or editing, or when a maintained GCS reference library is
available.

## Statuses

- **Candidate** — potentially useful, not yet approved for recurring use.
- **Approved** — accepted by an authorised brand/design reviewer for defined
  qualities and use cases.
- **Rejected** — retained only to demonstrate a documented failure mode.

File presence does not imply approval. A project output, campaign image, stock
photo, or AI generation remains a candidate until its status is recorded.

## Approval authority

Only an authorised brand/design reviewer may assign Approved or Rejected status
to a permanent reference. The image generator may assess a candidate and
recommend a status, but must not record final approval on the reviewer's behalf.

Record:

- reviewer name or role;
- decision date;
- status;
- qualities approved or defects rejected;
- suitable and unsuitable use cases;
- provenance and rights notes when known.

## Existing Design System examples

The Design System already contains four AI-generated illustrations at
`assets/images/imagery-guideline-examples/`. Their recorded source is the
repository `readme.md` → “Examples (AI-generated)”: Google Nano Banana 2
(`imagen-nano-banana-2-flash`), 1K resolution, with the original prompts retained
there. These are **illustrative references, not approved final assets**; no
permanent Approved/Rejected review or production clearance is recorded by this
list. They predate the skill's current default model — new generations use
Google Nano Banana Pro at 2K resolution unless the session or user specifies
otherwise; do not regenerate these four examples merely to match the new
default.

| File | Illustrates | Status / boundary |
|---|---|---|
| `optionality-skyline_ai.png` | Cosmopolitan skyline; Optionality | Illustrative; check architectural geometry and sufficient scene depth |
| `security-access-boardroom_ai.png` | Restrained interior; Security and Access | Illustrative; check spatial credibility and furniture geometry |
| `family-generations_ai.png` | Considered family moment; Family and Future Generations | Illustrative; synthetic people, not real clients or outcome evidence |
| `portrait-headshot_ai.png` | Fictional professional portrait treatment | Illustrative concept only; not a real advisor, employee, or client portrait |

When the repository and relevant image files are available, inspect them in that
folder; do not recreate or duplicate them into a second gallery. The historical
prompts document how those examples were generated, not mandatory instructions
for every future scene. In particular, follow the current scene-specific depth
of field guidance rather than copying shallow focus into every composition.

A standalone installation does not include these image files; a sparse checkout
may omit them too. When they are unavailable, use the bundled written guidance without claiming to have seen them. If the user wants to match
one, ask them to attach that example; do not require a repository checkout or
invent a machine path. If a distribution later needs bundled examples, copy only
an explicitly selected set and preserve original filenames, source, and review
status; this does not create a new approval authority.

## Reference set

Prefer a small, decisive set:

- three to eight approved images covering the actual recurring needs;
- two to four rejected examples for common failure modes;
- genuinely distinct scenes such as architecture, interior, generic corporate
  concept, family/editorial, and mobility context only when needed.

Do not build a large mood board with conflicting lighting, colour, framing, or
levels of formality.

Create assets/approved-references/ or assets/rejected-references/ only when real
reviewed files exist. Do not add empty asset folders or machine-specific source
paths to the skill.

## Manifest template

Maintain a manifest beside the reference assets:

~~~markdown
# GCS image reference manifest

| File | Status | Reviewer | Date | Transferable qualities or defects | Suitable use | Rights/source |
|---|---|---|---|---|---|---|
| office-editorial-01.jpg | Approved | Brand Design | 2026-09-04 | Soft side light; restrained grade; credible context | Internal corporate concepts | Licensed stock |
| portrait-plastic-skin-01.jpg | Rejected | Brand Design | 2026-09-04 | Artificial skin; excessive bokeh | Failure-mode reference only | Internal review |
~~~

Use relative filenames. Do not include credentials, temporary URLs, or personal
machine paths.

## Using approved references

1. Inspect only references relevant to the requested scene.
2. Extract transferable properties:
   - lighting direction and softness;
   - framing, crop, viewpoint, and negative space;
   - colour grade and contrast;
   - depth of field;
   - skin, fabric, and material treatment;
   - wardrobe formality and environmental cleanliness.
3. Pass the actual image to the generation/editing tool when supported.
4. Record the reference filename or identifier in the output provenance.

Approved style references do not override the AI eligibility gate. An approved
real advisor portrait may guide an authorised edit of that supplied photograph;
it does not authorise generating a synthetic advisor or lookalike.

## Candidate and rejected references

- Candidate images may guide a one-off request only when the user explicitly
  selects them. Do not promote them to permanent brand guidance.
- Rejected images are negative examples. Extract only the documented defect;
  do not feed them as positive style references.
- If references conflict materially, prioritise the user's current instruction
  for the one-off output and flag the conflict before changing the permanent
  reference set.

## Identity, copyright, and composition

- Do not copy a person's identity unless the request is an authorised edit of a
  supplied image.
- Do not reproduce a reference composition too closely when style transfer is
  sufficient.
- Use logos and branded assets from supplied files, not text approximations.
- Preserve provenance and rights information. If usage rights are unknown,
  flag the reference rather than implying it is cleared.
