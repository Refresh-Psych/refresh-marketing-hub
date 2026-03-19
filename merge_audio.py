"""
Merge narration MP3 audio tracks into video MP4 files using ffmpeg.
Output: new MP4 files with embedded audio in narrations/merged/ directory.
"""
import subprocess
import os

FFMPEG = r"C:\Users\jnepa\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin\ffmpeg.exe"
VIDEO_DIR = r"C:\Users\jnepa\OneDrive\Desktop\Psych News\refresh-videos\out"
AUDIO_DIR = r"C:\Users\jnepa\OneDrive\Desktop\Psych News\narrations"
OUTPUT_DIR = r"C:\Users\jnepa\OneDrive\Desktop\Psych News\narrations\merged"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Map: video filename -> narration filename (both without extension)
VIDEOS = [
    "why-choose-refresh",
    "services-showcase",
    "adhd-treatment",
    "telehealth-fl",
    "V1-ChildVsAdultADHD",
    "V2-Pharmacogenomics",
    "V3-TelepsychiatryFL",
    "V4-AnxietyVsDepression",
    "V5-FirstAppointment",
    "V6-SpringAnxiety",
    "V7-WhyRefresh",
]

success = 0
for name in VIDEOS:
    video_path = os.path.join(VIDEO_DIR, f"{name}.mp4")
    audio_path = os.path.join(AUDIO_DIR, f"{name}.mp3")
    output_path = os.path.join(OUTPUT_DIR, f"{name}.mp4")

    if not os.path.exists(video_path):
        print(f"  [SKIP] Video not found: {name}.mp4")
        continue
    if not os.path.exists(audio_path):
        print(f"  [SKIP] Audio not found: {name}.mp3")
        continue

    # ffmpeg: take video from input 0, audio from input 1
    # -shortest: end when the shortest stream ends (video length)
    # -c:v copy: don't re-encode video (fast, lossless)
    # -c:a aac: encode audio as AAC for compatibility
    cmd = [
        FFMPEG,
        "-y",                   # overwrite output
        "-i", video_path,       # input 0: video
        "-i", audio_path,       # input 1: audio narration
        "-c:v", "copy",         # copy video stream (no re-encode)
        "-c:a", "aac",          # encode audio as AAC
        "-b:a", "192k",         # audio bitrate
        "-map", "0:v:0",        # use video from first input
        "-map", "1:a:0",        # use audio from second input
        "-shortest",            # match shortest stream length
        "-movflags", "+faststart",  # web-optimized
        output_path
    ]

    print(f"  Merging: {name}...", end=" ", flush=True)
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        size_mb = os.path.getsize(output_path) / (1024 * 1024)
        print(f"OK ({size_mb:.1f} MB)")
        success += 1
    else:
        print(f"FAILED")
        print(f"    Error: {result.stderr[-200:]}")

print(f"\nDone: {success}/{len(VIDEOS)} videos merged with narration audio")
