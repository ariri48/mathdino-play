const {chromium}=require(process.env.PW+'/playwright-core'); const D=__dirname+'/shots3/';
(async()=>{ const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const ctx=await b.newContext({viewport:{width:1180,height:820}}); const p=await ctx.newPage(); const errs=[];
 p.on('pageerror',e=>errs.push(p.url().split('/').pop()+': '+e.message)); p.on('console',m=>{ if(m.type()==='error'&&!/Failed to load resource/.test(m.text())) errs.push(m.text()); });
 await p.goto('http://127.0.0.1:8766/index.html'); await p.screenshot({path:D+'0_hub_empty.png'});
 await p.goto('http://127.0.0.1:8766/words.html'); await p.click('#startBtn'); await p.fill('#kn','첫째'); await p.selectOption('#ky','2023'); await p.selectOption('#km','1'); await p.click('#kadd button[type=submit]');
 await p.screenshot({path:D+'1_words_home.png'});
 for(const lang of ['en','ja','zh']){ const r=await p.evaluate(async(lang)=>{ const T=window.__T; window.__T.S.lang=lang; const bad=[]; for(let t=0;t<4;t++){ T.setTier(t); for(const bk of window.__DATA__.books){ T.openBook(bk); for(let i=0;i<5;i++){ T.startLevel(i); for(let r=0;r<3;r++){ T.S.round=r; T.S.lock=false; try{ T.playRound(); }catch(e){ bad.push(bk.no+'-'+i+' '+e.message); } if(document.getElementById('stage').childNodes.length<3) bad.push(bk.no+'-'+i+' empty'); } } } } return bad.slice(0,5); },lang); console.log('words',lang,JSON.stringify(r)); }
 const shots=[[1,0,'en'],[1,1,'ja'],[2,2,'zh'],[3,3,'en'],[4,1,'zh'],[6,4,'ja']];
 for(const [bk,lv,lang] of shots){ await p.evaluate(([bk,lv,lang])=>{ const T=window.__T; T.S.lang=lang; T.setTier(1); T.openBook(window.__DATA__.books[bk-1]); T.startLevel(lv); speechSynthesis.cancel(); },[bk,lv,lang]); await p.waitForTimeout(250); await p.screenshot({path:D+`2_words_${bk}_${lv}_${lang}.png`}); }
 await p.goto('http://127.0.0.1:8766/mathforce.html'); await p.click('#startBtn'); await p.screenshot({path:D+'3_force_home.png'});
 const r2=await p.evaluate(async()=>{ const T=window.__T; const bad=[]; for(let t=0;t<4;t++){ T.setTier(t); for(const bk of window.__DATA__.books){ T.openBook(bk); for(let i=0;i<5;i++){ T.startLevel(i); for(let r=0;r<3;r++){ T.S.round=r; T.S.lock=false; try{ T.playRound(); }catch(e){ bad.push(bk.no+'-'+i+' '+e.message); } const pad=!document.getElementById('pad').classList.contains('hide'); if(!pad&&document.getElementById('stage').childNodes.length<3) bad.push(bk.no+'-'+i+' empty'); } } } } return bad.slice(0,8); });
 console.log('force', JSON.stringify(r2));
 for(const [bk,lv] of [[10,0],[27,1],[2,0]]){ await p.evaluate(([bk,lv])=>{ const T=window.__T; T.setTier(2); T.openBook(window.__DATA__.books[bk-1]); T.startLevel(lv); speechSynthesis.cancel(); },[bk,lv]); await p.waitForTimeout(250); await p.screenshot({path:D+`4_force_${bk}_${lv}.png`}); }
 await p.goto('http://127.0.0.1:8766/mathdino.html'); await p.click('#startBtn'); await p.screenshot({path:D+'5_dino_home.png'});
 await p.evaluate(()=>{ const T=window.__T; T.setTier(1); T.openBook(window.__DATA__.books[2]); T.startLevel(0); speechSynthesis.cancel(); }); await p.waitForTimeout(250); await p.screenshot({path:D+'6_dino_play.png'});
 await p.goto('http://127.0.0.1:8766/index.html'); await p.screenshot({path:D+'7_hub_kid.png'});
 console.log('errors',errs.slice(0,8)); await b.close(); })().catch(e=>{ console.log('FAIL',e.message); process.exit(1); });
