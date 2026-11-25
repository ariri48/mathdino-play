// 기기별 화면 시험: 아이폰·아이패드(사파리 엔진), 갤럭시·갤럭시 탭(크롬 엔진), 세로·가로
const pw=require(process.env.PW+'/playwright-core');
const SH=process.env.SH||'tools/';
const DEV=[
 ['iphone','webkit',{width:393,height:852},3,true],
 ['iphone-land','webkit',{width:852,height:393},3,true],
 ['ipad','webkit',{width:820,height:1180},2,true],
 ['ipad-land','webkit',{width:1180,height:820},2,true],
 ['galaxy','chromium',{width:360,height:780},3,true],
 ['tab-land','chromium',{width:1280,height:800},2,true],
];
const seed=()=>{ if(localStorage.getItem('mathdino-play-v2')) return; localStorage.setItem('mathdino-play-v2',JSON.stringify({kids:[{id:'k1',name:'하준',ym:'2022-3',adj:0,vk:'boy'}],cur:'k1',prog:{k1:{}}})); };
(async()=>{ const out=[];
 for(const [name,eng,vp,dpr,touch] of DEV){
  const b=await pw[eng].launch(eng==='chromium'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true}:{headless:true});
  const ctx=await b.newContext({viewport:vp,deviceScaleFactor:dpr,hasTouch:touch,isMobile:eng==='chromium'}); await ctx.addInitScript(seed);
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  const ov=async(tag)=>{ const r=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth})); if(r.sw>r.iw+1) errs.push(tag+' 가로 넘침 '+r.sw+'>'+r.iw); };
  await p.goto('http://127.0.0.1:8766/index.html'); await p.waitForTimeout(900); await ov('hub'); await p.screenshot({path:SH+'d_'+name+'_hub.png'});
  await p.goto('http://127.0.0.1:8766/mathdino.html'); await p.click('#startBtn'); await p.waitForTimeout(500); await ov('home'); await p.screenshot({path:SH+'d_'+name+'_home.png'});
  // 숫자 고르기 놀이(count)를 찾아서 시작
  const info=await p.evaluate(()=>{ const T=window.__T, D=window.__DATA__; for(const bk of D.books){ for(let i=0;i<bk.levels.length;i++){ if(bk.levels[i].g==='count'){ T.openBook(bk); T.startLevel(i); const st=document.getElementById('stage').getBoundingClientRect(); return {book:bk.no,lv:i,ans:!document.getElementById('ansbar').hidden,stage:[Math.round(st.width),Math.round(st.height)],bottom:Math.round(st.bottom),ih:innerHeight}; } } } });
  await p.waitForTimeout(400); await ov('play'); await p.screenshot({path:SH+'d_'+name+'_play.png'});
  await p.evaluate(async()=>{ const T=window.__T, sleep=ms=>new Promise(r=>setTimeout(r,ms)); for(let i=0;i<5&&document.body.dataset.view==='play';i++){ T.S.lock=false; T.winFn(); await sleep(2300); } });
  await p.waitForTimeout(1200); await ov('done'); await p.screenshot({path:SH+'d_'+name+'_done.png'});
  await p.evaluate(()=>document.querySelectorAll('.rov').forEach(e=>e.remove()));
  await p.goto('http://127.0.0.1:8766/index.html'); await p.waitForTimeout(600); await p.click('[data-life=brush]'); await p.waitForTimeout(800); await ov('timer'); await p.screenshot({path:SH+'d_'+name+'_timer.png'});
  out.push({name,info,errs}); await b.close(); }
 console.log(JSON.stringify(out,null,1)); })();
