# Data input — reading, extracting, validating

This skill accepts data in any of these forms. Whatever the source, the
same absolute fidelity rules at the bottom of this file apply.

## Reading each format

| Input | How to extract |
|---|---|
| **Pasted text / lists** | Work from it directly — don't ask the user to reformat. |
| **CSV / TSV** | Read the file directly. Respect the delimiter, quoting, and header row as found. Python's stdlib `csv` module handles edge cases (quoted commas, embedded newlines) — use it rather than naive `split(",")` for anything non-trivial. |
| **XLSX / Excel** | Use the `xlsx` skill if available, or `python3` + `openpyxl` (`pip3 install openpyxl` if missing). Read cell values, not formulas' cached display strings, unless the display string is what the user sees (currency formatting) — when in doubt, extract both and match the user's file. Multi-sheet files: ask which sheet unless only one has data. |
| **DOCX** | `python3` + `python-docx` (available): iterate `document.tables` and read cell text verbatim. If the document has several tables, confirm which one unless it's obvious from the request. |
| **HTML (existing tables)** | Parse the `<table>` — Python stdlib `html.parser` or a quick regex-free walk. Preserve cell text exactly, including entities (decode `&amp;` → `&`). Ignore the source styling entirely; only data comes across. |
| **Images (PNG / JPG / JPEG / WebP)** | Read the image file directly with the Read tool — Claude's vision does the OCR. See the OCR rules below. |
| **PDF** | Use the `pdf` skill for extraction, then treat the extracted table like pasted text. |

## OCR from images — rules

Reading a table out of a screenshot or photo is the highest-risk input path,
so it gets extra discipline:

1. **Read the image at full attention.** Transcribe the table cell by cell,
   row by row — headers first, then each row in order.
2. **Transcribe, don't interpret.** `1.554` stays `1.554` (don't guess
   whether it's a decimal or a thousands separator — European formats
   differ); `—` stays `—`; abbreviations stay abbreviated.
3. **Mark what you can't read.** If a cell is cut off, blurred, or
   ambiguous, do NOT guess a value. Put a placeholder (`[ilegível]` /
   `[unreadable]`) in your transcription and tell the user explicitly which
   cells could not be read, before building anything.
4. **Echo the transcription back.** For image inputs, always show the user
   the extracted data (as a compact markdown table) and get a confirmation
   or correction *before* generating the final HTML/PNG deliverables. This
   is the one case where pausing for confirmation beats proceeding — a
   mis-OCR'd number shipped to the website is worse than one extra
   round-trip.
5. Charts in images (reading data points off a pictured bar chart) are
   estimation, not extraction — refuse to derive exact values from a
   pictured chart unless the values are printed as labels. Say so plainly.

## Validation pass (every input, every time)

Before building, check and report anything found — don't silently "fix":

- **Ragged rows** — a row with more/fewer cells than the header. Report it;
  ask or show which column you assumed was missing.
- **Mixed types in a numeric column** (`"N/A"`, `"—"`, `"TBD"` among
  numbers). Keep them verbatim in the table. For a chart, these rows cannot
  be plotted — say which rows were left off the chart and why. Never
  substitute 0 for a missing value.
- **Duplicate header names** — disambiguate only with the user, since
  `data-label` and chart series keys need distinct names.
- **Unit mixtures in one column** (`€250,000` next to `$150,000`) — fine in
  a table (verbatim), but flag that a single-axis chart of that column
  would be misleading, and don't build one.
- **Totals rows** — if the source has a "Total" row, keep it in the table
  but exclude it from charts (a total bar next to its parts double-counts).
  Say you did so.

## Absolute fidelity rules

The output must contain **exactly the data in the source** — this is the
skill's most important property, above visual polish:

- Never invent, estimate, or extrapolate a value, row, or column.
- Never alter values — no rounding, no rescaling, no currency conversion,
  no "cleaning up" of numbers, no re-formatting of dates.
- Never modify text — spelling, casing, and punctuation of the user's data
  stay as found (headers may be Title-Cased ONLY if the user's source has
  no established casing, e.g. a lowercase CSV header — and mention it).
- Never summarise, merge, or drop rows/columns without being asked. If the
  data is too wide for a good table (5+ columns), say so and propose the
  split — don't quietly omit a column.
- Never reorder rows unless the source order is clearly arbitrary AND
  sorting was requested. Rankings keep their ranking order.
- Missing values render as the source's own marker (`—`, `N/A`) — never
  as an inferred value.
- The ONLY derived numbers permitted anywhere are chart axis ticks and
  pie/donut percentages (see `references/charts.md`), both computed
  exactly from source values.

After building, do a final **fidelity diff**: re-read the generated HTML and
compare every cell against the source data, cell by cell. For image inputs
this pass is mandatory and worth stating in one line ("verifiquei célula a
célula contra a imagem").
