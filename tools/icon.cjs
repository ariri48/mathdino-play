const {chromium}=require(process.env.PW+'/playwright-core');
(async()=>{ const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 for(const s of [512,180]){ const p=await b.newPage({viewport:{width:512,height:512},deviceScaleFactor:s/512}); await p.goto('http://127.0.0.1:8766/tools/icon.html'); await p.screenshot({path:`icon-${s}.png`}); }
 await b.close(); })();
