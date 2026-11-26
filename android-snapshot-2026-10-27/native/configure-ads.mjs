// Public AdMob IDs only. Test mode never uses production ad units.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const mode=process.env.PETALI_ADS_MODE, platform=process.env.PETALI_ADS_PLATFORM;
if(!['test','live'].includes(mode)||!['ios','android'].includes(platform))throw Error('Set PETALI_ADS_MODE=test/live and PETALI_ADS_PLATFORM=ios/android');
const testIds={ios:['ca-app-pub-3940256099942544~1458002511','ca-app-pub-3940256099942544/1712485313'],android:['ca-app-pub-3940256099942544~3347511713','ca-app-pub-3940256099942544/5224354917']};
const prefix='PETALI_ADMOB_'+platform.toUpperCase();
const app=(mode==='test'?testIds[platform][0]:process.env[prefix+'_APP_ID']||'').trim();
const reward=(mode==='test'?testIds[platform][1]:process.env[prefix+'_REWARDED_ID']||'').trim();
if(!/^ca-app-pub-\d{16}~\d{10}$/.test(app)||!/^ca-app-pub-\d{16}\/\d{10}$/.test(reward))throw Error('Missing or invalid '+prefix+'_APP_ID / '+prefix+'_REWARDED_ID');
if(mode==='live'&&(app.includes('3940256099942544')||reward.includes('3940256099942544')))throw Error('Production build must use your real AdMob app and rewarded IDs');
if(app.split('~')[0]!==reward.split('/')[0])throw Error('App and rewarded IDs must belong to the same AdMob publisher');
const step=process.argv[2]||'web';
if(step==='web'){
  writeFileSync(new URL('../gioco/ad-config.js',import.meta.url),'window.PetaliAdConfig = Object.freeze('+JSON.stringify({test:mode==='test',[platform]:reward})+');\n');
}else if(step==='native'){
  if(platform==='ios'){
    const plist='ios/App/App/Info.plist';
    if(!existsSync(plist))throw Error('Missing iOS Info.plist after cap add/sync');
    const script="import plistlib,sys\np,app=sys.argv[1:]; d=plistlib.load(open(p,'rb')); d['GADApplicationIdentifier']=app; a=d.setdefault('SKAdNetworkItems',[]); ident='cstr6suwn9.skadnetwork'; a.append({'SKAdNetworkIdentifier':ident}) if not any(x.get('SKAdNetworkIdentifier')==ident for x in a) else None; plistlib.dump(d,open(p,'wb'),sort_keys=False)\n";
    const result=spawnSync('python3',['-c',script,plist,app],{stdio:'inherit'});
    if(result.status!==0)throw Error('Unable to configure iOS ads');
  }else{
    const manifest='android/app/src/main/AndroidManifest.xml';
    const old=readFileSync(manifest,'utf8');
    if(old.includes('com.google.android.gms.ads.APPLICATION_ID'))throw Error('AdMob application ID already present: review to prevent duplicate manifest entries');
    const next=old.replace(/(<application\b[^>]*>)/,'$1\n        <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="'+app+'" />');
    if(next===old)throw Error('Android application element missing');
    writeFileSync(manifest,next);
  }
}else throw Error('Unknown configuration step');
console.log('Petali ads configured: '+platform+' / '+mode+' / '+step);
