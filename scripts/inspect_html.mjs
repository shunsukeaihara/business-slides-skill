import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const args=Object.fromEntries(process.argv.slice(2).reduce((a,v,i,arr)=>v.startsWith('--')?[...a,[v.slice(2),arr[i+1]]]:a,[]));
if(!args.html||!args.out)throw new Error('Usage: node inspect_html.mjs --html deck.html --out qa-dir [--modules-dir node_modules] [--browser chrome-path]');
const require=createRequire(args['modules-dir']?path.join(path.resolve(args['modules-dir']),'_slide_loader.cjs'):import.meta.url);
const puppeteer=require('puppeteer');
const launch={headless:true};if(args.browser)launch.executablePath=args.browser;
const browser=await puppeteer.launch(launch);
try{
 const page=await browser.newPage();await page.setViewport({width:1100,height:800,deviceScaleFactor:1});
 await page.goto(pathToFileURL(path.resolve(args.html)).href,{waitUntil:'networkidle0'});
 await page.evaluate(()=>document.fonts.ready);
 const width=await page.evaluate(()=>Math.ceil(document.querySelector('.slide')?.getBoundingClientRect().width||1040));
 await page.setViewport({width:width+60,height:800,deviceScaleFactor:1});
 if(!await page.evaluate(()=>typeof window.slideCollect==='function'))await page.addScriptTag({path:path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../assets/slide-layout.js')});
 const manifest=await page.evaluate(()=>window.slideCollect());await fs.mkdir(args.out,{recursive:true});
 await fs.writeFile(path.join(args.out,'layout.json'),JSON.stringify(manifest,null,2));
 for(const [i,slide] of (await page.$$('.slide')).entries())await slide.screenshot({path:path.join(args.out,`slide-${i+1}.png`)});
 console.log(JSON.stringify({slides:manifest.slideCount,containers:manifest.boxes.length,issues:manifest.issues}));
 if(manifest.issues.length)process.exitCode=1;
}finally{await browser.close();}
