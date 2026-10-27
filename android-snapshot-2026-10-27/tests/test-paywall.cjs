const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../gioco/paywall.js'), 'utf8');
function scenario(platform='android') {
  let entitlements={}; let chosen=null;
  const sdk={
    async configure(opts){assert.equal(opts.apiKey,'goog_example');},
    async getCustomerInfo(){return {customerInfo:{entitlements:{active:entitlements}}};},
    async getOfferings(){return {all:{
      fiori_2d:{availablePackages:[{identifier:'premium2d',packageType:'LIFETIME'}]},
      fiori_3d:{availablePackages:[{identifier:'premium3d',packageType:'LIFETIME'}]}
    }};
    },
    async purchasePackage({aPackage}){
      chosen=aPackage.identifier;
      entitlements[chosen==='premium2d'?'fiori_2d':'fiori_3d']={isActive:true};
      return {customerInfo:{entitlements:{active:entitlements}}};
    },
    async restorePurchases(){return {customerInfo:{entitlements:{active:entitlements}}};}
  };
  const window={PetaliPayments:{android:'goog_example',ios:'appl_example',entitlement2d:'fiori_2d',entitlement3d:'fiori_3d',offering2d:'fiori_2d',offering3d:'fiori_3d'},PetaliNative:{platform,Purchases:sdk}};
  vm.runInNewContext(source,{window});
  return {pay:window.PetaliCommerce, sdk, setEnts:x=>entitlements=x, chosen:()=>chosen};
}
test('nessun fiore premium regalato all’avvio',async()=>{
 const {pay}=scenario(); await pay.refresh(); assert.equal(pay.has('2d'),false);assert.equal(pay.has('3d'),false);
});
test('acquisto 2D non sblocca 3D',async()=>{
 const {pay,chosen}=scenario();await pay.buy('2d');assert.equal(chosen(),'premium2d');assert.equal(pay.has('2d'),true);assert.equal(pay.has('3d'),false);
});
test('acquisto 3D separato',async()=>{
 const {pay,chosen}=scenario();await pay.buy('3d');assert.equal(chosen(),'premium3d');assert.equal(pay.has('2d'),false);assert.equal(pay.has('3d'),true);
});
test('diritto legacy sblocco solo 2D',async()=>{
 const {pay,setEnts}=scenario();setEnts({sblocco:{isActive:true}});await pay.refresh();assert.equal(pay.has('2d'),true);assert.equal(pay.has('3d'),false);
});
test('browser web non concede premium',async()=>{
 const {pay}=scenario('web');await pay.refresh();assert.equal(pay.has('2d'),false);assert.equal(pay.has('3d'),false);await assert.rejects(()=>pay.buy('3d'));
});
