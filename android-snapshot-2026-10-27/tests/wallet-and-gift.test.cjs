const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const src=p=>fs.readFileSync(path.join(__dirname,'../gioco',p),'utf8');
test('16 complete wallet translations, all placeholders and configuration disabled by default',()=>{
 const window={PetaliNative:{platform:'ios'},document:null};const ctx=vm.createContext({window});
 for(const p of ['wallet-config.js','wallet-i18n.js','wallet.js'])vm.runInContext(src(p),ctx,{filename:p});
 assert.equal(window.PetaliWallet.enabled,false);assert.equal(window.PetaliWallet.isAuthenticated(),false);
 const labels=window.PetaliWalletLabels;assert.equal(Object.keys(labels).length,16);
 for(const l of Object.keys(labels)){assert.deepEqual(Object.keys(labels[l]),Object.keys(labels.it));assert.match(labels[l].confirmSend,/\{amount\}/);assert.match(labels[l].confirmSend,/\{code\}/);assert.match(labels[l].inviteProgress,/\{n\}/);assert.match(labels[l].inviteProgress,/\{reward\}/)}
});
test('3D gift export uses packaged model renderer and a GIF MIME, not a PNG or text substitute',()=>{new vm.Script(src('gift-renderer.js'));new vm.Script(src('regali.js'));assert.match(src('regali.js'),/PetaliGiftRenderer\.open\(chosenFlower\)/);assert.match(src('regali.js'),/renderer\.frame\(i\/16\)/);assert.match(src('regali.js'),/type:"image\/gif"/);});
