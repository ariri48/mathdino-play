// 내 방 기능 시험: 등록→얼굴 캐릭터→놀이 성공 보상→허브(미션·타이머·선생님·부모 메뉴·자랑 카드)→놀이 시간 끝
const {chromium}=require(process.env.PW+'/playwright-core');
const SH=process.env.SH||'tools/';
(async()=>{ const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--autoplay-policy=no-user-gesture-required','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
 const ctx=await b.newContext({viewport:{width:820,height:1180},deviceScaleFactor:1,hasTouch:true}); const p=await ctx.newPage(); const errs=[];
 p.on('pageerror',e=>errs.push('pageerror '+e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/favicon|manifest|icon-180|Failed to load resource/.test(m.text())) errs.push(m.text()); });
 await p.goto('http://127.0.0.1:8766/index.html'); await p.waitForTimeout(400);
 console.log('hub nokid visible:', await p.isVisible('#nokid'), 'kidstuff hidden:', !(await p.isVisible('#kidstuff')));
 await p.goto('http://127.0.0.1:8766/mathdino.html#kids'); await p.click('#startBtn'); await p.waitForTimeout(200);
 console.log('view:', await p.evaluate(()=>document.body.dataset.view));
 await p.fill('#kn','하준'); await p.selectOption('#ky','2022'); await p.click('#kadd button[type=submit]'); await p.waitForTimeout(300);
 console.log('after add view:', await p.evaluate(()=>document.body.dataset.view), 'onboard note:', await p.isVisible('#avOnboard'));
 await p.setInputFiles('#avFile', process.env.FX+'/face_test.jpg'); await p.waitForTimeout(1200);
 await p.screenshot({path:SH+'r_avedit.png'});
 await p.click('#avSave'); await p.waitForTimeout(500);
 console.log('home view:', await p.evaluate(()=>document.body.dataset.view), 'suit in buddy:', await p.evaluate(()=>!!document.querySelector('.gbud image[href*="suit_idle"]')));
 await p.screenshot({path:SH+'r_home.png'});
 // 놀이 하나 성공 → 보상
 const r=await p.evaluate(async()=>{ const T=window.__T, sleep=ms=>new Promise(r=>setTimeout(r,ms)); T.openBook(window.__DATA__.books[0]); T.startLevel(0);
   const ans=!document.getElementById('ansbar').hidden; const keys=Object.keys(T.S.nch||{});
   for(let i=0;i<5&&document.body.dataset.view==='play';i++){ T.S.lock=false; T.winFn(); await sleep(2300); }
   await sleep(300); return {view:document.body.dataset.view, reward:document.getElementById('dreward').innerText.replace(/\s+/g,' '), ansbar:ans, nch:keys}; });
 console.log('level:', JSON.stringify(r));
 await p.waitForTimeout(1500); await p.screenshot({path:SH+'r_done.png'});
 console.log('parseNums:', await p.evaluate(()=>[ROOM.parseNums('셋'),ROOM.parseNums('세 개요'),ROOM.parseNums('다섯 개'),ROOM.parseNums('열둘'),ROOM.parseNums('4개'),ROOM.parseNums('이거 일곱')]));
 // 자랑 카드
 await p.evaluate(()=>{ document.querySelectorAll('.rov').forEach(e=>e.remove()); }); await p.click('#dbrag'); await p.waitForTimeout(2500);
 console.log('brag card:', await p.evaluate(()=>{ const i=document.querySelector('.rcard'); return i&&i.naturalWidth; }));
 await p.screenshot({path:SH+'r_brag.png'});
 // 허브
 await p.goto('http://127.0.0.1:8766/index.html'); await p.waitForTimeout(800);
 console.log('hub title:', await p.textContent('#htitle'), '| say:', await p.textContent('#say'), '| stickers:', await p.textContent('#scount'), '| badges:', await p.textContent('#bcount'));
 await p.screenshot({path:SH+'r_hub.png',fullPage:true});
 await p.click('#mdone'); await p.waitForTimeout(800); console.log('mission done btn:', await p.textContent('#mdone'));
 await p.evaluate(()=>{ document.querySelectorAll('.rov').forEach(e=>e.remove()); });
 await p.click('[data-life=brush]'); await p.waitForTimeout(1300); await p.screenshot({path:SH+'r_timer.png'}); await p.click('.rov.life .rx'); await p.waitForTimeout(300);
 await p.click('#teach'); await p.waitForTimeout(300); for(let i=0;i<3;i++) await p.click('[data-plus]'); await p.click('[data-done]'); await p.waitForTimeout(200);
 await p.click('.rnum >> text="2"'); await p.waitForTimeout(200); const m1=await p.textContent('[data-msg]'); await p.click('.rnum >> text="3"'); await p.waitForTimeout(300); console.log('teach:', m1.trim(), '→', (await p.textContent('[data-msg]')).trim());
 await p.screenshot({path:SH+'r_teach.png'});
 await p.evaluate(()=>{ document.querySelectorAll('.rov').forEach(e=>e.remove()); });
 // 부모 메뉴: 확인 문제 풀기
 await p.click('[data-parent]'); await p.waitForTimeout(300);
 const q=await p.textContent('.gate p b'); const W={"다섯":5,"여섯":6,"일곱":7,"여덟":8,"아홉":9}; const [x,,y]=q.replace('는?','').split(' '); const ans=String(W[x]+W[y]);
 for(const ch of ans) await p.click(`.rpad [data-k="${ch}"]`); await p.click('.rpad [data-k="확인"]'); await p.waitForTimeout(400);
 console.log('parent menu open:', await p.isVisible('.rov.parent'));
 await p.click('.rov.parent summary >> text="아이 기록과 한 줄 메모"'); await p.click('.rov.parent summary >> text="엄마·아빠 목소리 녹음"'); await p.waitForTimeout(300);
 await p.screenshot({path:SH+'r_parent.png'});
 await p.click('.rov.parent summary >> text="가족 쪽지 보내기"'); await p.fill('[data-text]','어제 정말 잘했어! 사랑해'); await p.click('[data-send]'); await p.click('[data-l="10"]');
 await p.evaluate(()=>{ document.querySelectorAll('.rov').forEach(e=>e.remove()); });
 // 놀이 시간 끝 → 졸린 공룡
 await p.evaluate(()=>{ const s=ROOM.st(); s.sec[ROOM.day()]=10*60; ROOM.sv(s); }); await p.waitForTimeout(5600);
 console.log('sleep overlay:', await p.isVisible('.rov.sleep'));
 await p.screenshot({path:SH+'r_sleep.png'});
 // 쪽지: 다시 들어오면 보임
 await p.evaluate(()=>{ const x=JSON.parse(localStorage.getItem('goyu-parent')); x.limit=0; localStorage.setItem('goyu-parent',JSON.stringify(x)); });
 await p.goto('http://127.0.0.1:8766/mathforce.html'); await p.click('#startBtn'); await p.waitForTimeout(2500); console.log('note shown:', await p.isVisible('.rov.note'));
 // 색칠 넣기
 await p.goto('http://127.0.0.1:8766/index.html'); await p.waitForTimeout(500); await p.click('#color'); await p.waitForTimeout(300);
 const [fc]=await Promise.all([p.waitForEvent('filechooser'), p.click('.rcell >> nth=0')]); await fc.setFiles(process.env.FX+'/color_test.png'); await p.waitForTimeout(900);
 await p.screenshot({path:SH+'r_crop.png'}); await p.click('[data-ok]'); await p.waitForTimeout(800);
 console.log('colored saved:', await p.evaluate(()=>Object.keys(ROOM.COL)));
 await p.goto('http://127.0.0.1:8766/mathdino.html'); await p.click('#startBtn'); await p.waitForTimeout(1200);
 console.log('symbol swapped:', await p.evaluate(()=>{ const s=document.getElementById('g-apple'); return s&&s.innerHTML.slice(0,40); }));
 console.log('errors', errs); await b.close(); })();
