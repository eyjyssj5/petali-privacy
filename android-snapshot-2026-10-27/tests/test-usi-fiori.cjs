const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(base, p), 'utf8');
const { FIORI } = require('../gioco/fiori.js');
const purposes = require('../gioco/usi-fiori.js');
const locales = ['it','en','es','pt','fr','de'];

test('ogni fiore 2D/3D ha un motivo per cui regalarlo in sei lingue',()=>{
  assert.equal(FIORI.length, 15);
  assert.deepEqual(Object.keys(purposes.flowers).sort(), FIORI.map(x=>x.id).sort());
  for(const f of FIORI) for(const l of locales) {
    const value = purposes.get(f.id, l);
    assert.ok(typeof value === 'string' && value.length > 45, f.id + '/' + l);
    assert.ok(purposes.label(l).length > 6, 'label/' + l);
  }
});

test('3D usa gli stessi consigli di tulipano e garofano 2D',()=>{
  for(const l of locales) {
    assert.equal(purposes.get('tulipano', l), purposes.get('tulipano-rosso', l));
    assert.equal(purposes.get('garofano', l), purposes.get('garofano-rosso', l));
  }
});

test('schermata 2D presenta consigli per fiore selezionato e cambio lingua',()=>{
  const page=read('gioco/index.html');
  const script=read('gioco/app.js');
  assert.match(page, /id="uso-fiore-testo"/);
  assert.match(page, /src="usi-fiori\.js"/);
  assert.match(script, /"uso-fiore-testo"\)\.textContent = window\.PetaliUsiFiori\.get\(fiore\.id, lingua\)/);
  assert.match(script, /if \(fioreCorrente\)/);
  assert.match(script, /mostraDescrizione\(fioreCorrente\)/);
});

test('Regala un fiore mostra quando usare ogni fiore consigliato',()=>{
  const page=read('gioco/regali.html');
  const script=read('gioco/regali.js');
  assert.match(page, /id="regalo-uso-testo"/);
  assert.match(page, /src="usi-fiori\.js"/);
  assert.match(script, /"regalo-uso-testo"\)\.textContent = window\.PetaliUsiFiori\.get\(f\.id, lang\)/);
});

test('schermata 3D mostra quando regalare la specie selezionata',()=>{
  const page=read('gioco/15-fiori-3d/index.html');
  const script=read('gioco/15-fiori-3d/player.js');
  assert.match(page, /id="uso3d-testo"/);
  assert.match(page, /src="\.\.\/usi-fiori\.js"/);
  assert.match(script, /window\.PetaliUsiFiori\.get\(item\.id,locale\)/);
});

test('versione Android incrementata rispetto alla release precedente',()=>{
  const gradle=read('android/app/build.gradle');
  assert.match(gradle, /versionName "1\.1\.2"/);
  assert.match(gradle, /20261124/);
});
