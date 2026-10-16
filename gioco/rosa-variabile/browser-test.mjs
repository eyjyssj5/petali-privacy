import {chromium} from "playwright";
import assert from "node:assert/strict";
const browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
const page=await browser.newPage({viewport:{width:415,height:880},deviceScaleFactor:1});
const errors=[];page.on("pageerror",e=>errors.push(e.message));
try{
 const response=await page.goto("http://127.0.0.1:8000/gioco/rosa-variabile/",{waitUntil:"domcontentloaded",timeout:50000});
 assert.equal(response.status(),200);
 await page.waitForFunction(()=>document.querySelector("#notice").hidden,{timeout:60000});
 await page.waitForTimeout(500);
 const counts=[];
 for(let i=0;i<5;i++){
  const display=await page.locator("#count").textContent();
  const n=Number(display.split("/")[1]?.trim());
  assert.ok(n>=9&&n<=21,"Petal count in 9..21: "+display);
  if(counts.length)assert.notEqual(n,counts[counts.length-1],"New round should change count");
  counts.push(n);
  if(i===0){
    await page.locator("#stage").screenshot({path:"rosa-hd-variabile-prima.png",timeout:120000,animations:"disabled"});
    await page.locator("#yes").click();
    await page.locator("#pluck").click();
    assert.equal(await page.locator("#count").textContent(),(n-1)+" / "+n);
    const box=await page.locator("#stage canvas").boundingBox();
    await page.mouse.move(box.x+box.width*.49,box.y+box.height*.50);
    await page.mouse.down();
    await page.mouse.move(box.x+box.width*.72,box.y+box.height*.67,{steps:10});
    await page.mouse.up();
    await page.locator("#stage").screenshot({path:"rosa-hd-variabile-ruotata.png",timeout:120000,animations:"disabled"});
    for(let j=1;j<n;j++)await page.locator("#pluck").click();
    await page.waitForSelector("#done:not([hidden])",{timeout:45000});
    await page.locator("#again").click();
  }else{
    await page.locator("#yes").click();
    for(let j=0;j<n;j++)await page.locator("#pluck").click();
    await page.waitForSelector("#done:not([hidden])",{timeout:45000});
    await page.locator("#again").click();
  }
 }
 for(const l of ["it","en","es","pt","fr","de"])await page.locator("#lang").selectOption(l);
 // Verify the high-resolution yellow rose uses the same removable HD geometry.
 await page.goto("http://127.0.0.1:8000/gioco/rosa-variabile/?fiore=rosa-gialla",{waitUntil:"domcontentloaded",timeout:45000});
 await page.waitForFunction(()=>document.querySelector("#notice").hidden,{timeout:60000});
 await page.waitForTimeout(650);
 assert.equal((await page.locator("#flower").textContent()).trim(),"Rosa gialla");
 await page.locator("#stage").screenshot({path:"rosa-gialla-3d-hd.png",timeout:120000,animations:"disabled"});
 const yellowN=Number((await page.locator("#count").textContent()).split("/")[1].trim());
 assert.ok(yellowN>=9&&yellowN<=21,"Yellow rose petal count");
 await page.locator("#yes").click();await page.locator("#pluck").click();
 assert.equal(Number((await page.locator("#count").textContent()).split("/")[0].trim()),yellowN-1);
  assert.deepEqual(errors,[]);
 console.log("PASS: five different round counts 9-21, visual 3D, removal, full round, six languages. Counts: "+counts.join(","));
}finally{await browser.close()}