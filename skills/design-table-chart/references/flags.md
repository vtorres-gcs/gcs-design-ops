# Country flags — msikma/country-flags only

Whenever a table row (or chart category) is a **country**, the name is
always paired with its flag — never shown alone. Flags come **exclusively
from the official PNGs** in https://github.com/msikma/country-flags:

- **never draw a flag manually** (no CSS shapes, no emoji, no ad-hoc SVGs);
- **never use another flag source** (no flagcdn, no Wikipedia, no theme
  assets) — this is a 2026-07 policy change: an older version of this skill
  used flagcdn.com; it no longer does;
- select the flag automatically from the country name — don't ask the user
  for codes.

## URL pattern

```
https://raw.githubusercontent.com/msikma/country-flags/master/flags/png/{code}.png
```

`{code}` is the lowercase ISO 3166-1 alpha-2 code (`pt.png`, `mt.png`,
`kn.png`). The PNGs are high-resolution (1200×800), so they stay crisp in
2×/3× PNG exports; the CSS sizes them down to 24×24, clipped to a
circle (`border-radius: 50%`, `object-fit: cover`).

## Markup

```html
<span class="gcs-table__country"><img class="gcs-table__flag" src="https://raw.githubusercontent.com/msikma/country-flags/master/flags/png/pt.png" alt="">Portugal</span>
```

`alt=""` is correct (decorative — the country name is right beside it).

## Repo quirks — check these before shipping

The repository does not track every ISO code 1:1. Known deviations that
matter for GCS content:

| Country | Use | NOT |
|---|---|---|
| United Kingdom | `uk.png` | `gb.png` (missing in this repo) |
| Greece | `gr.png` | — |
| St. Kitts & Nevis | `kn.png` | — |
| UAE | `ae.png` | — |

For any code you haven't used before, verify it exists (a quick
`curl -sI …/flags/png/{code}.png` returns 200) — a missing code 404s
silently as a broken image on the live site. If a territory genuinely has
no file in the repo (some dependencies and micro-territories don't), tell
the user and show the name without a flag rather than substituting a
different source.

Common codes for GCS content: Portugal `pt`, Spain `es`, Greece `gr`,
Malta `mt`, Italy `it`, France `fr`, Germany `de`, Singapore `sg`,
St. Kitts & Nevis `kn`, Grenada `gd`, Dominica `dm`, St. Lucia `lc`,
Antigua & Barbuda `ag`, Vanuatu `vu`, Turkey `tr`, UAE `ae`, USA `us`,
UK `uk`, Canada `ca`, Australia `au`, New Zealand `nz`, Panama `pa`,
Paraguay `py`, Uruguay `uy`, Cyprus `cy`, Hungary `hu`, Latvia `lv`,
Ireland `ie`, Netherlands `nl`, Switzerland `ch`, Austria `at`.

## Rows that are NOT countries

Programme names (D7, Golden Visa), cities, regions, and organisations never
get a flag forced onto them. The flag pairing applies to country names only.

## Self-hosting note

Hotlinking `raw.githubusercontent.com` works immediately with nothing to
upload, but GitHub raw URLs are not a CDN contract. If the user prefers
self-hosting (or their site is high-traffic), tell them to upload the same
PNGs from the country-flags repo to their WordPress media library and swap
the `src` — same files, same repo, just a different host. Don't switch to a
different flag *source* without asking.
