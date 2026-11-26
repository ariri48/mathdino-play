/* ---------- 내 방: 스티커·배지·알 키우기·놀이 시간·부모 메뉴·생활 놀이 ----------
   허브와 놀이 화면이 함께 써요. 기록·녹음·색칠 그림은 이 기기(localStorage·IndexedDB)에만 저장해요.
   페이지가 ROOM.fx 에 say, avatarSVG, curAv, S 를 넣어 주면 그걸 써요. */
(function(){
"use strict";
var R=window.ROOM=window.ROOM||{}; R.fx=R.fx||{};
var PKEY="mathdino-play-v2";
function $(id){ return document.getElementById(id); }
function mk(tag,cls,html){ var e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }
function esc(t){ return String(t==null?"":t).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function p2(n){ return (n<10?"0":"")+n; }
function day(d){ d=d||new Date(); return d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate()); }
function rd(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(e){ return null; } }
function wr(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); return true; }catch(e){ return false; } }
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
function each(sel,fn,root){ Array.prototype.forEach.call((root||document).querySelectorAll(sel),fn); }
function jong(w){ w=String(w); var c=w.charCodeAt(w.length-1); if(c>=0xAC00&&c<=0xD7A3) return (c-0xAC00)%28!==0; return /[013678]$/.test(w); }
function voc(n){ return n+(jong(n)?"아":"야"); }
function iga(n){ return n+(jong(n)?"이가":"가"); }
function kid(){ var o=rd(PKEY)||{}; return (o.kids||[]).filter(function(k){ return k.id===o.cur; })[0]||null; }
R.kid=kid; R.day=day; R.voc=voc;
function st(){ var k=kid(); var o=(k&&rd("goyu-room-"+k.id))||{}; ["stk","bad","days","stat","sec","cnt","extra","tstk"].forEach(function(x){ o[x]=o[x]||{}; }); o.egg=o.egg||0; o.notes=o.notes||[]; return o; }
function sv(o){ var k=kid(); if(k) wr("goyu-room-"+k.id,o); }
R.st=st; R.sv=sv;
function SET(){ var s=rd("goyu-parent")||{}; if(s.limit===undefined) s.limit=20; return s; }
function say(s){ if(R.fx.say) R.fx.say(s); }
function stopTalk(){ try{ if(R.fx.clipStop) R.fx.clipStop(); speechSynthesis.cancel(); }catch(e){} }
function view(){ return document.body.dataset.view||"hub"; }
function art(k){ return "art/"+k+".webp"; }

/* ---------- 저장소(IndexedDB): 부모 녹음, 색칠 그림 ---------- */
var DBP=null;
function db(){ if(!DBP) DBP=new Promise(function(res,rej){ try{ var q=indexedDB.open("goyu",1); q.onupgradeneeded=function(){ q.result.createObjectStore("kv"); }; q.onsuccess=function(){ res(q.result); }; q.onerror=function(){ rej(q.error); }; }catch(e){ rej(e); } }); return DBP; }
function idb(mode,fn){ return db().then(function(d){ return new Promise(function(res){ var t=d.transaction("kv",mode), s=t.objectStore("kv"), r=fn(s); t.oncomplete=function(){ res(r&&r.result); }; t.onerror=t.onabort=function(){ res(null); }; }); }).catch(function(){ return null; }); }
function iget(k){ return idb("readonly",function(s){ return s.get(k); }); }
function iset(k,v){ return idb("readwrite",function(s){ return s.put(v,k); }); }
function idel(k){ return idb("readwrite",function(s){ return s.delete(k); }); }
function ikeys(){ return idb("readonly",function(s){ return s.getAllKeys(); }).then(function(a){ return a||[]; }); }
R.iget=iget;

/* ---------- 소리 ---------- */
var AC=null;
function ac(){ try{ if(!AC) AC=new (window.AudioContext||window.webkitAudioContext)(); if(AC.state==="suspended") AC.resume(); }catch(e){} return AC; }
function muted(){ return !!(R.fx.S&&R.fx.S.muted); }
function tone(type,f,t,d,vol,f1){ var a=ac(); if(!a||muted()) return; var o=a.createOscillator(), g=a.createGain(); o.type=type; o.frequency.setValueAtTime(f,t); if(f1) o.frequency.exponentialRampToValueAtTime(f1,t+d);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol||0.2,t+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t+d); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t+d+0.05); }
var SND={
  ding:function(){ var a=ac(); if(!a) return; var t=a.currentTime; tone("sine",880,t,0.18,0.25); tone("sine",1320,t+0.09,0.25,0.22); },
  fan:function(){ var a=ac(); if(!a) return; var t=a.currentTime; [523,659,784,1047,784,1047].forEach(function(f,i){ tone("triangle",f,t+i*0.11,i>3?0.45:0.2,0.2); }); },
  boing:function(){ var a=ac(); if(!a) return; var t=a.currentTime; tone("sine",180,t,0.5,0.4,620); tone("sine",620,t+0.15,0.5,0.3,120); },
  pop:function(){ var a=ac(); if(!a) return; var t=a.currentTime; tone("sine",500,t,0.12,0.25,1200); },
  giggle:function(){ var a=ac(); if(!a) return; var t=a.currentTime; for(var i=0;i<5;i++) tone("sine",900-i*60,t+i*0.09,0.08,0.12,1300-i*80); },
  fart:function(){ var a=ac(); if(!a||muted()) return; var t=a.currentTime, len=Math.floor(a.sampleRate*0.9), b=a.createBuffer(1,len,a.sampleRate), d=b.getChannelData(0);
    for(var i=0;i<len;i++) d[i]=(Math.random()*2-1);
    var s=a.createBufferSource(); s.buffer=b; var f=a.createBiquadFilter(); f.type="lowpass"; f.frequency.setValueAtTime(260,t); f.frequency.linearRampToValueAtTime(120,t+0.85); f.Q.value=8;
    var o=a.createOscillator(); o.type="sawtooth"; o.frequency.setValueAtTime(95,t); o.frequency.linearRampToValueAtTime(60,t+0.8); var l=a.createOscillator(), lg=a.createGain(); l.frequency.value=22; lg.gain.value=18; l.connect(lg); lg.connect(o.frequency);
    var g=a.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.7,t+0.04); g.gain.setValueAtTime(0.6,t+0.6); g.gain.exponentialRampToValueAtTime(0.0001,t+0.88);
    var og=a.createGain(); og.gain.value=0.35; s.connect(f); o.connect(og); og.connect(f); f.connect(g); g.connect(a.destination); s.start(t); o.start(t); l.start(t); s.stop(t+0.9); o.stop(t+0.9); l.stop(t+0.9); },
  /* 짧은 신나는 노래 (춤 파티·타이머) */
  tune:function(beats){ var a=ac(); if(!a) return; var t=a.currentTime+0.05, mel=[523,659,784,659,587,698,880,698,523,659,784,1047,988,784,659,523];
    for(var i=0;i<(beats||16);i++){ var f=mel[i%mel.length]; tone("triangle",f,t+i*0.25,0.2,0.13); if(i%2===0) tone("sine",f/4,t+i*0.25,0.22,0.16); } }
};
R.snd=SND;

/* ---------- 겹쳐 뜨는 창 ---------- */
var ZI=80;
function ov(cls, html, locked){ var bg=mk("div","rov "+cls), box=mk("div","rbox",html); bg.style.zIndex=++ZI; bg.appendChild(box);
  if(!locked){ var x=mk("button","rx","닫기"); x.type="button"; x.setAttribute("aria-label","닫기"); box.insertBefore(x,box.firstChild); x.addEventListener("click",function(){ close(); }); }
  document.body.appendChild(bg); requestAnimationFrame(function(){ bg.classList.add("on"); });
  function close(){ bg.classList.remove("on"); if(o.onclose) o.onclose(); setTimeout(function(){ bg.remove(); },200); }
  var o={el:bg, box:box, close:close}; return o; }
R.ov=ov;
function toast(html, ms){ var t=mk("div","rtoast",html); t.style.zIndex=++ZI+200; document.body.appendChild(t); requestAnimationFrame(function(){ t.classList.add("on"); });
  setTimeout(function(){ t.classList.remove("on"); setTimeout(function(){ t.remove(); },300); }, ms||2600); }
R.toast=toast;
function avHTML(pose){ try{ return R.fx.avatarSVG(R.fx.curAv(), "pose-"+(pose||"idle")); }catch(e){ return '<img src="'+art("dino")+'" alt="">'; } }

/* ---------- 스티커·배지·알 ---------- */
var STK=window.__STK||[];
var EGG=[[0,"egg","공룡알"],[3,"egg_crack","꿈틀꿈틀 알"],[8,"dino_hatch","아기 공룡"],[20,"dino_kid","꼬마 공룡"],[45,"dino_big","대장 공룡"]];
function eggStage(p){ var i=0; EGG.forEach(function(e,j){ if(p>=e[0]) i=j; }); return i; }
function eggImg(i){ var k=EGG[i][1]; if((k==="dino_kid"||k==="dino_big")&&COL.dino) return COL.dino; return art(k); }
R.eggInfo=function(){ var o=st(), i=eggStage(o.egg), nx=EGG[i+1]; return {i:i, img:eggImg(i), name:EGG[i][2], p:o.egg, from:EGG[i][0], next:nx?nx[0]:null, nextName:nx?nx[2]:null}; };
function tot(o){ var n=0; Object.keys(o.days).forEach(function(d){ n+=o.days[d]||0; }); return n; }
function nstk(o){ return Object.keys(o.stk).length; }
function streakDays(o){ var n=0, d=new Date(); if(o.days[day(d)]===undefined) d.setDate(d.getDate()-1); while(o.days[day(d)]!==undefined){ n++; d.setDate(d.getDate()-1); } return n; }
R.streakDays=function(){ return streakDays(st()); };
var BADGES=[
  ["first","첫 성공","놀이를 처음 성공했어요","star",function(o){ return tot(o)>=1; }],
  ["ten","놀이 10개","놀이를 10개 성공했어요","apple",function(o){ return tot(o)>=10; }],
  ["fifty","놀이 50개","놀이를 50개 성공했어요","trophy",function(o){ return tot(o)>=50; }],
  ["d3","사흘 연속","3일 연속으로 놀았어요","sun",function(o){ return streakDays(o)>=3; }],
  ["d7","일주일 연속","7일 연속으로 놀았어요","moon",function(o){ return streakDays(o)>=7; }],
  ["book","책 완주","책 한 권의 놀이 5개를 다 했어요","book",function(o){ return (o.cnt.book||0)>=1; }],
  ["s10","스티커 10장","스티커를 10장 모았어요","heart",function(o){ return nstk(o)>=10; }],
  ["s30","스티커 30장","스티커를 30장 모았어요","flower",function(o){ return nstk(o)>=30; }],
  ["sall","스티커 박사","스티커를 다 모았어요","trophy",function(o){ return STK.length&&nstk(o)>=STK.length; }],
  ["st6","척척박사","여섯 문제를 연속으로 맞혔어요","star",function(o){ return (o.cnt.st6||0)>=1; }],
  ["teach","꼬마 선생님","엄마 아빠에게 문제를 냈어요","pencil",function(o){ return (o.cnt.teach||0)>=1; }],
  ["artist","꼬마 화가","색칠한 그림을 놀이에 넣었어요","flower",function(o){ return (o.cnt.color||0)>=1; }],
  ["brush","양치 챔피언","양치 타이머를 5번 했어요","toothbrush",function(o){ return (o.cnt.brush||0)>=5; }],
  ["tidy","정리 대장","정리 타이머를 3번 했어요","toybox",function(o){ return (o.cnt.tidy||0)>=3; }],
  ["mis","미션 대장","생활 미션을 10번 했어요","house",function(o){ return (o.cnt.mis||0)>=10; }],
  ["hatch","알이 깼어요","공룡알이 깨어났어요","dino_hatch",function(o){ return o.egg>=8; }]
];
R.BADGES=BADGES;
function newBadges(o){ var out=[]; BADGES.forEach(function(b){ if(!o.bad[b[0]]&&b[4](o)){ o.bad[b[0]]=day(); out.push(b); } }); return out; }
function award(o){ var not=STK.filter(function(k){ return !o.stk[k]; }), k=pick(not.length?not:STK); if(!k) return null; o.stk[k]=(o.stk[k]||0)+1; var d=day(); (o.tstk[d]=o.tstk[d]||[]).push(k);
  Object.keys(o.tstk).forEach(function(x){ if(x<day(new Date(Date.now()-14*864e5))) delete o.tstk[x]; }); return k; }
function grow(o,n){ var a=eggStage(o.egg); o.egg+=n; var b=eggStage(o.egg); return b>a?b:-1; }
/* 상 주기: 스티커 + 알 + 배지를 한꺼번에 */
function reward(o, eggPts){ var r={sticker:award(o), egg:grow(o,eggPts||1)}; r.badges=newBadges(o); sv(o); return r; }
R.reward=function(eggPts, cntKey){ var o=st(); if(cntKey) o.cnt[cntKey]=(o.cnt[cntKey]||0)+1; return reward(o,eggPts); };
function celebrate(r, delay){ var t=delay||0;
  if(r.egg>=0){ setTimeout(function(){ eggUp(r.egg); },t); t+=4200; }
  r.badges.forEach(function(b){ setTimeout(function(){ badgeShow(b); },t); t+=2900; }); return t; }
R.celebrate=celebrate;
function stkCard(k){ return '<div class="rstk"><img src="'+art(k)+'" alt=""><b>스티커 받았다!</b></div>'; }
function eggUp(i){ var e=EGG[i], k=kid(); SND.fan(); var o=ov("eggup",'<div class="rburst"></div><img class="rbig rwig" src="'+eggImg(i)+'" alt=""><h2>'+(i===1?"알이 꿈틀꿈틀!":i===2?"알이 깨어났어!":i===3?"공룡이 쑥쑥 자랐어!":"대장 공룡이 됐어!")+'</h2><p>'+esc(e[2])+'</p>');
  say(i===1?"어? 알이 꿈틀꿈틀 움직여!":i===2?"우와! 알에서 아기 공룡이 나왔어!":i===3?"공룡이 쑥쑥 자랐어! 다 "+(k?voc(k.name):"")+" 덕분이야!":"우와! 대장 공룡이 됐어! 정말 대단해!");
  setTimeout(o.close,3800); }
function badgeShow(b){ SND.ding(); toast('<span class="rbadge"><img src="'+art(b[3])+'" alt=""></span><span><b>'+esc(b[1])+' 배지!</b><small>'+esc(b[2])+'</small></span>',2700); say(b[1]+" 배지를 받았어!"); }

/* ---------- 놀이 화면에서 부르는 곳 ---------- */
R.onWin=function(g){ var o=st(); var s=o.stat[g||"?"]||(o.stat[g||"?"]=[0,0]); s[0]++; sv(o); return R.parentClip("praise",0.25); };
R.onMiss=function(g){ var o=st(); var s=o.stat[g||"?"]||(o.stat[g||"?"]=[0,0]); s[1]++; sv(o); return false; };
R.onStreak=function(n){ if(n===6){ var o=st(); o.cnt.st6=(o.cnt.st6||0)+1; sv(o); } };
R.onLevelDone=function(info){ var o=st(), d=day(); o.days[d]=(o.days[d]||0)+1; if(info&&info.all5) o.cnt.book=(o.cnt.book||0)+1; return reward(o, info&&info.all5?3:1); };
R.showReward=function(r, box){ if(!box) return 0; var e=R.eggInfo(), pct=e.next?Math.round((e.p-e.from)/(e.next-e.from)*100):100;
  box.innerHTML=(r.sticker?stkCard(r.sticker):"")+'<div class="regg"><img src="'+e.img+'" alt=""><span><b>'+esc(e.name)+'</b><i class="rbar"><i style="width:'+pct+'%"></i></i><small>'+(e.next?"조금만 더 하면 "+esc(e.nextName)+"!":"최고 단계!")+'</small></span></div>';
  return celebrate(r, 1800); };

/* ---------- 들른 날·쪽지·인사 ---------- */
R.markVisit=function(){ var o=st(); if(!kid()) return; var d=day(); if(o.days[d]===undefined){ o.days[d]=0; } var nb=newBadges(o); sv(o); R.timeStart(); R.loadPV(); R.applyColors();
  var delay=0; if(o.notes.length){ var n=o.notes.shift(); sv(o); delay=1800; setTimeout(function(){ noteShow(n); },1600); }
  nb.forEach(function(b,i){ setTimeout(function(){ badgeShow(b); },delay+2200+i*2900); });
  setTimeout(function(){ R.parentClip("hello",0.5); },delay?6500:2600); };
function noteShow(n){ var k=kid(); SND.ding(); var o=ov("note",'<div class="rnote"><b>'+esc(n.from)+'의 쪽지</b><p>'+esc(n.text)+'</p></div><button class="rpill" type="button">고마워요!</button>');
  o.box.querySelector(".rpill").onclick=o.close; say((k?voc(k.name)+", ":"")+n.from+"가 쪽지를 보냈어! "+n.text); }

/* ---------- 놀이 시간 ---------- */
var TM={t:null, warned:false};
function used(o){ return o.sec[day()]||0; }
function limit(o){ var L=SET().limit; return L? (L+(o.extra[day()]||0))*60 : Infinity; }
R.timeLeft=function(){ var o=st(); return limit(o)-used(o); };
function tick(){ if(document.visibilityState!=="visible"||!kid()||R.sleeping||R.lifeOn) return; var o=st(), d=day(); o.sec[d]=used(o)+5;
  Object.keys(o.sec).forEach(function(x){ if(x<day(new Date(Date.now()-40*864e5))) delete o.sec[x]; }); sv(o); gauge(o);
  var left=limit(o)-o.sec[d], k=kid();
  if(left<=120&&left>0&&!TM.warned){ TM.warned=true; toast('<img class="rti" src="'+art("moon")+'" alt=""><span><b>조금만 더 놀고 쉬자!</b><small>놀이 시간이 2분 남았어요</small></span>',3200); say(voc(k.name)+", 이제 조금만 더 놀고 쉬자!"); }
  if(left<=0){ R.tired=true; if(view()!=="play"||left<=-180) R.sleep(); } }
R.timeStart=function(){ if(TM.t) return; TM.t=setInterval(tick,5000); gauge(st()); };
function gauge(o){ var L=SET().limit; each("[data-tgauge]",function(e){ if(!L||!kid()){ e.hidden=true; return; } e.hidden=false; var lim=limit(o), left=Math.max(0,lim-used(o)); e.style.setProperty("--f",(left/lim).toFixed(3)); var b=e.querySelector("b"); if(b) b.textContent=Math.ceil(left/60)+"분"; e.title="오늘 남은 놀이 시간"; }); }
R.gauge=function(){ gauge(st()); };
/* 놀이 하나 끝날 때 시간 확인. 다 됐으면 졸린 공룡 */
R.checkTired=function(){ if(R.timeLeft()<=0){ R.tired=true; setTimeout(R.sleep,3000); return true; } return false; };
R.sleep=function(){ if(R.sleeping) return; R.sleeping=true; stopTalk(); var k=kid();
  var o=ov("sleep",'<img src="'+art("dino_sleep")+'" class="rbig rsnore" alt=""><h2>오늘 놀이 시간 끝!</h2><p>'+esc(k?voc(k.name)+", ":"")+'공룡이 졸리대. 내일 또 같이 놀자!</p><div class="rrow"><button data-a="brush" class="rpill main" type="button">양치하러 가기</button><button data-a="more" class="rpill ghost" type="button">부모님: 10분 더</button></div>',true);
  if(!R.parentClip("night",1)) say((k?voc(k.name)+", ":"")+"오늘 놀이 시간이 끝났어. 공룡이 졸리대. 내일 또 같이 놀자!");
  o.box.querySelector("[data-a=brush]").onclick=function(){ R.lifeTimer("brush"); };
  o.box.querySelector("[data-a=more]").onclick=function(){ R.gate(function(){ var s=st(); s.extra[day()]=(s.extra[day()]||0)+10; sv(s); R.tired=false; R.sleeping=false; TM.warned=false; o.close(); gauge(s); toast("<span><b>10분 더 놀 수 있어요</b></span>"); }); }; };

/* ---------- 부모님 확인 ---------- */
R.gate=function(ok){ var a=6+Math.floor(Math.random()*4), b=5+Math.floor(Math.random()*5), v="";
  var o=ov("gate",'<h2>부모님 확인</h2><p>아이 혼자 바꾸지 않도록 한 번 물어봐요.<br><b>'+["","","","","","","여섯","일곱","여덟","아홉"][a]+' 더하기 '+["","","","","","다섯","여섯","일곱","여덟","아홉"][b]+'</b>는?</p><div class="rin"></div><div class="rpad">'+
    [1,2,3,4,5,6,7,8,9,"지우기",0,"확인"].map(function(x){ return '<button type="button" data-k="'+x+'">'+x+'</button>'; }).join("")+'</div>');
  var inp=o.box.querySelector(".rin");
  each("[data-k]",function(bt){ bt.onclick=function(){ var k=bt.dataset.k; if(k==="지우기") v=""; else if(k==="확인"){ if(+v===a+b){ o.close(); ok(); return; } v=""; inp.classList.remove("rshake"); void inp.offsetWidth; inp.classList.add("rshake"); } else if(v.length<2) v+=k; inp.textContent=v; }; },o.box); };

/* ---------- 엄마·아빠 목소리 ---------- */
var SLOTS=[["praise1","정답 칭찬 1","예: 우와, 최고야!"],["praise2","정답 칭찬 2","예: 잘했어! 정말 자랑스러워"],["cheer1","응원","예: 괜찮아, 다시 해 보자!"],["hello1","인사","예: 사랑해! 재밌게 놀아"],["night1","잘 자","예: 오늘도 멋졌어. 이제 잘 자!"]];
var PV={};
R.loadPV=function(){ var k=kid(); PV={}; if(!k) return; SLOTS.forEach(function(s){ iget("pv-"+k.id+"-"+s[0]).then(function(v){ if(v&&v.buf) PV[s[0]]=URL.createObjectURL(new Blob([v.buf],{type:v.type})); }); }); };
var PVA=null;
R.parentClip=function(kind, chance){ if(muted()) return false; var ks=Object.keys(PV).filter(function(x){ return x.indexOf(kind)===0; }); if(!ks.length||Math.random()>chance) return false;
  stopTalk(); PVA=PVA||new Audio(); PVA.src=PV[pick(ks)]; try{ var p=PVA.play(); if(p&&p.catch) p.catch(function(){}); }catch(e){} return true; };
R.cheerClip=function(){ return R.parentClip("cheer",0.35); };
function recType(){ var c=["audio/mp4","audio/webm;codecs=opus","audio/webm","audio/ogg"]; if(!window.MediaRecorder) return null; for(var i=0;i<c.length;i++) try{ if(MediaRecorder.isTypeSupported(c[i])) return c[i]; }catch(e){} return ""; }
function recUI(box){ var k=kid(); if(!k){ box.innerHTML='<p class="rnote2">먼저 아이를 등록해 주세요.</p>'; return; }
  var ok=recType()!==null&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia;
  box.innerHTML='<p class="rnote2">'+(ok?"녹음한 목소리는 이 기기에만 저장돼요. 정답을 맞히거나 놀이를 시작할 때 가끔 들려줘요. 한 마디는 6초까지예요.":"이 브라우저는 녹음을 지원하지 않아요. 사파리나 크롬 최신 버전에서 열어 주세요.")+'</p>'+
    SLOTS.map(function(s){ return '<div class="rrec" data-s="'+s[0]+'"><span><b>'+s[1]+'</b><small>'+s[2]+'</small></span><button type="button" class="rmini rec"'+(ok?"":" disabled")+'>녹음</button><button type="button" class="rmini play" disabled>듣기</button><button type="button" class="rmini del" disabled>지우기</button></div>'; }).join("");
  each(".rrec",function(row){ var key="pv-"+k.id+"-"+row.dataset.s, bRec=row.querySelector(".rec"), bPlay=row.querySelector(".play"), bDel=row.querySelector(".del");
    function has(v){ bPlay.disabled=bDel.disabled=!v; row.classList.toggle("have",!!v); }
    iget(key).then(has);
    bPlay.onclick=function(){ iget(key).then(function(v){ if(!v) return; var a=new Audio(URL.createObjectURL(new Blob([v.buf],{type:v.type}))); a.play().catch(function(){}); }); };
    bDel.onclick=function(){ idel(key).then(function(){ has(null); R.loadPV(); }); };
    bRec.onclick=function(){ if(bRec._rec){ bRec._rec.stop(); return; }
      navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){ var t=recType(), mr=t?new MediaRecorder(stream,{mimeType:t}):new MediaRecorder(stream), parts=[];
        mr.ondataavailable=function(e){ if(e.data&&e.data.size) parts.push(e.data); };
        mr.onstop=function(){ stream.getTracks().forEach(function(x){ x.stop(); }); clearTimeout(bRec._t); bRec._rec=null; bRec.textContent="녹음"; row.classList.remove("on");
          var blob=new Blob(parts,{type:mr.mimeType||t||"audio/mp4"}); if(!blob.size) return; blob.arrayBuffer().then(function(buf){ return iset(key,{buf:buf,type:blob.type}); }).then(function(){ has(true); R.loadPV(); }); };
        mr.start(); bRec._rec=mr; bRec.textContent="멈추기"; row.classList.add("on"); bRec._t=setTimeout(function(){ if(mr.state==="recording") mr.stop(); },6000); })
      .catch(function(){ alert("마이크를 쓸 수 없어요. 브라우저 설정에서 마이크를 허용해 주세요."); }); }; },box); }

/* ---------- 아이 기록 (부모용) ---------- */
var AREA={count:"수 세기",tapcount:"수 세기",dots:"수 세기",frame:"수 세기",findnum:"숫자 읽기",bingo:"숫자 읽기",numorder:"숫자 순서",trace:"숫자 쓰기",add:"더하기",makeN:"더하기",subtract:"빼기",share:"똑같이 나누기",shapefind:"도형",puzzle:"도형",area:"넓이",size:"크기 비교",compare:"많고 적음",heavy:"무게",length:"길이",measure:"길이 재기",clock:"시계",calendar:"날짜",routine:"하루 순서",coins:"돈",pattern:"규칙",sort:"분류",graph:"그래프",order:"순서",ordinal:"몇째",position:"위치",leftright:"왼쪽 오른쪽",inout:"안과 밖",pairs:"짝 찾기",maze:"길 찾기",hidden:"숨은 그림",draw:"그리기",llisten:"외국어 듣기",lcards:"외국어 낱말"};
var TIPS={"수 세기":"간식이나 장난감을 꺼낼 때 손가락으로 하나씩 짚으며 같이 세어 보세요. 마지막에 센 수가 '모두'라는 걸 말로 짚어 주면 좋아요.",
  "숫자 읽기":"엘리베이터 버튼, 자동차 번호판, 달력에서 아는 숫자를 찾아 읽어 보세요.","숫자 순서":"계단을 오르내리며 숫자를 세거나, 숫자 카드를 순서대로 늘어놓아 보세요.",
  "숫자 쓰기":"모래나 쌀 위에 손가락으로 숫자를 써 보세요. 연필보다 쉬워요.","더하기":"귤 2개와 1개처럼 실제 물건을 합쳐 보고 '모두 몇 개?'를 물어 주세요.",
  "빼기":"과자 5개 중 2개를 먹고 '몇 개 남았지?'를 물어 보세요.","똑같이 나누기":"간식을 가족 수만큼 똑같이 나누는 일을 아이에게 맡겨 보세요.",
  "도형":"집 안에서 동그라미·네모·세모 모양을 찾는 놀이를 해 보세요.","넓이":"식탁이나 책을 종이로 덮어 보며 '몇 장이면 덮일까?'를 해 보세요.",
  "크기 비교":"신발, 컵, 인형을 크기 순서로 줄 세워 보세요.","많고 적음":"두 접시에 과자를 놓고 어느 쪽이 많은지 짝지어 비교해 보세요.",
  "무게":"양손에 물건을 하나씩 들고 어느 쪽이 무거운지 말해 보세요.","길이":"내 발과 아빠 발, 연필 두 자루의 길이를 나란히 대 보세요.",
  "길이 재기":"블록이나 클립으로 책상 길이를 재 보세요. '클립 몇 개만큼'이 좋은 시작이에요.","시계":"밥 먹는 시간, 자는 시간에 시계의 짧은 바늘을 같이 봐 주세요.",
  "날짜":"달력에 아이 생일과 오늘을 표시하고 며칠 남았는지 세어 보세요.","하루 순서":"자기 전에 '오늘 먼저 한 일, 다음에 한 일'을 말해 보게 해 주세요.",
  "돈":"동전으로 가게 놀이를 하거나, 마트에서 동전 하나를 직접 내 보게 해 주세요.","규칙":"빨강-파랑-빨강처럼 블록을 놓고 다음에 올 색을 맞혀 보세요.",
  "분류":"장난감을 색깔끼리, 크기끼리 나누어 정리해 보세요.","그래프":"가족이 좋아하는 과일을 스티커로 붙여 어느 게 많은지 세어 보세요.",
  "순서":"줄 서기 놀이로 '맨 앞, 다음, 맨 뒤'를 말해 보세요.","몇째":"자동차나 인형을 줄 세우고 '셋째는 누구?'를 물어 보세요.",
  "위치":"인형을 의자 위·아래·옆에 놓아 보며 말로 설명해 보세요.","왼쪽 오른쪽":"신발 신을 때, 하이파이브할 때 왼손·오른손을 불러 주세요.",
  "안과 밖":"장난감을 상자 안과 밖에 놓는 놀이를 해 보세요.","짝 찾기":"빨래를 갤 때 양말 짝 맞추기를 맡겨 보세요.","길 찾기":"집 안에서 보물 찾기 지도를 그려 길을 따라가 보세요.",
  "숨은 그림":"그림책에서 작은 그림을 찾아보는 놀이를 해 보세요.","그리기":"오늘 본 것을 그림으로 그리고 이야기해 보게 해 주세요.",
  "외국어 듣기":"오늘 배운 낱말을 노래처럼 같이 따라 말해 보세요.","외국어 낱말":"집 안 물건에 외국어 낱말 쪽지를 붙여 보세요."};
function areaStats(o){ var A={}; Object.keys(o.stat).forEach(function(g){ var a=AREA[g]; if(!a) return; var s=o.stat[g]; A[a]=A[a]||[0,0]; A[a][0]+=s[0]; A[a][1]+=s[1]; });
  return Object.keys(A).map(function(a){ var w=A[a][0], m=A[a][1]; return {a:a, w:w, m:m, n:w+m, r:w/Math.max(1,w+m)}; }).filter(function(x){ return x.n>=3; }); }
R.weak=function(){ var s=areaStats(st()).sort(function(x,y){ return x.r-y.r; }); return s.length&&s[0].r<0.8? s[0].a : null; };
function reportUI(box){ var o=st(), k=kid(); if(!k){ box.innerHTML='<p class="rnote2">먼저 아이를 등록해 주세요.</p>'; return; }
  var rows="", d=new Date(); for(var i=6;i>=0;i--){ var x=new Date(d.getTime()-i*864e5), key=day(x), m=Math.round((o.sec[key]||0)/60), n=o.days[key]||0;
    rows+='<div class="rday"><span>'+(x.getMonth()+1)+"/"+x.getDate()+' '+"일월화수목금토"[x.getDay()]+'</span><i class="rbar"><i style="width:'+Math.min(100,m*3)+'%"></i></i><b>'+m+'분 · 놀이 '+n+'개</b></div>'; }
  var s=areaStats(o), good=s.slice().sort(function(a,b){ return b.r-a.r||b.n-a.n; }).filter(function(x){ return x.r>=0.8; }).slice(0,3), weak=s.slice().sort(function(a,b){ return a.r-b.r; }).filter(function(x){ return x.r<0.8; }).slice(0,2);
  var memo= weak.length? esc(k.name)+'는 <b>'+weak.map(function(x){ return x.a; }).join("</b>, <b>")+'</b>에서 자주 멈춰요.' : (s.length? esc(k.name)+"는 요즘 고르게 잘하고 있어요." : "놀이를 몇 번 더 하면 잘하는 것과 더 연습할 것을 알려 드릴게요.");
  box.innerHTML='<div class="rmemo"><b>한 줄 메모</b><p>'+memo+'</p>'+weak.map(function(x){ return '<p class="rtip"><b>'+esc(x.a)+'</b> '+esc(TIPS[x.a]||"")+'</p>'; }).join("")+'</div>'+
    (good.length?'<p class="rnote2">잘하는 것: '+good.map(function(x){ return esc(x.a)+" ("+Math.round(x.r*100)+"%)"; }).join(", ")+'</p>':"")+
    '<h3>최근 7일</h3>'+rows+'<p class="rnote2">스티커 '+nstk(o)+'장 · 배지 '+Object.keys(o.bad).length+'개 · '+esc(R.eggInfo().name)+' · '+streakDays(o)+'일 연속</p>'; }

/* ---------- 놀이 조절 (엄마만) ----------
   단계·보기 개수·힌트·문제 수를 아이마다 저장해요. 놀이 화면은 R.fx.onAdjust 로 바로 다시 그려요. */
var TIERNAME=["아기 공룡","꼬마 공룡","씩씩 공룡","대장 공룡"];
var TIERDESC=["숫자 1~3 · 2개 중에 고르기 · 틀리면 바로 힌트","숫자 1~5 · 3개 중에 고르기","숫자 1~10 · 3개 중에 고르기","더 큰 수(최대 20) · 4개 중에 고르기 · 힌트 없음"];
function months(ym){ var a=String(ym).split("-"), d=new Date(); return (d.getFullYear()-(+a[0]))*12+(d.getMonth()+1-(+a[1])); }
function baseTier(m){ return m<36?0: m<48?1: m<60?2:3; }
function tierOf(k){ return Math.max(0,Math.min(3,baseTier(months(k.ym))+(k.adj||0))); }
var ADJ=[
  ["nch","고를 보기 개수","답을 몇 개 중에서 고를지 정해요.",[[0,"단계대로"],[2,"2개"],[3,"3개"],[4,"4개"]]],
  ["hint","힌트 주기","몇 번 틀리면 정답 쪽을 반짝여 줄지 정해요.",[[1,"1번 틀리면"],[0,"단계대로"],[3,"3번 틀리면"],[99,"주지 않기"]]],
  ["rounds","한 놀이 문제 수","놀이 하나를 몇 문제로 끝낼지 정해요. 집중이 짧은 날은 적게 해 주세요.",[[0,"단계대로"],[1,"1문제"],[2,"2문제"],[3,"3문제"],[5,"5문제"]]]];
function setKid(fn){ var o=rd(PKEY)||{}, k=(o.kids||[]).filter(function(x){ return x.id===o.cur; })[0]; if(!k) return; fn(k); wr(PKEY,o); if(R.fx.onAdjust) R.fx.onAdjust(); }
function adjustUI(box){ var k=kid(); if(!k){ box.innerHTML='<p class="rnote2">먼저 아이를 등록해 주세요.</p>'; return; }
  var bt=baseTier(months(k.ym)), t=tierOf(k);
  box.innerHTML='<h3>단계</h3><p class="rnote2">'+esc(k.name)+(jong(k.name)?'은 ':'는 ')+months(k.ym)+'개월이라 <b>'+TIERNAME[bt]+'</b>가 기본이에요. 숫자 크기와 놀이 내용이 함께 바뀌어요.</p>'+
    '<div class="rseg">'+TIERNAME.map(function(n,i){ return '<button type="button" data-t="'+i+'"'+(i===t?' class="on"':'')+'>'+n+(i===bt?' · 월령':'')+'</button>'; }).join("")+'</div><p class="rnote2 rtdesc">'+TIERDESC[t]+'</p>'+
    ADJ.map(function(a){ var cur=k[a[0]]||0; return '<h3>'+a[1]+'</h3><p class="rnote2">'+a[2]+'</p><div class="rseg">'+a[3].map(function(x){ return '<button type="button" data-o="'+a[0]+'" data-v="'+x[0]+'"'+(x[0]===cur?' class="on"':'')+'>'+x[1]+'</button>'; }).join("")+'</div>'; }).join("")+
    '<div class="rrow left"><button type="button" class="rpill ghost" data-reset>모두 처음대로</button></div>';
  each("[data-t]",function(b){ b.onclick=function(){ setKid(function(x){ x.adj=+b.dataset.t-bt; }); adjustUI(box); toast("<span><b>"+TIERNAME[+b.dataset.t]+" 단계로 바꿨어요</b></span>"); }; },box);
  each("[data-o]",function(b){ b.onclick=function(){ var v=+b.dataset.v; setKid(function(x){ if(v) x[b.dataset.o]=v; else delete x[b.dataset.o]; }); adjustUI(box); }; },box);
  box.querySelector("[data-reset]").onclick=function(){ setKid(function(x){ x.adj=0; delete x.nch; delete x.hint; delete x.rounds; }); adjustUI(box); toast("<span><b>월령에 맞게 되돌렸어요</b></span>"); }; }
R.adjustMenu=function(){ var k=kid(), P=R.fx.play, inPlay=P&&view()==="play"&&!(R.fx.S&&R.fx.S.diag);
  var o=ov("parent adjust",'<h2>놀이 조절'+(k?' · '+esc(k.name):'')+'</h2>'+
    (inPlay?'<h3>지금 하는 놀이</h3><div class="rrow left"><button type="button" class="rpill" data-p="skip">이 문제 넘기기</button><button type="button" class="rpill" data-p="restart">처음부터 다시</button><button type="button" class="rpill" data-p="pass">성공으로 치기</button><button type="button" class="rpill ghost" data-p="home">오늘은 그만</button></div>':'')+
    '<div data-adj></div><div class="rrow"><button type="button" class="rpill main" data-done>다 했어요</button></div>');
  adjustUI(o.box.querySelector("[data-adj]"));
  each("[data-p]",function(b){ b.onclick=function(){ o.close(); setTimeout(function(){ P[b.dataset.p](); },220); }; },o.box);
  o.box.querySelector("[data-done]").onclick=function(){ o.close(); }; };
/* 숨은 단추: 2초 꾹 누르면 부모님 확인 → 놀이 조절 */
(function(){ var T=null, el=null;
  function end(){ clearTimeout(T); T=null; if(el){ el.classList.remove("hold"); el=null; } }
  document.addEventListener("pointerdown",function(e){ var t=e.target.closest&&e.target.closest("[data-secret]"); if(!t) return; e.preventDefault(); end(); el=t; t.classList.add("hold");
    T=setTimeout(function(){ end(); try{ navigator.vibrate&&navigator.vibrate(30); }catch(x){} R.gate(R.adjustMenu); },2000); });
  ["pointerup","pointercancel","pointerleave"].forEach(function(ev){ document.addEventListener(ev,function(e){ if(el&&(ev!=="pointerleave"||e.target===el)) end(); },true); });
  document.addEventListener("contextmenu",function(e){ if(e.target.closest&&e.target.closest("[data-secret]")) e.preventDefault(); }); })();

/* ---------- 부모 메뉴 ---------- */
R.parentMenu=function(){ var s=SET(), k=kid(), o=st();
  var lim=[[10,"10분"],[15,"15분"],[20,"20분"],[30,"30분"],[45,"45분"],[0,"끄기"]];
  var box=ov("parent",'<h2>부모님 메뉴</h2>'+
    '<details open><summary>하루 놀이 시간</summary><p class="rnote2">시간이 다 되면 하던 놀이까지만 하고 졸린 공룡이 나와요. 2분 전에 미리 알려 줘요.'+(k?' 오늘 '+Math.round(used(o)/60)+'분 놀았어요.':'')+'</p><div class="rseg">'+lim.map(function(x){ return '<button type="button" data-l="'+x[0]+'"'+(s.limit===x[0]?' class="on"':'')+'>'+x[1]+'</button>'; }).join("")+'</div></details>'+
    '<details><summary>놀이 조절 (단계·힌트·문제 수)</summary><div data-adj></div></details>'+
    '<details><summary>아이 기록과 한 줄 메모</summary><div data-rep></div></details>'+
    '<details><summary>엄마·아빠 목소리 녹음</summary><div data-rec></div></details>'+
    '<details><summary>가족 쪽지 보내기</summary><p class="rnote2">할머니, 아빠가 보낸 칭찬을 적어 두면 다음에 놀이를 시작할 때 공룡이 읽어 줘요.</p><div class="rnoteform"><select data-from><option>엄마</option><option>아빠</option><option>할머니</option><option>할아버지</option><option>이모</option><option>삼촌</option></select><input data-text maxlength="60" placeholder="예: 어제 숫자 놀이 정말 잘했어! 사랑해"><button type="button" class="rmini" data-send>보내기</button></div><p class="rnote2" data-q></p></details>'+
    '<details><summary>아이 등록·캐릭터</summary><p class="rnote2">아이를 더하거나 얼굴 캐릭터를 다시 만들 수 있어요.</p><div class="rrow left"><a class="rpill" href="mathdino.html#kids">아이 등록·바꾸기</a><a class="rpill" href="mathdino.html#avatar">캐릭터 만들기</a></div></details>');
  var b=box.box; each("[data-l]",function(bt){ bt.onclick=function(){ var x=SET(); x.limit=+bt.dataset.l; wr("goyu-parent",x); each("[data-l]",function(y){ y.classList.toggle("on",y===bt); },b); TM.warned=false; if(R.timeLeft()>0){ R.tired=false; } gauge(st()); }; },b);
  adjustUI(b.querySelector("[data-adj]")); reportUI(b.querySelector("[data-rep]")); recUI(b.querySelector("[data-rec]"));
  function q(){ var oo=st(); b.querySelector("[data-q]").textContent= oo.notes.length? "기다리는 쪽지 "+oo.notes.length+"개" : ""; } q();
  b.querySelector("[data-send]").onclick=function(){ var t=b.querySelector("[data-text]").value.trim(); if(!t||!kid()) return; var oo=st(); oo.notes.push({from:b.querySelector("[data-from]").value,text:t,d:day()}); sv(oo); b.querySelector("[data-text]").value=""; q(); toast("<span><b>쪽지를 넣어 두었어요</b><small>다음에 시작할 때 읽어 줘요</small></span>"); }; };
document.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("[data-parent]"); if(t){ e.preventDefault(); R.gate(R.parentMenu); } });

/* ---------- 콕 찌르면 웃긴 반응 ---------- */
var POKE={n:0,t:0};
var TICKLE=["간지러워!","히히, 간지러워!","나 찌르지 마~ 히히!","왜 불렀어?","하하하! 그만그만!","나랑 놀고 싶구나?"];
document.addEventListener("pointerdown",function(e){ var el=e.target.closest&&e.target.closest("[data-buddy],.rpoke"); if(!el) return; if(R.fx.S&&R.fx.S.lock) return;
  var now=Date.now(); POKE.n= now-POKE.t<1500? POKE.n+1 : 1; POKE.t=now;
  el.classList.remove("rtickle"); void el.offsetWidth; el.classList.add("rtickle"); setTimeout(function(){ el.classList.remove("rtickle"); },650);
  if(POKE.n===5){ POKE.n=0; SND.fart(); var p=mk("div","rpuff","뿡!"); var r=el.getBoundingClientRect(); p.style.left=(r.left+r.width*0.7)+"px"; p.style.top=(r.top+r.height*0.6)+"px"; p.style.zIndex=++ZI+300; document.body.appendChild(p); setTimeout(function(){ p.remove(); },1300);
    setTimeout(function(){ if(view()!=="play") say(pick(["앗, 방귀 뀌었다! 히히, 미안!","뿡! 너무 웃어서 방귀가 나왔어!"])); else SND.giggle(); },500); return; }
  if(POKE.n===1||POKE.n===3){ if(view()==="play") SND.giggle(); else say(pick(TICKLE)); } },true);

/* ---------- 춤 파티 ---------- */
R.party=function(){ if(R.sleeping) return; var o=ov("party",'<div class="rdisco"><i></i><i></i><i></i><i></i></div><div class="rdance">'+avHTML("cheer")+'</div><h2>깜짝 춤 파티!</h2><p>같이 춤춰요! 빙글빙글~</p>');
  SND.tune(18); say("깜짝 춤 파티! 같이 춤추자!"); o.el.addEventListener("click",function(){ o.close(); }); setTimeout(o.close,5200); };

/* ---------- 자랑 카드 (가족에게 보내기) ---------- */
function loadImg(src){ return new Promise(function(res){ var i=new Image(); i.onload=function(){ res(i); }; i.onerror=function(){ res(null); }; i.src=src; }); }
function avatarImg(){ var html=avHTML("cheer").replace(/<g class="s-idle">[\s\S]*?<\/g>/,""); if(html.indexOf("<svg")<0) return loadImg(art("dino"));
  /* 바깥 그림(art/…)은 그림 파일 안에 넣어야 캔버스에 그려져요 */
  var urls=[]; html.replace(/href="(art\/[^"]+)"/g,function(m,u){ if(urls.indexOf(u)<0) urls.push(u); });
  return Promise.all(urls.map(function(u){ return fetch(u).then(function(r){ return r.blob(); }).then(function(b){ return new Promise(function(res){ var f=new FileReader(); f.onload=function(){ res([u,f.result]); }; f.readAsDataURL(b); }); }).catch(function(){ return [u,u]; }); }))
    .then(function(pairs){ pairs.forEach(function(p){ html=html.split('"'+p[0]+'"').join('"'+p[1]+'"'); });
      html=html.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="400" height="480" ').replace(/(<g transform="translate\(-4 -10\)">)?<g class="fx">[\s\S]*$/,"</g></svg>");
      return loadImg(URL.createObjectURL(new Blob([html],{type:"image/svg+xml"}))); }); }
function rr(c,x,y,w,h,r){ c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
R.brag=function(){ var k=kid(); if(!k) return; var o=st(), d=day(), today=o.tstk[d]||[], n=o.days[d]||0, e=R.eggInfo();
  toast("<span><b>자랑 카드를 만들고 있어요</b></span>",1500);
  Promise.all([avatarImg(), loadImg(e.img)].concat(today.slice(-6).map(function(s){ return loadImg(art(s)); }))).then(function(im){
    var W=1080,H=1350,c=document.createElement("canvas"); c.width=W; c.height=H; var x=c.getContext("2d");
    var g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,"#cfeeff"); g.addColorStop(0.62,"#fff6e9"); g.addColorStop(1,"#ffe3ef"); x.fillStyle=g; x.fillRect(0,0,W,H);
    x.fillStyle="#fff"; for(var i=0;i<26;i++){ x.globalAlpha=0.5; x.beginPath(); x.arc(Math.random()*W,Math.random()*H*0.5,4+Math.random()*8,0,7); x.fill(); } x.globalAlpha=1;
    var F='"Jua","Apple SD Gothic Neo","Malgun Gothic",sans-serif';
    x.textAlign="center"; x.fillStyle="#5b3fa8"; x.font="84px "+F; x.fillText(k.name+"의 오늘 자랑",W/2,140);
    x.fillStyle="#7a6b62"; x.font="40px "+F; var dt=new Date(); x.fillText((dt.getMonth()+1)+"월 "+dt.getDate()+"일 · "+(n?"놀이 "+n+"개 성공!":"오늘도 열심히 놀았어요!"),W/2,205);
    if(im[0]) x.drawImage(im[0],W/2-330,250,400,480);
    if(im[1]){ x.drawImage(im[1],W/2+90,470,260,260); x.fillStyle="#3b2f2a"; x.font="38px "+F; x.fillText(e.name,W/2+220,770); }
    x.fillStyle="#fff"; rr(x,70,820,W-140,330,44); x.fill(); x.fillStyle="#3b2f2a"; x.font="44px "+F; x.fillText(today.length?"오늘 받은 스티커":"내 보물",W/2,890);
    var items=today.length? im.slice(2) : [], sx=W/2-(items.length*140)/2;
    items.forEach(function(s,i){ if(s) x.drawImage(s,sx+i*140+5,930,130,130); });
    if(!items.length){ x.font="38px "+F; x.fillStyle="#7a6b62"; x.fillText("스티커 "+nstk(o)+"장 · 배지 "+Object.keys(o.bad).length+"개",W/2,1010); }
    x.fillStyle="#7a6b62"; x.font="34px "+F; x.fillText("칭찬 한마디 부탁해요! 💛",W/2,1110);
    x.fillStyle="#5b3fa8"; x.font="36px "+F; x.fillText("우리 아이 놀이터",W/2,1260);
    c.toBlob(function(blob){ if(!blob) return; var f=null; try{ f=new File([blob],k.name+"_자랑.png",{type:"image/png"}); }catch(e){}
      var o2=ov("brag",'<h2>자랑 카드 완성!</h2><img class="rcard" alt="자랑 카드"><div class="rrow"><button type="button" class="rpill main" data-share>가족에게 보내기</button><a class="rpill" data-dl download="'+esc(k.name)+'_자랑.png">사진으로 저장</a></div><p class="rnote2">카카오톡이나 문자로 보내면 가족이 칭찬해 줄 거예요. 답장은 부모님 메뉴의 "가족 쪽지"에 적어 두면 공룡이 읽어 줘요.</p>');
      var u=URL.createObjectURL(blob); o2.box.querySelector(".rcard").src=u; o2.box.querySelector("[data-dl]").href=u;
      var sh=o2.box.querySelector("[data-share]"); if(!(f&&navigator.canShare&&navigator.canShare({files:[f]}))) sh.hidden=true;
      sh.onclick=function(){ navigator.share({files:[f],title:k.name+"의 오늘 자랑",text:k.name+"가 오늘 놀이터에서 열심히 했어요! 칭찬해 주세요 💛"}).catch(function(){}); };
      say("자랑 카드가 완성됐어! 가족한테 보내 볼까?"); },"image/png"); }); };

/* ---------- 손뼉·말로 대답하기 ---------- */
var NW=[["다섯",5],["여섯",6],["일곱",7],["여덟",8],["아홉",9],["하나",1],["둘",2],["셋",3],["넷",4],["열",10],["한",1],["두",2],["세",3],["네",4],["일",1],["이",2],["삼",3],["사",4],["오",5],["육",6],["칠",7],["팔",8],["구",9],["십",10]];
function parseNums(t){ var out=[]; (String(t).match(/\d+/g)||[]).forEach(function(x){ out.push(+x); });
  String(t).split(/[\s,.!?]+/).forEach(function(w){ if(!w) return; for(var i=0;i<NW.length;i++){ var k=NW[i][0]; if(w.indexOf(k)===0&&(k.length>1||k==="열"||w===k||/^.(개|명|마리|요|번)$/.test(w))){ var v=NW[i][1]; if(v===10){ var r=w.slice(k.length); for(var j=0;j<NW.length;j++) if(NW[j][1]<10&&r.indexOf(NW[j][0])===0){ v+=NW[j][1]; break; } } out.push(v); break; } } }); return out; }
R.parseNums=parseNums;
R.canListen=function(){ return !!(window.SpeechRecognition||window.webkitSpeechRecognition); };
R.canClap=function(){ return !!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&(window.AudioContext||window.webkitAudioContext)); };
R.claps=function(cb){ var a=ac(); if(!a) return; stopTalk();
  var o=ov("clap",'<div class="rclap">👏</div><h2>손뼉을 쳐서 대답해!</h2><div class="rcount">0</div><p class="rnote2">손뼉 소리를 듣는 중이에요</p>');
  var n=0, last=0, start=performance.now(), done=false, stream=null, raf=0, floor=0.02;
  function end(){ if(done) return; done=true; cancelAnimationFrame(raf); if(stream) stream.getTracks().forEach(function(t){ t.stop(); }); setTimeout(function(){ o.close(); cb(n); },500); }
  o.onclose=function(){ if(!done){ done=true; cancelAnimationFrame(raf); if(stream) stream.getTracks().forEach(function(t){ t.stop(); }); } };
  navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}}).then(function(s){ if(done){ s.getTracks().forEach(function(t){ t.stop(); }); return; } stream=s;
    var src=a.createMediaStreamSource(s), an=a.createAnalyser(); an.fftSize=1024; src.connect(an); var buf=new Float32Array(an.fftSize);
    (function loop(){ if(done) return; an.getFloatTimeDomainData(buf); var pk=0; for(var i=0;i<buf.length;i++){ var v=Math.abs(buf[i]); if(v>pk) pk=v; }
      var now=performance.now(); if(now-start<400) floor=Math.max(floor,pk*1.2);
      if(pk>Math.max(0.25,floor*3)&&now-last>200&&now-start>400){ n++; last=now; var c=o.box.querySelector(".rcount"); c.textContent=n; c.classList.remove("rpopn"); void c.offsetWidth; c.classList.add("rpopn"); SND.pop(); }
      if((n&&now-last>1800)||now-start>9000) return end(); raf=requestAnimationFrame(loop); })(); })
  .catch(function(){ o.close(); alert("마이크를 쓸 수 없어요. 브라우저 설정에서 마이크를 허용해 주세요."); }); };
R.listen=function(lang, cb){ var SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR) return; stopTalk();
  var o=ov("clap",'<div class="rclap">🎤</div><h2>큰 소리로 말해 줘!</h2><div class="rcount">…</div><p class="rnote2">예: "셋!"</p>'), r=new SR(), got=false;
  r.lang=lang||"ko-KR"; r.interimResults=false; r.maxAlternatives=5;
  r.onresult=function(e){ got=true; var all=[]; for(var i=0;i<e.results[0].length;i++) all.push(e.results[0][i].transcript); o.box.querySelector(".rcount").textContent=all[0]||"";
    var nums=[]; all.forEach(function(t){ parseNums(t).forEach(function(v){ if(nums.indexOf(v)<0) nums.push(v); }); }); setTimeout(function(){ o.close(); cb(nums, all[0]||""); },700); };
  r.onerror=r.onend=function(){ if(!got){ got=true; setTimeout(function(){ o.close(); cb([], ""); },300); } };
  o.onclose=function(){ try{ r.abort(); }catch(e){} };
  try{ r.start(); }catch(e){ o.close(); } };

/* ---------- 내가 선생님 (아이가 문제 내기) ---------- */
R.teach=function(){ var k=kid(), it=pick(STK.length?STK:["apple"]), n=0, max=10;
  var o=ov("teach",'<h2><span data-who></span> 선생님 문제</h2><p data-msg>접시에 '+'<b>몇 개</b> 놓을지 정해서 눌러 줘. 엄마 아빠가 맞힐 거야!</p><div class="rplate" data-plate></div><div class="rrow" data-kid><button type="button" class="rpill" data-minus>빼기</button><button type="button" class="rpill" data-plus>하나 더</button><button type="button" class="rpill main" data-done>문제 다 냈어!</button></div><div class="rnums" data-nums hidden></div><div class="rrow" data-again hidden><button type="button" class="rpill main" data-re>또 문제 낼래!</button></div>');
  var b=o.box; b.querySelector("[data-who]").textContent=k?k.name:"꼬마"; var plate=b.querySelector("[data-plate]"), msg=b.querySelector("[data-msg]");
  function draw(){ plate.innerHTML=""; for(var i=0;i<n;i++){ var im=mk("img"); im.src=art(it); im.alt=""; plate.appendChild(im); } }
  say((k?voc(k.name)+", ":"")+"오늘은 네가 선생님이야! 접시에 몇 개 놓을지 정해서 눌러 봐!");
  b.querySelector("[data-plus]").onclick=function(){ if(n<max){ n++; SND.pop(); draw(); } };
  b.querySelector("[data-minus]").onclick=function(){ if(n>0){ n--; draw(); } };
  plate.onclick=function(){ if(b.querySelector("[data-kid]").hidden) return; if(n<max){ n++; SND.pop(); draw(); } };
  b.querySelector("[data-done]").onclick=function(){ if(!n){ say("먼저 접시에 하나 이상 놓아 줘!"); return; } b.querySelector("[data-kid]").hidden=true; msg.innerHTML="<b>엄마 아빠 차례!</b> 접시에 모두 몇 개 있을까요?";
    say("엄마 아빠, 문제 나갑니다! 접시에 모두 몇 개 있을까요?"); var nb=b.querySelector("[data-nums]"); nb.hidden=false; nb.innerHTML="";
    for(var v=1;v<=max;v++){ (function(v){ var bt=mk("button","rnum",String(v)); bt.type="button"; bt.onclick=function(){ if(v===n){ SND.fan(); bt.classList.add("good"); msg.innerHTML="<b>딩동댕! 정답!</b> "+esc(k?k.name:"")+" 선생님 문제를 맞혔어요";
          say("딩동댕! 정답! "+(k?k.name+" 선생님 ":"")+"문제를 맞혔어요!"); var r=R.reward(1,"teach"); toast(stkCard(r.sticker).replace("rstk","rstk small"),2200); celebrate(r,2400); nb.hidden=true; b.querySelector("[data-again]").hidden=false; }
        else { SND.boing(); bt.classList.add("bad"); msg.innerHTML="<b>땡! 틀렸어요~</b> 선생님, 다시 기회를 줄까요?"; say(pick(["땡! 엄마 아빠가 틀렸다! 히히!","땡! 다시 세어 보세요~","땡! 선생님 문제가 너무 어렵나 봐!"])); } }; nb.appendChild(bt); })(v); } };
  b.querySelector("[data-re]").onclick=function(){ n=0; it=pick(STK.length?STK:["apple"]); draw(); b.querySelector("[data-kid]").hidden=false; b.querySelector("[data-again]").hidden=true; msg.innerHTML="이번엔 <b>몇 개</b> 놓을까?"; say("이번엔 몇 개 놓을까?"); }; };

/* ---------- 생활 타이머 (양치·정리·손 씻기·기다리기) ---------- */
var LIFE={
  brush:{t:120,img:"toothbrush",name:"양치",go:"치카치카 양치 시작!",steps:["윗니 바깥쪽 쓱싹쓱싹!","아랫니 바깥쪽 쓱싹쓱싹!","안쪽도 구석구석!","어금니 위도 꼼꼼하게! 거의 다 했어!"],end:"반짝반짝 깨끗해졌다! 양치 끝!",egg:1},
  tidy:{t:300,img:"toybox",name:"정리",go:"정리 시작! 노래 끝나기 전에 다 치워 보자!",steps:["장난감을 상자에 쏙!","책은 책꽂이에!","인형은 제자리에!","바닥에 남은 거 없나 볼까?","거의 다 했어! 조금만 더!"],end:"우와, 방이 깨끗해졌다! 정리 대장!",egg:1},
  wash:{t:30,img:"heart",name:"손 씻기",go:"비누로 손 씻기 시작!",steps:["손바닥 비비기!","손등도 비비기!","손가락 사이사이!"],end:"손이 깨끗해졌다!",egg:0},
  wait:{t:180,img:"sun",name:"기다리기",go:"공룡이랑 같이 기다려 보자!",steps:["조금만 기다려 줘!","잘 기다리고 있어!","거의 다 됐어!"],end:"기다리기 성공! 정말 잘 참았어!",egg:0}
};
R.LIFE=LIFE;
R.lifeTimer=function(kind, sec){ var L=LIFE[kind]; if(!L) return; var T=sec||L.t, t0=Date.now(), stepN=L.steps.length, lastStep=-1, done=false, beat=0;
  R.lifeOn=true;
  var o=ov("life",'<h2>'+esc(L.name)+' 타이머</h2><div class="rring" style="--f:1"><img src="'+art(L.img)+'" alt=""><b data-t></b></div><p data-step class="rstep"></p><div class="rlifebud rpoke">'+avHTML("idle")+'</div>');
  var ring=o.box.querySelector(".rring"), tt=o.box.querySelector("[data-t]"), stp=o.box.querySelector("[data-step]");
  say(L.go);
  var iv=setInterval(function(){ var el=(Date.now()-t0)/1000, left=Math.max(0,T-el); ring.style.setProperty("--f",(left/T).toFixed(3)); tt.textContent=Math.floor(left/60)+":"+p2(Math.ceil(left%60)===60?0:Math.ceil(left)%60);
    var si=Math.min(stepN-1,Math.floor(el/(T/stepN))); if(si!==lastStep){ lastStep=si; stp.textContent=L.steps[si]; if(si>0) say(L.steps[si]); }
    if(++beat%16===0&&!muted()) SND.tune(4);
    if(left<=0&&!done){ done=true; clearInterval(iv); finish(); } },250);
  function finish(){ R.lifeOn=false; SND.fan(); stp.textContent=L.end; say(L.end); ring.classList.add("rdone"); var r=R.reward(L.egg, kind); var s=o.box.querySelector(".rlifebud"); if(s) s.innerHTML=avHTML("cheer");
    setTimeout(function(){ toast(stkCard(r.sticker).replace("rstk","rstk small"),2200); celebrate(r,2400); },1200); }
  o.onclose=function(){ clearInterval(iv); R.lifeOn=false; }; };
R.waitPick=function(){ var o=ov("waitpick",'<h2>얼마나 기다릴까?</h2><div class="rrow">'+[1,3,5,10].map(function(m){ return '<button type="button" class="rpill" data-m="'+m+'">'+m+'분</button>'; }).join("")+'</div>');
  each("[data-m]",function(b){ b.onclick=function(){ o.close(); R.lifeTimer("wait",+b.dataset.m*60); }; },o.box); };

/* ---------- 오늘의 생활 미션 ---------- */
var MIS=[["수 세기","간식을 먹기 전에 하나씩 세어 보기"],["수 세기","계단을 오르며 큰 소리로 세어 보기"],["도형","집 안에서 동그라미 모양 3개 찾기"],["도형","네모난 물건 3개 찾아서 엄마 아빠한테 보여 주기"],
  ["많고 적음","내 컵과 엄마 컵 중 어느 쪽 물이 많은지 보기"],["길이","내 신발과 아빠 신발 길이 나란히 대 보기"],["무게","사과와 귤을 양손에 들고 어느 게 무거운지 말하기"],["시계","저녁 먹는 시간에 시계 바늘 같이 보기"],
  ["돈","동전으로 가게 놀이하기"],["짝 찾기","빨래 갤 때 양말 짝 맞추기"],["분류","장난감을 색깔끼리 나누어 정리하기"],["하루 순서","아침에 한 일을 순서대로 말해 보기"],["몇째","줄 설 때 내가 몇째인지 말해 보기"],
  ["위치","인형을 의자 위, 아래, 옆에 놓아 보기"],["왼쪽 오른쪽","오른손 하이파이브, 왼손 하이파이브!"],["더하기","귤 2개와 1개를 합치면 몇 개인지 세어 보기"],["빼기","과자 5개 중 2개를 먹으면 몇 개 남는지 보기"],
  ["똑같이 나누기","간식을 가족 수만큼 똑같이 나누어 주기"],["외국어 낱말","오늘 배운 외국어 낱말 하나를 가족에게 알려 주기"],["숫자 읽기","자동차 번호판에서 아는 숫자 찾기"],["길이 재기","내 키만큼 블록 쌓아 보기"],
  ["안과 밖","장난감을 상자 안에, 상자 밖에 놓아 보기"],["크기 비교","신발을 작은 것부터 큰 것까지 줄 세우기"],["그리기","오늘 본 동물을 그림으로 그리기"],["날짜","달력에서 오늘 날짜 찾기"],["규칙","블록을 빨강, 파랑, 빨강, 파랑 순서로 놓기"],["그래프","가족이 좋아하는 과일을 물어보고 어느 과일이 많은지 세기"]];
R.mission=function(){ var o=st(), d=day(), w=R.weak(), pool=w? MIS.filter(function(m){ return m[0]===w; }) : []; if(!pool.length) pool=MIS;
  var h=0; for(var i=0;i<d.length;i++) h=(h*31+d.charCodeAt(i))>>>0; var m=pool[h%pool.length]; return {a:m[0], t:m[1], done:(o.mis===d)}; };
R.missionDone=function(){ var o=st(), d=day(); if(o.mis===d) return null; o.mis=d; o.cnt.mis=(o.cnt.mis||0)+1; var r=reward(o,1); SND.fan(); say(pick(["미션 성공! 정말 멋지다!","우와, 미션 성공! 생활 속 수학 박사네!"])); toast(stkCard(r.sticker).replace("rstk","rstk small"),2200); celebrate(r,2400); return r; };

/* ---------- 색칠한 그림을 놀이에 넣기 ---------- */
var COL={};
var LINE=window.__LINE||[];
R.COL=COL;
R.applyColors=function(){ var k=kid(); if(!k) return Promise.resolve();
  return ikeys().then(function(keys){ var pre="col-"+k.id+"-"; return Promise.all(keys.filter(function(x){ return String(x).indexOf(pre)===0; }).map(function(x){ return iget(x).then(function(v){ var name=String(x).slice(pre.length); if(v){ COL[name]=v; useColor(name,v); } }); })); }); };
function useColor(name, url){ var s=document.getElementById("g-"+name); if(s&&s.tagName.toLowerCase()==="symbol") s.innerHTML='<image href="'+url+'" x="0" y="0" width="100" height="100"/>'; }
/* 종이 배경 지우기: 가장자리와 이어진 종이색만 투명하게 */
function clearPaper(c){ var w=c.width,h=c.height,x=c.getContext("2d"),d=x.getImageData(0,0,w,h),p=d.data,rs=[],gs=[],bs=[],i,j,k;
  for(i=0;i<w;i+=3){ [0,h-1].forEach(function(y){ var o=(y*w+i)*4; rs.push(p[o]); gs.push(p[o+1]); bs.push(p[o+2]); }); } for(j=0;j<h;j+=3){ [0,w-1].forEach(function(xx){ var o=(j*w+xx)*4; rs.push(p[o]); gs.push(p[o+1]); bs.push(p[o+2]); }); }
  function med(a){ a.sort(function(u,v){ return u-v; }); return a[a.length>>1]; } var R0=med(rs),G0=med(gs),B0=med(bs), tol=40;
  function near(o){ var s=p[o]+p[o+1]+p[o+2], sat=Math.max(p[o],p[o+1],p[o+2])-Math.min(p[o],p[o+1],p[o+2]); return (Math.abs(p[o]-R0)+Math.abs(p[o+1]-G0)+Math.abs(p[o+2]-B0)<tol*3)||(s>(R0+G0+B0)-tol&&sat<36); }
  var bg=new Uint8Array(w*h), stck=[]; for(i=0;i<w;i++){ stck.push(i); stck.push((h-1)*w+i); } for(j=0;j<h;j++){ stck.push(j*w); stck.push(j*w+w-1); }
  while(stck.length){ k=stck.pop(); if(bg[k]||!near(k*4)) continue; bg[k]=1; var xx=k%w, yy=(k/w)|0; if(xx>0) stck.push(k-1); if(xx<w-1) stck.push(k+1); if(yy>0) stck.push(k-w); if(yy<h-1) stck.push(k+w); }
  /* 안쪽 흰 종이(색칠 안 한 곳)는 하얗게 정리, 선은 진하게 */
  for(k=0;k<w*h;k++){ var o=k*4; if(bg[k]){ p[o+3]=0; continue; } var s2=p[o]+p[o+1]+p[o+2], sat2=Math.max(p[o],p[o+1],p[o+2])-Math.min(p[o],p[o+1],p[o+2]);
    if(s2>(R0+G0+B0)-tol*1.5&&sat2<40){ p[o]=p[o+1]=p[o+2]=255; } else { for(var z=0;z<3;z++) p[o+z]=Math.max(0,Math.min(255,(p[o+z]-128)*1.25+128+(255-(R0+G0+B0)/3)*0.6)); } }
  x.putImageData(d,0,0); return c; }
R.colorOpen=function(){ var k=kid(); if(!k){ toast("<span><b>먼저 아이를 등록해 주세요</b></span>"); return; }
  var o=ov("color",'<h2>내가 색칠한 그림</h2><p class="rnote2">1. 색칠 종이를 인쇄해서 색칠해요. 2. 그림을 눌러 색칠한 종이를 찍어요. 3. 놀이에 내 그림이 나와요!</p><div class="rrow left"><a class="rpill" href="color.html" target="_blank" rel="noopener">색칠 종이 인쇄하기</a></div><div class="rgrid" data-grid></div>');
  var grid=o.box.querySelector("[data-grid]");
  function render(){ grid.innerHTML=""; LINE.forEach(function(name){ var b=mk("button","rcell"+(COL[name]?" have":""),'<img src="'+(COL[name]||("art/line/"+name+".png"))+'" alt="">'); b.type="button"; b.onclick=function(){ shoot(name); }; grid.appendChild(b); }); }
  render();
  function shoot(name){ var inp=mk("input"); inp.type="file"; inp.accept="image/*"; inp.setAttribute("capture","environment");
    inp.onchange=function(){ var f=inp.files&&inp.files[0]; if(!f) return; var url=URL.createObjectURL(f), im=new Image(); im.onload=function(){ URL.revokeObjectURL(url); crop(name,im); }; im.src=url; }; inp.click(); }
  function crop(name, im){ var c=ov("crop",'<h2>그림을 네모 안에 맞춰요</h2><canvas width="360" height="360" class="rcrop"></canvas><label class="rrng">크게 작게<input type="range" min="0.5" max="3" step="0.05" value="1"></label><div class="rprev"><img alt=""></div><div class="rrow"><button type="button" class="rpill main" data-ok>놀이에 넣기</button></div>');
    var cv=c.box.querySelector("canvas"), x=cv.getContext("2d"), z=1, ox=0, oy=0, W=360, base=W/Math.min(im.width,im.height)*0.95, drag=null, prev=c.box.querySelector(".rprev img"), out=null, tm=null;
    function drawC(){ var s=base*z, w=im.width*s, h=im.height*s; x.fillStyle="#eee"; x.fillRect(0,0,W,W); x.drawImage(im,W/2-w/2+ox,W/2-h/2+oy,w,h); x.strokeStyle="#ffc83d"; x.lineWidth=4; x.strokeRect(20,20,W-40,W-40); }
    function build(){ var s=base*z, o2=document.createElement("canvas"); o2.width=o2.height=256; var sx=(20-(W/2-im.width*s/2+ox))/s, sy=(20-(W/2-im.height*s/2+oy))/s, sw=(W-40)/s;
      o2.getContext("2d").drawImage(im,sx,sy,sw,sw,0,0,256,256); clearPaper(o2); out=o2.toDataURL("image/png"); prev.src=out; }
    function later(){ clearTimeout(tm); tm=setTimeout(build,200); }
    drawC(); build();
    cv.addEventListener("pointerdown",function(e){ e.preventDefault(); cv.setPointerCapture(e.pointerId); var r=cv.getBoundingClientRect(); drag={x:e.clientX,y:e.clientY,ox:ox,oy:oy,k:W/r.width}; });
    cv.addEventListener("pointermove",function(e){ if(!drag) return; ox=drag.ox+(e.clientX-drag.x)*drag.k; oy=drag.oy+(e.clientY-drag.y)*drag.k; drawC(); });
    function up(){ if(drag){ drag=null; later(); } } cv.addEventListener("pointerup",up); cv.addEventListener("pointercancel",up);
    c.box.querySelector("input[type=range]").addEventListener("input",function(){ z=+this.value; drawC(); later(); });
    c.box.querySelector("[data-ok]").onclick=function(){ build(); iset("col-"+k.id+"-"+name,out).then(function(){ COL[name]=out; useColor(name,out); c.close(); render(); var r=R.reward(1,"color"); SND.fan(); say("우와! 내가 색칠한 그림이 놀이에 들어갔어!"); toast(stkCard(r.sticker).replace("rstk","rstk small"),2200); celebrate(r,2400); }); }; } };
})();
