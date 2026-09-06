import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const port=Number(process.env.D2G_PORT || 4173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.ico':'image/x-icon','.json':'application/json','.webmanifest':'application/manifest+json','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost');
    const pathname=decodeURIComponent(url.pathname);
    let filename=resolve(root,`.${pathname}`);
    if(!filename.startsWith(resolve(root)+sep) && filename!==resolve(root)) {res.writeHead(403).end();return;}
    if(pathname.split('/').some(part=>part.startsWith('.'))) {res.writeHead(404).end();return;}
    const info=await stat(filename);
    if(info.isDirectory()) {
      if(!pathname.endsWith('/')) {res.writeHead(301,{Location:pathname+'/'+url.search}).end();return;}
      filename=resolve(filename,'index.html');
    }
    const data=await readFile(filename);
    res.writeHead(200,{'Content-Type':types[extname(filename)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    res.end(req.method==='HEAD'?undefined:data);
  } catch {res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Data2Gain preview: http://127.0.0.1:${port}`));
