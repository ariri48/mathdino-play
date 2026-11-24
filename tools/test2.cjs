const {chromium}=require(process.env.PW+'/playwright-core');
const D=__dirname+'/shots2/';
(async()=>{ const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const p=await (await b.newContext({viewport:{width:1180,height:820}})).newPage(); const errs=[];
 p.on('pageerror',e=>errs.push(e.stack.split('\n').slice(0,4).join(' | '))); p.on('console',m=>{ if(m.type()==='error'&&!/Failed to load resource/.test(m.text())) errs.push(m.text()); });
 await p.goto('http://127.0.0.1:8766/index.html'); await p.click('#startBtn');
 await p.fill('#kn','첫째'); await p.selectOption('#ky','2023'); await p.selectOption('#km','1'); await p.click('#kadd button[type=submit]');
 await p.screenshot({path:D+'1_home_default.png'});
 // 사진 캐릭터
 await p.click('#kidchip'); await p.click('.kav-btn'); await p.setInputFiles('#avFile',__dirname+'/sample_face.jpg'); await p.waitForTimeout(1500);
 await p.screenshot({path:D+'2_edit_photo.png'});
 for(const pose of ['cheer','dizzy','sad','crown']){ await p.click(`#avPoses [data-pose=${pose}]`); await p.waitForTimeout(250); await (await p.$('#avPrev')).screenshot({path:D+`3_pose_${pose}.png`}); }
 await p.click('#avSuits .suit:nth-child(3)'); await p.click('#avSave'); await p.waitForTimeout(500);
 await p.screenshot({path:D+'4_home_photo.png'});
 // 둘째: 그림 캐릭터
 await p.click('#kidchip'); await p.fill('#kn','둘째'); await p.selectOption('#ky','2024'); await p.selectOption('#km','8'); await p.click('#kadd button[type=submit]');
 await p.click('#kidchip'); await p.click('.kid:nth-child(2) .kav-btn'); await p.click('#avMode [data-mode=draw]'); await p.setInputFiles('#avFile',__dirname+'/sample_draw.jpg'); await p.waitForTimeout(1500);
 await p.screenshot({path:D+'5_edit_draw.png'}); await p.click('#avSave'); await p.waitForTimeout(400);
 await p.click('#kidchip'); await p.screenshot({path:D+'6_kids.png'});
 // 첫째로 놀이: 미로(내 캐릭터), 정답/오답 포즈
 await p.click('.kid:nth-child(1) .kpick'); await p.waitForTimeout(300);
 await p.evaluate(()=>{ const T=window.__T; T.openBook(window.__DATA__.books[16]); T.startLevel(2); });
 await p.waitForTimeout(400); await p.screenshot({path:D+'7_play_maze_me.png'});
 await p.evaluate(()=>{ const T=window.__T; for(const bk of window.__DATA__.books){ const i=bk.levels.findIndex(l=>l.g==='count'); if(i>=0){ T.openBook(bk); T.startLevel(i); return; } } });
 await p.evaluate(()=>{ window.__T.S.round=0; }); await p.waitForTimeout(300);
 // 오답
 await p.evaluate(()=>{ const gs=[...document.querySelectorAll('#stage > g')]; const ev=n=>n.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); const S=window.__T.S; let ok=null; S.hintFn&&(S.hintFn(), ok=document.querySelector('.glow')); const w=gs.filter(g=>g.querySelector('.choice')&&g!==ok); ev(w[0]); });
 await p.waitForTimeout(700); await p.screenshot({path:D+'8_play_miss.png'});
 // 공유 놀이 (me 포함)
 const sh=await p.evaluate(()=>{ const T=window.__T; for(const bk of window.__DATA__.books){ const i=bk.levels.findIndex(l=>l.g==='share'); if(i>=0){ T.openBook(bk); T.startLevel(i); return bk.no+'/'+i; } } });
 await p.waitForTimeout(300); await p.screenshot({path:D+'9_share_me.png'});
 // 진단: 정답 위주로 진행 (정답 노드 찾기 = hintFn 노드). 무작위 대신 정답/오답 교대로 일부
 await p.evaluate(()=>{ window.__T.diagStart(); }); await p.waitForTimeout(3000); await p.screenshot({path:D+'10_diag_q1.png'});
 const log=[]; for(let i=0;i<20;i++){ const st=await p.evaluate(()=>{ const dg=window.__T.DG(); return dg? {step:dg.step,total:dg.total}:null; }); if(!st) break; log.push(st.step);
   const correct = st.step<9; // 9단계부터는 틀리게
   await p.evaluate((correct)=>{ const S=window.__T.S; let hit=null; const ev=n=>n.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));
     if(S.hintFn){ const before=new Set(document.querySelectorAll('.glow')); S.hintFn(); const h=[...document.querySelectorAll('.glow')].find(x=>!before.has(x)); if(h){ h.classList.remove('glow'); hit=h; } }
     const gs=[...document.querySelectorAll('#stage > g')].filter(g=>g.querySelector('.choice,.panel')||g.getAttribute('transform'));
     if(correct&&hit){ ev(hit); return; }
     const grays=[...document.querySelectorAll('#stage g.gray')]; const big=[...document.querySelectorAll('#stage > text')].map(t=>+t.textContent).find(v=>v>0);
     if(grays.length&&big){ const k=correct?big:big+1; for(let i=0;i<k&&i<grays.length;i++) ev(grays[i]); return; }
     const wrong=gs.find(g=>g!==hit&&(g.querySelector('.choice')||g.querySelector('.panel'))); if(wrong) ev(wrong); else if(hit) ev(hit); else ev(gs[0]); },correct);
   await p.waitForTimeout(1500); }
 console.log('diag steps', log.join(','), 'view', await p.evaluate(()=>document.body.dataset.view));
 await p.waitForTimeout(500); await p.screenshot({path:D+'11_diag_result.png'});
 console.log('result', await p.textContent('#drec'), '|', await p.textContent('#dnow'));
 if(await p.isVisible('#dapply')){ await p.click('#dapply'); console.log('chip after apply', await p.textContent('#kidchip')); }
 await p.screenshot({path:D+'12_home_after.png'});
 console.log('errors', errs.slice(0,8)); await b.close(); })().catch(e=>{ console.log('FAIL',e.message); process.exit(1); });
