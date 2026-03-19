#!/usr/bin/env python3
"""
Generate 5 x 60-second blog videos with:
  - AI-generated background images (via Unsplash stock photos)
  - Multiple slides per video (title + 4-5 content slides + CTA)
  - Female voice narration (Jenny Neural via edge-tts)
  - Ken Burns zoom/pan animation on backgrounds
  - Professional text overlays with Refresh Psychiatry branding
"""

import asyncio, os, subprocess, struct, math, textwrap, io, json, time
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import urllib.request

FFMPEG = r"C:\Users\jnepa\AppData\Local\Programs\Python\Python312\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
OUT = Path(r"C:\Users\jnepa\OneDrive\Desktop\Psych News\blog_videos")
OUT.mkdir(exist_ok=True)
IMG_CACHE = OUT / "images"
IMG_CACHE.mkdir(exist_ok=True)

# Brand colors
BLUE = (43, 108, 176)
NAVY = (13, 33, 55)
YELLOW = (246, 199, 68)
WHITE = (255, 255, 255)
CHARCOAL = (45, 55, 72)

# Video specs: 1080x1920 portrait (Reels/Stories format), 60 seconds
W, H = 1080, 1920
FPS = 24

# ═══════════════ BLOG VIDEO DEFINITIONS ═══════════════
BLOGS = [
    {
        "id": "Blog1-DopamineMyth",
        "title": "Your Brain Isn't Broken",
        "subtitle": "Why the Dopamine Detox\nIs a Scientific Myth",
        "blog_url": "https://www.refreshpsychiatry.com/post/your-brain-isn-t-broken-why-the-dopamine-detox-is-a-scientific-myth-and-what-to-do-instead",
        "image_queries": [
            "person smartphone distracted brain fog",
            "brain neuroscience dopamine neurons",
            "digital detox nature mindfulness",
            "person reading book focused calm",
            "psychiatrist consultation therapy session",
            "sunrise fresh start mental health"
        ],
        "slides": [
            {
                "heading": "Your Brain Isn't Broken",
                "bullets": ["The 'dopamine detox' trend", "is everywhere on social media.", "But is it actually real science?"],
                "narration": "You've probably seen it all over social media — the idea that your brain is flooded with dopamine, and you need a detox to fix it. It sounds convincing, but here's the truth: the dopamine detox is a scientific myth."
            },
            {
                "heading": "The Myth Explained",
                "bullets": ["Dopamine isn't a 'pleasure chemical'", "It drives motivation & learning", "You can't 'detox' a neurotransmitter"],
                "narration": "Dopamine isn't just a pleasure chemical. It's what drives your motivation, curiosity, and ability to learn. You can't simply detox a neurotransmitter — that's not how brain chemistry works."
            },
            {
                "heading": "What's Really Happening",
                "bullets": ["Digital overstimulation is real", "Your nervous system adapts", "Attention fatigue ≠ addiction"],
                "narration": "What's really happening is digital overstimulation. Your nervous system adapts to constant notifications and rapid content. But that's attention fatigue — not an addiction that needs detoxing."
            },
            {
                "heading": "What Actually Helps",
                "bullets": ["Structured screen boundaries", "Mindful engagement, not avoidance", "Regular physical movement", "Quality sleep hygiene"],
                "narration": "So what actually works? Setting structured screen boundaries, practicing mindful engagement instead of avoidance, getting regular physical movement, and prioritizing quality sleep. These are evidence-based strategies."
            },
            {
                "heading": "When to Seek Help",
                "bullets": ["Can't focus despite trying", "Emotional exhaustion persists", "Daily functioning is impaired"],
                "narration": "If you've tried these strategies and still can't focus, if emotional exhaustion persists, or if daily functioning feels impaired — it may be time to talk to a psychiatrist. That's not weakness. That's wisdom."
            }
        ],
        "cta_narration": "At Refresh Psychiatry, we treat the real science, not the trends. Book your telehealth appointment today at refresh psychiatry dot com."
    },
    {
        "id": "Blog2-ADHDTelehealth",
        "title": "ADHD Medication via\nTelehealth in 2026",
        "subtitle": "Everything Florida\nPatients Need to Know",
        "blog_url": "https://www.refreshpsychiatry.com/post/can-you-get-adhd-medication-through-telehealth-in-2026-everything-florida-patients-need-to-know",
        "image_queries": [
            "telehealth video call doctor laptop",
            "adhd focus concentration medication",
            "florida palm trees sunny healthcare",
            "prescription medication pharmacy pills",
            "insurance card health coverage",
            "happy patient smiling telehealth"
        ],
        "slides": [
            {
                "heading": "ADHD Meds via Telehealth",
                "bullets": ["Can you get ADHD medication", "through telehealth in 2026?", "The answer is YES."],
                "narration": "Can you get ADHD medication through telehealth in twenty twenty-six? If you're in Florida, the answer is absolutely yes. And the process is easier than you might think."
            },
            {
                "heading": "How It Works",
                "bullets": ["Complete online evaluation", "Video visit with a psychiatrist", "Same-day prescriptions possible", "Sent to your local pharmacy"],
                "narration": "Here's how it works: You complete an online evaluation, then have a video visit with a board-certified psychiatrist. Same-day prescriptions are possible, sent directly to your local pharmacy."
            },
            {
                "heading": "What's Prescribed",
                "bullets": ["Stimulants (Adderall, Vyvanse)", "Non-stimulants (Strattera, Qelbree)", "Personalized treatment plans", "Regular follow-up monitoring"],
                "narration": "Both stimulant and non-stimulant medications can be prescribed through telehealth. That includes medications like Adderall, Vyvanse, Strattera, and Qelbree — all with personalized treatment plans."
            },
            {
                "heading": "Florida Legal Update",
                "bullets": ["DEA telehealth flexibilities extended", "No in-person visit required initially", "Must be Florida resident", "Valid photo ID needed"],
                "narration": "Good news for Florida residents: DEA telehealth flexibilities have been extended. You don't need an in-person visit to start. You just need to be a Florida resident with a valid photo I.D."
            },
            {
                "heading": "Insurance & Coverage",
                "bullets": ["Aetna ✓  United ✓  Cigna ✓", "Humana ✓  Oscar ✓  UMR ✓", "Most plans cover telehealth", "Call to verify your benefits"],
                "narration": "Most major insurance plans cover telehealth psychiatry, including Aetna, United, Cigna, Humana, Oscar, and UMR. Call us to verify your specific benefits."
            }
        ],
        "cta_narration": "Ready to get started? Book your ADHD evaluation with Refresh Psychiatry. Visit refresh psychiatry dot com or call nine five four, six zero three, four zero eight one."
    },
    {
        "id": "Blog3-BoxBreathing",
        "title": "Box Breathing\nin 30 Seconds",
        "subtitle": "A Psychiatrist's Guide\nto Instant Calm",
        "blog_url": "https://www.refreshpsychiatry.com/post/box-breathing-in-30-seconds-a-psychiatrist-s-guide-to-instant-calm",
        "image_queries": [
            "person breathing meditation calm peaceful",
            "box square breathing technique diagram",
            "calm ocean waves zen peaceful",
            "person relaxing nature deep breath",
            "brain nervous system vagus nerve",
            "morning calm routine wellness"
        ],
        "slides": [
            {
                "heading": "Box Breathing",
                "bullets": ["A psychiatrist-approved technique", "for instant calm —", "in just 30 seconds."],
                "narration": "What if you could calm your anxiety in just thirty seconds? Box breathing is a psychiatrist-approved technique used by Navy SEALs, first responders, and therapists worldwide."
            },
            {
                "heading": "The 4-4-4-4 Technique",
                "bullets": ["Breathe IN → 4 seconds", "HOLD → 4 seconds", "Breathe OUT → 4 seconds", "HOLD → 4 seconds"],
                "narration": "Here's how it works. Breathe in for four seconds. Hold for four seconds. Breathe out for four seconds. Hold again for four seconds. That's one cycle. Repeat three to four times."
            },
            {
                "heading": "The Science Behind It",
                "bullets": ["Activates vagus nerve", "Shifts to parasympathetic mode", "Lowers cortisol & heart rate", "Measurable in 30 seconds"],
                "narration": "The science is clear. Box breathing activates your vagus nerve, shifting your body from fight-or-flight into rest-and-digest mode. It lowers cortisol and heart rate — measurably, in just thirty seconds."
            },
            {
                "heading": "When to Use It",
                "bullets": ["Before a stressful meeting", "During a panic attack", "When you can't fall asleep", "In traffic or waiting rooms"],
                "narration": "Use it before a stressful meeting, during a panic attack, when you can't fall asleep, or even in traffic. It's invisible — no one will know you're doing it."
            },
            {
                "heading": "Beyond Breathing",
                "bullets": ["Breathing is a great first step", "Persistent anxiety needs more", "Medication + therapy options", "You deserve comprehensive care"],
                "narration": "Box breathing is a wonderful first step. But if anxiety persists despite these techniques, it may be time for a professional evaluation. Medication and therapy can work alongside breathing exercises."
            }
        ],
        "cta_narration": "At Refresh Psychiatry, we combine evidence-based tools with compassionate care. Book your appointment at refresh psychiatry dot com."
    },
    {
        "id": "Blog4-SpringAnxiety",
        "title": "Why Does My Anxiety\nGet Worse in Spring?",
        "subtitle": "Seasonal Symptoms You\nShouldn't Ignore",
        "blog_url": "https://www.refreshpsychiatry.com/post/why-does-my-anxiety-get-worse-in-spring-seasonal-symptoms-you-shouldn-t-ignore",
        "image_queries": [
            "spring flowers blooming anxiety overwhelming",
            "pollen allergies spring sneezing",
            "person worried anxious outdoors spring",
            "sunlight bright daylight change mood",
            "woman walking park spring calm",
            "doctor patient spring consultation"
        ],
        "slides": [
            {
                "heading": "Spring Anxiety Is Real",
                "bullets": ["Everyone talks about winter blues", "But spring anxiety affects millions", "Here's why — and what to do."],
                "narration": "Everyone talks about the winter blues, but spring anxiety is a real clinical phenomenon that affects millions of people. If your anxiety gets worse when the flowers bloom, you're not alone."
            },
            {
                "heading": "Why Spring Triggers Anxiety",
                "bullets": ["Longer days disrupt sleep cycles", "Pollen triggers inflammatory response", "Social pressure to 'be happy'", "Schedule changes add stress"],
                "narration": "Longer days disrupt your sleep cycles. Pollen triggers an inflammatory response that can worsen mood. There's social pressure to feel happy. And schedule changes from spring activities add stress."
            },
            {
                "heading": "Symptoms to Watch For",
                "bullets": ["Increased restlessness", "Difficulty sleeping despite fatigue", "Irritability without clear cause", "Racing thoughts in the evening"],
                "narration": "Watch for increased restlessness, difficulty sleeping even when you're tired, irritability without a clear cause, and racing thoughts, especially in the evening hours."
            },
            {
                "heading": "What You Can Do",
                "bullets": ["Maintain consistent sleep schedule", "Manage allergy symptoms early", "Limit caffeine & alcohol", "Continue or start therapy"],
                "narration": "What helps? Maintain a consistent sleep schedule even as days get longer. Manage allergy symptoms early. Limit caffeine and alcohol. And don't stop therapy just because winter is over."
            },
            {
                "heading": "When It's More Than Seasonal",
                "bullets": ["Anxiety lasting more than 2 weeks", "Interfering with work or school", "Physical symptoms (chest, stomach)", "Avoiding activities you enjoy"],
                "narration": "If your anxiety lasts more than two weeks, interferes with work or school, causes physical symptoms, or makes you avoid things you enjoy — that's a sign to see a psychiatrist."
            }
        ],
        "cta_narration": "Refresh Psychiatry offers telehealth across Florida, Massachusetts, and Texas. Don't wait for spring anxiety to pass on its own. Visit refresh psychiatry dot com today."
    },
    {
        "id": "Blog5-DaylightSaving",
        "title": "Why You Feel Off\nThis Week",
        "subtitle": "The Hidden Mental Health\nImpact of Daylight Saving",
        "blog_url": "https://www.refreshpsychiatry.com/post/why-you-feel-off-this-week-the-hidden-mental-health-impact-of-daylight-saving-time",
        "image_queries": [
            "alarm clock time change morning groggy",
            "circadian rhythm sleep cycle diagram",
            "tired person yawning office fatigue",
            "brain sleep melatonin night",
            "person exercising morning sunlight",
            "peaceful sleep bedroom night routine"
        ],
        "slides": [
            {
                "heading": "Why You Feel Off\nThis Week",
                "bullets": ["Daylight Saving Time just hit.", "That one hour matters more", "than you think."],
                "narration": "If you've been feeling off this week — more tired, more irritable, just not yourself — there's a real reason. Daylight Saving Time disrupts your brain more than you might think."
            },
            {
                "heading": "Your Brain on DST",
                "bullets": ["Circadian rhythm disrupted", "Melatonin production shifts", "Cortisol timing thrown off", "Effects last 5-7 days minimum"],
                "narration": "That one-hour shift disrupts your circadian rhythm — the internal clock controlling sleep, mood, and energy. Melatonin and cortisol timing get thrown off. The effects can last five to seven days."
            },
            {
                "heading": "Mental Health Impact",
                "bullets": ["25% spike in heart attacks (Mon)", "Increased anxiety & irritability", "Workplace injuries increase", "Depression symptoms worsen"],
                "narration": "Studies show a twenty-five percent spike in heart attacks the Monday after the time change. Anxiety and irritability increase. Workplace injuries go up. And depression symptoms can worsen significantly."
            },
            {
                "heading": "How to Recover",
                "bullets": ["Get morning sunlight exposure", "Avoid screens before bed", "Keep meals at regular times", "Exercise — but not late at night"],
                "narration": "To recover faster, get morning sunlight exposure to reset your clock. Avoid screens before bed. Keep meals at regular times. And exercise — but not too late at night."
            },
            {
                "heading": "Protect Your Mental Health",
                "bullets": ["Be patient with yourself", "This disruption is temporary", "But pre-existing conditions may flare", "Professional support is available"],
                "narration": "Be patient with yourself. This disruption is temporary for most people. But if you have a pre-existing mood or anxiety disorder, it may flare up. Professional support is always available."
            }
        ],
        "cta_narration": "Refresh Psychiatry is here for you — across Florida, Massachusetts, and Texas. Book your telehealth visit at refresh psychiatry dot com."
    }
]

# ═══════════════ IMAGE DOWNLOADING ═══════════════
def download_image(query, filename):
    """Download a stock photo from Unsplash (free, no API key for source images)."""
    path = IMG_CACHE / filename
    if path.exists() and path.stat().st_size > 10000:
        return path

    # Use Unsplash Source (random photo by keyword, 1080x1920)
    url = f"https://source.unsplash.com/1080x1920/?{query.replace(' ', ',')}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
        if len(data) > 5000:
            path.write_bytes(data)
            return path
    except Exception as e:
        print(f"    [img] Unsplash failed for '{query}': {e}")

    # Fallback: generate a gradient image
    return generate_gradient_image(path)

def generate_gradient_image(path):
    """Generate a professional gradient background as fallback."""
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)
    for y in range(H):
        r = int(NAVY[0] + (BLUE[0] - NAVY[0]) * y / H)
        g = int(NAVY[1] + (BLUE[1] - NAVY[1]) * y / H)
        b = int(NAVY[2] + (BLUE[2] - NAVY[2]) * y / H)
        draw.line([(0, y), (W, y)], fill=(r, g, b))
    img.save(str(path), quality=90)
    return path

# ═══════════════ SLIDE RENDERING ═══════════════
def get_font(size, bold=False):
    """Try to load a system font, fall back to default."""
    for name in ["arial", "arialbd" if bold else "arial", "calibri", "segoeui"]:
        for ext in [".ttf", "b.ttf" if bold else ".ttf"]:
            for d in [r"C:\Windows\Fonts", "/usr/share/fonts/truetype"]:
                p = os.path.join(d, name + ext)
                if os.path.exists(p):
                    try:
                        return ImageFont.truetype(p, size)
                    except:
                        pass
    return ImageFont.load_default()

def render_slide(bg_path, heading, bullets, slide_type="content", progress=0.0):
    """Render a single slide frame with background image and text overlay."""
    img = Image.new("RGB", (W, H), NAVY)

    # Load and fit background image
    try:
        bg = Image.open(bg_path).convert("RGB")
        # Apply Ken Burns: slight zoom based on progress
        zoom = 1.0 + 0.15 * progress
        new_w = int(W * zoom)
        new_h = int(H * zoom)
        bg = bg.resize((new_w, new_h), Image.LANCZOS)
        # Center crop
        left = (new_w - W) // 2
        top = (new_h - H) // 2
        bg = bg.crop((left, top, left + W, top + H))
        img.paste(bg, (0, 0))
    except:
        pass

    draw = ImageDraw.Draw(img)

    # Dark gradient overlay (heavier at bottom where text appears)
    for y in range(H):
        # Top: 30% opacity, Bottom: 85% opacity
        alpha = int(255 * (0.30 + 0.55 * (y / H)))
        draw.line([(0, y), (W, y)], fill=(NAVY[0], NAVY[1], NAVY[2], alpha))

    # Since PIL doesn't support alpha blending on RGB easily, re-composite
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for y in range(H):
        alpha = int(255 * (0.25 + 0.55 * (y / H) ** 1.2))
        od.line([(0, y), (W, y)], fill=(NAVY[0], NAVY[1], NAVY[2], alpha))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(img)

    # Top brand bar
    draw.rectangle([(0, 0), (W, 6)], fill=YELLOW)

    # Logo text at top
    font_logo = get_font(28, bold=True)
    draw.text((40, 40), "REFRESH PSYCHIATRY", fill=YELLOW, font=font_logo)
    draw.text((40, 75), "refreshpsychiatry.com", fill=(180, 200, 220), font=get_font(20))

    if slide_type == "title":
        # Title slide: big heading centered
        font_title = get_font(72, bold=True)
        font_sub = get_font(36)

        # Draw heading
        y_pos = H // 2 - 200
        for line in heading.split("\n"):
            bbox = draw.textbbox((0, 0), line, font=font_title)
            tw = bbox[2] - bbox[0]
            draw.text(((W - tw) // 2, y_pos), line, fill=WHITE, font=font_title)
            y_pos += 90

        # Yellow divider
        y_pos += 20
        draw.rectangle([(W//2 - 60, y_pos), (W//2 + 60, y_pos + 4)], fill=YELLOW)
        y_pos += 40

        # Subtitle
        for line in (bullets[0] if isinstance(bullets, list) and bullets else "").split("\n"):
            bbox = draw.textbbox((0, 0), line, font=font_sub)
            tw = bbox[2] - bbox[0]
            draw.text(((W - tw) // 2, y_pos), line, fill=(200, 215, 230), font=font_sub)
            y_pos += 50

    elif slide_type == "cta":
        # CTA slide
        font_cta = get_font(52, bold=True)
        font_sub = get_font(32)
        font_url = get_font(36, bold=True)

        y_pos = H // 2 - 180

        text = "Ready to Take the\nNext Step?"
        for line in text.split("\n"):
            bbox = draw.textbbox((0, 0), line, font=font_cta)
            tw = bbox[2] - bbox[0]
            draw.text(((W - tw) // 2, y_pos), line, fill=WHITE, font=font_cta)
            y_pos += 70

        y_pos += 30
        draw.rectangle([(W//2 - 60, y_pos), (W//2 + 60, y_pos + 4)], fill=YELLOW)
        y_pos += 50

        # CTA button
        btn_text = "refreshpsychiatry.com"
        bbox = draw.textbbox((0, 0), btn_text, font=font_url)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        bx = (W - tw) // 2 - 30
        by = y_pos
        draw.rounded_rectangle([(bx, by), (bx + tw + 60, by + th + 30)], radius=25, fill=YELLOW)
        draw.text((bx + 30, by + 12), btn_text, fill=NAVY, font=font_url)

        y_pos += th + 80
        phone = "(954) 603-4081"
        bbox = draw.textbbox((0, 0), phone, font=font_sub)
        tw = bbox[2] - bbox[0]
        draw.text(((W - tw) // 2, y_pos), phone, fill=(200, 215, 230), font=font_sub)

        y_pos += 60
        locs = "FL  •  MA  •  TX"
        bbox = draw.textbbox((0, 0), locs, font=font_sub)
        tw = bbox[2] - bbox[0]
        draw.text(((W - tw) // 2, y_pos), locs, fill=YELLOW, font=font_sub)

    else:
        # Content slide: heading + bullet points
        font_heading = get_font(48, bold=True)
        font_bullet = get_font(34)

        # Heading area
        y_pos = 180
        for line in heading.split("\n"):
            draw.text((60, y_pos), line, fill=YELLOW, font=font_heading)
            y_pos += 60

        # Divider
        y_pos += 15
        draw.rectangle([(60, y_pos), (200, y_pos + 3)], fill=YELLOW)
        y_pos += 40

        # Bullets
        for bullet in bullets:
            # Wrap long bullets
            wrapped = textwrap.wrap(bullet, width=32)
            for i, wline in enumerate(wrapped):
                prefix = "•  " if i == 0 else "    "
                draw.text((60, y_pos), prefix + wline, fill=WHITE, font=font_bullet)
                y_pos += 52
            y_pos += 8

    # Bottom bar with progress
    bar_y = H - 12
    draw.rectangle([(0, bar_y), (W, H)], fill=NAVY)
    if progress > 0:
        draw.rectangle([(0, bar_y), (int(W * progress), H)], fill=YELLOW)

    return img

# ═══════════════ AUDIO GENERATION ═══════════════
async def generate_narration(text, output_path):
    """Generate TTS audio using edge-tts Jenny Neural voice."""
    import edge_tts
    communicate = edge_tts.Communicate(
        text,
        voice="en-US-JennyNeural",
        rate="-5%",
        pitch="+0Hz"
    )
    await communicate.save(str(output_path))

def get_audio_duration(path):
    """Get duration of audio file in seconds using ffprobe."""
    cmd = [
        FFMPEG.replace("ffmpeg-win", "ffprobe-win") if "ffprobe" not in FFMPEG else FFMPEG,
        "-v", "quiet",
        "-show_entries", "format=duration",
        "-of", "csv=p=0",
        str(path)
    ]
    # Use ffmpeg to get duration by re-encoding to null
    cmd2 = [
        FFMPEG, "-i", str(path), "-f", "null", "-"
    ]
    try:
        result = subprocess.run(cmd2, capture_output=True, text=True, timeout=30)
        # Parse duration from stderr
        for line in result.stderr.split("\n"):
            if "Duration:" in line:
                parts = line.split("Duration:")[1].split(",")[0].strip()
                h, m, s = parts.split(":")
                return float(h) * 3600 + float(m) * 60 + float(s)
    except:
        pass
    return 10.0  # fallback

# ═══════════════ VIDEO ASSEMBLY ═══════════════
def build_video(blog):
    """Build a complete 60-second video for a blog post."""
    vid_id = blog["id"]
    print(f"\n  {vid_id}...")

    work = OUT / vid_id
    work.mkdir(exist_ok=True)

    # Step 1: Download background images
    print(f"    Downloading images...", end="", flush=True)
    bg_images = []
    for i, query in enumerate(blog["image_queries"]):
        fname = f"{vid_id}_bg{i}.jpg"
        path = download_image(query, fname)
        bg_images.append(path)
        print(f" {i+1}", end="", flush=True)
    print(" OK")

    # Step 2: Generate all narration audio
    print(f"    Generating narration...", end="", flush=True)
    audio_parts = []
    all_narration = []

    # Title slide narration (use first slide's narration)
    for i, slide in enumerate(blog["slides"]):
        audio_path = work / f"narration_{i}.mp3"
        asyncio.run(generate_narration(slide["narration"], audio_path))
        dur = get_audio_duration(audio_path)
        audio_parts.append({"path": audio_path, "duration": dur})
        all_narration.append(slide["narration"])
        print(f" s{i+1}", end="", flush=True)

    # CTA narration
    cta_audio = work / "narration_cta.mp3"
    asyncio.run(generate_narration(blog["cta_narration"], cta_audio))
    cta_dur = get_audio_duration(cta_audio)
    audio_parts.append({"path": cta_audio, "duration": cta_dur})
    print(" cta OK")

    # Step 3: Concatenate all audio
    print(f"    Merging audio...", end="", flush=True)
    concat_list = work / "audio_concat.txt"
    with open(concat_list, "w") as f:
        # Add 1s silence at start (title card)
        silence = work / "silence.mp3"
        subprocess.run([
            FFMPEG, "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
            "-t", "2", "-q:a", "9", "-acodec", "libmp3lame", str(silence)
        ], capture_output=True, timeout=30)
        f.write(f"file '{silence}'\n")

        for part in audio_parts:
            f.write(f"file '{part['path']}'\n")
            # Add 0.5s pause between slides
            f.write(f"file '{silence.with_name('pause.mp3')}'\n")

    # Create short pause
    subprocess.run([
        FFMPEG, "-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
        "-t", "0.5", "-q:a", "9", "-acodec", "libmp3lame", str(silence.with_name("pause.mp3"))
    ], capture_output=True, timeout=30)

    full_audio = work / "full_narration.mp3"
    subprocess.run([
        FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", str(concat_list),
        "-acodec", "libmp3lame", "-q:a", "2", str(full_audio)
    ], capture_output=True, timeout=60)

    total_duration = get_audio_duration(full_audio)
    # Ensure minimum 60 seconds
    target_duration = max(60.0, total_duration)
    print(f" {total_duration:.1f}s OK")

    # Step 4: Render video frames
    print(f"    Rendering frames...", end="", flush=True)
    total_frames = int(target_duration * FPS)

    # Calculate timing: title(3s) + slides + cta(remaining)
    title_frames = 3 * FPS  # 3 seconds for title
    cta_frames = int(cta_dur * FPS) + 2 * FPS  # CTA duration + 2s buffer
    content_frames = total_frames - title_frames - cta_frames
    frames_per_slide = content_frames // len(blog["slides"])

    frame_dir = work / "frames"
    frame_dir.mkdir(exist_ok=True)

    frame_num = 0

    # Title slide frames
    for f_idx in range(title_frames):
        progress = f_idx / total_frames
        frame = render_slide(
            bg_images[0], blog["title"],
            [blog["subtitle"].replace("\n", "\n")],
            slide_type="title", progress=progress
        )
        frame.save(str(frame_dir / f"frame_{frame_num:05d}.jpg"), quality=85)
        frame_num += 1

    print(f" title", end="", flush=True)

    # Content slides
    for s_idx, slide in enumerate(blog["slides"]):
        bg_img = bg_images[min(s_idx + 1, len(bg_images) - 1)]
        for f_idx in range(frames_per_slide):
            progress = (title_frames + s_idx * frames_per_slide + f_idx) / total_frames
            frame = render_slide(
                bg_img, slide["heading"], slide["bullets"],
                slide_type="content", progress=progress
            )
            frame.save(str(frame_dir / f"frame_{frame_num:05d}.jpg"), quality=85)
            frame_num += 1
        print(f" s{s_idx+1}", end="", flush=True)

    # CTA slide frames (fill remaining)
    remaining = total_frames - frame_num
    for f_idx in range(max(remaining, cta_frames)):
        progress = (frame_num) / total_frames
        frame = render_slide(
            bg_images[-1], "", [],
            slide_type="cta", progress=min(progress, 1.0)
        )
        frame.save(str(frame_dir / f"frame_{frame_num:05d}.jpg"), quality=85)
        frame_num += 1

    print(f" cta OK ({frame_num} frames)")

    # Step 5: Encode video
    print(f"    Encoding video...", end="", flush=True)
    raw_video = work / "raw.mp4"
    subprocess.run([
        FFMPEG, "-y",
        "-framerate", str(FPS),
        "-i", str(frame_dir / "frame_%05d.jpg"),
        "-c:v", "libx264", "-pix_fmt", "yuv420p",
        "-preset", "medium", "-crf", "23",
        "-movflags", "+faststart",
        str(raw_video)
    ], capture_output=True, timeout=300)

    # Merge video + audio
    final = OUT / f"{vid_id}.mp4"
    subprocess.run([
        FFMPEG, "-y",
        "-i", str(raw_video),
        "-i", str(full_audio),
        "-c:v", "copy", "-c:a", "aac", "-b:a", "128k",
        "-shortest",
        "-movflags", "+faststart",
        str(final)
    ], capture_output=True, timeout=300)

    size_mb = final.stat().st_size / (1024 * 1024)
    print(f" OK ({size_mb:.1f} MB)")

    # Cleanup frames to save space
    import shutil
    shutil.rmtree(frame_dir, ignore_errors=True)

    return final

# ═══════════════ MAIN ═══════════════
if __name__ == "__main__":
    print("=" * 60)
    print("GENERATING 5 x 60-SECOND BLOG VIDEOS")
    print("With AI images + Jenny Neural narration")
    print("=" * 60)

    results = []
    for blog in BLOGS:
        try:
            path = build_video(blog)
            results.append((blog["id"], path))
        except Exception as e:
            print(f"  ERROR: {blog['id']} — {e}")
            import traceback
            traceback.print_exc()

    print("\n" + "=" * 60)
    print(f"COMPLETE: {len(results)}/{len(BLOGS)} videos generated")
    for vid_id, path in results:
        print(f"  ✓ {vid_id} — {path.stat().st_size / 1024 / 1024:.1f} MB")
    print("=" * 60)
