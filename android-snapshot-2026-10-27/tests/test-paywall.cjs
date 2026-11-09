const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../gioco/paywall.js'), 'utf8');
function scenario(platform='android') {
  let entitlements={}; let chosen=null;
  const sdk={
    async configure(opts){assert.equal(opts.apiKey,'goog_example_long_test_1234');},
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
  const window={PetaliPayments:{android:'goog_example_long_test_1234',ios:'appl_example_long_test_1234',entitlement2d:'fiori_2d',entitlement3d:'fiori_3d',offering2d:'fiori_2d',offering3d:'fiori_3d'},PetaliNative:{platform,Purchases:sdk}};
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

test('chiavi segnaposto disabilitano acquisti senza aprire RevenueCat',async()=>{
  const window={
    PetaliPayments:{android:'INSERISCI_CHIAVE_PUBBLICA_REVENUECAT_ANDROID',ios:'INSERISCI_CHIAVE_PUBBLICA_REVENUECAT_IOS'},
    PetaliNative:{platform:'android',Purchases:{async configure(){throw new Error('NON DEVE CONFIGURARE')}}}
  };
  vm.runInNewContext(source,{window});
  const pay=window.PetaliCommerce;
  assert.equal(pay.ready(),false);
  await assert.rejects(()=>pay.buy('2d'),/non sono disponibili/);
  assert.equal(pay.has('2d'),false);
  assert.equal(pay.has('3d'),false);
});

test('ripristino acquisto non consumabile 3D mantiene 2D separato',async()=>{
  const {pay,setEnts}=scenario();
  setEnts({fiori_3d:{isActive:true}});
  const rights=await pay.restore();
  assert.equal(rights['3d'],true);
  assert.equal(rights['2d'],false);
});
test('iOS usa la chiave Apple e sblocca solo il 3D pagato',async()=>{
  let chosen=null;
  const entitlements={};
  const sdk={
    async configure({apiKey}){assert.equal(apiKey,'appl_example_long_test_1234');},
    async getOfferings(){return {all:{fiori_3d:{lifetime:{identifier:'ios3d',packageType:'LIFETIME'}}}};},
    async getCustomerInfo(){return {customerInfo:{entitlements:{active:entitlements}}};},
    async purchasePackage({aPackage}){chosen=aPackage.identifier;entitlements.fiori_3d={isActive:true};return {customerInfo:{entitlements:{active:entitlements}}};}
  };
  const window={PetaliPayments:{android:'goog_example_long_test_1234',ios:'appl_example_long_test_1234',entitlement2d:'fiori_2d',entitlement3d:'fiori_3d',offering2d:'fiori_2d',offering3d:'fiori_3d'},PetaliNative:{platform:'ios',Purchases:sdk}};
  vm.runInNewContext(source,{window});
  const pay=window.PetaliCommerce;
  await pay.buy('3d');
  assert.equal(chosen,'ios3d');
  assert.equal(pay.has('3d'),true);
  assert.equal(pay.has('2d'),false);
});
test('non compra pacchetti mensili quando manca il pacchetto Lifetime',async()=>{
  const window={
    PetaliPayments:{android:'goog_example_long_test_1234',offering3d:'fiori_3d'},
    PetaliNative:{platform:'android',Purchases:{
      async configure(){},
      async getOfferings(){return {all:{fiori_3d:{availablePackages:[{identifier:'mensile',packageType:'MONTHLY'}]}}};},
      async purchasePackage(){throw Error('NON DEVE ACQUISTARE UN ABBONAMENTO');}
    }}
  };
  vm.runInNewContext(source,{window});
  await assert.rejects(()=>window.PetaliCommerce.buy('3d'),/Lifetime/);
  assert.equal(window.PetaliCommerce.has('3d'),false);
});
