/* PETALI - biglietti regalo locali, nessun backend e nessun nuovo acquisto. */
(function () {
  "use strict";
  const data = window.PetaliRegaliCatalogo;
  const $ = (id) => document.getElementById(id);
  if (!data || !$("regali-page") || !window.Fiori?.FIORI) return;

  const TR = {
    it: { title:"🎁 Regala un fiore", intro:"Scegli l'occasione, personalizza la dedica e invia un biglietto floreale digitale.", occasion:"Per quale occasione?", choose:"Fiori consigliati", free:"Gratis", premium:"Premium 2D", to:"A chi è dedicato?", from:"Da chi?", message:"La tua dedica", toPlaceholder:"Nome della persona", fromPlaceholder:"Il tuo nome", preview:"Anteprima regalo", share:"Regala e condividi", unlock:"Sblocca i fiori Premium 2D", locked:"Per regalare questo fiore devi prima sbloccare il pacchetto 2D. I fiori gratuiti sono sempre disponibili.", ready:"Biglietto pronto! Puoi condividerlo o salvarlo.", copy:"Copia la dedica", copied:"Dedica copiata.", fallback:"Il biglietto è stato scaricato; condividilo dalla galleria o dai file.", failed:"Condivisione non disponibile. Riprova o copia la dedica.", fromLabel:"Da", toLabel:"Per", gift:"Un fiore digitale da PETALI", cancel:"Condivisione annullata." },
    en: { title:"🎁 Send a flower", intro:"Choose an occasion, add a personal message and share a digital floral card.", occasion:"What's the occasion?", choose:"Recommended flowers", free:"Free", premium:"Premium 2D", to:"For whom?", from:"From whom?", message:"Your message", toPlaceholder:"Recipient's name", fromPlaceholder:"Your name", preview:"Gift preview", share:"Share this flower", unlock:"Unlock Premium 2D flowers", locked:"Unlock the 2D pack to gift this flower. Free flowers remain available.", ready:"Your gift card is ready to share.", copy:"Copy message", copied:"Message copied.", fallback:"Gift card downloaded. Share it from Photos or Files.", failed:"Sharing unavailable. Try again or copy the message.", fromLabel:"From", toLabel:"To", gift:"A digital flower from PETALI", cancel:"Sharing cancelled." },
    es: { title:"🎁 Regala una flor", intro:"Elige la ocasión, escribe una dedicatoria y comparte una tarjeta floral digital.", occasion:"¿Para qué ocasión?", choose:"Flores recomendadas", free:"Gratis", premium:"Prémium 2D", to:"¿Para quién?", from:"¿De quién?", message:"Tu dedicatoria", toPlaceholder:"Nombre de la persona", fromPlaceholder:"Tu nombre", preview:"Vista previa del regalo", share:"Regalar y compartir", unlock:"Desbloquear flores prémium 2D", locked:"Para regalar esta flor, primero debes desbloquear el paquete 2D. Las flores gratuitas siguen disponibles.", ready:"¡Tu tarjeta está lista para compartir!", copy:"Copiar dedicatoria", copied:"Dedicatoria copiada.", fallback:"Tarjeta descargada. Compártela desde Fotos o Archivos.", failed:"No se puede compartir. Prueba otra vez o copia el mensaje.", fromLabel:"De", toLabel:"Para", gift:"Una flor digital de PETALI", cancel:"Compartir cancelado." },
    pt: { title:"🎁 Oferece uma flor", intro:"Escolhe a ocasião, escreve uma dedicatória e partilha um cartão floral digital.", occasion:"Para que ocasião?", choose:"Flores recomendadas", free:"Grátis", premium:"Premium 2D", to:"Para quem?", from:"De quem?", message:"A tua dedicatória", toPlaceholder:"Nome da pessoa", fromPlaceholder:"O teu nome", preview:"Pré-visualização", share:"Oferecer e partilhar", unlock:"Desbloquear flores Premium 2D", locked:"Desbloqueia o pacote 2D para oferecer esta flor. As flores gratuitas continuam disponíveis.", ready:"O cartão está pronto para partilhar!", copy:"Copiar dedicatória", copied:"Dedicatória copiada.", fallback:"Cartão descarregado. Partilha-o a partir das fotografias ou ficheiros.", failed:"Não foi possível partilhar.", fromLabel:"De", toLabel:"Para", gift:"Uma flor digital de PETALI", cancel:"Partilha cancelada." },
    fr: { title:"🎁 Offrir une fleur", intro:"Choisissez une occasion, écrivez un mot et partagez une carte florale numérique.", occasion:"Pour quelle occasion ?", choose:"Fleurs conseillées", free:"Gratuit", premium:"Premium 2D", to:"Pour qui ?", from:"De la part de ?", message:"Votre message", toPlaceholder:"Nom du destinataire", fromPlaceholder:"Votre nom", preview:"Aperçu du cadeau", share:"Offrir et partager", unlock:"Débloquer les fleurs Premium 2D", locked:"Débloquez le pack 2D pour offrir cette fleur. Les fleurs gratuites restent accessibles.", ready:"Votre carte est prête à être partagée !", copy:"Copier le message", copied:"Message copié.", fallback:"Carte téléchargée. Partagez-la depuis Photos ou Fichiers.", failed:"Partage indisponible.", fromLabel:"De", toLabel:"Pour", gift:"Une fleur numérique de PETALI", cancel:"Partage annulé." },
    de: { title:"🎁 Blume verschenken", intro:"Wähle einen Anlass, schreibe eine Widmung und teile eine digitale Blumenkarte.", occasion:"Zu welchem Anlass?", choose:"Empfohlene Blumen", free:"Kostenlos", premium:"Premium 2D", to:"Für wen?", from:"Von wem?", message:"Deine Widmung", toPlaceholder:"Name der Person", fromPlaceholder:"Dein Name", preview:"Geschenkvorschau", share:"Blume verschenken", unlock:"Premium-2D-Blumen freischalten", locked:"Für diese Blume muss das 2D-Paket freigeschaltet werden. Kostenlose Blumen bleiben verfügbar.", ready:"Deine Karte ist fertig und kann geteilt werden!", copy:"Widmung kopieren", copied:"Widmung kopiert.", fallback:"Karte heruntergeladen. Teile sie über Fotos oder Dateien.", failed:"Teilen nicht verfügbar.", fromLabel:"Von", toLabel:"Für", gift:"Eine digitale Blume von PETALI", cancel:"Teilen abgebrochen." }
  };
  const flowers = new Map(window.Fiori.FIORI.map((f) => [f.id, f]));
  const icons = { "rosa-rossa":"🌹", "rosa-gialla":"🌹", "girasole":"🌻", "tulipano-rosso":"🌷", "orchidea":"🌸", "lavanda":"🪻", "papavero":"🌺", "iris":"🪻", "garofano-rosso":"🌺", "viola":"🌺", "ortensia":"💠", "peonia":"🌺", "dalia":"🌼", "ciliegio":"🌸", "ibisco":"🌺" };
  const animationLabels = {
    it:["Sfondo","Rosa","Avorio","Notte","Crea GIF animata","Guarda un video per creare la GIF","Condividi GIF","GIF pronta, tocca per condividerla.","Video non disponibile o non completato.","Preparazione GIF…","Crea un biglietto"],
    en:["Background","Rose","Ivory","Night","Create animated GIF","Watch a video to create the GIF","Share GIF","GIF ready, tap to share.","Video unavailable or incomplete.","Preparing GIF…","Create a card"],
    es:["Fondo","Rosa","Marfil","Noche","Crear GIF animado","Mira un vídeo para crear el GIF","Compartir GIF","GIF listo, toca para compartir.","Vídeo no disponible o incompleto.","Preparando GIF…","Crear una tarjeta"],
    pt:["Fundo","Rosa","Marfim","Noite","Criar GIF animado","Vê um vídeo para criar o GIF","Partilhar GIF","GIF pronto, toca para partilhar.","Vídeo indisponível ou incompleto.","A preparar GIF…","Criar um cartão"],
    fr:["Fond","Rose","Ivoire","Nuit","Créer un GIF animé","Regarder une vidéo pour créer le GIF","Partager le GIF","GIF prêt, touchez pour partager.","Vidéo indisponible ou incomplète.","Préparation du GIF…","Créer une carte"],
    de:["Hintergrund","Rosé","Elfenbein","Nacht","Animiertes GIF erstellen","Video ansehen, um das GIF zu erstellen","GIF teilen","GIF fertig, zum Teilen tippen.","Video nicht verfügbar oder unvollständig.","GIF wird erstellt…","Karte erstellen"]
  };
  for(const [lang,p] of Object.entries(window.PetaliExtendedLocales||{})){TR[lang]=p.gift;animationLabels[lang]=p.animation}
  const photos=new Map();
  function flowerSrc(id){return ['rosa-rossa','rosa-gialla'].includes(id)?'15-fiori-3d/miniature/'+id+'.png':'img/anteprime/'+id+'.svg'}
  function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error("Flower image unavailable"));img.src=src})}
  function flowerImage(id){
    if(!photos.has(id))photos.set(id,(async()=>{
      if(!['rosa-rossa','rosa-gialla'].includes(id)){
        let renderer;
        try{renderer=await window.PetaliGiftRenderer.open(id);const url=renderer.frame(0).toDataURL('image/png');return await loadImage(url)}catch(e){console.warn("[PETALI] botanical preview fallback",e?.message)}finally{renderer?.close()}
      }
      return loadImage(flowerSrc(id))
    })().catch(e=>{photos.delete(id);throw e}));
    return photos.get(id)
  }
  let preparedGif=null, gifBusy=false;
  const hasPremium=()=>window.PetaliCommerce?.has?.("2d")===true||window.PetaliCommerce?.has?.("3d")===true;
  function refreshGif(){const l=animationLabels[lang]||animationLabels.en;$("regalo-gif").textContent=hasPremium()?l[4]:l[5];$("regalo-gif-invia").textContent=l[6];$("regalo-gif-invia").hidden=!preparedGif}
  function invalidateGif(){preparedGif=null;refreshGif()}
  let lang = "it";
  let chosenFlower = data.free2d[0];
  const pickLocale = () => {
    const l = (localStorage.getItem("petali.lingua") || navigator.language || document.documentElement.lang || "it").slice(0,2).toLowerCase();
    return TR[l] ? l : "it";
  };
  const t = (k) => TR[lang][k] || TR.it[k] || k;
  const occasion = () => data.occasions.find((o) => o.id === $("regalo-occasione").value) || data.occasions[0];
  const nameOf = (f) => f?.nome?.[lang] || f?.nome?.en || f?.nome?.it || "";
  const premium = (id) => !data.free2d.includes(id);
  const unlocked = (id) => !premium(id) || window.PetaliCommerce?.has?.("2d") === true;
  const safeText = (id) => ($(id)?.value || "").trim().slice(0,350);
  const message = () => safeText("regalo-messaggio") || occasion().message[lang] || occasion().message.it;
  const paintStatus = (value) => { $("regalo-stato").textContent = value || ""; };
  function giftText() {
    const f = flowers.get(chosenFlower);
    return ["🎁 " + t("gift"), occasion().name[lang], nameOf(f),
      safeText("regalo-a") ? t("toLabel") + ": " + safeText("regalo-a") : "",
      message(),
      safeText("regalo-da") ? t("fromLabel") + ": " + safeText("regalo-da") : ""
    ].filter(Boolean).join("\n");
  }
  function syncPreview() {
    const f = flowers.get(chosenFlower);
    if (!f) return;
    $("regalo-preview-foto").src = flowerSrc(f.id);
    void flowerImage(f.id).then(img=>{if(chosenFlower===f.id)$("regalo-preview-foto").src=img.src}).catch(()=>{});
    $("regalo-preview-fiore").dataset.background=$("regalo-sfondo").value;
    refreshGif();
    $("regalo-preview-nome").textContent = nameOf(f);
    $("regalo-uso-etichetta").textContent = window.PetaliUsiFiori.label(lang);
    $("regalo-uso-testo").textContent = window.PetaliUsiFiori.get(f.id, lang);
    $("regalo-preview-occasione").textContent = occasion().name[lang];
    $("regalo-preview-dedica").textContent = message();
    $("regalo-preview-destinatario").textContent = safeText("regalo-a") || "";
    $("regalo-preview-mittente").textContent = safeText("regalo-da") || "";
    $("regalo-sblocca").hidden = unlocked(chosenFlower);
    $("regalo-condividi").disabled = !unlocked(chosenFlower);
    paintStatus(unlocked(chosenFlower) ? "" : t("locked"));
  }
  function drawChoices() {
    const list = $("regalo-fiori");
    list.replaceChildren();
    for (const id of occasion().flowers) {
      const f = flowers.get(id);
      if (!f) continue;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "regalo-fiore" + (chosenFlower === id ? " selezionato" : "");
      b.setAttribute("aria-pressed", String(chosenFlower === id));
      const icon = document.createElement("img");
      icon.className = "regalo-fiore-emoji";
      icon.alt="";icon.src=flowerSrc(id);
      const name = document.createElement("strong");
      name.textContent = nameOf(f);
      const status = document.createElement("small");
      status.textContent = premium(id) ? (unlocked(id) ? "✓ " + t("premium") : "🔒 " + t("premium")) : t("free");
      b.append(icon, name, status);
      b.addEventListener("click", () => {
        if(gifBusy)return; chosenFlower = id; invalidateGif(); drawChoices(); syncPreview();
      });
      list.append(b);
    }
  }
  function relabel() {
    lang = pickLocale();
    document.documentElement.lang = lang;
    document.documentElement.dir=lang==="ar"?"rtl":"ltr";
    document.title = "PETALI · " + t("title");
    $("regalo-torna").textContent = ({it:"← Torna ai fiori",en:"← Back to flowers",es:"← Volver a las flores",pt:"← Voltar às flores",fr:"← Retour aux fleurs",de:"← Zurück zu den Blumen"})[lang] || "← "+window.PetaliExtendedLocales[lang].app.indietro;
    const keys = { "regali-titolo":"title", "regali-intro":"intro", "regali-label-occasione":"occasion",
      "regali-label-fiori":"choose", "regali-label-a":"to", "regali-label-da":"from",
      "regali-label-messaggio":"message", "regali-label-preview":"preview" };
    for (const [id, key] of Object.entries(keys)) $(id).textContent = t(key);
    $("regalo-condividi").textContent = t("share");
    const l=animationLabels[lang]||animationLabels.en;
    $("regali-label-sfondo").textContent=l[0];
    Array.from($("regalo-sfondo").options).forEach((opt,i)=>opt.textContent=l[i+1]);
    if(new URLSearchParams(location.search).get("card")==="1")$("regali-titolo").textContent=l[10];
    refreshGif();
    $("regalo-copia").textContent = t("copy");
    $("regalo-sblocca").textContent = t("unlock");
    $("regalo-a").placeholder = t("toPlaceholder");
    $("regalo-da").placeholder = t("fromPlaceholder");
    const select = $("regalo-occasione");
    const current = select.value || data.occasions[0].id;
    select.replaceChildren();
    for (const o of data.occasions) {
      const opt = document.createElement("option");
      opt.value = o.id;
      opt.textContent = o.name[lang] || o.name.it;
      select.append(opt);
    }
    select.value = current;
    if (!select.value) select.value = data.occasions[0].id;
    if (!$("regalo-messaggio").dataset.edited) $("regalo-messaggio").value = occasion().message[lang] || occasion().message.it;
    drawChoices(); syncPreview();
  }
  function selectOccasion() {
    invalidateGif();
    const possible = occasion().flowers;
    chosenFlower = possible.find((id) => !premium(id)) || possible[0];
    $("regalo-messaggio").dataset.edited = "";
    $("regalo-messaggio").value = occasion().message[lang] || occasion().message.it;
    drawChoices(); syncPreview();
  }
  // A full flower illustration is drawn locally, with no remote upload.
  function imageCard(img, phase=0, size=900) {
    const c = document.createElement("canvas");
    c.width = size; c.height = Math.round(size*4/3);
    const ctx = c.getContext("2d");
    if (!ctx) throw Error("Canvas unavailable");
    ctx.scale(c.width/900,c.height/1200);
    ctx.direction=lang==="ar"?"rtl":"ltr";
    const f = flowers.get(chosenFlower);
    const bg = ctx.createLinearGradient(0,0,900,1200);
    const themes={rose:["#fff4f7","#e9d6ed","#8a3e67","#554052"],ivory:["#fffbef","#e7d8ba","#775438","#4e3b2b"],night:["#24192e","#4f3358","#f4d8c8","#fff1e9"]};
    const theme=themes[$("regalo-sfondo").value]||themes.rose;
    bg.addColorStop(0,theme[0]);bg.addColorStop(1,theme[1]);
    ctx.fillStyle = bg; ctx.fillRect(0,0,900,1200);
    ctx.fillStyle = theme[2]; ctx.textAlign = "center";
    ctx.font = "bold 40px Georgia, serif"; ctx.fillText("✿ PETALI ✿",450,100);
    ctx.font = "30px Arial, sans-serif"; ctx.fillText(occasion().name[lang] || "",450,160,770);
    if(!img)throw Error("Flower image unavailable");
    const scale=1+0.035*Math.sin(phase*Math.PI*2);
    const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height;
    const w=415*scale,h=415*scale, ratio=Math.min(w/iw,h/ih);
    const dw=iw*ratio,dh=ih*ratio;
    ctx.save();ctx.translate(450,410);ctx.rotate(.035*Math.sin(phase*Math.PI*2));ctx.drawImage(img,-dw/2,-dh/2,dw,dh);ctx.restore();
    // Fine drifting highlights, not an emoji or generic flower drawing.
    if(size<900){for(let i=0;i<9;i++){const a=i*2.399963,progress=(phase+i/9)%1;ctx.beginPath();ctx.fillStyle=theme[2];ctx.globalAlpha=.12+.20*Math.sin(Math.PI*progress);ctx.arc(450+Math.cos(a)*(.75+progress*.25)*250,410+Math.sin(a)*(.75+progress*.25)*235,3+3*Math.sin(Math.PI*progress),0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1}
    ctx.fillStyle=theme[2];ctx.textAlign="center";
    ctx.font = "bold 37px Georgia, serif"; ctx.fillText(nameOf(f),450,670,770);
    ctx.font="24px Arial, sans-serif";
    if (safeText("regalo-a")) ctx.fillText(t("toLabel") + ": " + safeText("regalo-a"),450,726,770);
    const content=message().replace(/\s+/gu," ").trim();
    const chars=typeof Intl.Segmenter==="function"?Array.from(new Intl.Segmenter(lang,{granularity:"grapheme"}).segment(content),x=>x.segment):Array.from(content);
    function wrap(size){ctx.font=size+"px system-ui, sans-serif";const lines=[];let line="";for(const ch of chars){const next=line+ch;if(line&&ctx.measureText(next).width>735){lines.push(line.trimEnd());line=ch.trimStart()}else line=next}if(line)lines.push(line);return lines}
    let sizeText=32,lines=wrap(sizeText);while(lines.length*sizeText*1.28>295&&sizeText>16){sizeText--;lines=wrap(sizeText)}
    ctx.fillStyle=theme[3];const lineHeight=Math.min(sizeText*1.28,295/Math.max(1,lines.length));lines.forEach((line,i)=>ctx.fillText(line,450,785+i*lineHeight,735));
    if (safeText("regalo-da")) {ctx.font="24px Arial, sans-serif";ctx.fillStyle=theme[2];ctx.fillText(t("fromLabel") + ": " + safeText("regalo-da"),450,1130,770);}
    return c;
  }
  function pngBlob(canvas) {
    return new Promise((resolve) => canvas.toBlob(resolve,"image/png"));
  }
  function downloadBlob(blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href=url;link.download="petali-regalo.png";document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),10000);
  }
  async function share() {
    if (!unlocked(chosenFlower)) { paintStatus(t("locked")); return; }
    try {
      const text = giftText();
      const img=await flowerImage(chosenFlower);
      const platform = window.PetaliNative?.platform || "web";
      // Android WebView non supporta in modo affidabile Web Share.
      // Passiamo il PNG al plugin nativo: apre ACTION_SEND con selettore app.
      if (platform === "android") {
        const nativeShare = window.PetaliNative?.ShareGift;
        if (!nativeShare?.shareImage) throw new Error("PetaliShare Android non registrato");
        const encoded = imageCard(img).toDataURL("image/png").split(",")[1];
        if (!encoded) throw new Error("PNG non generato");
        await nativeShare.shareImage({ pngBase64: encoded, text });
        paintStatus(t("ready"));
        return;
      }
      const blob = await pngBlob(imageCard(img));
      const file = blob && typeof File !== "undefined"
        ? new File([blob], "petali-regalo.png", { type: "image/png" }) : null;
      if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "PETALI", text, files: [file] });
        paintStatus(t("ready"));
        return;
      }
      // Never report a text-only share as a successfully shared card.
      // Solo nel browser normale si scarica il biglietto. Su Android nativo
      // non si deve nascondere un errore dietro a un download automatico.
      if (platform === "web" && blob) {
        downloadBlob(blob);
        paintStatus(t("fallback"));
        return;
      }
      paintStatus(t("failed"));
    } catch (error) {
      console.error("[PETALI regalo]", error);
      paintStatus(error?.name === "AbortError" ? t("cancel") : t("failed"));
    }
  }
  async function prepareAnimation(){
    if(gifBusy)return;
    const l=animationLabels[lang]||animationLabels.en;
    gifBusy=true;preparedGif=null;refreshGif();
    const controls=[...document.querySelectorAll('#regali-page input,#regali-page select,#regali-page textarea,#regalo-fiori button,#regalo-gif,#regalo-condividi,#regalo-sblocca')];
    const previous=controls.map(x=>x.disabled);controls.forEach(x=>x.disabled=true);
    let renderer;
    try{
      if(!hasPremium()){
        const ads=window.PetaliNative?.RewardAds;
        if(!ads?.available?.()||await ads.watch()!==true){paintStatus(l[8]);return}
      }
      paintStatus(l[9]);
      await new Promise(resolve=>setTimeout(resolve,30));
      renderer=await window.PetaliGiftRenderer.open(chosenFlower);
      const frames=[];for(let i=0;i<16;i++){const c=imageCard(renderer.frame(i/16),i/16,480);frames.push(c.getContext("2d").getImageData(0,0,c.width,c.height).data);if(i%4===3)await new Promise(resolve=>setTimeout(resolve,0))}
      const bytes=window.PetaliGif.encode(480,640,frames,14);
      const blob=new Blob([bytes],{type:"image/gif"});
      preparedGif={blob,text:giftText()};
      refreshGif();paintStatus(l[7]);
    }catch(error){console.error("[PETALI GIF]",error);paintStatus(t("failed"))}
    finally{renderer?.close();gifBusy=false;controls.forEach((x,i)=>x.disabled=previous[i]);$("regalo-condividi").disabled=!unlocked(chosenFlower)}
  }
  async function shareAnimation(){
    if(!preparedGif||gifBusy)return;
    try{
      const {blob,text}=preparedGif,platform=window.PetaliNative?.platform||"web";
      if(platform==="android"){
        const base64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(",")[1]);reader.onerror=reject;reader.readAsDataURL(blob)});
        await window.PetaliNative.ShareGift.shareImage({gifBase64:base64,text});
      }else{
        const file=new File([blob],"petali-regalo.gif",{type:"image/gif"});
        if(navigator.share&&navigator.canShare?.({files:[file]}))await navigator.share({title:"PETALI",text,files:[file]});
        else if(platform==="web"){const link=document.createElement("a");const url=URL.createObjectURL(blob);link.href=url;link.download=file.name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000)}
        else{paintStatus(t("failed"));return}
      }
      preparedGif=null;refreshGif();paintStatus(t("ready"));
    }catch(error){paintStatus(error?.name==="AbortError"?t("cancel"):t("failed"))}
  }
  $("regalo-sfondo").addEventListener("change",()=>{invalidateGif();syncPreview()});
  $("regalo-gif").addEventListener("click",()=>void prepareAnimation());
  $("regalo-gif-invia").addEventListener("click",()=>void shareAnimation());
  $("regalo-occasione").addEventListener("change",selectOccasion);
  for (const id of ["regalo-a","regalo-da","regalo-messaggio"]) {
    $(id).addEventListener("input", () => {
      if (id === "regalo-messaggio") $("regalo-messaggio").dataset.edited = "yes";
      invalidateGif();syncPreview();
    });
  }
  $("regalo-sblocca").addEventListener("click", async () => {
    const commerce = window.PetaliCommerce;
    if (!commerce?.ready?.()) { paintStatus(t("failed")); return; }
    try {
      await commerce.buy("2d");
      drawChoices();
      syncPreview();
    } catch (error) {
      if (!error?.userCancelled) { console.error("[PETALI 2D]", error); paintStatus(t("failed")); }
    }
  });
  $("regalo-condividi").addEventListener("click",()=>void share());
  $("regalo-copia").addEventListener("click",async()=>{
    if (!unlocked(chosenFlower)) { paintStatus(t("locked")); return; }
    try { await navigator.clipboard.writeText(giftText());paintStatus(t("copied")); }
    catch (_) { paintStatus(t("failed")); }
  });
  const observer=new MutationObserver(()=>{if(pickLocale()!==lang)relabel();});
  observer.observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
  window.PetaliCommerce?.subscribe?.(()=>{drawChoices();syncPreview();});
  relabel();
  // In una pagina separata l'accesso 2D va riletto dallo store.
  void Promise.resolve(window.PetaliCommerce?.refresh?.())
    .then(() => { drawChoices(); syncPreview(); })
    .catch((error) => console.warn("[PETALI regalo: acquisti]", error));
})();
