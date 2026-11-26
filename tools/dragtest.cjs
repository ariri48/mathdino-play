const pw=require(process.env.PW+'/playwright-core');
const seed=()=>{ localStorage.setItem('mathdino-play-v2',JSON.stringify({kids:[{id:'k1',name:'하준',ym:'2021-3',adj:0,vk:'boy'}],cur:'k1',prog:{k1:{}}})); localStorage.setItem('goyu-parent','{"limit":0}'); };
(async()=>{ for(const [eng,vp] of [['webkit',{width:393,height:852}],['chromium',{width:1180,height:820}],['webkit',{width:852,height:393}]]){
  const b=await pw[eng].launch(eng==='chromium'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true}:{headless:true});
  const p=await (await b.newContext({viewport:vp})).newPage(); await p.addInitScript(seed); await p.goto('http://127.0.0.1:8766/mathdino.html'); await p.click('#startBtn'); await p.waitForTimeout(300);
  for(const gname of ['sort','puzzle','share']){
    await p.evaluate((gname)=>{ const T=window.__T, D=window.__DATA__; for(const bk of D.books) for(let i=0;i<bk.levels.length;i++) if(bk.levels[i].g===gname){ T.setTier(2); T.openBook(bk); T.startLevel(i); return; } },gname); await p.waitForTimeout(400);
    const r=await p.evaluate(()=>{ const n=[...document.querySelectorAll('#stage g')].find(g=>g.style.cursor==='grab'); if(!n) return null; const q=n.getBoundingClientRect(); n.id='dragme'; return {x:q.x+q.width/2,y:q.y+q.height/2}; });
    if(!r){ console.log(gname,'no draggable'); continue; }
    await p.mouse.move(r.x,r.y); await p.mouse.down(); await p.mouse.move(r.x+40,r.y-60,{steps:5});
    const q=await p.evaluate(()=>{ const b=document.getElementById('dragme').getBoundingClientRect(); return {x:b.x+b.width/2,y:b.y+b.height/2}; });
    await p.mouse.up(); console.log(eng,vp.width+'x'+vp.height,gname,'moved',Math.round(q.x-r.x),Math.round(q.y-r.y),'(want 40,-60)'); }
  await b.close(); } })();
