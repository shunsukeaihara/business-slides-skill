"""Create gallery previews from inspected HTML renders; requires Pillow."""
from pathlib import Path
from PIL import Image
import argparse
p=argparse.ArgumentParser();p.add_argument('--standard',required=True);p.add_argument('--wide',required=True);p.add_argument('--out',required=True);a=p.parse_args();out=Path(a.out);out.mkdir(parents=True,exist_ok=True)
for label,folder in [('standard',a.standard),('wide',a.wide)]:
    images=sorted(Path(folder).glob('slide-*.png'),key=lambda x:int(x.stem.split('-')[-1]))
    if not images:raise ValueError(f'No rendered slide images in {folder}')
    for src in images:
        im=Image.open(src).convert('RGB');im.thumbnail((640,444));im.save(out/f'{label}-{src.stem.split("-")[-1]}.webp',quality=88)
    print(f'{label}: {len(images)} previews')
