#!/usr/bin/env bash
# Eseguire da Ubuntu, dentro una copia del ramo di backup GitHub.
# NON cancella o modifica i file del progetto originale.
set -Eeuo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$HOME/petali-compilazione-finale"
DEST="$REPO/android-snapshot-2026-10-27"
BRANCH="backup/petali-android-prima-pulizia-2026-10-27"

fail() { echo "ERRORE: $*" >&2; exit 1; }
command -v git >/dev/null || fail "git non installato in Ubuntu"
command -v rsync >/dev/null || fail "rsync non installato in Ubuntu"
[[ -f "$SRC/gioco/15-fiori-3d/player.js" ]] || fail "Non trovo la cartella Petali: $SRC"
[[ -f "$SRC/package.json" ]] || fail "Progetto incompleto: manca package.json"
[[ -d "$SRC/gioco/15-fiori-3d/assets" ]] || fail "Mancano gli asset 3D"
[[ "$(git -C "$REPO" branch --show-current)" == "$BRANCH" ]] || fail "Ramo GitHub errato, interrompo per proteggere main"
[[ -z "$(git -C "$REPO" status --porcelain)" ]] || fail "Ci sono modifiche non salvate nel clone di backup"

echo "Copio SOLO il codice sorgente Petali e gli asset nel ramo di backup."
echo "Il repository GitHub di destinazione e' PUBBLICO: non inserire segreti nel codice."
mkdir -p "$DEST"

rsync -a --delete \
  --exclude='.git/' \
  --exclude='.gitignore' \
  --exclude='.petali-backup/' \
  --exclude='.env' --exclude='.env.*' \
  --exclude='*.jks' --exclude='*.keystore' --exclude='*.p12' \
  --exclude='*.pem' --exclude='*.p8' --exclude='*.key' \
  --exclude='*service-account*.json' --exclude='google-services.json' \
  --exclude='key.properties' --exclude='local.properties' --exclude='gradle.properties' \
  --exclude='*.apk' --exclude='*.aab' --exclude='*.zip' \
  --exclude='node_modules/' --exclude='.gradle/' --exclude='.cxx/' \
  --exclude='.idea/' --exclude='.vscode/' --exclude='build/' --exclude='dist/' \
  --exclude='android/app/src/main/assets/public/' \
  --exclude='android/.gradle/' --exclude='android/app/build/' \
  "$SRC/" "$DEST/"

# Controllo dei nomi sensibili prima di git add.
SENSITIVE="$(find "$DEST" -type f \( -iname '*.jks' -o -iname '*.keystore' -o -iname '*.p12' -o -iname '*.pem' -o -iname '*.key' -o -name '.env' -o -name '.env.*' -o -iname '*service-account*.json' -o -iname 'google-services.json' -o -iname 'key.properties' -o -iname 'local.properties' -o -iname 'gradle.properties' \) -print -quit)"
[[ -z "$SENSITIVE" ]] || fail "Trovato file potenzialmente segreto: $SENSITIVE"

(
  cd "$DEST"
  find gioco/15-fiori-3d/assets -type f -name '*.glb' -print0 | sort -z | xargs -0 -r sha256sum > MODELLI_SHA256.txt
  sha256sum gioco/15-fiori-3d/player.js >> MODELLI_SHA256.txt
)
cat > "$DEST/LEGGIMI_BACKUP.txt" <<'TXT'
SNAPSHOT ANDROID PETALI PRIMA DELLA PULIZIA - 27/10/2026
Fonte: cartella di sviluppo ~/petali-compilazione-finale del PC.
Codice e asset di sviluppo. NON e' una copia dell'APK gia' installato sul telefono.
Chiavi, segreti, build e APK NON sono inclusi.
I 2D v22 non devono essere alterati.
Per un ripristino completo e' necessario conservare anche l'APK locale e il keystore
in un'area PRIVATA sicura, mai nel repository GitHub pubblico.
TXT

git -C "$REPO" add -A -- android-snapshot-2026-10-27
if git -C "$REPO" diff --cached --quiet; then
  echo "Snapshot invariato rispetto al backup precedente."
else
  git -C "$REPO" -c user.name="Backup Petali" -c user.email="backup@users.noreply.github.com" commit -m "Backup sorgenti Android Petali prima della pulizia"
fi

echo "Carico lo snapshot su GitHub..."
if git -C "$REPO" push -u origin "$BRANCH"; then
  echo "BACKUP GITHUB COMPLETATO."
  echo "https://github.com/eyjyssj5/petali-privacy/tree/$BRANCH/android-snapshot-2026-10-27"
else
  echo "BACKUP SOLO LOCALE: caricamento GitHub non riuscito." >&2
  echo "NON cancellare o ripulire il PC." >&2
  exit 1
fi
