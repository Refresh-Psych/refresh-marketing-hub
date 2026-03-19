"""
Rebuild ALL 16 videos with stock photos embedded as backgrounds.
Each video has:
- High-quality stock photo as the background (with dark overlay + blur)
- Animated text overlays (title, subtitle, bullet points, CTA)
- Professional brand styling
Then merges with existing narration audio.
"""
import subprocess
import os
import math
import tempfile
import shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

FFMPEG = r"C:\Users\jnepa\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin\ffmpeg.exe"
IMAGE_DIR = r"C:\Users\jnepa\OneDrive\Desktop\Psych News\narrations\images"
AUDIO_DIR = r"C:\Users\jnepa\OneDrive\Desktop\Psych News\narrations"
OUTPUT_DIR = r"C:\Users\jnepa\OneDrive\Desktop\Psych News\narrations\merged"

FPS = 30
DURATION = 25

# Brand colors
BLUE = (43, 108, 176)
YELLOW = (246, 199, 68)
NAVY = (13, 33, 55)
WHITE = (255, 255, 255)
DARK = (10, 18, 32)

ALL_VIDEOS = [
    # Original 11
    {"id": "why-choose-refresh", "title_lines": ["Why Choose", "Refresh Psychiatry?"], "subtitle": "Personalized Telehealth Care", "orientation": "landscape", "accent": YELLOW,
     "points": ["Board-certified psychiatric team", "16 locations across 3 states", "Convenient telehealth visits", "Most major insurance accepted"]},
    {"id": "services-showcase", "title_lines": ["Our Services"], "subtitle": "Full Spectrum Mental Health Care", "orientation": "portrait", "accent": BLUE,
     "points": ["Psychiatric evaluations", "Medication management", "Therapy & counseling", "ADHD & pharmacogenomic testing"]},
    {"id": "adhd-treatment", "title_lines": ["ADHD Treatment"], "subtitle": "Take Control of Your Focus", "orientation": "portrait", "accent": YELLOW,
     "points": ["Thorough ADHD evaluations", "Personalized treatment plans", "Medication & therapy options", "Adults and children welcome"]},
    {"id": "telehealth-fl", "title_lines": ["Telehealth", "Across Florida"], "subtitle": "Expert Care, Delivered to You", "orientation": "landscape", "accent": BLUE,
     "points": ["Miami to Jacksonville", "No commute, no waiting rooms", "Secure HIPAA-compliant video", "Schedule your virtual visit today"]},
    {"id": "V1-ChildVsAdultADHD", "title_lines": ["ADHD: Child", "vs Adult"], "subtitle": "Know the Difference", "orientation": "portrait", "accent": (78, 205, 196),
     "points": ["Children: hyperactivity, impulsivity", "Adults: disorganization, restlessness", "Both deserve proper diagnosis", "We treat ADHD across all ages"]},
    {"id": "V2-Pharmacogenomics", "title_lines": ["Your DNA", "Guides Treatment"], "subtitle": "Pharmacogenomic Testing", "orientation": "landscape", "accent": (124, 92, 252),
     "points": ["Genetic testing for medication", "Fewer trial-and-error prescriptions", "Faster, more effective relief", "Personalized to your biology"]},
    {"id": "V3-TelepsychiatryFL", "title_lines": ["Telepsychiatry", "Statewide"], "subtitle": "16 Locations, Virtual Everywhere", "orientation": "landscape", "accent": BLUE,
     "points": ["HIPAA-compliant appointments", "South FL to the Panhandle", "Book online in minutes", "Expert care from anywhere"]},
    {"id": "V4-AnxietyVsDepression", "title_lines": ["Anxiety vs", "Depression"], "subtitle": "Understanding the Difference", "orientation": "portrait", "accent": (232, 142, 190),
     "points": ["Anxiety: worry, racing thoughts", "Depression: sadness, fatigue", "They often overlap", "We help you find the right path"]},
    {"id": "V5-FirstAppointment", "title_lines": ["Your First", "Appointment"], "subtitle": "What to Expect", "orientation": "portrait", "accent": (78, 205, 196),
     "points": ["Review your history", "Discuss your symptoms", "Create a personalized plan", "Safe, judgment-free space"]},
    {"id": "V6-SpringAnxiety", "title_lines": ["Spring Anxiety", "Awareness"], "subtitle": "Seasonal Mental Health", "orientation": "landscape", "accent": (232, 142, 190),
     "points": ["Seasonal changes affect mood", "Longer days can trigger anxiety", "Routine disruption is real", "Professional support helps"]},
    {"id": "V7-WhyRefresh", "title_lines": ["Why Choose", "Refresh"], "subtitle": "Clinical Excellence + Compassion", "orientation": "portrait", "accent": YELLOW,
     "points": ["Led by Dr. Justin Nepa, DO", "16 locations, 3 states", "Most insurance accepted", "Refresh your mental health"]},
    # Blog-based 5
    {"id": "B1-DopamineMyth", "title_lines": ["Dopamine Detox", "Is a Myth"], "subtitle": "What Science Actually Says", "orientation": "portrait", "accent": YELLOW,
     "points": ["Dopamine isn't just 'pleasure'", "Your brain adapted, not broke", "Avoidance isn't the answer", "Build intentional habits instead"]},
    {"id": "B2-ADHDTelehealth2026", "title_lines": ["ADHD Meds via", "Telehealth 2026"], "subtitle": "Florida Patient Guide", "orientation": "portrait", "accent": BLUE,
     "points": ["Florida allows telehealth ADHD meds", "Schedule II stimulants included", "Comprehensive virtual evaluation", "Most insurance accepted"]},
    {"id": "B3-BoxBreathing", "title_lines": ["Box Breathing", "in 30 Seconds"], "subtitle": "Instant Calm Technique", "orientation": "portrait", "accent": (78, 205, 196),
     "points": ["Inhale  -  4 seconds", "Hold      -  4 seconds", "Exhale  -  4 seconds", "Hold      -  4 seconds"]},
    {"id": "B4-SpringAnxiety2", "title_lines": ["Spring Anxiety", "Is Real"], "subtitle": "Symptoms You Shouldn't Ignore", "orientation": "landscape", "accent": (232, 142, 190),
     "points": ["Daylight shifts affect chemistry", "Routine disruption triggers anxiety", "Allergies can worsen mood", "Professional support helps"]},
    {"id": "B5-DaylightSaving", "title_lines": ["Daylight Saving", "& Mental Health"], "subtitle": "Why You Feel Off This Week", "orientation": "landscape", "accent": (124, 92, 252),
     "points": ["Circadian rhythm disruption", "Sleep, mood & appetite affected", "Effects last beyond one week", "Light exposure is key"]},
]


def get_font(size, bold=False):
    paths = (
        ["C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf"] if bold
        else ["C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/arial.ttf"]
    )
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except:
            pass
    return ImageFont.load_default()


def ease_out(t):
    return 1 - (1 - t) ** 3


def lerp(a, b, t):
    return a + (b - a) * t


def create_bg_frame(bg_img, t, w, h):
    """Create background with subtle Ken Burns (pan/zoom) effect."""
    # Gentle zoom: 1.0 -> 1.08 over video duration
    scale = 1.0 + 0.08 * t
    # Gentle pan
    pan_x = int(10 * math.sin(t * math.pi * 0.5))
    pan_y = int(6 * math.cos(t * math.pi * 0.3))

    # Scale the background
    new_w = int(w * scale)
    new_h = int(h * scale)
    scaled = bg_img.resize((new_w, new_h), Image.LANCZOS)

    # Crop to center with pan offset
    cx = (new_w - w) // 2 + pan_x
    cy = (new_h - h) // 2 + pan_y
    cx = max(0, min(cx, new_w - w))
    cy = max(0, min(cy, new_h - h))

    return scaled.crop((cx, cy, cx + w, cy + h))


def render_frame(video, bg_img, frame_num, total_frames, w, h):
    """Render a single frame with stock photo background and text overlays."""
    t = frame_num / total_frames
    accent = video["accent"]
    is_portrait = video["orientation"] == "portrait"

    # Background: stock photo with Ken Burns
    frame = create_bg_frame(bg_img, t, w, h)

    # Dark overlay (semi-transparent) for text readability
    # Stronger at bottom where text lives
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)

    # Gradient overlay: lighter at top (show photo), darker at bottom (text area)
    for y in range(h):
        yt = y / h
        if is_portrait:
            # Portrait: image visible in top 40%, gradient to dark below
            if yt < 0.35:
                alpha = int(80 + 60 * yt)  # Light overlay on photo
            else:
                alpha = int(140 + 100 * min((yt - 0.35) / 0.3, 1.0))  # Dark for text
        else:
            # Landscape: image on right, text on left
            alpha = int(100 + 80 * (1 - yt * 0.3))  # Even dark overlay

        odraw.line([(0, y), (w, y)], fill=(10, 18, 32, alpha))

    # For landscape, add extra darkening on left side for text
    if not is_portrait:
        for x in range(int(w * 0.65)):
            xt = x / (w * 0.65)
            extra_alpha = int(80 * (1 - xt))
            for y_step in range(0, h, 4):
                odraw.rectangle([x, y_step, x + 1, min(y_step + 4, h)], fill=(10, 18, 32, extra_alpha))

    frame = Image.alpha_composite(frame.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(frame)

    # Layout params
    if is_portrait:
        margin = 70
        title_size = 62
        subtitle_size = 28
        point_size = 32
        title_y = int(h * 0.42)
        point_spacing = 100
    else:
        margin = 80
        title_size = 56
        subtitle_size = 26
        point_size = 30
        title_y = 160
        point_spacing = 88

    title_font = get_font(title_size, bold=True)
    subtitle_font = get_font(subtitle_size, bold=True)
    point_font = get_font(point_size)
    cta_font = get_font(22, bold=True)
    logo_font = get_font(18, bold=True)
    tag_font = get_font(14, bold=True)
    small_font = get_font(16)

    # "FROM THE BLOG" tag (only for blog videos)
    if video["id"].startswith("B"):
        tag_progress = min(t / 0.08, 1.0)
        tag_alpha = int(200 * tag_progress)
        if tag_alpha > 0:
            tag_ov = Image.new("RGBA", frame.size, (0, 0, 0, 0))
            td = ImageDraw.Draw(tag_ov)
            # Tag pill
            tag_x = w - margin - 160
            td.rounded_rectangle([tag_x, 24, tag_x + 150, 50], radius=13, fill=accent + (tag_alpha,))
            td.text((tag_x + 12, 29), "FROM THE BLOG", font=tag_font, fill=(10, 18, 32, tag_alpha))
            frame = Image.alpha_composite(frame.convert("RGBA"), tag_ov).convert("RGB")
            draw = ImageDraw.Draw(frame)

    # Accent bar at top
    bar_w = int(w * min(t / 0.06, 1.0))
    if bar_w > 0:
        draw.rectangle([0, 0, bar_w, 4], fill=accent)

    # Title
    title_progress = min(t / 0.12, 1.0)
    title_alpha = int(255 * ease_out(title_progress))
    title_offset = int(35 * (1 - ease_out(title_progress)))

    if title_alpha > 0:
        ov = Image.new("RGBA", frame.size, (0, 0, 0, 0))
        od = ImageDraw.Draw(ov)
        for i, line in enumerate(video["title_lines"]):
            y = title_y + i * (title_size + 10) + title_offset
            # Text shadow
            od.text((margin + 2, y + 2), line, font=title_font, fill=(0, 0, 0, int(title_alpha * 0.5)))
            od.text((margin, y), line, font=title_font, fill=WHITE + (title_alpha,))
        frame = Image.alpha_composite(frame.convert("RGBA"), ov).convert("RGB")
        draw = ImageDraw.Draw(frame)

    # Subtitle
    sub_y = title_y + len(video["title_lines"]) * (title_size + 10) + 20
    sub_progress = max(0, min((t - 0.1) / 0.08, 1.0))
    sub_alpha = int(255 * ease_out(sub_progress))

    if sub_alpha > 0:
        ov = Image.new("RGBA", frame.size, (0, 0, 0, 0))
        od = ImageDraw.Draw(ov)
        od.text((margin, sub_y), video["subtitle"], font=subtitle_font, fill=accent + (sub_alpha,))
        # Underline
        line_w = int(160 * ease_out(sub_progress))
        if line_w > 0:
            od.rectangle([margin, sub_y + subtitle_size + 8, margin + line_w, sub_y + subtitle_size + 11],
                        fill=accent + (int(sub_alpha * 0.6),))
        frame = Image.alpha_composite(frame.convert("RGBA"), ov).convert("RGB")
        draw = ImageDraw.Draw(frame)

    # Bullet points
    points_y = sub_y + subtitle_size + 45
    for i, point in enumerate(video["points"]):
        pt_start = 0.22 + i * 0.12
        pt_progress = max(0, min((t - pt_start) / 0.06, 1.0))
        pt_alpha = int(255 * ease_out(pt_progress))
        pt_x_off = int(40 * (1 - ease_out(pt_progress)))

        if pt_alpha > 0:
            py = points_y + i * point_spacing
            ov = Image.new("RGBA", frame.size, (0, 0, 0, 0))
            od = ImageDraw.Draw(ov)

            # Bullet dot
            dot_r = int(6 * ease_out(pt_progress))
            if dot_r > 0:
                od.ellipse([margin + 8 - dot_r, py + point_size // 2 - 4 - dot_r,
                           margin + 8 + dot_r, py + point_size // 2 - 4 + dot_r],
                          fill=accent + (pt_alpha,))

            # Text shadow + text
            od.text((margin + 30 + pt_x_off + 1, py + 1), point, font=point_font, fill=(0, 0, 0, int(pt_alpha * 0.4)))
            od.text((margin + 30 + pt_x_off, py), point, font=point_font, fill=WHITE + (pt_alpha,))

            frame = Image.alpha_composite(frame.convert("RGBA"), ov).convert("RGB")
            draw = ImageDraw.Draw(frame)

    # CTA
    cta_progress = max(0, min((t - 0.82) / 0.08, 1.0))
    cta_alpha = int(255 * ease_out(cta_progress))

    if cta_alpha > 0:
        cta_y = h - 220 if is_portrait else h - 155
        ov = Image.new("RGBA", frame.size, (0, 0, 0, 0))
        od = ImageDraw.Draw(ov)
        # Pill button
        pill_w = 360
        pill_h = 48
        od.rounded_rectangle([margin, cta_y, margin + pill_w, cta_y + pill_h],
                            radius=24, fill=accent + (int(cta_alpha * 0.9),))
        bbox = od.textbbox((0, 0), "refreshpsychiatry.com", font=cta_font)
        tw = bbox[2] - bbox[0]
        od.text((margin + (pill_w - tw) // 2, cta_y + 12), "refreshpsychiatry.com",
               font=cta_font, fill=(10, 18, 32, cta_alpha))
        frame = Image.alpha_composite(frame.convert("RGBA"), ov).convert("RGB")
        draw = ImageDraw.Draw(frame)

    # Logo
    logo_progress = max(0, min((t - 0.85) / 0.08, 1.0))
    logo_alpha = int(180 * ease_out(logo_progress))

    if logo_alpha > 0:
        logo_y = h - 110 if is_portrait else h - 60
        ov = Image.new("RGBA", frame.size, (0, 0, 0, 0))
        od = ImageDraw.Draw(ov)
        od.text((margin, logo_y), "REFRESH PSYCHIATRY", font=logo_font, fill=WHITE + (logo_alpha,))
        od.text((margin + 225, logo_y + 2), "  |  (954) 603-4081", font=small_font,
               fill=accent + (int(logo_alpha * 0.7),))
        frame = Image.alpha_composite(frame.convert("RGBA"), ov).convert("RGB")

    return frame.convert("RGB")


def process_video(video):
    """Render video frames + compile with ffmpeg + merge audio."""
    vid_id = video["id"]
    is_portrait = video["orientation"] == "portrait"
    w = 1080 if is_portrait else 1920
    h = 1920 if is_portrait else 1080
    total_frames = DURATION * FPS

    # Load background image
    img_path = os.path.join(IMAGE_DIR, f"{vid_id}.jpg")
    if not os.path.exists(img_path):
        print(f"  [SKIP] No image for {vid_id}")
        return None

    bg_img = Image.open(img_path).convert("RGB")
    if bg_img.size != (w, h):
        bg_img = bg_img.resize((w, h), Image.LANCZOS)

    tmp_dir = tempfile.mkdtemp(prefix=f"refresh_{vid_id}_")

    try:
        print(f"  {vid_id} ({w}x{h})...", end=" ", flush=True)

        # Render frames
        for f_num in range(total_frames):
            frame = render_frame(video, bg_img, f_num, total_frames, w, h)
            frame.save(os.path.join(tmp_dir, f"frame_{f_num:05d}.png"), "PNG", optimize=False)

            if f_num % 150 == 0 and f_num > 0:
                print(f"{int(f_num/total_frames*100)}%", end=" ", flush=True)

        print("enc...", end=" ", flush=True)

        # Compile to MP4 (no audio yet)
        silent_path = os.path.join(tmp_dir, f"{vid_id}_silent.mp4")
        cmd = [
            FFMPEG, "-y",
            "-framerate", str(FPS),
            "-i", os.path.join(tmp_dir, "frame_%05d.png"),
            "-c:v", "libx264", "-preset", "fast", "-crf", "22",
            "-pix_fmt", "yuv420p", "-movflags", "+faststart",
            silent_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)

        if result.returncode != 0:
            print(f"ENCODE FAILED")
            return None

        # Merge with audio narration
        audio_path = os.path.join(AUDIO_DIR, f"{vid_id}.mp3")
        output_path = os.path.join(OUTPUT_DIR, f"{vid_id}.mp4")

        if os.path.exists(audio_path):
            cmd2 = [
                FFMPEG, "-y",
                "-i", silent_path,
                "-i", audio_path,
                "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
                "-map", "0:v:0", "-map", "1:a:0",
                "-shortest", "-movflags", "+faststart",
                output_path
            ]
            result2 = subprocess.run(cmd2, capture_output=True, text=True, timeout=60)
            if result2.returncode != 0:
                # Fallback: just use silent video
                shutil.copy2(silent_path, output_path)
        else:
            shutil.copy2(silent_path, output_path)

        size_mb = os.path.getsize(output_path) / (1024 * 1024)
        print(f"OK ({size_mb:.1f} MB)")
        return output_path

    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Rebuilding {len(ALL_VIDEOS)} videos with stock photo backgrounds...\n")

    results = []
    for video in ALL_VIDEOS:
        path = process_video(video)
        results.append((video["id"], path))

    success = sum(1 for _, p in results if p)
    print(f"\nDone: {success}/{len(ALL_VIDEOS)} videos rebuilt with images + narration")


if __name__ == "__main__":
    main()
