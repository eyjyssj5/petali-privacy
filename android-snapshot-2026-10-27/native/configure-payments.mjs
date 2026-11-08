// Inserisce solo chiavi SDK PUBBLICHE RevenueCat nell'app al momento della build.
// Mai inserire secret key RevenueCat o credenziali store in queste variabili.
import { readFileSync, writeFileSync } from 'node:fs';
const file = new URL('../gioco/pagamenti-config.js', import.meta.url);
let source = readFileSync(file, 'utf8');
const configs = [
  ['android', 'REVENUECAT_ANDROID_PUBLIC_KEY', 'goog_'],
  ['ios', 'REVENUECAT_IOS_PUBLIC_KEY', 'appl_']
];
for (const [platform, variable, prefix] of configs) {
  const key = (process.env[variable] || '').trim();
  if (!key) {
    console.log('Petali: chiave SDK pubblica ' + platform + ' non fornita; acquisti ' + platform + ' disattivati');
    continue;
  }
  if (!key.startsWith(prefix) || key.length < 13 || !/^[A-Za-z0-9_]+$/.test(key)) {
    throw new Error('La variabile ' + variable + ' non contiene una chiave SDK pubblica RevenueCat valida');
  }
  const pattern = new RegExp('(' + platform + ':\\s*)("[^"]*"|\'[^\']*\')');
  if (!pattern.test(source)) throw new Error('Configurazione ' + platform + ' non trovata');
  source = source.replace(pattern, (_match, property) => property + JSON.stringify(key));
  console.log('Petali: chiave SDK pubblica ' + platform + ' applicata');
}
writeFileSync(file, source, 'utf8');
