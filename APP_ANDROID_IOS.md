# Petali AIVEVIA: Android e iOS

## Stato del progetto

- Sito e gioco originale preservati in `gioco/` e pubblicati da GitHub Pages.
- 15 fiori esistenti in tre lingue IT/EN/ES.
- Distacco dei petali con profondita' CSS 3D (immagini di petali indipendenti, non un modello volumetrico GLB).
- Numero casuale di petali fra 9 e 21 a ogni partita, non ripetuto rispetto alla precedente partita con lo stesso ultimo numero.
- L'esito e' casuale, coerente con l'inizio "M'ama" o "Non m'ama".
- Capacitor 8: singola base web per app Android e iOS.

## Per preparare le due applicazioni

Serve Node 22+. Nella cartella principale:

```bash
npm install
npm test
npm run android:init
npx cap open android
```

Per iPhone, serve macOS con Xcode:

```bash
npm install
npm run ios:init
npx cap open ios
```

Le successive modifiche del gioco si trasferiscono con `npm run sync:android`
oppure `npm run sync:ios`.

### Build automatica Android

Il workflow `.github/workflows/petali-android-debug.yml` compila un APK di debug
come artefatto GitHub Actions. **Questo APK non e' un AAB firmato per la pubblicazione**.
La build iOS e il rilascio App Store richiedono certificati, profili e account Apple Developer.

## Monetizzazione ancora da configurare

Il gioco corrente ha tre fiori gratuiti; gli altri richiedono registrazione
locale e acquisto. La registrazione attuale e' una prova locale in localStorage,
non un account verificato tramite server. Prima di vendere app o contenuti
occorre integrare autenticazione reale (o rimuovere la finta registrazione).

Nel file `gioco/pagamenti-config.js` inserire SOLO:
- chiave SDK pubblica RevenueCat Android;
- chiave SDK pubblica RevenueCat iOS;
- il nome del diritto (entitlement) configurato per lo sblocco.

In RevenueCat vanno configurati separatamente Google Play Billing e Apple
StoreKit, con prodotti attivi, offerte e verifica sandbox. **Non inserire segreti
nell'archivio GitHub pubblico.** Attualmente le chiavi sono segnaposto: gli
acquisti non possono funzionare fino alla configurazione.

## Risorse 3D fotorealistiche

Le 15 immagini generate sono conservate in un archivio separato con struttura
`gioco/img3d/<id>.webp`. Sono rendering fotorealistici destinati a miniature
e schermate di scelta. Non contengono mesh tridimensionali o petali separati;
il distacco resta affidato alle immagini-petalo gia' presenti nella cartella
`gioco/img`. Le immagini fotorealistiche ad alta risoluzione vanno
caricate nella cartella indicata prima di abilitarle nel codice della griglia.

## Prima della pubblicazione

Verificare privacy e cancellazione dati, autenticazione, acquisti in-app su
entrambi gli store, banner e informazioni obbligatorie, permessi e supporto
smartphone, tablet e offline. Il sito GitHub Pages **non e' da solo un'app**
pubblicata sul Play Store o App Store.
