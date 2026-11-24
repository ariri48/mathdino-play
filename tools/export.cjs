const {chromium}=require(process.env.PW+'/playwright-core'); const fs=require('fs');
(async()=>{ const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const p=await b.newPage(); p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto('http://127.0.0.1:8766/tools/eval.html?m=mobilenet_v2_100_224&ns=14&export=1'); await p.waitForFunction(()=>window.__done,null,{timeout:600000,polling:2000});
 const s=await p.evaluate(()=>window.__export); fs.writeFileSync('data/refs.bin',Buffer.from(s,'base64')); console.log(await p.$eval('#o',e=>e.textContent)); await b.close(); })();
