#!/usr/bin/env python3
"""Generate an infographic from a Refresh Psychiatry report via NotebookLM.

Prerequisites:
    pip install "notebooklm-py[browser]"
    playwright install chromium
    notebooklm login

Usage:
    python generate_infographic.py "Refresh_Daily_Brief_2026-03-16.html"
    python generate_infographic.py "KOL-Strategy-Briefing-2026-03-15.html" --style editorial --orientation landscape
"""

import argparse
import asyncio
import re
import sys
import tempfile
from html.parser import HTMLParser
from pathlib import Path

from notebooklm import NotebookLMClient
from notebooklm.rpc import InfographicDetail, InfographicOrientation, InfographicStyle


class _HTMLTextExtractor(HTMLParser):
    """Strip HTML to plain text, skipping script/style tags."""

    def __init__(self):
        super().__init__()
        self._parts: list[str] = []
        self._skip = False

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self._skip = True

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self._skip = False

    def handle_data(self, data):
        if not self._skip:
            self._parts.append(data)

    def get_text(self) -> str:
        return re.sub(r"\s+", " ", " ".join(self._parts)).strip()


def _html_to_text(html_content: str) -> str:
    parser = _HTMLTextExtractor()
    parser.feed(html_content)
    return parser.get_text()

STYLE_MAP = {
    "auto": InfographicStyle.AUTO_SELECT,
    "sketch": InfographicStyle.SKETCH_NOTE,
    "professional": InfographicStyle.PROFESSIONAL,
    "bento": InfographicStyle.BENTO_GRID,
    "editorial": InfographicStyle.EDITORIAL,
    "instructional": InfographicStyle.INSTRUCTIONAL,
    "bricks": InfographicStyle.BRICKS,
    "clay": InfographicStyle.CLAY,
    "anime": InfographicStyle.ANIME,
    "kawaii": InfographicStyle.KAWAII,
    "scientific": InfographicStyle.SCIENTIFIC,
}

ORIENTATION_MAP = {
    "portrait": InfographicOrientation.PORTRAIT,
    "landscape": InfographicOrientation.LANDSCAPE,
    "square": InfographicOrientation.SQUARE,
}

DETAIL_MAP = {
    "concise": InfographicDetail.CONCISE,
    "standard": InfographicDetail.STANDARD,
    "detailed": InfographicDetail.DETAILED,
}


async def main(
    report_path: Path,
    style: InfographicStyle,
    orientation: InfographicOrientation,
    detail: InfographicDetail,
    instructions: str | None,
    keep_notebook: bool,
):
    stem = report_path.stem
    output_png = report_path.parent / f"{stem}_infographic.png"

    print(f"Report: {report_path.name}")
    print(f"Style: {style.name} | Orientation: {orientation.name} | Detail: {detail.name}\n")

    async with await NotebookLMClient.from_storage() as client:
        # 1. Create notebook
        nb = await client.notebooks.create(f"Infographic: {stem}")
        print(f"Created notebook: {nb.id}")

        try:
            # 2. Strip HTML to text, save as .txt, upload as file source
            raw_html = report_path.read_text(encoding="utf-8")
            text_content = _html_to_text(raw_html)
            print(f"Extracted {len(text_content):,} chars from HTML")

            with tempfile.NamedTemporaryFile(
                mode="w", suffix=".txt", prefix=f"{stem}_", delete=False, encoding="utf-8"
            ) as tmp:
                tmp.write(text_content)
                tmp_path = Path(tmp.name)

            try:
                source = await client.sources.add_file(
                    nb.id, tmp_path, wait=True, wait_timeout=300
                )
            finally:
                tmp_path.unlink(missing_ok=True)

            print(f"Source indexed: {source.id}")

            # 3. Generate infographic
            default_instructions = (
                "Create a clear, professional infographic highlighting the key findings "
                "and insights. Use clean typography and organized sections."
            )
            status = await client.artifacts.generate_infographic(
                nb.id,
                instructions=instructions or default_instructions,
                orientation=orientation,
                detail_level=detail,
                style=style,
            )
            print(f"Generating infographic (task: {status.task_id})...")
            print("This may take 5-15 minutes. Waiting...")

            # 4. Wait for completion
            final = await client.artifacts.wait_for_completion(
                nb.id, status.task_id, timeout=900
            )

            if final.is_complete:
                # 5. Download PNG
                path = await client.artifacts.download_infographic(nb.id, str(output_png))
                size_kb = Path(path).stat().st_size / 1024
                print(f"\nSaved: {path} ({size_kb:.0f} KB)")
            else:
                print(f"\nGeneration failed: {final.status}")
                sys.exit(1)

        finally:
            if not keep_notebook:
                await client.notebooks.delete(nb.id)
                print("Notebook cleaned up.")
            else:
                print(f"Notebook kept: {nb.id}")

    print("\nDone!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate infographic from a report via NotebookLM")
    parser.add_argument("report", help="Path to HTML report file")
    parser.add_argument("--style", choices=STYLE_MAP.keys(), default="professional")
    parser.add_argument("--orientation", choices=ORIENTATION_MAP.keys(), default="portrait")
    parser.add_argument("--detail", choices=DETAIL_MAP.keys(), default="standard")
    parser.add_argument("--instructions", help="Custom instructions for the infographic")
    parser.add_argument("--keep-notebook", action="store_true", help="Don't delete the notebook after")

    args = parser.parse_args()
    report = Path(args.report)

    if not report.exists():
        print(f"File not found: {report}")
        sys.exit(1)

    asyncio.run(main(
        report_path=report,
        style=STYLE_MAP[args.style],
        orientation=ORIENTATION_MAP[args.orientation],
        detail=DETAIL_MAP[args.detail],
        instructions=args.instructions,
        keep_notebook=args.keep_notebook,
    ))
