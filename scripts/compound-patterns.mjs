/** Compound analytical layouts. Company styling is supplied by the master. */
export function compound(s,Y,a){
 const {X,BW,W,L,G,text,box,list,line,rect,dot,head,note,columns,triangle,chevron}=a;
 let h='';
 const join=(x,y,x2,y2)=>line(x,y,x2,y2,'var(--connector)',1.5);
 const dataLine=(x,y,x2,y2)=>line(x,y,x2,y2,'var(--series-0)',1.5);
 const circle=(x,y,r,color='var(--series-0)')=>dot(x,y,r,color);
 const bars=(vals,labels,x,y,w,height,max)=>{let o='';const step=w/vals.length,bw=step*.48;[0,max].forEach(v=>o+=text(v,x-38,y+height-v/max*height-12,30,30,'note','right'));o+=line(x,y+height,x+w,y+height);vals.forEach((v,i)=>{const xx=x+step*(i+.25),yy=y+height-v/max*height;o+=rect(xx,yy,bw,v/max*height,i===vals.length-1?'var(--series-0)':'var(--series-2)')+text(v,xx-12,yy-28,bw+24,28,'note','center')+text(labels[i],x+i*step,y+height+8,step,28,'note','center');});return o;};
 if(s.pattern==='strategy-map'){
  const cs=columns(3),rh=130;s.columns.forEach((v,i)=>h+=head(v,cs[i].x,Y,cs[i].w));
  s.rows.forEach((r,i)=>{const yy=Y+80+i*rh;h+=box(r.driver,cs[0].x,yy,cs[0].w,95,{bold:false})+box(r.response,cs[1].x,yy,cs[1].w,95,{fill:'transparent',border:true,bold:false})+box(r.outcome,cs[2].x,yy,cs[2].w,95,{fill:'transparent',bold:false,align:'left'});h+=join(cs[0].x+cs[0].w+4,yy+47,cs[1].x-5,yy+47)+join(cs[1].x+cs[1].w+4,yy+47,cs[2].x-5,yy+47);});
 }else if(s.pattern==='exchange'){
  const cs=columns(3);cs.forEach((c,i)=>h+=box(s.actors[i],c.x,Y+175,c.w,95,{fill:i===1?'var(--surface)':'transparent',border:i!==1}));
  for(let i=0;i<2;i++){const left=cs[i].x+cs[i].w*.65,right=cs[i+1].x+cs[i+1].w*.35;
   h+=join(left,Y+175,left,Y+105)+join(left,Y+105,right,Y+105)+join(right,Y+105,right,Y+175)+triangle(right-12,Y+161,24,9);
   h+=text(s.flows[i].forward,left,Y+45,right-left,52,'dense','center');
   h+=join(right,Y+270,right,Y+340)+join(right,Y+340,left,Y+340)+join(left,Y+340,left,Y+282)+triangle(left-12,Y+282,24,9,true)+text(s.flows[i].backward,left,Y+362,right-left,52,'dense','center');
  }
 }else if(s.pattern==='operating-model'){
  const R=145,cs=columns(s.columns.length,R);cs.forEach((c,i)=>h+=head(s.columns[i],c.x,Y,c.w));
  s.rows.forEach((r,i)=>{const yy=Y+75+i*95;h+=box(r.label,X,yy,R,74);r.cells.forEach((v,j)=>h+=box(v,cs[j].x,yy,cs[j].w,74,{fill:'transparent',border:false,bold:false}));});
  const yy=Y+75+s.rows.length*95+18;h+=box('共通基盤',X,yy,R,72)+box(s.foundation,cs[0].x,yy,W-X-cs[0].x,72,{fill:'transparent',border:true,bold:false});
 }else if(s.pattern==='maturity'){
  const cs=columns(s.stages.length,110);h+=text('状態',X,Y+105,110,40,'heading')+text('移行条件',X,Y+240,110,40,'heading')+text('位置づけ',X,Y+390,110,40,'heading');
  cs.forEach((c,i)=>{const v=s.stages[i];h+=chevron(v.label,c.x,Y,c.w,62)+text(v.state,c.x,Y+105,c.w,90,'dense')+list(v.conditions,c.x,Y+240,c.w,110)+box(v.position,c.x,Y+385,c.w,64,{fill:i===s.current?'var(--surface)':'transparent',border:i===s.target});});
 }else if(s.pattern==='pyramid-detail'){
  const pw=BW*.43,px=X+pw/2,top=Y+15,bottom=Y+420,left=X,right=X+pw,dx=right+G,dw=W-X-dx;
  h+=join(px,top,left,bottom)+join(left,bottom,right,bottom)+join(right,bottom,px,top);
  s.levels.forEach((v,i)=>{const yy=top+(i+1)*(bottom-top)/3,half=(yy-top)/(bottom-top)*pw/2;
   if(i<2)h+=line(px-half,yy,px+half,yy,'var(--connector)');
   const cy=top+(i+.65)*(bottom-top)/3;h+=text(v.label,px-pw*.3,cy-20,pw*.6,55,'dense','center')+head(v.heading,dx,top+i*135,dw)+text(v.body,dx,top+i*135+58,dw,65,'dense');});
 }else if(s.pattern==='portfolio-bubbles'||s.pattern==='portfolio-moves'){
  const px=X+85,py=Y+45,pw=BW-140,ph=335;
  h+=line(px,py+ph,px+pw,py+ph,'var(--rule)')+line(px,py,px,py+ph,'var(--rule)')+line(px+pw/2,py,px+pw/2,py+ph)+line(px,py+ph/2,px+pw,py+ph/2);
  h+=text(s.yLabel,X,Y-2,250,35,'note')+text(s.xLabel,px,py+ph+25,pw,35,'dense','center');
  s.points.forEach((v,i)=>{const xx=px+v.x/100*pw,yy=py+ph-v.y/100*ph,r=s.pattern==='portfolio-bubbles'?Math.sqrt(v.size)*2.2:9;
   if(v.to){const tx=px+v.to[0]/100*pw,ty=py+ph-v.to[1]/100*ph;h+=dataLine(xx,yy,tx,ty)+circle(tx,ty,4)+text('目標'+v.label,tx+10,ty-14,100,35,'note');}
   h+=circle(xx,yy,r,i===0?'var(--series-0)':'var(--series-1)')+text(v.label,xx-30,yy-r-35,60,30,'dense','center');});h+=note(s.note,py+ph+80);
 }else if(s.pattern==='portfolio-actions'){
  const left=BW*.55,px=X+55,py=Y+65,pw=left-80,ph=330,dx=X+left+G,dw=W-X-dx;
  h+=line(px,py,px,py+ph,'var(--rule)')+line(px,py+ph,px+pw,py+ph,'var(--rule)')+line(px+pw/2,py,px+pw/2,py+ph)+line(px,py+ph/2,px+pw,py+ph/2);
  h+=text(s.yLabel,X,Y,200,40,'note')+text(s.xLabel,px,py+ph+22,pw,35,'dense','center');
  s.groups.forEach((v,i)=>{const xx=px+v.x/100*pw,yy=py+ph-v.y/100*ph;h+=circle(xx,yy,9)+text(v.id,xx+14,yy-14,70,35,'dense')+head(v.id+'　'+v.action,dx,Y+i*145,dw)+text(v.body,dx,Y+60+i*145,dw,75,'dense');});
 }else if(s.pattern==='valuechain'){
  const R=135,cs=columns(s.stages.length,R);cs.forEach((c,i)=>h+=chevron(s.stages[i],c.x,Y,c.w,60));
  s.rows.forEach((r,i)=>{const yy=Y+90+i*92;h+=box(r.label,X,yy,R,72);r.cells.forEach((v,j)=>h+=box(v,cs[j].x,yy,cs[j].w,72,{fill:v==='重点'?'var(--surface)':'transparent',border:v==='重点',bold:v==='重点'}));});
  h+=note(s.note,Y+90+s.rows.length*92+10);
 }else if(s.pattern==='part-whole'){
  const cs=columns(2),py=Y+95,ph=290;
  h+=head(s.wholeLabel,cs[0].x,Y,cs[0].w)+head(s.partLabel,cs[1].x,Y,cs[1].w);
  let yy=py;const bw=cs[0].w*.45,bx=cs[0].x+cs[0].w*.24;
  s.whole.forEach((v,i)=>{const hh=v.value/100*ph;h+=box(v.label+' '+v.value+'%',bx,yy,bw,hh,{fill:i===s.selected?'var(--series-0)':'var(--surface)',color:i===s.selected?'var(--background)':'var(--text)',bold:false});if(i===s.selected){h+=line(bx+bw,yy,cs[1].x+35,py)+line(bx+bw,yy+hh,cs[1].x+35,py+ph);}yy+=hh;});
  yy=py;s.parts.forEach((v,i)=>{const hh=v.value/100*ph;h+=box(v.label+' '+v.value+'%',cs[1].x+35,yy,cs[1].w-70,hh,{fill:`var(--series-${i})`,color:i===0?'var(--background)':'var(--text)',bold:false});yy+=hh;});h+=note(s.note,py+ph+30);
 }else if(s.pattern==='small-multiples'){
  const cs=columns(2,100);s.columns.forEach((v,i)=>h+=head(v,cs[i].x,Y,cs[i].w));
  s.rows.forEach((r,i)=>{const yy=Y+80+i*200;h+=box(r.label,X,yy+20,100,95);r.charts.forEach((v,j)=>h+=bars(v,s.periods,cs[j].x+40,yy,cs[j].w-60,115,s.max));});
  h+=note(s.note,Y+495);
 }else if(s.pattern==='scenario-metrics'){
  const cs=columns(3,105);cs.forEach((c,i)=>h+=head(s.scenarios[i],c.x,Y,c.w));
  s.rows.forEach((r,i)=>{const yy=Y+80+i*185;h+=text(r.label,X,yy+25,105,65,'dense');r.values.forEach((vals,j)=>h+=bars(vals,s.periods,cs[j].x+38,yy,cs[j].w-48,110,r.max));});h+=note(s.note,Y+485);
 }else if(s.pattern==='annotated-trend'){
  const pw=BW*.59,px=X+48,py=Y+65,ph=300,dx=X+pw+G+35,dw=W-X-dx;
  [0,s.max/2,s.max].forEach(v=>h+=line(px,py+ph-v/s.max*ph,px+pw-50,py+ph-v/s.max*ph)+text(v,X,py+ph-v/s.max*ph-12,35,30,'note','right'));
  s.values.forEach((v,i)=>{const xx=px+i*(pw-50)/(s.values.length-1),yy=py+ph-v/s.max*ph;if(i)h+=dataLine(px+(i-1)*(pw-50)/(s.values.length-1),py+ph-s.values[i-1]/s.max*ph,xx,yy);h+=dot(xx,yy,4)+text(s.periods[i],xx-25,py+ph+16,50,30,'note','center');});
  s.callouts.forEach((v,i)=>{const xx=px+v.index*(pw-50)/(s.values.length-1),yy=py+ph-s.values[v.index]/s.max*ph;h+=box(i+1,xx-14,yy-46,30,30,{fill:'var(--surface)',bold:true,paddingX:0,paddingY:0})+head((i+1)+'　'+v.label,dx,Y+i*150,dw)+text(v.body,dx,Y+60+i*150,dw,75,'dense');});h+=note(s.note,py+ph+80);
 }else if(s.pattern==='survey-grid'){
  const cs=columns(2,125);s.columns.forEach((v,i)=>h+=head(v,cs[i].x,Y,cs[i].w));
  s.rows.forEach((r,i)=>{const yy=Y+80+i*105;h+=box(r.label,X,yy,125,70);r.values.forEach((vals,j)=>{let xx=cs[j].x;vals.forEach((v,k)=>{h+=box(v+'%',xx,yy+12,cs[j].w*v/100,46,{fill:`var(--series-${k})`,color:k===0?'var(--background)':'var(--text)',bold:false,paddingX:3,paddingY:6});xx+=cs[j].w*v/100;});});});
  const yy=Y+80+s.rows.length*105+15;s.legend.forEach((v,i)=>{h+=rect(X+150+i*220,yy+8,15,15,`var(--series-${i})`)+text(v,X+175+i*220,yy,190,35,'note');});h+=note(s.note,yy+52);
 }else if(s.pattern==='chart-quotes'){
  const left=BW*.47,half=(left-210)/2,cx=X+155+half,dx=X+left+G,dw=W-X-dx;h+=head('回答の割合',X,Y,left)+head('背景となるコメント',dx,Y,dw);
  h+=line(cx,Y+75,cx,Y+420);s.rows.forEach((r,i)=>{const yy=Y+95+i*110;h+=text(r.label,X,yy,100,45,'dense');const nw=r.negative/s.max*half,pw=r.positive/s.max*half;h+=rect(cx-nw,yy+10,nw,30,'var(--series-2)')+rect(cx,yy+10,pw,30)+text(r.negative+'%',cx-nw-48,yy+7,45,35,'note','right')+text(r.positive+'%',cx+pw+5,yy+7,48,35,'note')+text('「'+r.quote+'」',dx,yy-3,dw,80,'dense');});h+=note(s.note,Y+450);
 }else if(s.pattern==='benchmark-profile'){
  const left=X+170,right=W-X-70,pw=right-left,top=Y+70,rh=80;[1,2,3,4,5].forEach(v=>h+=text(v,left+(v-1)/4*pw-20,Y,40,30,'note','center'));
  const prev={};s.rows.forEach((r,i)=>{const yy=top+i*rh;h+=text(r.label,X,yy-15,155,40,'dense')+line(left,yy,right,yy);r.values.forEach((v,j)=>{const xx=left+(v-1)/4*pw;if(prev[j])h+=line(prev[j].x,prev[j].y,xx,yy,`var(--series-${j})`,2);h+=dot(xx,yy,6,`var(--series-${j})`);prev[j]={x:xx,y:yy};});});
  s.series.forEach((v,i)=>h+=rect(left+i*220,Y+430,25,3,`var(--series-${i})`)+text(v,left+35+i*220,Y+414,170,35,'note'));h+=note(s.note,Y+477);
 }else if(s.pattern==='paired-dots'){
  const left=X+165,right=W-X-100,pw=right-left;[0,s.max/2,s.max].forEach(v=>h+=text(v,left+v/s.max*pw-25,Y,50,30,'note','center'));
  s.rows.forEach((r,i)=>{const yy=Y+70+i*77,x1=left+r.values[0]/s.max*pw,x2=left+r.values[1]/s.max*pw;h+=text(r.label,X,yy-15,145,35,'dense')+line(x1,yy,x2,yy,'var(--series-2)',4)+dot(x1,yy,6,'var(--series-1)')+dot(x2,yy,6)+text((r.values[1]-r.values[0]>0?'+':'')+(r.values[1]-r.values[0]),right+20,yy-15,75,35,'dense');});
  s.series.forEach((v,i)=>h+=dot(left+i*240,Y+425,6,i===0?'var(--series-1)':'var(--series-0)')+text(v,left+15+i*240,Y+410,215,35,'note'));h+=note(s.note,Y+470);
 }else if(s.pattern==='segment-profiles'){
  const cs=columns(s.segments.length,110);cs.forEach((c,i)=>h+=head(s.segments[i].label,c.x,Y,c.w));
  s.fields.forEach((v,i)=>{const yy=Y+80+i*110;h+=box(v.label,X,yy,110,85);cs.forEach((c,j)=>h+=text(s.segments[j][v.key],c.x,yy+10,c.w,75,'dense'));});
 }else if(s.pattern==='workplan-deliverables'){
  const cs=columns(3,110);s.columns.forEach((v,i)=>h+=head(v,cs[i].x,Y,cs[i].w));
  s.rows.forEach((r,i)=>{const yy=Y+80+i*130;h+=box(r.label,X,yy,110,100)+list(r.tasks,cs[0].x,yy+8,cs[0].w,100)+text(r.method,cs[1].x,yy+8,cs[1].w,100,'dense')+box(r.output,cs[2].x,yy,cs[2].w,100,{fill:'transparent',border:true});});
 }else if(s.pattern==='dependency-map'){
  const cs=columns(s.stages.length,115);cs.forEach((c,i)=>h+=chevron(s.stages[i],c.x,Y,c.w,60));
  s.rows.forEach((r,i)=>{const yy=Y+95+i*125;h+=box(r.label,X,yy,115,80);r.cells.forEach((v,j)=>h+=box(v,cs[j].x,yy,cs[j].w,80,{fill:'var(--surface)',bold:false}));});
  s.dependencies.forEach(v=>{const c1=cs[v.from[1]],c2=cs[v.to[1]],y1=Y+95+v.from[0]*125+80,y2=Y+95+v.to[0]*125;const xx=(c1.x+c1.w+c2.x)/2;h+=join(c1.x+c1.w/2,y1,c1.x+c1.w/2,y1+22)+join(c1.x+c1.w/2,y1+22,c2.x+c2.w/2,y1+22)+join(c2.x+c2.w/2,y1+22,c2.x+c2.w/2,y2-10)+triangle(c2.x+c2.w/2-15,y2-10,30,8);});
 }else return null;
 return h;
}
