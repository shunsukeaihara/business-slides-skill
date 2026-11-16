#!/usr/bin/env python3
"""Read-only OOXML inventory; explicit values, not resolved presentation styles."""
import argparse
import json
import posixpath
import re
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as E

NS = {'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
      'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}

def relationships(z, part):
    rel = posixpath.join(posixpath.dirname(part), '_rels', posixpath.basename(part) + '.rels')
    if rel not in z.namelist():
        return {}
    result = {}
    for node in E.fromstring(z.read(rel)):
        external = node.get('TargetMode') == 'External'
        target = node.get('Target', '')
        resolved = target if external else posixpath.normpath(posixpath.join(posixpath.dirname(part), target))
        if target.startswith('/') and not external:
            resolved = target.lstrip('/')
        result[node.get('Id')] = {'type': node.get('Type', '').rsplit('/', 1)[-1],
                                 'target': resolved, 'external': external}
    return result

def inventory(source):
    with ZipFile(source) as z:
        pres = E.fromstring(z.read('ppt/presentation.xml'))
        sz = pres.find('p:sldSz', NS)
        cx, cy = int(sz.get('cx')), int(sz.get('cy'))
        themes = []
        for name in sorted(z.namelist()):
            if not re.fullmatch(r'ppt/theme/theme\d+\.xml', name):
                continue
            t = E.fromstring(z.read(name))
            colors = {}
            for node in t.findall('a:themeElements/a:clrScheme/*', NS):
                colors[node.tag.split('}')[-1]] = [
                    {'kind': c.tag.split('}')[-1], **c.attrib} for c in node]
            fonts = {}
            for kind in ['majorFont', 'minorFont']:
                node = t.find('a:themeElements/a:fontScheme/a:' + kind, NS)
                fonts[kind] = [] if node is None else [
                    {'kind': c.tag.split('}')[-1], **c.attrib} for c in node]
            themes.append({'part': name, 'name': t.get('name'), 'colors': colors, 'fonts': fonts})
        parts = []
        for name in sorted(z.namelist()):
            if not re.fullmatch(r'ppt/(slides/slide|slideLayouts/slideLayout|slideMasters/slideMaster)\d+\.xml', name):
                continue
            node = E.fromstring(z.read(name))
            rels = relationships(z, name)
            shapes = []
            for sp in node.findall('.//p:sp', NS) + node.findall('.//p:pic', NS):
                nv = sp.find('.//p:cNvPr', NS)
                ph = sp.find('.//p:ph', NS)
                xf = sp.find('p:spPr/a:xfrm', NS)
                geometry = None if xf is None else {c.tag.split('}')[-1]: c.attrib for c in xf}
                runs = []
                for run in sp.findall('.//a:r', NS):
                    rp = run.find('a:rPr', NS)
                    runs.append({'text': ''.join(run.itertext()),
                                 'properties': {} if rp is None else rp.attrib,
                                 'styleXml': None if rp is None else E.tostring(rp, encoding='unicode')})
                blip = sp.find('.//a:blip', NS)
                rid = None if blip is None else blip.get('{'+NS['r']+'}embed') or blip.get('{'+NS['r']+'}link')
                shapes.append({'name': None if nv is None else nv.get('name'),
                               'placeholder': None if ph is None else ph.attrib,
                               'localGeometryEMU': geometry,
                               'text': '\n'.join(''.join(p.itertext()) for p in sp.findall('.//a:p', NS)),
                               'runs': runs, 'image': rels.get(rid)})
            parts.append({'part': name, 'attributes': node.attrib, 'relationships': rels,
                          'shapes': shapes})
        return {'sourceName': Path(source).name,
                'limitations': ['Explicit OOXML only; inheritance and color transforms are not resolved.',
                                'Group transforms are not composed. Render to verify appearance.',
                                'No external relationship targets are fetched; no source content is executed.'],
                'size': {'cxEMU': cx, 'cyEMU': cy, 'widthInches': cx/914400,
                         'heightInches': cy/914400, 'aspectRatio': cx/cy},
                'presentationRelationships': relationships(z, 'ppt/presentation.xml'),
                'slideOrder': [s.get('{'+NS['r']+'}id') for s in pres.findall('p:sldIdLst/p:sldId', NS)],
                'themes': themes, 'parts': parts}

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('input', type=Path)
    ap.add_argument('--out', type=Path, required=True)
    args = ap.parse_args()
    if args.input.suffix.lower() not in ('.pptx', '.potx'):
        ap.error('Input must be PPTX or POTX')
    if args.out.exists():
        ap.error('Output exists; choose a new inventory filename')
    result = inventory(args.input)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'themes': len(result['themes']), 'parts': len(result['parts']),
                      'size': result['size']}, ensure_ascii=False))

if __name__ == '__main__':
    main()
