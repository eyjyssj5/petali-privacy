(function(root){
 const data={
  "rosa-rossa": [
    "Rose rouge",
    "Passion",
    "Un sentiment intense et ardent, partagé.",
    "Un sentiment fort, mais pas encore partagé.",
    "Des pétales rouges et veloutés, un parfum intense et un cœur riche en pétales superposés.",
    "Cultivée depuis des millénaires en Asie et en Perse, elle est associée à Aphrodite, déesse de l'amour dans la mythologie grecque."
  ],
  "rosa-gialla": [
    "Rose jaune",
    "Amitié",
    "Une amitié lumineuse qui dure.",
    "Un lien léger qui demande encore à grandir.",
    "Des pétales jaunes, lumineux et parfumés, qui s'ouvrent lentement.",
    "À l'époque victorienne, la rose jaune représentait la jalousie. Aujourd'hui, elle évoque l'amitié."
  ],
  "girasole": [
    "Tournesol",
    "Adoration",
    "Quelqu'un te regarde avec chaleur et fidélité.",
    "Une affection qui n'est pas encore partagée.",
    "De grands pétales jaunes entourent un centre brun, où se forment les graines.",
    "Originaire d'Amérique du Nord, il est cultivé depuis des milliers d'années par les peuples autochtones. Les jeunes plants suivent la course du soleil."
  ],
  "tulipano-rosso": [
    "Tulipe rouge",
    "Amour véritable",
    "Une déclaration claire et sincère.",
    "Une déclaration qui attend encore sa réponse.",
    "Des pétales rouges en forme de coupe, lisses et brillants, portés par une seule tige.",
    "Originaire d'Asie centrale, la tulipe a provoqué la «tulipomanie» aux Pays-Bas au XVIIe siècle, une célèbre bulle spéculative."
  ],
  "orchidea": [
    "Orchidée",
    "Beauté raffinée",
    "Un sentiment délicat et précieux.",
    "Un sentiment délicat à protéger avec patience.",
    "Une fleur délicate, souvent rose ou violette, avec un labelle plus foncé au centre.",
    "Les orchidées forment l'une des plus grandes familles de plantes au monde, avec des milliers d'espèces sur presque tous les continents."
  ],
  "lavanda": [
    "Lavande",
    "Dévouement",
    "Du calme et de la fidélité au fil du temps.",
    "Le calme est là, mais la fidélité reste à prouver.",
    "De petites fleurs lilas ou violettes regroupées en épis parfumés.",
    "Son nom vient du latin «lavare», laver : les Romains l'utilisaient pour parfumer l'eau des bains."
  ],
  "papavero": [
    "Coquelicot",
    "Souvenir",
    "Quelqu'un que tu n'oublieras jamais.",
    "Un souvenir qui fait encore mal.",
    "De fins pétales rouges et fragiles, marqués de sombre à la base.",
    "Après la Première Guerre mondiale, le coquelicot est devenu en Flandre un symbole du souvenir des soldats disparus."
  ],
  "iris": [
    "Iris",
    "Confiance",
    "Un bon message arrive de loin.",
    "Un message venu de loin, encore incertain.",
    "Des pétales bleu-violet avec une bande jaune au centre.",
    "Son nom vient d'Iris, messagère des dieux grecs. En grec, ce mot signifie aussi «arc-en-ciel»."
  ],
  "garofano-rosso": [
    "Œillet rouge",
    "Admiration",
    "Un amour profond et intense.",
    "Une grande admiration qui n'est pas réciproque.",
    "Des pétales rouges aux bords frangés, semblables à de la dentelle.",
    "Son nom botanique évoque en grec la «fleur de Zeus». C'est l'une des fleurs cultivées depuis le plus longtemps en Europe."
  ],
  "viola": [
    "Pensée",
    "Pensée affectueuse",
    "Quelqu'un pense à toi chaque jour.",
    "Quelqu'un pense à toi, sans oser le dire.",
    "Des pétales violets, jaunes et blancs, avec un visage caractéristique au centre.",
    "Son nom évoque la pensée. Au Moyen Âge, cette fleur était associée aux souvenirs."
  ],
  "ortensia": [
    "Hortensia",
    "Gratitude",
    "Un sentiment sincère et reconnaissant.",
    "Un sentiment sincère qui n'est pas encore reconnu.",
    "De grosses inflorescences rondes, bleues ou roses, dont la couleur peut dépendre du sol.",
    "Le nom Hydrangea vient des mots grecs pour «eau» et «récipient». Un sol acide favorise le bleu chez certaines variétés."
  ],
  "peonia": [
    "Pivoine",
    "Romantisme",
    "Un amour passionné et plein d'espoir.",
    "Un amour passionné qui attend encore.",
    "De grandes fleurs roses aux nombreux pétales souples et superposés.",
    "En Chine, elle est surnommée la «reine des fleurs» et elle est cultivée depuis plus de mille ans."
  ],
  "dalia": [
    "Dahlia",
    "Élégance",
    "Une élégance qui séduit.",
    "Une élégance qui n'a pas encore touché le cœur.",
    "Une fleur aux nombreux pétales disposés en rosette autour du centre.",
    "Originaire du Mexique, elle porte le nom du botaniste suédois Anders Dahl."
  ],
  "ciliegio": [
    "Fleur de cerisier",
    "Beauté éphémère",
    "Un beau moment qui restera gravé.",
    "Un beau moment qui s'efface trop vite.",
    "Des fleurs rose pâle, généralement à cinq pétales, qui s'épanouissent au printemps.",
    "Au Japon, le hanami est la tradition consistant à admirer les fleurs de cerisier et leur beauté éphémère."
  ],
  "ibisco": [
    "Hibiscus",
    "Charme",
    "Un charme qui ne passe pas inaperçu.",
    "Un charme qui n'a pas encore attiré l'attention.",
    "De grandes fleurs rouges avec une longue colonne centrale d'étamines.",
    "C'est la fleur nationale de la Malaisie. Certaines espèces servent aussi à préparer des infusions comme le karkadé."
  ]
};
 const extra=root.PetaliLingueExtra;
 if(!extra) throw new Error("Load lingue-extra.js first");
 for(const [id,a] of Object.entries(data)){
  const t=extra.FIORI_EXTRA[id]||(extra.FIORI_EXTRA[id]={nome:{},significato:{},descrizione:{},storia:{},messaggi:{mama:{},nonMama:{}}});
  t.nome.fr=a[0];t.significato.fr=a[1];t.messaggi.mama.fr=a[2];t.messaggi.nonMama.fr=a[3];t.descrizione.fr=a[4];t.storia.fr=a[5];
 }
 extra.applica();
})(typeof window!=="undefined"?window:globalThis);
