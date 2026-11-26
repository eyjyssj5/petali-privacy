// Compilato da esbuild solo per Android/iOS; su GitHub Pages resta il fallback innocuo.
import { Capacitor, registerPlugin } from "@capacitor/core";
import { Haptics } from "@capacitor/haptics";
import { Purchases } from "@revenuecat/purchases-capacitor";
import { AdMob, AdmobConsentStatus } from "@capacitor-community/admob";
const ShareGift = registerPlugin('PetaliShare');
const Billing = registerPlugin('PetaliBilling');
const platform=Capacitor.getPlatform();
const ads=window.PetaliAdConfig||{};
const adId=ads[platform];
let initialized=false, busy=false;
const RewardAds={
 available:()=>['ios','android'].includes(platform)&&typeof adId==='string'&&/^ca-app-pub-\d{16}\/\d{10}$/.test(adId),
 async privacy(){
   if(!this.available())return;
   const info=await AdMob.requestConsentInfo();
   if(info.status===AdmobConsentStatus.REQUIRED&&info.isConsentFormAvailable)await AdMob.showConsentForm();
   else if(String(info.privacyOptionsRequirementStatus).toUpperCase()==='REQUIRED')await AdMob.showPrivacyOptionsForm();
   else window.alert(document.documentElement.lang==='it'?'Nessuna preferenza pubblicitaria richiesta.':'No ad privacy choices required.');
 },
 async watch(){
   if(busy||!this.available())return false;
   busy=true;
   try{
     let consent=await AdMob.requestConsentInfo();
     if(consent.status===AdmobConsentStatus.REQUIRED&&consent.isConsentFormAvailable)consent=await AdMob.showConsentForm();
     if(consent.canRequestAds!==true)return false;
     if(!initialized){await AdMob.initialize();initialized=true}
     await AdMob.prepareRewardVideoAd({adId,isTesting:ads.test===true,npa:true});
     const reward=await AdMob.showRewardVideoAd({adId});
     return Number(reward?.amount)>0;
   }finally{busy=false}
 }
};
window.PetaliNative = { Haptics, Purchases, ShareGift, Billing, RewardAds, platform };
