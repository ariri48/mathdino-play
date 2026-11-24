/* ---------- 내 캐릭터: 아이 사진(만화풍 얼굴 + 공룡 옷) 또는 직접 그린 그림 ---------- */
/* 사진과 그림은 이 기기 localStorage 에만 저장. 어디로도 보내지 않음. */
var AVKEY="mathdino-av-";
var SUITS=[["#7fd49c","#c8f0d4"],["#ffb067","#ffe2c4"],["#8fb8ff","#d6e6ff"],["#ff9ec7","#ffd9ea"],["#b79cff","#e5dbff"],["#ffd84d","#fff1b8"]];
var VOICES=[["귀여운 목소리",1.2,0.98],["밝은 목소리",1.1,0.96],["보통 목소리",1.0,0.95],["차분한 목소리",0.92,0.9]];
function avLoad(id){ try{ return JSON.parse(localStorage.getItem(AVKEY+id))||null; }catch(e){ return null; } }
function avSave(id,o){ try{ if(o) localStorage.setItem(AVKEY+id,JSON.stringify(o)); else localStorage.removeItem(AVKEY+id); return true; }catch(e){ return false; } }
/* 기본 얼굴(사진이 없을 때) */
var DEFFACE='data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#ffe3c8"/><circle cx="34" cy="46" r="6" fill="#3b2f2a"/><circle cx="66" cy="46" r="6" fill="#3b2f2a"/><circle cx="36" cy="44" r="2" fill="#fff"/><circle cx="68" cy="44" r="2" fill="#fff"/><ellipse cx="24" cy="62" rx="8" ry="5" fill="#ffb3b3"/><ellipse cx="76" cy="62" rx="8" ry="5" fill="#ffb3b3"/><path d="M38 64 Q50 76 62 64" fill="none" stroke="#3b2f2a" stroke-width="4" stroke-linecap="round"/></svg>');
var AVN=0;
/* 캐릭터 SVG 문자열. a={mode:'photo'|'draw', img, suit} */
function avatarSVG(a, cls){ a=a||{}; var n=++AVN, s=SUITS[a.suit||0]||SUITS[0], img=a.img||DEFFACE, ink="#3b2f2a";
  var fx='<g class="fx"><g class="sparkle"><path d="M30 40 l5 -12 l5 12 l12 5 l-12 5 l-5 12 l-5 -12 l-12 -5z" fill="#ffd34d"/><path d="M168 30 l4 -9 l4 9 l9 4 l-9 4 l-4 9 l-4 -9 l-9 -4z" fill="#ffd34d"/><path d="M175 120 l3 -7 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3z" fill="#ff9ec7"/></g>'+
    '<g class="sweat"><path d="M150 52 q8 12 0 18 q-8 -6 0 -18z" fill="#8fd0ff" stroke="'+ink+'" stroke-width="2.5"/></g>'+
    '<g class="tears"><path d="M76 98 q-6 14 0 20 q6 -6 0 -20z" fill="#8fd0ff" stroke="#fff" stroke-width="2"/><path d="M124 98 q-6 14 0 20 q6 -6 0 -20z" fill="#8fd0ff" stroke="#fff" stroke-width="2"/><g transform="translate(0 -6)"><path d="M70 -2 q-14 0 -14 -12 q0 -12 14 -12 q4 -12 20 -12 q14 0 20 10 q16 -2 18 12 q2 14 -14 14z" fill="#c9d3e0" stroke="'+ink+'" stroke-width="3"/><path d="M78 4 l-4 8 M98 4 l-4 8 M118 4 l-4 8" stroke="#7cb8f0" stroke-width="4" stroke-linecap="round"/></g></g>'+
    '<g class="dizzy"><path d="M64 -6 q10 -10 20 0 q10 10 20 0 q10 -10 20 0 q10 10 20 0" fill="none" stroke="#b79cff" stroke-width="5" stroke-linecap="round"/></g>'+
    '<g class="crown"><path d="M70 2 l10 -18 l10 12 l10 -18 l10 18 l10 -12 l10 18z" fill="#ffd34d" stroke="'+ink+'" stroke-width="3" stroke-linejoin="round"/></g></g>';
  if(a.mode==="draw"){
    return '<svg class="av '+(cls||"")+'" viewBox="0 0 200 240" aria-hidden="true"><g transform="translate(10 24) scale(.9)"><g class="whole"><ellipse cx="100" cy="232" rx="60" ry="7" fill="rgba(0,0,0,.12)" class="shadow"/><g class="jumper"><image href="'+img+'" x="14" y="36" width="172" height="194" preserveAspectRatio="xMidYMax meet"/></g></g>'+fx+'</g></svg>'; }
  return '<svg class="av '+(cls||"")+'" viewBox="0 0 200 240" aria-hidden="true"><g transform="translate(10 24) scale(.9)"><defs><clipPath id="avc'+n+'"><circle cx="100" cy="86" r="44"/></clipPath></defs>'+
   '<ellipse cx="100" cy="232" rx="58" ry="7" fill="rgba(0,0,0,.12)" class="shadow"/>'+
   '<g class="jumper"><g class="tail"><path d="M140 190 q40 10 50 -20 q-14 30 -48 34z" fill="'+s[0]+'" stroke="'+ink+'" stroke-width="4" stroke-linejoin="round"/></g>'+
   '<g class="armL"><path d="M66 150 q-26 6 -30 28" fill="none" stroke="'+ink+'" stroke-width="24" stroke-linecap="round"/><path d="M66 150 q-26 6 -30 28" fill="none" stroke="'+s[0]+'" stroke-width="16" stroke-linecap="round"/></g>'+
   '<g class="armR"><path d="M134 150 q26 6 30 28" fill="none" stroke="'+ink+'" stroke-width="24" stroke-linecap="round"/><path d="M134 150 q26 6 30 28" fill="none" stroke="'+s[0]+'" stroke-width="16" stroke-linecap="round"/></g>'+
   '<g class="legs"><rect x="66" y="196" width="26" height="30" rx="12" fill="'+s[0]+'" stroke="'+ink+'" stroke-width="4"/><rect x="108" y="196" width="26" height="30" rx="12" fill="'+s[0]+'" stroke="'+ink+'" stroke-width="4"/></g>'+
   '<path d="M56 160 q0 -38 44 -38 q44 0 44 38 v18 q0 30 -44 30 q-44 0 -44 -30z" fill="'+s[0]+'" stroke="'+ink+'" stroke-width="4"/>'+
   '<path d="M76 158 q24 -12 48 0 v22 q-24 16 -48 0z" fill="'+s[1]+'"/>'+
   '<g class="head"><path d="M100 22 l10 -14 l8 16 l14 -8 l2 18 l14 2 l-6 14 q12 18 6 40 q-6 34 -48 38 q-42 -4 -48 -38 q-6 -22 6 -40 l-6 -14 l14 -2 l2 -18 l14 8 l8 -16z" fill="'+s[0]+'" stroke="'+ink+'" stroke-width="4" stroke-linejoin="round"/>'+
   '<circle cx="100" cy="86" r="46" fill="#fff" stroke="'+ink+'" stroke-width="4"/>'+
   '<image href="'+img+'" x="56" y="42" width="88" height="88" clip-path="url(#avc'+n+')" preserveAspectRatio="xMidYMid slice"/>'+
   '<circle cx="100" cy="86" r="44" fill="none" stroke="'+ink+'" stroke-width="3"/></g></g>'+fx+'</g></svg>'; }
/* 사진 → 만화풍: 부드럽게 + 색 단계 줄이기 + 윤곽선 */
function cartoonize(c, k){ var w=c.width, h=c.height, x=c.getContext("2d"), d=x.getImageData(0,0,w,h), p=d.data, i, j;
  var a=new Float32Array(p.length); for(i=0;i<p.length;i++) a[i]=p[i];
  for(var pass=0;pass<2;pass++){ var b=new Float32Array(a.length); for(var yy=0;yy<h;yy++) for(var xx=0;xx<w;xx++){ var o=(yy*w+xx)*4, cnt=0, r=0,g=0,bl=0, cr=a[o],cg=a[o+1],cb=a[o+2];
      for(var dy=-2;dy<=2;dy++) for(var dx=-2;dx<=2;dx++){ var X=xx+dx,Y=yy+dy; if(X<0||Y<0||X>=w||Y>=h) continue; var q=(Y*w+X)*4; var df=Math.abs(a[q]-cr)+Math.abs(a[q+1]-cg)+Math.abs(a[q+2]-cb); if(df<70){ r+=a[q]; g+=a[q+1]; bl+=a[q+2]; cnt++; } }
      b[o]=r/cnt; b[o+1]=g/cnt; b[o+2]=bl/cnt; b[o+3]=a[o+3]; } a=b; }
  var step=[0,48,40,32][k]||40, gray=new Float32Array(w*h); for(i=0;i<w*h;i++) gray[i]=a[i*4]*0.3+a[i*4+1]*0.59+a[i*4+2]*0.11;
  for(var y2=0;y2<h;y2++) for(var x2=0;x2<w;x2++){ var o2=(y2*w+x2)*4, m=(a[o2]+a[o2+1]+a[o2+2])/3;
    for(j=0;j<3;j++){ var v=a[o2+j]; v=m+(v-m)*1.35; v=Math.round(v/step)*step+step*0.35; p[o2+j]=Math.max(0,Math.min(255,v)); }
    if(x2>0&&y2>0&&x2<w-1&&y2<h-1){ var I=y2*w+x2; var gx=-gray[I-w-1]-2*gray[I-1]-gray[I+w-1]+gray[I-w+1]+2*gray[I+1]+gray[I+w+1]; var gy=-gray[I-w-1]-2*gray[I-w]-gray[I-w+1]+gray[I+w-1]+2*gray[I+w]+gray[I+w+1];
      var e=Math.hypot(gx,gy); if(e>[0,150,120,95][k]){ var t=Math.min(1,(e-90)/120); for(j=0;j<3;j++) p[o2+j]=p[o2+j]*(1-t*0.85)+59*t*0.85; } } }
  x.putImageData(d,0,0); return c; }
/* 그림 → 종이 배경 지우기 (가장자리와 이어진 종이색만) */
function removePaper(c, tol){ var w=c.width,h=c.height,x=c.getContext("2d"),d=x.getImageData(0,0,w,h),p=d.data; var rs=[],gs=[],bs=[];
  for(var i=0;i<w;i+=3){ [0,h-1].forEach(function(y){ var o=(y*w+i)*4; rs.push(p[o]); gs.push(p[o+1]); bs.push(p[o+2]); }); } for(var j=0;j<h;j+=3){ [0,w-1].forEach(function(xx){ var o=(j*w+xx)*4; rs.push(p[o]); gs.push(p[o+1]); bs.push(p[o+2]); }); }
  var med=function(a){ a.sort(function(u,v){return u-v;}); return a[a.length>>1]; }, R=med(rs),G=med(gs),B=med(bs);
  var bg=new Uint8Array(w*h), st=[]; function near(o){ return Math.abs(p[o]-R)+Math.abs(p[o+1]-G)+Math.abs(p[o+2]-B) < tol*3 || (p[o]+p[o+1]+p[o+2] > (R+G+B)-tol*0.6 && Math.max(p[o],p[o+1],p[o+2])-Math.min(p[o],p[o+1],p[o+2])<40); }
  for(i=0;i<w;i++){ st.push(i); st.push((h-1)*w+i); } for(j=0;j<h;j++){ st.push(j*w); st.push(j*w+w-1); }
  while(st.length){ var k=st.pop(); if(bg[k]) continue; if(!near(k*4)) continue; bg[k]=1; var xx=k%w, yy=(k/w)|0; if(xx>0) st.push(k-1); if(xx<w-1) st.push(k+1); if(yy>0) st.push(k-w); if(yy<h-1) st.push(k+w); }
  var x0=w,y0=h,x1=0,y1=0; for(k=0;k<w*h;k++){ if(bg[k]) p[k*4+3]=0; else { var X=k%w,Y=(k/w)|0; if(X<x0)x0=X; if(X>x1)x1=X; if(Y<y0)y0=Y; if(Y>y1)y1=Y; var nb=(X>0&&bg[k-1])||(X<w-1&&bg[k+1])||(Y>0&&bg[k-w])||(Y<h-1&&bg[k+w]); if(nb) p[k*4+3]=140; } }
  x.putImageData(d,0,0); if(x1<=x0||y1<=y0) return c; var pad=6, cw=x1-x0+1+pad*2, ch=y1-y0+1+pad*2, o2=document.createElement("canvas"); o2.width=cw; o2.height=ch; o2.getContext("2d").drawImage(c,x0-pad,y0-pad,cw,ch,0,0,cw,ch); return o2; }

/* 화면 곳곳의 캐릭터 */
var BUD={ a:null, kid:null };
function curAv(){ var k=curKid(); var a=k? avLoad(k.id) : null; return a||{mode:"photo",img:null,suit:k?(k.suit||0):0,voice:1}; }
function renderBuddies(){ var a=curAv(); BUD.a=a; var v=VOICES[a.voice==null?1:a.voice]||VOICES[1]; S.vp=v[1]; S.vr=v[2];
  Array.prototype.forEach.call(document.querySelectorAll("[data-buddy]"),function(el){ el.innerHTML=avatarSVG(a,"pose-idle"); });
  regMe(a); }
function buddyPose(p, ms){ Array.prototype.forEach.call(document.querySelectorAll("[data-buddy] .av"),function(s){ s.setAttribute("class","av pose-"+p); });
  clearTimeout(buddyPose._t); if(ms) buddyPose._t=setTimeout(function(){ buddyPose("idle"); },ms); }
function talk(on){ Array.prototype.forEach.call(document.querySelectorAll("[data-buddy] .av"),function(s){ s.classList.toggle("talk",!!on); }); }
/* 놀이 안에서도 내 캐릭터를 쓸 수 있게 심볼(g-me) 등록 */
function regMe(a){ var k=curKid(); var old=document.getElementById("g-me"); if(old) old.remove(); delete CHARK.me;
  if(!k) return; var defs=document.querySelector("svg defs"); if(!defs) return;
  var sym=document.createElementNS(NS,"symbol"); sym.setAttribute("id","g-me"); sym.setAttribute("viewBox","0 0 200 240"); sym.innerHTML=avatarSVG(a,"pose-idle").replace(/^<svg[^>]*>/,"").replace(/<\/svg>$/,"").replace(/<g class="fx">[\s\S]*$/,"</g>");
  defs.appendChild(sym); CHARK.me=1; NAMES.me=k.name; }
function hasMe(){ return !!CHARK.me; }

/* 캐릭터 만들기 화면 */
var AE={ kid:null, img:null, mode:"photo", ox:0, oy:0, zoom:1.4, toon:2, paper:35, suit:0, voice:1, out:null, t:null };
function avEditOpen(k){ AE.kid=k; var a=avLoad(k.id)||{}; AE.mode=a.mode||"photo"; AE.suit=a.suit||0; AE.voice=a.voice==null?1:a.voice; AE.out=a.img||null; AE.img=null; AE.pose="idle"; AE.ox=0; AE.oy=0; AE.zoom=1.7;
  $("avWho").textContent=k.name; $("avToon").value=AE.toon; $("avPaper").value=AE.paper; $("avZoom").value=AE.zoom; $("avVoice").value=AE.voice; $("avDel").hidden=!avLoad(k.id);
  avModeUI(); avDrawCrop(); avPreview(); show("avedit"); }
function avModeUI(){ Array.prototype.forEach.call(document.querySelectorAll("#avMode button"),function(b){ b.classList.toggle("on",b.dataset.mode===AE.mode); });
  $("toonRow").hidden=AE.mode!=="photo"; $("paperRow").hidden=AE.mode!=="draw"; $("avSuitsRow").hidden=AE.mode!=="photo"; $("zoomRow").hidden=AE.mode!=="photo";
  $("cropHelp").textContent= AE.mode==="photo"? "손가락으로 끌어서 얼굴을 동그라미 안에 맞춰요" : "종이에 그린 그림을 찍어서 올려요. 종이 색은 저절로 지워져요"; $("avFileLbl").textContent= AE.mode==="photo"? "아이 사진 고르기" : "그림 사진 고르기"; }
function avDrawCrop(){ var c=$("cropCv"), x=c.getContext("2d"), W=c.width; x.clearRect(0,0,W,W); x.fillStyle="#f1ece7"; x.fillRect(0,0,W,W);
  if(!AE.img){ x.fillStyle="#7a6b62"; x.font="20px sans-serif"; x.textAlign="center"; x.fillText("사진을 골라 주세요",W/2,W/2); return; }
  var im=AE.img, s=AE.mode==="photo"? AE.zoom*W/Math.min(im.width,im.height) : Math.min(W/im.width,W/im.height), w=im.width*s, h=im.height*s;
  x.drawImage(im, W/2-w/2+AE.ox, W/2-h/2+AE.oy, w, h);
  if(AE.mode==="photo"){ x.save(); x.fillStyle="rgba(30,20,40,.55)"; x.beginPath(); x.rect(0,0,W,W); x.arc(W/2,W/2,W*0.4,0,Math.PI*2,true); x.fill("evenodd"); x.restore(); x.strokeStyle="#ffc83d"; x.lineWidth=5; x.beginPath(); x.arc(W/2,W/2,W*0.4,0,Math.PI*2); x.stroke(); } }
function avBuild(){ if(!AE.img) return; var im=AE.img;
  if(AE.mode==="photo"){ var W=$("cropCv").width, s=AE.zoom*W/Math.min(im.width,im.height), R=W*0.4, o=document.createElement("canvas"); o.width=o.height=220;
    var sx=(W/2-R - (W/2-im.width*s/2+AE.ox))/s, sy=(W/2-R - (W/2-im.height*s/2+AE.oy))/s, sw=2*R/s;
    o.getContext("2d").drawImage(im,sx,sy,sw,sw,0,0,220,220); if(AE.toon>0) cartoonize(o,AE.toon); AE.out=o.toDataURL("image/jpeg",0.88); }
  else { var sc=Math.min(1,460/Math.max(im.width,im.height)), c=document.createElement("canvas"); c.width=Math.round(im.width*sc); c.height=Math.round(im.height*sc); c.getContext("2d").drawImage(im,0,0,c.width,c.height);
    if(AE.paper>0) c=removePaper(c,AE.paper); AE.out=c.toDataURL("image/png"); } }
function avPreview(rebuild){ if(rebuild){ clearTimeout(AE.t); AE.t=setTimeout(function(){ avBuild(); avPreview(); },180); return; }
  $("avPrev").innerHTML=avatarSVG({mode:AE.mode,img:AE.out,suit:AE.suit},"pose-"+(AE.pose||"idle"));
  var su=$("avSuits"); su.innerHTML=""; SUITS.forEach(function(c,i){ var b=document.createElement("button"); b.type="button"; b.className="suit"+(i===AE.suit?" on":""); b.style.background=c[0]; b.setAttribute("aria-label","공룡 옷 색 "+(i+1)); b.addEventListener("click",function(){ AE.suit=i; avPreview(); }); su.appendChild(b); }); }
(function initAvEdit(){
  VOICES.forEach(function(v,i){ var o=document.createElement("option"); o.value=i; o.textContent=v[0]; $("avVoice").appendChild(o); });
  Array.prototype.forEach.call(document.querySelectorAll("#avMode button"),function(b){ b.addEventListener("click",function(){ AE.mode=b.dataset.mode; AE.ox=AE.oy=0; avModeUI(); avDrawCrop(); avPreview(true); }); });
  Array.prototype.forEach.call(document.querySelectorAll("#avPoses button"),function(b){ b.addEventListener("click",function(){ AE.pose=b.dataset.pose; avPreview(); }); });
  $("avFile").addEventListener("change",function(){ var f=this.files&&this.files[0]; this.value=""; if(!f) return; var url=URL.createObjectURL(f), im=new Image();
    im.onload=function(){ URL.revokeObjectURL(url); var sc=Math.min(1,1400/Math.max(im.width,im.height)), c=document.createElement("canvas"); c.width=Math.round(im.width*sc); c.height=Math.round(im.height*sc); c.getContext("2d").drawImage(im,0,0,c.width,c.height); AE.img=c; AE.ox=AE.oy=0; avDrawCrop(); avPreview(true); };
    im.onerror=function(){ alert("이 사진은 열 수 없어요. 다른 사진을 골라 주세요."); }; im.src=url; });
  var cv=$("cropCv"), drag=null; cv.addEventListener("pointerdown",function(e){ if(!AE.img||AE.mode!=="photo") return; e.preventDefault(); cv.setPointerCapture(e.pointerId); var r=cv.getBoundingClientRect(); drag={x:e.clientX,y:e.clientY,ox:AE.ox,oy:AE.oy,k:cv.width/r.width}; });
  cv.addEventListener("pointermove",function(e){ if(!drag) return; AE.ox=drag.ox+(e.clientX-drag.x)*drag.k; AE.oy=drag.oy+(e.clientY-drag.y)*drag.k; avDrawCrop(); });
  function up(){ if(drag){ drag=null; avPreview(true); } } cv.addEventListener("pointerup",up); cv.addEventListener("pointercancel",up);
  $("avZoom").addEventListener("input",function(){ AE.zoom=+this.value; avDrawCrop(); avPreview(true); });
  $("avToon").addEventListener("input",function(){ AE.toon=+this.value; avPreview(true); });
  $("avPaper").addEventListener("input",function(){ AE.paper=+this.value; avPreview(true); });
  $("avVoice").addEventListener("change",function(){ AE.voice=+this.value; });
  $("avHear").addEventListener("click",function(){ var v=VOICES[AE.voice]; var vp=S.vp, vr=S.vr; S.vp=v[1]; S.vr=v[2]; say("안녕! 나는 "+AE.kid.name+"! 같이 수학 놀이 하자!"); S.vp=vp; S.vr=vr; });
  $("avSave").addEventListener("click",function(){ var k=AE.kid; var a={mode:AE.mode,img:AE.out,suit:AE.suit,voice:AE.voice};
    if(!avSave(k.id,a)){ alert("저장 공간이 모자라요. 사진을 조금 더 작게 잘라 주세요."); return; } var o=all(); o.cur=k.id; saveAll(o); renderBuddies(); renderHome(); show("home"); buddyPose("cheer",2000); say("짠! 나는 "+k.name+"! 같이 놀자!"); });
  $("avDel").addEventListener("click",function(){ if(!confirm("캐릭터를 지울까요?")) return; avSave(AE.kid.id,null); renderBuddies(); renderKids(); show("kids"); });
  $("avBack").addEventListener("click",function(){ renderKids(); show("kids"); });
})();
