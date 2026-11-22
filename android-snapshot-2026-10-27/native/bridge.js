// Compilato da esbuild solo per Android/iOS; su GitHub Pages resta il fallback innocuo.
import { Capacitor, registerPlugin } from "@capacitor/core";
import { Haptics } from "@capacitor/haptics";
import { Purchases } from "@revenuecat/purchases-capacitor";
const ShareGift = registerPlugin('PetaliShare');
window.PetaliNative = { Haptics, Purchases, ShareGift, platform: Capacitor.getPlatform() };
