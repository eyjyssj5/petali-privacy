const test = require("node:test");
const assert = require("node:assert/strict");
globalThis.Fiori = require("../gioco/fiori.js");
require("../gioco/lingue-extra.js");
require("../gioco/fiori-pt.js");
require("../gioco/fiori-fr.js");
require("../gioco/fiori-de.js");

const languages = ["it","en","es","pt","fr","de"];
const flowers = globalThis.Fiori.FIORI;

test("all fifteen flowers have six complete languages", () => {
  assert.equal(flowers.length, 15);
  for (const flower of flowers) {
    for (const key of ["nome","significato","descrizione","storia"]) {
      for (const lang of languages) {
        assert.equal(typeof flower[key][lang], "string", flower.id + " " + key + " " + lang);
        assert.ok(flower[key][lang].trim(), flower.id + " " + key + " " + lang);
      }
    }
    for (const value of ["mama","nonMama"]) for(const lang of languages) {
      assert.ok(flower.messaggi[value][lang]?.trim(), flower.id + " " + value + " " + lang);
    }
  }
});

test("all additional interface keys match the original interface", () => {
  const extra = globalThis.PetaliLingueExtra.UI;
  const keys = Object.keys(extra.pt).sort();
  assert.deepEqual(Object.keys(extra.fr).sort(), keys);
  assert.deepEqual(Object.keys(extra.de).sort(), keys);
  const mandatory = ["titolo","subtitle","intro","sceltaTitolo","togli","mama","nonMama","ricomincia","significato","pagamentoErrore"];
  for(const lang of ["pt","fr","de"]) for(const key of mandatory) {
    assert.equal(typeof extra[lang][key], "string");
    assert.ok(extra[lang][key].trim());
  }
});

test("random petal count respects 9-21 range and starting label/outcome", () => {
  for (const firstMama of [true,false]) for(const outcome of ["M'ama","Non m'ama"]) {
    for(let last=9;last<=21;last++) for(let i=0;i<50;i++) {
      const n=globalThis.Fiori.numeroPerRisultato(firstMama,outcome,last);
      assert.ok(n>=9 && n<=21);
      assert.notEqual(n,last);
      assert.equal((n%2===1)===firstMama,outcome==="M'ama");
    }
  }
});
