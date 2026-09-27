# Examples — one dataset, end to end

This folder shows the complete flow for one request: "turn this spreadsheet
into a table and chart for the website".

| File | What it is |
|---|---|
| `sample-input.csv` | The user's source data, exactly as received. |
| `sample-output-table.html` | The `gcs-table` built from it — every cell matches the CSV verbatim (fidelity rule), every country paired with its country-flags PNG, every header carrying a Material icon, every `<td>` carrying its `data-label`. |
| `sample-chart-spec.json` | The chart spec written for `scripts/gcs_chart.py`. Note the two comparable numeric columns → `grouped` type; note the footnote declaring that chart values are expressed in thousands (a user-visible presentation choice, stated, never silent). |
| `sample-output-chart.html` | The generated `.gcs-chart` block — regenerate it any time with `python3 ../scripts/gcs_chart.py sample-chart-spec.json`. |

To see them rendered, wrap either output file with the two stylesheets from
`../assets/` (that's exactly what `scripts/export_png.py` does when it
produces the transparent PNGs):

```bash
python3 ../scripts/export_png.py sample-output-table.html table.png --width 960
python3 ../scripts/export_png.py sample-output-chart.html chart.png --width 900
```

The delivery for a request like this is: `tables.css` + `charts.css` (once
per page), the two HTML blocks, and the two transparent PNGs.
