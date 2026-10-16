# Petali AIVEVIA — avanzamento modelli 3D realistici (15 fiori)
Aggiornato 16 ottobre 2026. **Non confondere anteprima interattiva con qualità finale approvata.**

## Criterio obbligatorio
Ogni fiore deve essere una specie botanica fedele e non una corolla generica o una rosa ricolorata (eccezione: varietà rossa/gialla della stessa rosa). 3D con texture realistiche da ogni lato, gambo/foglie/retro, petali fisicamente separabili di dimensione credibile; ultimo petalo non deve diventare un puntino. Numero di petali variabile tramite configurazioni naturali; i petali reali e le strutture riproduttive devono mantenere una struttura botanicamente sensata. Zoom/rotazione touch su Android e iPhone. Texture/mobile budget, licenza commerciale verificata, citazione autore quando richiesta. Niente upload di file di terzi senza licenza compatibile.

## Stato controllato
| Fiore | Modello | Fase | Prossimo lavoro |
|---|---|---|---|
| Rosa rossa | highpoly fornito dall'utente, `gioco/rosa-variabile/rose_highpoly_realistic.glb` | **Approvata visivamente dall'utente** | Conservare; regression tests su touch e variabilità |
| Rosa gialla | colorway della stessa rosa alta definizione | **Anteprima non approvata** | Confermare colore, texture e fluidità |
| Tulipano rosso | CC0 3D candidato in `gioco/modelli-botanici/` | **Prototipo, 6 petali separabili** | Sostituire con qualità HD o affinare texture |
| Girasole | CC0 3D candidato | **Prototipo, 24 ligule separabili** | Qualità/texture, numero variabile verosimile |
| Orchidea | CC0 3D candidato | **Prototipo, 32 pezzi separabili su più fiori** | Isolare un singolo fiore, resa realistica |
| Ortensia | CC0 3D candidato | **Prototipo, 164 sepali separabili in grappolo** | Interazione su singoli fiorellini, texture |
| Lavanda | CC0 3D cespuglio | **Solo rotazione, non giocabile** | Fiore/spiga 3D con elementi staccabili |
| Ciliegio | CC0 3D albero | **Solo rotazione, non giocabile** | Fiore di ciliegio individuale HD |
| Papavero | Non scelto | **Ricerca modello** | Download utilizzabile commercialmente, petali separabili |
| Iris | Non scelto | **Ricerca modello** | Modello singolo botanico realistico |
| Garofano rosso | Non scelto | **Candidato CC BY trovato** | Verifica scan 3D, texture e parti separate |
| Viola | Non scelto | **Candidato CC BY trovato** | Verifica qualità e poligoni; segmentazione |
| Peonia | Non scelto | **Candidato CC BY trovato** | Verifica scan fotogrammetrico, ripulire la mesh |
| Dalia | Non scelto | **Ricerca modello** | Escludere mesh cartoon/CC BY-NC |
| Ibisco | Non scelto | **Candidato CC BY trovato** | Verifica fiori e stami, segmentazione |

## Candidati originali con licenza da riverificare al momento dell'importazione
- Ibisco: [Hibiscus Flower — VeeRuby](https://sketchfab.com/3d-models/hibiscus-flower-af897de85581408784668b7fc2ac63fb) (CC BY, 180.5k triangoli, download dichiarato disponibile).
- Garofano: [Carnation — sv.stats](https://sketchfab.com/3d-models/carnation-5940c0dabc0448d8bc003280c62ebaa0) (CC BY, 26k triangoli).
- Viola: [Pansy — mrak](https://sketchfab.com/3d-models/pansy-398322b2289040ba8ed978c6cde27b15) (CC BY, ~1.1M triangoli; richiede riduzione).
- Peonia: [Single Peony Flower — AaronABC](https://sketchfab.com/3d-models/single-peony-flower-0086ca4bb65b40c290c319b6543916ec) (CC BY, ~1M triangoli, scansione RealityScan; richiede riduzione).
- Dahlia low-poly [Dahlias — Marche](https://sketchfab.com/3d-models/dahlias-f4952ddd84c945dea5ddd522eabdbec6) **ESCLUSO**: CC BY-NC non consentito in app commerciale.

## Workflow senza scaricare sul telefono
1. L'assistente seleziona modello realistico e licenza commerciale; scarica direttamente i GLB pubblicamente accessibili e li porta in GitHub.
2. Se download richiede login Sketchfab non automatizzabile, chiedere all'utente **solo il modello specifico**, da scaricare preferibilmente dal PC e allegare in chat.
3. Preparare GLB mobile, separazione petali, rotazione e rimozione. Pubblicare preview in GitHub Pages.
4. L'utente valuta nel browser, si corregge finché approvato, poi si integra nel progetto Android/iOS.
5. Al termine: test 15/15 specie realistiche, lingue, prestazioni, AAB/IPA e store. Nessun file di prova deve restare obbligatoriamente sul cellulare.

Browser dei sei prototipi: https://eyjyssj5.github.io/petali-privacy/gioco/altri-fiori-3d/
Rosa originale HD: https://eyjyssj5.github.io/petali-privacy/gioco/rosa-variabile/
