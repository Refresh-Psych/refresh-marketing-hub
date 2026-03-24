"""Generate podcast audio using Azure OpenAI TTS API."""
import sys
import os
import requests
import json

# Load from .env.podcast if present
_env_file = os.path.join(os.path.dirname(__file__), ".env.podcast")
if os.path.exists(_env_file):
    with open(_env_file) as _f:
        for _line in _f:
            if "=" in _line and not _line.strip().startswith("#"):
                _k, _v = _line.strip().split("=", 1)
                os.environ.setdefault(_k.strip(), _v.strip())

API_KEY = os.environ.get("AZURE_TTS_KEY", "")
ENDPOINT = os.environ.get("AZURE_TTS_ENDPOINT", "https://jnepa-mmxy9mrd-swedencentral.services.ai.azure.com")
DEPLOYMENT = "tts"
API_VERSION = "2024-02-15-preview"

def generate_audio(text, output_path, voice="onyx"):
    """Generate speech from text using Azure OpenAI TTS."""
    url = f"{ENDPOINT}/openai/deployments/{DEPLOYMENT}/audio/speech?api-version={API_VERSION}"
    
    headers = {
        "api-key": API_KEY,
        "Content-Type": "application/json"
    }
    
    # TTS has a ~4096 char limit per request, so we chunk
    chunks = []
    words = text.split()
    current_chunk = ""
    for word in words:
        if len(current_chunk) + len(word) + 1 > 4000:
            chunks.append(current_chunk.strip())
            current_chunk = word
        else:
            current_chunk += " " + word
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
    
    print(f"Text split into {len(chunks)} chunks")
    
    all_audio = b""
    for i, chunk in enumerate(chunks):
        print(f"  Generating chunk {i+1}/{len(chunks)} ({len(chunk)} chars)...")
        payload = {
            "model": DEPLOYMENT,
            "input": chunk,
            "voice": voice,
            "response_format": "mp3"
        }
        
        resp = requests.post(url, headers=headers, json=payload)
        
        if resp.status_code == 200:
            all_audio += resp.content
            print(f"  Chunk {i+1} done ({len(resp.content)} bytes)")
        else:
            print(f"  ERROR chunk {i+1}: {resp.status_code} - {resp.text}")
            return False
    
    with open(output_path, "wb") as f:
        f.write(all_audio)
    
    print(f"Audio saved: {output_path} ({len(all_audio)} bytes)")
    return True

if __name__ == "__main__":
    # Read the podcast source
    with open("podcast-source-2026-03-24.txt", "r", encoding="utf-8") as f:
        source = f.read()
    
    # Convert to a narration script (remove metadata headers)
    lines = source.split("\n")
    narration_lines = []
    skip_headers = {"PODCAST TITLE:", "EPISODE ANGLE:", "DATE:", "EPISODE NUMBER:", 
                    "HOST INSTRUCTIONS FOR NOTEBOOKLM:", "SOURCES REFERENCED:"}
    
    in_sources = False
    for line in lines:
        if any(line.startswith(h) for h in skip_headers):
            if line.startswith("SOURCES REFERENCED:"):
                in_sources = True
            continue
        if in_sources:
            continue
        if line.startswith("- "):  # skip bullet instructions
            if "Sound like" in line or "Use specific" in line or "Disagree" in line or "Tell stories" in line or "Address the listener" in line or "Reference today" in line:
                continue
        narration_lines.append(line)
    
    narration = "\n".join(narration_lines).strip()
    # Clean up multiple blank lines
    while "\n\n\n" in narration:
        narration = narration.replace("\n\n\n", "\n\n")
    
    print(f"Narration text: {len(narration)} characters")
    
    success = generate_audio(narration, "podcast-2026-03-24.mp3", voice="onyx")
    sys.exit(0 if success else 1)
