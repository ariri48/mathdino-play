// 게임이 소리 내어 하는 말을 모두 모아 data/phrases.json 으로 (녹음 목소리 만들기용)
// PW=<playwright-core 상위 폴더> node tools/phrases.cjs   (python3 -m http.server 8766 이 떠 있어야 함)
const {chromium}=require(process.env.PW+'/playwright-core'); const fs=require('fs');
const REPS=+(process.env.REPS||5);
(async()=>{ const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const prev=(process.env.MERGE&&fs.existsSync('data/phrases.json'))?JSON.parse(fs.readFileSync('data/phrases.json')):{ko:[],en:[],ja:[],zh:[]};
 const ko=new Set(prev.ko), L={en:new Set(prev.en),ja:new Set(prev.ja),zh:new Set(prev.zh)}, errs=[];
 for(const page of ['mathdino','mathforce','words']){
  const ctx=await b.newContext({viewport:{width:1180,height:820}}); const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(page+': '+e.message));
  await p.goto(`http://127.0.0.1:8766/${page}.html`);
  await p.evaluate(()=>{ window.__said=new Set(); window.__sayHook=(s,l)=>window.__said.add((l||'ko')+'\t'+String(s)); });
  await p.click('#startBtn'); await p.fill('#kn','테스트'); await p.click('#kadd button[type=submit]');
  const langs= page==='words'? ['en','ja','zh'] : [null];
  for(const lang of langs){
   const nb=await p.evaluate(()=>window.__DATA__.books.length);
   for(let t=0;t<4;t++) for(let bi=0;bi<nb;bi++) { if(process.env.DBG) console.log(page,lang,t,bi); await p.evaluate(({REPS,lang,t,bi})=>{ const T=window.__T, D=window.__DATA__, S=T.S; if(lang) S.lang=lang;
    const st0=window.setTimeout; window.setTimeout=()=>0;
    const tapAll=()=>{ for(const n of [...document.querySelectorAll('#stage > g')]){ S.lock=false; n.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true})); } };
    T.setTier(t); const bk=D.books[bi]; T.openBook(bk); for(let i=0;i<5;i++){ for(let rep=0;rep<REPS;rep++){ try{ T.startLevel(i); }catch(e){} for(let r=0;r<3;r++){ S.round=r; S.lock=false; try{ T.playRound(); tapAll(); }catch(e){} } } }
    window.setTimeout=st0; },{REPS,lang,t,bi}); }
   if(page!=='words') await p.evaluate(({REPS})=>{ const T=window.__T, S=T.S; const st0=window.setTimeout; window.setTimeout=()=>0; S.diag=true; for(const st of T.DSTEPS){ T.setTier(st.tier); for(let rep=0;rep<REPS*3;rep++){ T.clear(); S.lock=false; try{ T.G[st.g](Object.assign({},st.p)); }catch(e){} } } S.diag=false; window.setTimeout=st0; },{REPS});
  }
  // 정해진 말 (화면 이동·칭찬·진단·캐릭터)
  const fixed=await p.evaluate((page)=>{ const T=window.__T, C=T.CFG, TN=T.TIERNAME, D=window.__DATA__, o=[];
    o.push(C.title+"에 온 걸 환영해! 먼저 이름을 알려 줘", C.title+"에 온 걸 환영해! "+(C.ask||"책을 골라 볼까?"));
    o.push("같이 놀자!","반가워! 책을 골라 볼까?","우와! 책 한 권을 다 했어! 정말 멋진데~?","놀이 성공! 정말 멋진데~?","안녕! 같이 놀자!","짠! 같이 놀자!","안녕! 나랑 같이 놀자!");
    D.books.forEach(b=>{ o.push(b.title+"! 어떤 놀이를 할까?"); if(page==='mathdino') o.push("『"+b.title+"』 찾았다! 같이 놀아 볼까?","『"+b.title+"』 찾았다! 어떤 놀이를 할까?"); });
    if(page==='mathdino') o.push("잘 안 보여. 책 앞표지를 네모 안에 꽉 차게 보여 줄래?","읽은 책을 보여 줘! 책 앞표지를 네모 안에 보여 줘","음… 어떤 책인지 모르겠어. 다시 찍어 줄래?");
    if(page!=='words'){ o.push("수학 키 재기를 해 볼까? 맞아도 틀려도 괜찮아. 생각나는 대로 눌러 줘!"); TN.forEach(n=>o.push("수학 키 재기 끝! 정말 멋진데~? 오늘은 "+n+" 만큼 자랐어!", n+" 단계로 바꿨어! 같이 놀자!")); }
    o.push("뿌엥뿌엥~ 다시 해 볼까?");
    return o; },page);
  fixed.forEach(s=>ko.add(s));
  const said=await p.evaluate(()=>[...window.__said].map(x=>x.split('\t')));
  for(const [l,s] of said){ const t=s.replace(/\s+/g,' ').trim().split('테스트, ').join('').split('나는 테스트! ').join(''); if(!t) continue; if(l==='ko') ko.add(t); else L[l].add(t); }
  if(page==='words') for(const l of ['en','ja','zh']){ const w=await p.evaluate(l=>{ const D=window.__DATA__, o=new Set(); D.books.forEach(b=>b.words.forEach(x=>o.add(x[l][0]))); return [...o]; },l); w.forEach(x=>L[l].add(x)); }
  await ctx.close(); }
 const out={ko:[...ko].sort(), en:[...L.en].sort(), ja:[...L.ja].sort(), zh:[...L.zh].sort()};
 // 외국어 인사·칭찬
 out.en.push('Hello!','Great job!'); out.ja.push('こんにちは!','すごいね!'); out.zh.push('你好!','真棒!');
 for(const k of ['en','ja','zh']) out[k]=[...new Set(out[k])];
 fs.writeFileSync('data/phrases.json',JSON.stringify(out,null,0));
 const chars=out.ko.reduce((a,s)=>a+s.length,0);
 console.log('ko',out.ko.length,'phrases',chars,'chars | en',out.en.length,'ja',out.ja.length,'zh',out.zh.length,'| errors',errs.slice(0,5));
 await b.close(); })().catch(e=>{console.log('FAIL',e);process.exit(1);});
