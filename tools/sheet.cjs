const {chromium}=require(process.env.PW+'/playwright-core');
(async()=>{ const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true}); const p=await b.newPage({viewport:{width:1200,height:800}});
 await p.goto('http://127.0.0.1:8766/'+process.argv[2]); await p.screenshot({path:process.argv[3],fullPage:true}); await b.close(); })();
