const CACHE='kemp-cymatics-pwa-v7';
const CORE=['./','./index.html','./manifest.json','./icon-192.svg','./icon-512.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const isDocument=event.request.mode==='navigate'||event.request.destination==='document';
  event.respondWith((async()=>{
    let response;
    if(isDocument){
      try{response=await fetch(event.request,{cache:'no-store'});}catch(e){response=await caches.match('./index.html')||await caches.match(event.request)}
    }else{
      response=await caches.match(event.request);
      if(!response){try{response=await fetch(event.request);const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy))}catch(e){}}
    }
    if(!response)return response;
    if(isDocument){
      const text=await response.clone().text();
      let patched=text;
      patched=patched.replace(/<button class="btn" id="tone">SOUND OFF<\/button>/g,'');
      patched=patched.replace(/tone\.textContent='SOUND OFF';/g,'');
      patched=patched.replace(/tone\.onclick=\(\)=>\{if\(audio\)\{stopAudio\(\);tone\.textContent='SOUND OFF'\}else\{startAudio\(\);tone\.textContent='SOUND ON'\}\};/g,'');
      patched=patched.replace(/start\.onclick=\(\)=>\{if\(running\)return;running=true;start\.textContent='EXPERIENCE RUNNING';startAudio\(\);last=0;requestAnimationFrame\(tick\);cancelAnimationFrame\(raf\);draw\(\)\}/g,"start.onclick=()=>{if(running){running=false;stopAudio();cancelAnimationFrame(raf);raf=0;last=0;start.textContent='BEGIN EXPERIENCE';draw();return}running=true;start.textContent='EXPERIENCE RUNNING';startAudio();last=0;raf=requestAnimationFrame(tick);draw()}");
      if(patched!==text)return new Response(patched,{status:response.status,statusText:response.statusText,headers:response.headers});
    }
    return response;
  })())
});