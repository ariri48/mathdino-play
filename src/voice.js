/* ---------- 녹음 목소리 ----------
   audio/index.json 에 있는 말은 미리 만든 아이 목소리(여자아이·남자아이) 파일로 틀고,
   없는 말만 기기 음성으로 읽어요. 파일 하나짜리 판(file://)은 기기 음성만 써요. */
var VC={map:null, au:null, q:[], busy:false};
(function(){ if(location.protocol==="file:"||window.__NOHUB) return;
  try{ fetch("audio/index.json",{cache:"no-cache"}).then(function(r){ return r.ok?r.json():null; }).then(function(j){ VC.map=j; }).catch(function(){}); }catch(e){} })();
function vKind(){ if(VC.force) return VC.force; var k=(typeof curKid==="function")?curKid():null; return (k&&k.vk)||"girl"; }
function vNorm(s){ s=String(s).replace(/\s+/g," ").trim(); var k=(typeof curKid==="function")?curKid():null;
  if(k&&k.name){ s=s.split(voc(k.name)+", ").join("").split(k.name+", ").join("").split("나는 "+k.name+"! ").join(""); } return s; }
function clipFor(s, lang){ var m=VC.map; if(!m) return null;
  if(lang){ var h=m.l&&m.l[lang]&&m.l[lang][String(s).trim()]; return h? "audio/"+lang+"/"+h+".mp3" : null; }
  var kind=vKind(), key=vNorm(s), h2=m.ko&&m.ko[key];
  if(!h2&&key.indexOf("뿌엥뿌엥~")===0) h2=m.ko&&m.ko["뿌엥뿌엥~ 다시 해 볼까?"]; /* 틀렸을 때 말이 없으면 기본 말로 */ if(!h2||!(m.kinds||[]).length||m.kinds.indexOf(kind)<0) return null; return "audio/ko-"+kind+"/"+h2+".mp3"; }
function clipStop(){ VC.q=[]; VC.busy=false; if(VC.au){ try{ VC.au.pause(); }catch(e){} } }
function clipNext(){ var src=VC.q.shift(); if(!src){ VC.busy=false; talk(false); return; } VC.busy=true;
  var a=VC.au||(VC.au=new Audio()); a.onended=a.onerror=function(){ clipNext(); }; a.src=src; talk(true);
  try{ var p=a.play(); if(p&&p.catch) p.catch(function(){ VC.busy=false; talk(false); }); }catch(e){ clipNext(); } }
function clipPlay(src, keep){ try{ speechSynthesis.cancel(); }catch(e){} if(!keep) clipStop(); VC.q.push(src); if(!VC.busy) clipNext(); }
/* 목소리 미리 듣기: 고른 목소리로 한 마디 */
function hearKind(kind, text){ VC.force=kind; var v=VOICES[kind==="boy"?1:0], vp=S.vp, vr=S.vr; S.vp=v[2]; S.vr=v[3]; say(text); S.vp=vp; S.vr=vr; VC.force=null; }
/* 아이패드는 처음 손가락으로 누를 때 소리를 깨워 둬야 해요 */
document.addEventListener("pointerdown",function un(){ if(location.protocol!=="file:") try{ VC.au=VC.au||new Audio(); VC.au.src="audio/silence.mp3"; var p=VC.au.play(); if(p&&p.catch) p.catch(function(){}); }catch(e){} document.removeEventListener("pointerdown",un,true); },true);
