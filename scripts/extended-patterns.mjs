/** Generic layouts: all geometry and visual roles come from the selected master. */
export function extended(s,Y,a){
 const {X,BW,W,L,G,text,box,list,line,rect,dot,head,note,columns,triangle,chevron}=a;
 const connect=(x,y,x2,y2)=>line(x,y,x2,y2,'var(--connector)',1.5);
 let h=''; const bottom=L.bodyBottom;
 if(s.pattern==='process'){
  const R=100,cs=columns(s.stages.length,R);
  h+=text('作業',X,Y+120,R,35,'heading')+text('成果物',X,Y+350,R,35,'heading');
  cs.forEach((c,i)=>{const v=s.stages[i];h+=chevron(v.label,c.x,Y,c.w,65)+list(v.items,c.x,Y+115,c.w,155)+triangle(c.x+c.w*.3,Y+300,c.w*.4,14)+box(v.result,c.x,Y+345,c.w,95);});
 }else if(s.pattern==='timeline'){
  const cs=columns(s.events.length),cy=Y+160;h+=line(X+20,cy,W-X-20,cy,'var(--connector)',2);
  cs.forEach((c,i)=>{const v=s.events[i],cx=c.x+c.w/2;h+=text(v.date,c.x,Y+70,c.w,40,'heading','center')+dot(cx,cy,7,'var(--connector)')+text(v.label,c.x,cy+40,c.w,65,'heading','center')+list(v.items,c.x,cy+135,c.w,140);});
 }else if(s.pattern==='gantt'||s.pattern==='swimlane'){
  const R=175,cs=columns(s.periods.length,R),rh=84;
  cs.forEach((c,i)=>h+=head(s.periods[i],c.x,Y,c.w));
  s.rows.forEach((r,i)=>{const yy=Y+75+i*rh;h+=box(r.label,X,yy,R,rh-16);cs.forEach(c=>h+=line(c.x,yy+rh-10,c.x+c.w,yy+rh-10));r.spans.forEach(v=>{const c=cs[v.start],last=cs[v.end];h+=box(v.label,c.x,yy+6,last.x+last.w-c.x,rh-28,{fill:v.secondary?'var(--surface)':'transparent',border:!v.secondary,bold:false});});});
 }else if(s.pattern==='beforeafter'){
  const cs=columns(2,125);cs.forEach((c,i)=>h+=head(s.columns[i],c.x,Y,c.w));
  s.rows.forEach((r,i)=>{const yy=Y+80+i*125;h+=box(r.label,X,yy,125,100);r.cells.forEach((v,j)=>h+=text(v,cs[j].x,yy+13,cs[j].w,85,'dense'));});
 }else if(s.pattern==='issue-tree'){
  // Center the diagram's intrinsic footprint, not an empty full-width text area.
  const desired=s.diagramColumns||[220,240,220],gap=52;
  if(desired.length!==3||desired.some(v=>!Number.isFinite(v)||v<=0))throw Error('diagramColumns must contain three positive widths');
  const scale=Math.min(1,BW/(desired.reduce((a,b)=>a+b,0)+gap*2));
  const [rw,mw,lw]=desired.map(v=>v*scale),cg=gap*scale,dw=rw+mw+lw+cg*2;
  const left=X+(BW-dw)/2,rx=left+rw+cg,lx=rx+mw+cg,rh=140;
  const first=Y+65,last=first+(s.branches.length-1)*rh,cy=(first+last)/2;
  h+=box(s.root,left,cy-50,rw,100,{border:true,fill:'transparent'});
  h+=connect(left+rw,cy,rx-cg/2,cy)+connect(rx-cg/2,first,rx-cg/2,last);
  s.branches.forEach((v,i)=>{const yy=Y+15+i*rh;h+=connect(rx-cg/2,yy+50,rx,yy+50)+box(v.label,rx,yy,mw,100)+connect(rx+mw,yy+50,lx-12,yy+50)+list(v.items,lx,yy+12,lw,100);});
 }else if(s.pattern==='hierarchy'){
  const cs=columns(s.groups.length),rw=BW*.34,rx=X+(BW-rw)/2;
  h+=box(s.root,rx,Y,rw,65,{fill:'transparent',border:true})+connect(W/2,Y+65,W/2,Y+105);
  h+=connect(cs[0].x+cs[0].w/2,Y+105,cs.at(-1).x+cs.at(-1).w/2,Y+105);
  cs.forEach((c,i)=>{h+=connect(c.x+c.w/2,Y+105,c.x+c.w/2,Y+145)+box(s.groups[i].label,c.x,Y+145,c.w,65)+list(s.groups[i].items,c.x,Y+245,c.w,160);});
 }else if(s.pattern==='hub'){
  const cw=BW*.27,ch=90,cx=X+(BW-cw)/2,cy=Y+195,sw=BW*.27;
  const pos=[[X,Y+35],[W-X-sw,Y+35],[X,Y+355],[W-X-sw,Y+355]];
  pos.forEach(([xx,yy],i)=>{const right=xx>cx;h+=connect(right?cx+cw:cx,cy+ch/2,right?xx:xx+sw,yy+40);});
  h+=box(s.center,cx,cy,cw,ch,{border:true,fill:'transparent'});
  pos.forEach(([xx,yy],i)=>h+=box(s.nodes[i].label,xx,yy,sw,70)+text(s.nodes[i].relation,xx,yy+80,sw,50,'dense','center'));
 }else if(s.pattern==='layers'){
  s.layers.forEach((v,i)=>{const yy=Y+i*105;h+=box(v.label,X,yy,BW*.25,80)+text(v.body,X+BW*.25+G,yy+15,BW*.75-G,65,'dense')+line(X+BW*.25+G,yy+90,W-X,yy+90);});
 }else if(s.pattern==='decision'){
  const rw=BW*.28,cx=X+(BW-rw)/2;h+=box(s.question,cx,Y,rw,85,{border:true,fill:'transparent'});
  const cs=columns(2);h+=connect(W/2,Y+85,W/2,Y+125)+connect(cs[0].x+cs[0].w/2,Y+125,cs[1].x+cs[1].w/2,Y+125);
  cs.forEach((c,i)=>{h+=connect(c.x+c.w/2,Y+125,c.x+c.w/2,Y+190)+text(s.branches[i].condition,c.x,Y+135,c.w,40,'note','center')+box(s.branches[i].action,c.x,Y+190,c.w,75)+list(s.branches[i].items,c.x,Y+310,c.w,140);});
 }else if(s.pattern==='quadrant'){
  const px=X+95,py=Y+35,pw=BW-130,ph=390;
  h+=line(px,py+ph,px+pw,py+ph,'var(--rule)')+line(px,py,px,py+ph,'var(--rule)')+line(px+pw/2,py,px+pw/2,py+ph)+line(px,py+ph/2,px+pw,py+ph/2);
  s.cells.forEach((v,i)=>{const xx=px+(i%2)*pw/2,yy=py+Math.floor(i/2)*ph/2;h+=text(v.label,xx+20,yy+18,pw/2-40,40,'heading','center')+text(v.body,xx+25,yy+78,pw/2-50,85,'dense','center');});
  h+=text(s.yLabel,X,py,85,110,'dense','center')+text('低',X,py+ph-35,85,35,'note','center')+text(s.xLabel,px,py+ph+25,pw,35,'dense','center')+text('高',px+pw-40,py+ph+25,40,35,'note','right');
 }else if(['bars','stacked','line-chart','scatter','slope','waterfall','pareto','heatmap'].includes(s.pattern)){
  const px=X+90,py=Y+40,pw=BW-155,ph=330,base=py+ph;
  if(s.pattern==='bars'){
   const left=X+190,width=BW-280,rh=75;
   s.rows.forEach((r,i)=>{const yy=Y+30+i*rh;h+=text(r.label,X,yy,170,38,'dense')+rect(left,yy,r.value/s.max*width,32)+text(r.value,left+r.value/s.max*width+10,yy,70,35,'dense');});
   h+=line(left,Y+15,left,Y+30+s.rows.length*rh-25)+note(s.note,Y+30+s.rows.length*rh+12);
  }else if(s.pattern==='stacked'){
   const left=X+150,width=BW-200;
   s.rows.forEach((r,i)=>{let xx=left;const yy=Y+70+i*90;h+=text(r.label,X,yy,135,40,'dense');if(Math.abs(r.values.reduce((a,b)=>a+b,0)-100)>.01)throw Error('Stacked shares must sum to 100');r.values.forEach((v,j)=>{h+=box(v+'%',xx,yy,width*v/100,48,{fill:`var(--series-${j})`,color:j===0?'var(--background)':'var(--text)',bold:false});xx+=width*v/100;});});
   s.series.forEach((v,i)=>h+=rect(left+i*width/s.series.length,Y+5,15,15,`var(--series-${i})`)+text(v,left+24+i*width/s.series.length,Y,width/s.series.length-24,35,'note'));h+=note(s.note,Y+70+s.rows.length*90+12);
  }else if(s.pattern==='heatmap'){
   const cs=columns(s.columns.length,165);cs.forEach((c,i)=>h+=head(s.columns[i],c.x,Y,c.w));
   s.rows.forEach((r,i)=>{const yy=Y+75+i*80;h+=text(r.label,X,yy+15,150,40,'dense');r.values.forEach((v,j)=>h+=box(v,cs[j].x,yy,cs[j].w,65,{fill:`var(--series-${3-v})`,color:v===3?'var(--background)':'var(--text)',bold:false}));});h+=note(s.note,Y+90+s.rows.length*80);
  }else if(s.pattern==='slope'){
   const left=px+80,right=px+pw-80,scale=v=>base-v/s.max*ph;
   h+=head(s.periods[0],left-80,Y-5,160)+head(s.periods[1],right-80,Y-5,160);
   s.rows.forEach((r,i)=>{const yy1=scale(r.values[0]),yy2=scale(r.values[1]);h+=line(left,yy1,right,yy2,`var(--series-${i})`,3)+dot(left,yy1,5,`var(--series-${i})`)+dot(right,yy2,5,`var(--series-${i})`)+text(r.label+' '+r.values[0],X,yy1-16,left-X-15,35,'dense','right')+text(r.values[1],right+16,yy2-16,70,35,'dense');});h+=note(s.note,base+50);
  }else{
   const max=s.max,sy=v=>base-v/max*ph;
   [0,max/2,max].forEach(v=>h+=line(px,sy(v),px+pw,sy(v))+text(v,X+10,sy(v)-14,65,30,'note','right'));
   h+=line(px,py,px,base,'var(--rule)');
   if(s.pattern==='line-chart'){
    s.periods.forEach((v,i)=>h+=text(v,px+i*pw/(s.periods.length-1)-35,base+15,70,30,'note','center'));
    s.series.forEach((v,j)=>{v.values.forEach((val,i)=>{const xx=px+i*pw/(v.values.length-1),yy=sy(val);if(i)h+=line(px+(i-1)*pw/(v.values.length-1),sy(v.values[i-1]),xx,yy,`var(--series-${j})`,3);h+=dot(xx,yy,5,`var(--series-${j})`);});h+=rect(px+j*220,base+68,24,3,`var(--series-${j})`)+text(v.label,px+35+j*220,base+55,175,35,'note');});
   }else if(s.pattern==='scatter'){
    [0,s.xMax/2,s.xMax].forEach(v=>h+=text(v,px+v/s.xMax*pw-30,base+15,60,30,'note','center'));
    s.points.forEach(v=>{const xx=px+v.x/s.xMax*pw,yy=sy(v.y);h+=dot(xx,yy,7)+text(v.label,xx+11,yy-15,100,35,'dense');});h+=text(s.xLabel,px,base+55,pw,35,'dense','center')+text(s.yLabel,X,py-35,175,30,'note');
   }else if(s.pattern==='waterfall'){
    const bw=pw/s.values.length*.55;let total=0;
    s.values.forEach((v,i)=>{const prev=total;total=v.total?v.value:total+v.value;const start=v.total?0:prev,xx=px+(i+.2)*pw/s.values.length,top=sy(Math.max(start,total)),hh=Math.abs(total-start)/max*ph;h+=rect(xx,top,bw,hh,v.total?'var(--series-0)':'var(--series-2)')+text(v.total?total:(v.value>0?'+':'')+v.value,xx-10,top-30,bw+20,30,'note','center')+text(v.label,xx-20,base+15,bw+40,55,'dense','center');if(i<s.values.length-1)h+=line(xx+bw,sy(total),px+(i+1.2)*pw/s.values.length,sy(total));});
   }else if(s.pattern==='pareto'){
    const total=s.rows.reduce((a,b)=>a+b.value,0),step=pw/s.rows.length,bw=step*.55;let cum=0,prev;
    s.rows.forEach((v,i)=>{const xx=px+(i+.5)*step;h+=rect(xx-bw/2,sy(v.value),bw,v.value/max*ph,'var(--series-2)')+text(v.value,xx-30,sy(v.value)-28,60,30,'note','center')+text(v.label,xx-step/2,base+15,step,35,'dense','center');cum+=v.value;const yy=base-cum/total*ph;if(prev)h+=line(prev.x,prev.y,xx,yy,'var(--series-0)',2);h+=dot(xx,yy,5);prev={x:xx,y:yy};});
    [0,50,100].forEach(v=>h+=text(v+'%',px+pw+8,base-v/100*ph-14,60,30,'note'));h+=text('件数',X,py-35,80,30,'note')+text('累積比率',px+pw-90,py-35,160,30,'note','right');
   }
   if(s.note)h+=note(s.note,base+(s.pattern==='line-chart'?100:100));
  }
 }else return null;
 return h;
}
