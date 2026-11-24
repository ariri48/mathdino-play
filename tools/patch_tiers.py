import sys
p=sys.argv[1]; s=open(p,encoding='utf-8').read()
def R(a,b,cnt=1):
    global s
    n=s.count(a)
    assert n==cnt, (n,a[:80])
    s=s.replace(a,b)
R('var S = { book:null, li:0, round:0, rounds:3, lock:false, voice:null, muted:false };',
'''var S = { book:null, li:0, round:0, rounds:3, lock:false, voice:null, muted:false, miss:0, hintFn:null };
/* 월령 단계: 0 아기(24~35개월) 1 꼬마(36~47) 2 씩씩(48~59) 3 대장(60~) */
var TIER=2, CAPS=[3,5,10,20], NCH=[2,3,3,4], HINTAT=[1,2,3,99], ROUNDS=[2,3,3,3];
function T(a){ return a[TIER]; }
function cap(){ return CAPS[TIER]; }
function clampN(n){ return n>cap()? rnd(1,cap()) : n; }
function hintNode(n){ if(n&&n.classList) n.classList.add("hint"); }
function setHint(fn){ S.hintFn=fn; }''')
# numChoices
R('function numChoices(n, lo, hi){ var s=[n]; while(s.length<3){ var c=rnd(Math.max(lo,n-3),Math.min(hi,n+3)); if(s.indexOf(c)<0) s.push(c); } return shuffle(s); }',
'function numChoices(n, lo, hi){ var k=NCH[TIER], pool=[]; hi=Math.max(hi,n+2); for(var v=Math.max(lo,n-3); v<=Math.min(hi,n+3); v++) if(v!==n) pool.push(v); return shuffle([n].concat(shuffle(pool).slice(0,k-1))); }')
R('''  vals.forEach(function(v,i){
    var b=g(); setT(b, x0+i*(w+gap), 470);''','''  vals.forEach(function(v,i){
    var b=g(); setT(b, x0+i*(w+gap), 470); if(v===correct) setHint(function(){ hintNode(b); });''')
# miss -> hint
R('function miss(msg){ boing();','function miss(msg){ S.miss++; if(S.hintFn&&S.miss>=HINTAT[TIER]) setTimeout(S.hintFn,900); boing();')
# count
R('G.count=function(p){ var n=p.dice? rnd(1,6) : pick(p.nums||[1,2,3,4,5]); var k=p.icon||"bean";',
  'G.count=function(p){ var n=p.dice? rnd(1,Math.max(3,Math.min(6,cap()))) : clampN(pick(p.nums||[1,2,3,4,5])); if(TIER===3&&!p.dice) n=Math.min(10,n+rnd(0,4)); var k=p.icon||"bean";')
# tapcount
R('if(n===0) n=rnd(1,5); var k=p.icon||"apple", cnt=0, tot=10;','if(n===0) n=rnd(1,5); n=clampN(n); var k=p.icon||"apple", cnt=0, tot=TIER===0?5:10;')
# frame
R('n=pick(p.nums||[1,2,3,4,5]), cnt=0; if(n>size) n=size;','n=pick(p.nums||[1,2,3,4,5]), cnt=0; if(n>size) n=size; n=clampN(n);')
# add
R('G.add=function(p){ var pr=pick(p.probs||[[2,1],[3,2],[1,3]]), a=pr[0], b=pr[1], k=p.icon||"apple";',
  'G.add=function(p){ var pr=pick(p.probs||[[2,1],[3,2],[1,3]]), a=pr[0], b=pr[1], k=p.icon||"apple"; if(a+b>cap()){ a=rnd(1,cap()-1); b=rnd(1,cap()-a); } if(TIER===3&&S.round>0){ a=rnd(3,6); b=rnd(2,4); }')
# makeN
R('G.makeN=function(p){ var n=p.n||5, k=p.icon||"cookie",','G.makeN=function(p){ var n=[3,Math.min(p.n||5,5),p.n||5,10][TIER], k=p.icon||"cookie",')
# subtract
R('a=pr[0], b=pr[1], k=p.icon||"mosquito", gone=0,','a=pr[0], b=pr[1], k=p.icon||"mosquito", gone=0, _s=(a>cap()?(a=rnd(2,cap()),b=rnd(1,a-1)):0),')
# compare
R('var k=p.icon||"ghost", k2=p.icon2||k, a,b; do{ a=rnd(1,6); b=rnd(1,6);}while(a===b);',
  'var k=p.icon||"ghost", k2=p.icon2||k, a,b, hi=T([3,5,6,9]), md=TIER===0?2:1; do{ a=rnd(1,hi); b=rnd(1,hi);}while(Math.abs(a-b)<md);')
R('tap(gp,function(){ var ok = more ? (i===0?a>b:b>a) : (i===0?a<b:b<a);',
  'var okk = more ? (i===0?a>b:b>a) : (i===0?a<b:b<a); if(okk) setHint(function(){ hintNode(gp); }); tap(gp,function(){ var ok = okk;')
# ordinal
R('k=pick([p.icon||"apple","ball","star","fish","car","duck"]), n=6, t=rnd(0,4);','k=pick([p.icon||"apple","ball","star","fish","car","duck"]), n=T([3,4,6,6]), t=rnd(0,Math.min(4,n-1));')
R('icon(k,0,0,125,b); tap(b,function(){ if(i===t){','icon(k,0,0,125,b); if(i===t) setHint(function(){ hintNode(b); }); tap(b,function(){ if(i===t){')
# order
R('var an=(p.animals||["bear","cat","rabbit"]).slice(0, p.kind==="podium"?3:4);','var an=(p.animals||["bear","cat","rabbit"]).slice(0, Math.min(p.kind==="podium"?3:4, T([2,3,4,4]))); var nodes=[];')
R('icon(a,0,0,140,b); b._a=a;','icon(a,0,0,140,b); b._a=a; nodes.push(b);')
R('function ask(){ var s=steps[si]; prompt(p.kind','function ask(){ var s=steps[si]; setHint(function(){ nodes.forEach(function(x){ if(x._a===s[0]) hintNode(x); }); }); S.miss=0; prompt(p.kind')
# numorder
R('var n=Math.min(p.maxn||10,10), next=1;','var n=Math.min(p.maxn||10,10,cap()), next=1, nodes=[]; setHint(function(){ hintNode(nodes[next-1]); });')
R('el("circle",{cx:0,cy:0,r:56,"class":"bub"},b); txt(v,0,20,58,b);','el("circle",{cx:0,cy:0,r:56,"class":"bub"},b); txt(v,0,20,58,b); nodes.push(b);')
# dots
R('var sh=S.round===0&&p.shape?p.shape:pick(keys);','var sh=TIER===0? pick(["house","boat"]) : (S.round===0&&p.shape?p.shape:pick(keys)); var nodes=[]; setHint(function(){ hintNode(nodes[next-1]); });')
R('el("circle",{cx:0,cy:0,r:26,"class":"bub"},b); txt(i+1,0,11,30,b);','el("circle",{cx:0,cy:0,r:26,"class":"bub"},b); txt(i+1,0,11,30,b); nodes.push(b);')
R('poly.setAttribute("points",done.join(" ")); next++; good();','poly.setAttribute("points",done.join(" ")); next++; good(); if(TIER===0&&nodes[next-1]) hintNode(nodes[next-1]);')
R('prompt("1부터 차례로 점을 눌러서 이어 줘");','prompt("1부터 차례로 점을 눌러서 이어 줘"); if(TIER===0) setTimeout(function(){ hintNode(nodes[0]); },50);')
# routine
R('st=st.slice(0,5); var n=st.length, next=0,','st=st.slice(0,T([3,3,5,5])); var n=st.length, next=0, nodes=[]; setHint(function(){ nodes.forEach(function(x){ if(x._i===next) hintNode(x); }); });')
R('icon(si[0][0],25,12,120,b); txt(si[0][1],w/2,180,30,b);','icon(si[0][0],25,12,120,b); txt(si[0][1],w/2,180,30,b); b._i=si[1]; nodes.push(b);')
# pattern
R('var pat=(p.rows&&S.round<p.rows.length)? p.rows[S.round] : pick(sets);','var pat=(p.rows&&S.round<p.rows.length)? p.rows[S.round] : pick(sets); if(TIER===0&&pat.length!==2) pat=pick(sets.filter(function(x){ return x.length===2; }));')
R('while(opts.length<3){ var c=pick(pool);','while(opts.length<NCH[TIER]){ var c=pick(pool);')
# hidden
R('var k=p.icon||"mosquito", n=p.n||6, found=0;','var k=p.icon||"mosquito", n=Math.min(p.n||6,T([3,4,6,8])), found=0;')
# findnum
R('var up=Math.min(p.upto||20,30), cols=10, cs=88, x0=500-cols*cs/2, t=rnd(1,Math.min(up,20));',
  'var up=Math.min(p.upto||20,T([5,10,20,30])), cols=up<=10?5:10, cs=up<=10?150:88, x0=500-cols*cs/2, t=rnd(1,Math.min(up,20));')
R('txt(i,cs/2,cs/2+16,40,b);\n    tap(b,function(){ if(i===t){','txt(i,cs/2,cs/2+(cs>100?26:16),cs>100?64:40,b); if(i===t) setHint(function(){ hintNode(b); });\n    tap(b,function(){ if(i===t){')
# calendar
R('var t=rnd(1,28); var sundays=[];','var t=rnd(1,TIER<=1?10:28); var sundays=[];')
R('if(dn>=1&&dn<=31){ txt(dn,cw/2,ch/2+14,36,b);','if(dn>=1&&dn<=31){ txt(dn,cw/2,ch/2+14,36,b); if((mode===0&&dn===t)||(mode===1&&dn===6)) setHint(function(){ hintNode(b); });')
# coins
R('price=it[1], cnt=0;','price=Math.min(it[1],cap()), cnt=0;')
# share
R('if(S.round>0){ people=pick([2,3]); total=people*rnd(2,3); }','if(S.round>0){ people=pick([2,3]); total=people*rnd(2,3); } if(TIER===0){ people=2; total=pick([2,4]); } else if(TIER===1&&total>6){ people=2; total=pick([4,6]); }')
# maze
R('G.maze=function(p){ var cols=6, rows=4, cs=140,','G.maze=function(p){ var cols=T([3,4,6,7]), rows=T([2,3,4,4]), cs=140,')
# shapefind
R('var pos=scatter(12,40,20,920,420,120); var need=0, got=0;\n  pos.forEach(function(q,i){ var k= i<4? t','var cnt=T([6,8,12,12]), pos=scatter(cnt,40,20,920,420,120); var need=0, got=0;\n  pos.forEach(function(q,i){ var k= i<Math.ceil(cnt/3)? t')
# sort
R('items=shuffle(items).slice(0,6);','items=shuffle(items).slice(0,T([3,4,6,6]));')
# position / inout
R('[["bear","책상 위에"],["ball","책상 아래에"],["cat","책상 옆에"],["star","바구니 안에"]]).slice(0,3)','[["bear","책상 위에"],["ball","책상 아래에"],["cat","책상 옆에"],["star","바구니 안에"]]).slice(0,T([1,2,3,3]))')
R('[["ball","안"],["star","밖"],["heart","안"],["apple","밖"]]).slice(0,3)','[["ball","안"],["star","밖"],["heart","안"],["apple","밖"]]).slice(0,T([2,3,3,3]))')
# leftright
R('var arr=[]; for(var i=0;i<8;i++) arr.push(i<3?','var arr=[], AN=T([4,6,8,8]); for(var i=0;i<AN;i++) arr.push(i<Math.ceil(AN/3)?')
# size
R('sizes=[70,110,150,190], asc=S.round%2===0, next=0, order=shuffle([0,1,2,3]);','sizes=T([[80,190],[80,135,190],[70,110,150,190],[70,110,150,190]]), M=sizes.length, asc=S.round%2===0, next=0, order=shuffle(sizes.map(function(_,i){return i;})), nodes=[]; setHint(function(){ nodes.forEach(function(x){ if(x._si===(asc?next:M-1-next)) hintNode(x); }); });')
R('var s=sizes[si]; var b=g(); setT(b,70+j*230+(190-s)/2,260-s); icon(k,0,0,s,b);','var s=sizes[si]; var b=g(); setT(b,500-M*115+20+j*230+(190-s)/2,260-s); icon(k,0,0,s,b); b._si=si; nodes.push(b);')
R('var want= asc? next : 3-next;','var want= asc? next : M-1-next;')
R('if(next===4) setTimeout(win,300);','if(next===M) setTimeout(win,300);')
# measure
R('G.measure=function(p){ var n=rnd(3,8),','G.measure=function(p){ var n=T([[2,3],[2,5],[3,8],[4,10]]); n=rnd(n[0],n[1]);')
# heavy / length / clock / graph hints
R('icon(it[0],0,0,240,b); tap(b,function(){ if((it[1]===1)===hv){','icon(it[0],0,0,240,b); if((it[1]===1)===hv) setHint(function(){ hintNode(b); }); tap(b,function(){ if((it[1]===1)===hv){')
R('el("rect",{x:110,y:0,width:860,height:100,fill:"transparent"},b);','el("rect",{x:110,y:0,width:860,height:100,fill:"transparent"},b); if(v===best) setHint(function(){ hintNode(b); });')
R('var hs=shuffle([1,2,3,4,5,6,7,8,9,10,11,12]).slice(0,3), t=hs[0];','var hs=shuffle(TIER<=1?[12,3,6,9]:[1,2,3,4,5,6,7,8,9,10,11,12]).slice(0,Math.min(3,NCH[TIER])), t=hs[0];')
R('var b=clockFace(h,190+i*310,230,140); tap(b,','var b=clockFace(h,500-hs.length*155+155+i*310,230,140); if(h===t) setHint(function(){ hintNode(b); }); tap(b,')
R('vals=it.map(function(){ return rnd(1,5); });','vals=it.map(function(){ return rnd(1,T([3,4,5,5])); });')
# pairs
R('var pats=shuffle(["stripe","dot","star","heart"]).slice(0,3),','var NP=T([2,3,3,3]), pats=shuffle(["stripe","dot","star","heart"]).slice(0,NP),')
R('if(got===3) setTimeout(win,300);','if(got===NP) setTimeout(win,300);')
R('var b=g(); setT(b,70+i*150,120); el("rect",{x:-6,y:-6,width:142,height:202','var b=g(); setT(b,500-cards.length*75+10+i*150,120); el("rect",{x:-6,y:-6,width:142,height:202')
# trace thresholds
R('if(cov>0.5) setTimeout(win,250);','if(cov>T([0.35,0.45,0.5,0.6])) setTimeout(win,250);')
R('if(cov>0.5) win(); else miss(','if(cov>T([0.35,0.45,0.5,0.6])) win(); else miss(')
open(p,'w',encoding='utf-8').write(s); print("ok")
