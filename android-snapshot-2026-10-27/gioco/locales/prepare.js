/* All ten additional locales must be loaded before any UI module. */
(function(w){
 const ids=["rosa-rossa","rosa-gialla","girasole","tulipano-rosso","orchidea","lavanda","papavero","iris","garofano-rosso","viola","ortensia","peonia","dalia","ciliegio","ibisco"],packs=w.PetaliExtendedLocales||{};
 for(const [lang,p] of Object.entries(packs)){
  if(p.flowers.length!==ids.length)throw Error('Incomplete flower translations '+lang);
  p.flowerById=Object.fromEntries(ids.map((id,i)=>[id,p.flowers[i]]));
 }
})(window);
