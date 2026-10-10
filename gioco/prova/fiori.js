/* Dati dei 15 fiori in tre lingue (italiano, inglese, spagnolo) e logica del gioco.
 * I significati sono quelli della tradizione del linguaggio dei fiori: un gioco, non una previsione.
 */
(function (root) {
  const FIORI = [
    { id: "rosa-rossa", colore: "#c8102e",
      nome: { it: "Rosa rossa", en: "Red rose", es: "Rosa roja" },
      significato: { it: "Passione", en: "Passion", es: "Pasión" },
      messaggi: {
        mama: { it: "Un sentimento forte e acceso, e ricambiato.", en: "A strong, burning feeling, and returned.", es: "Un sentimiento fuerte y ardiente, y correspondido." },
        nonMama: { it: "Un sentimento forte, ma non ancora ricambiato.", en: "A strong feeling, but not returned yet.", es: "Un sentimiento fuerte, pero aún no correspondido." } } },
    { id: "rosa-gialla", colore: "#f2c41b",
      nome: { it: "Rosa gialla", en: "Yellow rose", es: "Rosa amarilla" },
      significato: { it: "Amicizia", en: "Friendship", es: "Amistad" },
      messaggi: {
        mama: { it: "Un'amicizia luminosa che resiste.", en: "A bright friendship that lasts.", es: "Una amistad luminosa que perdura." },
        nonMama: { it: "Un legame leggero, da coltivare ancora.", en: "A light bond, still to nurture.", es: "Un vínculo ligero, por cultivar." } } },
    { id: "girasole", colore: "#f5a623",
      nome: { it: "Girasole", en: "Sunflower", es: "Girasol" },
      significato: { it: "Adorazione", en: "Devotion", es: "Adoración" },
      messaggi: {
        mama: { it: "Chi ti guarda con calore e fedeltà.", en: "Someone who looks at you with warmth and loyalty.", es: "Alguien que te mira con calidez y lealtad." },
        nonMama: { it: "Calore che non trova ancora ricambio.", en: "Warmth that hasn't been returned yet.", es: "Calidez que aún no encuentra correspondencia." } } },
    { id: "tulipano-rosso", colore: "#d7263d",
      nome: { it: "Tulipano rosso", en: "Red tulip", es: "Tulipán rojo" },
      significato: { it: "Amore vero", en: "True love", es: "Amor verdadero" },
      messaggi: {
        mama: { it: "Una dichiarazione chiara e sincera.", en: "A clear and sincere declaration.", es: "Una declaración clara y sincera." },
        nonMama: { it: "Una dichiarazione che ancora non ha risposta.", en: "A declaration still waiting for an answer.", es: "Una declaración que aún espera respuesta." } } },
    { id: "orchidea", colore: "#b565d8",
      nome: { it: "Orchidea", en: "Orchid", es: "Orquídea" },
      significato: { it: "Bellezza raffinata", en: "Refined beauty", es: "Belleza refinada" },
      messaggi: {
        mama: { it: "Un sentimento delicato e curato.", en: "A delicate, cherished feeling.", es: "Un sentimiento delicado y cuidado." },
        nonMama: { it: "Un sentimento delicato, da proteggere con pazienza.", en: "A delicate feeling, to protect with patience.", es: "Un sentimiento delicado, que hay que proteger con paciencia." } } },
    { id: "lavanda", colore: "#9b7fd1",
      nome: { it: "Lavanda", en: "Lavender", es: "Lavanda" },
      significato: { it: "Devozione", en: "Devotion", es: "Devoción" },
      messaggi: {
        mama: { it: "Calma e fedeltà nel tempo.", en: "Calm and loyalty over time.", es: "Calma y lealtad con el tiempo." },
        nonMama: { it: "Calma, ma la fedeltà va ancora dimostrata.", en: "Calm, but loyalty still has to be shown.", es: "Calma, pero la lealtad aún debe demostrarse." } } },
    { id: "papavero", colore: "#e8452c",
      nome: { it: "Papavero", en: "Poppy", es: "Amapola" },
      significato: { it: "Ricordo", en: "Remembrance", es: "Recuerdo" },
      messaggi: {
        mama: { it: "Qualcuno che non dimenticherai.", en: "Someone you will never forget.", es: "Alguien que no olvidarás." },
        nonMama: { it: "Un ricordo che fa ancora male.", en: "A memory that still hurts.", es: "Un recuerdo que todavía duele." } } },
    { id: "iris", colore: "#3f6fd1",
      nome: { it: "Iris", en: "Iris", es: "Iris" },
      significato: { it: "Fiducia", en: "Trust", es: "Confianza" },
      messaggi: {
        mama: { it: "Un messaggio che arriva da lontano, ed è buono.", en: "A message from afar, and a good one.", es: "Un mensaje que llega de lejos, y es bueno." },
        nonMama: { it: "Un messaggio da lontano, ancora incerto.", en: "A message from afar, still uncertain.", es: "Un mensaje de lejos, todavía incierto." } } },
    { id: "garofano-rosso", colore: "#b3122e",
      nome: { it: "Garofano rosso", en: "Red carnation", es: "Clavel rojo" },
      significato: { it: "Ammirazione", en: "Admiration", es: "Admiración" },
      messaggi: {
        mama: { it: "Un amore profondo e intenso.", en: "A deep and intense love.", es: "Un amor profundo e intenso." },
        nonMama: { it: "Un'ammirazione forte, ma non reciproca.", en: "Strong admiration, but not returned.", es: "Una admiración fuerte, pero no correspondida." } } },
    { id: "viola", colore: "#6b3fa0",
      nome: { it: "Viola del pensiero", en: "Pansy", es: "Pensamiento" },
      significato: { it: "Pensiero", en: "Thoughtfulness", es: "Pensamiento" },
      messaggi: {
        mama: { it: "Qualcuno che pensa a te, ogni giorno.", en: "Someone who thinks of you every day.", es: "Alguien que piensa en ti cada día." },
        nonMama: { it: "Qualcuno pensa a te, ma non lo dice.", en: "Someone thinks of you, but doesn't say so.", es: "Alguien piensa en ti, pero no lo dice." } } },
    { id: "ortensia", colore: "#4a7fd6",
      nome: { it: "Ortensia", en: "Hydrangea", es: "Hortensia" },
      significato: { it: "Gratitudine", en: "Gratitude", es: "Gratitud" },
      messaggi: {
        mama: { it: "Un sentimento sincero e riconoscente.", en: "A sincere and grateful feeling.", es: "Un sentimiento sincero y agradecido." },
        nonMama: { it: "Un sentimento sincero, ma ancora non riconosciuto.", en: "A sincere feeling, not yet recognized.", es: "Un sentimiento sincero, aún no reconocido." } } },
    { id: "peonia", colore: "#d6246e",
      nome: { it: "Peonia", en: "Peony", es: "Peonía" },
      significato: { it: "Romanticismo", en: "Romance", es: "Romanticismo" },
      messaggi: {
        mama: { it: "Un amore appassionato e pieno di speranza.", en: "A passionate love full of hope.", es: "Un amor apasionado y lleno de esperanza." },
        nonMama: { it: "Un amore appassionato, che aspetta ancora.", en: "A passionate love, still waiting.", es: "Un amor apasionado, que aún espera." } } },
    { id: "dalia", colore: "#f0701e",
      nome: { it: "Dalia", en: "Dahlia", es: "Dalia" },
      significato: { it: "Eleganza", en: "Elegance", es: "Elegancia" },
      messaggi: {
        mama: { it: "Un'eleganza che conquista.", en: "An elegance that wins hearts.", es: "Una elegancia que conquista." },
        nonMama: { it: "Un'eleganza che non ha ancora colpito.", en: "An elegance that hasn't struck yet.", es: "Una elegancia que aún no ha impactado." } } },
    { id: "ciliegio", colore: "#f4b6c8",
      nome: { it: "Fiore di ciliegio", en: "Cherry blossom", es: "Flor de cerezo" },
      significato: { it: "Bellezza fugace", en: "Fleeting beauty", es: "Belleza fugaz" },
      messaggi: {
        mama: { it: "Un momento bello, che ti resta.", en: "A beautiful moment that stays with you.", es: "Un momento bello que se queda contigo." },
        nonMama: { it: "Un momento bello che svanisce presto.", en: "A beautiful moment that fades quickly.", es: "Un momento bello que pronto se desvanece." } } },
    { id: "ibisco", colore: "#d6334f",
      nome: { it: "Ibisco", en: "Hibiscus", es: "Hibisco" },
      significato: { it: "Fascino", en: "Charm", es: "Encanto" },
      messaggi: {
        mama: { it: "Un fascino che non passa inosservato.", en: "A charm that doesn't go unnoticed.", es: "Un encanto que no pasa desapercibido." },
        nonMama: { it: "Un fascino che non ha ancora colpito.", en: "A charm that hasn't caught attention yet.", es: "Un encanto que aún no ha llamado la atención." } } },
  ];

  // Testi di ogni fiore: aspetto e storia breve, in italiano, inglese e spagnolo.
  const TESTI = {
    "rosa-rossa": {
      descrizione: { it: "Petali rossi e vellutati, con un profumo intenso e un centro ricco di petali sovrapposti.", en: "Velvety red petals, with an intense scent and a centre of overlapping petals.", es: "Pétalos rojos y aterciopelados, con un aroma intenso y un centro de pétalos superpuestos." },
      storia: { it: "Coltivata da millenni in Asia e in Persia. Nella mitologia greca è legata ad Afrodite, dea dell'amore.", en: "Cultivated for thousands of years in Asia and Persia. In Greek myth it is linked to Aphrodite, goddess of love.", es: "Cultivada desde hace milenios en Asia y Persia. En la mitología griega está ligada a Afrodita, diosa del amor." } },
    "rosa-gialla": {
      descrizione: { it: "Petali gialli, brillanti e profumati, che si aprono lentamente.", en: "Bright, fragrant yellow petals that open slowly.", es: "Pétalos amarillos, brillantes y fragantes, que se abren despacio." },
      storia: { it: "Nell'epoca vittoriana la rosa gialla era il simbolo della gelosia. Oggi è legata all'amicizia.", en: "In Victorian times the yellow rose stood for jealousy. Today it is linked to friendship.", es: "En la época victoriana la rosa amarilla simbolizaba los celos. Hoy se asocia con la amistad." } },
    "girasole": {
      descrizione: { it: "Grandi petali gialli intorno a un centro bruno, dove stanno i semi.", en: "Large yellow petals around a brown centre, where the seeds grow.", es: "Grandes pétalos amarillos alrededor de un centro marrón, donde crecen las semillas." },
      storia: { it: "Originario del Nord America, era coltivato dai popoli nativi da migliaia di anni. Le piante giovani seguono il sole durante il giorno.", en: "Native to North America, it was grown by Indigenous peoples for thousands of years. Young plants follow the sun during the day.", es: "Originario de Norteamérica, lo cultivaban los pueblos originarios desde hace miles de años. Las plantas jóvenes siguen al sol durante el día." } },
    "tulipano-rosso": {
      descrizione: { it: "Petali rossi a coppa, lisci e lucidi, su un unico stelo.", en: "Red cup-shaped petals, smooth and shiny, on a single stem.", es: "Pétalos rojos en forma de copa, lisos y brillantes, sobre un único tallo." },
      storia: { it: "Originario dell'Asia centrale, nel Seicento in Olanda scoppiò la «tulipanomania», una delle prime bolle speculative della storia.", en: "Native to Central Asia, in the 1600s the Netherlands saw «tulip mania», one of the first speculative bubbles in history.", es: "Originario de Asia central, en el siglo XVII los Países Bajos vivieron la «tulipanomanía», una de las primeras burbujas especulativas de la historia." } },
    "orchidea": {
      descrizione: { it: "Fiore delicato, di solito rosa o viola, con tre petali e una labbella più scura al centro.", en: "A delicate flower, usually pink or purple, with three petals and a darker lip at the centre.", es: "Flor delicada, por lo general rosa o morada, con tres pétalos y un labelo más oscuro en el centro." },
      storia: { it: "È una delle famiglie di piante più numerose al mondo, con migliaia di specie che crescono quasi su tutti i continenti.", en: "It is one of the largest plant families in the world, with thousands of species growing on almost every continent.", es: "Es una de las familias de plantas más numerosas del mundo, con miles de especies que crecen en casi todos los continentes." } },
    "lavanda": {
      descrizione: { it: "Fiori piccoli, lilla o viola, raccolti in spighe profumate.", en: "Small lilac or purple flowers, gathered in fragrant spikes.", es: "Flores pequeñas, lilas o moradas, reunidas en espigas aromáticas." },
      storia: { it: "Il nome deriva dal latino «lavare», lavare: i Romani la usavano per profumare l'acqua dei bagni.", en: "The name comes from the Latin «lavare», to wash: the Romans used it to scent their baths.", es: "El nombre viene del latín «lavare», lavar: los romanos la usaban para perfumar los baños." } },
    "papavero": {
      descrizione: { it: "Petali rossi, sottili e fragili, con una macchia scura alla base.", en: "Thin, delicate red petals with a dark spot at the base.", es: "Pétalos rojos, finos y frágiles, con una mancha oscura en la base." },
      storia: { it: "Dopo la Prima guerra mondiale, nelle Fiandre, il papavero è diventato il simbolo del ricordo dei caduti.", en: "After the First World War, in Flanders, the poppy became the symbol of remembrance for the fallen.", es: "Tras la Primera Guerra Mundial, en Flandes, la amapola se convirtió en símbolo del recuerdo de los caídos." } },
    "iris": {
      descrizione: { it: "Petali viola-blu, con una striscia gialla al centro.", en: "Blue-violet petals with a yellow stripe at the centre.", es: "Pétalos azul-violeta, con una franja amarilla en el centro." },
      storia: { it: "Il nome viene dalla dea greca Iris, messaggera degli dèi. In greco la parola significa anche «arcobaleno». Il giglio stilizzato della tradizione francese deriva dall'iris.", en: "Its name comes from Iris, the Greek goddess and messenger of the gods. In Greek the word also means «rainbow». The stylised fleur-de-lis of French tradition derives from the iris.", es: "Su nombre viene de Iris, la diosa griega mensajera de los dioses. En griego la palabra significa también «arcoíris». La flor de lis estilizada de la tradición francesa deriva del iris." } },
    "garofano-rosso": {
      descrizione: { it: "Petali rossi con il bordo frastagliato, come un merletto.", en: "Red petals with a fringed edge, like lace.", es: "Pétalos rojos con el borde recortado, como un encaje." },
      storia: { it: "Il nome deriva dal greco «dios anthos», fiore di Zeus. È tra i fiori coltivati in Europa da più tempo.", en: "The name comes from the Greek «dios anthos», flower of Zeus. It is one of the flowers cultivated in Europe for the longest time.", es: "El nombre viene del griego «dios anthos», flor de Zeus. Es una de las flores cultivadas en Europa desde hace más tiempo." } },
    "viola": {
      descrizione: { it: "Petali viola, gialli e bianchi, con un «volto» caratteristico al centro.", en: "Purple, yellow and white petals with a characteristic «face» at the centre.", es: "Pétalos morados, amarillos y blancos, con una «carita» característica en el centro." },
      storia: { it: "Il nome deriva dal francese «pensée», pensiero. Nel Medioevo era considerata un fiore dei ricordi.", en: "The name comes from the French «pensée», thought. In the Middle Ages it was considered a flower of remembrance.", es: "El nombre viene del francés «pensée», pensamiento. En la Edad Media se consideraba una flor de los recuerdos." } },
    "ortensia": {
      descrizione: { it: "Grandi infiorescenze a palla, blu, azzurre o rosa: il colore dipende dal terreno.", en: "Large round clusters, blue, light blue or pink: the colour depends on the soil.", es: "Grandes racimos redondos, azules, celestes o rosas: el color depende del suelo." },
      storia: { it: "Il nome viene dal greco «hydor» (acqua) e «angeion» (vaso). Un terreno acido la rende blu.", en: "The name comes from the Greek «hydor» (water) and «angeion» (vessel). Acidic soil turns it blue.", es: "El nombre viene del griego «hydor» (agua) y «angeion» (vaso). Un suelo ácido la vuelve azul." } },
    "peonia": {
      descrizione: { it: "Grandi fiori fucsia, con molti petali morbidi e sovrapposti.", en: "Large fuchsia flowers with many soft, overlapping petals.", es: "Grandes flores fucsia, con muchos pétalos suaves y superpuestos." },
      storia: { it: "In Cina è chiamata «re dei fiori» e viene coltivata da più di mille anni.", en: "In China it is called the «king of flowers» and has been cultivated for over a thousand years.", es: "En China se la llama «la reina de las flores» y se cultiva desde hace más de mil años." } },
    "dalia": {
      descrizione: { it: "Fiori arancioni, con petali disposti a rosetta, come un piccolo sole.", en: "Orange flowers with petals arranged like a rosette, like a small sun.", es: "Flores naranjas, con pétalos dispuestos en roseta, como un pequeño sol." },
      storia: { it: "Originaria del Messico, prende il nome dal botanico svedese Anders Dahl.", en: "Native to Mexico, it is named after the Swedish botanist Anders Dahl.", es: "Originaria de México, lleva el nombre del botánico sueco Anders Dahl." } },
    "ciliegio": {
      descrizione: { it: "Fiori rosa chiaro a cinque petali, che sbocciano in primavera e cadono in pochi giorni.", en: "Pale pink five-petalled flowers that bloom in spring and fall within a few days.", es: "Flores rosa pálido de cinco pétalos, que florecen en primavera y caen en pocos días." },
      storia: { it: "In Giappone l'hanami è la festa per ammirare la fioritura: un momento breve e molto amato.", en: "In Japan, hanami is the festival to admire the blossoms: a brief moment, deeply loved.", es: "En Japón, el hanami es la fiesta para admirar la floración: un momento breve y muy querido." } },
    "ibisco": {
      descrizione: { it: "Grandi fiori rosso-fucsia, con un lungo stelo centrale ricco di pollini.", en: "Large red-fuchsia flowers with a long central stem full of pollen.", es: "Grandes flores rojo-fucsia, con un largo tallo central lleno de polen." },
      storia: { it: "È il fiore nazionale della Malesia. Dai suoi petali si prepara anche una bevanda, il karkadè.", en: "It is the national flower of Malaysia. Its petals are also used to make a drink, karkadè.", es: "Es la flor nacional de Malasia. Sus pétalos también sirven para preparar una bebida, el karkadé." } },
  };

  FIORI.forEach((f) => Object.assign(f, TESTI[f.id]));

  // Ogni fiore ha la sua foto in www/img/<id>.jpg (non piu' usata: i petali sono in img/<id>-petalo.png)
  FIORI.forEach((f) => {
    f.immagine = "img/" + f.id + "-petalo.png";
  });

  // Numero di petali casuale tra 9 e 21.
  function petaliCasuali() {
    return Math.floor(Math.random() * 13) + 9;
  }

  // Dispari: il primo petalo e l'ultimo dicono "m'ama" -> risultato "m'ama".
  function risultato(numeroPetali) {
    return numeroPetali % 2 === 1 ? "M'ama" : "Non m'ama";
  }

  // Etichetta del petalo n (1 = primo): alterna "m'ama" e "non m'ama".
  function etichettaPetalo(n) {
    return n % 2 === 1 ? "M'ama" : "Non m'ama";
  }

  // Sceglie il numero di petali (9-21, diverso da "ultimo") in modo che l'ultimo
  // petalo dia proprio il risultato voluto, partendo da primoMAma.
  function numeroPerRisultato(primoMAma, risultatoVoluto, ultimo) {
    const servoDispari = (risultatoVoluto === "M'ama") === primoMAma;
    let n = petaliCasuali();
    while (n === ultimo) n = petaliCasuali();
    if ((n % 2 === 1) !== servoDispari) n = n < 21 ? n + 1 : n - 1;
    if (n === ultimo) n = n + 2 <= 21 ? n + 2 : n - 2;
    return n;
  }

  const api = { FIORI, petaliCasuali, risultato, etichettaPetalo, numeroPerRisultato };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.Fiori = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
