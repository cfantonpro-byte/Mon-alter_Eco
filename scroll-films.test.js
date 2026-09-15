const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const code=fs.readFileSync(require.resolve('./scroll-films.js'),'utf8');
function run({top=120,reduced=false,seeking=false,ready=2}={}){
  const callbacks={};
  const total={dataset:{initial:'10000',monthly:'200',years:'10'},textContent:''},year={textContent:''};
  const scene={offsetHeight:1080,offsetTop:1000,querySelectorAll:()=>[],querySelector:selector=>selector==='[data-growth-total]'?total:selector==='[data-growth-year]'?year:{offsetHeight:600},matches:()=>false,getBoundingClientRect:()=>({top,bottom:top+1080,height:1080}),style:{setProperty(){}}};
  const video={currentTime:0,duration:8,readyState:ready,seeking,dataset:{src:'local.mp4'},classList:{add(){}},closest:()=>scene,load(){},addEventListener(name,fn){callbacks[name]=fn}};
  let pending;
  vm.runInNewContext(code,{document:{querySelectorAll:()=>[video],documentElement:{scrollHeight:5000}},matchMedia:()=>({matches:reduced,addEventListener(){}}),innerHeight:720,getComputedStyle:()=>({top:'120px'}),requestAnimationFrame:fn=>{pending=fn;return 1},addEventListener(){},IntersectionObserver:class{observe(){}}});
  pending();return {...video,total:total.textContent,year:year.textContent};
}
test('sticky film begins at zero',()=>assert.equal(run().currentTime,0));
test('sticky film follows mid-scroll',()=>assert.equal(run({top:-120}).currentTime,3.97));
test('sticky film stops before last-frame boundary',()=>assert.equal(run({top:-360}).currentTime,7.94));
test('reduced motion does not seek',()=>assert.equal(run({top:-120,reduced:true}).currentTime,0));
test('pending seek is not interrupted',()=>assert.equal(run({top:-120,seeking:true}).currentTime,0));
test('metadata is required before seeking',()=>assert.equal(run({top:-120,ready:0}).currentTime,0));
test('figures show contributions only at half the horizon',()=>{
  const result=run({top:-120});assert.equal(result.year,'5');
  assert.equal(result.total,new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(22000));
});
test('reduced motion shows the final figures',()=>{
  const result=run({reduced:true});assert.equal(result.year,'10');
  assert.equal(result.total,new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(34000));
});
