// 화면 모양별 놀이판 사진: 여러 놀이를 세로 휴대폰·가로 휴대폰·태블릿에서
const pw=require(process.env.PW+'/playwright-core'); const SH=process.env.SH||'tools/';
const DEV=(process.env.DEV||'iphone:webkit:393x852,galaxy:chromium:360x780,iphone-land:webkit:852x393,ipad:webkit:820x1180').split(',').map(s=>{ const [n,e,v]=s.split(':'); const [w,h]=v.split('x').map(Number); return [n,e,{width:w,height:h}]; });
const GAMES=(process.env.GAMES||'count,heavy,clock,sort,maze,puzzle,compare,coins,pattern,order').split(',');
const seed=()=>{ if(localStorage.getItem('mathdino-play-v2')) return; localStorage.setItem('mathdino-play-v2',JSON.stringify({kids:[{id:'k1',name:'하준',ym:'2021-3',adj:0,vk:'boy'}],cur:'k1',prog:{k1:{}}})); localStorage.setItem('goyu-parent','{"limit":0}'); };
(async()=>{ const res={};
 for(const [name,eng,vp] of DEV){ const b=await pw[eng].launch(eng==='chromium'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true}:{headless:true});
  const ctx=await b.newContext({viewport:vp,deviceScaleFactor:2,hasTouch:true}); await ctx.addInitScript(seed); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8766/mathdino.html'); await p.click('#startBtn'); await p.waitForTimeout(300);
  for(const gname of GAMES){ const ok=await p.evaluate((gname)=>{ const T=window.__T, D=window.__DATA__; for(const bk of D.books){ for(let i=0;i<bk.levels.length;i++) if(bk.levels[i].g===gname){ T.setTier(2); T.openBook(bk); T.startLevel(i); speechSynthesis.cancel(); return true; } } return false; },gname);
    if(!ok) continue; await p.waitForTimeout(gname==='subtract'?1200:350); await p.screenshot({path:SH+'f_'+name+'_'+gname+'.png'}); }
  res[name]=errs; await b.close(); }
 console.log(JSON.stringify(res)); })();
