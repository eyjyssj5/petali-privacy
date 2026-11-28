/* PETALI local GIF89a encoder. No upload or external dependencies. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PetaliGif=api})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  function palette(frames){
    // Weighted median-cut across sampled frames; all frames share one palette.
    const counts=new Uint32Array(32768), rr=new Uint32Array(32768),gg=new Uint32Array(32768),bb=new Uint32Array(32768);
    for(const [index,rgba] of frames.entries())for(let i=0;i<rgba.length;i+=index===0?4:32){const r=rgba[i],g=rgba[i+1],b=rgba[i+2],k=(r>>3)*1024+(g>>3)*32+(b>>3);counts[k]++;rr[k]+=r;gg[k]+=g;bb[k]+=b}
    let colors=[];for(let i=0;i<counts.length;i++)if(counts[i])colors.push([rr[i]/counts[i],gg[i]/counts[i],bb[i]/counts[i],counts[i]]);
    function describe(a){let lo=[255,255,255],hi=[0,0,0],n=0;for(const c of a){n+=c[3];for(let j=0;j<3;j++){lo[j]=Math.min(lo[j],c[j]);hi[j]=Math.max(hi[j],c[j])}}let axis=0;for(let j=1;j<3;j++)if(hi[j]-lo[j]>hi[axis]-lo[axis])axis=j;return {a,n,axis,score:a.length>1?(hi[axis]-lo[axis])*Math.sqrt(n):0}}
    let boxes=[describe(colors)];while(boxes.length<256){boxes.sort((a,b)=>b.score-a.score);const x=boxes.shift();if(!x||!x.score){if(x)boxes.unshift(x);break}x.a.sort((a,b)=>a[x.axis]-b[x.axis]);let sum=0,k=1;for(;k<x.a.length-1;k++){sum+=x.a[k-1][3];if(sum>=x.n/2)break}boxes.push(describe(x.a.slice(0,k)),describe(x.a.slice(k)))}
    const out=boxes.map(x=>[0,1,2].map(j=>Math.round(x.a.reduce((s,c)=>s+c[j]*c[3],0)/x.n)));
    const real=out.length;while(out.length<256)out.push([0,0,0]);return {out,real}
  }
  function encode(width,height,frames,delay=15){
    if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>640||height>640||!Array.isArray(frames)||frames.length<2||frames.length>24||frames.some(f=>f.length!==width*height*4)||!Number.isInteger(delay)||delay<2||delay>1000)throw Error('Invalid GIF frames');
    const {out:pal,real}=palette(frames), lookup=new Int16Array(32768).fill(-1), bytes=[];
    const put=(...v)=>{for(const x of v)bytes.push(x&255)},word=x=>put(x,x>>8),str=s=>put(...Array.from(s,c=>c.charCodeAt(0)));
    const nearest=(r,g,b)=>{const k=(r>>3)*1024+(g>>3)*32+(b>>3);if(lookup[k]>=0)return lookup[k];let best=0,d=Infinity;for(let i=0;i<real;i++){const p=pal[i],v=(r-p[0])**2+(g-p[1])**2+(b-p[2])**2;if(v<d){best=i;d=v}}return lookup[k]=best};
    str('GIF89a');word(width);word(height);put(0xf7,0,0);for(const p of pal)put(...p);
    put(0x21,0xff,11);str('NETSCAPE2.0');put(3,1,0,0,0);
    for(const frame of frames){
      put(0x21,0xf9,4,0x04);word(delay);put(0,0);
      put(0x2c);word(0);word(0);word(width);word(height);put(0,8);
      // Clear before the dictionary needs a tenth bit. Literal codes are valid LZW.
      let bits=0,acc=0,block=[];const emitByte=v=>{block.push(v);if(block.length===255){put(255,...block);block=[]}};
      const code=v=>{acc|=v<<bits;bits+=9;while(bits>=8){emitByte(acc&255);acc>>>=8;bits-=8}};
      code(256);let count=0;for(let i=0;i<frame.length;i+=4){if(count===240){code(256);count=0}code(nearest(frame[i],frame[i+1],frame[i+2]));count++}code(257);if(bits)emitByte(acc&255);if(block.length)put(block.length,...block);put(0)
    }
    put(0x3b);return Uint8Array.from(bytes)
  }
  return Object.freeze({encode});
});
