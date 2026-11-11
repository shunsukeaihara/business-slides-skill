/** Hierarchical grids: semantic grouping, not decorative nesting. */
export function structured(s,Y,a){
 const {X,BW,L,G,text,box,list,line,head,chevron,triangle,rect}=a;let h='';
 const edge=X+BW, H=Math.min(490,L.bodyBottom-Y), transparent={fill:'transparent',bold:false};
 if(s.pattern==='grouped-rows'){
  const widths=[.13,.20,.32,.35].map(v=>v*(BW-3*16)),xs=[X];widths.slice(0,-1).forEach(w=>xs.push(xs.at(-1)+w+16));
  s.columns.forEach((v,i)=>h+=head(v,xs[i],Y,widths[i]));const rh=(H-70)/s.rows.length;
  s.groups.forEach(v=>h+=box(v.label,X,Y+70+v.start*rh,widths[0],v.span*rh-12));
  s.rows.forEach((r,i)=>{let yy=Y+70+i*rh;h+=box(r.label,xs[1],yy,widths[1],rh-12,{fill:'transparent',border:true});h+=text(r.finding,xs[2],yy+8,widths[2],rh-20,'dense');});
  s.actions.forEach(v=>h+=box(v.text,xs[3],Y+70+v.start*rh,widths[3],v.span*rh-12,{...transparent,border:true,align:'left'}));
 }else if(s.pattern==='nested-columns'){
  const rw=BW*.18,cw=(BW-rw-4*16)/4,xx=X+rw+16;h+=head(s.rowHeading,X,Y+55,rw);
  s.groups.forEach((v,i)=>h+=head(v,xx+i*2*(cw+16),Y,2*cw+16));s.columns.forEach((v,i)=>h+=text(v,xx+i*(cw+16),Y+62,cw,38,'dense','center'));
  const rh=(H-120)/s.rows.length;s.rows.forEach((r,i)=>{const yy=Y+120+i*rh;h+=box(r.label,X,yy,rw,rh-12);r.cells.forEach((v,j)=>h+=box(v,xx+j*(cw+16),yy,cw,rh-12,transparent));h+=line(xx,yy+rh-6,edge,yy+rh-6);});
 }else if(s.pattern==='vertical-steps'){
  if(!Array.isArray(s.steps)||s.steps.length<2||s.steps.length>4)throw Error('vertical-steps requires 2–4 steps');
  const dw=Math.min(BW,960),left=X+(BW-dw)/2,nw=48,dx=left+nw+24,cw=dw-nw-24,gap=18,rh=(H-gap*(s.steps.length-1))/s.steps.length;
  s.steps.forEach((r,i)=>{const yy=Y+i*(rh+gap);
   if(i<s.steps.length-1)h+=line(left+nw/2,yy+48,left+nw/2,yy+rh+gap,'var(--line)',2);
   h+=box(String(i+1).padStart(2,'0'),left,yy,nw,48,{paddingX:2,paddingY:2});
   h+=text(r.label,dx,yy,cw,36,'heading')+list(r.tasks,dx,yy+43,cw,rh-43);
  });
 }else if(s.pattern==='vertical-arrow-steps'){
  if(!Array.isArray(s.steps)||s.steps.length<2||s.steps.length>4)throw Error('vertical-steps requires 2–4 steps');
  const three=s.columnsMode==='three',notched=s.arrowStyle==='chevron';
  const dw=Math.min(BW,1080),left=X+(BW-dw)/2,aw=three?140:250,hw=three?190:0,gap=24;
  const hx=left+aw+gap,dx=three?hx+hw+gap:hx,cw=left+dw-dx;
  h+=head(three?'ステップ':'工程',left,Y,aw);
  if(three)h+=head('見出し',hx,Y,hw);
  h+=head('主な作業',dx,Y,cw);
  const rowgap=12,rh=(H-65-rowgap*(s.steps.length-1))/s.steps.length;
  s.steps.forEach((r,i)=>{const yy=Y+65+i*(rh+rowgap),tip=16;
   const polygon=notched?`polygon(0 0,50% ${tip}px,100% 0,100% calc(100% - ${tip}px),50% 100%,0 calc(100% - ${tip}px))`:`polygon(0 0,100% 0,100% calc(100% - ${tip}px),50% 100%,0 calc(100% - ${tip}px))`;
   h+=box(three?r.short:r.label,left,yy,aw,rh,{paddingX:10,paddingY:22}).replace('class="box"',`class="box" data-slide-shape="${notched?'down-chevron':'down-pentagon'}" data-tip="${tip}"`).replace('padding:',`clip-path:${polygon};padding:`);
   if(three)h+=box(r.label,hx,yy,hw,rh,{fill:'transparent',paddingX:6});
   h+=list(r.tasks,dx,yy+18,cw,rh-24);
  });
 }else if(s.pattern==='vertical-process'){
  const widths=[.19,.44,.37].map(v=>v*(BW-2*G)),xs=[X,X+widths[0]+G,X+widths[0]+G+widths[1]+G];s.columns.forEach((v,i)=>h+=head(v,xs[i],Y,widths[i]));
  const rh=(H-70)/s.steps.length;s.steps.forEach((r,i)=>{const yy=Y+70+i*rh;h+=box(r.label,X,yy,widths[0],rh-26)+list(r.tasks,xs[1],yy+8,widths[1],rh-20)+box(r.output,xs[2],yy,widths[2],rh-26,{...transparent,border:true});if(i<s.steps.length-1)h+=triangle(X+widths[0]*.27,yy+rh-21,widths[0]*.46,10);});
 }else if(s.pattern==='classification-actions'){
  const w=[.17,.24,.24,.35].map(v=>v*(BW-3*G)),xs=[X];w.slice(0,-1).forEach(v=>xs.push(xs.at(-1)+v+G));s.columns.forEach((v,i)=>h+=head(v,xs[i],Y,w[i]));const yy=Y+80,rh=(H-80)/3;
  h+=box(s.total,X,yy,w[0],rh*3-12,{...transparent,border:true});h+=box(s.branches[0],xs[1],yy,w[1],rh-12)+box(s.branches[1],xs[1],yy+rh,w[1],rh*2-12);
  s.leaves.forEach((r,i)=>{h+=box(r.label,xs[2],yy+i*rh,w[2],rh-12,{...transparent,border:true})+text(r.action,xs[3],yy+i*rh+14,w[3],rh-25,'dense');});
 }else if(s.pattern==='numbered-narrative'){
  const nw=58,dx=X+nw+G,dw=BW-nw-G,rh=H/s.items.length;s.items.forEach((r,i)=>{const yy=Y+i*rh;h+=box(String(i+1),X,yy,nw,56,{fill:'var(--surface)'})+text(r.heading,dx,yy,dw,45,'heading')+list(r.items,dx,yy+58,dw,rh-75);});
 }else if(s.pattern==='workpackage'){
  const lw=(BW-G)*.62,rx=X+lw+G,rw=BW-lw-G;h+=head(s.activityHeading,X,Y,lw)+head(s.outputHeading,rx,Y,rw);const rh=(H-70)/s.activities.length;
  s.activities.forEach((r,i)=>{const yy=Y+70+i*rh;h+=text(r.label,X,yy,lw,38,'heading')+list(r.items,X,yy+43,lw,rh-50);if(i<s.activities.length-1)h+=line(X,yy+rh-8,X+lw,yy+rh-8);});
  h+=list(s.outputs,rx,Y+75,rw,210)+head(s.conditionHeading,rx,Y+300,rw)+list(s.conditions,rx,Y+365,rw,H-365);
 }else if(s.pattern==='share-explanation'){
  const lw=BW*.40,rx=X+lw+G,rw=BW-lw-G;h+=head(s.chartHeading,X,Y,lw)+head(s.detailHeading,rx,Y,rw);const top=Y+95,ph=290,bw=lw*.25,bx=[X+lw*.13,X+lw*.62];
  s.periods.forEach((p,i)=>{let yy=top;s.parts.forEach((r,k)=>{const v=r.values[i],hh=v/100*ph;h+=box(v+'%',bx[i],yy,bw,hh,{fill:`var(--series-${k})`,color:k===0?'var(--background)':'var(--text)',bold:false,paddingX:3,paddingY:3});yy+=hh;});h+=text(p,bx[i]-20,top+ph+12,bw+40,34,'dense','center');});
  let cum=[0,0];s.parts.slice(0,-1).forEach(r=>{cum=cum.map((v,i)=>v+r.values[i]);h+=line(bx[0]+bw,top+cum[0]/100*ph,bx[1],top+cum[1]/100*ph);});
  s.parts.forEach((r,i)=>{const yy=Y+80+i*125;h+=text(r.label,rx,yy,rw,35,'heading')+text(r.explanation,rx,yy+44,rw,75,'dense');});h+=text('構成比（例示）',X,top+ph+65,lw,30,'note','right');
 }else if(s.pattern==='stage-gate'){
  const rw=110,cw=(BW-rw-G-3*18)/4,xx=X+rw+G,rows=[['主な\n作業','tasks',160],['成果物','output',90],['移行条件','gate',115]];s.stages.forEach((r,i)=>h+=chevron(r.label,xx+i*(cw+18),Y,cw,62));
  let yy=Y+92;rows.forEach(([label,key,rh])=>{h+=box(label,X,yy,rw,rh-16);s.stages.forEach((r,i)=>{let x=xx+i*(cw+18);h+=Array.isArray(r[key])?list(r[key],x,yy+7,cw,rh-20):box(r[key],x,yy,cw,rh-16,{...transparent,border:key==='gate'});});yy+=rh;});
 }else if(s.pattern==='box-columns'){
  const rw=90,cw=(BW-rw-G-2*G)/3,xx=X+rw+G;
  h+=box(s.rowLabels[0],X,Y+110,rw,100)+box(s.rowLabels[1],X,Y+255,rw,185);
  s.columns.forEach((r,i)=>{let x=xx+i*(cw+G);h+=box(r.label,x,Y,cw,65)+box(r.summary,x,Y+110,cw,100,{...transparent,border:true})+list(r.items,x,Y+272,cw,155);});
 }else if(s.pattern==='circle-columns'){
  const cw=(BW-2*G)/3;
  s.columns.forEach((r,i)=>{let x=X+i*(cw+G),diam=128;h+=box(r.label,x+(cw-diam)/2,Y+5,diam,diam,{fill:'var(--surface)',paddingX:4}).replace('class="box"','class="box" data-slide-shape="ellipse"').replace('padding:','border-radius:50%;padding:');h+=head(r.heading,x,Y+180,cw)+list(r.items,x,Y+275,cw,160);});
 }else if(s.pattern==='nested-box-columns'){
  const cw=(BW-G)/2;
  s.columns.forEach((r,i)=>{let x=X+i*(cw+G);h+=box(r.label,x,Y,cw,66);r.children.forEach((v,j)=>{let yy=Y+95+j*180;h+=box(v.label,x,yy,cw*.37,148,{fill:'transparent',border:true})+list(v.items,x+cw*.37+20,yy+30,cw*.63-20,115);});});
 }else if(s.pattern==='label-columns'){
  const cw=(BW-2*G)/3;s.columns.forEach((r,i)=>{let x=X+i*(cw+G);h+=head(r.label,x,Y,cw);r.rows.forEach((v,j)=>{let yy=Y+85+j*130;h+=box(v.label,x,yy,66,92,{paddingX:3})+text(v.body,x+82,yy+12,cw-82,85,'dense');});});
 }else if(s.pattern==='table-dark-head'||s.pattern==='table-plain-head'){
  const ws=s.widths.map(v=>v*(BW-3*14)),xs=[X];ws.slice(0,-1).forEach(w=>xs.push(xs.at(-1)+w+14));
  s.columns.forEach((v,i)=>{h+=box(v,xs[i],Y,ws[i],74,{fill:s.pattern==='table-dark-head'?'var(--rule)':'transparent',color:s.pattern==='table-dark-head'?'var(--background)':'var(--text)',align:'left',paddingX:12});if(s.pattern==='table-plain-head')h+=line(xs[i],Y+76,xs[i]+ws[i],Y+76,'var(--rule)');});
  const rh=(H-96)/s.rows.length;s.rows.forEach((r,i)=>{let yy=Y+96+i*rh;h+=box(r.label,X,yy,ws[0],rh-12,{fill:'var(--surface)',align:'left'});r.cells.forEach((v,j)=>h+=text(v,xs[j+1]+12,yy+10,ws[j+1]-24,rh-24,'dense'));h+=line(X,yy+rh-4,edge,yy+rh-4);});
 }else if(s.pattern==='circle-row-columns'){
  const rw=150,cw=(BW-rw-G-2*G)/3,xx=X+rw+G;s.columns.forEach((v,i)=>h+=head(v,xx+i*(cw+G),Y,cw));const rh=(H-75)/s.rows.length;
  s.rows.forEach((r,i)=>{const yy=Y+75+i*rh;h+=box(r.label,X,yy+10,rw,rh-30,{paddingX:8}).replace('class="box"','class="box" data-slide-shape="ellipse"').replace('padding:','border-radius:50%;padding:');r.cells.forEach((v,j)=>h+=text(v,xx+j*(cw+G),yy+20,cw,rh-30,'dense'));h+=line(xx,yy+rh-2,edge,yy+rh-2);});
 }else if(s.pattern==='nested-summary'){
  const lw=180,dx=X+lw+G,dw=BW-lw-G,leadH=68,parentY=Y+leadH+18,parentH=62,childY=parentY+parentH+12;
  const weights=s.children.map(r=>r.weight||1),sum=weights.reduce((a,b)=>a+b,0),avail=H-(childY-Y);
  h+=box(s.overview.label,X,Y,lw,leadH)+text(s.overview.text,dx,Y+8,dw,leadH-8,'dense');
  h+=box(s.parent.label,X,parentY,lw,parentH)+text(s.parent.summary,dx,parentY+8,dw,parentH-8,'dense','left','font-weight:600');
  h+=rect(X,parentY+parentH,10,H-(parentY-Y)-parentH-12,'var(--surface)');
  let yy=childY;s.children.forEach((r,i)=>{const rh=avail*weights[i]/sum;h+=box(r.label,X+24,yy,lw-24,rh-12,{fill:'transparent',border:true})+text(r.claim,dx,yy+3,dw,40,'dense','left','font-weight:600');if(r.evidence?.length)h+=list(r.evidence,dx,yy+45,dw,rh-54);yy+=rh;});
 }else if(s.pattern==='nested-classification'){
  const depth=s.levels.length,gw=BW*.48,gap=12,cw=(gw-gap*(depth-1))/depth,dx=X+gw+G,mw=120,dw=BW-gw-G-mw-G,mx=dx+dw+G,top=Y+75;
  const leaves=n=>n.children?n.children.reduce((t,c)=>t+leaves(c),0):1;
  const count=s.roots.reduce((t,n)=>t+leaves(n),0),rh=(H-75)/count;
  s.levels.forEach((v,i)=>h+=head(v,X+i*(cw+gap),Y,cw));h+=head(s.detailHeading,dx,Y,dw)+head(s.metricHeading,mx,Y,mw);
  function visit(n,d,row){if(d>=depth)throw Error('Classification exceeds declared depth');const span=leaves(n),yy=top+row*rh,xx=X+d*(cw+gap);
   h+=box(n.label,xx,yy,n.children?cw:gw-d*(cw+gap),span*rh-12,{fill:d===0?'var(--surface)':'transparent',border:d>0});
   if(n.children){let next=row;n.children.forEach(c=>{visit(c,d+1,next);next+=leaves(c)});}else{h+=text(n.finding,dx,yy+12,dw,rh-24,'dense')+box(n.metric,mx,yy,mw,rh-12,{fill:'transparent'});h+=line(dx,yy+rh-5,edge,yy+rh-5);}
  }
  let row=0;s.roots.forEach(n=>{visit(n,0,row);row+=leaves(n)});
 }else return null;return h;
}
