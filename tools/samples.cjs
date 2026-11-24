const {chromium}=require(process.env.PW+'/playwright-core'); const fs=require('fs');
(async()=>{ const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true}); const p=await b.newPage();
 await p.goto('http://127.0.0.1:8766/tools/samples.html'); const o=await p.evaluate(()=>window.__out);
 fs.writeFileSync(__dirname+'/sample_face.jpg',Buffer.from(o[0].split(',')[1],'base64')); fs.writeFileSync(__dirname+'/sample_draw.jpg',Buffer.from(o[1].split(',')[1],'base64')); await b.close(); })();
