#!/usr/bin/env python3
# Build Warriors Thrive complication videos: title card, clip A (+captions),
# key-points card, clip B (+captions), end card. Usage: wt_build.py <vid> [cards|full]
import json, os, subprocess, sys, re, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 720, 1280, 30
FB = "/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf"
FDIR = os.path.dirname(FB)
def font(sz, bold=True):
    for name in (["Montserrat-ExtraBold.ttf", "Montserrat-Bold.ttf"] if bold else ["Montserrat-SemiBold.ttf", "Montserrat-Medium.ttf", "Montserrat-Regular.ttf", "Montserrat-Bold.ttf"]):
        p = os.path.join(FDIR, name)
        if os.path.exists(p):
            return ImageFont.truetype(p, sz)
    return ImageFont.truetype(FB, sz)

NIGHT, PLUM, INK, SOFT = (27, 11, 36), (42, 18, 54), (255, 247, 239), (217, 198, 221)
GOLD, TEAL, DANGER, VIOLET = (255, 194, 61), (47, 198, 181), (255, 90, 79), (155, 120, 255)

V = json.load(open("videos.json"))

def sh(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if r.returncode:
        print(r.stderr[-2000:]); raise SystemExit(f"FAIL: {cmd[:200]}")
    return r.stdout

def bg(accent):
    im = Image.new("RGB", (W, H), NIGHT)
    d = ImageDraw.Draw(im)
    for y in range(H):
        t = y / H
        c = tuple(int(NIGHT[i] * (1 - t) + PLUM[i] * t) for i in range(3))
        d.line([(0, y), (W, y)], fill=c)
    glow = Image.new("RGB", (W, H), (0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([-200, -260, 520, 420], fill=tuple(int(c * 0.45) for c in accent))
    gd.ellipse([380, 980, 1000, 1560], fill=tuple(int(c * 0.3) for c in VIOLET))
    glow = glow.filter(ImageFilter.GaussianBlur(140))
    return ImageChops.add(im, glow)

from PIL import ImageChops

def wrap(d, text, f, maxw):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=f) <= maxw: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def circle(img_path, size, ring):
    im = Image.open(img_path).convert("RGBA")
    w, h = im.size
    s = min(w, h)
    # bias crop to the top (face) for full-body art
    top = 0 if h > w else (h - s) // 2
    im = im.crop(((w - s) // 2, top, (w - s) // 2 + s, top + s)).resize((size, size), Image.LANCZOS)
    m = Image.new("L", (size, size), 0); ImageDraw.Draw(m).ellipse([0, 0, size, size], fill=255)
    out = Image.new("RGBA", (size + 16, size + 16), (0, 0, 0, 0))
    ImageDraw.Draw(out).ellipse([0, 0, size + 15, size + 15], fill=ring + (255,))
    bgc = Image.new("RGBA", (size, size), (255, 236, 220, 255))
    bgc.paste(im, (0, 0), im)
    out.paste(bgc, (8, 8), m)
    return out

def brand(d, y=70):
    f = font(26)
    t = "WARRIORS THRIVE"
    d.text(((W - d.textlength(t, font=f)) / 2, y), t, font=f, fill=GOLD)
    d.line([(W / 2 - 60, y + 44), (W / 2 + 60, y + 44)], fill=GOLD, width=3)

def title_card(v, out):
    acc = tuple(v["accent"])
    im = bg(acc).convert("RGBA"); d = ImageDraw.Draw(im)
    brand(d)
    av = circle(v["portrait"], 340, acc)
    im.paste(av, ((W - av.width) // 2, 220), av)
    tag = v.get("tag", "LEARN THE SIGNS")
    f = font(28); tw = d.textlength(tag, font=f)
    d.rounded_rectangle([(W - tw) / 2 - 22, 640, (W + tw) / 2 + 22, 692], radius=26, fill=acc)
    d.text(((W - tw) / 2, 650), tag, font=f, fill=NIGHT)
    f = font(68); y = 730
    for ln in wrap(d, v["title"], f, W - 100):
        d.text(((W - d.textlength(ln, font=f)) / 2, y), ln, font=f, fill=INK); y += 82
    f = font(36, False); t = "with " + v["who"]
    d.text(((W - d.textlength(t, font=f)) / 2, y + 24), t, font=f, fill=SOFT)
    im.convert("RGB").save(out)

def points_card(v, out):
    acc = tuple(v["accent"])
    im = bg(acc).convert("RGBA"); d = ImageDraw.Draw(im)
    brand(d)
    f = font(56); y = 190
    for ln in wrap(d, "Key points", f, W - 100):
        d.text((60, y), ln, font=f, fill=INK); y += 70
    d.rectangle([60, y + 6, 160, y + 14], fill=acc)
    y += 60
    fb = font(37, False)
    for i, p in enumerate(v["points"]):
        red = p.startswith("!")
        p = p.lstrip("!")
        lines = wrap(d, p, fb, W - 220)
        hgt = len(lines) * 50 + 44
        fill = (74, 18, 32, 255) if red else (255, 255, 255, 22)
        layer = Image.new("RGBA", im.size, (0, 0, 0, 0)); ld = ImageDraw.Draw(layer)
        ld.rounded_rectangle([50, y, W - 50, y + hgt], radius=28, fill=fill,
                             outline=(DANGER + (255,)) if red else None, width=3)
        im.alpha_composite(layer); d = ImageDraw.Draw(im)
        dot = DANGER if red else acc
        d.ellipse([78, y + 26, 128, y + 76], fill=dot)
        n = "!" if red else str(i + 1)
        fn = font(30)
        d.text((103 - d.textlength(n, font=fn) / 2, y + 32), n, font=fn, fill=NIGHT if not red else INK)
        ty = y + 22
        for ln in lines:
            d.text((150, ty), ln, font=fb, fill=INK); ty += 50
        y += hgt + 22
    im.convert("RGB").save(out)

def end_card(v, out):
    acc = tuple(v["accent"])
    im = bg(acc).convert("RGBA"); d = ImageDraw.Draw(im)
    brand(d)
    av = circle(v["portrait"], 220, acc)
    im.paste(av, ((W - av.width) // 2, 190), av)
    f = font(54); y = 480
    for ln in wrap(d, "You know your body. Speak up.", f, W - 120):
        d.text(((W - d.textlength(ln, font=f)) / 2, y), ln, font=f, fill=INK); y += 66
    y += 40
    d.rounded_rectangle([70, y, W - 70, y + 120], radius=30, fill=(74, 18, 32), outline=DANGER, width=4)
    f2 = font(38); t = "Emergency? Call 911."
    d.text(((W - d.textlength(t, font=f2)) / 2, y + 38), t, font=f2, fill=INK)
    y += 170
    f3 = font(30, False)
    for ln in wrap(d, "Questions? Ask your sickle cell care team. They know your plan.", f3, W - 140):
        d.text(((W - d.textlength(ln, font=f3)) / 2, y), ln, font=f3, fill=SOFT); y += 42
    f4 = font(22, False); t = "For education only. Always follow your own care plan."
    d.text(((W - d.textlength(t, font=f4)) / 2, H - 110), t, font=f4, fill=(166, 143, 174))
    im.convert("RGB").save(out)

ENC = f"-r {FPS} -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -c:a aac -b:a 128k -ar 44100 -ac 2"

def still_seg(png, dur, out, fade_in=True):
    vf = f"scale={W}:{H},format=yuv420p,loop=-1:1,trim=duration={dur},setpts=PTS-STARTPTS"
    vf += f",fade=t=in:st=0:d=0.35,fade=t=out:st={dur-0.35}:d=0.35" if fade_in else ""
    sh(f"ffmpeg -y -loglevel error -framerate {FPS} -i {png} -f lavfi -i anullsrc=r=44100:cl=stereo "
       f"-vf \"{vf}\" -t {dur} {ENC} -shortest tmp_{out} && mv tmp_{out} {out}")

FIX = [(r"\bA\.? ?C\.? ?S\b", "ACS"), (r"\bT\.? ?C\.? ?D\b", "TCD"), (r"\bnine[- ]one[- ]one\b", "911"),
       (r"\bE\.? ?R\b", "ER")]

def ts(t):
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"

def captions(wav, ass):
    from faster_whisper import WhisperModel
    global _M
    try: _M
    except NameError: _M = WhisperModel("small.en", device="cpu", compute_type="int8")
    segs, _ = _M.transcribe(wav, word_timestamps=True, beam_size=5)
    words = [w for s in segs for w in s.words]
    chunks, cur = [], []
    for w in words:
        cur.append(w)
        txt = "".join(x.word for x in cur).strip()
        end_punct = re.search(r"[.,!?:]$", w.word.strip())
        if len(cur) >= 4 or len(txt) > 22 or end_punct:
            chunks.append(cur); cur = []
    if cur: chunks.append(cur)
    lines = []
    for i, c in enumerate(chunks):
        st, en = c[0].start, c[-1].end
        if i + 1 < len(chunks): en = max(en, min(chunks[i + 1][0].start, en + 0.4))
        t = "".join(x.word for x in c).strip()
        for a, b in FIX: t = re.sub(a, b, t, flags=re.I)
        t = t.rstrip(",")
        lines.append(f"Dialogue: 0,{ts(st)},{ts(en)},Cap,,0,0,0,,{t}")
    hdr = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Montserrat ExtraBold,52,&H00FFFFFF,&H00FFFFFF,&H00240B1B,&H96000000,0,0,0,0,100,100,0,0,1,5,2,2,50,50,250,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    open(ass, "w").write(hdr + "\n".join(lines) + "\n")
    return " | ".join(l.split(",,", 1)[1].split(",,")[-1] for l in lines)

def clip_seg(src, ass, out):
    sh(f"ffmpeg -y -loglevel error -i {src} -vf \"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
       f"fps={FPS},ass={ass}:fontsdir={FDIR},fade=t=in:st=0:d=0.25\" -af aresample=44100 {ENC} tmp_{out} && mv tmp_{out} {out}")

if __name__ == "__main__":
    vid, mode = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else "full")
    v = V[vid]
    os.makedirs(vid, exist_ok=True); os.chdir(vid)
    title_card(v, "title.png"); points_card(v, "points.png"); end_card(v, "end.png")
    if mode == "cards": raise SystemExit(0)
    still_seg("title.png", 3.0, "s1.mp4")
    still_seg("points.png", 7.0, "s3.mp4")
    still_seg("end.png", 4.0, "s5.mp4")
    for k, seg in (("a", "s2.mp4"), ("b", "s4.mp4")):
        sh(f"ffmpeg -y -loglevel error -i {k}.mp4 -vn -ac 1 -ar 16000 {k}.wav")
        print(k.upper(), "captions:", captions(f"{k}.wav", f"{k}.ass"))
        clip_seg(f"{k}.mp4", f"{k}.ass", seg)
    open("list.txt", "w").write("".join(f"file 's{i}.mp4'\n" for i in range(1, 6)))
    sh(f"ffmpeg -y -loglevel error -f concat -safe 0 -i list.txt -c copy -movflags +faststart final.mp4")
    print(sh("ffprobe -v error -show_entries format=duration -of csv=p=0 final.mp4"))
