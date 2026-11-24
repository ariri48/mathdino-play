# 수학공룡 놀이터 묶기: src/*.html·js + data/books.json -> index.html (웹용), dist/수학공룡_놀이터.html (파일 하나, 책 찍기 없음)
import json, os
R = os.path.dirname(os.path.abspath(__file__))
rd = lambda p: open(os.path.join(R, p), encoding="utf-8").read()
shell, defs, data = rd("src/shell.html"), rd("src/defs.svg"), rd("data/books.json")
js = rd("src/game.js") + rd("src/avatar.js") + rd("src/diag.js") + rd("src/flow.js")
head = '<!doctype html>\n<html lang="ko">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<link rel="manifest" href="manifest.webmanifest">\n<link rel="apple-touch-icon" href="icon-180.png">\n'
def page(noscan):
    flag = "window.__NOSCAN=true;" if noscan else ""
    return shell + defs + "<script>" + flag + "window.__DATA__=" + data + ";</script>\n<script>\n" + js + "\n</script>\n"
open(os.path.join(R, "index.html"), "w", encoding="utf-8").write(head + page(False))
os.makedirs(os.path.join(R, "dist"), exist_ok=True)
open(os.path.join(R, "dist/수학공룡_놀이터.html"), "w", encoding="utf-8").write(page(True))
print("ok", os.path.getsize(os.path.join(R, "index.html")) // 1024, "KB")
