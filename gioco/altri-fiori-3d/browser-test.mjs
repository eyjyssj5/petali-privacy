import {chromium} from "playwright";
import assert from "node:assert/strict";
const browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
const page=await browser.newPage({viewport:{width:430,height:920},deviceScaleFactor:1});
const errors=[];
page.on("pageerror",e=>errors.push(e.message));
try{
 const r=await page.goto("http://127.0.0.1:8000/gioco/altri-fiori-3d/",{waitUntil:"domcontentloaded",timeout:45000});
 assert.equal(r.status(),200);
 await page.waitForSelector("canvas",{timeout:45000});
 assert.equal(await page.locator(".choice").count(),6);
 for(const name of ["tulipano-rosso","girasole","orchidea","ortensia","lavanda","ciliegio"]){
  await page.locator('[data-id="'+name+'"]').click();
  await page.waitForFunction(()=>document.querySelector("#notice").hidden,{timeout:35000});
  const total=Number((await page.locator("#counter").textContent()).split("/")[1].trim());
  assert.ok(Number.isInteger(total),name+" count exists");
  console.log("MODEL",name,"SEPARATE PETALS",total);
  if(["tulipano-rosso","girasole","orchidea","ortensia"].includes(name)) {
   assert.ok(total>0,name+" petals must be individually removable");
   await page.locator("#pluck").click();
   assert.equal(Number((await page.locator("#counter").textContent()).split("/")[0].trim()),total-1,name+" one petal plucked");
  }
  await page.screenshot({path:"botanical-"+name+".png",fullPage:true,timeout:30000});
 }
 assert.deepEqual(errors,[]);
 console.log("PASS: six distinct 3D botanical models loaded, petals separated in first four");
}finally{await browser.close()}
