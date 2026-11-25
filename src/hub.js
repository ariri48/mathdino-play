/* ---------- 놀이터 첫 화면 = 아이 방 ---------- */
(function(){
var R=window.ROOM, $=function(id){ return document.getElementById(id); };
var o={}; try{ o=JSON.parse(localStorage.getItem("mathdino-play-v2"))||{}; }catch(e){}
var k=R.kid(), a=null; try{ a=k&&JSON.parse(localStorage.getItem("mathdino-av-"+k.id)); }catch(e){}
var av=a||{suit:k?(k.suit||0):0};
function curAv(){ return av; }
R.fx={say:hubSay, avatarSVG:avatarSVG, curAv:curAv, S:{}, clipStop:clipStop};
$("bud").innerHTML=avatarSVG(av,"pose-idle");
function pose(p,ms){ var s=$("bud").querySelector(".av"); if(s) s.setAttribute("class","av pose-"+p); clearTimeout(pose._t); pose._t=setTimeout(function(){ var s2=$("bud").querySelector(".av"); if(s2) s2.setAttribute("class","av pose-idle"); },ms||2000); }
if(k){ $("htitle").textContent=k.name+"의 놀이터"; document.title=k.name+"의 놀이터"; }
$("nokid").hidden=!!k; $("kidstuff").hidden=!k; $("pet").hidden=!k;
function cnt(key){ var p=(o[key]||{})[o.cur]||{}, n=0; Object.keys(p).forEach(function(b){ n+=(p[b]||[]).filter(Boolean).length; }); return n; }
Array.prototype.forEach.call(document.querySelectorAll(".card"),function(c){ var key=c.dataset.key, max=+c.dataset.max, n= key==="prog_words"? cnt("prog_words_en")+cnt("prog_words_ja")+cnt("prog_words_zh") : cnt(key);
  c.querySelector(".bar i").style.width=Math.round(n/max*100)+"%"; c.querySelector(".prog b").textContent=n+" / "+max; });

function render(){ if(!k) return; var s=R.st(), e=R.eggInfo(), d=R.day();
  $("petimg").src=e.img; $("petname").textContent=e.name; $("eggimg").src=e.img; $("eggname").textContent="내 "+e.name;
  $("eggbar").style.width=(e.next? Math.round((e.p-e.from)/(e.next-e.from)*100) : 100)+"%";
  $("egghint").textContent= e.next? "놀이·미션·타이머를 하면 자라요. "+(e.next-e.p)+"번 더 하면 "+e.nextName+"!" : "최고 단계! 정말 대단해요";
  var m=R.mission(); $("mtext").textContent=m.t; $("marea").textContent="오늘 배운 것과 이어지는 생활 놀이 · "+m.a; $("mdone").disabled=m.done; $("mdone").textContent=m.done?"오늘 미션 성공!":"했어요!"; document.querySelector(".mission").classList.toggle("done",m.done);
  /* 도장 달력 */
  var now=new Date(), y=now.getFullYear(), mo=now.getMonth(), first=new Date(y,mo,1).getDay(), last=new Date(y,mo+1,0).getDate(), h="";
  for(var i=0;i<first;i++) h+='<span class="x"></span>';
  for(var dd=1;dd<=last;dd++){ var key=y+"-"+(mo<9?"0":"")+(mo+1)+"-"+(dd<10?"0":"")+dd; h+='<span class="'+(s.days[key]!==undefined?"on ":"")+(dd===now.getDate()?"now":"")+'">'+dd+'</span>'; }
  $("cal").innerHTML=h; var sd=R.streakDays(); $("streak").textContent= sd>1? "· "+sd+"일 연속!" : "";
  /* 배지 */
  var got=Object.keys(s.bad).length; $("bcount").textContent=got+" / "+R.BADGES.length;
  $("badges").innerHTML=R.BADGES.map(function(b){ var on=!!s.bad[b[0]]; return '<div class="'+(on?"":"no")+'" title="'+b[2]+'"><span class="rbadge"><img src="art/'+b[3]+'.webp" alt=""></span>'+b[1]+'</div>'; }).join("");
  /* 스티커 */
  var STK=window.__STK||[]; $("scount").textContent=Object.keys(s.stk).length+" / "+STK.length;
  $("album").innerHTML=STK.map(function(n){ return '<img src="art/'+n+'.webp" alt="" class="'+(s.stk[n]?"":"no")+'">'; }).join("");
  R.gauge();
  var last2=Object.keys(s.days).filter(function(x){ return x!==d; }).sort().pop();
  $("say").textContent= !last2? k.name+", 반가워! 오늘은 뭐 하고 놀까?" : (s.days[d]? R.voc(k.name)+", 오늘 놀이 "+s.days[d]+"개 했어! 또 뭐 할까?" : R.voc(k.name)+", 잘 지냈어? 오늘도 신나게 놀아 보자!"); }
render(); if(!k) $("say").textContent="안녕! 먼저 이름을 알려 줘. 아래 노란 칸을 눌러 봐!";
R.timeStart();

/* 첫 손가락 터치 때 소리 깨우고 인사·쪽지 */
var woke=false;
document.addEventListener("pointerdown",function(){ if(woke) return; woke=true; try{ var c=new (window.AudioContext||window.webkitAudioContext)(); c.resume(); }catch(e){} if(k){ R.markVisit(); setTimeout(render,500); } },true);
$("mhear").onclick=function(){ hubSay("오늘의 미션! "+R.mission().t); };
$("mdone").onclick=function(){ if(R.missionDone()){ pose("cheer",2400); setTimeout(render,600); } };
Array.prototype.forEach.call(document.querySelectorAll("[data-life]"),function(b){ b.onclick=function(){ if(b.dataset.life==="wait") R.waitPick(); else R.lifeTimer(b.dataset.life); }; });
$("teach").onclick=function(){ R.teach(); };
$("color").onclick=function(){ R.colorOpen(); };
$("pet").onclick=function(){ var e=R.eggInfo(); hubSay(e.i===0? "똑똑! 알 속에서 뭔가 움직이는 것 같아. 놀이를 하면 깨어날 거야!" : e.i===1? "알이 꿈틀꿈틀! 곧 나올 것 같아!" : "안녕! 나는 "+R.voc(k?k.name:"")+"의 공룡이야. 같이 놀자!"); };
/* 다른 창(타이머·미션)이 닫히면 보물 다시 그리기 */
new MutationObserver(function(){ if(!document.querySelector(".rov")) render(); }).observe(document.body,{childList:true});
})();
