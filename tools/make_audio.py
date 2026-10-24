"""Record the phrases of a theme with ElevenLabs and register them in audio/index.json.

    ~/.config/kishkentai/elevenlabs.env  # outside the repo, two lines:
        ELEVENLABS_API_KEY=...
        ELEVEN_VOICE_ID=...              # voice from your ElevenLabs library
    (or set the same names as environment variables)
    python3 tools/make_audio.py animals [--dry] [--lang en] [--limit N]

Skips phrases that are already recorded, so it is safe to re-run. Optional: ELEVEN_MODEL (default eleven_v3).
"""
import hashlib, json, os, subprocess, sys, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
theme = sys.argv[1]
dry = "--dry" in sys.argv
langs = sys.argv[sys.argv.index("--lang") + 1].split(",") if "--lang" in sys.argv else ["en", "kk", "ru"]
texts = json.loads(subprocess.check_output(["node", os.path.join(ROOT, "tools", "voice_texts.js"), theme]))
index_path = os.path.join(ROOT, "audio", "index.json")
index = json.load(open(index_path, encoding="utf-8")) if os.path.exists(index_path) else {}
todo = [t for t in texts if t["lang"] in langs and f'{t["lang"]}|{t["text"]}' not in index]
print(f"{len(texts)} phrases, {len(todo)} to record, {sum(len(t['text']) for t in todo)} characters")
if "--limit" in sys.argv:
    todo = todo[: int(sys.argv[sys.argv.index("--limit") + 1])]
if dry or not todo:
    sys.exit(0)

conf = os.path.expanduser("~/.config/kishkentai/elevenlabs.env")
if os.path.exists(conf):
    for line in open(conf):
        if "=" in line and not line.startswith("#"):
            a, b = line.strip().split("=", 1)
            os.environ.setdefault(a, b)
key, voice = os.environ.get("ELEVENLABS_API_KEY"), os.environ.get("ELEVEN_VOICE_ID")
if not key or not voice:
    sys.exit("put ELEVENLABS_API_KEY and ELEVEN_VOICE_ID in ~/.config/kishkentai/elevenlabs.env")
model = os.environ.get("ELEVEN_MODEL", "eleven_v3")

for n, t in enumerate(todo, 1):
    k = f'{t["lang"]}|{t["text"]}'
    name = f'{t["lang"]}/{hashlib.sha1(k.encode()).hexdigest()[:12]}.mp3'
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_64",
        data=json.dumps({"text": t["text"], "model_id": model, "language_code": t["lang"]}).encode(),
        headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg"})
    try:
        audio = urllib.request.urlopen(req, timeout=60).read()
    except urllib.error.HTTPError as e:
        print("stopped:", e.code, e.read()[:200]); break
    os.makedirs(os.path.join(ROOT, "audio", t["lang"]), exist_ok=True)
    open(os.path.join(ROOT, "audio", name), "wb").write(audio)
    index[k] = name
    json.dump(index, open(index_path, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(f"[{n}/{len(todo)}] {k}")
