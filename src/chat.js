/* ---------- 친구처럼 말 걸기 ----------
   인사(이름 불러 주기), 틀렸을 때 응원, 연속 정답 칭찬, 놀이 끝 자랑, 가만히 있을 때 말 걸기.
   말풍선에는 이름을 넣고, 녹음 목소리는 이름을 뺀 부분만 들려줘요. */
var LINES={
  hello:["잘 지냈어? 오늘도 우리 신나게 놀아 보자!","또 만나서 정말 반가워! 오늘은 뭐 하고 놀까?","보고 싶었어! 오늘도 같이 놀자!","왔구나! 오늘도 재밌는 거 많이 하자!"],
  morning:["좋은 아침이야! 아침밥은 먹었어? 오늘도 신나게 놀아 보자!","잘 잤어? 아침부터 같이 노니까 너무 좋다!"],
  evening:["저녁 먹었어? 자기 전에 같이 조금만 놀자!","오늘 하루 재밌었어? 나랑 조금만 더 놀자!"],
  again:["또 왔구나! 이어서 놀자!","다시 와 줘서 고마워! 계속 놀자!"],
  cheer:["괜찮아! 잘할 수 있어!","틀려도 괜찮아. 다시 해 보자!","아깝다! 거의 다 왔어!","천천히 해도 돼. 나는 기다릴 수 있어!","우리 같이 한 번 더 해 볼까?"],
  streak3:["더 어려운 문제도 풀 수 있겠는걸?","세 번 연속 맞혔어! 대단하다!"],
  streak6:["우와, 오늘 완전 척척박사 같아!","계속 맞히네! 나도 깜짝 놀랐어!"],
  brag:["우리, 엄마한테 자랑해 볼까?","아빠한테도 보여 주자!","할머니가 보시면 깜짝 놀라시겠다!","오늘 정말 열심히 했다! 짝짝짝!"],
  idle:["천천히 생각해도 괜찮아.","어디 있을까? 같이 찾아보자!","할 수 있어! 하나씩 해 보자!"],
  hint:["반짝반짝 빛나는 걸 봐! 힌트야!"]
};
function voc(name){ return name+(jong(name)?"아":"야"); }          /* 콩이 → 콩이야, 하준 → 하준아 */
function lastSeen(k){ try{ return +localStorage.getItem("goyu-last-"+k.id)||0; }catch(e){ return 0; } }
function markSeen(k){ try{ localStorage.setItem("goyu-last-"+k.id,String(Date.now())); }catch(e){} }
/* 첫 화면 인사: 처음 / 방금 왔다 감 / 아침 / 저녁 / 오랜만 */
function greetLine(k){ var gap=Date.now()-lastSeen(k), h=new Date().getHours();
  if(!lastSeen(k)) return null;
  if(gap<3*3600e3) return pick(LINES.again);
  if(h<11) return pick(LINES.morning); if(h>=18) return pick(LINES.evening); return pick(LINES.hello); }
/* 틀렸을 때: 두 번째부터는 꼭, 처음엔 가끔 응원 한마디 */
function cheerUp(){ if(S.miss>=2||Math.random()<0.4){ var c=pick(LINES.cheer); setTimeout(function(){ bubble(c,"oops"); },1900); say(c,750,true); } }
/* 맞혔을 때: 연속 정답 세기. 덧붙인 말이 있으면 다음 판을 조금 늦게 */
function streakTalk(){ if(S.miss===0) S.streak=(S.streak||0)+1; else S.streak=0;
  var s= S.streak===3? pick(LINES.streak3) : S.streak===6? pick(LINES.streak6) : null; if(!s) return 0;
  say(s,200,true); setTimeout(function(){ bubble(s,"yay"); $("ptext").textContent=s; },1500); return 1600; }
/* 놀이 끝: 자랑하자 */
function bragTalk(){ var b=pick(LINES.brag), k=curKid(); $("dtalk").textContent=(k?voc(k.name)+", ":"")+b; say(b,200,true); }
/* 가만히 있으면 한 번 말 걸기 */
function idleArm(){ clearTimeout(S.idleT); if(S.diag) return; S.idleT=setTimeout(function(){ if(document.body.dataset.view!=="play"||S.lock) return; var t=pick(LINES.idle); bubble(t,"yay"); say(t); }, 16000); }
document.addEventListener("pointerdown",function(){ if(S.idleT&&document.body.dataset.view==="play") idleArm(); },true);
