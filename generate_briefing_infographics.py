#!/usr/bin/env python3
"""Generate infographics for each major part of a Refresh Psychiatry daily briefing.

Splits the briefing HTML into 6 parts and generates a landscape infographic for each,
plus a portrait overview infographic for the full report.

Prerequisites:
    pip install "notebooklm-py[browser]"
    notebooklm login

Usage:
    python generate_briefing_infographics.py "Refresh_Daily_Brief_2026-03-16.html"
    python generate_briefing_infographics.py "Refresh_Daily_Brief_2026-03-16.html" --parts 1 3 5
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

# The 6 major parts + overview, each with tailored style/instructions
PART_CONFIGS = {
    0: {
        "name": "Full-Report-Overview",
        "orientation": InfographicOrientation.PORTRAIT,
        "style": InfographicStyle.PROFESSIONAL,
        "detail": InfographicDetail.CONCISE,
        "instructions": (
            "Create a high-level executive summary infographic of this daily intelligence briefing "
            "for a psychiatry practice. Highlight the top 5-6 most important findings across "
            "clinical updates, marketing, reputation, competitive intel, and strategy."
        ),
    },
    1: {
        "name": "Part1-Clinical-Regulatory",
        "orientation": InfographicOrientation.LANDSCAPE,
        "style": InfographicStyle.SCIENTIFIC,
        "detail": InfographicDetail.STANDARD,
        "instructions": (
            "Create an infographic focused on clinical and regulatory intelligence for psychiatry. "
            "Highlight FDA approvals, drug pipeline updates, off-label treatments, DEA policy changes, "
            "and telehealth regulation updates. Use a clean, medical/scientific visual style."
        ),
    },
    2: {
        "name": "Part2-Social-Media-SEO",
        "orientation": InfographicOrientation.LANDSCAPE,
        "style": InfographicStyle.BENTO_GRID,
        "detail": InfographicDetail.STANDARD,
        "instructions": (
            "Create an infographic about social media and SEO intelligence for a psychiatry practice. "
            "Show trending topics, content ideas, SEO keywords, and competitor social activity. "
            "Use a modern, marketing-dashboard visual style."
        ),
    },
    3: {
        "name": "Part3-Reputation-Management",
        "orientation": InfographicOrientation.LANDSCAPE,
        "style": InfographicStyle.PROFESSIONAL,
        "detail": InfographicDetail.STANDARD,
        "instructions": (
            "Create an infographic about online reputation management for a multi-location psychiatry practice. "
            "Show review scores, sentiment analysis, reputation risks, and review generation strategies. "
            "Use a clean, trustworthy visual style."
        ),
    },
    4: {
        "name": "Part4-Competitive-Intelligence",
        "orientation": InfographicOrientation.LANDSCAPE,
        "style": InfographicStyle.EDITORIAL,
        "detail": InfographicDetail.STANDARD,
        "instructions": (
            "Create an infographic showing competitive intelligence for a telepsychiatry practice. "
            "Highlight competitor moves, pricing intel, market positioning, ad warfare, and "
            "market-by-market competitive status. Use a strategic, editorial visual style."
        ),
    },
    5: {
        "name": "Part5-CEO-Command-Center",
        "orientation": InfographicOrientation.LANDSCAPE,
        "style": InfographicStyle.PROFESSIONAL,
        "detail": InfographicDetail.DETAILED,
        "instructions": (
            "Create an executive dashboard infographic for a psychiatry practice CEO. "
            "Show enterprise health scores, financial metrics, patient operations, provider performance, "
            "compliance status, and growth opportunities. Use a premium, C-suite visual style."
        ),
    },
    6: {
        "name": "Part6-Battle-Plan-Closing",
        "orientation": InfographicOrientation.LANDSCAPE,
        "style": InfographicStyle.INSTRUCTIONAL,
        "detail": InfographicDetail.CONCISE,
        "instructions": (
            "Create an infographic showing today's top 5 strategic moves and action items "
            "for a psychiatry practice. Include the battle plan priorities, quick wins, "
            "and closing intelligence. Use a bold, action-oriented visual style."
        ),
    },
}

# Markers to split the HTML into parts
PART_MARKERS = [
    ("PART 1", "PART 2"),
    ("PART 2", "PART 3"),
    ("PART 3", "PART 4"),
    ("PART 4", "PART 5"),
    ("PART 5", "PART 6"),
    ("PART 6", None),
]


class _HTMLTextExtractor(HTMLParser):
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


def _split_into_parts(text: str) -> dict[int, str]:
    """Split full briefing text into parts 1-6. Part 0 = full text."""
    parts = {0: text}
    for i, (start_marker, end_marker) in enumerate(PART_MARKERS, 1):
        start_idx = text.upper().find(start_marker)
        if start_idx == -1:
            continue
        if end_marker:
            end_idx = text.upper().find(end_marker)
            if end_idx == -1:
                parts[i] = text[start_idx:]
            else:
                parts[i] = text[start_idx:end_idx]
        else:
            parts[i] = text[start_idx:]
    return parts


async def _generate_one(
    client, part_num: int, text: str, output_dir: Path, stem: str
) -> str | None:
    """Generate a single infographic for one part. Returns output path or None."""
    config = PART_CONFIGS[part_num]
    output_png = output_dir / f"{stem}_{config['name']}_infographic.png"

    if output_png.exists():
        print(f"  [Part {part_num}] Already exists, skipping: {output_png.name}")
        return str(output_png)

    print(f"  [Part {part_num}] {config['name']} — creating notebook...")

    nb = await client.notebooks.create(f"Briefing P{part_num}: {stem[:40]}")
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".txt", prefix=f"part{part_num}_", delete=False, encoding="utf-8"
        ) as tmp:
            tmp.write(text)
            tmp_path = Path(tmp.name)

        try:
            source = await client.sources.add_file(
                nb.id, tmp_path, wait=True, wait_timeout=300
            )
        finally:
            tmp_path.unlink(missing_ok=True)

        print(f"  [Part {part_num}] Source indexed, generating infographic...")

        status = await client.artifacts.generate_infographic(
            nb.id,
            instructions=config["instructions"],
            orientation=config["orientation"],
            detail_level=config["detail"],
            style=config["style"],
        )

        final = await client.artifacts.wait_for_completion(
            nb.id, status.task_id, timeout=900
        )

        if final.is_complete:
            path = await client.artifacts.download_infographic(nb.id, str(output_png))
            size_kb = Path(path).stat().st_size / 1024
            print(f"  [Part {part_num}] Saved: {output_png.name} ({size_kb:.0f} KB)")
            return path
        else:
            print(f"  [Part {part_num}] FAILED: {final.status}")
            return None
    finally:
        await client.notebooks.delete(nb.id)


async def main(report_path: Path, selected_parts: list[int] | None):
    stem = report_path.stem
    output_dir = report_path.parent / f"{stem}_infographics"
    output_dir.mkdir(exist_ok=True)

    print(f"Report: {report_path.name}")
    print(f"Output: {output_dir}/\n")

    # Extract and split text
    raw_html = report_path.read_text(encoding="utf-8")
    full_text = _html_to_text(raw_html)
    parts = _split_into_parts(full_text)

    available = sorted(parts.keys())
    if selected_parts:
        to_generate = [p for p in selected_parts if p in parts]
    else:
        to_generate = available

    print(f"Found {len(parts)} parts. Generating infographics for: {to_generate}\n")

    async with await NotebookLMClient.from_storage() as client:
        # Generate sequentially to avoid rate limiting
        results = []
        for part_num in to_generate:
            try:
                result = await _generate_one(
                    client, part_num, parts[part_num], output_dir, stem
                )
                results.append((part_num, result))
            except Exception as e:
                print(f"  [Part {part_num}] ERROR: {e}")
                results.append((part_num, None))

    # Summary
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    succeeded = 0
    for part_num, path in results:
        status = "OK" if path else "FAILED"
        name = PART_CONFIGS[part_num]["name"]
        print(f"  Part {part_num} ({name}): {status}")
        if path:
            succeeded += 1
    print(f"\n{succeeded}/{len(results)} infographics generated in {output_dir}/")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate infographics for each part of a daily briefing"
    )
    parser.add_argument("report", help="Path to the briefing HTML file")
    parser.add_argument(
        "--parts", nargs="+", type=int, choices=range(7),
        help="Which parts to generate (0=overview, 1-6=parts). Default: all"
    )

    args = parser.parse_args()
    report = Path(args.report)

    if not report.exists():
        print(f"File not found: {report}")
        sys.exit(1)

    asyncio.run(main(report_path=report, selected_parts=args.parts))
