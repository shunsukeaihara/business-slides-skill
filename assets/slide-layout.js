/* Portable layout inspection. Load after the slide DOM. */
window.slideCollect = () => {
  const number = v => parseFloat(v) || 0;
  const color = v => { const m = v.match(/[\d.]+/g); return !m || (m.length === 4 && +m[3] === 0) ? null : m.slice(0,3).map(x => Math.round(+x).toString(16).padStart(2,'0')).join('').toUpperCase(); };
  const boxes = [], shapes = [], issues = [];
  const slides = [...document.querySelectorAll('.slide')];
  const first=slides[0]?.getBoundingClientRect();
  const width=first?.width||0,height=first?.height||0;
  if(!slides.length)issues.push({problem:'no-slides'});
  if(![[1040,720],[1280,720]].some(([w,h])=>Math.abs(width-w)<1&&Math.abs(height-h)<1))issues.push({problem:'unsupported-slide-size',width,height});
  slides.forEach((slide,index) => {
    const sr = slide.getBoundingClientRect();
    if (Math.abs(sr.width-width)>1 || Math.abs(sr.height-height)>1) issues.push({slide:index+1, problem:'mixed-slide-size'});
    for (const el of slide.querySelectorAll('[data-slide-native]')) {
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      if (el.parentElement.closest('[data-slide-native]')) { issues.push({slide:index+1,problem:'nested-native-containers'}); continue; }
      const list = el.matches('ul,ol') ? el : el.querySelector('ul,ol');
      const nodes = list ? [...list.children].filter(x => x.matches('li')) : [...el.children].filter(x => x.matches('p'));
      if (!nodes.length || el.querySelector('img,svg,canvas,ul ul,ol ol')) { issues.push({slide:index+1,problem:'unsupported-native-content'}); continue; }
      const paragraphs = nodes.map(p => {
        const s = getComputedStyle(p);
        return {text:p.innerText,bullet:!!list,size:number(s.fontSize),bold:+s.fontWeight>=600,color:color(s.color)||'111111',align:s.textAlign === 'center'?'ctr':s.textAlign === 'right'?'r':'l',lineHeight:number(s.lineHeight)||number(s.fontSize)*1.5,after:number(s.marginBottom)};
      });
      boxes.push({geometry:['ellipse','down-chevron','down-pentagon'].includes(el.dataset.slideShape)?el.dataset.slideShape:'rect',tip:number(el.dataset.tip),slide:index+1,x:r.x-sr.x,y:r.y-sr.y,w:r.width,h:r.height,fill:color(cs.backgroundColor),border:number(cs.borderTopWidth)&&cs.borderTopStyle!=='none'?color(cs.borderTopColor):null,borderWidth:number(cs.borderTopWidth),padding:[number(cs.paddingTop),number(cs.paddingRight),number(cs.paddingBottom),el===list?0:number(cs.paddingLeft)],valign:cs.alignItems==='center'?'ctr':cs.alignItems==='flex-end'?'b':'t',bulletIndent:list?number(getComputedStyle(list).paddingLeft)||18:0,paragraphs,latinFont:cs.fontFamily.split(',')[0].replace(/["']/g,'').trim(),eaFont:document.body.dataset.slideJapaneseFont||'Arial'});
    }
    for(const el of slide.querySelectorAll('[data-slide-shape="chevron"]')) {
      const r=el.getBoundingClientRect();shapes.push({slide:index+1,type:'chevron',x:r.x-sr.x,y:r.y-sr.y,w:r.width,h:r.height,notch:14});
    }
    for (const el of slide.querySelectorAll('p,li,[data-slide-native],img,svg')) {
      const r=el.getBoundingClientRect();
      if (r.left < sr.left-1 || r.top < sr.top-1 || r.right > sr.right+1 || r.bottom > sr.bottom+1) issues.push({slide:index+1,problem:'outside-slide',text:el.textContent.slice(0,60)});
      if ((el.matches('p,li,[data-slide-native]')) && (el.scrollHeight>el.clientHeight+2 || el.scrollWidth>el.clientWidth+2)) issues.push({slide:index+1,problem:'overflow',text:el.textContent.slice(0,60)});
    }
  });
  return {version:3,width,height,slideCount:slides.length,boxes,shapes,issues};
};
