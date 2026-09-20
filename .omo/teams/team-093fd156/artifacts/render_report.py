#!/usr/bin/env -S uv run --with markdown python
from __future__ import annotations

import argparse
import html
import importlib
import re
from pathlib import Path


markdown = importlib.import_module("markdown")


CSS = r"""
:root {
  color-scheme: light;
  --page: #f5f7fa;
  --paper: #ffffff;
  --ink: #17212b;
  --muted: #536171;
  --rule: #d8e0e8;
  --accent: #145da0;
  --accent-soft: #e7f1fb;
  --code: #eef2f6;
  --quote: #f4f8fc;
  --radius: 10px;
  --measure: 76rem;
  --space-1: .35rem;
  --space-2: .65rem;
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2.25rem;
}

* { box-sizing: border-box; }
html { background: var(--page); }
body {
  margin: 0;
  color: var(--ink);
  background: var(--page);
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 17px;
  line-height: 1.65;
  text-rendering: optimizeLegibility;
}
.report {
  width: min(calc(100% - 2rem), var(--measure));
  margin: 2.5rem auto 5rem;
  padding: clamp(1.35rem, 3vw, 3rem);
  background: var(--paper);
  border: 1px solid var(--rule);
  border-radius: var(--radius);
  box-shadow: 0 8px 28px rgb(23 33 43 / 7%);
}
h1, h2, h3, h4 { color: #0f385e; line-height: 1.2; letter-spacing: -.012em; }
h1 { margin: 0 0 var(--space-5); font-size: clamp(2rem, 4vw, 3.2rem); }
h2 { margin: 2.8rem 0 var(--space-3); padding-bottom: .4rem; border-bottom: 2px solid var(--accent-soft); font-size: clamp(1.45rem, 2.5vw, 2rem); }
h3 { margin: 2rem 0 .6rem; font-size: 1.3rem; }
h4 { margin: 1.25rem 0 .45rem; font-size: 1.08rem; }
p, ul, ol, dl, table, blockquote, pre { margin: 0 0 var(--space-3); }
ul, ol { padding-left: 1.5rem; }
li + li { margin-top: .25rem; }
a { color: var(--accent); text-decoration-thickness: .08em; text-underline-offset: .15em; }
a:hover, a:focus-visible { color: #0a3d68; }
img { display: block; max-width: 100%; height: auto; margin: var(--space-4) auto; border: 1px solid var(--rule); border-radius: 6px; }
.report-figure { margin: var(--space-4) 0 var(--space-5); }
.figure-scroll { overflow-x: auto; padding: .25rem .25rem .55rem; border: 1px solid var(--rule); border-radius: 6px; background: rgb(251 252 254); }
.report-figure img { width: 700px; max-width: none; margin: 0 auto; }
.report-figure figcaption { margin-top: .45rem; color: var(--muted); font-size: .88rem; }
blockquote { padding: .8rem 1rem; border-left: 4px solid var(--accent); background: var(--quote); color: var(--muted); }
code { padding: .12em .3em; border-radius: 4px; background: var(--code); font-size: .9em; }
pre { max-width: 100%; overflow-x: auto; padding: 1rem; border-radius: 7px; background: #182532; color: #f0f5f9; line-height: 1.45; }
pre code { padding: 0; background: transparent; color: inherit; font-size: .88em; }
.table-scroll { max-width: 100%; overflow-x: auto; margin: 0 0 var(--space-3); border: 1px solid var(--rule); border-radius: 6px; }
.scroll-cue { margin: 0; padding: .35rem .65rem; color: var(--muted); background: var(--accent-soft); font-size: .86rem; }
.table-scroll table { width: max-content; min-width: 100%; margin: 0; border-collapse: collapse; border: 0; }
th, td { min-width: 8rem; padding: .55rem .7rem; border: 1px solid var(--rule); text-align: left; vertical-align: top; }
th { background: var(--accent-soft); color: #0f385e; }
hr { margin: var(--space-5) 0; border: 0; border-top: 1px solid var(--rule); }
sup a { text-decoration: none; }
@media (max-width: 640px) {
  body { font-size: 16px; }
  .report { width: calc(100% - 1rem); margin: .5rem auto 2rem; padding: 1rem; border-radius: 7px; }
  h1 { font-size: 2rem; }
  h2 { margin-top: 2rem; }
  th, td { min-width: 7rem; padding: .45rem .55rem; }
}
"""


def title_from_html(rendered: str, source: Path) -> str:
    match = re.search(r"<h1(?: [^>]*)?>(.*?)</h1>", rendered, flags=re.S)
    if match:
        return re.sub(r"<[^>]+>", "", match.group(1)).strip()
    return source.stem.replace("-", " ").replace("_", " ").title()


def enhance_blocks(rendered: str) -> str:
    def image_wrapper(match: re.Match[str]) -> str:
        image = match.group(1)
        alt_match = re.search(r'alt="([^"]*)"', image)
        alt = alt_match.group(1) if alt_match else "figure"
        label = html.escape(f"Scrollable figure: {alt}", quote=True)
        return f'<figure class="report-figure"><div class="figure-scroll" role="region" tabindex="0" aria-label="{label}">{image}</div><figcaption>Scroll horizontally to inspect this figure on narrow screens.</figcaption></figure>'

    rendered = re.sub(r'<p>(<img [^>]+>)</p>', image_wrapper, rendered)
    rendered = re.sub(
        r'<table>(.*?)</table>',
        r'<div class="table-scroll" role="region" tabindex="0" aria-label="Scrollable data table"><p class="scroll-cue">Scroll horizontally to inspect all table columns on narrow screens.</p><table>\1</table></div>',
        rendered,
        flags=re.S,
    )
    return rendered


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("markdown_path", type=Path)
    parser.add_argument("--out-dir", type=Path, required=True)
    args = parser.parse_args()
    source = args.markdown_path.resolve()
    out_dir = args.out_dir.resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    text = source.read_text(encoding="utf-8")
    rendered = markdown.markdown(
        text,
        extensions=["extra", "tables", "toc", "sane_lists", "nl2br"],
        output_format="html",
    )
    rendered = enhance_blocks(rendered)
    title = title_from_html(rendered, source)
    base_href = source.parent.as_uri().rstrip("/") + "/"
    document = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="qa-source" content="{html.escape(str(source), quote=True)}">
  <base href="{html.escape(base_href, quote=True)}">
  <title>{html.escape(title)}</title>
  <style>{CSS}</style>
</head>
<body><main class="report">{rendered}</main></body>
</html>
"""
    destination = out_dir / "report.html"
    destination.write_text(document, encoding="utf-8")
    print(destination)


if __name__ == "__main__":
    main()
