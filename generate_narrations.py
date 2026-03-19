"""
Generate professional female voice narrations for all 11 Refresh Psychiatry marketing videos.
Uses Microsoft Edge TTS (Jenny Neural voice) - warm, professional, natural-sounding.
"""
import asyncio
import edge_tts

VOICE = "en-US-JennyNeural"
OUTPUT_DIR = r"C:\Users\jnepa\OneDrive\Desktop\Psych News\narrations"

# Each narration is timed to match its video duration
# Voice: warm, approachable, professional — never clinical or salesy
NARRATIONS = {
    "why-choose-refresh": {
        "duration": 25,
        "text": (
            "At Refresh Psychiatry, we believe mental health care should feel personal, "
            "not impersonal. Led by Dr. Justin Nepa, our board-certified team provides "
            "compassionate, evidence-based psychiatric care across Florida, Massachusetts, "
            "and Texas. From the comfort of your home, through convenient telehealth visits. "
            "We accept most major insurance plans, and new patients are always welcome. "
            "Your journey to feeling better starts here."
        )
    },
    "services-showcase": {
        "duration": 27,
        "text": (
            "Refresh Psychiatry offers a full spectrum of mental health services, "
            "tailored to your unique needs. From comprehensive psychiatric evaluations "
            "and medication management, to therapy, ADHD assessments, and pharmacogenomic testing. "
            "We treat anxiety, depression, PTSD, OCD, bipolar disorder, and more. "
            "Every treatment plan is personalized because you deserve care that truly fits your life. "
            "Explore our services and take the first step today."
        )
    },
    "adhd-treatment": {
        "duration": 23,
        "text": (
            "Struggling to focus, stay organized, or manage daily tasks? "
            "You're not alone. ADHD affects millions of adults and children, "
            "and the right treatment can make all the difference. "
            "At Refresh Psychiatry, we offer thorough ADHD evaluations "
            "and personalized treatment plans that may include medication, therapy, "
            "or both. Take control of your focus and your life."
        )
    },
    "telehealth-fl": {
        "duration": 24,
        "text": (
            "Quality psychiatric care, available wherever you are in Florida. "
            "With Refresh Psychiatry's telehealth services, you can connect with "
            "a board-certified psychiatrist from the comfort of your home. "
            "From Miami to Jacksonville, Tampa to Orlando, and everywhere in between. "
            "No commute, no waiting rooms. Just expert care, delivered to you. "
            "Schedule your virtual visit today."
        )
    },
    "V1-ChildVsAdultADHD": {
        "duration": 25,
        "text": (
            "Did you know ADHD looks different in children and adults? "
            "In children, you might notice hyperactivity, difficulty sitting still, "
            "and impulsive behavior. In adults, it often shows up as trouble focusing, "
            "disorganization, restlessness, and difficulty managing time. "
            "Both deserve proper diagnosis and support. "
            "At Refresh Psychiatry, we evaluate and treat ADHD across all ages."
        )
    },
    "V2-Pharmacogenomics": {
        "duration": 24,
        "text": (
            "What if your DNA could help guide your medication choices? "
            "Pharmacogenomic testing analyzes how your genes affect your response to medications. "
            "This means fewer trial-and-error prescriptions and faster relief. "
            "At Refresh Psychiatry, we use cutting-edge genetic testing to personalize your treatment plan. "
            "Because the right medication shouldn't be a guessing game."
        )
    },
    "V3-TelepsychiatryFL": {
        "duration": 24,
        "text": (
            "Refresh Psychiatry proudly serves patients across all of Florida "
            "through secure, HIPAA-compliant telehealth appointments. "
            "With sixteen convenient locations and virtual availability statewide, "
            "accessing expert psychiatric care has never been easier. "
            "Whether you're in South Florida, the Gulf Coast, or the Panhandle, "
            "we're here for you. Book your appointment online in minutes."
        )
    },
    "V4-AnxietyVsDepression": {
        "duration": 25,
        "text": (
            "Anxiety and depression are two of the most common mental health conditions, "
            "and they often overlap. Anxiety brings persistent worry, racing thoughts, "
            "and physical tension. Depression can feel like deep sadness, fatigue, "
            "and a loss of interest in things you once enjoyed. "
            "Understanding the difference is the first step toward getting the right help. "
            "At Refresh Psychiatry, we're here to guide you through it."
        )
    },
    "V5-FirstAppointment": {
        "duration": 25,
        "text": (
            "Wondering what to expect at your first psychiatry appointment? "
            "It's simpler than you might think. Your provider will review your history, "
            "discuss your symptoms, and work with you to create a personalized treatment plan. "
            "There's no judgment, just a safe space to talk openly about how you're feeling. "
            "At Refresh Psychiatry, your first visit is the beginning of something better."
        )
    },
    "V6-SpringAnxiety": {
        "duration": 24,
        "text": (
            "Spring is a time of renewal, but for many people, it also brings increased anxiety. "
            "Seasonal changes, longer days, and shifting routines can trigger feelings of unease. "
            "If you're noticing more stress or worry this season, you're not alone. "
            "Refresh Psychiatry offers compassionate support to help you navigate "
            "seasonal mental health challenges and feel your best."
        )
    },
    "V7-WhyRefresh": {
        "duration": 26,
        "text": (
            "Why do thousands of patients choose Refresh Psychiatry? "
            "Because we combine clinical excellence with genuine compassion. "
            "Our team is led by Dr. Justin Nepa, a board-certified psychiatrist "
            "committed to accessible, personalized mental health care. "
            "With sixteen locations, telehealth across three states, "
            "and most major insurance accepted, getting help has never been more convenient. "
            "Refresh your mental health. Refresh your life."
        )
    }
}


async def generate_narration(name, text):
    """Generate a single narration MP3 file."""
    output_path = f"{OUTPUT_DIR}/{name}.mp3"
    communicate = edge_tts.Communicate(
        text,
        VOICE,
        rate="-5%",       # Slightly slower for warmth
        pitch="+0Hz",     # Natural pitch
        volume="+0%"
    )
    await communicate.save(output_path)
    print(f"  [OK] Generated: {name}.mp3")
    return output_path


async def main():
    print(f"Generating {len(NARRATIONS)} narrations with {VOICE}...\n")
    tasks = [generate_narration(name, data["text"]) for name, data in NARRATIONS.items()]
    results = await asyncio.gather(*tasks)
    print(f"\nAll {len(results)} narration files generated in {OUTPUT_DIR}")


if __name__ == "__main__":
    asyncio.run(main())
