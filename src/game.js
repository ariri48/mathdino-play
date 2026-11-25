(function(){
"use strict";
var DATA = window.__DATA__;
var NAMES = DATA.names, D2D = DATA.d2d;
var NS = "http://www.w3.org/2000/svg";
var $ = function(id){ return document.getElementById(id); };
var svg = $("stage"), cv = $("pad");
var S = { book:null, li:0, round:0, rounds:3, lock:false, voice:null, muted:false, miss:0, hintFn:null };
/* 월령 단계: 0 아기(24~35개월) 1 꼬마(36~47) 2 씩씩(48~59) 3 대장(60~) */
var TIER=2, CAPS=[3,5,10,20], NCH=[2,3,3,4], HINTAT=[1,2,3,99], ROUNDS=[2,3,3,3];
function T(a){ return a[TIER]; }
function cap(){ return CAPS[TIER]; }
function clampN(n){ return n>cap()? rnd(1,cap()) : n; }
function hintNode(n){ if(n&&n.classList) n.classList.add("glow"); }
function setHint(fn){ S.hintFn=fn; }

/* ---------- 도우미 ---------- */
function rnd(a,b){ return a + Math.floor(Math.random()*(b-a+1)); }
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function jong(w){ w=String(w); var c=w.charCodeAt(w.length-1); if(c>=0xAC00&&c<=0xD7A3) return (c-0xAC00)%28!==0; return /[013678]$/.test(w); }
function eul(w){ return w+(jong(w)?"을":"를"); }
function iga(w){ return w+(jong(w)?"이":"가"); }
function nm(k){ return NAMES[k]||k; }
var CHARK={}; var ONE_ROUND={draw:1}; var CFG=window.__CFG||{title:"수학공룡 놀이터"};
var ANIMAL={mosquito:1,fish:1,dog:1,cat:1,rabbit:1,bear:1,chick:1,duck:1,dino:1,ghost:1};
function unit(k){ return CHARK[k]?"명": ANIMAL[k]?"마리":"개"; }
var ORD = ["첫째","둘째","셋째","넷째","다섯째","여섯째"];
function el(tag, at, parent){ var e=document.createElementNS(NS,tag); for(var k in at) if(at[k]!==undefined) e.setAttribute(k,at[k]); (parent||svg).appendChild(e); return e; }
function g(parent){ return el("g",{},parent); }
function icon(name,x,y,s,parent){ return el("use",{href:"#g-"+name,x:x,y:y,width:s,height:s},parent); }
function txt(s,x,y,size,parent,fill,anchor){ var t=el("text",{x:x,y:y,"font-size":size||40,"text-anchor":anchor||"middle",fill:fill||"#3b2f2a","class":"t"},parent); t.textContent=s; return t; }
function setT(n,x,y){ n._tx=x; n._ty=y; n.setAttribute("transform","translate("+x+","+y+")"); }
function clear(){ while(svg.firstChild) svg.removeChild(svg.firstChild); svg.classList.remove("hide"); cv.classList.add("hide"); $("padtools").classList.add("hide"); decor(); }
function decor(){ var d=g(); d.setAttribute("pointer-events","none"); d.setAttribute("class","decor");
  if(window.__ART_BG){ el("image",{href:__ART_BG,x:0,y:0,width:1000,height:620,preserveAspectRatio:"xMidYMid slice"},d); return; }
  function cloud(x,y,k){ var c=g(d); c.setAttribute("transform","translate("+x+","+y+") scale("+k+")"); [[0,20,34],[34,4,40],[72,18,32],[36,28,40]].forEach(function(q){ el("circle",{cx:q[0],cy:q[1],r:q[2],fill:"#eef6ff"},c); }); }
  cloud(40,30,.9); cloud(860,50,.7);
  el("path",{d:"M0 560 Q180 500 360 545 T720 535 T1000 515 V620 H0Z",fill:"#ecf9f1"},d); el("path",{d:"M0 595 Q220 560 460 588 T1000 572 V620 H0Z",fill:"#dcf3e4"},d);
  [[120,575],[640,590],[900,580]].forEach(function(q){ var f=g(d); f.setAttribute("transform","translate("+q[0]+","+q[1]+")"); [0,72,144,216,288].forEach(function(a){ var r=a*Math.PI/180; el("circle",{cx:Math.cos(r)*7,cy:Math.sin(r)*7,r:6,fill:"#ffd0e2"},f); }); el("circle",{cx:0,cy:0,r:5,fill:"#ffd34d"},f); }); }
function pt(e){ var p=svg.createSVGPoint(); p.x=e.clientX; p.y=e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
function tap(node, fn){ node.style.cursor="pointer"; node.addEventListener("pointerdown", function(e){ e.preventDefault(); if(S.lock) return; fn(e); }); return node; }
function animT(n,x,y,ms){ var x0=n._tx||0,y0=n._ty||0,t0=performance.now(); ms=ms||220;
  (function step(t){ var k=Math.min(1,(t-t0)/ms); k=1-Math.pow(1-k,3); setT(n,x0+(x-x0)*k,y0+(y-y0)*k); if(k<1) requestAnimationFrame(step); })(t0); }
function draggable(n, onDrop){
  var st=null; n.style.cursor="grab"; n.style.touchAction="none";
  n.addEventListener("pointerdown",function(e){ if(S.lock||n._done) return; e.preventDefault(); try{n.setPointerCapture(e.pointerId);}catch(_){} var p=pt(e); st={x:p.x,y:p.y,tx:n._tx||0,ty:n._ty||0}; n.parentNode.appendChild(n); n.classList.add("lift"); });
  n.addEventListener("pointermove",function(e){ if(!st) return; var p=pt(e); setT(n,st.tx+p.x-st.x,st.ty+p.y-st.y); });
  function up(e){ if(!st) return; var s=st; st=null; n.classList.remove("lift"); var p=pt(e); var r=onDrop(n._tx,n._ty,n,p); if(r&&r.x!==undefined){ animT(n,r.x,r.y); } else if(!r){ animT(n,s.tx,s.ty,300); } }
  n.addEventListener("pointerup",up); n.addEventListener("pointercancel",up);
}
function scatter(k, x, y, w, h, s){
  if(k<=2){ s=Math.min(s,w/2.4,h*0.8); return [0,1].slice(0,k).map(function(i){ return { x:x+w/2-(k===2?s+15:s/2)+i*(s+30), y:y+(h-s)/2, s:s }; }); }
  var cols=Math.ceil(Math.sqrt(k*w/h)), rows=Math.ceil(k/cols); while(cols*rows<k) rows++;
  var cells=[]; for(var r=0;r<rows;r++) for(var c=0;c<cols;c++) cells.push([c,r]);
  cells=shuffle(cells).slice(0,k); var cw=w/cols, ch=h/rows; s=Math.min(s, cw*0.85, ch*0.85);
  return cells.map(function(cr){ return { x:x+cr[0]*cw+(cw-s)/2+(Math.random()-0.5)*(cw-s)*0.6, y:y+cr[1]*ch+(ch-s)/2+(Math.random()-0.5)*(ch-s)*0.6, s:s }; });
}
function choices(vals, correct, render){
  var n=vals.length, w=200, gap=40, x0=500-(n*w+(n-1)*gap)/2;
  vals.forEach(function(v,i){
    var b=g(); setT(b, x0+i*(w+gap), 470); if(v===correct) setHint(function(){ hintNode(b); });
    el("rect",{x:0,y:0,width:w,height:130,rx:34,"class":"choice"},b);
    if(render) render(v,b,w); else txt(v,w/2,96,78,b);
    tap(b,function(){ if(v===correct){ b.classList.add("good"); win(); } else { b.classList.add("bad"); miss(); setTimeout(function(){ b.classList.remove("bad"); },600); } });
  });
}
function numChoices(n, lo, hi){ var k=NCH[TIER], pool=[]; hi=Math.max(hi,n+2); for(var v=Math.max(lo,n-3); v<=Math.min(hi,n+3); v++) if(v!==n) pool.push(v); return shuffle([n].concat(shuffle(pool).slice(0,k-1))); }
function panel(x,y,w,h,parent){ return el("rect",{x:x,y:y,width:w,height:h,rx:30,"class":"panel"},parent); }

/* ---------- 소리 ---------- */
var AC=null;
function ac(){ try{ if(!AC) AC=new (window.AudioContext||window.webkitAudioContext)(); if(AC.state==="suspended") AC.resume(); }catch(e){} return AC; }
function tone(type,f0,f1,t,d,vol){ var a=ac(); if(!a||S.muted) return; var o=a.createOscillator(), gn=a.createGain(); o.type=type; o.frequency.setValueAtTime(f0,t); if(f1) o.frequency.exponentialRampToValueAtTime(f1,t+d); gn.gain.setValueAtTime(0.0001,t); gn.gain.exponentialRampToValueAtTime(vol||0.3,t+0.02); gn.gain.exponentialRampToValueAtTime(0.0001,t+d); o.connect(gn); gn.connect(a.destination); o.start(t); o.stop(t+d+0.05); }
function ding(){ var a=ac(); if(!a) return; var t=a.currentTime; tone("sine",880,null,t,0.18,0.25); tone("sine",1320,null,t+0.09,0.25,0.22); }
function boing(){ var a=ac(); if(!a||S.muted) return; var t=a.currentTime; var o=a.createOscillator(), gn=a.createGain(), l=a.createOscillator(), lg=a.createGain();
  o.type="sine"; o.frequency.setValueAtTime(160,t); o.frequency.exponentialRampToValueAtTime(620,t+0.13); o.frequency.exponentialRampToValueAtTime(120,t+0.65);
  l.frequency.value=16; lg.gain.value=45; l.connect(lg); lg.connect(o.frequency);
  gn.gain.setValueAtTime(0.0001,t); gn.gain.exponentialRampToValueAtTime(0.55,t+0.02); gn.gain.exponentialRampToValueAtTime(0.0001,t+0.75);
  o.connect(gn); gn.connect(a.destination); o.start(t); l.start(t); o.stop(t+0.8); l.stop(t+0.8); }
function wahwah(){ var a=ac(); if(!a||S.muted) return; var t=a.currentTime+0.75; var notes=[[392,0.28],[370,0.28],[349,0.28],[330,0.85]];
  notes.forEach(function(nv,i){ var o=a.createOscillator(), f=a.createBiquadFilter(), gn=a.createGain(); o.type="sawtooth"; o.frequency.setValueAtTime(nv[0],t);
    if(i===3){ var l=a.createOscillator(), lg=a.createGain(); l.frequency.value=6; lg.gain.value=9; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t+nv[1]); }
    f.type="lowpass"; f.frequency.setValueAtTime(500,t); f.frequency.linearRampToValueAtTime(1500,t+0.1); f.frequency.linearRampToValueAtTime(600,t+nv[1]);
    gn.gain.setValueAtTime(0.0001,t); gn.gain.exponentialRampToValueAtTime(0.22,t+0.03); gn.gain.setValueAtTime(0.22,t+nv[1]-0.06); gn.gain.exponentialRampToValueAtTime(0.0001,t+nv[1]);
    o.connect(f); f.connect(gn); gn.connect(a.destination); o.start(t); o.stop(t+nv[1]+0.02); t+=nv[1]; }); }
function applause(){ var a=ac(); if(!a||S.muted) return; var t0=a.currentTime; var len=Math.floor(a.sampleRate*0.04); var buf=a.createBuffer(1,len,a.sampleRate); var d=buf.getChannelData(0);
  for(var i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3);
  for(var k=0;k<70;k++){ var s=a.createBufferSource(); s.buffer=buf; var f=a.createBiquadFilter(); f.type="bandpass"; f.frequency.value=900+Math.random()*1800; f.Q.value=0.8; var gn=a.createGain(); gn.gain.value=0.25+Math.random()*0.35; s.connect(f); f.connect(gn); gn.connect(a.destination); s.start(t0+Math.random()*1.5*Math.pow(Math.random(),0.5)); }
  [523,659,784,1047].forEach(function(f,i){ tone("triangle",f,null,t0+i*0.1,0.3,0.18); }); }
/* 장난용·효과음 음성(할아버지, 로봇 등)은 빼고, 차분한 기본 여자 음성을 고름 */
var ODDVOICE=/grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley|bad news|bahh|bells|boing|bubbles|cellos|wobble|zarvox|whisper|jester|organ|superstar|trinoids|junior|albert|fred|ralph|kathy|good news|hysterical|deranged|pipe|novelty/i;
function goodVoices(prefix){ try{ return speechSynthesis.getVoices().filter(function(v){ return v.lang.replace("_","-").toLowerCase().indexOf(prefix)===0 && !ODDVOICE.test(v.name); }); }catch(e){ return []; } }
function rankVoice(v){ var n=v.name; return (/premium|enhanced|고급/i.test(n)?0:10)+(/yuna|유나|sora|소라|samantha|ava|allison|kyoko|tingting|ting-ting|meijia|lili/i.test(n)?0:5)+(/google/i.test(n)?2:0); }
function bestVoice(prefix, want){ var vs=goodVoices(prefix); if(want){ var w=vs.filter(function(v){ return v.name===want; })[0]; if(w) return w; } return vs.sort(function(a,b){ return rankVoice(a)-rankVoice(b); })[0]||null; }
function pickVoice(){ var want=null; try{ want=localStorage.getItem("goyu-voice-ko"); }catch(e){} S.voice=bestVoice("ko",want); }
try{ speechSynthesis.onvoiceschanged=function(){ pickVoice(); if(window.LVOICE) for(var k in LVOICE) delete LVOICE[k]; }; }catch(e){}
try{ speechSynthesis.onvoiceschanged=pickVoice; pickVoice(); }catch(e){}
function say(s, delay, keep){ if(window.__sayHook) __sayHook(s); if(S.muted) return; var go=function(){ var c=clipFor(s); if(c){ clipPlay(c,keep); return; } if(!keep) clipStop(); try{ if(!keep) speechSynthesis.cancel(); var u=new SpeechSynthesisUtterance(s); u.lang="ko-KR"; if(S.voice) u.voice=S.voice; u.rate=S.vr||0.95; u.pitch=S.vp||1.05; u.onstart=function(){ talk(true); }; u.onend=u.onerror=function(){ talk(false); }; clearTimeout(say._t); say._t=setTimeout(function(){ talk(false); }, 900+String(s).length*170); speechSynthesis.speak(u); }catch(e){} }; if(delay) setTimeout(go,delay); else go(); }

/* ---------- 칭찬과 아쉬움 ---------- */
var PRAISE=["성공! 멋진데~?","성공! 멋진데~? 짝짝짝!","우와, 성공! 진짜 멋진데~?","성공! 최고야~!"];
function burst(){ var box=$("fx"); var cols=["#ff6b6b","#ffc83d","#5bb8f2","#6ccb8f","#b38cff","#ff9ec7"];
  for(var i=0;i<46;i++){ var p=document.createElement("i"); p.className="cf"; p.style.left=(10+Math.random()*80)+"%"; p.style.background=pick(cols); p.style.animationDelay=(Math.random()*0.35)+"s"; p.style.setProperty("--dx",(Math.random()*200-100)+"px"); p.style.setProperty("--r",(Math.random()*720)+"deg"); box.appendChild(p); setTimeout((function(q){return function(){ q.remove(); };})(p),2200); } }
function bubble(text, kind){ var b=$("bubble"); b.textContent=text; b.className="bubble show "+kind; clearTimeout(bubble._t); bubble._t=setTimeout(function(){ b.className="bubble"; }, kind==="yay"?1700:1500); }
function miss(msg){ if(S.diag){ if(S.lock) return; diagAnswer(false); return; } buddyPose("dizzy",1600); S.miss++; var hintNow=S.hintFn&&S.miss>=HINTAT[TIER]; if(hintNow) setTimeout(S.hintFn,900); boing(); wahwah(); bubble("띠용~ 뿌엥뿌엥~","oops"); say("뿌엥뿌엥~ "+(msg||"다시 해 볼까?"),700); S.streak=0;
  if(hintNow&&S.miss===HINTAT[TIER]) say(pick(LINES.hint),750,true); else if(!hintNow) cheerUp(); var st=$("stagewrap"); st.classList.remove("shake"); void st.offsetWidth; st.classList.add("shake"); }
function good(){ ding(); }
function win(){ if(S.lock) return; if(S.diag){ diagAnswer(true); return; } S.lock=true; applause(); burst(); var p=pick(PRAISE); bubble(p,"yay"); say(p,150); buddyPose("cheer",2000); $("ptext").textContent=p; var extra=streakTalk();
  setTimeout(function(){ S.lock=false; S.round++; updDots(); if(S.round>=S.rounds) levelDone(); else playRound(); }, 2100+extra); }

/* ---------- 게임 종류 ---------- */
var G={};
function prompt(s){ $("ptext").textContent=s; S.prompt=s; say(s,250); }

G.count=function(p){ var n=p.dice? rnd(1,Math.max(3,Math.min(6,cap()))) : clampN(pick(p.nums||[1,2,3,4,5])); if(TIER===3&&!p.dice) n=Math.min(10,n+rnd(0,4)); var k=(hasMe()&&!S.diag&&S.round===2)?"me":(p.icon||"bean");
  if(p.dice){ var b=g(); setT(b,350,90); el("rect",{x:0,y:0,width:300,height:300,rx:50,"class":"dice"},b);
    var P={1:[[.5,.5]],2:[[.27,.27],[.73,.73]],3:[[.27,.27],[.5,.5],[.73,.73]],4:[[.27,.27],[.73,.27],[.27,.73],[.73,.73]],5:[[.27,.27],[.73,.27],[.5,.5],[.27,.73],[.73,.73]],6:[[.27,.25],[.73,.25],[.27,.5],[.73,.5],[.27,.75],[.73,.75]]}[n];
    P.forEach(function(q){ el("circle",{cx:q[0]*300,cy:q[1]*300,r:30,fill:"#5b3fa8"},b); }); prompt("주사위 눈이 몇 개야?"); }
  else { scatter(n,120,40,760,380,120).forEach(function(q){ icon(k,q.x,q.y,q.s); }); prompt(iga(nm(k))+" 몇 "+unit(k)+"야?"); }
  choices(numChoices(n,p.dice?1:0,10), n); };

G.tapcount=function(p){ var n=pick(p.nums||[1,2,3,4,5]); if(n===0) n=rnd(1,5); n=clampN(n); var k=p.icon||"apple", cnt=0, tot=TIER===0?5:10;
  prompt(eul(nm(k))+" "+n+"개만 눌러서 색칠해 줘"); var ty=tot===5?180:40; txt(n,90,tot===5?320:300,200,null,"#5b3fa8");
  for(var i=0;i<tot;i++){ (function(i){ var b=g(); var x=190+(i%5)*155, y=ty+Math.floor(i/5)*200; setT(b,x,y); el("rect",{x:-6,y:-6,width:142,height:142,rx:28,"class":"slot"},b); var u=icon(k,0,0,130,b); b.classList.add("gray");
    tap(b,function(){ if(b.classList.contains("gray")){ cnt++; b.classList.remove("gray"); if(cnt>n){ cnt--; b.classList.add("gray"); miss(n+"개만 칠해야 해"); return; } good(); if(cnt===n) setTimeout(win,300); } else { cnt--; b.classList.add("gray"); } }); })(i); } };

G.frame=function(p){ var size=p.size||5, n=pick(p.nums||[1,2,3,4,5]), cnt=0; if(n>size) n=size; n=clampN(n); var cs=size===5?150:120, x0=500-cs*5/2, y0=size===5?140:80;
  prompt(n===0? "아무것도 안 넣으면 돼! 빈 칸 그대로 '다 했어' 눌러 줘" : "동그라미 "+n+"개를 칸에 채워 줘");
  for(var i=0;i<size;i++){ (function(i){ var r=Math.floor(i/5), c=i%5; var b=g(); setT(b,x0+c*cs,y0+r*cs); el("rect",{x:0,y:0,width:cs,height:cs,"class":"cell"},b); var d=el("circle",{cx:cs/2,cy:cs/2,r:cs*0.36,"class":"token off"},b);
    tap(b,function(){ if(d.classList.contains("off")){ d.classList.remove("off"); cnt++; if(cnt>n){ cnt--; d.classList.add("off"); miss(n+"개만 넣어야 해"); return; } good(); if(cnt===n&&n>0) setTimeout(win,300); } else { d.classList.add("off"); cnt--; } }); })(i); }
  txt(n,500,y0+(size===5?1:2)*cs+110,90,null,"#5b3fa8");
  if(n===0){ var b=g(); setT(b,380,470); el("rect",{x:0,y:0,width:240,height:110,rx:30,"class":"choice"},b); txt("다 했어",120,72,48,b); tap(b,function(){ cnt===0?win():miss("0은 하나도 없는 거야"); }); } };

G.add=function(p){ var pr=pick(p.probs||[[2,1],[3,2],[1,3]]), a=pr[0], b=pr[1], k=p.icon||"apple"; if(a+b>cap()){ a=rnd(1,cap()-1); b=rnd(1,cap()-a); } if(TIER===3&&S.round>0){ a=rnd(3,6); b=rnd(2,4); }
  panel(40,50,380,330); panel(580,50,380,330); txt("+",500,260,120,null,"#5b3fa8");
  scatter(a,60,70,340,290,110).forEach(function(q){ icon(k,q.x,q.y,q.s); }); scatter(b,600,70,340,290,110).forEach(function(q){ icon(k,q.x,q.y,q.s); });
  prompt(nm(k)+" "+a+unit(k)+"와 "+b+unit(k)+"를 합치면 모두 몇 "+unit(k)+"야?"); choices(numChoices(a+b,1,10),a+b); };

G.makeN=function(p){ var n=[3,Math.min(p.n||5,5),p.n||5,10][TIER], k=p.icon||"cookie", have=rnd(1,n-1); var cs=n<=5?150:110, cols=Math.min(n,5), x0=500-cols*cs/2;
  for(var i=0;i<n;i++){ var r=Math.floor(i/5),c=i%5; el("rect",{x:x0+c*cs,y:60+r*cs,width:cs,height:cs,"class":"cell"}); if(i<have) icon(k,x0+c*cs+cs*0.12,60+r*cs+cs*0.12,cs*0.76); }
  prompt("모두 "+n+"개가 되려면 "+nm(k)+" 몇 개가 더 있어야 할까?"); choices(numChoices(n-have,1,n),n-have); };

G.subtract=function(p){ var pr=pick(p.probs||[[5,2],[4,1],[6,3]]), a=pr[0], b=pr[1], k=p.icon||"mosquito", gone=0, _s=(a>cap()?(a=rnd(2,cap()),b=rnd(1,a-1)):0), verb=p.verb||"날아갔어요";
  var pos=scatter(a,100,40,800,400,130); var u=unit(k); prompt(nm(k)+" "+a+u+" 중에서 "+b+u+"를 눌러서 "+(/날아/.test(verb)?"날려 보내 줘":"치워 줘"));
  pos.forEach(function(q){ var u=g(); setT(u,q.x,q.y); icon(k,0,0,q.s,u); tap(u,function(){ if(u._gone) return; u._gone=true; gone++; good(); u.classList.add("flyaway");
    if(gone===b){ setTimeout(function(){ prompt("남은 건 몇 "+u+"야?"); choices(numChoices(a-b,0,10),a-b); },700); } }); }); };

G.compare=function(p){ var k=p.icon||"ghost", k2=p.icon2||k, a,b, hi=T([3,5,6,9]), md=TIER===0?2:1; do{ a=rnd(1,hi); b=rnd(1,hi);}while(Math.abs(a-b)<md); var more=Math.random()<0.7;
  prompt(more?"더 많은 쪽을 눌러 줘":"더 적은 쪽을 눌러 줘");
  [[40,a,k],[520,b,k2]].forEach(function(d,i){ var gp=g(); panel(d[0],40,440,400,gp); scatter(d[1],d[0]+20,60,400,360,120).forEach(function(q){ icon(d[2],q.x,q.y,q.s,gp); });
    var okk = more ? (i===0?a>b:b>a) : (i===0?a<b:b<a); if(okk) setHint(function(){ hintNode(gp); }); tap(gp,function(){ var ok = okk; if(ok){ gp.firstChild.classList.add("goodp"); win(); } else miss(); }); }); };

G.ordinal=function(p){ var k=pick([p.icon||"apple","ball","star","fish","car","duck"]), n=T([3,4,6,6]), t=rnd(0,Math.min(4,n-1));
  txt("출발",70,250,36,null,"#5b3fa8"); el("path",{d:"M40 280 L100 280",stroke:"#5b3fa8","stroke-width":8});
  prompt("출발 쪽부터 세어서 "+ORD[t]+" "+eul(nm(k))+" 눌러 줘");
  for(var i=0;i<n;i++){ (function(i){ var b=g(); setT(b,130+i*140,170); icon(k,0,0,125,b); if(i===t) setHint(function(){ hintNode(b); }); tap(b,function(){ if(i===t){ b.classList.add("pop"); win(); } else miss(ORD[t]+"를 찾아봐"); }); })(i); } };

G.order=function(p){ var an=(p.animals||["bear","cat","rabbit"]).slice(0, Math.min(p.kind==="podium"?3:4, T([2,3,4,4]))); if(hasMe()){ an=an.slice(); an[0]="me"; } var nodes=[]; var steps=shuffle(an.map(function(a,i){return [a,i];})), si=0, n=an.length;
  var slots=[]; var w=p.kind==="podium"?220:200, x0=500-(n*w+(n-1)*16)/2;
  for(var i=0;i<n;i++){ var x=x0+i*(w+16), h=p.kind==="podium"?[60,180,120,90][i]:0;
    if(p.kind==="podium"){ var order=[1,0,2][i]; x=x0+i*(w+16); el("rect",{x:x,y:390-[110,170,70][i],width:w,height:[110,170,70][i],"class":"podium"}); txt((order+1)+"등",x+w/2,390-[110,170,70][i]/2+18,48,null,"#fff"); slots[order]={x:x+w/2-70,y:390-[110,170,70][i]-150}; }
    else { el("rect",{x:x,y:120,width:w,height:180,rx:24,"class":"car"}); el("circle",{cx:x+45,cy:320,r:26,"class":"wheel"}); el("circle",{cx:x+w-45,cy:320,r:26,"class":"wheel"}); txt(ORD[i],x+w/2,385,40,null,"#5b3fa8"); slots[i]={x:x+w/2-70,y:140}; } }
  if(p.kind!=="podium") txt("◀ 맨 앞",x0-10,100,30,null,"#7a6b62","start");
  function ask(){ var s=steps[si]; setHint(function(){ nodes.forEach(function(x){ if(x._a===s[0]) hintNode(x); }); }); S.miss=0; prompt(p.kind==="podium"? iga(nm(s[0]))+" "+(s[1]+1)+"등이야! 시상대에 올려 줘" : eul(nm(s[0]))+" "+ORD[s[1]]+" 칸에 태워 줘"); }
  shuffle(an).forEach(function(a,i){ var b=g(); var hx=500-(n*170)/2+i*170+15, hy=450; setT(b,hx,hy); icon(a,0,0,140,b); b._a=a; nodes.push(b);
    draggable(b,function(x,y){ var s=steps[si]; var idx=an.indexOf(b._a); var tgt=null; slots.forEach(function(sl,j){ if(Math.abs(x-sl.x)<110&&Math.abs(y-sl.y)<130) tgt=j; });
      if(tgt===null) return false; if(b._a===s[0]&&tgt===s[1]){ b._done=true; good(); si++; if(si===n) setTimeout(win,300); else setTimeout(ask,500); return {x:slots[tgt].x,y:slots[tgt].y}; } miss(); return false; }); });
  ask(); };

G.numorder=function(p){ var n=Math.min(p.maxn||10,10,cap()), next=1, nodes=[]; setHint(function(){ hintNode(nodes[next-1]); }); prompt("1부터 "+n+"까지 차례로 눌러 줘");
  var pos=scatter(n,60,30,880,420,120); var last=null;
  pos.forEach(function(q,i){ var v=i+1; var b=g(); setT(b,q.x+q.s/2,q.y+q.s/2); el("circle",{cx:0,cy:0,r:56,"class":"bub"},b); txt(v,0,20,58,b); nodes.push(b);
    tap(b,function(){ if(v===next){ b.classList.add("on"); if(last) { var l=el("line",{x1:last[0],y1:last[1],x2:b._tx,y2:b._ty,"class":"link"}); svg.insertBefore(l,svg.firstChild); } last=[b._tx,b._ty]; next++; good(); if(next>n) setTimeout(win,300); } else if(v>=next) miss(next+"을 먼저 찾아봐"); }); }); };

G.dots=function(p){ var keys=Object.keys(D2D); var sh=TIER===0? pick(["house","boat"]) : (S.round===0&&p.shape?p.shape:pick(keys)); var nodes=[]; setHint(function(){ hintNode(nodes[next-1]); }); var pts=D2D[sh], next=1, sc=5.6, ox=500-50*sc, oy=5;
  var poly=el("polyline",{points:"","class":"dotline"}); var done=[];
  prompt("1부터 차례로 점을 눌러서 이어 줘"); if(TIER===0) setTimeout(function(){ hintNode(nodes[0]); },50);
  pts.forEach(function(q,i){ var b=g(); setT(b,ox+q[0]*sc,oy+q[1]*sc); el("circle",{cx:0,cy:0,r:26,"class":"bub"},b); txt(i+1,0,11,30,b); nodes.push(b);
    tap(b,function(){ if(i+1===next){ b.classList.add("on"); done.push(b._tx+","+b._ty); poly.setAttribute("points",done.join(" ")); next++; good(); if(TIER===0&&nodes[next-1]) hintNode(nodes[next-1]);
      if(next>pts.length){ done.push(done[0]); poly.setAttribute("points",done.join(" ")); poly.classList.add("fillin"); setTimeout(win,500); } } else if(i+1>=next) miss(next+"번 점을 찾아봐"); }); }); };

G.routine=function(p){ var st=p.steps||[["sun","일어나요"],["bowl","밥 먹어요"],["ball","놀아요"],["moon","자요"]]; st=st.slice(0,T([3,3,5,5])); var n=st.length, next=0, nodes=[], w=170, x0=500-(n*w+(n-1)*14)/2; setHint(function(){ nodes.forEach(function(x){ if(x._i===next) hintNode(x); }); });
  prompt("먼저 하는 것부터 차례로 눌러 줘");
  for(var i=0;i<n;i++){ el("rect",{x:x0+i*(w+14),y:30,width:w,height:200,rx:24,"class":"slot"}); txt(i+1,x0+i*(w+14)+w/2,265,40,null,"#5b3fa8"); }
  shuffle(st.map(function(s,i){return [s,i];})).forEach(function(si,j){ var b=g(); setT(b,x0+j*(w+14),300); el("rect",{x:0,y:0,width:w,height:200,rx:24,"class":"card"},b); icon(si[0][0],25,12,120,b); txt(si[0][1],w/2,180,30,b); b._i=si[1]; nodes.push(b);
    tap(b,function(){ if(b._done) return; if(si[1]===next){ b._done=true; animT(b,x0+next*(w+14),30); next++; good(); if(next===n) setTimeout(win,400); } else miss("뭘 먼저 할까?"); }); }); };

G.pattern=function(p){ var sets=[["apple","ball"],["star","star","heart"],["fish","duck","duck"],["circle","triangle","square"],["sun","moon"],["dog","cat","cat"],["strawberry","grape"],["car","car","ball"]];
  var pat=(p.rows&&S.round<p.rows.length)? p.rows[S.round] : pick(sets); if(TIER===0&&pat.length!==2) pat=pick(sets.filter(function(x){ return x.length===2; })); var seq=[]; for(var i=0;i<7;i++) seq.push(pat[i%pat.length]); var ans=seq[6];
  for(var i=0;i<7;i++){ if(i<6) icon(seq[i],40+i*135,120,120); else { el("rect",{x:40+i*135,y:115,width:125,height:125,rx:24,"class":"qbox"}); txt("?",40+i*135+62,205,80,null,"#5b3fa8"); } }
  prompt("규칙을 찾아봐! 물음표에는 뭐가 올까?"); var opts=[ans]; var pool=["apple","ball","star","heart","fish","duck","circle","triangle","square","sun","moon","dog","cat","car","grape","strawberry"];
  while(opts.length<NCH[TIER]){ var c=pick(pool); if(opts.indexOf(c)<0) opts.push(c); } choices(shuffle(opts),ans,function(v,b,w){ icon(v,w/2-55,10,110,b); }); };

G.bingo=function(p){ var shapes=p.kind==="shape", items=shapes?["circle","triangle","square","star","heart","rect","circle","triangle","square"]:shuffle([1,2,3,4,5,6,7,8,9]); if(shapes) items=shuffle(items);
  var cs=140, x0=290, y0=20, marked=[]; var cells=[];
  items.forEach(function(it,i){ var b=g(); setT(b,x0+(i%3)*cs,y0+Math.floor(i/3)*cs); el("rect",{x:0,y:0,width:cs,height:cs,"class":"cell"},b); if(shapes) icon(it,25,25,90,b); else txt(it,cs/2,cs/2+28,80,b); b._v=it; cells.push(b);
    tap(b,function(){ if(marked[i]) return; if(it===S.call){ marked[i]=true; b.classList.add("mark"); good(); if(line()) setTimeout(win,300); else setTimeout(call,600); } else miss(); }); });
  var L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  function line(){ return L.some(function(l){ return l.every(function(i){ return marked[i]; }); }); }
  function call(){ var left=items.filter(function(v,i){ return !marked[i]; }); S.call=pick(left); prompt(eul(shapes? nm(S.call) : String(S.call))+" 찾아 눌러 줘"); }
  txt("한 줄을 만들면 빙고!",500,500,40,null,"#7a6b62"); call(); };

G.hidden=function(p){ var k=p.icon||"mosquito", n=Math.min(p.n||6,T([3,4,6,8])), found=0; var deco=["tree","flower","house","leaf","sun","umbrella","ball","bowl","tree","flower"];
  panel(20,10,960,440); var placed=[];
  function free(x,y,s){ return placed.every(function(q){ return Math.abs(x-q[0])>(s+q[2])*0.55||Math.abs(y-q[1])>(s+q[2])*0.55; }); }
  deco.forEach(function(d){ for(var t=0;t<60;t++){ var s=rnd(90,140), x=rnd(30,970-s), y=rnd(20,440-s); if(free(x,y,s)){ placed.push([x,y,s]); icon(d,x,y,s); break; } } });
  var cnt=txt("0 / "+n,500,520,56,null,"#5b3fa8");
  var made=0; for(var t=0;t<800&&made<n;t++){ var s=rnd(50,64), x=rnd(30,970-s), y=rnd(20,440-s); if(free(x,y,s)){ placed.push([x,y,s]); made++; (function(x,y,s){ var b=g(); setT(b,x,y); el("rect",{x:-10,y:-10,width:s+20,height:s+20,fill:"transparent"},b); icon(k,0,0,s,b);
    tap(b,function(){ if(b._f) return; b._f=true; found++; b.classList.add("found"); cnt.textContent=found+" / "+n; good(); if(found===n) setTimeout(win,300); }); })(x,y,s); } }
  n=made; cnt.textContent="0 / "+n; prompt("숨어 있는 "+eul(nm(k))+" 모두 찾아 눌러 줘"); };

G.findnum=function(p){ var up=Math.min(p.upto||20,T([5,10,20,30])), cols=up<=10?5:10, cs=up<=10?150:88, x0=500-cols*cs/2, t=rnd(1,Math.min(up,20));
  for(var i=1;i<=up;i++){ (function(i){ var b=g(); setT(b,x0+((i-1)%cols)*cs,30+Math.floor((i-1)/cols)*cs); el("rect",{x:0,y:0,width:cs,height:cs,"class":"cell"},b); txt(i,cs/2,cs/2+(cs>100?26:16),cs>100?64:40,b); if(i===t) setHint(function(){ hintNode(b); });
    tap(b,function(){ if(i===t){ b.classList.add("mark"); win(); } else miss(eul(String(t))+" 찾아봐"); }); })(i); }
  prompt(eul(String(t))+" 찾아 눌러 줘"); };

G.calendar=function(p){ var cw=128, ch=72, x0=500-cw*3.5, days=["일","월","화","수","목","금","토"]; var mode=S.round%2;
  days.forEach(function(d,i){ txt(d,x0+i*cw+cw/2,40,34,null,i===0?"#e05252":"#5b3fa8"); });
  var t=rnd(1,TIER<=1?10:28); var sundays=[];
  for(var k=0;k<35;k++){ (function(k){ var dn=k-2+1; var b=g(); setT(b,x0+(k%7)*cw,56+Math.floor(k/7)*ch); el("rect",{x:0,y:0,width:cw,height:ch,"class":"cell"},b); if(dn>=1&&dn<=31){ txt(dn,cw/2,ch/2+14,36,b); if((mode===0&&dn===t)||(mode===1&&dn===6)) setHint(function(){ hintNode(b); }); if(k%7===0) sundays.push(dn);
    tap(b,function(){ var ok= mode===0 ? dn===t : k%7===0; if(ok){ b.classList.add("mark"); win(); } else miss(); }); } })(k); }
  txt("2026년 12월",500,500,40,null,"#7a6b62"); prompt(mode===0? "달력에서 "+t+"일을 찾아 눌러 줘" : "달력에서 일요일 하나를 찾아 눌러 줘"); };

G.coins=function(p){ var it=pick(p.items||[["milk",2],["apple",1],["toy",4],["cupcake",3]]), price=Math.min(it[1],cap()), cnt=0;
  icon(it[0],80,60,200); txt(price*100+"원",180,320,64,null,"#5b3fa8"); el("rect",{x:360,y:40,width:600,height:300,rx:30,"class":"tray"}); txt("동전 넣는 곳",660,85,32,null,"#7a6b62");
  prompt(iga(nm(it[0]))+" "+price*100+"원이야. 100원짜리를 "+price+"개 넣어 줘");
  for(var i=0;i<8;i++){ (function(i){ var b=g(); var hx=100+i*105, hy=470; setT(b,hx,hy); icon("coin",0,0,95,b);
    tap(b,function(){ if(!b._in){ b._in=true; cnt++; animT(b,390+((cnt-1)%5)*112,120+Math.floor((cnt-1)/5)*110); good(); if(cnt===price) setTimeout(win,400); else if(cnt>price){ setTimeout(function(){ b._in=false; cnt--; animT(b,hx,hy); },200); miss(price+"개만 넣어야 해"); } } else { b._in=false; cnt--; animT(b,hx,hy); } }); })(i); } };

G.share=function(p){ var people=p.people||2, total=p.total||6, k=p.icon||"cookie"; if(S.round>0){ people=pick([2,3]); total=people*rnd(2,3); } if(TIER===0){ people=2; total=pick([2,4]); } else if(TIER===1&&total>6){ people=2; total=pick([4,6]); }
  var w=900/people, plates=[], counts=[]; var who=hasMe()?["me","bear","rabbit","cat"]:["bear","rabbit","cat","dog"];
  for(var i=0;i<people;i++){ var cx=50+i*w+w/2; el("ellipse",{cx:cx,cy:190,rx:w/2-20,ry:140,"class":"plate"}); icon(who[i],cx-40,330,80); plates.push(cx); counts.push(0); }
  prompt(nm(k)+" "+total+"개를 친구 "+people+"명에게 똑같이 나눠 줘"); var placed=0;
  for(var j=0;j<total;j++){ (function(j){ var b=g(); var hx=500-total*55+j*110+5, hy=470; setT(b,hx,hy); icon(k,0,0,95,b); b._p=-1;
    draggable(b,function(x,y){ var cx=x+47; var t=-1; plates.forEach(function(px,i){ if(Math.abs(cx-px)<w/2-10&&y>40&&y<330) t=i; }); if(t<0) return false;
      if(b._p<0) placed++; else counts[b._p]--; b._p=t; counts[t]++; good();
      if(placed===total){ setTimeout(function(){ if(counts.every(function(c){ return c===counts[0]; })) win(); else { miss("똑같이 나눠야 해. 세어 볼까?"); } },350); }
      return {x:x,y:y}; }); })(j); } };

G.maze=function(p){ if(hasMe()) p=Object.assign({},p,{start:"me"}); var cols=T([3,4,6,7]), rows=T([2,3,4,4]), cs=140, x0=500-cols*cs/2, y0=Math.max(10,Math.round((610-rows*cs)/2)); var W={}; for(var c=0;c<cols;c++) for(var r=0;r<rows;r++) W[c+","+r]=[1,1,1,1];
  var seen={"0,0":1}, st=[[0,0]]; while(st.length){ var cur=st[st.length-1], c=cur[0], r=cur[1]; var nb=[[0,-1,0],[1,0,1],[0,1,2],[-1,0,3]].map(function(d){return [c+d[0],r+d[1],d[2]];}).filter(function(q){ return W[q[0]+","+q[1]]&&!seen[q[0]+","+q[1]]; });
    if(!nb.length){ st.pop(); continue; } var q=pick(nb); W[c+","+r][q[2]]=0; W[q[0]+","+q[1]][(q[2]+2)%4]=0; seen[q[0]+","+q[1]]=1; st.push([q[0],q[1]]); }
  var pos=[0,0], goal=[cols-1,rows-1];
  for(var c=0;c<cols;c++) for(var r=0;r<rows;r++){ (function(c,r){ var x=x0+c*cs, y=y0+r*cs; var b=el("rect",{x:x,y:y,width:cs,height:cs,"class":"mcell"}); var w=W[c+","+r];
      if(w[0]) el("line",{x1:x,y1:y,x2:x+cs,y2:y,"class":"wall"}); if(w[3]) el("line",{x1:x,y1:y,x2:x,y2:y+cs,"class":"wall"}); if(c===cols-1&&w[1]) el("line",{x1:x+cs,y1:y,x2:x+cs,y2:y+cs,"class":"wall"}); if(r===rows-1&&w[2]) el("line",{x1:x,y1:y+cs,x2:x+cs,y2:y+cs,"class":"wall"});
      tap(b,function(){ var dc=c-pos[0], dr=r-pos[1]; if(Math.abs(dc)+Math.abs(dr)!==1) return; var d= dr===-1?0: dc===1?1: dr===1?2:3; if(W[pos[0]+","+pos[1]][d]){ miss("벽이 있어! 다른 길로 가 볼까?"); return; }
        pos=[c,r]; var tr=el("circle",{cx:x+cs/2,cy:y+cs/2,r:14,"class":"trail"}); svg.insertBefore(tr,me); animT(me,x+15,y+15); good(); if(c===goal[0]&&r===goal[1]) setTimeout(win,300); }); })(c,r); }
  icon(p.goal||"egg",x0+(cols-1)*cs+15,y0+(rows-1)*cs+15,110); var me=g(); icon(p.start||"dino",0,0,110,me); setT(me,x0+15,y0+15);
  prompt(iga(nm(p.start||"dino"))+" "+nm(p.goal||"egg")+"까지 가게 옆 칸을 눌러 줘"); };

G.inout=function(p){ el("ellipse",{cx:500,cy:230,rx:300,ry:190,"class":"blob"}); txt("안",500,90,40,null,"#b3a69c"); txt("밖",60,60,40,null,"#b3a69c");
  var tasks=shuffle([["ball","안"],["star","밖"],["heart","안"],["apple","밖"]]).slice(0,T([2,3,3,3])), ti=0;
  function ask(){ var t=tasks[ti]; prompt(eul(nm(t[0]))+" 선 "+(t[1]==="안"?"안에 넣어 줘":"밖에 놓아 줘")); }
  tasks.forEach(function(t,i){ var b=g(); setT(b,330+i*130,470); icon(t[0],0,0,110,b); b._k=t[0];
    draggable(b,function(x,y){ var cur=tasks[ti]; if(b._k!==cur[0]){ miss(eul(nm(cur[0]))+" 옮겨 줘"); return false; } var cx=x+55, cy=y+55; var inside=Math.pow((cx-500)/300,2)+Math.pow((cy-230)/190,2)<0.85; var outside=Math.pow((cx-500)/300,2)+Math.pow((cy-230)/190,2)>1.15&&cy<440;
      if((cur[1]==="안"&&inside)||(cur[1]==="밖"&&outside)){ b._done=true; good(); ti++; if(ti===tasks.length) setTimeout(win,300); else setTimeout(ask,500); return {x:x,y:y}; } miss(cur[1]==="안"?"선 안쪽이야":"선 바깥쪽이야"); return false; }); });
  ask(); };

G.shapefind=function(p){ var kinds=["circle","triangle","square"], t=kinds[S.round%3], items=[]; var cnt=T([6,8,12,12]), pos=scatter(cnt,40,20,920,420,120); var need=0, got=0;
  pos.forEach(function(q,i){ var k= i<Math.ceil(cnt/3)? t : pick(kinds.filter(function(x){return x!==t;})); items.push(k); });
  items=shuffle(items); items.forEach(function(k,i){ var q=pos[i]; if(k===t) need++; var b=g(); setT(b,q.x,q.y); icon(k,0,0,q.s,b); tap(b,function(){ if(b._f) return; if(k===t){ b._f=true; b.classList.add("found"); got++; good(); if(got===need) setTimeout(win,300); } else miss("그건 "+nm(k)+"야"); }); });
  prompt(eul(nm(t))+" 모두 찾아 눌러 줘"); };

var PUZ={ house:[["triangle",300,30,400,200],["square",350,230,300,220]], rocket:[["triangle",420,10,160,120],["rect",420,130,160,230],["triangle",330,260,90,100],["triangle",580,260,90,100]],
  fish:[["circle",250,90,330,260],["triangle",560,120,200,200]], caterpillar:[0,1,2,3,4].map(function(i){ return ["circle",200+i*120,120+(i%2)*60,140,140]; }), flower:[["circle",430,40,140,140],["circle",320,130,140,140],["circle",540,130,140,140],["circle",430,220,140,140],["rect",485,330,30,120]], mix:null };
function shp(k,x,y,w,h,cls,parent){ if(k==="circle") return el("ellipse",{cx:x+w/2,cy:y+h/2,rx:w/2,ry:h/2,"class":cls},parent); if(k==="triangle") return el("polygon",{points:(x+w/2)+","+y+" "+(x+w)+","+(y+h)+" "+x+","+(y+h),"class":cls},parent); return el("rect",{x:x,y:y,width:w,height:h,"class":cls},parent); }
G.puzzle=function(p){ var tg=p.target||"house"; if(tg==="mix"||S.round>0) tg=pick(["house","rocket","fish","flower","caterpillar"]); var parts=PUZ[tg], sc=0.6, ox=500-500*sc, oy=0, done=0;
  var cols=["#ff8a7a","#ffcf5a","#7cc4f5","#8fd6a2","#c3a6ff","#ffa8cf"];
  parts.forEach(function(q){ shp(q[0],ox+q[1]*sc,oy+q[2]*sc,q[3]*sc,q[4]*sc,"ghost"); });
  prompt("모양 조각을 끌어다가 같은 자리에 맞춰 줘");
  var tw=0; parts.forEach(function(q){ tw+=q[3]*sc+24; }); var hx=500-tw/2;
  shuffle(parts.map(function(q,i){return [q,i];})).forEach(function(qi,j){ var q=qi[0], w=q[3]*sc, h=q[4]*sc; var b=g(); setT(b,hx,590-h); hx+=w+24;
    var sh=shp(q[0],0,0,w,h,"piece",b); sh.setAttribute("fill",cols[j%cols.length]);
    draggable(b,function(x,y){ var tx=ox+q[1]*sc, ty=oy+q[2]*sc; if(Math.abs(x-tx)<60&&Math.abs(y-ty)<60){ b._done=true; done++; good(); if(done===parts.length) setTimeout(win,400); return {x:tx,y:ty}; } return false; }); });
};


var SORTS={ roll:[["ball","굴러가요",["ball","melon","egg","cookie","coin","apple"]],["box","안 굴러가요",["box","book","milk","house","toy"]]],
  sea:[["fish","물고기",["fish"]],["shell","조개",["shell"]]], shape:[["circle","동그라미",["circle","ball","cookie","coin"]],["triangle","세모",["triangle"]],["square","네모",["square","box","book"]]],
  tidy:[["toy","장난감",["toy","ball","car"]],["book","책",["book"]],["sock","옷",["sock"]]], fruit:[["apple","과일",["apple","banana","strawberry","grape","cherry"]],["dog","동물",["dog","cat","rabbit","bear","chick","duck"]]],
  tree:[["leaf","나뭇잎",["leaf"]],["flower","꽃",["flower"]],["cherry","열매",["apple","cherry","strawberry"]]], heavy:[["rock","무거워요",["rock","melon","car","milk","house"]],["feather","가벼워요",["feather","balloon","leaf","flower"]]],
  color:[["apple","빨강",["apple","strawberry","cherry","balloon"]],["banana","노랑",["banana","star","sun","chick"]],["leaf","초록",["leaf","tree","melon","bean"]]],
  season:[["sun","여름",["sun","melon","umbrella","fish"]],["snowman","겨울",["snowman","sock"]]] };
G.sort=function(p){ var set=SORTS[p.set||"roll"], n=set.length, w=(940-(n-1)*20)/n, bins=[]; var items=[];
  set.forEach(function(c,i){ var x=30+i*(w+20); el("path",{d:"M"+(x+10)+" 120 L"+(x+w-10)+" 120 L"+(x+w-40)+" 380 L"+(x+40)+" 380 Z","class":"basket"}); icon(c[0],x+w/2-110,20,80); txt(c[1],x+w/2-20,80,40,null,"#3b2f2a","start"); bins.push([x,w]);
    c[2].forEach(function(k){ items.push([k,i]); }); });
  items=shuffle(items).slice(0,T([3,4,6,6])); var left=items.length; prompt("같은 것끼리 바구니에 넣어 줘");
  items.forEach(function(it,j){ var b=g(); var hx=500-items.length*75+j*150+20, hy=460; setT(b,hx,hy); icon(it[0],0,0,110,b);
    draggable(b,function(x,y){ var cx=x+55; var t=-1; bins.forEach(function(bn,i){ if(cx>bn[0]&&cx<bn[0]+bn[1]&&y<390&&y>60) t=i; }); if(t<0) return false; if(t===it[1]){ b._done=true; good(); left--; if(!left) setTimeout(win,300); return {x:x,y:Math.min(y,260)}; } miss(iga(nm(it[0]))+" 어디에 들어갈까?"); return false; }); }); };

G.position=function(p){ el("rect",{x:250,y:250,width:500,height:26,rx:8,"class":"table"}); el("rect",{x:280,y:276,width:20,height:170,"class":"table"}); el("rect",{x:700,y:276,width:20,height:170,"class":"table"}); el("line",{x1:20,y1:446,x2:980,y2:446,stroke:"#c9bdb3","stroke-width":6});
  icon("basket",420,100,160);
  var Z={ "책상 위에":function(x,y){ return y<250&&y>60&&(x<400||x>580)&&x>230&&x<760; }, "책상 아래에":function(x,y){ return y>290&&y<450&&x>300&&x<700; }, "책상 옆에":function(x,y){ return (x<240||x>770)&&y>150; }, "바구니 안에":function(x,y){ return x>400&&x<590&&y>100&&y<270; } };
  var tasks=shuffle([["bear","책상 위에"],["ball","책상 아래에"],["cat","책상 옆에"],["star","바구니 안에"]]).slice(0,T([1,2,3,3])), ti=0;
  function ask(){ var t=tasks[ti]; prompt(eul(nm(t[0]))+" "+t[1]+" 놓아 줘"); }
  tasks.forEach(function(t,i){ var b=g(); setT(b,40+i*130,480); icon(t[0],0,0,100,b); b._k=t[0];
    draggable(b,function(x,y){ var cur=tasks[ti]; if(b._k!==cur[0]){ miss(eul(nm(cur[0]))+" 옮겨 줘"); return false; } var cx=x+50, cy=y+50; if(Z[cur[1]](cx,cy)){ b._done=true; good(); ti++; if(ti===tasks.length) setTimeout(win,300); else setTimeout(ask,500); return {x:x,y:y}; } miss(cur[1]+" 놓아야 해"); return false; }); });
  ask(); };

G.leftright=function(p){ var dir=S.round%2===0?"왼쪽":"오른쪽"; var arr=[], AN=T([4,6,8,8]); for(var i=0;i<AN;i++) arr.push(i<Math.ceil(AN/3)?dir:(Math.random()<0.4?dir:(dir==="왼쪽"?"오른쪽":"왼쪽"))); arr=shuffle(arr); var need=arr.filter(function(a){return a===dir;}).length, got=0;
  prompt(dir+"을 가리키는 화살표를 모두 눌러 줘");
  arr.forEach(function(a,i){ var b=g(); setT(b,80+(i%4)*220,60+Math.floor(i/4)*200); var d=a==="왼쪽"?"M160 30 L80 30 L80 0 L0 65 L80 130 L80 100 L160 100 Z":"M0 30 L80 30 L80 0 L160 65 L80 130 L80 100 L0 100 Z"; el("path",{d:d,"class":"arrow"},b);
    tap(b,function(){ if(b._f) return; if(a===dir){ b._f=true; b.classList.add("found"); got++; good(); if(got===need) setTimeout(win,300); } else miss("그건 반대쪽이야"); }); });
  txt("왼손을 들어 봐! 왼손 쪽이 왼쪽이야",500,520,36,null,"#7a6b62"); };

G.size=function(p){ var k=pick([p.icon||"dino","bear","apple","star","house"]), sizes=T([[80,190],[80,135,190],[70,110,150,190],[70,110,150,190]]), M=sizes.length, asc=S.round%2===0, next=0, order=shuffle(sizes.map(function(_,i){return i;})), nodes=[]; setHint(function(){ nodes.forEach(function(x){ if(x._si===(asc?next:M-1-next)) hintNode(x); }); });
  prompt(asc? "작은 것부터 차례로 눌러 줘" : "큰 것부터 차례로 눌러 줘");
  order.forEach(function(si,j){ var s=sizes[si]; var b=g(); setT(b,500-M*115+20+j*230+(190-s)/2,260-s); icon(k,0,0,s,b); b._si=si; nodes.push(b);
    tap(b,function(){ if(b._f) return; var want= asc? next : M-1-next; if(si===want){ b._f=true; b.classList.add("found"); next++; good(); if(next===M) setTimeout(win,300); } else miss(asc?"더 작은 게 있어":"더 큰 게 있어"); }); });
  el("line",{x1:40,y1:262,x2:960,y2:262,stroke:"#c9bdb3","stroke-width":6}); };

G.measure=function(p){ var n=T([[2,3],[2,5],[3,8],[4,10]]); n=rnd(n[0],n[1]); var u=90, x0=500-n*u/2, kind=pick(["연필","리본","기차"]), col=pick(["#ffd84d","#ff8fab","#7cc4f5"]);
  if(kind==="연필"){ el("rect",{x:x0,y:120,width:n*u-60,height:70,fill:col,stroke:"#3b2f2a","stroke-width":5}); el("polygon",{points:(x0+n*u-60)+",120 "+(x0+n*u)+",155 "+(x0+n*u-60)+",190",fill:"#f4d7b0",stroke:"#3b2f2a","stroke-width":5}); }
  else if(kind==="리본"){ el("rect",{x:x0,y:130,width:n*u,height:50,rx:25,fill:col,stroke:"#3b2f2a","stroke-width":5}); }
  else { for(var c=0;c<n;c++){ el("rect",{x:x0+c*u+4,y:110,width:u-8,height:70,rx:12,fill:col,stroke:"#3b2f2a","stroke-width":5}); el("circle",{cx:x0+c*u+25,cy:190,r:12,fill:"#7a6b62"}); el("circle",{cx:x0+c*u+u-25,cy:190,r:12,fill:"#7a6b62"}); } }
  el("line",{x1:x0,y1:100,x2:x0,y2:350,stroke:"#b9a3e8","stroke-width":4,"stroke-dasharray":"10 8"}); el("line",{x1:x0+n*u,y1:100,x2:x0+n*u,y2:350,stroke:"#b9a3e8","stroke-width":4,"stroke-dasharray":"10 8"});
  for(var i=0;i<n;i++) icon("bean",x0+i*u+5,250,u-10);
  prompt(kind+" 길이는 콩 몇 개야?"); choices(numChoices(n,1,10),n); };
G.length=function(p){ var a,b; do{ a=rnd(3,9); b=rnd(3,9);}while(a===b); var lg=S.round%2===0; var c=rnd(3,9); while(c===a||c===b) c=rnd(3,9); var L=[a,b,c], cols=["#ff8a7a","#7cc4f5","#8fd6a2"], ks=["dino","rabbit","cat"];
  var best = lg? Math.max.apply(null,L) : Math.min.apply(null,L); prompt(lg?"가장 긴 줄을 눌러 줘":"가장 짧은 줄을 눌러 줘");
  L.forEach(function(v,i){ var b=g(); setT(b,40,40+i*140); icon(ks[i],0,0,100,b); el("rect",{x:120,y:30,width:v*90,height:40,rx:20,fill:cols[i],stroke:"#3b2f2a","stroke-width":4},b); el("rect",{x:110,y:0,width:860,height:100,fill:"transparent"},b); if(v===best) setHint(function(){ hintNode(b); });
    tap(b,function(){ if(v===best){ b.classList.add("pop"); win(); } else miss(lg?"더 긴 줄이 있어":"더 짧은 줄이 있어"); }); }); };

G.area=function(p){ var A=[rnd(2,4),rnd(2,3)], B; do{ B=[rnd(2,5),rnd(2,4)]; }while(B[0]*B[1]===A[0]*A[1]); var wide=S.round%2===0, cs=60;
  prompt(wide?"더 넓은 것을 눌러 줘":"더 좁은 것을 눌러 줘");
  [[A,80,"#ffcf5a"],[B,540,"#7cc4f5"]].forEach(function(d,i){ var b=g(); setT(b,d[1],60); el("rect",{x:-20,y:-20,width:420,height:360,fill:"transparent"},b);
    for(var x=0;x<d[0][0];x++) for(var y=0;y<d[0][1];y++) el("rect",{x:x*cs,y:y*cs,width:cs,height:cs,fill:d[2],stroke:"#3b2f2a","stroke-width":3},b);
    tap(b,function(){ var me=d[0][0]*d[0][1], ot=(i===0?B:A); ot=ot[0]*ot[1]; if(wide?me>ot:me<ot){ b.classList.add("pop"); win(); } else miss("칸을 세어 볼까?"); }); }); };

G.heavy=function(p){ var pairs=[["rock","feather"],["melon","balloon"],["car","leaf"],["milk","feather"],["house","flower"]]; var pr=pick(pairs), hv=S.round%2===0;
  prompt(hv?"더 무거운 것을 눌러 줘":"더 가벼운 것을 눌러 줘");
  shuffle([[pr[0],1],[pr[1],0]]).forEach(function(it,i){ var b=g(); setT(b,150+i*450,100); panel(-20,-20,280,280,b); icon(it[0],0,0,240,b); if((it[1]===1)===hv) setHint(function(){ hintNode(b); }); tap(b,function(){ if((it[1]===1)===hv){ b.classList.add("pop"); win(); } else miss(); }); }); };

function clockFace(h,x,y,r,parent){ var b=g(parent); setT(b,x,y); el("circle",{cx:0,cy:0,r:r,"class":"clock"},b); for(var k=1;k<=12;k++){ var a=k*Math.PI/6; txt(k,(r-24)*Math.sin(a),-(r-24)*Math.cos(a)+10,26,b); }
  el("line",{x1:0,y1:0,x2:0,y2:-(r-40),"class":"hand long"},b); var a=h*Math.PI/6; el("line",{x1:0,y1:0,x2:(r-62)*Math.sin(a),y2:-(r-62)*Math.cos(a),"class":"hand"},b); el("circle",{cx:0,cy:0,r:8,fill:"#3b2f2a"},b); return b; }
G.clock=function(p){ var hs=shuffle(TIER<=1?[12,3,6,9]:[1,2,3,4,5,6,7,8,9,10,11,12]).slice(0,Math.min(3,NCH[TIER])), t=hs[0]; prompt(t+"시를 가리키는 시계를 눌러 줘");
  shuffle(hs).forEach(function(h,i){ var b=clockFace(h,500-hs.length*155+155+i*310,230,140); if(h===t) setHint(function(){ hintNode(b); }); tap(b,function(){ if(h===t){ b.classList.add("pop"); win(); } else miss("짧은 바늘이 "+eul(String(t))+" 가리켜야 해"); }); });
  txt("짧은 바늘이 가리키는 숫자를 봐",500,520,34,null,"#7a6b62"); };

G.graph=function(p){ var it=p.items||["apple","strawberry","banana","grape"]; var vals; do{ vals=it.map(function(){ return rnd(1,T([3,4,5,5])); }); }while(vals.filter(function(v){return v===Math.max.apply(null,vals);}).length>1||vals.filter(function(v){return v===Math.min.apply(null,vals);}).length>1);
  var most=S.round%2===0; prompt(most?"가장 많은 것을 눌러 줘":"가장 적은 것을 눌러 줘"); var w=180, x0=500-it.length*w/2;
  it.forEach(function(k,i){ var b=g(); setT(b,x0+i*w,0); for(var j=0;j<vals[i];j++) el("rect",{x:40,y:330-(j+1)*58,width:100,height:54,rx:10,"class":"blk"},b); icon(k,40,345,100,b); el("rect",{x:20,y:20,width:140,height:430,fill:"transparent"},b);
    tap(b,function(){ var t=most?Math.max.apply(null,vals):Math.min.apply(null,vals); if(vals[i]===t){ b.classList.add("pop"); win(); } else miss("칸을 세어 볼까?"); }); }); };

G.pairs=function(p){ var NP=T([2,3,3,3]), pats=shuffle(["stripe","dot","star","heart"]).slice(0,NP), cards=shuffle(pats.concat(pats)), sel=null, got=0;
  prompt("무늬가 똑같은 양말 두 짝을 찾아 눌러 줘");
  cards.forEach(function(pt_,i){ var b=g(); setT(b,500-cards.length*75+10+i*150,120); el("rect",{x:-6,y:-6,width:142,height:202,rx:20,"class":"card"},b); icon("sock",-5,10,140,b);
    if(pt_==="stripe"){ for(var k=0;k<3;k++) el("line",{x1:50,y1:60+k*16,x2:85,y2:60+k*16,stroke:"#3b2f2a","stroke-width":6},b); }
    if(pt_==="dot"){ [[55,55],[78,72],[55,90],[80,100]].forEach(function(q){ el("circle",{cx:q[0],cy:q[1],r:6,fill:"#3b2f2a"},b); }); }
    if(pt_==="star"||pt_==="heart") icon(pt_,46,52,46,b);
    tap(b,function(){ if(b._f||b===sel) return; b.classList.add("sel"); if(!sel){ sel=b; sel._p=pt_; return; } if(sel._p===pt_){ sel._f=b._f=true; sel.classList.add("found"); b.classList.add("found"); sel=null; got++; good(); if(got===NP) setTimeout(win,300); } else { var s=sel; sel=null; miss("무늬를 잘 봐!"); setTimeout(function(){ s.classList.remove("sel"); b.classList.remove("sel"); },500); } }); }); };

/* ---------- 그리기 판 (따라 쓰기, 자유 그림) ---------- */
var pad={ ctx:cv.getContext("2d"), color:"#5b3fa8", drawing:false, mask:null, mode:"draw" };
function sizePad(){ var r=cv.getBoundingClientRect(); var dpr=window.devicePixelRatio||1; cv.width=Math.round(r.width*dpr); cv.height=Math.round(r.height*dpr); pad.ctx.setTransform(dpr,0,0,dpr,0,0); pad.w=r.width; pad.h=r.height; }
function padBG(){ var c=pad.ctx; c.clearRect(0,0,pad.w,pad.h); if(pad.mode==="trace"){ c.save(); c.fillStyle="#ece6f7"; c.font="bold "+Math.round(pad.h*0.78)+"px Jua, sans-serif"; c.textAlign="center"; c.textBaseline="middle"; c.fillText(pad.num,pad.w/2,pad.h*0.54); c.restore(); } }
function buildMask(){ var m=document.createElement("canvas"); m.width=Math.round(pad.w/4); m.height=Math.round(pad.h/4); var c=m.getContext("2d"); c.fillStyle="#000"; c.font="bold "+Math.round(pad.h*0.78/4)+"px Jua, sans-serif"; c.textAlign="center"; c.textBaseline="middle"; c.fillText(pad.num,m.width/2,m.height*0.54); pad.mask=c.getImageData(0,0,m.width,m.height); pad.mw=m.width; pad.mh=m.height; pad.hit={}; pad.tot=0; for(var i=3;i<pad.mask.data.length;i+=4) if(pad.mask.data[i]>100) pad.tot++; }
function coverAt(x,y){ if(!pad.mask) return; var mx=Math.round(x/4), my=Math.round(y/4), R=4; for(var dx=-R;dx<=R;dx++) for(var dy=-R;dy<=R;dy++){ var X=mx+dx,Y=my+dy; if(X<0||Y<0||X>=pad.mw||Y>=pad.mh) continue; var i=(Y*pad.mw+X)*4+3; if(pad.mask.data[i]>100) pad.hit[X+","+Y]=1; } }
cv.addEventListener("pointerdown",function(e){ if(S.lock) return; e.preventDefault(); try{cv.setPointerCapture(e.pointerId);}catch(_){} pad.drawing=true; var r=cv.getBoundingClientRect(); pad.lx=e.clientX-r.left; pad.ly=e.clientY-r.top; pad.used=true; dot(pad.lx,pad.ly); });
cv.addEventListener("pointermove",function(e){ if(!pad.drawing) return; var r=cv.getBoundingClientRect(), x=e.clientX-r.left, y=e.clientY-r.top; var c=pad.ctx; c.strokeStyle=pad.color; c.lineWidth=pad.mode==="trace"?Math.max(18,pad.h*0.05):14; c.lineCap="round"; c.lineJoin="round"; c.beginPath(); c.moveTo(pad.lx,pad.ly); c.lineTo(x,y); c.stroke();
  if(pad.mode==="trace"){ var steps=Math.ceil(Math.hypot(x-pad.lx,y-pad.ly)/6); for(var s=0;s<=steps;s++) coverAt(pad.lx+(x-pad.lx)*s/steps, pad.ly+(y-pad.ly)*s/steps); } pad.lx=x; pad.ly=y; });
function dot(x,y){ var c=pad.ctx; c.fillStyle=pad.color; c.beginPath(); c.arc(x,y,(pad.mode==="trace"?Math.max(18,pad.h*0.05):14)/2,0,Math.PI*2); c.fill(); if(pad.mode==="trace") coverAt(x,y); }
function padUp(){ if(!pad.drawing) return; pad.drawing=false; if(pad.mode==="trace"){ var cov=Object.keys(pad.hit).length/Math.max(1,pad.tot); if(cov>T([0.35,0.45,0.5,0.6])) setTimeout(win,250); } }
cv.addEventListener("pointerup",padUp); cv.addEventListener("pointercancel",padUp);
function openPad(mode, extra){ svg.classList.add("hide"); cv.classList.remove("hide"); $("padtools").classList.remove("hide"); pad.mode=mode; pad.used=false; Object.assign(pad,extra||{}); sizePad(); if(mode==="trace") buildMask(); else pad.mask=null; padBG();
  $("padDone").textContent = mode==="trace" ? "다 썼어요" : "다 그렸어요"; }
G.trace=function(p){ var nums=p.nums||[1,2,3]; var n=String(nums[S.round%nums.length]); openPad("trace",{num:n}); prompt(eul(n)+" 손가락으로 따라 써 줘"); };
G.draw=function(p){ openPad("draw"); prompt(p.prompt||"마음대로 그려 볼까?"); };
$("padDone").addEventListener("click",function(){ if(S.lock) return; if(pad.mode==="trace"){ var cov=Object.keys(pad.hit).length/Math.max(1,pad.tot); if(cov>T([0.35,0.45,0.5,0.6])) win(); else miss("숫자 위를 조금 더 따라 써 볼까?"); } else { if(pad.used) win(); else miss("먼저 그림을 그려 줘"); } });
$("padClear").addEventListener("click",function(){ pad.hit={}; padBG(); });
Array.prototype.forEach.call(document.querySelectorAll(".sw"),function(b){ b.addEventListener("click",function(){ pad.color=b.dataset.c; Array.prototype.forEach.call(document.querySelectorAll(".sw"),function(x){ x.classList.toggle("on",x===b); }); }); });
window.addEventListener("resize",function(){ if(!cv.classList.contains("hide")){ sizePad(); if(pad.mode==="trace") buildMask(); padBG(); } });

