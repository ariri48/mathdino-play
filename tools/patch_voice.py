import os
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
def patch(p, pairs):
    s=open(p,encoding='utf-8').read()
    for a,b in pairs:
        assert s.count(a)==1,(p,a[:70]); s=s.replace(a,b)
    open(p,'w',encoding='utf-8').write(s)
patch('src/game.js',[
 ('function pickVoice(){ try{ var vs=speechSynthesis.getVoices().filter(function(v){ return /^ko/i.test(v.lang); }); S.voice=vs.filter(function(v){ return /yuna|유나|sora|female|여/i.test(v.name); })[0]||vs[0]||null; }catch(e){} }',
  '''/* 장난용·효과음 음성(할아버지, 로봇 등)은 빼고, 차분한 기본 여자 음성을 고름 */
var ODDVOICE=/grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley|bad news|bahh|bells|boing|bubbles|cellos|wobble|zarvox|whisper|jester|organ|superstar|trinoids|junior|albert|fred|ralph|kathy|good news|hysterical|deranged|pipe|novelty/i;
function goodVoices(prefix){ try{ return speechSynthesis.getVoices().filter(function(v){ return v.lang.replace("_","-").toLowerCase().indexOf(prefix)===0 && !ODDVOICE.test(v.name); }); }catch(e){ return []; } }
function rankVoice(v){ var n=v.name; return (/premium|enhanced|고급/i.test(n)?0:10)+(/yuna|유나|sora|소라|samantha|ava|allison|kyoko|tingting|ting-ting|meijia|lili/i.test(n)?0:5)+(/google/i.test(n)?2:0); }
function bestVoice(prefix, want){ var vs=goodVoices(prefix); if(want){ var w=vs.filter(function(v){ return v.name===want; })[0]; if(w) return w; } return vs.sort(function(a,b){ return rankVoice(a)-rankVoice(b); })[0]||null; }
function pickVoice(){ var want=null; try{ want=localStorage.getItem("goyu-voice-ko"); }catch(e){} S.voice=bestVoice("ko",want); }
try{ speechSynthesis.onvoiceschanged=function(){ pickVoice(); if(window.LVOICE) for(var k in LVOICE) delete LVOICE[k]; }; }catch(e){}'''),
 ('u.rate=S.vr||0.95; u.pitch=S.vp||1.3;','u.rate=S.vr||0.95; u.pitch=S.vp||1.05;'),
])
patch('src/avatar.js',[
 ('var VOICES=[["아기 목소리",1.8,1.0],["높은 목소리",1.45,0.95],["보통 목소리",1.15,0.95],["낮은 목소리",0.8,0.9]];',
  'var VOICES=[["귀여운 목소리",1.2,0.98],["밝은 목소리",1.1,0.96],["보통 목소리",1.0,0.95],["차분한 목소리",0.92,0.9]];'),
])
patch('src/lang.js',[
 ('function pickLVoice(tag){','function pickLVoice(tag){ if(LVOICE[tag]===undefined) LVOICE[tag]=bestVoice(tag.slice(0,2).toLowerCase(), null); return LVOICE[tag]; }\nfunction _oldPickLVoice(tag){'),
 ('u.rate=0.82; u.pitch=1.15;','u.rate=0.85; u.pitch=1.0;'),
])
patch('src/shell.html',[
 ('  <form id="kadd" class="kadd">','''  <div class="kadd vpick"><h3>목소리 고르기</h3><p class="note">이 기기에 있는 한국어 음성 중에서 골라요. 마음에 드는 목소리가 없으면 아이패드 설정 → 손쉬운 사용 → 읽기 및 말하기 → 음성 → 한국어에서 "유나(향상됨)"를 내려받으면 더 자연스러워요.</p>
    <div class="vrow"><select id="vSel"></select><button id="vHear" type="button" class="ghostbtn">들어 보기</button></div></div>
  <form id="kadd" class="kadd">'''),
 ('.vrow{display:flex;','.vpick{margin-bottom:16px}.vpick select{font-family:var(--disp);font-size:20px;border:3px solid #d9cff5;border-radius:14px;padding:8px 12px;background:#fff;color:var(--ink);max-width:100%}\n.vrow{display:flex;'),
])
patch('src/flow.js',[
 ('function renderKids(){ var o=all(), box=$("kidlist"); box.innerHTML="";','''function renderVoicePick(){ var sel=$("vSel"); if(!sel) return; pickVoice(); var vs=goodVoices("ko").sort(function(a,b){ return rankVoice(a)-rankVoice(b); }); sel.innerHTML="";
  if(!vs.length){ var o0=document.createElement("option"); o0.textContent="한국어 음성이 없어요"; sel.appendChild(o0); return; }
  vs.forEach(function(v){ var op=document.createElement("option"); op.value=v.name; op.textContent=v.name.replace(/\\s*\\(.*?\\)\\s*/g," ").trim(); if(S.voice&&v.name===S.voice.name) op.selected=true; sel.appendChild(op); }); }
function renderKids(){ renderVoicePick(); var o=all(), box=$("kidlist"); box.innerHTML="";'''),
 ('$("kidchip").addEventListener("click",function(){ renderKids(); show("kids"); });','''$("kidchip").addEventListener("click",function(){ renderKids(); show("kids"); });
$("vSel").addEventListener("change",function(){ try{ localStorage.setItem("goyu-voice-ko",this.value); }catch(e){} pickVoice(); say("안녕! 이 목소리 어때?"); });
$("vHear").addEventListener("click",function(){ say("안녕! 나랑 같이 놀자!"); });'''),
])
print("ok")
