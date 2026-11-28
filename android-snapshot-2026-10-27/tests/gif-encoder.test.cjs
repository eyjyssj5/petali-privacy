const test=require('node:test'),assert=require('node:assert/strict');
const {encode}=require('../gioco/gif-encoder.js');
test('GIF89a, two frames, loop extension, dimensions and trailer',()=>{
 const a=new Uint8Array(4*4*4).fill(255),b=a.slice();b[0]=0;
 const gif=Buffer.from(encode(4,4,[a,b],15));assert.equal(gif.subarray(0,6).toString(),'GIF89a');assert.equal(gif.readUInt16LE(6),4);assert.equal(gif.readUInt16LE(8),4);assert.ok(gif.includes(Buffer.from('NETSCAPE2.0')));assert.equal(gif[gif.length-1],0x3b);
 let i=781,images=0;while(i<gif.length){const tag=gif[i++];if(tag===0x3b)break;if(tag===0x21){i++;while(gif[i])i+=gif[i]+1;i++}else if(tag===0x2c){images++;i+=9;i++;while(gif[i])i+=gif[i]+1;i++}else assert.fail('Unexpected tag '+tag)}assert.equal(images,2);
});
test('rejects invalid dimensions or frames',()=>assert.throws(()=>encode(4,4,[],15)));
