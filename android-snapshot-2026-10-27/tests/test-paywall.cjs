const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../gioco/paywall.js'), 'utf8');
const payments = {androidProduct2d: 'fiori_2d', androidProduct3d: 'fiori_3d', androidProductLegacy2d: 'sblocco', ios: 'appl_example_long_test_1234', entitlement2d: 'fiori_2d', entitlement3d: 'fiori_3d', offering2d: 'fiori_2d', offering3d: 'fiori_3d'};

function androidScenario() {
  let purchased = [];
  const calls = [];
  const googlePlay = {
    async getPurchases() { calls.push('refresh'); return {purchased: [...purchased]}; },
    async purchase({productId}) { calls.push(productId); purchased.push(productId); return {purchased: [...purchased]}; }
  };
  const window = {PetaliPayments: payments, PetaliNative: {platform: 'android', Billing: googlePlay, Purchases: {
    async configure() { throw Error('Android NON deve avviare RevenueCat'); }
  }}};
  vm.runInNewContext(source, {window});
  return {pay: window.PetaliCommerce, setOwned: p => purchased=p, calls};
}

function iosScenario() {
  let entitlements={};
  let chosen=null;
  const sdk={
    async configure(opts){assert.equal(opts.apiKey,'appl_example_long_test_1234');},
    async getCustomerInfo(){return {customerInfo:{entitlements:{active:entitlements}}};},
    async getOfferings(){return {all:{
      fiori_2d:{availablePackages:[{identifier:'ios2d',packageType:'LIFETIME'}]},
      fiori_3d:{availablePackages:[{identifier:'ios3d',packageType:'LIFETIME'}]}
    }};},
    async purchasePackage({aPackage}){chosen=aPackage.identifier;entitlements[chosen==='ios2d'?'fiori_2d':'fiori_3d']={isActive:true};return {customerInfo:{entitlements:{active:entitlements}}};},
    async restorePurchases(){return {customerInfo:{entitlements:{active:entitlements}}};}
  };
  const window={PetaliPayments:payments,PetaliNative:{platform:'ios',Purchases:sdk}};
  vm.runInNewContext(source,{window});
  return {pay:window.PetaliCommerce,setEnts: x=>entitlements=x, chosen:()=>chosen};
}

test('Android non concede premium senza acquisto Google Play',async()=>{
 const {pay}=androidScenario();await pay.refresh();assert.equal(pay.has('2d'),false);assert.equal(pay.has('3d'),false);
});
test('Android compra solo fiori_2d e conserva 3D separato',async()=>{
 const {pay,calls}=androidScenario();await pay.buy('2d');assert.equal(pay.has('2d'),true);assert.equal(pay.has('3d'),false);assert.ok(calls.includes('fiori_2d'));assert.equal(calls.includes('fiori_3d'),false);
});
test('Android compra solo fiori_3d',async()=>{
 const {pay,calls}=androidScenario();await pay.buy('3d');assert.equal(pay.has('2d'),false);assert.equal(pay.has('3d'),true);assert.ok(calls.includes('fiori_3d'));
});
test('Android ripristina gli acquisti 2D/3D senza RevenueCat',async()=>{
 const {pay,setOwned}=androidScenario();setOwned(['fiori_2d','fiori_3d']);const rights=await pay.restore();assert.equal(rights['2d'],true);assert.equal(rights['3d'],true);
});
test('Android diritto legacy sblocco vale solo per 2D',async()=>{
 const {pay,setOwned}=androidScenario();setOwned(['sblocco']);await pay.refresh();assert.equal(pay.has('2d'),true);assert.equal(pay.has('3d'),false);
});
test('Android senza plugin Google Play non effettua acquisti',async()=>{
 const window={PetaliPayments:payments,PetaliNative:{platform:'android',Purchases:{async configure(){throw Error('NON USARE RevenueCat');}}}};
 vm.runInNewContext(source,{window});assert.equal(window.PetaliCommerce.ready(),false);await assert.rejects(()=>window.PetaliCommerce.buy('3d'),/non sono disponibili/);
});
test('Android non sblocca acquisti non confermati dal Play Store',async()=>{
 const window={PetaliPayments:payments,PetaliNative:{platform:'android',Billing:{async getPurchases(){return {purchased:[]}},async purchase(){return {purchased:[]}}}}};
 vm.runInNewContext(source,{window});await assert.rejects(()=>window.PetaliCommerce.buy('2d'),/non confermato/);assert.equal(window.PetaliCommerce.has('2d'),false);
});
test('web mantiene tutto il premium bloccato',async()=>{
 const window={PetaliPayments:payments,PetaliNative:{platform:'web'}};
 vm.runInNewContext(source,{window});const pay=window.PetaliCommerce;await pay.refresh();assert.equal(pay.has('2d'),false);assert.equal(pay.has('3d'),false);await assert.rejects(()=>pay.buy('3d'));
});
test('iOS mantiene la procedura RevenueCat e i prodotti Lifetime',async()=>{
 const {pay,chosen}=iosScenario();await pay.buy('3d');assert.equal(chosen(),'ios3d');assert.equal(pay.has('3d'),true);assert.equal(pay.has('2d'),false);
});
test('iOS ripristina i diritti già comprati',async()=>{
 const {pay,setEnts}=iosScenario();setEnts({fiori_2d:{isActive:true}});const rights=await pay.restore();assert.equal(rights['2d'],true);assert.equal(rights['3d'],false);
});
test('iOS rifiuta offerte mensili al posto di acquisti permanenti',async()=>{
 const sdk={async configure(){},async getOfferings(){return {all:{fiori_3d:{availablePackages:[{identifier:'mensile',packageType:'MONTHLY'}]}}}}};
 const window={PetaliPayments:payments,PetaliNative:{platform:'ios',Purchases:sdk}};vm.runInNewContext(source,{window});
 await assert.rejects(()=>window.PetaliCommerce.buy('3d'),/Lifetime/);
});
test('plugin Android gestisce solo acquisti Google Play realmente effettuati e riconferma',()=>{
 const java=fs.readFileSync(path.join(__dirname,'../android/app/src/main/java/com/aivevia/petali/PetaliBillingPlugin.java'),'utf8');
 const activity=fs.readFileSync(path.join(__dirname,'../android/app/src/main/java/com/aivevia/petali/MainActivity.java'),'utf8');
 const build=fs.readFileSync(path.join(__dirname,'../android/app/build.gradle'),'utf8');
 const bridge=fs.readFileSync(path.join(__dirname,'../native/bridge.js'),'utf8');
 assert.match(java,/Purchase\.PurchaseState\.PURCHASED/);
 assert.match(java,/Purchase\.PurchaseState\.PENDING/);
 assert.match(java,/queryPurchasesAsync/);
 assert.match(java,/acknowledgePurchase/);
 assert.match(java,/BillingClient\.ProductType\.INAPP/);
 assert.doesNotMatch(java,/consumePurchase\(/);
 assert.match(activity,/registerPlugin\(PetaliBillingPlugin\.class\)/);
 assert.match(build,/com\.android\.billingclient:billing:9\.1\.0/);
 assert.match(bridge,/registerPlugin\('PetaliBilling'\)/);
});

// Regression: a clean rewarded-ad test must not inherit previous iOS purchases.
test('iOS Ad Hoc test ignores historical purchases on every automatic refresh; explicit restore remains available',async()=>{
 const stored=new Map();let calls=0;
 const sdk={async configure(){},async getCustomerInfo(){calls++;return {customerInfo:{entitlements:{active:{fiori_2d:{isActive:true},fiori_3d:{isActive:true}}}}}},async restorePurchases(){return this.getCustomerInfo()}};
 const window={PetaliPayments:payments,PetaliAdConfig:{test:true},sessionStorage:{getItem:k=>stored.get(k),setItem:(k,v)=>stored.set(k,v)},PetaliNative:{platform:'ios',Purchases:sdk}};
 vm.runInNewContext(source,{window});const pay=window.PetaliCommerce;
 await pay.refresh();await pay.refresh();assert.equal(calls,0);assert.equal(pay.has('2d'),false);assert.equal(pay.has('3d'),false);
 await pay.restore();assert.equal(pay.has('2d'),true);assert.equal(pay.has('3d'),true);
 vm.runInNewContext(source,{window});await window.PetaliCommerce.refresh();assert.equal(window.PetaliCommerce.has('3d'),true);
});
test('iOS rejects inactive or malformed entitlement entries even inside active map',async()=>{
 const {pay,setEnts}=iosScenario();setEnts({fiori_2d:{isActive:false},fiori_3d:{}});await pay.refresh();assert.equal(pay.has('2d'),false);assert.equal(pay.has('3d'),false);
});
test('iOS live continues to automatically restore verified permanent rights',async()=>{
 const {pay,setEnts}=iosScenario();setEnts({fiori_2d:{isActive:true},fiori_3d:{isActive:true}});await pay.refresh();assert.equal(pay.has('2d'),true);assert.equal(pay.has('3d'),true);
});
