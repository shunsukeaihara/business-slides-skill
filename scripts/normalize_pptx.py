"""Normalize explicitly marked HTML text containers into editable PPTX shapes.
Requires lxml. Does not touch unmarked objects. Refuses ambiguous destructive merges.
"""
import argparse,json,re,copy
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree as E
NS={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','p':'http://schemas.openxmlformats.org/presentationml/2006/main'}
def sub(parent,tag,**attrs):
 prefix,local=tag.split(':');return E.SubElement(parent,'{'+NS[prefix]+'}'+local,**{k:str(v) for k,v in attrs.items()})
def bbox(sp):
 xf=sp.find('p:spPr/a:xfrm',NS)
 if xf is None:return None
 off=xf.find('a:off',NS);ext=xf.find('a:ext',NS)
 return [int(n.get(k)) for n,k in [(off,'x'),(off,'y'),(ext,'cx'),(ext,'cy')]]
def plain(sp):return ''.join(sp.xpath('.//a:t/text()',namespaces=NS))
def normalized(s):return re.sub(r'\s+','',s).replace('•','')
def emu(v):return round(v*9525)
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--input',required=True);parser.add_argument('--layout',required=True);parser.add_argument('--output',required=True);parser.add_argument('--overwrite',action='store_true');args=parser.parse_args()
 target=Path(args.output)
 if target.exists() and not args.overwrite:raise SystemExit('Output exists; choose another path or explicitly pass --overwrite.')
 manifest=json.loads(Path(args.layout).read_text());assert not manifest.get('issues'), 'Resolve HTML inspection issues first'
 assert (manifest['width'],manifest['height']) in [(1040,720),(1280,720)], 'Unsupported HTML size'
 with ZipFile(args.input) as z:entries=[(i,z.read(i.filename)) for i in z.infolist()]
 presentation=E.fromstring(next(data for entry,data in entries if entry.filename=='ppt/presentation.xml'))
 size=presentation.find('p:sldSz',NS)
 assert size is not None and all(abs(int(size.get(k))-emu(manifest[d]))<100 for k,d in [('cx','width'),('cy','height')]), 'PPTX size must match HTML at 96 px/inch; re-export with correct size'
 slide_count=len([entry for entry,data in entries if re.fullmatch(r'ppt/slides/slide\d+\.xml',entry.filename)])
 assert slide_count==manifest['slideCount'], 'Slide count does not match manifest'
 changed=[];result=[]
 for entry,data in entries:
  match=re.fullmatch(r'ppt/slides/slide(\d+)\.xml',entry.filename)
  boxes=[b for b in manifest['boxes'] if match and b['slide']==int(match[1])]
  shapes=[s for s in manifest.get('shapes',[]) if match and s['slide']==int(match[1])]
  if boxes or shapes:
   root=E.fromstring(data);tree=root.find('p:cSld/p:spTree',NS)
   for box in boxes:
    x,y,w,h=[emu(box[k]) for k in ('x','y','w','h')];inside=[]
    for sp in tree.findall('p:sp',NS):
     bb=bbox(sp)
     if not bb:continue
     xx,yy,ww,hh=bb
     if xx>=x-120 and yy>=y-120 and xx+ww<=x+w+120 and yy+hh<=y+h+120:inside.append(sp)
    textshapes=[sp for sp in inside if plain(sp)]
    assert textshapes,('No exported text found',box)
    expected=''.join(p['text'] for p in box['paragraphs'])
    actual=''.join(plain(s) for s in textshapes)
    assert normalized(expected)==normalized(actual),('Ambiguous text containment; refusing merge',box,actual)
    # Match the exact background, or keep the exported text shape for transparent containers.
    exact=[sp for sp in inside if all(abs(a-b)<120 for a,b in zip(bbox(sp),(x,y,w,h))) and sp.find('p:spPr/a:solidFill',NS) is not None]
    assert len(exact)<=1,('Ambiguous backgrounds',box)
    base=exact[0] if exact else textshapes[0];sp=copy.deepcopy(base)
    sp.find('p:nvSpPr/p:cNvPr',NS).set('name',f'Slide container {len(changed)+1}')
    pr=sp.find('p:spPr',NS)
    for child in list(pr):pr.remove(child)
    xf=sub(pr,'a:xfrm');sub(xf,'a:off',x=x,y=y);sub(xf,'a:ext',cx=w,cy=h)
    geometry=box.get('geometry','rect')
    if geometry in ['down-chevron','down-pentagon']:
     g=sub(pr,'a:custGeom');sub(g,'a:avLst');sub(g,'a:gdLst');sub(g,'a:ahLst');sub(g,'a:cxnLst');sub(g,'a:rect',l='0',t='0',r='r',b='b')
     tip=round(box['tip']/box['h']*100000)
     pts=[(0,0)]+([(50000,tip)] if geometry=='down-chevron' else [])+[(100000,0),(100000,100000-tip),(50000,100000),(0,100000-tip)]
     path=sub(sub(g,'a:pathLst'),'a:path',w=100000,h=100000)
     for j,(px,py) in enumerate(pts):sub(sub(path,'a:moveTo' if j==0 else 'a:lnTo'),'a:pt',x=px,y=py)
     sub(path,'a:close')
    else:sub(sub(pr,'a:prstGeom',prst=geometry),'a:avLst')
    if box['fill']:sub(sub(pr,'a:solidFill'),'a:srgbClr',val=box['fill'])
    else:sub(pr,'a:noFill')
    ln=sub(pr,'a:ln',w=emu(box.get('borderWidth',0)))
    if box['border']:sub(sub(ln,'a:solidFill'),'a:srgbClr',val=box['border'])
    else:sub(ln,'a:noFill')
    old=sp.find('p:txBody',NS)
    if old is not None:sp.remove(old)
    body=sub(sp,'p:txBody');top,right,bottom,left=box['padding']
    bp=sub(body,'a:bodyPr',wrap='square',anchor=box['valign'],lIns=emu(left),rIns=emu(right),tIns=emu(top),bIns=emu(bottom));sub(bp,'a:noAutofit');sub(body,'a:lstStyle')
    for item in box['paragraphs']:
     p=sub(body,'a:p');indent=emu(box['bulletIndent']) if item['bullet'] else 0
     pp=sub(p,'a:pPr',algn=item['align'],marL=indent,indent=-indent,eaLnBrk=1,latinLnBrk=0,hangingPunct=1)
     sub(sub(pp,'a:lnSpc'),'a:spcPts',val=round(item['lineHeight']*75));sub(sub(pp,'a:spcAft'),'a:spcPts',val=round(item['after']*75))
     if item['bullet']:sub(pp,'a:buFont',typeface='Arial');sub(pp,'a:buChar',char='•')
     else:sub(pp,'a:buNone')
     for i,line in enumerate(item['text'].split('\n')):
      if i:sub(p,'a:br')
      run=sub(p,'a:r');rp=sub(run,'a:rPr',lang='ja-JP',sz=round(item['size']*75),b=int(item['bold']))
      sub(sub(rp,'a:solidFill'),'a:srgbClr',val=item['color']);sub(rp,'a:latin',typeface=box.get('latinFont','Arial'));sub(rp,'a:ea',typeface=box['eaFont']);sub(run,'a:t').text=line
     sub(p,'a:endParaRPr',lang='ja-JP',sz=round(item['size']*75))
    remove=textshapes+([exact[0]] if exact and exact[0] not in textshapes else [])
    index=min(tree.index(el) for el in remove)
    for el in remove:tree.remove(el)
    tree.insert(index,sp)
    assert len(sp.findall('p:txBody/a:p/a:pPr/a:buChar',NS))==sum(p['bullet'] for p in box['paragraphs'])
    changed.append({'slide':box['slide'],'text':expected,'paragraphs':len(box['paragraphs']),'bullets':sum(p['bullet'] for p in box['paragraphs'])})
   for shape in shapes:
    assert shape['type']=='chevron', 'Unsupported marked geometry'
    expected=[emu(shape[k]) for k in ('x','y','w','h')]
    candidates=[sp for sp in tree.findall('p:sp',NS) if bbox(sp) and all(abs(a-b)<120 for a,b in zip(bbox(sp),expected)) and sp.find('p:spPr/a:solidFill',NS) is not None and not plain(sp)]
    assert len(candidates)==1, ('Ambiguous chevron background',shape)
    pr=candidates[0].find('p:spPr',NS)
    for geom in list(pr):
     if E.QName(geom).localname in ['prstGeom','custGeom']:pr.remove(geom)
    geom=E.Element('{'+NS['a']+'}prstGeom',prst='chevron');av=sub(geom,'a:avLst');sub(av,'a:gd',name='adj',fmla='val '+str(round(shape['notch']/min(shape['w'],shape['h'])*100000)))
    pr.insert(1,geom)
   data=E.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True)
  result.append((entry,data))
 assert len(changed)==len(manifest['boxes'])
 target.parent.mkdir(parents=True,exist_ok=True)
 with ZipFile(target,'w',ZIP_DEFLATED) as out:
  for entry,data in result:out.writestr(entry,data)
 print(json.dumps({'containers':len(changed),'bulletParagraphs':sum(c['bullets'] for c in changed)},ensure_ascii=False))
if __name__=='__main__':main()
