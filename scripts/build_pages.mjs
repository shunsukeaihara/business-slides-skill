/** Build the public gallery using a fixed allowlist, never a repository-wide copy. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'_site');
await fs.mkdir(out,{recursive:true});
for(const name of ['assets','references'])await fs.cp(path.join(root,name),path.join(out,name),{recursive:true});
let html=await fs.readFile(path.join(root,'assets/gallery.html'),'utf8');
html=html.replaceAll('href="layout-gallery','href="assets/layout-gallery')
 .replaceAll('src="gallery-thumbs/','src="assets/gallery-thumbs/')
 .replaceAll("'layout-gallery-wide.html'","'assets/layout-gallery-wide.html'")
 .replaceAll("'layout-gallery.html'","'assets/layout-gallery.html'")
 .replaceAll("'gallery-thumbs/'","'assets/gallery-thumbs/'")
 .replaceAll('../references/gallery.md','references/gallery.md');
await fs.writeFile(path.join(out,'index.html'),html);
await fs.writeFile(path.join(out,'.nojekyll'),'');
console.log('Built public gallery in _site/');
