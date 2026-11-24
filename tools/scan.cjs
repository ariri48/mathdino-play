const {chromium}=require(process.env.PW+'/playwright-core');
(async()=>{ const n=process.argv[2]; const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,
  args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream',`--use-file-for-fake-video-capture=${__dirname}/fake_${n}.mjpeg`]});
 const ctx=await b.newContext({viewport:{width:1180,height:820},permissions:['camera']}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://127.0.0.1:8766/index.html'); await p.evaluate(()=>{ localStorage.setItem('mathdino-play-v2',JSON.stringify({kids:[{id:'a',name:'첫째',ym:'2023-1',adj:0}],cur:'a',prog:{}})); }); await p.reload();
 await p.click('#startBtn'); const t0=Date.now(); await p.click('#scanBtn');
 await p.waitForTimeout(2500); await p.screenshot({path:`${__dirname}/shot_scan_${n}.png`});
 await p.waitForFunction(()=>document.body.dataset.view==='book',null,{timeout:15000}).catch(()=>{});
 console.log('book', n, '->', await p.textContent('#bno'), await p.textContent('#btitle'), 'view', await p.evaluate(()=>document.body.dataset.view), ((Date.now()-t0)/1000).toFixed(1)+'s', 'msg', await p.textContent('#scanmsg'), errs);
 await b.close(); })();
