// 말 걸기 시험: 오랜만 인사, 틀렸을 때 응원, 연속 정답, 놀이 끝 자랑
const {chromium}=require(process.env.PW+'/playwright-core');
(async()=>{ const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const p=await (await b.newContext({viewport:{width:1180,height:820}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{ window.__said=[]; window.__sayHook=s=>window.__said.push(s); });
 await p.goto('http://127.0.0.1:8766/mathdino.html'); await p.click('#startBtn'); await p.fill('#kn','하준'); await p.click('#kadd button[type=submit]');
 // 5시간 전에 왔던 걸로 하고 다시 들어오기
 await p.evaluate(()=>{ const o=JSON.parse(localStorage.getItem('mathdino-play-v2')); localStorage.setItem('goyu-last-'+o.cur,String(Date.now()-5*3600e3)); });
 await p.reload(); await p.evaluate(()=>{ window.__said.length=0; }); await p.click('#startBtn'); await p.waitForTimeout(300);
 const greet=await p.evaluate(()=>({bubble:document.getElementById('greet').textContent,said:window.__said.slice()}));
 const play=await p.evaluate(async()=>{ const T=window.__T, sleep=ms=>new Promise(r=>setTimeout(r,ms)); __said.length=0;
   T.openBook(window.__DATA__.books[0]); T.startLevel(0); await sleep(300);
   const miss=window.miss||null; T.S.miss=1; // 두 번째로 틀린 것처럼
   const out={}; out.missCheer=(()=>{ __said.length=0; return null; })();
   return {}; });
 // 틀림/맞음은 게임 함수로 직접
 const r=await p.evaluate(async()=>{ const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const T=window.__T, S=T.S, res={};
   __said.length=0; S.miss=1; T.missFn("그건 사과야"); await sleep(1000); res.miss2=__said.slice();
   S.streak=2; S.miss=0; __said.length=0; S.lock=false; T.winFn(); await sleep(600); res.streak3=__said.slice();
   await sleep(3200); __said.length=0; S.round=S.rounds-1; S.lock=false; S.miss=1; T.winFn(); await sleep(2600); res.done=__said.slice(); res.dtalk=document.getElementById('dtalk').textContent; return res; });
 console.log(JSON.stringify({greet,r},null,1)); console.log('errors',errs); await b.close(); })();
