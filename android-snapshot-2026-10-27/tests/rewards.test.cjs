const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../gioco/rewards.js'),'utf8');
const day=86400000;
function setup(now=1700000000000,stored=new Map(),watch=async()=>false){
  class Clock extends Date{static now(){return now}}
  const window={localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)},PetaliNative:{RewardAds:{available:()=>true,watch}}};
  vm.runInNewContext(source,{window,Date:Clock});
  return {r:window.PetaliRewards,stored,advance:n=>now+=n};
}
test('100 welcome credits, +10 once per new day, persisted and no repeat on restart',()=>{
  const {r,stored,advance}=setup();assert.equal(r.state().balance,110);assert.equal(r.state().balance,110);
  advance(day);assert.equal(r.state().balance,120);assert.equal(r.state().balance,120);
  assert.equal(setup(1700000000000+day,stored).r.state().balance,120);
});
test('unlock is per flower and per mode; no second charge within 24h; expires',()=>{
  const {r,advance}=setup();assert.equal(r.useCredits('2d','rosa-rossa'),true);assert.equal(r.state().balance,100);
  assert.equal(r.useCredits('2d','rosa-rossa'),true);assert.equal(r.state().balance,100);
  assert.equal(r.isUnlocked('3d','rosa-rossa'),false);assert.equal(r.isUnlocked('2d','girasole'),false);
  advance(day);assert.equal(r.isUnlocked('2d','rosa-rossa'),false);
});
test('failed or incomplete video does not unlock or debit',async()=>{
  const {r}=setup();assert.equal(await r.watch('3d','girasole'),false);assert.equal(r.isUnlocked('3d','girasole'),false);assert.equal(r.state().balance,110);
});
test('completed video unlocks only selected flower without debiting credits',async()=>{
  const {r}=setup(undefined,new Map(),async()=>true);assert.equal(await r.watch('3d','girasole'),true);
  assert.equal(r.isUnlocked('3d','girasole'),true);assert.equal(r.isUnlocked('2d','girasole'),false);assert.equal(r.state().balance,110);
});
test('no negative balance and no double grant with concurrent video calls',async()=>{
  const {r}=setup(undefined,new Map(),async()=>true);
  for(let i=0;i<11;i++)assert.equal(r.useCredits('2d','fiore-'+i),true);
  assert.equal(r.useCredits('2d','extra'),false);assert.equal(r.state().balance,0);
  const a=await Promise.all([r.watch('3d','a'),r.watch('3d','b')]);assert.equal(a.filter(Boolean).length,1);
});

test('no ad or credit operation on selecting a flower, cancellation leaves all premium locked',async()=>{
 const {r}=setup();assert.equal(r.isUnlocked('3d','girasole'),false);assert.equal(r.isUnlocked('3d','orchidea'),false);
 assert.equal(r.isUnlocked('2d','orchidea'),false);assert.equal(r.state().balance,110);assert.equal(Object.keys(r.state().unlocks).length,0);
});
test('one rewarded video leaves every other 3D and 2D flower locked',async()=>{
 const {r}=setup(undefined,new Map(),async()=>true);await r.watch('3d','orchidea');assert.equal(r.isUnlocked('3d','orchidea'),true);
 for(const id of ['rosa-rossa','rosa-gialla','girasole','tulipano','lavanda','papavero','iris','garofano','viola','ortensia','peonia','dalia','ciliegio','ibisco'])assert.equal(r.isUnlocked('3d',id),false);
 assert.equal(r.isUnlocked('2d','orchidea'),false);assert.deepEqual(Object.keys(r.state().unlocks),['3d:orchidea']);assert.equal(r.state().balance,110);
});

test('every tenth consecutive day gives +110, repeated reads and restart do not duplicate, next cycle starts at 1',()=>{const {r,stored,advance}=setup();assert.equal(r.state().streak,1);for(let i=1;i<9;i++){advance(day);assert.equal(r.state().streak,i+1)}const before=r.state().balance;advance(day);assert.equal(r.state().balance,before+110);assert.equal(r.state().streak,10);assert.equal(r.state().balance,before+110);assert.equal(setup(1700000000000+9*day,stored).r.state().balance,before+110);advance(day);assert.equal(r.state().streak,1);assert.equal(r.state().balance,before+120);for(let i=0;i<9;i++)advance(day),r.state();assert.equal(r.state().streak,10);assert.equal(r.state().balance,before+310)});
test('missed day resets streak, existing local balance is not re-granted',()=>{const {r,stored,advance}=setup();r.state();advance(day);r.state();advance(2*day);assert.equal(r.state().streak,1);assert.equal(r.state().balance,130);const s=JSON.parse(stored.get('petali.rewards.v1'));delete s.streak;stored.set('petali.rewards.v1',JSON.stringify(s));assert.equal(r.state().balance,130);assert.equal(r.state().streak,1)});
