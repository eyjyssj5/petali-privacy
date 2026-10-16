// Compilato da esbuild solo per Android/iOS; su GitHub Pages resta il fallback innocuo.
import { Capacitor } from "@capacitor/core";
import { Haptics } from "@capacitor/haptics";
import { Purchases } from "@revenuecat/purchases-capacitor";
window.PetaliNative = { Haptics, Purchases, platform: Capacitor.getPlatform() };
