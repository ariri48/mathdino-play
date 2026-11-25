// 그림 바꾼 뒤 화면 사진: 허브, 첫 화면, 놀이 몇 개
const {chromium}=require(process.env.PW+'/playwright-core');
(async()=>{ const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const p=await (await b.newContext({viewport:{width:1180,height:820}})).newPage(); const tag=process.argv[2]||'x'; const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://127.0.0.1:8766/index.html'); await p.waitForTimeout(800); await p.screenshot({path:`tools/art_${tag}_hub.png`});
 await p.goto('http://127.0.0.1:8766/mathdino.html'); await p.click('#startBtn'); await p.fill('#kn','콩이'); await p.click('#kadd button[type=submit]'); await p.waitForTimeout(800); await p.screenshot({path:`tools/art_${tag}_home.png`});
 for(const [t,bk,lv] of [[1,1,0],[2,4,1],[1,17,2],[3,29,0]]){ await p.evaluate(([t,bk,lv])=>{ const T=window.__T; T.setTier(t); T.openBook(window.__DATA__.books[bk-1]); T.startLevel(lv); },[t,bk,lv]); await p.waitForTimeout(900); await p.screenshot({path:`tools/art_${tag}_g${bk}_${lv}.png`}); }
 console.log('errors',errs); await b.close(); })();
