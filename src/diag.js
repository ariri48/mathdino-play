/* ---------- 수학 키 재기 (진단 놀이) ----------
   키즈 원리셈 진단평가지(5·6세~7·8세)가 보는 능력의 순서를 참고해 유아용으로 새로 만든 문제.
   문제·그림은 옮기지 않음. 한 단계에 2문제(1개만 맞으면 1문제 더), 맞히면 위로, 못 하면 멈춤. */
var DSTEPS=[
 {t:"1~3 세기", tier:0, g:"count", p:{icon:"apple",nums:[1,2,3]}},
 {t:"숫자만큼 모인 쪽 고르기 (1~3)", tier:0, g:"dmatch", p:{hi:3}},
 {t:"많은 쪽·적은 쪽 고르기", tier:0, g:"compare", p:{icon:"star"}},
 {t:"4~5 세기", tier:1, g:"count", p:{icon:"fish",nums:[4,5]}},
 {t:"말한 만큼 골라 담기 (5까지)", tier:1, g:"tapcount", p:{icon:"strawberry",nums:[3,4,5]}},
 {t:"몇째인지 알기", tier:1, g:"ordinal", p:{icon:"car"}},
 {t:"6~10 세기", tier:2, g:"count", p:{icon:"bean",nums:[6,7,8,9,10]}},
 {t:"다음 숫자 알기 (10까지)", tier:2, g:"dnext", p:{}},
 {t:"거꾸로 세기·0 알기", tier:2, g:"dbefore", p:{}},
 {t:"두 묶음 모으기 (5까지)", tier:1, g:"add", p:{icon:"cookie",probs:[[1,2],[2,2],[3,2],[1,4],[2,3]]}},
 {t:"덜어 내고 남은 수 (10까지)", tier:2, g:"subtract", p:{icon:"balloon",probs:[[6,2],[7,3],[8,4],[5,5]],verb:"날아갔어요"}},
 {t:"몇 개 더 있어야 할까", tier:2, g:"makeN", p:{n:7,icon:"egg"}},
 {t:"이어 세어 더하기 (10까지)", tier:3, g:"add", p:{icon:"apple",probs:[[3,4],[5,3],[4,4],[6,3]]}},
 {t:"두 숫자 크기 비교", tier:3, g:"dnumcmp", p:{}}
];
var DSTART=[0,2,5,7];
function dTierOf(h){ return h<3?0: h<7?1: h<12?2:3; } /* h = 통과한 단계 수 */
/* 진단 전용 문제 */
G.dmatch=function(p){ var n=rnd(1,p.hi||3), other; do{ other=rnd(1,p.hi||3); }while(other===n); var k=pick(["duck","ball","flower"]);
  txt(n,500,90,120,null,"#5b3fa8"); prompt(n+"개 있는 쪽을 눌러 줘");
  shuffle([n,other]).forEach(function(v,i){ var gp=g(); panel(80+i*450,150,390,300,gp); scatter(v,100+i*450,170,350,260,110).forEach(function(q){ icon(k,q.x,q.y,q.s,gp); });
    tap(gp,function(){ v===n? win() : miss(); }); }); };
G.dnext=function(p){ var n=rnd(1,8); prompt(n+" 다음에 오는 숫자는 뭘까?");
  [n,n+1,"?"].forEach(function(v,i){ var b=g(); setT(b,230+i*190,120); el("rect",{x:0,y:0,width:160,height:190,rx:26,"class":v==="?"?"qbox":"cell"},b); txt(v,80,128,100,b,v==="?"?"#5b3fa8":undefined); });
  choices(numChoices(n+2,1,10), n+2); };
G.dbefore=function(p){ var zero=!!DG&&DG.q===1, n=zero?1:rnd(3,9); var k="balloon";
  if(zero){ prompt("풍선이 1개 있었는데 1개가 날아갔어. 이제 몇 개야?"); icon(k,430,80,140); el("path",{d:"M560 120 q60 -40 90 -90",fill:"none",stroke:"#b9a3e8","stroke-width":6,"stroke-dasharray":"12 10"});
    choices(shuffle([0,1,2].slice(0,Math.max(2,NCH[TIER]))),0); return; }
  prompt("거꾸로 세어 볼까? "+n+" 바로 앞에 오는 숫자는 뭘까?");
  ["?",n].forEach(function(v,i){ var b=g(); setT(b,330+i*190,120); el("rect",{x:0,y:0,width:160,height:190,rx:26,"class":v==="?"?"qbox":"cell"},b); txt(v,80,128,100,b,v==="?"?"#5b3fa8":undefined); });
  choices(numChoices(n-1,0,10), n-1); };
G.dnumcmp=function(p){ var a,b; do{ a=rnd(2,9); b=rnd(2,9); }while(a===b); var small=Math.random()<0.5; prompt(small?"더 작은 숫자를 눌러 줘":"더 큰 숫자를 눌러 줘");
  [a,b].forEach(function(v,i){ var gp=g(); setT(gp,200+i*360,130); el("rect",{x:0,y:0,width:240,height:280,rx:40,"class":"choice"},gp); txt(v,120,190,180,gp);
    tap(gp,function(){ var ok= small? v===Math.min(a,b) : v===Math.max(a,b); ok? win() : miss(); }); }); };

var DG=null;
function diagStart(){ var k=curKid(); if(!k){ renderKids(); show("kids"); return; }
  var t=baseTier(months(k.ym)); DG={step:DSTART[t], q:0, ok:0, n:0, passed:{}, failed:{}, down:false, start:DSTART[t], total:0, saveTier:TIER};
  S.diag=true; S.book={no:0,title:"수학 키 재기",color:"#5b3fa8",levels:[]}; show("play"); $("ltitle").textContent="수학 키 재기"; $("play").style.setProperty("--c","#5b3fa8");
  S.rounds=12; S.round=0; updDots(); say("수학 키 재기를 해 볼까? 맞아도 틀려도 괜찮아. 생각나는 대로 눌러 줘!"); setTimeout(diagAsk,2600); }
function diagAsk(){ var st=DSTEPS[DG.step]; TIER=st.tier; S.lock=false; clear(); S.miss=0; S.hintFn=null; S.round=Math.min(DG.total,S.rounds-1); updDots();
  (G[st.g])(Object.assign({},st.p)); }
function diagAnswer(ok){ if(!DG) return; S.lock=true; ding(); bubble(ok?"좋아!":"알겠어!",ok?"yay":"yay"); buddyPose(ok?"cheer":"think",1100); DG.total++; DG.q++; if(ok) DG.ok++;
  var st=DG.step, done=null;
  if(DG.q>=2){ if(DG.ok===2) done=true; else if(DG.ok===0) done=false; else if(DG.q>=3) done=DG.ok>=2; }
  if(done!==null){ DG.q=0; DG.ok=0;
    if(done){ DG.passed[st]=1; if(DG.down||st+1>=DSTEPS.length) return diagEnd(); DG.step=st+1; }
    else { DG.failed[st]=1; var anyPass=Object.keys(DG.passed).length; if(!anyPass&&st>0&&!DG.down){ DG.down=true; DG.step=st-1; } else if(DG.down&&st>0&&!anyPass){ DG.step=st-1; } else return diagEnd(); } }
  if(DG.total>=16) return diagEnd();
  setTimeout(diagAsk,1300); }
function diagEnd(){ var k=curKid(), hi=-1, lo=99; Object.keys(DG.passed).forEach(function(x){ hi=Math.max(hi,+x); }); Object.keys(DG.failed).forEach(function(x){ lo=Math.min(lo,+x); });
  var h= hi>=0? hi+1 : (lo===99?0:lo); /* 시작 단계보다 쉬운 단계는 해낸 것으로 봄 */
  var rec=dTierOf(h); S.diag=false; TIER=DG.saveTier; setTimeout(function(){ S.lock=false; },50);
  var o=all(); if(k){ k.diag={d:new Date().toISOString().slice(0,10), h:h, rec:rec}; saveAll(o); }
  var L=$("dlist"); L.innerHTML=""; DSTEPS.forEach(function(s,i){ if(i>h+1) return; var li=document.createElement("li"); var ok=i<h, f=DG.failed[i]; li.className=ok?"ok":f?"try":"next"; li.innerHTML='<b>'+(ok?"잘해요":f?"연습해요":"다음에 배워요")+'</b>'+s.t; L.appendChild(li); });
  $("drec").textContent=TIERNAME[rec]; $("ddesc").textContent=TIERDESC[rec]; $("dnow").textContent= k? "지금은 "+TIERNAME[kidTier(k)]+" 단계예요." : "";
  $("dapply").hidden= !k || kidTier(k)===rec;
  show("diagres"); applause(); burst(); buddyPose("crown",4000);
  say((k?k.name+", ":"")+"수학 키 재기 끝! 정말 멋진데~? 오늘은 "+TIERNAME[rec]+" 만큼 자랐어!",300); DG=null; }
