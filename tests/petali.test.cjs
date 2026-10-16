const test = require("node:test");
const assert = require("node:assert/strict");
const { FIORI, petaliCasuali, numeroPerRisultato } = require("../gioco/fiori.js");

test("Ci sono 15 fiori trilingui", () => {
  assert.equal(FIORI.length, 15);
  assert.equal(new Set(FIORI.map(f => f.id)).size, 15);
  for (const fiore of FIORI) {
    for (const lingua of ["it","en","es"]) {
      assert.ok(fiore.nome[lingua]);
      assert.ok(fiore.descrizione[lingua]);
    }
  }
});

test("Numero di petali non fisso da 9 a 21", () => {
  const osservati = new Set();
  for (let i = 0; i < 200; i++) {
    const n = petaliCasuali();
    assert.ok(n >= 9 && n <= 21);
    osservati.add(n);
  }
  assert.ok(osservati.size >= 3);
});

test("Risultato coerente con la scelta iniziale, numero sempre diverso", () => {
  for (const primoMAma of [true,false]) {
    for (const voluto of ["M'ama","Non m'ama"]) {
      for (let precedente=9; precedente<=21; precedente++) {
        for (let i=0;i<20;i++) {
          const n = numeroPerRisultato(primoMAma,voluto,precedente);
          assert.ok(n>=9 && n<=21);
          assert.notEqual(n,precedente);
          const finale=(n%2===1)===primoMAma ? "M'ama" : "Non m'ama";
          assert.equal(finale,voluto);
        }
      }
    }
  }
});
