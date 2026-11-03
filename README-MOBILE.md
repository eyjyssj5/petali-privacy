# PETALI | AIVEVIA: Android e iOS

Repository: https://github.com/eyjyssj5/petali-privacy

## Che cosa è stato preparato
- Gioco web esistente conservato in `gioco/`.
- Nuove scene floreali con **profondità CSS 3D**: petali sovrapposti, ombre, steli, foglie e distacco animato. Questo non equivale a modelli 3D GLB ruotabili.
- 15 specie e testi in italiano, inglese e spagnolo.
- Numero di petali casuale da 9 a 21, deciso all'avvio e diverso dalla partita precedente.
- Progetto condiviso Capacitor per Android e iOS, più due workflow GitHub Actions (Android debug e iOS simulator).
- Le chiavi RevenueCat per Android/iOS sono ancora segnaposto.

## 15 nuovi render fotorealistici
L'archivio `PETALI_15_FIORI_ASSET_GITHUB.zip` contiene immagini WebP a fondo trasparente (ogni fiore separato), da estrarre sotto `gioco/img3d/`. **Questi file non sono ancora inclusi in questo repository** finché non vengono caricati. Sono fotografie/render con effetto 3D, NON geometrie con petali individuali. I petali rimovibili sono invece gestiti dai PNG esistenti e dal nuovo CSS.

## Android
Richiede Node.js 22+, Java 21 e Android SDK:
```bash
npm install
npm test
npm run android:init
npx cap open android
```
Per ottenere un APK di prova da GitHub: aprire Actions > Petali Android APK (debug) > Run workflow sul ramo di sviluppo, quindi scaricare l'artefatto APK. Questo APK non è un AAB firmato per la pubblicazione.

## iPhone / iPad
Richiede Mac, Xcode, account Apple Developer per distribuzione:
```bash
npm install
npm test
npm run ios:init
npx cap open ios
```
Il workflow iOS Simulator verifica una compilazione **senza firma**: non pubblica su App Store e non genera un'IPA distribuibile.

## Pagamenti
Inserire esclusivamente le chiavi **pubbliche** in `gioco/pagamenti-config.js`. Collegare su RevenueCat gli store e i prodotti, con diritto `sblocco` configurato correttamente per entrambi. Non caricare chiavi private/JSON di account servizio su GitHub.

La registrazione attuale è locale al dispositivo: non è un account verificato tramite backend. Per un'app commerciale verificare autenticazione, cancellazione account, privacy e recupero acquisti.

## Prima degli store
Verificare immagini caricate, animazioni su dispositivi Android e iPhone, prodotti di acquisto e ripristino, UX, icone, screenshot, privacy e firme. Github Pages resta valido per il sito: Cloudflare non è indispensabile.

Questo ramo di sviluppo non va confuso con un'app già pubblicata.
