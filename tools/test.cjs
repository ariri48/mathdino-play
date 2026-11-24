const {chromium}=require(process.env.PW+'/playwright-core');
(async()=>{ const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const ctx=await b.newContext({viewport:{width:1180,height:820},deviceScaleFactor:1}); const p=await ctx.newPage(); const errs=[];
 p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/favicon|manifest|icon-180|Failed to load resource/.test(m.text())) errs.push(m.text()); });
 await p.goto('http://127.0.0.1:8766/mathdino.html'); await p.click('#startBtn');
 // 첫 실행: 아이 등록 화면
 console.log('view after start:', await p.evaluate(()=>document.body.dataset.view));
 await p.fill('#kn','첫째'); await p.selectOption('#ky','2023'); await p.selectOption('#km','1'); console.log('prev:', await p.textContent('#kprev'));
 await p.click('#kadd button[type=submit]'); console.log('view:', await p.evaluate(()=>document.body.dataset.view), 'chip:', await p.textContent('#kidchip'));
 await p.click('#kidchip'); await p.fill('#kn','둘째'); await p.selectOption('#ky','2024'); await p.selectOption('#km','8'); await p.click('#kadd button[type=submit]');
 console.log('chip2:', await p.textContent('#kidchip'));
 await p.screenshot({path:'tools/shot_home.png'});
 await p.click('#kidchip'); await p.screenshot({path:'tools/shot_kids.png'});
 // 전체 렌더 시험
 const res=await p.evaluate(async()=>{ const T=window.__T, out={}; const D=window.__DATA__; const sleep=ms=>new Promise(r=>setTimeout(r,ms));
   for(let t=0;t<4;t++){ T.setTier(t); let n=0, empty=[];
     for(const bk of D.books){ T.openBook(bk); for(let i=0;i<5;i++){ T.startLevel(i); for(let r=0;r<3;r++){ T.S.round=r; T.S.lock=false; try{ T.playRound(); }catch(e){ empty.push(bk.no+'-'+i+' '+e.message); } const st=document.getElementById('stage'); const pad=!document.getElementById('pad').classList.contains('hide'); if(!pad&&st.childNodes.length<2) empty.push(bk.no+'-'+i+' empty'); n++; } } }
     out[t]={n,bad:empty.slice(0,8)}; }
   return out; });
 console.log(JSON.stringify(res));
 // 단계별 화면 사진: 몇 가지 놀이
 const pick=[[1,0],[4,1],[17,2],[29,0],[23,3],[2,3]];
 for(const t of [0,3]) for(const [bk,lv] of pick){ await p.evaluate(([t,bk,lv])=>{ const T=window.__T; T.setTier(t); T.openBook(window.__DATA__.books[bk-1]); T.startLevel(lv); window.speechSynthesis.cancel(); },[t,bk,lv]); await p.waitForTimeout(150); await p.screenshot({path:`tools/shot_t${t}_${bk}_${lv}.png`}); }
 // 정답/오답 + 힌트 시험 (아기 단계, count 놀이)
 const h=await p.evaluate(async()=>{ const T=window.__T; T.setTier(0); T.openBook(window.__DATA__.books[0]); T.startLevel(0); const sleep=ms=>new Promise(r=>setTimeout(r,ms));
   const lv=window.__DATA__.books[0].levels[0].g; const gs=[...document.querySelectorAll('#stage > g')].filter(g=>g.querySelector('.choice')); 
   const bad=gs.find(g=>!g.querySelector('.choice')||true); // first choice
   const ev=(n)=>n.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));
   let wrong=null; for(const g of gs){ ev(g); await sleep(50); if(document.getElementById('bubble').classList.contains('oops')){ wrong=g; break; } if(T.S.lock) break; }
   await sleep(1200); const hinted=document.querySelectorAll('.glow').length; return {game:lv,choices:gs.length,hinted,rounds:T.S.rounds}; });
 console.log('hint test', JSON.stringify(h));
 console.log('errors', errs.slice(0,10)); await b.close(); })().catch(e=>{console.log('FAIL',e);process.exit(1);});
