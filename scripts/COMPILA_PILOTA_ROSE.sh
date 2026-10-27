#!/usr/bin/env bash
# Compila Petali TEST con package Android SEPARATO e senza sovrascrivere quello funzionante.
set -Eeuo pipefail
ORIG="$HOME/petali-compilazione-finale"
DEST="$HOME/petali-versione-definitiva"
REPO="$HOME/PETALI_BACKUP_GITHUB_2026-10-27"
if [[ ! -e "$DEST" ]]; then
  [[ -f "$ORIG/gioco/15-fiori-3d/player.js" ]] || { echo 'ERRORE: sorgenti originali Petali assenti'; exit 3; }
  cp -a "$ORIG" "$DEST"
  echo 'CREATA COPIA DI LAVORO SEPARATA'
fi
[[ -f "$DEST/gioco/15-fiori-3d/player.js" ]] || { echo 'ERRORE: copia incompleta'; exit 4; }
[[ "$(realpath "$DEST")" != "$(realpath "$ORIG")" ]] || { echo 'ERRORE: copia coincide con la versione stabile'; exit 5; }
[[ -f "$REPO/scripts/prepara_rose_pilota.py" ]] || { echo 'ERRORE: script GitHub mancante'; exit 6; }
python3 "$REPO/scripts/prepara_rose_pilota.py" "$DEST"
cd "$DEST"
python3 verifica_petali.py
node --check gioco/15-fiori-3d/player.js
python3 - <<'PY'
import json
with open('capacitor.config.json') as f:d=json.load(f)
assert d['appId']=='com.aivevia.petali.pilota','Package TEST non separato!'
PY
SDK="$(printenv ANDROID_HOME 2>/dev/null || printenv ANDROID_SDK_ROOT 2>/dev/null || true)"
if [[ ! -d "$SDK/platforms" ]]; then
  for path in "$HOME/Android/Sdk" /opt/android-sdk /opt/android-sdk-linux; do
    if [[ -d "$path/platforms" ]]; then SDK="$path";break;fi
  done
fi
[[ -d "$SDK/platforms" && -d "$SDK/build-tools" ]] || { echo 'ERRORE: Android SDK non trovato';exit 7; }
export ANDROID_HOME="$SDK" ANDROID_SDK_ROOT="$SDK"
node -e 'if(Number(process.versions.node.split(".")[0])<22)process.exit(1)' || { echo 'Serve Node 22+';exit 8; }
npm ci --no-audit --no-fund
npm run build:bridge
[[ -f android/gradlew ]] || npx cap add android
npx cap sync android
python3 - <<'PY'
from pathlib import Path
import re,shutil
p=Path('android/app/build.gradle')
s=p.read_text()
pattern=r'(\bapplicationId\s*[= ]\s*["\x27])com\.aivevia\.petali(?:\.pilota)?(["\x27])'
s,n=re.subn(pattern,r'\g<1>com.aivevia.petali.pilota\2',s)
if n!=1: raise SystemExit('ERRORE: package Android non separato; build annullata.')
p.write_text(s)
strings=Path('android/app/src/main/res/values/strings.xml')
if strings.exists():
    strings.write_text(strings.read_text().replace('>Petali</string>','>Petali 3D TEST</string>'))
for f in Path('strumenti/icone').rglob('*.png'):
    out=Path('android/app/src/main/res')/f.relative_to('strumenti/icone')
    out.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(f,out)
PY
grep -q 'applicationId "com.aivevia.petali.pilota"' android/app/build.gradle || { echo 'ERRORE: package diverso non confermato';exit 9; }
(cd android && chmod +x gradlew && ./gradlew --no-daemon assembleDebug)
mkdir -p PETALI_ANDROID_OUTPUT
cp android/app/build/outputs/apk/debug/app-debug.apk PETALI_ANDROID_OUTPUT/Petali-PILOTA-rose-debug.apk
python3 - <<'PY'
from zipfile import ZipFile
p='PETALI_ANDROID_OUTPUT/Petali-PILOTA-rose-debug.apk'
with ZipFile(p) as z:
    names=z.namelist()
    for f in ('15-fiori-3d/assets/rosa.glb','15-fiori-3d/assets/rosa-gialla.glb','15-fiori-3d/player.js'):
        assert any(x.endswith('/'+f) for x in names),'APK incompleto: '+f
print('APK TEST CONTENUTI VERIFICATI')
PY
DESKTOP='/mnt/c/Users/proprietario/Desktop/PETALI_VERSIONE_DEFINITIVA/04_APK_DI_PROVA'
if [[ -d '/mnt/c/Users/proprietario/Desktop/PETALI_VERSIONE_DEFINITIVA' ]];then
  mkdir -p "$DESKTOP"
  cp PETALI_ANDROID_OUTPUT/Petali-PILOTA-rose-debug.apk "$DESKTOP/"
  echo "APK: $DESKTOP/Petali-PILOTA-rose-debug.apk"
fi
echo 'PILOTA COMPILATO: Petali principale non sovrascritta.'
