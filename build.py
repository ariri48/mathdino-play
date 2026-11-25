# 우리 아이 놀이터 묶기
#   index.html      놀이 고르기(허브)
#   mathdino.html   수학공룡 놀이터 (책 보여 주기 포함)
#   mathforce.html  수학특공대 놀이터
#   words.html      말놀이 (영어·일본어·중국어)
#   dist/수학공룡_놀이터.html  파일 하나짜리 (책 보여 주기·허브 링크 없음)
import json, os, subprocess, sys
R = os.path.dirname(os.path.abspath(__file__))
rd = lambda p: open(os.path.join(R, p), encoding="utf-8").read()
for t in ("tools/words_data.py", "tools/mathforce_data.py"):
    subprocess.run([sys.executable, os.path.join(R, t)], check=True, stdout=subprocess.DEVNULL)
sys.path.insert(0, os.path.join(R, "tools")); from cute import cute
shell, defs = rd("src/shell.html"), cute(rd("src/defs_base.svg"))
ROOMCSS, ROOMJS = rd("src/room.css"), rd("src/room.js")
shell = shell.replace("</style>", ROOMCSS + "</style>", 1)
# 그림(art/*.webp)이 있는 아이콘은 그림으로 바꿈. 파일 하나짜리 판은 그림을 안에 넣음
import base64, glob, re
ART = {os.path.basename(f)[:-5]: f for f in glob.glob(os.path.join(R, "art", "*.webp"))}
def art_href(k, inline):
    f = ART[k]
    return "data:image/webp;base64," + base64.b64encode(open(f, "rb").read()).decode() if inline else "art/%s.webp?v=%d" % (k, int(os.path.getmtime(f)))
def art_defs(d, inline=False):
    def rep(m):
        k = m.group(1)
        if k not in ART: return m.group(0)
        return '<symbol id="g-%s" viewBox="0 0 100 100"><image href="%s" x="0" y="0" width="100" height="100"/></symbol>' % (k, art_href(k, inline))
    return re.sub(r'<symbol id="g-([a-z0-9_-]+)" viewBox="0 0 100 100">.*?</symbol>', rep, d, flags=re.S)
SYS = ("bg_", "suit_", "egg_crack", "dino_hatch", "dino_big", "dino_sleep", "dino_kid")
STK = sorted(k for k in ART if not k.startswith(SYS) and k not in SYS)
LINE = sorted(os.path.basename(f)[:-4] for f in glob.glob(os.path.join(R, "art", "line", "*.png")))
def art_flags(inline=False):
    f = "window.__STK=%s;window.__LINE=%s;" % (json.dumps(STK), json.dumps(LINE))
    return f + (("window.__ART_BG=%s;" % json.dumps(art_href("bg_stage", inline))) if "bg_stage" in ART else "")
base = json.loads(rd("data/books.json"))
core = rd("src/game.js") + rd("src/voice.js") + rd("src/avatar.js") + rd("src/diag.js") + rd("src/chat.js")
flow = rd("src/flow.js")
HEAD = '<!doctype html>\n<html lang="ko">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<link rel="manifest" href="manifest.webmanifest">\n<link rel="apple-touch-icon" href="icon-180.png">\n<link rel="icon" type="image/png" href="icon-180.png">\n'
def page(cfg, books, prog, flags="", extra_js="", inline=False):
    data = dict(base); data["books"] = books; flags = flags + art_flags(inline)
    s = shell.replace("{{TITLE}}", cfg["title"]).replace("{{SUB}}", cfg["sub"]).replace("{{HINT}}", cfg["hint"]).replace("{{UNIT}}", cfg.get("unit", "책")).replace("{{FOOT}}", cfg.get("foot", "개인이 아이와 놀려고 만든 놀이예요. 책을 펴낸 출판사와는 관계가 없어요."))
    js = core + extra_js + flow
    return s + art_defs(defs, inline) + "<script>" + flags + "window.__PROG=" + json.dumps(prog) + ";window.__CFG=" + json.dumps(cfg, ensure_ascii=False) + ";window.__DATA__=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";</script>\n<script>\n" + ROOMJS + "\n</script>\n<script>\n" + js + "\n</script>\n"
SITE = "https://play.goyu.studio/"
OG = {"index.html": ("우리 아이 놀이터", "그림책 수학 놀이와 영어·일본어·중국어 말놀이. 아이 사진으로 만든 캐릭터와 함께 아이패드에서 놀아요."),
      "mathdino.html": ("수학공룡 놀이터", "그림책 42권, 책마다 놀이 5개. 책을 카메라에 보여 주면 그 책 놀이가 열려요."),
      "mathforce.html": ("수학특공대 놀이터", "그림책 42권의 수·도형·규칙·측정 개념에 맞춘 놀이 210개."),
      "color.html": ("색칠 종이", "놀이터 그림을 색칠 종이로 인쇄해요. 색칠한 그림을 찍으면 놀이에 나와요."),
      "words.html": ("말놀이 · 영어 일본어 중국어", "듣고 고르기, 풍선 터뜨리기, 카드 짝 맞추기로 배우는 첫 외국어 낱말 60개.")}
def ogtags(name):
    t, d = OG[name]; u = SITE + ("" if name == "index.html" else name)
    return ('<meta name="description" content="%s">\n<meta property="og:type" content="website">\n<meta property="og:site_name" content="우리 아이 놀이터">\n'
            '<meta property="og:title" content="%s">\n<meta property="og:description" content="%s">\n<meta property="og:url" content="%s">\n'
            '<meta property="og:image" content="%sog.png">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
            '<meta property="og:image:alt" content="우리 아이 놀이터 - 공룡, 사과, 별 캐릭터">\n<meta name="twitter:card" content="summary_large_image">\n'
            '<meta name="twitter:image" content="%sog.png">\n<meta name="theme-color" content="#5b3fa8">\n') % (d, t, d, u, SITE, SITE)
def out(name, html, head=True):
    p = os.path.join(R, name); os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w", encoding="utf-8").write((HEAD + ogtags(name) if head else "") + html)
MD = {"title": "수학공룡 놀이터", "sub": "42권 책마다 놀이 5개", "hint": "또는 아래에서 오늘 읽은 책을 골라요. 놀이 5개를 다 하면 책 한 권 완주!"}
MF = {"title": "수학특공대 놀이터", "sub": "42권 책마다 놀이 5개", "hint": "오늘 읽은 책을 골라요. 놀이 5개를 다 하면 책 한 권 완주!"}
WD = {"title": "말놀이", "sub": "영어·일본어·중국어 · 주제 7개마다 놀이 5개", "hint": "위에서 말을 고르고, 배우고 싶은 주제를 골라요.", "ask": "어떤 말로 놀아 볼까?", "play": "말놀이", "unit": "주제", "foot": "개인이 아이와 놀려고 만든 놀이예요. 낱말 그림과 소리는 이 놀이터에서 직접 만들었어요."}
out("mathdino.html", page(MD, base["books"], "mathdino"))
out("mathforce.html", page(MF, json.loads(rd("data/mathforce.json")), "mathforce", "window.__NOSCAN=true;"))
out("words.html", page(WD, json.loads(rd("data/words.json")), "words", "window.__NOSCAN=true;window.__NODIAG=true;", rd("src/lang.js")))
out("dist/수학공룡_놀이터.html", page(MD, base["books"], "mathdino", "window.__NOSCAN=true;window.__NOHUB=true;", inline=True), head=False)
# 허브: 캐릭터 그리기 함수만 가져옴
av = rd("src/avatar.js"); av = av[:av.index("/* 사진 → 만화풍")]
HUBPRE = """
var S={}; function talk(){}
function jong(w){ w=String(w); var c=w.charCodeAt(w.length-1); if(c>=0xAC00&&c<=0xD7A3) return (c-0xAC00)%28!==0; return /[013678]$/.test(w); }
function voc(n){ return n+(jong(n)?"아":"야"); }
function curKid(){ try{ var o=JSON.parse(localStorage.getItem("mathdino-play-v2"))||{}; return (o.kids||[]).filter(function(x){ return x.id===o.cur; })[0]||null; }catch(e){ return null; } }
function say(s){ hubSay(s); }
function hubSay(s){ var c=clipFor(s); if(c){ clipPlay(c); return; } try{ speechSynthesis.cancel(); var u=new SpeechSynthesisUtterance(s); u.lang="ko-KR";
  var vs=speechSynthesis.getVoices().filter(function(v){ return /^ko/i.test(v.lang); }), good=/yuna|유나|premium|enhanced|고급/i; vs.sort(function(a,b){ return (good.test(b.name)?1:0)-(good.test(a.name)?1:0); });
  if(vs[0]) u.voice=vs[0]; u.rate=0.95; u.pitch=1.1; speechSynthesis.speak(u); }catch(e){} }
"""
avcss = shell[shell.index("/* 캐릭터 */"):shell.index("/* 칭찬 */")]
hubbg = (".sky{background:#cfeeff url(%s) center bottom/cover}.sky::after,.cloud{display:none}" % art_href("bg_hub", False)) if "bg_hub" in ART else ""
hub = rd("src/hub.html").replace("</style>", avcss + hubbg + ROOMCSS + "</style>") + art_defs(defs) + "<script>" + art_flags() + "</script>\n<script>" + HUBPRE + av + rd("src/voice.js") + "</script>\n<script>" + ROOMJS + "</script>\n<script>" + rd("src/hub.js") + "</script>\n"
out("index.html", hub)
names = base["names"]
cells = "".join('<label class="c"><input type="checkbox" value="%s"><img src="art/line/%s.png" alt=""><span>%s</span></label>' % (k, k, names.get(k, k)) for k in LINE)
color = rd("src/color.html").replace("{{CELLS}}", cells)
out("color.html", color)
print("ok", {n: os.path.getsize(os.path.join(R, n)) // 1024 for n in ("index.html", "mathdino.html", "mathforce.html", "words.html")})
