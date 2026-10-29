"""Build Kishkentai into one self-contained page.

    python3 src/build.py

Writes:
  index.html          - the live site for GitHub Pages (with app icon, offline cache, sign-in)
  build/preview.html  - the same page without <html>/<head>, for publishing as a Claude artifact
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = os.path.join(ROOT, "src")
rd = lambda name: open(os.path.join(S, name), encoding="utf-8").read()

css = rd("base.css") + "\n" + rd("extra.css") + "\n" + rd("gate.css")
painted = json.loads(rd("painted.json"))
clips = json.loads(rd("clips.json")) if os.path.exists(os.path.join(S, "clips.json")) else {}

head = '''<title>Kishkentai</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;1,500&family=Nunito:wght@600;700;800&display=swap">
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js"></script>
'''
body = '''<div class="wrap">
  <header>
    <div class="brand"><b>Kishkentai</b><span id="brandSub"></span></div>
    <div class="spacer"></div>
    <span class="stars" id="stars">★ 0</span>
    <button class="pill" id="trBtn" aria-pressed="true"></button>
    <button class="kidbtn" id="kidBtn"></button>
  </header>
  <main id="view"></main>
</div>
<nav class="bottomnav" aria-label="Навигация">
  <button id="nBack" disabled><b aria-hidden="true">←</b><span></span></button>
  <button id="nHome"><b aria-hidden="true">⌂</b><span></span></button>
  <button id="nFwd" disabled><span></span><b aria-hidden="true">→</b></button>
</nav>
'''
# site: every picture is its own file in img/ (the page stays small and loads fast on a phone);
# preview (Claude artifact): pictures stay inline, because an artifact is a single file
import base64, hashlib, re
IMG = os.path.join(ROOT, "img"); os.makedirs(IMG, exist_ok=True)
painted_urls = {}
for key, uri in painted.items():
    raw = base64.b64decode(uri.split(",", 1)[1])
    name = re.sub(r"[^A-Za-z0-9-]", "_", key) + ".jpg"
    path = os.path.join(IMG, name)
    if not os.path.exists(path) or open(path, "rb").read() != raw:
        open(path, "wb").write(raw)
    painted_urls[key] = "img/" + name + "?v=" + hashlib.md5(raw).hexdigest()[:8]
for old in os.listdir(IMG):
    if old not in {u.split("?")[0][4:] for u in painted_urls.values()}: os.remove(os.path.join(IMG, old))

def scripts(pics):
    return ("const PAINTED=" + json.dumps(pics) + ";\nconst VOICE_CLIPS=" + json.dumps(clips, ensure_ascii=False) + ";\n"
      + rd("content.js") + "\n" + rd("account.js") + "\n" + rd("app.js") + "\n" + rd("games.js") + "\n" + rd("gate.js"))
mk = lambda pics: head + "<style>" + css + "</style>\n\n" + body + "\n<script>\n" + scripts(pics) + "\n</script>\n"
page = mk(painted)

os.makedirs(os.path.join(ROOT, "build"), exist_ok=True)
open(os.path.join(ROOT, "build", "preview.html"), "w", encoding="utf-8").write(page)

site = ('<!doctype html>\n<html lang="kk">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<meta name="description" content="Kishkentai — 1–6 жастағы балаларға ағылшын, қазақ және орыс тілдері, акварель суреттермен.">\n'
        '<link rel="manifest" href="manifest.webmanifest">\n<meta name="theme-color" content="#FAF5EC">\n'
        '<link rel="apple-touch-icon" href="apple-touch-icon.png">\n<meta name="apple-mobile-web-app-capable" content="yes">\n'
        '<meta name="apple-mobile-web-app-title" content="Kishkentai">\n<meta name="apple-mobile-web-app-status-bar-style" content="default">\n'
        + mk(painted_urls).replace("</style>", "</style>\n</head>\n<body>", 1)
        + '<script>if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));</script>\n'
        + "</body>\n</html>\n")
open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8").write(site)
print("built index.html", len(site), "bytes")
