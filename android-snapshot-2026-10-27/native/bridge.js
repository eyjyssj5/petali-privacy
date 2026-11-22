// Compilato da esbuild solo per Android/iOS; su GitHub Pages resta il fallback innocuo.
import { Capacitor, registerPlugin } from "@capacitor/core";
import { Haptics } from "@capacitor/haptics";
import { Purchases } from "@revenuecat/purchases-capacitor";
const ShareGift = registerPlugin('PetaliShare');
const Billing = registerPlugin('PetaliBilling');
window.PetaliNative = { Haptics, Purchases, ShareGift, Billing, platform: Capacitor.getPlatform() };
