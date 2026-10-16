const test = require("node:test");
const assert = require("node:assert/strict");
const Fiori = require("../gioco/fiori.js");
test("sono presenti i 15 fiori", () => {
 assert.equal(Fiori.FIORI.length,15);
 assert.equal(new Set(Fiori.FIORI.map(f => f.id)).size,15);
});
test("la scelta iniziale non fissa il risultato e il numero varia", () => {
 const valori = new Set();
 for (const first of [true,false]) for (const desired of ["M'ama","Non m'ama"]) {
  let last=0;
  for(let i=0;i<500;i++) {
   const n=Fiori.numeroPerRisultato(first,desired,last);
   assert.ok(n>=9 && n<=21);
   assert.notEqual(n,last);
   assert.equal(((n%2===1)===first)?"M'ama":"Non m'ama",desired);
   valori.add(n); last=n;
  }
 }
 assert.ok(valori.size>3);
});
