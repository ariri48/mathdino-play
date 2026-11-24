import os
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
def patch(p, pairs):
    s=open(p,encoding='utf-8').read()
    for a,b in pairs:
        assert s.count(a)==1,(p,a[:70]); s=s.replace(a,b)
    open(p,'w',encoding='utf-8').write(s)
patch('src/shell.html',[
 ('<title>수학공룡 놀이터</title>','<title>{{TITLE}}</title>'),
 ('  <h1>수학공룡 놀이터</h1>\n  <p>42권 책마다 놀이 5개 · 아이 나이에 맞춰 쉬워지고 어려워져요 · 소리를 켜고 시작해요</p>','  <h1>{{TITLE}}</h1>\n  <p>{{SUB}} · 아이 나이에 맞춰 쉬워지고 어려워져요 · 소리를 켜고 시작해요</p>'),
 ('<div class="top"><h1>수학공룡 놀이터</h1>','<div class="top"><a class="tohub" href="./" aria-label="놀이터 처음으로">← 놀이터</a><h1>{{TITLE}}</h1>'),
 ('<b id="total">0</b> / 210','<b id="total">0</b> / <span id="totmax">0</span>'),
 ('  <div class="greetrow">','  <div id="langtabs" class="seg langtabs" hidden></div>\n  <div class="greetrow">'),
])
patch('src/flow.js',[
 ('function loadP(){ var o=all(); return (o.cur&&o.prog[o.cur])||{}; }\nfunction saveP(p){ var o=all(); if(!o.cur) return; o.prog[o.cur]=p; saveAll(o); }',
  'function progKey(){ var P=window.__PROG||"mathdino"; return P==="mathdino"? "prog" : "prog_"+P+(P==="words"?"_"+S.lang:""); }\nfunction loadP(){ var o=all(), k=progKey(); return (o.cur&&o[k]&&o[k][o.cur])||{}; }\nfunction saveP(p){ var o=all(), k=progKey(); if(!o.cur) return; o[k]=o[k]||{}; o[k][o.cur]=p; saveAll(o); }'),
 ('say("수학공룡 놀이터에 온 걸 환영해! 먼저 이름을 알려 줘");','say(CFG.title+"에 온 걸 환영해! 먼저 이름을 알려 줘");'),
 ('"수학공룡 놀이터에 온 걸 환영해! 책을 골라 볼까?"','CFG.title+"에 온 걸 환영해! "+(CFG.ask||"책을 골라 볼까?")'),
 ('$("total").textContent=tot; applyKid(); renderBuddies();','$("total").textContent=tot; $("totmax").textContent=DATA.books.length*5; applyKid(); renderBuddies(); if(window.renderLangTabs){ $("langtabs").hidden=false; renderLangTabs(); }'),
 ('S.rounds = (lv.g==="draw")?1:ROUNDS[TIER];','S.rounds = ONE_ROUND[lv.g]?1:ROUNDS[TIER];'),
 ('function playRound(){ if(S.diag||!S.book||!S.book.levels[S.li]) return; clear(); S.miss=0; S.hintFn=null;','function playRound(){ if(S.diag||!S.book||!S.book.levels[S.li]) return; clear(); S.miss=0; S.hintFn=null; S.againFn=null;'),
 ('$("again").addEventListener("click",function(){ say(S.prompt||""); });','$("again").addEventListener("click",function(){ if(S.againFn) S.againFn(); else say(S.prompt||""); });'),
 ('if(window.__NOSCAN) $("scanBtn").hidden=true;','if(window.__NOSCAN) $("scanBtn").hidden=true; if(window.__NODIAG) $("diagBtn").hidden=true; if(window.__NOHUB) Array.prototype.forEach.call(document.querySelectorAll(".tohub"),function(a){ a.hidden=true; });'),
])
patch('src/game.js',[
 ('var CHARK={};','var CHARK={}; var ONE_ROUND={draw:1}; var CFG=window.__CFG||{title:"수학공룡 놀이터"};'),
])
print('ok')
