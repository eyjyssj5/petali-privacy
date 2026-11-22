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

test("il regalo apre una pagina separata, senza i fiori del gioco sotto", () => {
  const home = fs.readFileSync(path.join(base, "index.html"), "utf8");
  const page = fs.readFileSync(path.join(base, "regali.html"), "utf8");
  assert.match(home, /id="btn-menu-regali"[^>]*href="regali\.html"/);
  assert.doesNotMatch(home, /id="regali-panel"|id="regalo-fiori"/);
  assert.match(home, /id="griglia-fiori"/);
  assert.match(page, /id="regali-page"/);
  assert.match(page, /id="regalo-torna"[^>]*href="index\.html"/);
  assert.doesNotMatch(page, /id="griglia-fiori"/);
  assert.match(page, /src="regali-catalogo\.js"/);
  assert.match(page, /src="regali\.js"/);
  for (const id of ["regalo-occasione","regalo-fiori","regalo-a","regalo-da","regalo-messaggio",
    "regalo-condividi","regalo-copia","regalo-preview-fiore"]) {
    assert.ok(page.includes('id="' + id + '"'), "missing " + id);
  }
});

test("la condivisione Android apre un chooser nativo con PNG, senza scaricarlo", () => {
  const js = fs.readFileSync(path.join(base, "regali.js"), "utf8");
  const javaDir = path.join(base, "../android/app/src/main/java/com/aivevia/petali");
  const plugin = fs.readFileSync(path.join(javaDir, "PetaliSharePlugin.java"), "utf8");
  const activity = fs.readFileSync(path.join(javaDir, "MainActivity.java"), "utf8");
  const bridge = fs.readFileSync(path.join(base, "../native/bridge.js"), "utf8");
  assert.match(js, /platform === "android"/);
  assert.match(js, /nativeShare\.shareImage\(\{ pngBase64: encoded, text \}\)/);
  assert.match(js, /platform === "web" && blob/);
  assert.match(plugin, /Intent\.ACTION_SEND/);
  assert.match(plugin, /Intent\.createChooser/);
  assert.match(plugin, /FileProvider\.getUriForFile/);
  assert.match(plugin, /FLAG_GRANT_READ_URI_PERMISSION/);
  assert.match(activity, /registerPlugin\(PetaliSharePlugin\.class\)/);
  assert.match(bridge, /registerPlugin\('PetaliShare'\)/);
});

test("l'accesso 2D Premium viene verificato in pagina, senza modificare i 3D", () => {
  const js = fs.readFileSync(path.join(base, "regali.js"), "utf8");
  assert.match(js, /PetaliCommerce\?\.has\?\.\("2d"\)/);
  assert.match(js, /commerce\.buy\("2d"\)/);
  assert.doesNotMatch(js, /commerce\.buy\("3d"\)/);
  assert.match(js, /PetaliCommerce\?\.refresh/);
});

test("link pagina regalo tradotto nelle sei lingue", () => {
  const ui = fs.readFileSync(path.join(base, "ui-i18n.js"), "utf8");
  assert.equal((ui.match(/"giftMode":/g) || []).length, 6);
});
