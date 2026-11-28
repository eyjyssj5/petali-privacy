/* PETALI: suggerimenti per regali digitali, indipendenti dagli acquisti. */
(function (root) {
  "use strict";
  const occasions = [
    { id: "anniversario", flowers: ["rosa-rossa", "peonia", "tulipano-rosso"] },
    { id: "compleanno", flowers: ["girasole", "dalia", "orchidea"] },
    { id: "san-valentino", flowers: ["rosa-rossa", "tulipano-rosso", "peonia"] },
    { id: "matrimonio", flowers: ["peonia", "orchidea", "rosa-rossa"] },
    { id: "amicizia", flowers: ["rosa-gialla", "girasole", "viola"] },
    { id: "grazie", flowers: ["ortensia", "rosa-gialla", "iris"] },
    { id: "scuse", flowers: ["viola", "ortensia", "rosa-gialla"] },
    { id: "laurea", flowers: ["girasole", "iris", "orchidea"] },
    { id: "nascita", flowers: ["ciliegio", "peonia", "viola"] },
    { id: "festa-mamma", flowers: ["peonia", "rosa-gialla", "ortensia"] },
    { id: "guarigione", flowers: ["girasole", "lavanda", "iris"] },
    { id: "ricordo", flowers: ["papavero", "iris", "lavanda"] },
    { id: "sorpresa", flowers: ["rosa-gialla", "girasole", "dalia"] }
  ];
  const free2d = ["rosa-rossa", "rosa-gialla", "girasole"];
  const labels = {
    it: ["Anniversario", "Compleanno", "San Valentino", "Matrimonio", "Amicizia", "Grazie", "Chiedere scusa", "Laurea", "Nascita", "Festa della mamma", "Guarigione", "Un ricordo speciale", "Una sorpresa"],
    en: ["Anniversary", "Birthday", "Valentine's Day", "Wedding", "Friendship", "Thank you", "Say sorry", "Graduation", "New baby", "Mother's Day", "Get well soon", "In remembrance", "Just because"],
    es: ["Aniversario", "Cumpleaños", "San Valentín", "Boda", "Amistad", "Gracias", "Pedir perdón", "Graduación", "Nacimiento", "Día de la Madre", "Que te mejores", "Un recuerdo especial", "Una sorpresa"],
    pt: ["Aniversário", "Aniversário de nascimento", "Dia dos Namorados", "Casamento", "Amizade", "Obrigado", "Pedir desculpa", "Formatura", "Nascimento", "Dia da Mãe", "Melhoras", "Uma recordação especial", "Uma surpresa"],
    fr: ["Anniversaire de couple", "Anniversaire", "Saint-Valentin", "Mariage", "Amitié", "Merci", "Présenter ses excuses", "Diplôme", "Naissance", "Fête des Mères", "Bon rétablissement", "Un souvenir précieux", "Une surprise"],
    de: ["Jahrestag", "Geburtstag", "Valentinstag", "Hochzeit", "Freundschaft", "Danke", "Entschuldigung", "Abschluss", "Geburt", "Muttertag", "Gute Besserung", "In Erinnerung", "Eine Überraschung"]
  };
  const phrases = {
    it: ["Ogni giorno con te è un regalo. Buon anniversario!", "Tanti auguri! Che questa giornata sia piena di luce.", "Per te, con tutto il mio amore.", "Vi auguro una vita piena di gioia e amore.", "La tua amicizia rende tutto più bello.", "Grazie di cuore per esserci.", "Mi dispiace. Spero che questo fiore porti un sorriso.", "Complimenti per il tuo traguardo! Il meglio deve ancora arrivare.", "Benvenuta nuova vita! Auguri di cuore.", "Un fiore per dirti quanto sei speciale. Ti voglio bene!", "Ti auguro giorni sereni e una pronta guarigione.", "Un fiore per ricordare con affetto.", "Un pensiero per farti sorridere, senza un motivo speciale."],
    en: ["Every day with you is a gift. Happy anniversary!", "Happy birthday! Wishing you a bright and beautiful day.", "For you, with all my love.", "Wishing you a lifetime of love and joy.", "Your friendship makes life brighter.", "Thank you from the bottom of my heart.", "I'm sorry. I hope this flower brings a smile.", "Congratulations on your achievement! The best is yet to come.", "Welcome, little one! Sending warm wishes.", "A flower to show you how special you are. Love you!", "Wishing you peace and a speedy recovery.", "A flower to remember with love.", "A little flower just to make you smile."],
    es: ["Cada día contigo es un regalo. ¡Feliz aniversario!", "¡Feliz cumpleaños! Que tengas un día lleno de alegría.", "Para ti, con todo mi amor.", "Os deseo una vida llena de alegría y amor.", "Tu amistad hace la vida más bonita.", "Gracias de todo corazón por estar ahí.", "Lo siento. Espero que esta flor te haga sonreír.", "¡Enhorabuena por tu logro! Lo mejor está por venir.", "¡Bienvenida, nueva vida! Mis mejores deseos.", "Una flor para decirte lo especial que eres. ¡Te quiero!", "Te deseo tranquilidad y una pronta recuperación.", "Una flor para recordar con cariño.", "Un detalle para hacerte sonreír, sin motivo especial."],
    pt: ["Cada dia contigo é uma dádiva. Feliz aniversário!", "Feliz aniversário! Que o teu dia seja cheio de alegria.", "Para ti, com todo o meu amor.", "Desejo-vos uma vida de amor e alegria.", "A tua amizade ilumina a minha vida.", "Obrigado de coração por estares presente.", "Desculpa. Espero que esta flor te faça sorrir.", "Parabéns pela conquista! O melhor ainda está para vir.", "Bem-vinda, nova vida! Muitas felicidades.", "Uma flor para te dizer como és especial.", "Desejo-te serenidade e rápidas melhoras.", "Uma flor para recordar com carinho.", "Uma flor para te fazer sorrir."],
    fr: ["Chaque jour avec toi est un cadeau. Joyeux anniversaire de couple !", "Joyeux anniversaire ! Que ta journée soit lumineuse.", "Pour toi, avec tout mon amour.", "Je vous souhaite une vie de bonheur et d'amour.", "Ton amitié rend la vie plus belle.", "Merci du fond du cœur d'être là.", "Je suis désolé. J'espère que cette fleur te fera sourire.", "Félicitations pour cette réussite !", "Bienvenue à ce nouveau-né ! Tous mes vœux.", "Une fleur pour te dire combien tu es précieuse.", "Je te souhaite un prompt rétablissement.", "Une fleur pour se souvenir avec tendresse.", "Juste une petite fleur pour te faire sourire."],
    de: ["Jeder Tag mit dir ist ein Geschenk. Alles Gute zum Jahrestag!", "Herzlichen Glückwunsch zum Geburtstag!", "Für dich, mit all meiner Liebe.", "Ich wünsche euch ein Leben voller Liebe und Freude.", "Deine Freundschaft macht das Leben schöner.", "Danke von ganzem Herzen.", "Es tut mir leid. Ich hoffe, diese Blume zaubert dir ein Lächeln.", "Herzlichen Glückwunsch zu deinem Erfolg!", "Herzlich willkommen, kleines Wunder!", "Eine Blume, weil du so besonders bist.", "Ich wünsche dir gute und schnelle Besserung.", "Eine Blume in liebevoller Erinnerung.", "Eine kleine Überraschung, einfach so."]
  };
  for(const [lang,p] of Object.entries(root.PetaliExtendedLocales||{})){labels[lang]=p.occasionNames;phrases[lang]=p.occasionMessages}
  const data = occasions.map((item, index) => ({
    id: item.id, flowers: item.flowers,
    name: Object.fromEntries(Object.keys(labels).map(lang => [lang, labels[lang][index]])),
    message: Object.fromEntries(Object.keys(phrases).map(lang => [lang, phrases[lang][index]]))
  }));
  const output = Object.freeze({ occasions: data, free2d });
  if (typeof module !== "undefined" && module.exports) module.exports = output;
  root.PetaliRegaliCatalogo = output;
})(typeof window !== "undefined" ? window : globalThis);
