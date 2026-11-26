// 놀이 조절 시험: 숨은 단추 2초 꾹 → 부모님 확인 → 단계·보기·힌트·문제 수 바꾸기 → 지금 놀이에 바로 반영
const {chromium,webkit}=require(process.env.PW+'/playwright-core');
const SH=process.env.SH||'tools/';
async function gate(p){ const q=await p.textContent('.gate p b'); const W={"다섯":5,"여섯":6,"일곱":7,"여덟":8,"아홉":9}; const [x,,y]=q.replace('는?','').split(' ');
  for(const ch of String(W[x]+W[y])) await p.click(`.rpad [data-k="${ch}"]`); await p.click('.rpad [data-k="확인"]'); await p.waitForTimeout(400); }
async function hold(p,ms){ const bx=await p.locator('#play [data-secret]').boundingBox(); await p.mouse.move(bx.x+bx.width/2,bx.y+bx.height/2); await p.mouse.down(); await p.waitForTimeout(ms); await p.mouse.up(); await p.waitForTimeout(300); }
(async()=>{ const eng=process.env.ENG==='webkit'?webkit:chromium;
 const b=await eng.launch(process.env.ENG==='webkit'?{headless:true}:{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const ctx=await b.newContext({viewport:{width:+(process.env.W||820),height:+(process.env.H||1180)},hasTouch:true}); const p=await ctx.newPage(); const errs=[];
 p.on('pageerror',e=>errs.push('pageerror '+e.message));
 await p.goto('http://127.0.0.1:8766/mathdino.html#kids'); await p.click('#startBtn'); await p.waitForTimeout(200);
 await p.fill('#kn','하준'); await p.selectOption('#ky','2022'); await p.click('#kadd button[type=submit]'); await p.waitForTimeout(300); await p.click('#avBack'); await p.waitForTimeout(200);
 await p.click('#kidchip'); await p.waitForTimeout(200); console.log('kids screen adj buttons gone:', (await p.locator('.kid .adj').count())===0, 'note:', await p.isVisible('.adjnote'));
 await p.click('#kidsBack'); await p.waitForTimeout(200);
 let gi=-1; for(let i=0;i<20&&gi<0;i++){ await p.click('#shelf .bk >> nth='+i); await p.waitForTimeout(100); gi=await p.evaluate(()=>__T.S.book.levels.findIndex(l=>l.g==='count'||l.g==='add')); if(gi<0) await p.click('#book .back'); }
 console.log('game:', await p.evaluate(i=>__T.S.book.levels[i].g,gi));
 await p.evaluate(i=>__T.startLevel(i<0?0:i),gi); await p.waitForTimeout(600);
 const n0=await p.evaluate(()=>Object.keys(__T.S.nch||{}).length), r0=await p.evaluate(()=>__T.S.rounds);
 console.log('secret visible:', await p.isVisible('#play [data-secret]'), 'choices before:', n0, 'rounds before:', r0);
 await hold(p,700); console.log('short hold opens gate?', await p.isVisible('.gate'));
 await hold(p,2300); console.log('long hold opens gate:', await p.isVisible('.gate')); await gate(p);
 console.log('adjust open:', await p.isVisible('.adjust'), 'play controls:', await p.locator('.adjust [data-p]').count());
 await p.click('.adjust [data-o=nch][data-v="4"]'); await p.waitForTimeout(200);
 await p.click('.adjust [data-o=rounds][data-v="1"]'); await p.waitForTimeout(200);
 await p.click('.adjust [data-t="3"]'); await p.waitForTimeout(200);
 await p.screenshot({path:SH+'adjust_panel.png'});
 await p.click('.adjust [data-done]'); await p.waitForTimeout(500);
 const n1=await p.evaluate(()=>Object.keys(__T.S.nch||{}).length), r1=await p.evaluate(()=>__T.S.rounds);
 const k=await p.evaluate(()=>JSON.parse(localStorage.getItem('mathdino-play-v2')).kids[0]);
 console.log('choices after:', n1, 'rounds after:', r1, 'saved:', JSON.stringify({adj:k.adj,nch:k.nch,rounds:k.rounds}));
 await hold(p,2300); await gate(p); await p.click('.adjust [data-p=skip]'); await p.waitForTimeout(900);
 console.log('skip → view:', await p.evaluate(()=>document.body.dataset.view));
 await p.click('#dbook'); await p.waitForTimeout(200); await p.evaluate(()=>__T.startLevel(0)); await p.waitForTimeout(500);
 await hold(p,2300); await gate(p); await p.click('.adjust [data-reset]'); await p.waitForTimeout(200);
 const k2=await p.evaluate(()=>JSON.parse(localStorage.getItem('mathdino-play-v2')).kids[0]); console.log('reset saved:', JSON.stringify({adj:k2.adj,nch:k2.nch,rounds:k2.rounds}));
 await p.click('.adjust [data-done]'); await p.waitForTimeout(300);
 await p.goto('http://127.0.0.1:8766/mathdino.html'); await p.click('#startBtn'); await p.waitForTimeout(400);
 await p.click('[data-parent]'); await p.waitForTimeout(300); await gate(p); console.log('parent menu has 놀이 조절:', await p.locator('.parent [data-adj] [data-t]').count()===4);
 await p.goto('http://127.0.0.1:8766/index.html'); await p.waitForTimeout(400); await p.click('[data-parent]'); await p.waitForTimeout(300); await gate(p);
 console.log('hub parent menu 놀이 조절:', await p.locator('.parent [data-adj] [data-t]').count()===4);
 console.log('errors:', errs.length?errs:'none'); await b.close(); })();
