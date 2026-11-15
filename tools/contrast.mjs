// Usage: node tools/contrast.mjs "#fg" "#bg" [...pairs]
const hex = h => { h = h.replace('#',''); if (h.length===3) h=[...h].map(c=>c+c).join(''); return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255); };
const lin = c => c<=0.03928? c/12.92 : ((c+0.055)/1.055)**2.4;
const L = h => { const [r,g,b]=hex(h).map(lin); return 0.2126*r+0.7152*g+0.0722*b; };
export const ratio = (a,b) => { const [x,y]=[L(a),L(b)].sort((p,q)=>q-p); return (x+0.05)/(y+0.05); };
const args = process.argv.slice(2);
for (let i=0;i<args.length;i+=2){ const r=ratio(args[i],args[i+1]); console.log(`${args[i]} on ${args[i+1]}: ${r.toFixed(2)} ${r>=4.5?'AA':r>=3?'AA-large':'FAIL'}`); }
