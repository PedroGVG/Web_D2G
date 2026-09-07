import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareRound, benchmarks, round } from '../js/demo-data.mjs';

const dist=fileURLToPath(new URL('../dist/',import.meta.url));
async function pages(dir=dist){const files=[];for(const entry of await readdir(dir,{withFileTypes:true})){if(['assets','css','js'].includes(entry.name))continue;const p=path.join(dir,entry.name);if(entry.isDirectory())files.push(...await pages(p));else if(entry.name.endsWith('.html'))files.push(p)}return files;}
test('Every benchmark compares the same round; returned values cannot mutate the sample',()=>{
  for(const reference of Object.keys(benchmarks)){
    const compared=compareRound(reference);
    assert.deepEqual(compared.round,round);
    assert.equal(compared.values.length,4);
    assert.equal(compared.focus,compared.values.indexOf(Math.min(...compared.values)));
    compared.values[0]=999;
    assert.notEqual(compareRound(reference).values[0],999);
  }
  assert.throws(()=>compareRound('invalid'),RangeError);
  assert.throws(()=>compareRound('__proto__'),RangeError);
});
test('All nine public pages have valid local links, resources, anchors, metadata and language routes',async()=>{
  const publicPages=await pages();
  assert.equal(publicPages.length,9);
  for(const file of publicPages){
    const html=await readFile(file,'utf8');
    const locale=file.includes(`${path.sep}en${path.sep}`)?'en':'es';
    assert.match(html,new RegExp(`<html lang="${locale}">`));
    assert.equal((html.match(/<h1[ >]/g)||[]).length,1,file);
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
    assert.equal(ids.length,new Set(ids).size,`Duplicate IDs in ${file}`);
    assert.match(html,/<link rel="canonical" href="https:\/\/data2gain.com\//);
    for(const m of html.matchAll(/\b(?:href|src|data-zoom)="([^"]*)"/g)){
      const value=m[1].replaceAll('&amp;','&');
      assert.ok(value && value!=='#',`Empty destination in ${file}`);
      if(!value.startsWith('/')&&!value.startsWith('#'))continue;
      const url=new URL(value,'https://data2gain.com/'+path.relative(dist,file).replaceAll(path.sep,'/'));
      let target=path.join(dist,decodeURIComponent(url.pathname));
      if(value.startsWith('#'))target=file;
      const info=await stat(target).catch(()=>null);
      assert.ok(info,`Missing ${value} in ${file}`);
      if(info.isDirectory())target=path.join(target,'index.html');
      if(url.hash && target.endsWith('.html')){
        const targetHtml=await readFile(target,'utf8');
        assert.ok(targetHtml.includes(`id="${url.hash.slice(1)}"`),`Missing anchor ${value} in ${file}`);
      }
    }
    for(const match of html.matchAll(/\bsrcset="([^"]+)"/g))for(const item of match[1].split(','))assert.ok(await stat(path.join(dist,item.trim().split(/\s+/)[0])));
    for(const match of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs))assert.equal(JSON.parse(match[1]).inLanguage,locale);
    assert.ok(!html.includes('https://apps.apple.com"')&&!html.includes('https://play.google.com"'));
    assert.ok(!html.includes('reducirá tu hándicap'));
  }
});
test('Public package excludes source and backups; CSS font URLs resolve locally',async()=>{
  for(const name of ['backups','.git','.agent','scripts','tests','Web D2G 03092026'])assert.equal(await stat(path.join(dist,name)).catch(()=>null),null);
  const fonts=await readFile(path.join(dist,'assets/fonts/fonts.css'),'utf8');
  for(const match of fonts.matchAll(/url\(['"]?([^)'" ]+)/g))assert.ok(await stat(path.join(dist,match[1])));
  assert.ok(!fonts.includes('https://'));
  const htaccess=await readFile(path.join(dist,'.htaccess'),'utf8');
  assert.ok(htaccess.includes('backups|scripts|tests'));
});
test('Root language negotiation and detection redirects Spanish to /es/ and non-Spanish to /en/',async()=>{
  const rootIndex=await readFile(path.join(dist,'index.html'),'utf8');
  assert.ok(rootIndex.includes('localStorage.getItem("d2g_lang")'));
  assert.ok(rootIndex.includes('navigator.languages'));
  assert.ok(rootIndex.includes('window.location.replace'));

  const htaccess=await readFile(path.join(dist,'.htaccess'),'utf8');
  assert.ok(htaccess.includes('d2g_lang=es'));
  assert.ok(htaccess.includes('d2g_lang=en'));
  assert.ok(htaccess.includes('HTTP:Accept-Language'));
  assert.ok(htaccess.includes('RewriteRule ^$ /es/ [R=302,L]'));
  assert.ok(htaccess.includes('RewriteRule ^$ /en/ [R=302,L]'));

  function resolveLanguage(languages,savedCookie=null){
    if(savedCookie==='es'||savedCookie==='en')return savedCookie;
    const list=Array.isArray(languages)?languages:[languages||''];
    let esIdx=-1,enIdx=-1;
    for(let i=0;i<list.length;i++){
      const c=(list[i]||'').toLowerCase();
      if(esIdx===-1&&(c==='es'||c.startsWith('es-')||c.startsWith('es_')))esIdx=i;
      if(enIdx===-1&&(c==='en'||c.startsWith('en-')||c.startsWith('en_')))enIdx=i;
    }
    return (esIdx!==-1&&(enIdx===-1||esIdx<=enIdx))?'es':'en';
  }

  assert.equal(resolveLanguage(['es-ES']),'es');
  assert.equal(resolveLanguage(['es-MX']),'es');
  assert.equal(resolveLanguage(['es-AR']),'es');
  assert.equal(resolveLanguage(['es-CO']),'es');
  assert.equal(resolveLanguage(['es-US']),'es');
  assert.equal(resolveLanguage(['es-419']),'es');
  assert.equal(resolveLanguage(['es']),'es');
  assert.equal(resolveLanguage(['ca-ES','es-ES']),'es');

  assert.equal(resolveLanguage(['en-US']),'en');
  assert.equal(resolveLanguage(['en-GB']),'en');
  assert.equal(resolveLanguage(['fr-FR']),'en');
  assert.equal(resolveLanguage(['de-DE']),'en');
  assert.equal(resolveLanguage(['it-IT']),'en');
  assert.equal(resolveLanguage(['pt-BR']),'en');
  assert.equal(resolveLanguage(['ja-JP']),'en');
  assert.equal(resolveLanguage(['en-US','es-ES']),'en');
  assert.equal(resolveLanguage([]),'en');

  assert.equal(resolveLanguage(['es-ES'],'en'),'en');
  assert.equal(resolveLanguage(['en-US'],'es'),'es');
});
