import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";

const browser = await chromium.launch({
  headless: true,
  args: ["--enable-webgl","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", err => errors.push(err.message));
page.on("console", msg => {if(msg.type()==="error")errors.push(msg.text())});
try {
  const response=await page.goto("http://127.0.0.1:8000/gioco/3d/",{waitUntil:"domcontentloaded",timeout:45000});
  assert.equal(response.status(),200,"HTML response");
  await page.waitForSelector("#stage canvas",{timeout:45000});
  await page.waitForFunction(() => document.querySelectorAll(".flower-choice").length===15,{timeout:30000});
  await page.waitForTimeout(1800);
  assert.equal(await page.locator("#error").isVisible(),false,"3D error overlay");
  assert.equal(await page.locator(".flower-choice").count(),15,"Fifteen flowers");
  await page.screenshot({path:"petali-3d-browser.png",fullPage:true});
  for(const lang of ["it","en","es","pt","fr","de"]){
    await page.locator("#lang").selectOption(lang);
    assert.ok((await page.locator("#headline").textContent()).length>12,"language "+lang);
  }
  await page.locator("#lang").selectOption("it");
  await page.locator('#flowerGrid button[data-id="ibisco"]').click();
  assert.equal((await page.locator("#flowerName").textContent()).trim(),"Ibisco");
  await page.locator("#startYes").click();
  const before=await page.locator("#count").textContent();
  await page.locator("#pluck").click();
  const after=await page.locator("#count").textContent();
  assert.notEqual(before,after,"One independent 3D petal removed");
  await page.screenshot({path:"petali-ibisco-3d.png",fullPage:true});
  // Drag in both axes. The rendered flower must remain visible at an oblique angle.
  const stageBox = await page.locator("#stage").boundingBox();
  const mx=stageBox.x+stageBox.width*.48, my=stageBox.y+stageBox.height*.48;
  await page.mouse.move(mx,my);
  await page.mouse.down();
  await page.mouse.move(mx+148,my+72,{steps:15});
  await page.mouse.up();
  await page.screenshot({path:"petali-ibisco-ruotato.png",fullPage:true});
  // Render all fifteen species to catch clipping or empty geometry.
  for(const button of await page.locator("#flowerGrid .flower-choice").all()){
    const id=await button.getAttribute("data-id");
    await button.click();
    await page.waitForTimeout(170);
    await page.locator("#stage").screenshot({path:"render-"+id+".png"});
  }
  if(errors.length)throw Error(errors.join("\n"));
  console.log("PASS: WebGL canvas loaded, 15 flowers, six locales, hibiscus, one removable petal.");
}finally{
 await browser.close();
}
