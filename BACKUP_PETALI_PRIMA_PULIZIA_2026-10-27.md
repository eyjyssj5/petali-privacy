# Petali - punto di ripristino prima della pulizia del PC (27 ottobre 2026)

Questo ramo è una **copia preservata dello stato GitHub preesistente** e un luogo separato per il backup del progetto Android. Non modifica il ramo `main`.

## Situazione verificata
- Progetto: Petali / M'ama Non m'ama (Android Capacitor e fiori 2D/3D).
- I 15 fiori 2D della versione 22 sono approvati e non devono essere modificati.
- La schermata Android 3D si apre; alcuni modelli e l'interazione restano da perfezionare.
- L'APK attualmente installato sul telefono è la **versione di sicurezza da preservare**.
- Codice locale dichiarato: `~/petali-compilazione-finale` in WSL Ubuntu.
- APK locale dichiarato: `Desktop/app ama no ama/01_APP_ATTUALE/Petali-debug.apk`.
- Il ramo `main` di questo repository contiene soprattutto versioni web e modelli precedenti e NON è prova di avere i sorgenti dell'ultimo APK.

## Come completare il backup
Questo repository è **PUBBLICO**: i file caricati in un nuovo ramo pubblico sono comunque visibili a tutti. Il trasferimento dei sorgenti Android deve essere avviato dal computer con `scripts/esporta-backup-android.sh`, perché il collegamento GitHub non accede al disco del PC. Non trasferire mai credenziali o chiavi di firma.

Il backup del progetto originale e quello dell'APK devono anche essere conservati **localmente**, fuori dalle cartelle da ripulire, con almeno un'altra copia di sicurezza (disco esterno o spazio cloud privato).

## Esclusioni tassative
Non caricare mai `*.jks`, `*.keystore`, file `.env*`, password, token, certificati, credenziali Google, chiavi RevenueCat, oppure directory di compilazione `build`, `node_modules`, `.gradle`, né cache.

## Verifica prima della pulizia
La pulizia di Desktop e Download va iniziata soltanto dopo aver controllato che:
1. La copia dell'APK che funziona sul telefono è al sicuro.
2. Il progetto WSL originale rimane intatto.
3. Il backup GitHub contiene effettivamente il codice aggiornato, non soltanto questa nota.
4. Esiste una seconda copia dei file importanti; non basarsi unicamente su GitHub.

## Test successivi
Lavorare su una copia separata, senza sostituire l'APK di sicurezza. Ripristinare il Premium/RevenueCat prima della distribuzione commerciale.
