"""
Generate narrations for the 5 blog-based videos and merge audio into MP4s.
"""
import asyncio
import subprocess
import os
import edge_tts

VOICE = "en-US-JennyNeural"
FFMPEG = r"C:\Users\jnepa\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin\ffmpeg.exe"
AUDIO_DIR = r"C:\Users\jnepa\OneDrive\Desktop\Psych News\narrations"
VIDEO_DIR = r"C:\Users\jnepa\OneDrive\Desktop\Psych News\narrations\merged"

NARRATIONS = {
    "B1-DopamineMyth": (
        "You've probably heard that scrolling your phone floods your brain with dopamine, "
        "and that a digital detox is the cure. But here's what the science actually says. "
        "Dopamine isn't just a pleasure chemical. It's involved in motivation, learning, and attention. "
        "Feeling distracted doesn't mean your brain is broken. It means your nervous system "
        "has adapted to a high-stimulation environment. "
        "The solution isn't total avoidance. It's building intentional habits around how you engage with technology. "
        "Read the full article on the Refresh Psychiatry blog."
    ),
    "B2-ADHDTelehealth2026": (
        "Can you get ADHD medication through telehealth in Florida? "
        "The answer in 2026 is yes. Florida law allows board-certified psychiatrists "
        "to prescribe ADHD medications, including Schedule Two stimulants, through secure video visits. "
        "At Refresh Psychiatry, the process starts with a comprehensive virtual evaluation. "
        "Your provider reviews your history, discusses your symptoms, "
        "and creates a personalized treatment plan. Most major insurance plans are accepted. "
        "No office visit required. Quality ADHD care, from wherever you are in Florida."
    ),
    "B3-BoxBreathing": (
        "Feeling overwhelmed? Try box breathing. It takes just thirty seconds "
        "and it's used by Navy SEALs and first responders to find instant calm. "
        "Here's how it works. Inhale slowly for four seconds. "
        "Hold your breath for four seconds. Exhale gently for four seconds. "
        "Then hold again for four seconds. That's one cycle. "
        "This simple technique activates your parasympathetic nervous system, "
        "shifting your body from stress mode into focused calm. "
        "Try it right now. Learn more on the Refresh Psychiatry blog."
    ),
    "B4-SpringAnxiety2": (
        "Spring is supposed to feel like a fresh start. But for many people, "
        "it actually triggers increased anxiety. Why? "
        "Shifts in daylight exposure directly affect your brain chemistry. "
        "Changes in routine, social pressure, and even seasonal allergies "
        "can all contribute to heightened worry and unease. "
        "If you've been feeling more anxious this season, you're not imagining it. "
        "At Refresh Psychiatry, we understand seasonal mental health patterns "
        "and we're here to help you feel your best, no matter the time of year."
    ),
    "B5-DaylightSaving": (
        "If you've been feeling off this week, daylight saving time might be the reason. "
        "That one-hour clock change does more than steal an hour of sleep. "
        "It disrupts your circadian rhythm, the internal clock that regulates "
        "your sleep, mood, appetite, and energy levels. "
        "Research shows the effects can last well beyond the first few days, "
        "causing irritability, fatigue, and difficulty concentrating. "
        "The key factor is light exposure. Your body needs time to adjust. "
        "If you're struggling, Refresh Psychiatry can help you navigate these transitions."
    ),
}


async def generate_audio(name, text):
    """Generate narration MP3."""
    output_path = os.path.join(AUDIO_DIR, f"{name}.mp3")
    communicate = edge_tts.Communicate(text, VOICE, rate="-5%", pitch="+0Hz", volume="+0%")
    await communicate.save(output_path)
    print(f"  [OK] Audio: {name}.mp3")
    return output_path


def merge_audio_video(name):
    """Merge narration audio into video."""
    video_path = os.path.join(VIDEO_DIR, f"{name}.mp4")
    audio_path = os.path.join(AUDIO_DIR, f"{name}.mp3")
    temp_path = os.path.join(VIDEO_DIR, f"{name}_temp.mp4")

    if not os.path.exists(video_path) or not os.path.exists(audio_path):
        print(f"  [SKIP] Missing file for {name}")
        return False

    # Rename original video to temp
    os.rename(video_path, temp_path)

    cmd = [
        FFMPEG, "-y",
        "-i", temp_path,
        "-i", audio_path,
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-shortest",
        "-movflags", "+faststart",
        video_path
    ]

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    os.remove(temp_path)

    if result.returncode == 0:
        size_mb = os.path.getsize(video_path) / (1024 * 1024)
        print(f"  [OK] Merged: {name}.mp4 ({size_mb:.1f} MB)")
        return True
    else:
        print(f"  [FAIL] Merge: {name} - {result.stderr[-150:]}")
        return False


async def main():
    print("Step 1: Generating narration audio...\n")
    tasks = [generate_audio(name, text) for name, text in NARRATIONS.items()]
    await asyncio.gather(*tasks)

    print("\nStep 2: Merging audio into videos...\n")
    success = 0
    for name in NARRATIONS:
        if merge_audio_video(name):
            success += 1

    print(f"\nDone: {success}/{len(NARRATIONS)} blog videos with narration")


if __name__ == "__main__":
    asyncio.run(main())
