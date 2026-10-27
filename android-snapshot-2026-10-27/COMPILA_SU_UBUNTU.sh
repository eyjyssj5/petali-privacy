#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
if [[ ! -f package.json || ! -f gioco/index.html ]]; then echo 'ERRORE: progetto incompleto'; exit 2; fi
python3 verifica_petali.py
if [[ -z "${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}" ]]; then
 for dir in "$HOME/Android/Sdk" /opt/android-sdk /opt/android-sdk-linux; do
  if [[ -d "$dir/platforms" ]]; then export ANDROID_HOME="$dir"; break;fi
 done
fi
SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
if [[ ! -d "$SDK/platforms" || ! -d "$SDK/build-tools" ]]; then
 echo 'ERRORE: Android SDK assente. Non viene creato alcun APK.'; exit 3
fi
export ANDROID_HOME="$SDK" ANDROID_SDK_ROOT="$SDK"
node -e 'if(Number(process.versions.node.split(".")[0])<22) process.exit(1)' || { echo 'Serve Node 22+'; exit 3; }
java -version
npm ci --no-audit --no-fund
npm run build:bridge
if [[ ! -f android/gradlew ]]; then npx cap add android; fi
npx cap sync android
python3 - <<'PYICON'
from pathlib import Path
import shutil
for f in Path('strumenti/icone').rglob('*.png'):
 d=Path('android/app/src/main/res')/f.relative_to('strumenti/icone')
 d.parent.mkdir(parents=True,exist_ok=True)
 shutil.copy2(f,d)
print('ICONA PETALI RIPRISTINATA')
PYICON
(cd android && chmod +x gradlew && ./gradlew --no-daemon assembleDebug bundleRelease)
mkdir -p PETALI_ANDROID_OUTPUT
cp android/app/build/outputs/apk/debug/app-debug.apk PETALI_ANDROID_OUTPUT/Petali-debug.apk
cp android/app/build/outputs/bundle/release/app-release.aab PETALI_ANDROID_OUTPUT/Petali-release-unsigned.aab
python3 - <<'PYAPK'
from pathlib import Path
from zipfile import ZipFile
apk=Path('PETALI_ANDROID_OUTPUT/Petali-debug.apk')
with ZipFile(apk) as z:
 names=z.namelist()
 required=['index.html','petali-v22-2d.css','15-fiori-3d/player.js','15-fiori-3d/catalogo.json','15-fiori-3d/assets/rosa.glb','15-fiori-3d/assets/girasole.glb']
 required.extend(f'img/{f}-petalo.png' for f in ('rosa-rossa','rosa-gialla','girasole'))
 for f in required:
  if not any(x.endswith('/'+f) or x==f for x in names):raise SystemExit('ERRORE: manca nell APK '+f)
 print('APK CONTENUTI VERIFICATI:',round(apk.stat().st_size/1048576,1),'MiB')
PYAPK
DESKTOP='/mnt/c/Users/proprietario/Desktop/app ama no ama/01_APP_ATTUALE'
if [[ -d "$(dirname "$DESKTOP")" ]]; then
 mkdir -p "$DESKTOP"
 cp PETALI_ANDROID_OUTPUT/Petali-debug.apk "$DESKTOP/"
 cp PETALI_ANDROID_OUTPUT/Petali-release-unsigned.aab "$DESKTOP/"
 echo "APK SU DESKTOP: $DESKTOP/Petali-debug.apk"
fi
echo 'Compilato: APK debug. ATTENZIONE: AAB non firmato, RevenueCat da configurare, verifica visiva Android necessaria.'
