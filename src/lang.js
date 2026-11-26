/* ---------- 말놀이: 영어·일본어·중국어 ---------- */
var LANGS={ en:{name:"영어",tag:"en-US",praise:"Great job!",hi:"Hello!"}, ja:{name:"일본어",tag:"ja-JP",praise:"すごいね!",hi:"こんにちは!"}, zh:{name:"중국어",tag:"zh-CN",praise:"真棒!",hi:"你好!"} };
S.lang=(function(){ try{ return localStorage.getItem("goyu-lang")||"en"; }catch(e){ return "en"; } })();
ONE_ROUND.lcards=1;
var LVOICE=window.LVOICE={};
function pickLVoice(tag){ if(LVOICE[tag]===undefined) LVOICE[tag]=bestVoice(tag.slice(0,2).toLowerCase(), null); return LVOICE[tag]; }
function _oldPickLVoice(tag){ if(LVOICE[tag]!==undefined) return LVOICE[tag]; try{ var p=tag.slice(0,2), vs=speechSynthesis.getVoices().filter(function(v){ return v.lang.replace("_","-").toLowerCase().indexOf(p)===0; });
  var exact=vs.filter(function(v){ return v.lang.replace("_","-")===tag; }); var list=exact.length?exact:vs; LVOICE[tag]=list.filter(function(v){ return /samantha|kyoko|tingting|ting-ting|google|female/i.test(v.name); })[0]||list[0]||null; }catch(e){ LVOICE[tag]=null; } return LVOICE[tag]; }
function sayL(text, delay, keep){ if(window.__sayHook) __sayHook(text,S.lang); if(S.muted) return; var go=function(){ var c=clipFor(text,S.lang); if(c){ clipPlay(c,keep); return; } if(!keep) clipStop(); try{ if(!keep) speechSynthesis.cancel(); var L=LANGS[S.lang], u=new SpeechSynthesisUtterance(text); u.lang=L.tag; var v=pickLVoice(L.tag); if(v) u.voice=v; u.rate=0.85; u.pitch=1.0;
  u.onstart=function(){ talk(true); }; u.onend=u.onerror=function(){ talk(false); }; speechSynthesis.speak(u); }catch(e){} }; if(delay) setTimeout(go,delay); else go(); }
function wt(w){ return w[S.lang][0]; }      /* 그 나라 글자 */
function wr(w){ return w[S.lang][1]; }      /* 한글로 읽는 법 */
function words(){ return S.book.words; }
function allWords(){ var o=[], seen={}; DATA.books.forEach(function(b){ if(b.no<=S.book.no) b.words.forEach(function(w){ if(!seen[w.k]){ seen[w.k]=1; o.push(w); } }); }); return o; }
/* 그림 그리기: 아이콘 / 색 동그라미 / 숫자 */
function wpic(w,x,y,s,parent){ var gp=g(parent); setT(gp,x,y);
  if(w.icon) icon(w.icon,0,0,s,gp);
  else if(w.color) { el("circle",{cx:s/2,cy:s/2,r:s*0.42,fill:w.color,stroke:"#3b2f2a","stroke-width":5},gp); el("ellipse",{cx:s*0.36,cy:s*0.34,rx:s*0.1,ry:s*0.06,fill:"rgba(255,255,255,.55)"},gp); }
  else if(w.num){ txt(w.num,s/2,s*0.62,s*0.62,gp,"#5b3fa8"); if(TIER<=1&&w.num<=5){ for(var i=0;i<w.num;i++) el("circle",{cx:s/2-(w.num-1)*s*0.09+i*s*0.18,cy:s*0.86,r:s*0.06,fill:"#ffc83d",stroke:"#3b2f2a","stroke-width":2},gp); } }
  return gp; }
function pickN(arr,n,must){ var rest=shuffle(arr.filter(function(w){ return w!==must; })).slice(0,n-(must?1:0)); if(must) rest.push(must); return shuffle(rest); }
function langWin(w){ good(); sayL(wt(w)); setTimeout(win,1100); }
/* 1. 말 배우기: 카드 한 장씩 보고 듣기 */
G.lcards=function(p){ var ws=words().slice(0,T([4,6,99,99])), i=0;
  function showCard(){ clear(); var w=ws[i]; panel(250,20,500,560); var pic=wpic(w,370,50,260); tap(pic,function(){ sayL(wt(w)); pic.classList.remove("pop"); void pic.getBBox(); pic.classList.add("pop"); });
    txt(wt(w),500,390,84,null,"#3b2f2a"); txt("["+wr(w)+"]",500,450,40,null,"#7a6b62"); txt(w.ko,500,520,44,null,"#5b3fa8");
    txt((i+1)+" / "+ws.length,880,560,32,null,"#b3a69c");
    var nb=g(); setT(nb,790,250); el("rect",{x:0,y:0,width:180,height:120,rx:40,"class":"choice"},nb); txt(i<ws.length-1?"다음 ▶":"다 했어!",90,78,40,nb);
    tap(nb,function(){ if(i<ws.length-1){ i++; showCard(); } else win(); });
    if(i>0){ var pb=g(); setT(pb,30,250); el("rect",{x:0,y:0,width:180,height:120,rx:40,"class":"choice"},pb); txt("◀ 앞",90,78,40,pb); tap(pb,function(){ i--; showCard(); }); }
    $("ptext").textContent=w.ko+(jong(w.ko)?"은 ":"는 ")+LANGS[S.lang].name+"로?"; S.prompt=$("ptext").textContent; S.againFn=function(){ sayL(wt(w)); }; say(w.ko+(jong(w.ko)?"은 ":"는 ")+LANGS[S.lang].name+"로",100); sayL(wt(w),1300,true); sayL(wt(w),2600,true); }
  showCard(); };
/* 2. 듣고 고르기 */
function listenPick(pool, showText){ var n=Math.min(nch()+(TIER>=2?1:0),pool.length,4), w=pick(pool), opts=pickN(pool,n,w), cw=Math.min(220,900/n-20), x0=500-(n*(cw+20)-20)/2;
  opts.forEach(function(o,i){ var b=g(); setT(b,x0+i*(cw+20),140); el("rect",{x:0,y:0,width:cw,height:cw+(showText?70:0),rx:30,"class":"card"},b); wpic(o,cw*0.1,cw*0.08,cw*0.8,b); if(showText) txt(wt(o),cw/2,cw+40,34,b);
    if(o===w) setHint(function(){ hintNode(b); });
    tap(b,function(){ if(o===w){ b.classList.add("found"); langWin(w); } else { miss("그건 "+o.ko+"야"); sayL(wt(o),1600,true); } }); });
  $("ptext").textContent="잘 듣고 맞는 그림을 눌러 줘"; S.prompt=$("ptext").textContent; S.againFn=function(){ sayL(wt(w)); }; say(S.prompt,100); sayL(wt(w),1700,true);
  var sp=g(); setT(sp,440,470); el("rect",{x:0,y:0,width:120,height:100,rx:30,fill:"#ffc83d"},sp); el("path",{d:"M30 38h14l18-14v52l-18-14H30z",fill:"#3b2f2a"},sp); el("path",{d:"M72 36q10 14 0 28M80 28q18 22 0 44",fill:"none",stroke:"#3b2f2a","stroke-width":5,"stroke-linecap":"round"},sp); tap(sp,function(){ sayL(wt(w)); }); }
G.llisten=function(p){ listenPick(words(), TIER>=3); };
G.lreview=function(p){ listenPick(allWords(), TIER>=2); };
/* 3. 풍선 터뜨리기 */
G.lballoon=function(p){ var n=Math.min(T([2,3,4,5]),words().length), w=pick(words()), opts=pickN(words(),n,w), cols=["#ff7a7a","#7cc4f5","#ffd34d","#8fd6a2","#c9a7ff"];
  opts.forEach(function(o,i){ var b=g(); var x=500-n*95+i*190+10; setT(b,x,60+(i%2)*60); var bob=g(b); bob.classList.add("bobble"); bob.style.animationDelay=(i*0.3)+"s";
    el("path",{d:"M85 200 q-10 40 6 80",fill:"none",stroke:"#7a6b62","stroke-width":3},bob); el("ellipse",{cx:85,cy:100,rx:82,ry:100,fill:cols[i%5],stroke:"#3b2f2a","stroke-width":4},bob); el("path",{d:"M78 198 l7 10 l7 -10z",fill:cols[i%5],stroke:"#3b2f2a","stroke-width":3},bob);
    el("circle",{cx:85,cy:95,r:58,fill:"#fff",opacity:.9},bob); wpic(o,40,50,90,bob);
    if(o===w) setHint(function(){ hintNode(b); });
    tap(b,function(){ if(o===w){ b.classList.add("flyaway"); b.style.transform="translateY(-700px)"; langWin(w); } else { miss("그건 "+o.ko+"야"); sayL(wt(o),1600,true); } }); });
  $("ptext").textContent="들리는 풍선을 콕 터뜨려 줘!"; S.prompt=$("ptext").textContent; S.againFn=function(){ sayL(wt(w)); }; say(S.prompt,100); sayL(wt(w),1700,true); };
/* 4. 짝 맞추기 카드 (뒤집으면 말해 줘요) */
G.lpairs=function(p){ var np=Math.min(T([2,3,4,5]),words().length), ws=pickN(words(),np), cards=shuffle(ws.concat(ws)), open=null, got=0, busy=false;
  var cols=np<=3?np*2:Math.ceil(np*2/2), rows=Math.ceil(cards.length/cols), cw=Math.min(150,(940-(cols-1)*16)/cols), ch=Math.min(cw*1.15,(560-(rows-1)*16)/rows), x0=500-(cols*(cw+16)-16)/2;
  cards.forEach(function(w,i){ var b=g(); setT(b,x0+(i%cols)*(cw+16),20+Math.floor(i/cols)*(ch+16)); var back=el("rect",{x:0,y:0,width:cw,height:ch,rx:20,fill:"#b9a3e8",stroke:"#5b3fa8","stroke-width":4},b); var q=txt("?",cw/2,ch/2+22,64,b,"#fff");
    var face=g(b); face.style.display="none"; el("rect",{x:0,y:0,width:cw,height:ch,rx:20,"class":"card"},face); wpic(w,cw*0.12,(ch-cw*0.76)/2,cw*0.76,face);
    function flip(on){ face.style.display=on?"":"none"; back.style.display=q.style.display=on?"none":""; }
    tap(b,function(){ if(busy||b._f||b===open) return; flip(true); sayL(wt(w));
      if(!open){ open=b; open._w=w; open._flip=flip; return; }
      if(open._w===w){ b._f=open._f=true; b.classList.add("found"); open.classList.add("found"); open=null; got++; good(); if(got===np) setTimeout(win,900); }
      else { busy=true; var o=open; open=null; setTimeout(function(){ flip(false); o._flip(false); busy=false; },1100); } }); });
  $("ptext").textContent="카드를 뒤집어서 같은 그림 짝을 찾아 줘"; S.prompt=$("ptext").textContent; S.againFn=null; say(S.prompt,100); };

/* 언어 고르기 (첫 화면) */
function renderLangTabs(){ var box=$("langtabs"); if(!box) return; box.innerHTML="";
  Object.keys(LANGS).forEach(function(k){ var b=document.createElement("button"); b.type="button"; b.textContent=LANGS[k].name; b.className=k===S.lang?"on":""; b.addEventListener("click",function(){ S.lang=k; try{ localStorage.setItem("goyu-lang",k); }catch(e){} renderHome(); sayL(LANGS[k].hi); }); box.appendChild(b); }); }
