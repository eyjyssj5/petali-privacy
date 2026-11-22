/* Regressione PETALI: catalogo regali e isolamento dagli acquisti. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const catalog = require("../gioco/regali-catalogo.js");
const { FIORI } = require("../gioco/fiori.js");
const base = path.resolve(__dirname, "../gioco");

test("13 occasioni reali e nessun ID duplicato", () => {
  assert.equal(catalog.occasions.length, 13);
  assert.equal(new Set(catalog.occasions.map((c) => c.id)).size, 13);
});

test("ogni occasione consiglia tre fiori esistenti", () => {
  const valid = new Set(FIORI.map((f) => f.id));
  for (const occasion of catalog.occasions) {
    assert.equal(occasion.flowers.length, 3, occasion.id);
    assert.equal(new Set(occasion.flowers).size, 3, occasion.id);
    for (const flower of occasion.flowers) assert.ok(valid.has(flower), occasion.id + ": " + flower);
  }
});

test("fiori gratuiti coincidenti con i 2D esistenti", () => {
  assert.deepEqual(catalog.free2d, ["rosa-rossa", "rosa-gialla", "girasole"]);
});

test("occasioni e dediche tradotte in 6 lingue", () => {
  for (const occ of catalog.occasions) {
    for (const lang of ["it","en","es","pt","fr","de"]) {
      assert.ok(typeof occ.name[lang] === "string" && occ.name[lang].length > 2, occ.id + " nome " + lang);
      assert.ok(typeof occ.message[lang] === "string" && occ.message[lang].length > 12, occ.id + " dedica " + lang);
    }
  }
});

test("interfaccia regalo caricata e oggetti di pagamento invariati", () => {
  const html = fs.readFileSync(path.join(base,"index.html"),"utf8");
  const js = fs.readFileSync(path.join(base,"regali.js"),"utf8");
  assert.match(html,/id="regali-panel"/);
  assert.match(html,/src="regali-catalogo\.js"/);
  assert.match(html,/src="regali\.js"/);
  assert.match(js,/PetaliCommerce\?\.has\?\.\("2d"\)/);
  assert.doesNotMatch(js,/PetaliCommerce\.(buy|restore)\(/);
  for (const id of ["regalo-occasione","regalo-fiori","regalo-a","regalo-da","regalo-messaggio","regalo-condividi","regalo-copia","regalo-preview-fiore"]) {
    assert.ok(html.includes('id="' + id + '"'), "missing " + id);
  }
});
