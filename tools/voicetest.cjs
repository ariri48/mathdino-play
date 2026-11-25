// 녹음 목소리 재생 시험: 여자아이/남자아이 폴더로 가는지, 이름 빼고 찾는지, 없는 말은 기기 음성인지
const {chromium}=require(process.env.PW+'/playwright-core');
(async()=>{ const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
 const p=await (await b.newContext()).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{ window.__plays=[]; const op=HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play=function(){ window.__plays.push(this.src.replace(location.origin+'/','')); return op.call(this); };
   window.__tts=[]; const sp=speechSynthesis.speak.bind(speechSynthesis); speechSynthesis.speak=u=>{ window.__tts.push(u.text); }; });
 await p.goto('http://127.0.0.1:8766/mathdino.html'); await p.waitForTimeout(500);
 await p.click('#startBtn'); await p.fill('#kn','콩이'); await p.selectOption('#kvk','boy'); await p.click('#kadd button[type=submit]'); await p.waitForTimeout(1500);
 const r1=await p.evaluate(()=>({plays:__plays.slice(),tts:__tts.slice()}));
 // 여자아이로 바꾸고 같은 말
 await p.click('#kidchip'); await p.click('.kvk button[data-vk=girl]'); await p.waitForTimeout(800);
 const r2=await p.evaluate(()=>({plays:__plays.slice(),tts:__tts.slice()}));
 // 없는 말 → 기기 음성, 틀린 말 대체
 await p.evaluate(()=>{ const T=window.__T; T.openBook(window.__DATA__.books[0]); }); await p.waitForTimeout(300);
 await p.evaluate(()=>{ window.__plays.length=0; window.__tts.length=0; });
 const r3=await p.evaluate(async()=>{ const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const T=window.__T; T.startLevel(0); await sleep(600); return {plays:__plays.slice(),tts:__tts.slice()}; });
 // 말놀이: 영어 낱말
 await p.goto('http://127.0.0.1:8766/words.html'); await p.waitForTimeout(500); await p.click('#startBtn'); await p.waitForTimeout(300);
 const r4=await p.evaluate(async()=>{ const sleep=ms=>new Promise(r=>setTimeout(r,ms)); __plays.length=0; __tts.length=0; const T=window.__T; T.openBook(window.__DATA__.books[0]); T.startLevel(0); await sleep(3500); return {plays:__plays.slice(),tts:__tts.slice()}; });
 console.log(JSON.stringify({r1,r2,r3,r4},null,1)); console.log('errors',errs); await b.close(); })();
