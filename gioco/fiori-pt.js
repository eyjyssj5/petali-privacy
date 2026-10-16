(function(root){
 const data={
  "rosa-rossa": [
    "Rosa vermelha",
    "Paixão",
    "Um sentimento forte e intenso, correspondido.",
    "Um sentimento forte, mas ainda não correspondido.",
    "Pétalas vermelhas e aveludadas, de aroma intenso, com muitas pétalas sobrepostas no centro.",
    "Cultivada há milénios na Ásia e na Pérsia. Na mitologia grega, está ligada a Afrodite, deusa do amor."
  ],
  "rosa-gialla": [
    "Rosa amarela",
    "Amizade",
    "Uma amizade luminosa que perdura.",
    "Uma ligação leve que ainda precisa de cuidados.",
    "Pétalas amarelas, brilhantes e perfumadas, que se abrem lentamente.",
    "Na época vitoriana, a rosa amarela simbolizava o ciúme. Hoje está associada à amizade."
  ],
  "girasole": [
    "Girassol",
    "Adoração",
    "Alguém que te olha com carinho e lealdade.",
    "Um carinho que ainda não foi correspondido.",
    "Grandes pétalas amarelas em redor de um centro castanho, onde se formam as sementes.",
    "Originário da América do Norte, era cultivado pelos povos indígenas há milhares de anos. As plantas jovens acompanham a luz do sol ao longo do dia."
  ],
  "tulipano-rosso": [
    "Tulipa vermelha",
    "Amor verdadeiro",
    "Uma declaração clara e sincera.",
    "Uma declaração que ainda espera resposta.",
    "Pétalas vermelhas em forma de taça, lisas e brilhantes, num único caule.",
    "Originária da Ásia Central, a tulipa protagonizou a «tulipomania» nos Países Baixos do século XVII, uma das primeiras bolhas especulativas da história."
  ],
  "orchidea": [
    "Orquídea",
    "Beleza requintada",
    "Um sentimento delicado e cuidado.",
    "Um sentimento delicado que merece paciência e proteção.",
    "Flor delicada, normalmente rosa ou roxa, com um labelo mais escuro no centro.",
    "As orquídeas formam uma das maiores famílias de plantas do mundo, com milhares de espécies em quase todos os continentes."
  ],
  "lavanda": [
    "Lavanda",
    "Devoção",
    "Calma e fidelidade ao longo do tempo.",
    "Há calma, mas a fidelidade ainda precisa de ser demonstrada.",
    "Pequenas flores lilases ou roxas, reunidas em espigas aromáticas.",
    "O nome vem do latim «lavare», lavar: os romanos usavam-na para perfumar a água dos banhos."
  ],
  "papavero": [
    "Papoila",
    "Recordação",
    "Alguém que nunca esquecerás.",
    "Uma recordação que ainda dói.",
    "Pétalas vermelhas, finas e frágeis, com uma mancha escura na base.",
    "Depois da Primeira Guerra Mundial, a papoila tornou-se, na Flandres, um símbolo da memória dos que morreram na guerra."
  ],
  "iris": [
    "Íris",
    "Confiança",
    "Chega uma boa mensagem de longe.",
    "Uma mensagem de longe que ainda é incerta.",
    "Pétalas azul-violeta com uma faixa amarela no centro.",
    "O nome vem de Íris, a mensageira dos deuses gregos. Em grego também significa «arco-íris»."
  ],
  "garofano-rosso": [
    "Cravo vermelho",
    "Admiração",
    "Um amor profundo e intenso.",
    "Uma forte admiração que não é recíproca.",
    "Pétalas vermelhas com bordos rendilhados e recortados.",
    "O nome botânico está ligado à expressão grega «flor de Zeus». É uma das flores cultivadas na Europa há mais tempo."
  ],
  "viola": [
    "Amor-perfeito",
    "Pensamento",
    "Alguém pensa em ti todos os dias.",
    "Alguém pensa em ti, mas não o diz.",
    "Pétalas roxas, amarelas e brancas, com uma «cara» característica no centro.",
    "O nome francês «pensée» significa pensamento. Na Idade Média, esta flor estava ligada às recordações."
  ],
  "ortensia": [
    "Hortênsia",
    "Gratidão",
    "Um sentimento sincero e agradecido.",
    "Um sentimento sincero que ainda não foi reconhecido.",
    "Grandes inflorescências arredondadas, azuis ou cor-de-rosa, cuja cor pode depender do solo.",
    "O nome Hydrangea vem das palavras gregas para «água» e «recipiente». Solos ácidos favorecem flores azuis em certas variedades."
  ],
  "peonia": [
    "Peónia",
    "Romantismo",
    "Um amor apaixonado e cheio de esperança.",
    "Um amor apaixonado que continua à espera.",
    "Flores grandes e rosadas com muitas pétalas macias e sobrepostas.",
    "Na China é conhecida como a «rainha das flores» e é cultivada há mais de mil anos."
  ],
  "dalia": [
    "Dália",
    "Elegância",
    "Uma elegância que conquista.",
    "Uma elegância que ainda não cativou.",
    "Flores de pétalas numerosas, dispostas como uma roseta em redor do centro.",
    "Originária do México, recebeu o nome em homenagem ao botânico sueco Anders Dahl."
  ],
  "ciliegio": [
    "Flor de cerejeira",
    "Beleza passageira",
    "Um belo momento que ficará contigo.",
    "Um belo momento que desaparece depressa.",
    "Flores cor-de-rosa-claro, habitualmente com cinco pétalas, que desabrocham na primavera.",
    "No Japão, o hanami é a tradição de apreciar as flores de cerejeira e a sua beleza passageira."
  ],
  "ibisco": [
    "Hibisco",
    "Encanto",
    "Um encanto que não passa despercebido.",
    "Um encanto que ainda não despertou atenção.",
    "Flores grandes e vermelhas, com uma longa coluna central de estames.",
    "É a flor nacional da Malásia. Algumas espécies de hibisco são utilizadas para preparar infusões como o karkadé."
  ]
};
 const extra=root.PetaliLingueExtra;
 if(!extra) throw new Error("Load lingue-extra.js first");
 for(const [id,a] of Object.entries(data)){
  const t=extra.FIORI_EXTRA[id]||(extra.FIORI_EXTRA[id]={nome:{},significato:{},descrizione:{},storia:{},messaggi:{mama:{},nonMama:{}}});
  t.nome.pt=a[0];t.significato.pt=a[1];t.messaggi.mama.pt=a[2];t.messaggi.nonMama.pt=a[3];t.descrizione.pt=a[4];t.storia.pt=a[5];
 }
 extra.applica();
})(typeof window!=="undefined"?window:globalThis);
