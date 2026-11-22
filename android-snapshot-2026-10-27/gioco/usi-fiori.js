/* PETALI: significato pratico e occasioni consigliate per tutte le 15 specie.
 * Le associazioni appartengono alla tradizione simbolica dei fiori, non sono indicazioni terapeutiche.
 */
(function(root) {
  "use strict";
  const labels = {
  "it": "Quando regalarlo",
  "en": "When to give it",
  "es": "Cuándo regalarla",
  "pt": "Quando oferecer",
  "fr": "Quand l'offrir",
  "de": "Wann verschenken"
};
  const flowers = {
  "rosa-rossa": {
    "it": "Per dichiarare amore e passione; perfetta per San Valentino, anniversari e momenti romantici.",
    "en": "To express love and passion; perfect for Valentine's Day, anniversaries and romantic moments.",
    "es": "Para expresar amor y pasión; ideal para San Valentín, aniversarios y momentos románticos.",
    "pt": "Para expressar amor e paixão; ideal para o Dia dos Namorados, aniversários de casal e momentos românticos.",
    "fr": "Pour exprimer l'amour et la passion ; idéale pour la Saint-Valentin, les anniversaires de couple et les moments romantiques.",
    "de": "Für Liebe und Leidenschaft; ideal zum Valentinstag, zum Jahrestag und für romantische Momente."
  },
  "rosa-gialla": {
    "it": "Per celebrare un'amicizia, ringraziare o fare una sorpresa allegra, senza un messaggio romantico.",
    "en": "To celebrate friendship, say thank you or send a cheerful surprise without a romantic message.",
    "es": "Para celebrar una amistad, dar las gracias o sorprender con alegría, sin un mensaje romántico.",
    "pt": "Para celebrar uma amizade, agradecer ou fazer uma surpresa alegre, sem uma mensagem romântica.",
    "fr": "Pour célébrer une amitié, remercier ou faire une surprise joyeuse sans message romantique.",
    "de": "Um Freundschaft zu feiern, Danke zu sagen oder jemanden ohne romantische Absicht aufzuheitern."
  },
  "girasole": {
    "it": "Per trasmettere allegria, ottimismo e incoraggiamento; adatto a compleanni, lauree e auguri di guarigione.",
    "en": "To bring joy, optimism and encouragement; great for birthdays, graduations and get-well wishes.",
    "es": "Para transmitir alegría, optimismo y ánimo; ideal para cumpleaños, graduaciones y deseos de recuperación.",
    "pt": "Para transmitir alegria, otimismo e encorajamento; ideal para aniversários, formaturas e votos de melhoras.",
    "fr": "Pour transmettre joie, optimisme et encouragement ; parfait pour un anniversaire, un diplôme ou un prompt rétablissement.",
    "de": "Für Freude, Optimismus und Ermutigung; passend zu Geburtstagen, Abschlüssen und Genesungswünschen."
  },
  "tulipano-rosso": {
    "it": "Per una dichiarazione d'amore sincera; indicato per San Valentino, anniversari e gesti romantici.",
    "en": "For a sincere declaration of love; suited to Valentine's Day, anniversaries and romantic gestures.",
    "es": "Para una declaración de amor sincera; apropiado para San Valentín, aniversarios y gestos románticos.",
    "pt": "Para uma declaração de amor sincera; indicado para o Dia dos Namorados, aniversários de casal e gestos românticos.",
    "fr": "Pour une déclaration d'amour sincère ; adapté à la Saint-Valentin, aux anniversaires de couple et aux gestes romantiques.",
    "de": "Für eine aufrichtige Liebeserklärung; passend zum Valentinstag, zu Jahrestagen und romantischen Gesten."
  },
  "orchidea": {
    "it": "Per esprimere ammirazione ed eleganza; indicata per un matrimonio, una laurea o un regalo raffinato.",
    "en": "To express admiration and elegance; ideal for weddings, graduations or a refined gift.",
    "es": "Para expresar admiración y elegancia; ideal para bodas, graduaciones o un regalo distinguido.",
    "pt": "Para expressar admiração e elegância; ideal para casamentos, formaturas ou um presente sofisticado.",
    "fr": "Pour exprimer admiration et élégance ; idéale pour un mariage, un diplôme ou un cadeau raffiné.",
    "de": "Für Bewunderung und Eleganz; passend zu Hochzeiten, Abschlüssen oder als besonderes Geschenk."
  },
  "lavanda": {
    "it": "Per augurare serenità, pace e conforto; adatta a un periodo difficile, alla convalescenza o a un pensiero delicato.",
    "en": "To wish someone calm, peace and comfort; suitable during difficult times, recovery or as a gentle gesture.",
    "es": "Para desear serenidad, paz y consuelo; apropiada en momentos difíciles, durante la recuperación o como detalle delicado.",
    "pt": "Para desejar serenidade, paz e conforto; adequada para momentos difíceis, recuperação ou um gesto carinhoso.",
    "fr": "Pour souhaiter sérénité, paix et réconfort ; adaptée aux périodes difficiles, à la convalescence ou à une pensée délicate.",
    "de": "Für Ruhe, Frieden und Trost; passend in schweren Zeiten, während der Genesung oder als liebevolle Aufmerksamkeit."
  },
  "papavero": {
    "it": "Per ricordare una persona o un momento speciale; appropriato per omaggi e ricorrenze commemorative.",
    "en": "To remember a person or a special moment; appropriate for tributes and commemorations.",
    "es": "Para recordar a una persona o un momento especial; adecuado para homenajes y conmemoraciones.",
    "pt": "Para recordar uma pessoa ou um momento especial; adequado para homenagens e datas de memória.",
    "fr": "Pour évoquer le souvenir d'une personne ou d'un moment précieux ; adapté aux hommages et commémorations.",
    "de": "Um an einen Menschen oder besonderen Moment zu erinnern; geeignet für Gedenktage und Ehrungen."
  },
  "iris": {
    "it": "Per comunicare fiducia, speranza e nuovi inizi; indicato per lauree, incoraggiamento e ringraziamenti.",
    "en": "To convey trust, hope and new beginnings; good for graduations, encouragement and thanks.",
    "es": "Para transmitir confianza, esperanza y nuevos comienzos; ideal para graduaciones, ánimos y agradecimientos.",
    "pt": "Para transmitir confiança, esperança e novos começos; ideal para formaturas, incentivo e agradecimentos.",
    "fr": "Pour transmettre confiance, espoir et nouveaux départs ; idéal pour un diplôme, un encouragement ou un merci.",
    "de": "Für Vertrauen, Hoffnung und Neuanfänge; passend zu Abschlüssen, Ermutigung und Dank."
  },
  "garofano-rosso": {
    "it": "Per mostrare ammirazione, affetto e riconoscenza; adatto per ringraziare una persona speciale.",
    "en": "To show admiration, affection and gratitude; suitable for thanking someone special.",
    "es": "Para mostrar admiración, cariño y gratitud; adecuado para agradecer a alguien especial.",
    "pt": "Para mostrar admiração, carinho e gratidão; adequado para agradecer a alguém especial.",
    "fr": "Pour montrer admiration, affection et reconnaissance ; adapté pour remercier une personne spéciale.",
    "de": "Für Bewunderung, Zuneigung und Dankbarkeit; passend, um einem besonderen Menschen zu danken."
  },
  "viola": {
    "it": "Per dire «ti penso» con discrezione; adatta all'amicizia, alle scuse e ai piccoli gesti affettuosi.",
    "en": "To say 'I'm thinking of you' gently; suitable for friendship, apologies and thoughtful gestures.",
    "es": "Para decir «pienso en ti» con delicadeza; apropiada para la amistad, las disculpas y los gestos cariñosos.",
    "pt": "Para dizer «penso em ti» com delicadeza; adequada à amizade, a pedidos de desculpa e a gestos carinhosos.",
    "fr": "Pour dire «je pense à toi» avec douceur ; adaptée à l'amitié, aux excuses et aux petites attentions.",
    "de": "Um behutsam zu sagen «Ich denke an dich»; passend für Freundschaft, Entschuldigungen und liebe Gesten."
  },
  "ortensia": {
    "it": "Per esprimere gratitudine sincera o chiedere scusa; indicata per ringraziamenti e riconciliazioni.",
    "en": "To express sincere gratitude or apologise; good for thank-you gestures and making up.",
    "es": "Para expresar gratitud sincera o pedir perdón; ideal para agradecimientos y reconciliaciones.",
    "pt": "Para expressar gratidão sincera ou pedir desculpa; ideal para agradecimentos e reconciliações.",
    "fr": "Pour exprimer une sincère gratitude ou présenter ses excuses ; idéale pour remercier et se réconcilier.",
    "de": "Für aufrichtige Dankbarkeit oder eine Entschuldigung; passend zum Danken und Versöhnen."
  },
  "peonia": {
    "it": "Per augurare amore, felicità e prosperità; ideale per matrimoni, anniversari e Festa della mamma.",
    "en": "To wish love, happiness and good fortune; ideal for weddings, anniversaries and Mother's Day.",
    "es": "Para desear amor, felicidad y prosperidad; ideal para bodas, aniversarios y el Día de la Madre.",
    "pt": "Para desejar amor, felicidade e prosperidade; ideal para casamentos, aniversários de casal e Dia da Mãe.",
    "fr": "Pour souhaiter amour, bonheur et prospérité ; idéale pour un mariage, un anniversaire de couple ou la fête des Mères.",
    "de": "Für Liebe, Glück und Wohlstand; ideal zu Hochzeiten, Jahrestagen und zum Muttertag."
  },
  "dalia": {
    "it": "Per celebrare eleganza, forza e un risultato importante; adatta a compleanni, promozioni e congratulazioni.",
    "en": "To celebrate elegance, strength and an achievement; suitable for birthdays, promotions and congratulations.",
    "es": "Para celebrar elegancia, fortaleza y un logro importante; ideal para cumpleaños, ascensos y felicitaciones.",
    "pt": "Para celebrar elegância, força e uma conquista; adequada para aniversários, promoções e felicitações.",
    "fr": "Pour célébrer élégance, force et réussite ; adaptée aux anniversaires, promotions et félicitations.",
    "de": "Für Eleganz, Stärke und Erfolge; passend zu Geburtstagen, Beförderungen und Glückwünschen."
  },
  "ciliegio": {
    "it": "Per celebrare nuovi inizi e momenti preziosi; indicato per una nascita, un cambiamento o un augurio delicato.",
    "en": "To celebrate fresh starts and precious moments; suited to a birth, a life change or a gentle wish.",
    "es": "Para celebrar nuevos comienzos y momentos valiosos; ideal para un nacimiento, un cambio o un deseo delicado.",
    "pt": "Para celebrar novos começos e momentos preciosos; indicado para um nascimento, uma mudança ou um desejo delicado.",
    "fr": "Pour célébrer les nouveaux départs et les instants précieux ; adapté à une naissance, un changement ou un vœu délicat.",
    "de": "Für Neuanfänge und kostbare Augenblicke; passend zu einer Geburt, Veränderung oder einem liebevollen Wunsch."
  },
  "ibisco": {
    "it": "Per esprimere fascino, gioia e ammirazione; adatto a compleanni, feste e sorprese vivaci.",
    "en": "To express charm, joy and admiration; great for birthdays, celebrations and colourful surprises.",
    "es": "Para expresar encanto, alegría y admiración; ideal para cumpleaños, fiestas y sorpresas alegres.",
    "pt": "Para expressar encanto, alegria e admiração; ideal para aniversários, festas e surpresas vibrantes.",
    "fr": "Pour exprimer charme, joie et admiration ; parfait pour les anniversaires, les fêtes et les surprises ensoleillées.",
    "de": "Für Charme, Freude und Bewunderung; passend zu Geburtstagen, Feiern und fröhlichen Überraschungen."
  }
};
  const aliases = {"tulipano":"tulipano-rosso","garofano":"garofano-rosso"};
  function get(id, lang) {
    const row = flowers[aliases[id] || id];
    return row ? row[lang] || row.it : "";
  }
  function label(lang) { return labels[lang] || labels.it; }
  const api = Object.freeze({flowers, labels, get, label});
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.PetaliUsiFiori = api;
})(typeof window !== "undefined" ? window : globalThis);
