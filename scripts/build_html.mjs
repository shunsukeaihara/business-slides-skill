/** Company-neutral HTML slide patterns. Node standard library only. */
import fs from 'node:fs/promises';
import {extended} from './extended-patterns.mjs';
import {compound} from './compound-patterns.mjs';
import {structured} from './structured-patterns.mjs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const args={};for(let i=2;i<process.argv.length;i+=2)args[process.argv[i].replace(/^--/,'')]=process.argv[i+1];
if(!args.master||!args.data||!args.out)throw Error('Required: --master master.json --data deck.json --out deck.html [--aspect 13:9|16:9] [--overwrite yes]');
const masterPath=path.resolve(args.master),master=JSON.parse(await fs.readFile(masterPath,'utf8'));
const deck=JSON.parse(await fs.readFile(args.data,'utf8')),aspect=args.aspect||'13:9',profile=master.profiles[aspect];
if(!profile)throw Error('Aspect not in selected master');
const {width:W,height:H}=profile,C={connector:"#000000",connectorMuted:"#C5C8CC",border:"#777777",divider:"#777777",onAccent:"#FFFFFF",headerFill:"#4B4B4B",onHeader:"#FFFFFF",...master.colors},T=master.type,L=master.layout;
if(![[1040,720],[1280,720]].some(([w,h])=>w===W&&h===H))throw Error('Unsupported canvas dimensions');
if(!deck.slides?.length)throw Error('No slides');
const out=path.resolve(args.out);try{await fs.access(out);if(args.overwrite!=='yes')throw Error('Output exists; pass --overwrite yes only if authorized');}catch(e){if(e.code!=='ENOENT')throw e;}
await fs.mkdir(path.dirname(out),{recursive:true});
const escape=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const id=String(master.id).replace(/[^a-zA-Z0-9_-]/g,'_');
const logos={};for(const key of ['coverLogo','footerLogo'])if(master.brand[key]){
 const src=path.resolve(path.dirname(masterPath),master.brand[key]);const dest=`brand-${key}${path.extname(src)}`;
 await fs.copyFile(src,path.join(path.dirname(out),dest));logos[key]=dest;
}
const helper=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../assets/slide-layout.js');
if(helper!==path.join(path.dirname(out),'slide-layout.js'))await fs.copyFile(helper,path.join(path.dirname(out),'slide-layout.js'));
const safeColor=c=>{if(!/^#[0-9a-f]{6}$/i.test(c))throw Error('Use six-digit hex colors');return c;};
Object.entries(C).forEach(([k,v])=>Array.isArray(v)?v.forEach(safeColor):safeColor(v));
const font=[master.fonts.latin,master.fonts.japanese,...master.fonts.fallback].map(s=>'"'+s.replaceAll('"','')+'"').join(',');
let html='';const HX=profile.marginX??L.marginX,MAXW=W-2*HX,G=L.gap;let X=HX,BW=MAXW;
function text(s,x,y,w,h,cls='body',align='left',extra=''){return `<p class="${cls}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;text-align:${align};${extra}">${escape(s).replaceAll('\n','<br>')}</p>`;}
function box(s,x,y,w,h,{fill='var(--surface)',align='center',bold=true,border=false,color='var(--text)',paddingX=L.boxPaddingX,paddingY=L.boxPaddingY}={}){return `<div class="box" data-slide-native="box" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;padding:${paddingY}px ${paddingX}px;background:${fill};${border?'border:1px solid var(--border);':''}"><p style="color:${color};text-align:${align};font-weight:${bold?600:400}">${escape(s).replaceAll('\n','<br>')}</p></div>`;}
function list(items,x,y,w,h){return `<div class="list" data-slide-native="list" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><ul>${items.map(s=>`<li>${escape(s)}</li>`).join('')}</ul></div>`;}
function rect(x,y,w,h,color='var(--series-0)'){return `<div class="shape" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${color}"></div>`;}
function line(x,y,x2,y2,color='var(--line)',thick=1){const len=Math.hypot(x2-x,y2-y),a=Math.atan2(y2-y,x2-x)*180/Math.PI;return `<div class="shape" style="left:${x}px;top:${y}px;width:${len}px;height:${thick}px;background:${color};transform-origin:0 50%;transform:rotate(${a}deg)"></div>`;}
function connector(x,y,x2,y2){return line(x,y,x2,y2,'var(--connector)',1.5);}
function dot(x,y,r=5,color='var(--series-0)'){return `<div class="shape" style="left:${x-r}px;top:${y-r}px;width:${r*2}px;height:${r*2}px;border-radius:50%;background:${color}"></div>`;}
function head(s,x,y,w){return text(s,x,y,w,40,'heading','center')+line(x,y+45,x+w,y+45,'var(--divider)');}
function note(s,y=L.bodyBottom-24){return text(s,X,y,BW,28,'note','right');}
function columns(n,r=0){const w=(BW-r-(r?G:0)-(n-1)*G)/n;return Array.from({length:n},(_,i)=>({x:X+r+(r?G:0)+i*(w+G),w}));}
function polygon(x,y,w,h,points,color='var(--connector)'){return `<div class="shape" data-slide-shape="polygon" data-points='${JSON.stringify(points)}' style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${color};clip-path:polygon(${points.map(([a,b])=>a+'% '+b+'%').join(',')})"></div>`;}
function triangle(x,y,w=24,h=8,up=false,color='var(--connector)'){return polygon(x,y,w,h,up?[[0,100],[50,0],[100,100]]:[[0,0],[100,0],[50,100]],color);}
function arrow(x,y,x2,y2){const right=x2>=x,base=x2+(right?-8:8);return line(x,y,base,y2,'var(--connector)',1.5)+polygon(right?base:x2,y2-8,8,16,right?[[0,0],[100,50],[0,100]]:[[100,0],[0,50],[100,100]]);}
function chevron(s,x,y,w,h){return `<div class="chevron" data-slide-shape="chevron" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><p>${escape(s)}</p></div>`;}
function footer(n){const b=master.brand;return line(X,L.footerY,W-X,L.footerY,'var(--footerLine)')+text(b.confidential,X,L.footerTextY,BW/3,18,'footer')+(logos.footerLogo?`<img alt="" src="${logos.footerLogo}" style="position:absolute;left:${(W-b.footerLogoWidth)/2}px;top:${b.footerLogoY}px;width:${b.footerLogoWidth}px;height:${b.footerLogoHeight}px;object-fit:contain">`:'')+(b.showPageNumber?text(n,W-X-40,L.footerTextY,40,18,'footer','right'):'');}
function cover(s){const a=master.cover;return (logos.coverLogo?`<img alt="" src="${logos.coverLogo}" style="position:absolute;left:${W-a.logoRight-a.logoWidth}px;top:${a.logoY}px;width:${a.logoWidth}px;height:${a.logoHeight}px;object-fit:contain">`:'')+line(a.dividerLeft,a.dividerY,W-a.dividerRight,a.dividerY,'var(--line)')+text(s.title,a.titleLeft,a.titleY,W-a.titleLeft-a.titleRight,a.titleHeight,'cover')+text(s.subtitle,a.titleLeft,a.subtitleY,W-a.titleLeft-a.titleRight,a.subtitleHeight,'punch','left','color:var(--coverText)');}
function render(s,Y){
 let h='';
 if(s.pattern==='matrix'||s.pattern==='evidence'||s.pattern==='scope'){
  const R=Math.min(170,BW*.16),cols=columns(s.columns.length,R),rh=Math.min(126,(L.bodyBottom-Y-90)/s.rows.length);
  cols.forEach((c,i)=>h+=head(s.columns[i],c.x,Y,c.w));
  s.rows.forEach((r,i)=>{const y=Y+70+i*rh;h+=box(r.label,X,y,R,rh-16);r.cells.forEach((v,j)=>{const c=cols[j];h+=s.pattern==='scope'?box(v,c.x,y,c.w,rh-16,{fill:'transparent',bold:false}):text(v,c.x,y+10,c.w,rh-30,'dense');});});
 }else if(s.pattern==='focus'){
  const nav=BW*.23,dx=X+nav+G,dw=BW-nav-G;
  s.items.forEach((v,i)=>{const y=Y+i*85;h+=box(v,X,y,nav,65,{fill:i===s.selected?'var(--surface)':'transparent',border:i===s.selected});});
  h+=head(s.detailTitle,dx,Y,dw);
  s.rows.forEach((r,i)=>{const y=Y+80+i*128;h+=text(r.label,dx,y,dw,36,'heading')+text(r.body,dx,y+44,dw,75);});
 }else if(s.pattern==='driver'){
  const a=BW*.21,b=BW*.25,bx=X+a+70,rx=bx+b+50,rw=W-X-rx,ys=[Y+65,Y+260],mid=(ys[0]+ys[1]+90)/2;
  h+=box(s.total,X,mid-45,a,90,{border:true,fill:'transparent'});
  h+=connector(X+a,mid,bx-30,mid)+connector(bx-30,ys[0]+45,bx-30,ys[1]+45);
  s.factors.forEach((r,i)=>{h+=connector(bx-30,ys[i]+45,bx,ys[i]+45)+box(r.label,bx,ys[i],b,90)+text(r.evidence,rx,ys[i]+10,rw,95,'dense');});
  h+=text(s.operator,bx,ys[0]+122,b,40,'heading','center')+note(s.note,Y+405);
 }else if(s.pattern==='funnel'){
  const cols=columns(s.stages.length,104);h+=text('対象数',X,Y+110,104,40,'heading')+text('判断基準',X,Y+205,104,40,'heading')+text('除外理由',X,Y+340,104,40,'heading');
  cols.forEach((c,i)=>{const v=s.stages[i];h+=chevron(v.label,c.x,Y,c.w,66)+box(v.count,c.x,Y+105,c.w,66,{fill:'transparent'})+list(v.criteria,c.x,Y+205,c.w,110)+text(v.excluded,c.x,Y+340,c.w,95,'dense');});
 }else if(s.pattern==='scenario'){
  const R=130,cols=columns(s.scenarios.length,R);h+=text('前提条件',X,Y+85,R,40,'heading')+text('指標の推移',X,Y+235,R,40,'heading');
  const max=s.max;if(!(max>0))throw Error('Positive scenario max required');
  cols.forEach((c,i)=>{const v=s.scenarios[i];h+=head(v.label,c.x,Y,c.w)+text(v.assumption,c.x,Y+80,c.w,95,'dense');const by=Y+390,bh=150,pw=c.w-32,bw=pw/v.values.length*.55;h+=line(c.x+16,by,c.x+c.w-16,by);v.values.forEach((val,j)=>{if(val<0||val>max)throw Error('Scenario value out of scale');const xx=c.x+16+j*pw/v.values.length;h+=rect(xx,by-val/max*bh,bw,val/max*bh,i===1?'var(--series-0)':'var(--series-2)')+text(val,xx-5,by-val/max*bh-28,bw+10,25,'note','center')+text(s.periods[j],xx-12,by+12,bw+24,28,'note','center');});});h+=note(s.note,Y+455);
 }else if(s.pattern==='evaluation'){
  const R=180,cols=columns(s.columns.length,R),rh=92;cols.forEach((c,i)=>h+=head(s.columns[i],c.x,Y,c.w));
  s.rows.forEach((r,i)=>{const y=Y+75+i*rh;h+=text(r.label,X,y+18,R-15,55,'dense');r.cells.forEach((v,j)=>h+=box(v,cols[j].x,y,cols[j].w,rh-15,{fill:j===0?'var(--surface)':'transparent',bold:false}));});h+=note(s.note);
 }else if(s.pattern==='cycle'){
  const bw=BW*.34,bh=100,xx=[X+30,W-X-30-bw],yy=[Y+35,Y+295];
  h+=box(s.nodes[0],xx[0],yy[0],bw,bh)+box(s.nodes[1],xx[1],yy[0],bw,bh)+box(s.nodes[2],xx[1],yy[1],bw,bh)+box(s.nodes[3],xx[0],yy[1],bw,bh);
  h+=arrow(xx[0]+bw+10,yy[0]+bh/2,xx[1]-12,yy[0]+bh/2)+arrow(xx[1]-12,yy[1]+bh/2,xx[0]+bw+10,yy[1]+bh/2);
  h+=line(xx[1]+bw/2,yy[0]+bh+10,xx[1]+bw/2,yy[1]-12,'var(--connector)')+triangle(xx[1]+bw/2-12,yy[1]-18);
  h+=line(xx[0]+bw/2,yy[1]-10,xx[0]+bw/2,yy[0]+bh+12,'var(--connector)')+triangle(xx[0]+bw/2-12,yy[0]+bh+10,24,8,true);
  h+=text(s.relations[0],xx[0]+bw+10,yy[0]-8,xx[1]-xx[0]-bw-20,52,'note','center')+text(s.relations[2],xx[0]+bw+10,yy[1]+bh/2+12,xx[1]-xx[0]-bw-20,55,'note','center');
  h+=text(s.relations[1],xx[1]+bw/2+18,Y+195,bw/2,65,'note')+text(s.relations[3],xx[0]+bw/2+18,Y+195,bw/2,65,'note');
 }else if(s.pattern==='range'){
  const left=X+180,right=W-X-100,pw=right-left,top=Y+65,rh=72,scale=v=>left+(v-s.min)/(s.max-s.min)*pw;
  if(!(s.max>s.min))throw Error('Invalid range scale');
  [s.min,(s.max+s.min)/2,s.max].forEach(v=>h+=text(v,scale(v)-30,Y,60,28,'note','center')+line(scale(v),Y+35,scale(v),top+rh*s.rows.length-12));
  s.rows.forEach((r,i)=>{if(!(s.min<=r.low&&r.low<=r.value&&r.value<=r.high&&r.high<=s.max))throw Error('Invalid interval');const y=top+i*rh;h+=text(r.label,X,y-17,160,45,'dense')+line(scale(r.low),y,scale(r.high),y,'var(--series-2)',5)+line(scale(r.low),y-10,scale(r.low),y+10)+line(scale(r.high),y-10,scale(r.high),y+10)+dot(scale(r.value),y,6)+text(r.value,right+16,y-15,70,35,'dense','center');});h+=note(s.note,top+rh*s.rows.length+15);
 }else if(s.pattern==='diverging'){
  const left=X+190,right=W-X-80,cx=(left+right)/2,half=(right-left)/2,top=Y+55,rh=74;
  [-s.limit,0,s.limit].forEach(v=>h+=text(v,cx+v/s.limit*half-35,Y,70,30,'note','center'));h+=line(cx,Y+40,cx,top+s.rows.length*rh-15);
  s.rows.forEach((r,i)=>{if(Math.abs(r.value)>s.limit)throw Error('Value outside divergence scale');const y=top+i*rh,w=Math.abs(r.value)/s.limit*half;h+=text(r.label,X,y,175,40,'dense')+rect(r.value<0?cx-w:cx,y,w,30,r.value<0?'var(--series-2)':'var(--series-0)')+text((r.value>0?'+':'')+r.value,r.value<0?cx-w-55:cx+w+8,y,50,35,'dense',r.value<0?'right':'left');});h+=note(s.note,top+rh*s.rows.length+15);
 }else if(s.pattern==='mekko'){
  const total=s.groups.reduce((a,b)=>a+b.total,0),px=X+55,pw=BW-80,py=Y+80,ph=285;let xx=px;
  if(!(total>0))throw Error('Positive total required');
  s.groups.forEach(g=>{if(!(g.total>0)||Math.abs(g.parts.reduce((a,b)=>a+b.value,0)-100)>.01)throw Error('Mekko shares must sum to 100');const w=g.total/total*pw;h+=text(g.label+'：'+g.total,xx,Y+25,w,40,'heading','center');let yy=py;
   g.parts.forEach((p,i)=>{const hh=p.value/100*ph;h+=box(p.label+' '+p.value+'%',xx,yy,w,hh,{fill:`var(--series-${i})`,bold:false,color:i===0?'var(--background)':'var(--text)'});yy+=hh;});h+=line(xx,py,xx,py+ph,'var(--background)',2);xx+=w;});h+=note(s.note,py+ph+18);
 }else if(s.pattern==='compare'){
  const cols=columns(s.columns.length);cols.forEach((c,i)=>{const v=s.columns[i];h+=head(v.label,c.x,Y,c.w)+list([v.summary,...v.items],c.x,Y+85,c.w,290);});
 }else {const api={X,BW,W,L,G,text,box,list,line,rect,dot,head,note,columns,triangle,chevron};const extra=extended(s,Y,api)??compound(s,Y,api)??structured(s,Y,api);if(extra===null)throw Error('Unknown pattern: '+s.pattern);h+=extra;}
 return h;
}
for(const [i,s] of deck.slides.entries()){
 const widthMode=s.contentWidth||'wide';
 if(!['wide','standard'].includes(widthMode))throw Error('contentWidth must be wide or standard');
 BW=MAXW*(widthMode==='standard'?(L.standardBodyRatio??.88):1);X=(W-BW)/2;
 if(s.showPunch!==undefined&&typeof s.showPunch!=='boolean')throw Error('showPunch must be boolean');
 const hasPunch=s.pattern!=='cover'&&(s.showPunch??Boolean(s.punch));
 if(hasPunch&&(typeof s.punch!=='string'||!s.punch.trim()))throw Error('showPunch:true requires non-empty punch');
 const content=s.pattern==='cover'?cover(s):text(s.title,HX,L.titleY,MAXW,L.titleHeight,'title')+line(HX,L.ruleY,W-HX,L.ruleY,'var(--rule)')+(hasPunch?text(s.punch,HX,L.punchY,MAXW,L.bodyPunchY-L.punchY,'punch'):'')+render(s,hasPunch?L.bodyPunchY:L.bodyY);
 X=HX;BW=MAXW;
 html+=`<section id="slide-${i+1}" class="slide" data-pattern="${escape(s.pattern)}" data-punch="${hasPunch?'yes':'no'}" data-content-width="${widthMode}">${content}${footer(i+1)}</section>`;
}
const css=`*{box-sizing:border-box}body{margin:0;background:#e8eaed;color:var(--text);font-family:${font}}:root{${Object.entries(C).filter(([,v])=>!Array.isArray(v)).map(([k,v])=>`--${k}:${v};`).join('')}${C.series.map((v,i)=>`--series-${i}:${v};`).join('')}}.slide{position:relative;width:${W}px;height:${H}px;background:var(--background);margin:24px auto;overflow:hidden}.shape,p,.box,.list,.chevron{position:absolute}p{margin:0;white-space:normal;line-break:strict;word-break:normal;line-height:1.5}.title{font-size:${T.title}px;font-weight:400;line-height:1.4}.cover{font-size:${T.cover}px;font-weight:600;color:var(--coverText)}.punch{font-size:${T.punch}px}.heading{font-size:${T.heading}px}.heading{font-weight:600}.body{font-size:${T.body}px}.dense,.list li{font-size:${T.dense}px}.note{font-size:${T.note}px;color:var(--muted)}.footer{font-size:${T.footer}px;color:var(--muted)}.box{display:flex;align-items:center;justify-content:center;padding:${L.boxPaddingY}px ${L.boxPaddingX}px;border-radius:0;overflow:hidden}.box p{position:static;width:100%;font-size:${T.dense}px}.list{overflow:hidden}.list ul{margin:0;padding:0 0 0 20px}.list li{line-height:1.5;margin:0 0 10px}.chevron{display:flex;align-items:center;justify-content:center;padding:8px 22px;background:var(--surface);clip-path:polygon(0 0,calc(100% - 14px) 0,100% 50%,calc(100% - 14px) 100%,0 100%,14px 50%)}.chevron p{position:static;text-align:center;font-size:${T.heading}px;font-weight:600;width:100%}@media print{body{background:white}.slide{margin:0;break-after:page}}`;
await fs.writeFile(out,`<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>${escape(deck.title||'Slide patterns')}</title><style>${css}</style></head><body data-slide-japanese-font="${escape(master.fonts.japanese)}">${html}<script src="slide-layout.js"></script></body></html>`);
console.log(JSON.stringify({output:out,master:master.id,aspect,slides:deck.slides.length,width:W,height:H}));
