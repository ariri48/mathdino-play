const {chromium}=require(process.env.PW+'/playwright-core');
(async()=>{ const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--use-angle=metal','--enable-gpu']});
 const p=await b.newPage(); p.on('console',m=>{ if(m.type()==='error') console.log('ERR',m.text()); }); p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto(process.argv[2]); await p.waitForFunction(()=>window.__done,null,{timeout:Number(process.argv[3]||600000),polling:2000});
 console.log(await p.$eval('#o',e=>e.textContent)); await b.close(); })().catch(e=>{console.log('FAIL',e.message);process.exit(1);});
