// 휴대폰 폭(390px) 화면 사진: 허브, 수학공룡 첫 화면, 아이 화면, 말놀이 주제 화면
const {chromium}=require(process.env.PW+'/playwright-core');
(async()=>{ const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true}); const p=await ctx.newPage(); const tag=process.argv[2]||'a';
 const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://127.0.0.1:8766/index.html'); await p.waitForTimeout(400); await p.screenshot({path:`tools/m_${tag}_hub.png`});
 await p.goto('http://127.0.0.1:8766/mathdino.html'); await p.click('#startBtn'); await p.fill('#kn','콩이'); await p.click('#kadd button[type=submit]'); await p.waitForTimeout(300); await p.click('#avBack');
 await p.screenshot({path:`tools/m_${tag}_home.png`}); await p.click('#kidchip'); await p.waitForTimeout(200); await p.screenshot({path:`tools/m_${tag}_kids.png`,fullPage:true});
 await p.goto('http://127.0.0.1:8766/words.html'); await p.click('#startBtn'); await p.waitForTimeout(200); await p.evaluate(()=>window.__T.openBook(window.__DATA__.books[0])); await p.waitForTimeout(200); await p.screenshot({path:`tools/m_${tag}_wbook.png`});
 const w=await p.evaluate(()=>document.documentElement.scrollWidth); console.log('scrollWidth',w,'errors',errs); await b.close(); })();
