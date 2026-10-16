import {chromium} from "playwright";
import assert from "node:assert/strict";
const browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
const page=await browser.newPage({viewport:{width:430,height:860},deviceScaleFactor:1});
const errors=[];page.on("pageerror",e=>errors.push(e.message));
try{
 const r=await page.goto("http://127.0.0.1:8000/gioco/girasole-variabile/",{waitUntil:"domcontentloaded",timeout:45000});
 assert.equal(r.status(),200);
 await page.waitForFunction(()=>document.querySelector("#loading").hidden,{timeout:55000});
 assert.equal(await page.locator("#stage canvas").count(),1);
 const n=parseInt((await page.locator("#counter").textContent()).split("/")[1]);
 assert.ok(n>=9&&n<=21,"Round 1 ray count "+n);
 console.log("sunflower first count",n);
 await page.locator("#stage canvas").screenshot({path:"girasole-variabile-3d.png",timeout:45000});
 await page.locator("#startYes").click();
 for(let i=0;i<n;i++) await page.locator("#pluck").click();
 const z=await page.locator("#counter").textContent();
 assert.equal(z,"0 / "+n,"All complete external petals removed, central disc retained");
 await page.waitForSelector("#finished:not([hidden])",{timeout:10000});
 await page.locator("#stage canvas").screenshot({path:"girasole-centro-intatto.png",timeout:45000});
 await page.locator("#again").click();
 const second=parseInt((await page.locator("#counter").textContent()).split("/")[1]);
 assert.ok(second>=9&&second<=21&&second!==n,"Count must change at start of new round");
 await page.locator("#startNo").click();
 await page.locator("#pluck").click();
 assert.equal(await page.locator("#counter").textContent(),(second-1)+" / "+second);
 assert.deepEqual(errors,[],"JS runtime errors");
 console.log("PASS: variable sunflower "+n+"→"+second+" petals, full removal, fixed center, browser rendering");
}finally{await browser.close()}
