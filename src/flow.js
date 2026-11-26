/* ---------- 아이 프로필 ---------- */
var PKEY="mathdino-play-v2", OLDKEY="mathdino-play-v1";
var TIERNAME=["아기 공룡","꼬마 공룡","씩씩 공룡","대장 공룡"];
var TIERDESC=["숫자 1~3 · 2개 중에 고르기 · 틀리면 바로 힌트","숫자 1~5 · 3개 중에 고르기","숫자 1~10 · 3개 중에 고르기","더 큰 수(최대 20) · 4개 중에 고르기 · 힌트 없음"];
function loadAll(){ var o=null; try{ o=JSON.parse(localStorage.getItem(PKEY)); }catch(e){}
  if(!o||!o.kids){ o={kids:[],cur:null,prog:{}}; try{ var old=JSON.parse(localStorage.getItem(OLDKEY)); if(old&&Object.keys(old).length) o.legacy=old; }catch(e){} }
  return o; }
function saveAll(o){ try{ localStorage.setItem(PKEY,JSON.stringify(o)); }catch(e){} MEM=o; }
var MEM=null;
function all(){ if(!MEM) MEM=loadAll(); return MEM; }
function curKid(){ var o=all(); return o.kids.filter(function(k){ return k.id===o.cur; })[0]||null; }
function progKey(){ var P=window.__PROG||"mathdino"; return P==="mathdino"? "prog" : "prog_"+P+(P==="words"?"_"+S.lang:""); }
function loadP(){ var o=all(), k=progKey(); return (o.cur&&o[k]&&o[k][o.cur])||{}; }
function saveP(p){ var o=all(), k=progKey(); if(!o.cur) return; o[k]=o[k]||{}; o[k][o.cur]=p; saveAll(o); }
function months(ym){ var a=String(ym).split("-"), d=new Date(); return (d.getFullYear()-(+a[0]))*12+(d.getMonth()+1-(+a[1])); }
function baseTier(m){ return m<36?0: m<48?1: m<60?2:3; }
function kidTier(k){ return Math.max(0,Math.min(3,baseTier(months(k.ym))+(k.adj||0))); }
function applyKid(){ var k=curKid(); TIER= k? kidTier(k) : 2; OV= k? {nch:k.nch||0, hint:k.hint||0, rounds:k.rounds||0} : {}; var c=$("kidchip");
  if(c) c.innerHTML= k? '<b>'+esc(k.name)+'</b><span>'+months(k.ym)+'개월 · '+TIERNAME[TIER]+'</span><i>바꾸기</i>' : '<b>누가 놀까?</b><i>고르기</i>'; }
function esc(t){ return String(t).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

function renderVoicePick(){ var sel=$("vSel"); if(!sel) return; pickVoice(); var vs=goodVoices("ko").sort(function(a,b){ return rankVoice(a)-rankVoice(b); }); sel.innerHTML="";
  if(!vs.length){ var o0=document.createElement("option"); o0.textContent="한국어 음성이 없어요"; sel.appendChild(o0); return; }
  vs.forEach(function(v){ var op=document.createElement("option"); op.value=v.name; op.textContent=v.name.replace(/\s*\(.*?\)\s*/g," ").trim(); if(S.voice&&v.name===S.voice.name) op.selected=true; sel.appendChild(op); }); }
function renderKids(){ renderVoicePick(); var o=all(), box=$("kidlist"); box.innerHTML="";
  o.kids.forEach(function(k){ var t=kidTier(k), m=months(k.ym); var d=document.createElement("div"); d.className="kid"+(k.id===o.cur?" on":"");
    d.innerHTML='<div class="kav" data-kav></div><button class="kpick" type="button"><b>'+esc(k.name)+'</b><span>'+m+'개월 · '+TIERNAME[t]+'</span><small>'+TIERDESC[t]+'</small></button>'+
      '<p class="adjnote">난이도는 부모님 메뉴의 \'놀이 조절\'에서 바꿔요</p>'+
      '<div class="seg small kvk" role="group" aria-label="목소리"><button type="button" data-vk="girl">여자아이 목소리</button><button type="button" data-vk="boy">남자아이 목소리</button></div>'+
      '<div class="krow"><button class="kav-btn" type="button">'+(avLoad(k.id)?"캐릭터 바꾸기":"캐릭터 만들기")+'</button>'+(k.diag?'<span class="kdiag">수학 키 재기 '+k.diag.d+' · '+TIERNAME[k.diag.rec]+'</span>':'')+'<button class="kdel" type="button">지우기</button></div>';
    d.querySelector("[data-kav]").innerHTML=avatarSVG(avLoad(k.id)||{suit:k.suit||0},"pose-idle"); d.querySelector(".kav-btn").addEventListener("click",function(){ avEditOpen(k); });
    Array.prototype.forEach.call(d.querySelectorAll(".kvk button"),function(b){ if(b.dataset.vk===(k.vk||"girl")) b.classList.add("on");
      b.addEventListener("click",function(){ k.vk=b.dataset.vk; saveAll(o); if(k.id===o.cur) renderBuddies(); renderKids(); hearKind(k.vk, k.name+", 같이 놀자!"); }); });
    d.querySelector(".kpick").addEventListener("click",function(){ o.cur=k.id; saveAll(o); applyKid(); renderHome(); show("home"); say(voc(k.name)+", 같이 놀자!"); });
    d.querySelector(".kdel").addEventListener("click",function(){ if(!confirm(k.name+" 기록을 지울까요? 성공한 놀이 기록도 함께 지워져요.")) return; o.kids=o.kids.filter(function(x){ return x!==k; }); delete o.prog[k.id]; if(o.cur===k.id) o.cur=o.kids[0]?o.kids[0].id:null; saveAll(o); applyKid(); renderKids(); });
    box.appendChild(d); });
  $("kidsBack").hidden=!o.kids.length; $("kidsTitle").textContent=o.kids.length?"누가 놀까?":"아이를 등록해 주세요"; }
(function initForm(){ var y=$("ky"), mo=$("km"), now=new Date(); for(var i=0;i<=8;i++){ var v=now.getFullYear()-i; var op=document.createElement("option"); op.value=v; op.textContent=v+"년"; y.appendChild(op); }
  y.value=now.getFullYear()-3; for(var m=1;m<=12;m++){ var op2=document.createElement("option"); op2.value=m; op2.textContent=m+"월"; mo.appendChild(op2); } mo.value=now.getMonth()+1;
  function prev(){ var ym=y.value+"-"+mo.value, m=months(ym); $("kprev").textContent= m<0? "날짜를 다시 골라 주세요" : m+"개월 → "+TIERNAME[baseTier(m)]+" 단계로 시작해요"; }
  y.addEventListener("change",prev); mo.addEventListener("change",prev); prev();
  $("kadd").addEventListener("submit",function(e){ e.preventDefault(); var name=$("kn").value.trim()||"우리 아이"; var ym=y.value+"-"+mo.value; if(months(ym)<0) return;
    var o=all(), id="k"+Date.now().toString(36); o.kids.push({id:id,name:name.slice(0,12),ym:ym,adj:0,vk:$("kvk").value});
    if(o.legacy&&o.kids.length===1){ o.prog[id]=o.legacy; delete o.legacy; } else o.prog[id]={};
    o.cur=id; saveAll(o); $("kn").value=""; applyKid(); renderHome();
    /* 등록하자마자 얼굴 사진으로 주인공 캐릭터 만들기 */
    var nk=o.kids[o.kids.length-1]; avEditOpen(nk); AE.onboard=true; $("avOnboard").hidden=false; $("avOnboard").textContent="얼굴 사진을 찍으면 "+name+"의 얼굴로 공룡 옷을 입은 주인공 캐릭터가 생겨요. 지금 안 해도 돼요. 나중에 '← 돌아가기'를 누르면 바로 놀 수 있어요.";
    say(voc(name)+", 반가워! 얼굴 사진을 찍으면 네가 이 놀이터의 주인공이 돼!"); if(window.ROOM) ROOM.markVisit(); });
})();

/* ---------- 화면 흐름 ---------- */
function show(id){ ["home","book","play","done","kids","scan","avedit","diagres"].forEach(function(s){ $(s).hidden = s!==id; }); document.body.dataset.view=id; window.scrollTo(0,0); var fx=$("fx"); if(fx) fx.innerHTML=""; if(id!=="scan") stopCam(); }
function renderHome(){ var P=loadP(), box=$("shelf"); box.innerHTML="";
  DATA.books.forEach(function(b){ var st=P[b.no]||[]; var n=st.filter(Boolean).length; var a=document.createElement("button"); a.className="bk"; a.style.setProperty("--c",b.color);
    a.innerHTML='<svg class="stk" viewBox="0 0 100 100" aria-hidden="true"><use href="#g-'+bookIcon(b)+'"/></svg><span class="no">'+b.no+'</span><span class="bt">'+b.title+'</span>'+(b.concept?'<span class="bc">'+b.concept+'</span>':'')+'<span class="pips">'+[0,1,2,3,4].map(function(i){ return '<i class="'+(st[i]?"on":"")+'"></i>'; }).join("")+'</span>'+(n===5?'<span class="crown">완주</span>':'');
    a.addEventListener("click",function(){ openBook(b); }); box.appendChild(a); });
  var tot=0; Object.keys(P).forEach(function(k){ tot+=P[k].filter(Boolean).length; }); $("total").textContent=tot; $("totmax").textContent=DATA.books.length*5; applyKid(); renderBuddies(); if(typeof renderLangTabs==="function"){ $("langtabs").hidden=false; renderLangTabs(); }
  var k=curKid(), done=Object.keys(P).filter(function(x){ return (P[x]||[]).filter(Boolean).length===5; }).length;
  $("greet").textContent= !k? "안녕! 누가 놀까?" : (S.greet&&S.greet.id===k.id&&S.greet.t)? voc(k.name)+", "+S.greet.t : tot===0? "안녕, "+k.name+"! 나랑 같이 "+(CFG.play||"수학 놀이")+" 하자!" : k.name+", 지금까지 놀이 "+tot+"개 성공"+(done? ", 책 "+done+"권 완주" : "")+"! 오늘은 어떤 책을 읽었어?";
  $("diagBtn").querySelector("small").textContent= k&&k.diag? "지난번 "+k.diag.d+" · "+TIERNAME[k.diag.rec]+" · 다시 해 볼까요?" : "몇 문제 풀면 알맞은 단계를 알려 줘요"; }
var GICON={pairs:"sock",clock:"clock",calendar:"book",maze:"dino",puzzle:"triangle",shapefind:"circle",pattern:"star",coins:"coin",heavy:"rock",length:"pencil",measure:"bean",area:"square",graph:"apple",dots:"star",sort:"basket",routine:"sun",position:"bear",leftright:"heart",size:"dino",inout:"ball",draw:"flower",trace:"pencil",numorder:"balloon",findnum:"star",bingo:"star",ordinal:"car",order:"bear",share:"cookie",hidden:"mosquito",frame:"circle",compare:"ghost",add:"apple",subtract:"balloon",makeN:"cookie",count:"bean",tapcount:"apple"};
function bookIcon(b){ if(b.words){ var w=b.words.filter(function(x){ return x.icon; })[0]; return w? w.icon : (b.words[0].color? "flower" : "balloon"); }
  for(var i=0;i<b.levels.length;i++){ var p=b.levels[i].p||{}; if(p.icon) return p.icon; if(p.animals) return p.animals[0]; if(p.start) return p.start; } return GICON[b.levels[0].g]||"star"; }
function openBook(b){ S.book=b; var P=loadP(), st=P[b.no]||[]; $("bno").textContent=(CFG.unit||"책")+" "+String(b.no).padStart(2,"0"); $("btitle").textContent=b.title; $("book").style.setProperty("--c",b.color);
  var L=$("levels"); L.innerHTML=""; b.levels.forEach(function(lv,i){ var a=document.createElement("button"); a.className="lv"+(st[i]?" clear":""); a.innerHTML='<span class="ln">'+(i+1)+'</span><span class="lt">'+lv.name+'</span><span class="ls">'+(st[i]?"★ 성공":"놀러 가기")+'</span>'; a.addEventListener("click",function(){ startLevel(i); }); L.appendChild(a); });
  show("book"); say(b.title+"! 어떤 놀이를 할까?"); }
function updDots(){ var d=$("dots"); d.innerHTML=""; for(var i=0;i<S.rounds;i++){ var x=document.createElement("i"); if(i<S.round) x.className="on"; d.appendChild(x); } var tb=$("tbud"); if(tb) tb.style.setProperty("--p", S.rounds? Math.min(1,S.round/S.rounds) : 0); }
/* 아기 단계에서 어려운 놀이는 쉬운 놀이로 바꿔 줌 */
var SWAP0={ bingo:function(lv){ return lv.p&&lv.p.kind==="shape"?"shapefind":"findnum"; }, calendar:"findnum", clock:"routine", graph:"compare" };
function gameFor(lv){ var s=TIER===0&&SWAP0[lv.g]; if(!s) return lv.g; return typeof s==="function"? s(lv) : s; }
function startLevel(i){ S.li=i; S.round=0; S.lock=false; show("play"); var lv=S.book.levels[i]; $("ltitle").textContent=lv.name; $("play").style.setProperty("--c",S.book.color); S.rounds = ONE_ROUND[lv.g]?1:(OV.rounds||ROUNDS[TIER]); updDots(); playRound(); }
function playRound(){ if(S.diag||!S.book||!S.book.levels[S.li]) return; clear(); S.miss=0; S.hintFn=null; S.againFn=null; var lv=S.book.levels[S.li], gn=gameFor(lv); (G[gn]||G.count)(gn===lv.g?(lv.p||{}):{}); idleArm(); ansBar(); }
/* 숫자 고르기 문제는 손뼉이나 말로도 대답할 수 있어요 */
function ansBar(){ var on=window.ROOM&&Object.keys(S.nch||{}).length>0; $("ansbar").hidden=!(on&&(ROOM.canClap()||ROOM.canListen())); if(on){ $("ansClap").hidden=!ROOM.canClap(); $("ansMic").hidden=!ROOM.canListen()||!!window.__NOMIC; } }
function ansPick(nums, heard){ if(S.lock) return; var hit=nums.filter(function(n){ return S.nch[n]; })[0];
  if(hit!==undefined){ S.nch[hit](); return; }
  if(heard===undefined&&nums.length&&nums[0]>0){ bubble("손뼉 "+nums[0]+"번!","oops"); say("손뼉을 "+nums[0]+"번 쳤어! 다시 세어 볼까?"); return; }
  say("잘 못 들었어. 한 번 더 말해 줄래?"); }
$("ansClap").addEventListener("click",function(){ ROOM.claps(function(n){ ansPick([n]); }); });
$("ansMic").addEventListener("click",function(){ ROOM.listen("ko-KR",function(nums,t){ ansPick(nums,t); }); });
function levelDone(){ var P=loadP(); var st=P[S.book.no]||[false,false,false,false,false]; st[S.li]=true; P[S.book.no]=st; saveP(P);
  show("done"); $("done").style.setProperty("--c",S.book.color); var all_=st.filter(Boolean).length; $("dmsg").textContent= all_===5? "책 한 권 완주! 포도알 하나 칠하자!" : "놀이 성공! "+all_+" / 5";
  applause(); burst(); buddyPose(all_===5?"crown":"cheer",4000); say(all_===5?"우와! 책 한 권을 다 했어! 정말 멋진데~?":"놀이 성공! 정말 멋진데~?",200); bragTalk();
  if(window.ROOM&&curKid()){ var rw=ROOM.onLevelDone({all5:all_===5}), t=ROOM.showReward(rw,$("dreward")); if(!ROOM.checkTired()&&Math.random()<0.25) setTimeout(function(){ if(document.body.dataset.view==="done") ROOM.party(); },Math.max(4200,t+600)); } else $("dreward").innerHTML="";
  $("dnext").hidden = S.li>=S.book.levels.length-1; }

/* ---------- 책 찍기 (표지 인식) ---------- */
var SC={ ready:false, loading:null, model:null, refs:null, stream:null, timer:null, votes:[], facing:"user", t0:0, warned:false };
function loadScript(src){ return new Promise(function(res,rej){ var s=document.createElement("script"); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }
function scanPrepare(){ if(SC.loading) return SC.loading;
  SC.loading=(window.tf? Promise.resolve() : loadScript("vendor/tf.min.js")).then(function(){ return Promise.all([ tf.loadGraphModel("model/mobilenet_v2_100_224/model.json"), fetch("data/refs.bin").then(function(r){ if(!r.ok) throw new Error("refs"); return r.arrayBuffer(); }) ]); })
    .then(function(r){ SC.model=r[0]; var buf=new Uint8Array(r[1]), dv=new DataView(r[1]), D=1280, rec=D+5, n=buf.length/rec; SC.refs=[];
      for(var i=0;i<n;i++){ var o=i*rec, sc=dv.getFloat32(o+1,true), v=new Float32Array(D), nn=0; for(var j=0;j<D;j++){ v[j]=buf[o+5+j]*sc; nn+=v[j]*v[j]; } nn=Math.sqrt(nn)||1; for(j=0;j<D;j++) v[j]/=nn; SC.refs.push({b:buf[o],e:v}); }
      tf.tidy(function(){ SC.model.predict(tf.zeros([1,224,224,3])); }); SC.ready=true; })
    .catch(function(e){ SC.loading=null; throw e; });
  return SC.loading; }
function embed(c){ return tf.tidy(function(){ var t=tf.browser.fromPixels(c).toFloat().div(255); t=tf.image.resizeBilinear(t,[224,224]).expandDims(0); var e=SC.model.predict(t); e=e.div(e.norm()); return e.dataSync().slice(); }); }
function embedTTA(c){ var e1=embed(c), c2=document.createElement("canvas"); c2.width=250; c2.height=300; c2.getContext("2d").drawImage(c,25,30,200,240,0,0,250,300); var e2=embed(c2), n=0, i;
  for(i=0;i<e1.length;i++){ e1[i]+=e2[i]; n+=e1[i]*e1[i]; } n=Math.sqrt(n)||1; for(i=0;i<e1.length;i++) e1[i]/=n; return e1; }
function matchBook(e){ var best={}; SC.refs.forEach(function(r){ var s=0, v=r.e; for(var j=0;j<v.length;j++) s+=e[j]*v[j]; if(!(best[r.b]>=s)) best[r.b]=s; });
  var srt=Object.keys(best).map(function(k){ return [+k,best[k]]; }).sort(function(a,b){ return b[1]-a[1]; }); return {b:srt[0][0], s:srt[0][1], m:srt[0][1]-srt[1][1]}; }
function grabBox(){ var v=$("cam"), W=v.clientWidth, H=v.clientHeight, vw=v.videoWidth, vh=v.videoHeight; if(!vw) return null;
  var sc=Math.max(W/vw,H/vh), ox=(W-vw*sc)/2, oy=(H-vh*sc)/2, r=$("guide").getBoundingClientRect(), vr=v.getBoundingClientRect();
  var bx=r.left-vr.left, by=r.top-vr.top; if(SC.facing==="user") bx=W-bx-r.width; /* 화면은 거울처럼 보이고 실제 영상은 반대 */
  var c=document.createElement("canvas"); c.width=250; c.height=300; c.getContext("2d").drawImage(v,(bx-ox)/sc,(by-oy)/sc,r.width/sc,r.height/sc,0,0,250,300); return c; }
function found(no){ stopCam(); var b=DATA.books.filter(function(x){ return x.no===no; })[0]; if(!b) return; ding(); burst(); bubble("찾았다!","yay"); $("scanmsg").textContent="『"+b.title+"』 찾았다!";
  say("『"+b.title+"』 찾았다! 같이 놀아 볼까?"); setTimeout(function(){ openBook(b); say("『"+b.title+"』 찾았다! 어떤 놀이를 할까?"); },1300); }
function scanTick(){ if(!SC.stream) return; var c=grabBox(); if(c){ var r=matchBook(embedTTA(c)); SC.votes.push(r); if(SC.votes.length>3) SC.votes.shift();
    var v=SC.votes, last=v.length>=2&&v[v.length-1].b===v[v.length-2].b;
    if((r.s>=0.80&&r.m>=0.06)||(last&&r.s>=0.68&&v[v.length-2].s>=0.68&&r.m>=0.02)){ found(r.b); return; }
    if(!SC.warned&&performance.now()-SC.t0>9000){ SC.warned=true; $("scanmsg").textContent="책 앞표지를 네모 안에 꽉 차게 보여 줘"; say("잘 안 보여. 책 앞표지를 네모 안에 꽉 차게 보여 줄래?"); } }
  SC.timer=setTimeout(scanTick,350); }
function stopCam(){ clearTimeout(SC.timer); if(SC.stream){ SC.stream.getTracks().forEach(function(t){ t.stop(); }); SC.stream=null; } var v=$("cam"); if(v) v.srcObject=null; }
function startCam(){ stopCam(); SC.votes=[]; SC.warned=false; var v=$("cam"); v.classList.toggle("mirror",SC.facing==="user");
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){ $("scanmsg").textContent="이 화면에서는 카메라를 쓸 수 없어요. 아래 '사진 찍기'를 눌러 주세요."; return; }
  navigator.mediaDevices.getUserMedia({video:{facingMode:SC.facing,width:{ideal:1280},height:{ideal:960}},audio:false}).then(function(st){ if(document.body.dataset.view!=="scan"){ st.getTracks().forEach(function(t){ t.stop(); }); return; }
    SC.stream=st; v.srcObject=st; v.play(); $("scanmsg").textContent="책 앞표지를 네모 안에 보여 줘!"; SC.t0=performance.now(); SC.timer=setTimeout(scanTick,700); })
  .catch(function(){ $("scanmsg").textContent="카메라를 켤 수 없어요. 아래 '사진 찍기'를 눌러 주세요."; }); }
function openScan(){ show("scan"); $("scanmsg").textContent="책 찾는 공룡을 깨우는 중이에요…"; say("읽은 책을 보여 줘! 책 앞표지를 네모 안에 보여 줘");
  scanPrepare().then(function(){ if(document.body.dataset.view==="scan") startCam(); }).catch(function(){ $("scanmsg").textContent="책 찾기 준비를 못 했어요. 인터넷 연결을 확인하거나 목록에서 골라 주세요."; }); }
function fromPhoto(file){ var im=new Image(), url=URL.createObjectURL(file); im.onload=function(){ URL.revokeObjectURL(url); scanPrepare().then(function(){
    var iw=im.naturalWidth, ih=im.naturalHeight, w=Math.min(iw,ih*250/300)*0.9, h=w*300/250; var c=document.createElement("canvas"); c.width=250; c.height=300; c.getContext("2d").drawImage(im,(iw-w)/2,(ih-h)/2,w,h,0,0,250,300);
    var r=matchBook(embedTTA(c)); if(r.s>=0.64&&r.m>=0.015) found(r.b); else { boing(); $("scanmsg").textContent="어떤 책인지 모르겠어요. 앞표지가 꽉 차게 다시 찍어 주세요."; say("음… 어떤 책인지 모르겠어. 다시 찍어 줄래?"); } }); }; im.src=url; }

$("startBtn").addEventListener("click",function(){ ac(); pickVoice(); $("gate").hidden=true; var o=all(); renderBuddies(); if(window.ROOM&&curKid()) ROOM.markVisit();
  var hs=location.hash; if(hs==="#kids"||(hs==="#avatar"&&!curKid())){ history.replaceState(null,"",location.pathname); renderKids(); show("kids"); say("아이를 고르거나 새로 등록해 주세요"); return; }
  if(hs==="#avatar"){ history.replaceState(null,"",location.pathname); avEditOpen(curKid()); say("얼굴 사진을 찍어서 주인공 캐릭터를 만들어 보자!"); return; }
  if(!o.kids.length){ renderKids(); show("kids"); say(CFG.title+"에 온 걸 환영해! 먼저 이름을 알려 줘"); }
  else { var k=curKid(), gl=k?greetLine(k):null; S.greet=k?{id:k.id,t:gl}:null; if(k) markSeen(k); renderHome(); show("home");
    say(gl? voc(k.name)+", "+gl : (k?k.name+", ":"")+CFG.title+"에 온 걸 환영해! "+(CFG.ask||"책을 골라 볼까?")); } });
$("kidchip").addEventListener("click",function(){ renderKids(); show("kids"); });
$("vSel").addEventListener("change",function(){ try{ localStorage.setItem("goyu-voice-ko",this.value); }catch(e){} pickVoice(); VC.force="none"; say("안녕! 이 목소리 어때?"); VC.force=null; });
$("vHear").addEventListener("click",function(){ VC.force="none"; say("안녕! 나랑 같이 놀자!"); VC.force=null; });
$("kidsBack").addEventListener("click",function(){ renderHome(); show("home"); });
$("scanBtn").addEventListener("click",openScan);
$("diagBtn").addEventListener("click",diagStart);
$("dapply").addEventListener("click",function(){ var o=all(), k=curKid(); if(!k||!k.diag) return; k.adj=k.diag.rec-baseTier(months(k.ym)); saveAll(o); applyKid(); renderHome(); show("home"); say(TIERNAME[TIER]+" 단계로 바꿨어! 같이 놀자!"); });
$("dhome2").addEventListener("click",function(){ renderHome(); show("home"); });
$("scanBack").addEventListener("click",function(){ renderHome(); show("home"); });
$("scanFlip").addEventListener("click",function(){ SC.facing= SC.facing==="user"?"environment":"user"; if(SC.ready) startCam(); });
$("scanFile").addEventListener("change",function(){ if(this.files&&this.files[0]) fromPhoto(this.files[0]); this.value=""; });
$("toHome").addEventListener("click",function(){ renderHome(); show("home"); });
$("backBook").addEventListener("click",function(){ speechSynthesis&&speechSynthesis.cancel(); if(S.diag){ S.diag=false; DG=null; TIER=curKid()?kidTier(curKid()):2; renderHome(); show("home"); return; } openBook(S.book); });
$("again").addEventListener("click",function(){ if(S.againFn) S.againFn(); else say(S.prompt||""); });
$("dnext").addEventListener("click",function(){ startLevel(S.li+1); });
$("dbook").addEventListener("click",function(){ openBook(S.book); });
$("dhome").addEventListener("click",function(){ renderHome(); show("home"); });
$("dbrag").addEventListener("click",function(){ if(window.ROOM) ROOM.brag(); });
$("dteach").addEventListener("click",function(){ if(window.ROOM) ROOM.teach(); });
if(window.ROOM){ ROOM.fx={say:function(t){ say(t); },avatarSVG:avatarSVG,curAv:curAv,S:S,clipStop:clipStop,
    /* 엄마가 놀이 조절에서 값을 바꾸면 바로 반영하고, 놀던 문제는 새 설정으로 다시 내요 */
    onAdjust:function(){ MEM=null; applyKid(); if(document.body.dataset.view==="play"&&!S.diag&&S.book){ var lv=S.book.levels[S.li]; S.rounds=ONE_ROUND[lv.g]?1:(OV.rounds||ROUNDS[TIER]); if(S.round>=S.rounds) S.round=S.rounds-1; updDots(); S.lock=false; playRound(); } else if(document.body.dataset.view==="home") renderHome(); },
    play:{ skip:function(){ S.lock=false; S.round++; updDots(); if(S.round>=S.rounds) levelDone(); else playRound(); },
      restart:function(){ startLevel(S.li); }, pass:function(){ S.lock=false; levelDone(); },
      home:function(){ try{ speechSynthesis.cancel(); }catch(e){} renderHome(); show("home"); } } }; ROOM.applyColors(); ROOM.gauge(); }
$("mute").addEventListener("click",function(){ S.muted=!S.muted; this.setAttribute("aria-pressed",S.muted); this.textContent=S.muted?"소리 켜기":"소리 끄기"; if(S.muted) try{speechSynthesis.cancel();}catch(e){} });
document.addEventListener("gesturestart",function(e){ e.preventDefault(); });
if(window.__NOSCAN) $("scanBtn").hidden=true; if(window.__NODIAG) $("diagBtn").hidden=true; if(window.__NOHUB) Array.prototype.forEach.call(document.querySelectorAll(".tohub"),function(a){ a.hidden=true; });
renderHome(); show("home");
window.__G=G; window.__T={missFn:miss,winFn:win,LINES:LINES,DSTEPS:DSTEPS,G:G,CFG:CFG,TIERNAME:TIERNAME,clear:clear,DG:function(){ return DG; },avEditOpen:avEditOpen,AE:AE,renderBuddies:renderBuddies,openBook:openBook,startLevel:startLevel,S:S,playRound:playRound,setTier:function(t){ TIER=t; },matchBook:function(c){ return matchBook(embedTTA(c)); },scanPrepare:scanPrepare,fromPhoto:fromPhoto};
})();
