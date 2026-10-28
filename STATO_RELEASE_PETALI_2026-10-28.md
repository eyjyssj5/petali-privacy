# Petali: release readiness 28/10/2026

**NOT READY FOR SALE.** Sono state corrette le aperture Premium nel player 3D e la verifica tramite RevenueCat. Il codice del ramo è una patch ai sorgenti Android salvati il 27/10, non un APK né una prova dei modelli 3D sul telefono.

## Modifiche tecniche apportate
- Rimosso `previewPay(){return true;}`; gioco 3D consentito solo con entitlement attivo `fiori_3d`.
- Rimosso bypass tramite pulsante `Stacca un petalo`; anteprima separata da gioco.
- Refresh SDK, ripristino acquisti, aggiornamento UI dopo acquisto e stato dell'entitlement.
- Configurati *identificativi* `fiori_2d`, `fiori_3d` e relativo offerings, ma chiavi SDK pubbliche non presenti.
- Corretto comando `npm test` per includere davvero i test `.cjs` (prima la vecchia glob non eseguiva nulla).

## Bloccanti non risolti
1. Creare/attivare prodotti nel proprio Google Play Console e RevenueCat con lo stesso package ID `com.aivevia.petali`; configurare le chiavi SDK e **provare una transazione vera**.
2. Raccogliere licenze commerciali per ciascun GLB; verificare 15 modelli e petali individuali.
3. Non sono stati generati nuovi GLB fotorealistici con un servizio gratuito: Trellis online ha esaurito i crediti.
4. Preparare AAB, firma JKS privata, versioneCode nuovo, privacy e scheda del negozio, poi Play review.
5. Google Play richiede 12 tester opt-in per 14 giorni consecutivi, domanda accesso produzione e possibile revisione fino a 7 giorni.

**Non caricare** JKS, password, service-account, token di API o credenziali personali su questo repository pubblico.

## Fonti ufficiali
- Google Play: https://support.google.com/googleplay/android-developer/answer/14151465?hl=it
- RevenueCat Capacitor: https://www.revenuecat.com/docs/getting-started/installation/capacitor
- Meshy piano Free: https://help.meshy.ai/it/articles/15696428-what-is-included-on-the-free-plan
