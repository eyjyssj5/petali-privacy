/* Gioco con immagini, in italiano, inglese e spagnolo.
 * Ogni fiore e' fatto di petali: un file PNG trasparente in img/<id>-petalo.png.
 * Se il file manca, il petalo diventa un ovale colorato.
 */
/* PETALI_V22_ORIGINALI_RESTAURATI: immagini PNG e corolla 2D v22 */
(function () {
  const $ = (id) => document.getElementById(id);

  const T = {
    it: {
      titolo: "Petali",
      acquistaFiori: "Sblocca i 12 fiori 2D premium",
      pagamentoNonDisponibile: "Acquisti non disponibili su questo dispositivo.",
      pagamentoErrore: "Acquisto non riuscito. Riprova più tardi.",
      sbloccaFiori: "Registrati per sbloccare tutti i fiori",
      bloccatoAvviso: "Questo fiore si sblocca con la registrazione.",
      termini: "Termini",
      privacy: "Privacy",
      cancellazione: "Cancellazione",
      cancellaAccount: "Cancella account",
      confermaCancella: "Cancellare l'account e i dati salvati sul telefono?",
      benvenuto: "Benvenuto",
      vuoiRegistrarti: "Vuoi registrarti?",
      siRegistrati: "Sì, registrati",
      salta: "Salta",
      registrazione: "Registrazione",
      notaProva: "Versione di prova: i dati restano sul telefono.",
      emailPlaceholder: "La tua email",
      accettoTesto: "Accetto i termini e l'informativa privacy",
      leggiTermini: "Leggi i termini",
      leggiPrivacy: "Leggi la privacy",
      creaAccount: "Crea account",
      sessoDomanda: "Sei maschio o femmina?",
      femmina: "Femmina",
      maschio: "Maschio",
      aspetto: "Aspetto:",
      storia: "Storia:",
      subtitle: "m'ama, non m'ama",
      intro: "Scegli un fiore e togli i suoi petali: scopri se ti ama.",
      sceltaTitolo: "Scegli un fiore",
      suonoOn: "Suono: attivo",
      suonoOff: "Suono: spento",
      inizioDomanda: "Da dove vuoi iniziare?",
      iniziaMama: "Inizia con M'ama",
      iniziaNonMama: "Inizia con Non m'ama",
      togli: "Togli un petalo",
      indietro: "Torna ai fiori",
      ricomincia: "Ricomincia con questo fiore",
      significato: "Significato:",
      mama: "M'ama",
      nonMama: "Non m'ama",
    },
    en: {
      titolo: "Petals",
      acquistaFiori: "Unlock 12 premium 2D flowers",
      pagamentoNonDisponibile: "Purchases are not available on this device.",
      pagamentoErrore: "Purchase failed. Try again later.",
      sbloccaFiori: "Sign up to unlock all flowers",
      bloccatoAvviso: "This flower unlocks with registration.",
      termini: "Terms",
      privacy: "Privacy",
      cancellazione: "Deletion",
      cancellaAccount: "Delete account",
      confermaCancella: "Delete the account and the data saved on the phone?",
      benvenuto: "Welcome",
      vuoiRegistrarti: "Do you want to sign up?",
      siRegistrati: "Yes, sign up",
      salta: "Skip",
      registrazione: "Sign up",
      notaProva: "Test version: data stays on your phone.",
      emailPlaceholder: "Your email",
      accettoTesto: "I accept the terms and the privacy policy",
      leggiTermini: "Read the terms",
      leggiPrivacy: "Read the privacy policy",
      creaAccount: "Create account",
      sessoDomanda: "Are you male or female?",
      femmina: "Female",
      maschio: "Male",
      aspetto: "Look:",
      storia: "History:",
      subtitle: "loves me, loves me not",
      intro: "Choose a flower and pull off its petals: find out if it loves you.",
      sceltaTitolo: "Choose a flower",
      suonoOn: "Sound: on",
      suonoOff: "Sound: off",
      inizioDomanda: "Where do you want to start?",
      iniziaMama: "Start with Loves me",
      iniziaNonMama: "Start with Loves me not",
      togli: "Remove a petal",
      indietro: "Back to flowers",
      ricomincia: "Start again with this flower",
      significato: "Meaning:",
      mama: "Loves me",
      nonMama: "Loves me not",
    },
    es: {
      titolo: "Pétalos",
      acquistaFiori: "Desbloquear 12 flores 2D prémium",
      pagamentoNonDisponibile: "Las compras no están disponibles en este dispositivo.",
      pagamentoErrore: "La compra no se completó. Inténtalo más tarde.",
      sbloccaFiori: "Regístrate para desbloquear todas las flores",
      bloccatoAvviso: "Esta flor se desbloquea con el registro.",
      termini: "Términos",
      privacy: "Privacidad",
      cancellazione: "Eliminación",
      cancellaAccount: "Borrar cuenta",
      confermaCancella: "¿Borrar la cuenta y los datos guardados en el teléfono?",
      benvenuto: "Bienvenido",
      vuoiRegistrarti: "¿Quieres registrarte?",
      siRegistrati: "Sí, regístrate",
      salta: "Saltar",
      registrazione: "Registro",
      notaProva: "Versión de prueba: los datos se quedan en el teléfono.",
      emailPlaceholder: "Tu email",
      accettoTesto: "Acepto los términos y la política de privacidad",
      leggiTermini: "Leer los términos",
      leggiPrivacy: "Leer la privacidad",
      creaAccount: "Crear cuenta",
      sessoDomanda: "¿Eres hombre o mujer?",
      femmina: "Mujer",
      maschio: "Hombre",
      aspetto: "Aspecto:",
      storia: "Historia:",
      subtitle: "me quiere, no me quiere",
      intro: "Elige una flor y quita sus pétalos: descubre si te quiere.",
      sceltaTitolo: "Elige una flor",
      suonoOn: "Sonido: activo",
      suonoOff: "Sonido: apagado",
      inizioDomanda: "¿Por dónde quieres empezar?",
      iniziaMama: "Empieza con Me quiere",
      iniziaNonMama: "Empieza con No me quiere",
      togli: "Quita un pétalo",
      indietro: "Volver a las flores",
      ricomincia: "Empezar de nuevo con esta flor",
      significato: "Significado:",
      mama: "Me quiere",
      nonMama: "No me quiere",
    },
  };

  const P2D = {
    it: ['Sblocca i 12 fiori 2D', 'Ripristina acquisti'],
    en: ['Unlock 12 premium 2D flowers', 'Restore purchases'],
    es: ['Desbloquear 12 flores 2D prémium', 'Restaurar compras'],
    pt: ['Desbloquear 12 flores 2D premium', 'Restaurar compras'],
    fr: ['Débloquer 12 fleurs 2D premium', 'Restaurer les achats'],
    de: ['12 Premium-2D-Blumen freischalten', 'Käufe wiederherstellen']
  };

  // Additional fully translated UI locales loaded after fiori.js.
  if (window.PetaliLingueExtra) Object.assign(T, window.PetaliLingueExtra.UI);
  for (const [code, labels] of Object.entries(P2D)) if (T[code]) { T[code].acquistaFiori = labels[0]; T[code].ripristina = labels[1]; }

  const COLORI = {
    "rosa-rossa": { petalo: "#d62839", centro: "#8f0a22" },
    "rosa-gialla": { petalo: "#f4c430", centro: "#d19a00" },
    "girasole": { petalo: "#f7b500", centro: "#4a2c17" },
    "tulipano-rosso": { petalo: "#d7263d", centro: "#f2c14e" },
    "orchidea": { petalo: "#c77dff", centro: "#f7d1ff" },
    "lavanda": { petalo: "#9b7fd1", centro: "#6a4fa3" },
    "papavero": { petalo: "#e63946", centro: "#1d1d1d" },
    "iris": { petalo: "#4361ee", centro: "#ffd60a" },
    "garofano-rosso": { petalo: "#c1121f", centro: "#780000" },
    "viola": { petalo: "#7b4fb8", centro: "#ffd60a" },
    "ortensia": { petalo: "#4a7fd6", centro: "#2b4f9e" },
    "peonia": { petalo: "#d6246e", centro: "#8f1447" },
    "dalia": { petalo: "#f0701e", centro: "#c2410c" },
    "ciliegio": { petalo: "#f4b6c8", centro: "#c94d6e" },
    "ibisco": { petalo: "#d6334f", centro: "#8f0a22" },
  };

  const MAMA = "M'ama";
  const NONMAMA = "Non m'ama";

  let lingua = "it";
  let fioreCorrente = null;
  let fioreAttuale = null;
  let petaliTotali = 0;
  let petaliTolti = 0;
  let primoMAma = true;
  let ultimoNumero = 0;
  let suonoAttivo = localStorage.getItem("petali.suono") !== "no";
  let contestoAudio = null;

  function t(chiave) {
    return T[lingua][chiave];
  }

  // Lingua salvata, altrimenti quella del telefono se disponibile, altrimenti italiano.
  function linguaIniziale() {
    const salvata = localStorage.getItem("petali.lingua");
    if (salvata && T[salvata]) return salvata;
    const sistema = (navigator.language || "it").slice(0, 2).toLowerCase();
    return T[sistema] ? sistema : "it";
  }

  // Aspetto e storia del fiore, nella lingua scelta.
  function mostraDescrizione(fiore) {
    $("desc-testo").textContent = fiore.descrizione[lingua];
    $("storia-testo").textContent = fiore.storia[lingua];
  }

  // Numero di petali casuale, diverso dall'ultima volta.
  function nuovoNumeroPetali() {
    let n;
    do {
      n = Fiori.petaliCasuali();
    } while (n === ultimoNumero);
    ultimoNumero = n;
    return n;
  }

  // Etichetta del petalo n, secondo la partenza scelta dal giocatore.
  function etichettaPetalo(n) {
    const dispari = n % 2 === 1;
    return dispari === primoMAma ? MAMA : NONMAMA;
  }

  // Valore deterministico tra 0 e 1, per variare i petali senza casualita' ad ogni disegno.
  function variazione(i) {
    return Math.abs(Math.sin((i + 1) * 12.9898));
  }

  // Petali tridimensionali: superficie fotografica, anelli sfalsati e inclinazione.
  // Il numero e' sempre deciso dalla logica originale al momento di iniziare.
  function creaPetalo(fiore, i, n) {
    const r = variazione(i);
    const contenitore = document.createElement("div");
    contenitore.className = "petalo-img";
    contenitore.style.setProperty("--a", ((360 / n) * i + (r - 0.5) * 12).toFixed(1) + "deg");
    contenitore.style.setProperty("--sx", ((i % 2 ? -1 : 1) * (0.9 + 0.2 * r)).toFixed(3));
    contenitore.style.setProperty("--colore", COLORI[fiore.id] ? COLORI[fiore.id].petalo : "#d62839");

    const img = document.createElement("img");
    img.alt = "";
    img.src = fiore.immagine;
    img.addEventListener("error", () => contenitore.classList.add("riserva"));
    contenitore.appendChild(img);
    return contenitore;
  }

  function costruisciFiore(fiore, n) {
    const cont = document.createElement("div");
    cont.className = "fiore";
    const petali = [];
    for (let i = 0; i < n; i++) {
      const p = creaPetalo(fiore, i, n);
      cont.appendChild(p);
      petali.push(p);
    }
    return { cont, petali };
  }

  function mostra(idSchermata) {
    document.querySelectorAll(".schermata").forEach((s) => s.classList.remove("attiva"));
    $(idSchermata).classList.add("attiva");
    window.scrollTo(0, 0);
  }

  // Evidenzia il cuore del risultato: a destra "M'ama", a sinistra "Non m'ama".
  function aggiornaSimboli(etichetta) {
    $("simbolo-mama").classList.toggle("attivo", etichetta === MAMA);
    $("simbolo-nonmama").classList.toggle("attivo", etichetta === NONMAMA);
  }

  // PETALI_RECUPERO_SCHERMATA: 15 anteprime botaniche DIVERSE, mai lo stesso fiore ripetuto.
  function costruisciGriglia() {
    const griglia = $("griglia-fiori");
    griglia.replaceChildren();
    $("btn-sblocca").hidden = acquistato;
    $("btn-sblocca").textContent = t("acquistaFiori") || "Sblocca 12 fiori 2D";
    Fiori.FIORI.forEach((fiore) => {
      const libero = fioreSbloccato(fiore);
      const carta = document.createElement("button");
      carta.type = "button";
      carta.className = "carta petali-v22" + (libero ? "" : " bloccato");
      carta.setAttribute("aria-label", fiore.nome[lingua] + (libero ? ", gratis" : ", Premium"));
      carta.appendChild(costruisciFiore(fiore, 12).cont);
      const nome = document.createElement("strong");
      nome.textContent = fiore.nome[lingua];
      const significato = document.createElement("small");
      significato.textContent = fiore.significato[lingua];
      const stato = document.createElement("span");
      stato.className = "petali-v22-stato" + (libero ? " libero" : "");
      stato.textContent = libero ? "✓ GRATIS 2D" : "🔒 PREMIUM 2D";
      carta.append(nome, significato, stato);
      carta.addEventListener("click", () => {
        if (libero) apriFiore(fiore);
        else void compra();
      });
      griglia.appendChild(carta);
    });
  }

  function apriFiore(fiore) {
    fioreCorrente = fiore;
    petaliTolti = 0;
    fioreAttuale = null;
    $("immagine-fiore").replaceChildren(costruisciFiore(fiore, 12).cont);

    $("nome-fiore").textContent = fiore.nome[lingua];
    $("btn-apri-3d").href = "15-fiori-3d/index.html?fiore=" + encodeURIComponent(fiore.id === "tulipano-rosso" ? "tulipano" : fiore.id);
    $("significato-fiore").textContent = t("significato") + " " + fiore.significato[lingua];
    mostraDescrizione(fiore);
    $("esito").hidden = true;
    $("btn-petalo").hidden = true;
    $("simboli").hidden = true;
    $("scelta-inizio").hidden = false;
    aggiornaSimboli(null);
    aggiornaAccesso3D();
    mostra("gioco");
  }

  // Il risultato e' scelto a caso; il numero di petali si adatta alla partenza scelta.
  function iniziaCon(mAma) {
    primoMAma = mAma;
    const risultatoVoluto = Math.random() < 0.5 ? MAMA : NONMAMA;
    petaliTotali = Fiori.numeroPerRisultato(primoMAma, risultatoVoluto, ultimoNumero);
    ultimoNumero = petaliTotali;
    petaliTolti = 0;

    fioreAttuale = costruisciFiore(fioreCorrente, petaliTotali);
    $("immagine-fiore").replaceChildren(fioreAttuale.cont);

    $("scelta-inizio").hidden = true;
    $("simboli").hidden = false;
    $("btn-petalo").hidden = false;
    $("btn-petalo").disabled = false;
    aggiornaSimboli(null);
  }

  function mostraEsito(risultato) {
    const mAma = risultato === MAMA;
    $("esito-testo").hidden = true;
    $("esito-messaggio").textContent = fioreCorrente.messaggi[mAma ? "mama" : "nonMama"][lingua];
    $("esito").hidden = false;
    aggiornaSimboli(risultato);
  }

  function togliPetalo() {
    if (petaliTolti >= petaliTotali) return;
    const petalo = fioreAttuale.petali[petaliTolti];
    petaliTolti += 1;

    // M'ama: il petalo vola a destra e prende un tono rosato. Non m'ama: a sinistra e grigio.
    const etichetta = etichettaPetalo(petaliTolti);
    const mAma = etichetta === MAMA;
    petalo.classList.add("tolto", mAma ? "mama" : "nonmama");
    aggiornaSimboli(etichetta);

    suona(mAma);
    vibra(mAma);
    inclina(mAma);

    if (petaliTolti === petaliTotali) {
      $("btn-petalo").hidden = true;
      mostraEsito(etichettaPetalo(petaliTotali));
    }
  }

  // ---------- Suono, vibrazione e inclinazione ----------

  // Suono breve generato nel programma: dolce per "M'ama", grave per "Non m'ama".
  function suona(mAma) {
    if (!suonoAttivo) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      contestoAudio = contestoAudio || new AudioCtx();
      const tempo = contestoAudio.currentTime;
      const oscillatore = contestoAudio.createOscillator();
      const guadagno = contestoAudio.createGain();
      oscillatore.type = mAma ? "sine" : "triangle";
      oscillatore.frequency.setValueAtTime(mAma ? 660 : 220, tempo);
      oscillatore.frequency.linearRampToValueAtTime(mAma ? 880 : 165, tempo + (mAma ? 0.25 : 0.35));
      guadagno.gain.setValueAtTime(0.0001, tempo);
      guadagno.gain.exponentialRampToValueAtTime(0.2, tempo + 0.02);
      guadagno.gain.exponentialRampToValueAtTime(0.0001, tempo + (mAma ? 0.3 : 0.45));
      oscillatore.connect(guadagno);
      guadagno.connect(contestoAudio.destination);
      oscillatore.start(tempo);
      oscillatore.stop(tempo + 0.5);
    } catch (errore) {
      // Audio non disponibile: si va avanti senza suono.
    }
  }

  // Vibrazione leggera per "M'ama", piu' forte per "Non m'ama".
  function vibra(mAma) {
    const plugin = (window.PetaliNative && window.PetaliNative.Haptics)
      || (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics);
    if (plugin) {
      plugin.impact({ style: mAma ? "LIGHT" : "HEAVY" }).catch(() => {});
    } else if (navigator.vibrate) {
      navigator.vibrate(mAma ? 30 : 120);
    }
  }

  // Il fiore si inclina a destra per "M'ama", a sinistra per "Non m'ama".
  function inclina(mAma) {
    const fiore = $("immagine-fiore").firstElementChild;
    if (!fiore) return;
    fiore.classList.remove("inclina-destra", "inclina-sinistra");
    void fiore.offsetWidth;
    fiore.classList.add(mAma ? "inclina-destra" : "inclina-sinistra");
  }

  function aggiornaPulsanteSuono() {
    $("btn-suono").textContent = suonoAttivo ? t("suonoOn") : t("suonoOff");
  }

  // ---------- Lingua ----------

  function applicaLingua(nuova) {
    lingua = nuova;
    localStorage.setItem("petali.lingua", lingua);
    document.documentElement.lang = lingua;
    document.title = t("titolo");
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    document.querySelectorAll(".lingua").forEach((b) => {
      b.classList.toggle("attiva", b.dataset.lingua === lingua);
    });
    document.querySelectorAll("details.menu-lingue").forEach((d) => { d.open = false; });
    aggiornaPulsanteSuono();
    $("btn-ripristina").textContent = t("ripristina") || "Ripristina acquisti";
    costruisciGriglia();
    if (fioreCorrente) {
      $("nome-fiore").textContent = fioreCorrente.nome[lingua];
      $("significato-fiore").textContent = t("significato") + " " + fioreCorrente.significato[lingua];
      mostraDescrizione(fioreCorrente);
      if (!$("esito").hidden) mostraEsito(etichettaPetalo(petaliTotali));
    }
  }

  // ---------- Avvio ----------

  $("btn-inizia-mama").addEventListener("click", () => iniziaCon(true));
  $("btn-inizia-non-mama").addEventListener("click", () => iniziaCon(false));
  $("btn-petalo").addEventListener("click", togliPetalo);
  $("btn-indietro").addEventListener("click", () => mostra("scelta"));
  $("btn-ricomincia").addEventListener("click", () => apriFiore(fioreCorrente));
  $("btn-suono").addEventListener("click", () => {
    suonoAttivo = !suonoAttivo;
    localStorage.setItem("petali.suono", suonoAttivo ? "si" : "no");
    aggiornaPulsanteSuono();
  });
  document.querySelectorAll(".lingua").forEach((b) => {
    b.addEventListener("click", () => applicaLingua(b.dataset.lingua));
  });

  // ---------- Avvio: benvenuto, registrazione, sesso e pagine legali ----------

  const CHIAVE_STATO = "petali.stato";
  let schermaPrecedente = "scelta";
  let acquistato = false; // 12 fiori 2D premium; verificato via RevenueCat. // PETALI_PREMIUM_V2

  // Tre fiori normali 2D sempre gratuiti; tutti i 3D richiedono un acquisto distinto.
  const FIORI_GRATIS = ["rosa-rossa", "rosa-gialla", "girasole"];

  function fioreSbloccato(fiore) {
    return acquistato || FIORI_GRATIS.includes(fiore.id);
  }

  function leggiStato() {
    try {
      return JSON.parse(localStorage.getItem(CHIAVE_STATO)) || {};
    } catch (errore) {
      return {};
    }
  }

  function scriviStato(modifiche) {
    localStorage.setItem(CHIAVE_STATO, JSON.stringify(Object.assign(leggiStato(), modifiche)));
  }

  function schermaAttiva() {
    const attiva = document.querySelector(".schermata.attiva");
    return attiva ? attiva.id : "scelta";
  }

  function apriLegale(nome) {
    schermaPrecedente = schermaAttiva();
    // Legal documents need separate legal review before launching a new locale.
    // Use the existing English pages for new locales until approved translations exist.
    const linguaLegale = ["it", "en", "es"].includes(lingua) ? lingua : "en";
    $("pagina-legale").src = "legal/" + linguaLegale + "/" + nome + ".html";
    mostra("legale");
  }

  // Se il sesso e' gia' scelto si va alla scelta dei fiori, altrimenti si parte dal benvenuto.
  function avviaFlusso() {
    mostra("scelta");
  }

  $("btn-registrati").addEventListener("click", () => mostra("registrazione"));
  $("btn-indietro-reg").addEventListener("click", () => mostra("benvenuto"));
  $("btn-sblocca").addEventListener("click", () => void compra());

  $("btn-salta").addEventListener("click", () => {
    scriviStato({ registrato: false });
    mostra("sesso");
  });

  $("form-registrazione").addEventListener("submit", (evento) => {
    evento.preventDefault();
    scriviStato({
      registrato: true,
      email: $("email").value.trim(),
      accettoIl: new Date().toISOString(),
    });
    costruisciGriglia();
    mostra(leggiStato().sesso ? "scelta" : "sesso");
  });

  document.querySelectorAll(".figura").forEach((bottone) => {
    bottone.addEventListener("click", () => {
      scriviStato({ sesso: bottone.dataset.sesso });
      mostra("scelta");
    });
  });

  document.querySelectorAll("[data-legale]").forEach((bottone) => {
    bottone.addEventListener("click", () => apriLegale(bottone.dataset.legale));
  });

  $("btn-chiudi-legale").addEventListener("click", () => {
    $("pagina-legale").src = "about:blank";
    mostra(schermaPrecedente);
  });

  // Acquisti Android/iOS: due diritti indipendenti, con verifica RevenueCat.
  const commerce = window.PetaliCommerce;

  async function configuraPagamenti() {
    try {
      await commerce.refresh();
      acquistato = commerce.has('2d');
    } catch (_) { acquistato = false; }
    costruisciGriglia();
    aggiornaAccesso3D();
  }

  function aggiornaAccesso3D() {
    const link = $("btn-apri-3d");
    link.textContent = commerce.has('3d') ? '✿ Versione 3D Premium' : '🔒 Versione 3D a pagamento';
  }

  async function compra() {
    try {
      await commerce.buy('2d');
      acquistato = commerce.has('2d');
    } catch (errore) {
      if (!errore?.userCancelled) alert(errore?.message || t('pagamentoErrore'));
    }
    costruisciGriglia();
    aggiornaAccesso3D();
  }

  $("btn-ripristina").addEventListener('click', async () => {
    try {
      await commerce.restore();
      acquistato = commerce.has('2d');
      alert(acquistato || commerce.has('3d')
        ? 'Acquisti ripristinati.' : 'Nessun acquisto trovato.');
    } catch (errore) { alert(errore?.message || t('pagamentoErrore')); }
    costruisciGriglia();
    aggiornaAccesso3D();
  });

  commerce.subscribe(() => {
    acquistato = commerce.has('2d');
    costruisciGriglia();
    aggiornaAccesso3D();
  });

  $("btn-cancella").addEventListener("click", () => {
    if (!confirm(t("confermaCancella"))) return;
    localStorage.removeItem(CHIAVE_STATO);
    costruisciGriglia();
    mostra("benvenuto");
  });

  applicaLingua(linguaIniziale());
  avviaFlusso();
  configuraPagamenti();
})();
