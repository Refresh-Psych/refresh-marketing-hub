"""
Download curated stock images from Pexels for each video topic.
Uses direct Pexels image URLs (free, high quality, commercially licensed).
Falls back to creating professional Pillow illustrations if download fails.
"""
import requests
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math

OUTPUT_DIR = r"C:\Users\jnepa\OneDrive\Desktop\Psych News\narrations\images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Curated Pexels image URLs for each video topic
# These are direct CDN links to high-quality, commercially-free photos
IMAGE_SOURCES = {
    # Original 11 videos
    "why-choose-refresh": {
        "url": "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=1280",
        "desc": "Doctor on telehealth consultation",
        "size": (1920, 1080),
    },
    "services-showcase": {
        "url": "https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&w=1280",
        "desc": "Mental health therapy session",
        "size": (1080, 1920),
    },
    "adhd-treatment": {
        "url": "https://images.pexels.com/photos/3808057/pexels-photo-3808057.jpeg?auto=compress&cs=tinysrgb&w=1280",
        "desc": "Person focusing, concentration",
        "size": (1080, 1920),
    },
    "telehealth-fl": {
        "url": "https://images.pexels.com/photos/4031818/pexels-photo-4031818.jpeg?auto=compress&cs=tinysrgb&w=1280",
        "desc": "Telehealth from home on laptop",
        "size": (1920, 1080),
    },
    "V1-ChildVsAdultADHD": {
        "url": "https://images.pexels.com/photos/8363104/pexels-photo-8363104.jpeg?auto=compress&cs=tinysrgb&w=1280",
        "desc": "Parent and child learning together",
        "size": (1080, 1920),
    },
    "V2-Pharmacogenomics": {
        "url": "https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=1280",
        "desc": "DNA science laboratory",
        "size": (1920, 1080),
    },
    "V3-TelepsychiatryFL": {
        "url": "https://images.pexels.com/photos/5699475/pexels-photo-5699475.jpeg?auto=compress&cs=tinysrgb&w=1280",
        "desc": "Florida telehealth patient at home",
        "size": (1920, 1080),
    },
    "V4-AnxietyVsDepression": {
        "url": "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1280",
        "desc": "Person contemplating mental health",
        "size": (1080, 1920),
    },
    "V5-FirstAppointment": {
        "url": "https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg?auto=compress&cs=tinysrgb&w=1280",
        "desc": "Doctor consultation first visit",
        "size": (1080, 1920),
    },
    "V6-SpringAnxiety": {
        "url": "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=1280",
        "desc": "Spring flowers nature calm",
        "size": (1920, 1080),
    },
    "V7-WhyRefresh": {
        "url": "https://images.pexels.com/photos/5699491/pexels-photo-5699491.jpeg?auto=compress&cs=tinysrgb&w=1280",
        "desc": "Professional psychiatric care",
        "size": (1080, 1920),
    },
    # Blog-based 5 videos
    "B1-DopamineMyth": {
        "url": "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1280",
        "desc": "Person using smartphone brain science",
        "size": (1080, 1920),
    },
    "B2-ADHDTelehealth2026": {
        "url": "https://images.pexels.com/photos/5699479/pexels-photo-5699479.jpeg?auto=compress&cs=tinysrgb&w=1280",
        "desc": "Telehealth ADHD consultation",
        "size": (1080, 1920),
    },
    "B3-BoxBreathing": {
        "url": "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=1280",
        "desc": "Meditation breathing calm person",
        "size": (1080, 1920),
    },
    "B4-SpringAnxiety2": {
        "url": "https://images.pexels.com/photos/1028930/pexels-photo-1028930.jpeg?auto=compress&cs=tinysrgb&w=1280",
        "desc": "Spring cherry blossoms nature",
        "size": (1920, 1080),
    },
    "B5-DaylightSaving": {
        "url": "https://images.pexels.com/photos/1178684/pexels-photo-1178684.jpeg?auto=compress&cs=tinysrgb&w=1280",
        "desc": "Alarm clock morning light sleep",
        "size": (1920, 1080),
    },
}


def download_image(name, info):
    """Download and process an image for a video."""
    output_path = os.path.join(OUTPUT_DIR, f"{name}.jpg")
    w, h = info["size"]

    try:
        print(f"  Downloading: {name} ({info['desc']})...", end=" ", flush=True)
        resp = requests.get(info["url"], timeout=30, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        resp.raise_for_status()

        # Save raw download
        raw_path = os.path.join(OUTPUT_DIR, f"{name}_raw.jpg")
        with open(raw_path, "wb") as f:
            f.write(resp.content)

        # Open, resize/crop to target dimensions
        img = Image.open(raw_path).convert("RGB")

        # Center crop to target aspect ratio
        src_ratio = img.width / img.height
        tgt_ratio = w / h

        if src_ratio > tgt_ratio:
            # Source is wider, crop sides
            new_w = int(img.height * tgt_ratio)
            left = (img.width - new_w) // 2
            img = img.crop((left, 0, left + new_w, img.height))
        else:
            # Source is taller, crop top/bottom
            new_h = int(img.width / tgt_ratio)
            top = (img.height - new_h) // 2
            img = img.crop((0, top, img.width, top + new_h))

        img = img.resize((w, h), Image.LANCZOS)
        img.save(output_path, "JPEG", quality=90)

        # Cleanup raw
        os.remove(raw_path)

        size_kb = os.path.getsize(output_path) // 1024
        print(f"OK ({size_kb} KB)")
        return output_path

    except Exception as e:
        print(f"FAILED ({e})")
        # Create fallback gradient image
        return create_fallback_image(name, info, output_path)


def create_fallback_image(name, info, output_path):
    """Create a professional gradient image as fallback."""
    w, h = info["size"]
    img = Image.new("RGB", (w, h))
    draw = ImageDraw.Draw(img)

    # Professional gradient
    NAVY = (13, 33, 55)
    BLUE = (43, 108, 176)
    for y in range(h):
        t = y / h
        color = tuple(int(NAVY[i] + (BLUE[i] - NAVY[i]) * t) for i in range(3))
        draw.line([(0, y), (w, y)], fill=color)

    # Add subtle circles
    for i in range(8):
        cx = int(w * (0.1 + 0.12 * i))
        cy = int(h * (0.3 + 0.1 * math.sin(i)))
        r = 60 + i * 15
        overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        od = ImageDraw.Draw(overlay)
        od.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(43, 108, 176, 15))
        img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")

    img.save(output_path, "JPEG", quality=90)
    print(f"  (fallback gradient created)")
    return output_path


def main():
    print(f"Downloading {len(IMAGE_SOURCES)} images...\n")
    success = 0
    for name, info in IMAGE_SOURCES.items():
        result = download_image(name, info)
        if result:
            success += 1
    print(f"\nDone: {success}/{len(IMAGE_SOURCES)} images ready")


if __name__ == "__main__":
    main()
