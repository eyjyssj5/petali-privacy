import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser=await chromium.launch({headless:true,args:["--enable-webgl","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
const page=await browser.newPage({viewport:{width:430,height:880},deviceScaleFactor:1});
const errors=[];
page.on("pageerror",e=>errors.push("PAGE "+e.message));
page.on("console",msg=>{if(msg.type()==="error")errors.push("CONSOLE "+msg.text())});
try{
 const r=await page.goto("http://127.0.0.1:8000/gioco/rosa-hd/",{waitUntil:"domcontentloaded",timeout:45000});
 assert.equal(r.status(),200);
 await page.waitForTimeout(6000);
 const src=await page.locator("#viewer").getAttribute("src");
 console.log("Page loaded with Sketchfab iframe src:",src);
 console.log("Script loaded?",await page.evaluate(()=>!!window.Sketchfab));
 console.log("Page error messages:",errors.slice(0,10));
 console.log("Loader hidden:",await page.locator("#loading").evaluate(el=>el.hidden));
 console.log("Buttons enabled:",await page.locator("#startYes").isEnabled());
 console.log("Petal state:",await page.locator("#count").textContent());
 await page.screenshot({path:"rosa-hd-browser.png",fullPage:true,timeout:20000});
 await page.locator("#lang").selectOption("es");
 assert.equal((await page.locator("#name").textContent()).trim(),"Rosa roja");
 if(!await page.locator("#startYes").isDisabled()){
  await page.locator("#startYes").click();
  await page.locator("#pluck").click();
  await page.waitForTimeout(700);
  console.log("After petal removal:",await page.locator("#count").textContent());
 }
 console.log("TEST done.");
}finally{await browser.close()}
