(function(root){
 const data={
  "rosa-rossa": [
    "Rote Rose",
    "Leidenschaft",
    "Ein starkes, leidenschaftliches Gefühl, das erwidert wird.",
    "Ein starkes Gefühl, das noch nicht erwidert wird.",
    "Samtig rote Blütenblätter, ein intensiver Duft und dicht übereinanderliegende Blütenblätter in der Mitte.",
    "Seit Jahrtausenden in Asien und Persien kultiviert. In der griechischen Mythologie ist sie mit Aphrodite, der Göttin der Liebe, verbunden."
  ],
  "rosa-gialla": [
    "Gelbe Rose",
    "Freundschaft",
    "Eine strahlende Freundschaft, die Bestand hat.",
    "Eine zarte Verbindung, die noch wachsen muss.",
    "Leuchtend gelbe, duftende Blütenblätter, die sich langsam öffnen.",
    "Im viktorianischen Zeitalter stand die gelbe Rose für Eifersucht. Heute ist sie ein Symbol der Freundschaft."
  ],
  "girasole": [
    "Sonnenblume",
    "Verehrung",
    "Jemand begegnet dir mit Wärme und Treue.",
    "Eine Zuneigung, die noch nicht erwidert wird.",
    "Große gelbe Blütenblätter umgeben eine braune Mitte, in der die Samen heranreifen.",
    "Die Sonnenblume stammt aus Nordamerika und wurde dort schon vor Jahrtausenden von indigenen Völkern angebaut. Junge Pflanzen richten sich nach der Sonne."
  ],
  "tulipano-rosso": [
    "Rote Tulpe",
    "Wahre Liebe",
    "Eine klare und aufrichtige Liebeserklärung.",
    "Eine Liebeserklärung, die noch auf Antwort wartet.",
    "Glatte, glänzende, rote Blütenblätter bilden einen Kelch auf einem einzelnen Stängel.",
    "Die Tulpe stammt aus Zentralasien. Im 17. Jahrhundert löste sie in den Niederlanden die berühmte Tulpenmanie aus, eine frühe Spekulationsblase."
  ],
  "orchidea": [
    "Orchidee",
    "Erlesene Schönheit",
    "Ein zartes, liebevoll gepflegtes Gefühl.",
    "Ein zartes Gefühl, das Geduld und Schutz braucht.",
    "Eine zarte, oft rosa oder violette Blüte mit einer dunkleren Lippe in der Mitte.",
    "Orchideen gehören zu den größten Pflanzenfamilien der Welt. Tausende Arten wachsen auf fast allen Kontinenten."
  ],
  "lavanda": [
    "Lavendel",
    "Hingabe",
    "Ruhe und Treue, die lange anhalten.",
    "Ruhe ist da, aber Treue muss sich noch zeigen.",
    "Kleine lila oder violette Blüten bilden duftende Ähren.",
    "Der Name leitet sich vom lateinischen «lavare» für waschen ab. Die Römer parfümierten damit ihr Badewasser."
  ],
  "papavero": [
    "Mohnblume",
    "Erinnerung",
    "Jemand, den du nie vergessen wirst.",
    "Eine Erinnerung, die immer noch schmerzt.",
    "Feine, zerbrechliche rote Blütenblätter mit dunklen Flecken am Ansatz.",
    "Nach dem Ersten Weltkrieg wurde die Mohnblume in Flandern zum Symbol des Gedenkens an gefallene Soldaten."
  ],
  "iris": [
    "Schwertlilie",
    "Vertrauen",
    "Eine gute Nachricht erreicht dich aus der Ferne.",
    "Eine Nachricht aus der Ferne, die noch ungewiss ist.",
    "Blauviolette Blütenblätter mit einem gelben Streifen in der Mitte.",
    "Der Name stammt von Iris, der Götterbotin der griechischen Mythologie. Auf Griechisch bedeutet Iris auch «Regenbogen»."
  ],
  "garofano-rosso": [
    "Rote Nelke",
    "Bewunderung",
    "Eine tiefe, intensive Liebe.",
    "Starke Bewunderung, die nicht erwidert wird.",
    "Rote Blütenblätter mit gezackten, spitzenartigen Rändern.",
    "Der botanische Name bezieht sich auf die griechische «Blume des Zeus». Nelken gehören zu den seit Langem in Europa kultivierten Blumen."
  ],
  "viola": [
    "Stiefmütterchen",
    "Zuneigung",
    "Jemand denkt jeden Tag an dich.",
    "Jemand denkt an dich, sagt es aber nicht.",
    "Violette, gelbe und weiße Blütenblätter bilden ein charakteristisches Gesicht in der Mitte.",
    "Der französische Name «pensée» bedeutet Gedanke. Im Mittelalter galt die Blume als Symbol der Erinnerung."
  ],
  "ortensia": [
    "Hortensie",
    "Dankbarkeit",
    "Ein aufrichtiges, dankbares Gefühl.",
    "Ein aufrichtiges Gefühl, das noch nicht wahrgenommen wird.",
    "Große, kugelförmige Blütenstände in Blau oder Rosa; ihre Farbe kann vom Boden abhängen.",
    "Der Name Hydrangea stammt von griechischen Wörtern für «Wasser» und «Gefäß». Saurer Boden fördert bei manchen Sorten blaue Blüten."
  ],
  "peonia": [
    "Pfingstrose",
    "Romantik",
    "Eine leidenschaftliche Liebe voller Hoffnung.",
    "Eine leidenschaftliche Liebe, die noch wartet.",
    "Große rosa Blüten mit vielen weichen, übereinanderliegenden Blütenblättern.",
    "In China ist sie als «Königin der Blumen» bekannt und wird dort seit über tausend Jahren kultiviert."
  ],
  "dalia": [
    "Dahlie",
    "Eleganz",
    "Eine Eleganz, die Herzen gewinnt.",
    "Eine Eleganz, die noch nicht begeistert hat.",
    "Viele Blütenblätter sind rosettenförmig um die Mitte angeordnet.",
    "Die Dahlie stammt aus Mexiko und wurde nach dem schwedischen Botaniker Anders Dahl benannt."
  ],
  "ciliegio": [
    "Kirschblüte",
    "Vergängliche Schönheit",
    "Ein schöner Augenblick, der dir bleibt.",
    "Ein schöner Augenblick, der schnell vergeht.",
    "Zartrosa Blüten mit meist fünf Blütenblättern, die im Frühling aufblühen.",
    "In Japan ist Hanami die Tradition, die Kirschblüte und ihre vergängliche Schönheit zu bewundern."
  ],
  "ibisco": [
    "Hibiskus",
    "Charme",
    "Ein Charme, der nicht unbemerkt bleibt.",
    "Ein Charme, der noch keine Aufmerksamkeit erregt hat.",
    "Große rote Blüten mit einer langen, markanten Staubblattsäule in der Mitte.",
    "Der Hibiskus ist die Nationalblume Malaysias. Einige Arten werden auch für Aufgüsse wie Karkade verwendet."
  ]
};
 const extra=root.PetaliLingueExtra;
 if(!extra) throw new Error("Load lingue-extra.js first");
 for(const [id,a] of Object.entries(data)){
  const t=extra.FIORI_EXTRA[id]||(extra.FIORI_EXTRA[id]={nome:{},significato:{},descrizione:{},storia:{},messaggi:{mama:{},nonMama:{}}});
  t.nome.de=a[0];t.significato.de=a[1];t.messaggi.mama.de=a[2];t.messaggi.nonMama.de=a[3];t.descrizione.de=a[4];t.storia.de=a[5];
 }
 extra.applica();
})(typeof window!=="undefined"?window:globalThis);
