"""
Generate 5 blog-based marketing videos for Refresh Psychiatry.
Uses Pillow to render PNG frames, then ffmpeg to compile to MP4.
"""
import subprocess
import os
import math
import tempfile
import shutil
from PIL import Image, ImageDraw, ImageFont

FFMPEG = r"C:\Users\jnepa\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin\ffmpeg.exe"
OUTPUT_DIR = r"C:\Users\jnepa\OneDrive\Desktop\Psych News\narrations\merged"

# Brand colors (RGB tuples)
BLUE = (43, 108, 176)
YELLOW = (246, 199, 68)
NAVY = (13, 33, 55)
CHARCOAL = (45, 55, 72)
WHITE = (255, 255, 255)
DARK_BG = (16, 24, 40)

# Video specs
FPS = 30
DURATION = 25  # seconds

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

def ease_out(t):
    return 1 - (1 - t) ** 3

def ease_in_out(t):
    return 3 * t * t - 2 * t * t * t

BLOG_VIDEOS = [
    {
        "id": "B1-DopamineMyth",
        "title_lines": ["Dopamine Detox", "Is a Myth"],
        "subtitle": "What Science Actually Says",
        "blog_title": "Your Brain Isn't Broken: Why the Dopamine Detox Is a Myth",
        "orientation": "portrait",
        "accent": hex_to_rgb("#F6C744"),
        "points": [
            "Dopamine isn't just a 'pleasure chemical'",
            "Digital distraction = adaptation, not damage",
            "Your brain isn't broken",
            "Intentional engagement > total avoidance",
        ],
    },
    {
        "id": "B2-ADHDTelehealth2026",
        "title_lines": ["ADHD Meds via", "Telehealth in 2026"],
        "subtitle": "Florida Patient Guide",
        "blog_title": "ADHD Medication Through Telehealth in 2026",
        "orientation": "portrait",
        "accent": BLUE,
        "points": [
            "Yes - FL allows ADHD meds via telehealth",
            "Schedule II stimulants included",
            "Comprehensive virtual evaluation",
            "Most insurance plans accepted",
        ],
    },
    {
        "id": "B3-BoxBreathing",
        "title_lines": ["Box Breathing", "in 30 Seconds"],
        "subtitle": "Instant Calm Technique",
        "blog_title": "Box Breathing: A Psychiatrist's Guide to Instant Calm",
        "orientation": "portrait",
        "accent": hex_to_rgb("#4ECDC4"),
        "points": [
            "Inhale  -  4 seconds",
            "Hold      -  4 seconds",
            "Exhale  -  4 seconds",
            "Hold      -  4 seconds",
        ],
    },
    {
        "id": "B4-SpringAnxiety2",
        "title_lines": ["Spring Anxiety", "Is Real"],
        "subtitle": "Seasonal Symptoms to Watch",
        "blog_title": "Why Does My Anxiety Get Worse in Spring?",
        "orientation": "landscape",
        "accent": hex_to_rgb("#E88EBE"),
        "points": [
            "Daylight shifts affect brain chemistry",
            "Routine disruption triggers anxiety",
            "Seasonal allergies can worsen mood",
            "Professional support helps",
        ],
    },
    {
        "id": "B5-DaylightSaving",
        "title_lines": ["Daylight Saving", "& Mental Health"],
        "subtitle": "Why You Feel Off This Week",
        "blog_title": "The Hidden Mental Health Impact of Daylight Saving Time",
        "orientation": "landscape",
        "accent": hex_to_rgb("#7C5CFC"),
        "points": [
            "Circadian rhythm disruption is real",
            "Sleep, mood & appetite all affected",
            "Effects last beyond the first week",
            "Light exposure is the key factor",
        ],
    },
]


def get_font(size, bold=False):
    """Get a font, falling back to default if needed."""
    font_names = [
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/segoeuib.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
    ]
    if bold:
        for fn in ["C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf"]:
            try:
                return ImageFont.truetype(fn, size)
            except:
                pass
    else:
        for fn in ["C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/arial.ttf"]:
            try:
                return ImageFont.truetype(fn, size)
            except:
                pass
    return ImageFont.load_default()


def draw_gradient_bg(draw, w, h):
    """Draw a vertical gradient background."""
    for y in range(h):
        t = y / h
        color = lerp_color(DARK_BG, NAVY, t)
        draw.line([(0, y), (w, y)], fill=color)


def draw_circle(draw, cx, cy, r, fill, opacity=255):
    """Draw a filled circle with alpha."""
    if r < 1:
        return
    color = fill + (opacity,)
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)


def render_frame(video, frame_num, total_frames, w, h):
    """Render a single frame as PIL Image."""
    t = frame_num / total_frames  # 0.0 to 1.0

    img = Image.new("RGBA", (w, h), DARK_BG + (255,))
    draw = ImageDraw.Draw(img)

    # Draw gradient background
    draw_gradient_bg(draw, w, h)

    accent = video["accent"]
    is_portrait = video["orientation"] == "portrait"

    # Decorative floating circles
    c1_r = int(80 + 20 * math.sin(t * math.pi * 4))
    c1_x = int(w * 0.85 + 30 * math.sin(t * math.pi * 2))
    c1_y = int(h * 0.12 + 20 * math.cos(t * math.pi * 2))
    draw_circle(draw, c1_x, c1_y, c1_r, accent, 20)

    c2_r = int(60 + 15 * math.cos(t * math.pi * 3))
    c2_x = int(w * 0.1 + 20 * math.cos(t * math.pi * 2.5))
    c2_y = int(h * 0.88 + 15 * math.sin(t * math.pi * 2.5))
    draw_circle(draw, c2_x, c2_y, c2_r, BLUE, 25)

    c3_r = int(40 + 10 * math.sin(t * math.pi * 5))
    c3_x = int(w * 0.5 + 40 * math.cos(t * math.pi * 1.5))
    c3_y = int(h * 0.5 + 30 * math.sin(t * math.pi * 1.5))
    draw_circle(draw, c3_x, c3_y, c3_r, accent, 12)

    # Top accent bar (animates in)
    bar_w = int(w * min(t / 0.08, 1.0))
    if bar_w > 0:
        draw.rectangle([0, 0, bar_w, 5], fill=accent)

    # "FROM THE BLOG" tag
    tag_font = get_font(18, bold=True)
    tag_opacity = int(255 * min(t / 0.1, 1.0))
    if tag_opacity > 0:
        tag_color = accent + (tag_opacity,)
        # Create overlay for alpha text
        overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        odraw = ImageDraw.Draw(overlay)
        tag_x = w - 200 if is_portrait else w - 220
        odraw.text((tag_x, 30), "FROM THE BLOG", font=tag_font, fill=tag_color)
        img = Image.alpha_composite(img, overlay)
        draw = ImageDraw.Draw(img)

    # Layout parameters
    if is_portrait:
        margin = 80
        title_size = 68
        subtitle_size = 30
        point_size = 34
        title_y = 300
        point_spacing = 110
    else:
        margin = 100
        title_size = 60
        subtitle_size = 28
        point_size = 32
        title_y = 180
        point_spacing = 95

    title_font = get_font(title_size, bold=True)
    subtitle_font = get_font(subtitle_size, bold=True)
    point_font = get_font(point_size)
    cta_font = get_font(24, bold=True)
    logo_font = get_font(20, bold=True)
    small_font = get_font(17)

    # Title (slides up and fades in)
    title_progress = min(t / 0.12, 1.0)
    title_alpha = int(255 * ease_out(title_progress))
    title_offset = int(40 * (1 - ease_out(title_progress)))

    if title_alpha > 0:
        overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        odraw = ImageDraw.Draw(overlay)
        for i, line in enumerate(video["title_lines"]):
            y = title_y + i * (title_size + 14) + title_offset
            odraw.text((margin, y), line, font=title_font, fill=WHITE + (title_alpha,))
        img = Image.alpha_composite(img, overlay)
        draw = ImageDraw.Draw(img)

    # Subtitle
    sub_y = title_y + len(video["title_lines"]) * (title_size + 14) + 25
    sub_progress = max(0, min((t - 0.1) / 0.08, 1.0))
    sub_alpha = int(255 * ease_out(sub_progress))

    if sub_alpha > 0:
        overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        odraw = ImageDraw.Draw(overlay)
        odraw.text((margin, sub_y), video["subtitle"], font=subtitle_font, fill=accent + (sub_alpha,))
        # Underline
        line_w = int(180 * ease_out(sub_progress))
        if line_w > 0:
            odraw.rectangle([margin, sub_y + subtitle_size + 10, margin + line_w, sub_y + subtitle_size + 13],
                          fill=accent + (int(sub_alpha * 0.7),))
        img = Image.alpha_composite(img, overlay)
        draw = ImageDraw.Draw(img)

    # Points (appear one by one)
    points_y = sub_y + subtitle_size + 50
    for i, point in enumerate(video["points"]):
        pt_start = 0.22 + i * 0.12
        pt_progress = max(0, min((t - pt_start) / 0.06, 1.0))
        pt_alpha = int(255 * ease_out(pt_progress))
        pt_x_offset = int(50 * (1 - ease_out(pt_progress)))

        if pt_alpha > 0:
            py = points_y + i * point_spacing
            overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
            odraw = ImageDraw.Draw(overlay)

            # Bullet circle
            dot_r = int(7 * ease_out(pt_progress))
            if dot_r > 0:
                draw_cx = margin + 12
                draw_cy = py + point_size // 2 - 4
                odraw.ellipse([draw_cx - dot_r, draw_cy - dot_r, draw_cx + dot_r, draw_cy + dot_r],
                            fill=accent + (pt_alpha,))

            # Text
            odraw.text((margin + 35 + pt_x_offset, py), point, font=point_font, fill=WHITE + (pt_alpha,))

            img = Image.alpha_composite(img, overlay)
            draw = ImageDraw.Draw(img)

    # CTA button
    cta_progress = max(0, min((t - 0.82) / 0.08, 1.0))
    cta_alpha = int(255 * ease_out(cta_progress))

    if cta_alpha > 0:
        cta_y = h - 240 if is_portrait else h - 170
        overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        odraw = ImageDraw.Draw(overlay)

        # Pill button
        pill_w = 380
        pill_h = 52
        pill_x = margin
        pill_y = cta_y
        odraw.rounded_rectangle([pill_x, pill_y, pill_x + pill_w, pill_y + pill_h],
                               radius=26, fill=accent + (int(cta_alpha * 0.9),))
        # CTA text centered in pill
        text_bbox = odraw.textbbox((0, 0), "refreshpsychiatry.com", font=cta_font)
        text_w = text_bbox[2] - text_bbox[0]
        text_x = pill_x + (pill_w - text_w) // 2
        text_y = pill_y + 12
        odraw.text((text_x, text_y), "refreshpsychiatry.com", font=cta_font, fill=DARK_BG + (cta_alpha,))

        img = Image.alpha_composite(img, overlay)
        draw = ImageDraw.Draw(img)

    # Logo line
    logo_progress = max(0, min((t - 0.85) / 0.08, 1.0))
    logo_alpha = int(180 * ease_out(logo_progress))

    if logo_alpha > 0:
        logo_y = h - 120 if is_portrait else h - 70
        overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        odraw = ImageDraw.Draw(overlay)
        odraw.text((margin, logo_y), "REFRESH PSYCHIATRY", font=logo_font, fill=WHITE + (logo_alpha,))
        odraw.text((margin + 240, logo_y + 2), "  |  (954) 603-4081", font=small_font,
                  fill=accent + (int(logo_alpha * 0.7),))
        img = Image.alpha_composite(img, overlay)

    # Convert to RGB for saving
    return img.convert("RGB")


def render_video(video):
    """Render a full video from Pillow frames + ffmpeg."""
    vid_id = video["id"]
    is_portrait = video["orientation"] == "portrait"
    w = 1080 if is_portrait else 1920
    h = 1920 if is_portrait else 1080
    total_frames = DURATION * FPS

    tmp_dir = tempfile.mkdtemp(prefix=f"refresh_{vid_id}_")

    try:
        print(f"  Rendering {vid_id} ({w}x{h}, {total_frames} frames)...", end=" ", flush=True)

        # Generate PNG frames
        for f_num in range(total_frames):
            img = render_frame(video, f_num, total_frames, w, h)
            png_path = os.path.join(tmp_dir, f"frame_{f_num:05d}.png")
            img.save(png_path, "PNG", optimize=False)

            if f_num % 150 == 0 and f_num > 0:
                pct = int(f_num / total_frames * 100)
                print(f"{pct}%", end=" ", flush=True)

        print("encoding...", end=" ", flush=True)

        # Compile to MP4 with ffmpeg
        output_path = os.path.join(OUTPUT_DIR, f"{vid_id}.mp4")
        input_pattern = os.path.join(tmp_dir, "frame_%05d.png")

        cmd = [
            FFMPEG, "-y",
            "-framerate", str(FPS),
            "-i", input_pattern,
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "23",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            output_path
        ]

        result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)

        if result.returncode == 0 and os.path.exists(output_path):
            size_mb = os.path.getsize(output_path) / (1024 * 1024)
            print(f"OK ({size_mb:.1f} MB)")
            return output_path
        else:
            print(f"FAILED: {result.stderr[-200:]}")
            return None

    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Generating {len(BLOG_VIDEOS)} blog-based videos...\n")

    results = []
    for video in BLOG_VIDEOS:
        path = render_video(video)
        results.append((video["id"], path))

    success = sum(1 for _, p in results if p)
    print(f"\nDone: {success}/{len(BLOG_VIDEOS)} videos rendered")
    for vid_id, path in results:
        status = "OK" if path else "FAILED"
        print(f"  {status}: {vid_id}")


if __name__ == "__main__":
    main()
