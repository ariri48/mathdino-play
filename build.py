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
base = json.loads(rd("data/books.json"))
core = rd("src/game.js") + rd("src/avatar.js") + rd("src/diag.js")
flow = rd("src/flow.js")
HEAD = '<!doctype html>\n<html lang="ko">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<link rel="manifest" href="manifest.webmanifest">\n<link rel="apple-touch-icon" href="icon-180.png">\n'
def page(cfg, books, prog, flags="", extra_js=""):
    data = dict(base); data["books"] = books
    s = shell.replace("{{TITLE}}", cfg["title"]).replace("{{SUB}}", cfg["sub"]).replace("{{HINT}}", cfg["hint"])
    js = core + extra_js + flow
    return s + defs + "<script>" + flags + "window.__PROG=" + json.dumps(prog) + ";window.__CFG=" + json.dumps(cfg, ensure_ascii=False) + ";window.__DATA__=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";</script>\n<script>\n" + js + "\n</script>\n"
SITE = "https://play.goyu.studio/"
OG = {"index.html": ("우리 아이 놀이터", "그림책 수학 놀이와 영어·일본어·중국어 말놀이. 아이 사진으로 만든 캐릭터와 함께 아이패드에서 놀아요."),
      "mathdino.html": ("수학공룡 놀이터", "그림책 42권, 책마다 놀이 5개. 책을 카메라에 보여 주면 그 책 놀이가 열려요."),
      "mathforce.html": ("수학특공대 놀이터", "그림책 42권의 수·도형·규칙·측정 개념에 맞춘 놀이 210개."),
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
WD = {"title": "말놀이", "sub": "영어·일본어·중국어 · 주제 7개마다 놀이 5개", "hint": "위에서 말을 고르고, 배우고 싶은 주제를 골라요.", "ask": "어떤 말로 놀아 볼까?", "play": "말놀이"}
out("mathdino.html", page(MD, base["books"], "mathdino"))
out("mathforce.html", page(MF, json.loads(rd("data/mathforce.json")), "mathforce", "window.__NOSCAN=true;"))
out("words.html", page(WD, json.loads(rd("data/words.json")), "words", "window.__NOSCAN=true;window.__NODIAG=true;", rd("src/lang.js")))
out("dist/수학공룡_놀이터.html", page(MD, base["books"], "mathdino", "window.__NOSCAN=true;window.__NOHUB=true;"), head=False)
# 허브: 캐릭터 그리기 함수만 가져옴
av = rd("src/avatar.js"); av = av[:av.index("/* 사진 → 만화풍")]
hubjs = """
(function(){ var NS="http://www.w3.org/2000/svg";
var o={}; try{ o=JSON.parse(localStorage.getItem("mathdino-play-v2"))||{}; }catch(e){}
var kids=o.kids||[], k=kids.filter(function(x){ return x.id===o.cur; })[0]||null, a=null; try{ a=k&&JSON.parse(localStorage.getItem("mathdino-av-"+k.id)); }catch(e){}
document.getElementById("bud").innerHTML=avatarSVG(a||{suit:k?(k.suit||0):0},"pose-idle");
document.getElementById("say").textContent= k? k.name+", 오늘은 뭐 하고 놀까?" : "안녕! 오늘은 뭐 하고 놀까? 하나를 골라 봐!";
function cnt(key){ var p=(o[key]||{})[o.cur]||{}, n=0; Object.keys(p).forEach(function(b){ n+=(p[b]||[]).filter(Boolean).length; }); return n; }
Array.prototype.forEach.call(document.querySelectorAll(".card"),function(c){ var key=c.dataset.key, max=+c.dataset.max, n= key==="prog_words"? cnt("prog_words_en")+cnt("prog_words_ja")+cnt("prog_words_zh") : cnt(key);
  c.querySelector(".bar i").style.width=Math.round(n/max*100)+"%"; c.querySelector(".prog b").textContent=n+" / "+max; });
})();"""
avcss = shell[shell.index("/* 캐릭터 */"):shell.index("/* 칭찬 */")]
hub = rd("src/hub.html").replace("</style>", avcss + "</style>") + defs + "<script>" + av + hubjs + "</script>\n"
out("index.html", hub)
print("ok", {n: os.path.getsize(os.path.join(R, n)) // 1024 for n in ("index.html", "mathdino.html", "mathforce.html", "words.html")})
