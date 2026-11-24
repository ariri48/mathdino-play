const {chromium}=require(process.env.PW+'/playwright-core');
(async()=>{ const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true}); const p=await b.newPage({viewport:{width:1200,height:630}});
 await p.goto('http://127.0.0.1:8766/tools/og.html'); await p.waitForTimeout(1500); await p.screenshot({path:process.argv[2],clip:{x:0,y:0,width:1200,height:630}}); await b.close(); })();
