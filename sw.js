if(!self.define){let e,i={};const s=(s,n)=>(s=new URL(s+".js",n).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,r)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(i[t])return;let c={};const o=e=>s(e,t),f={module:{uri:t},exports:c,require:o};i[t]=Promise.all(n.map((e=>f[e]||o(e)))).then((e=>(r(...e),c)))}}define(["./workbox-4b7ad3f1"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"assets/index-495078f4.js",revision:null},{url:"index.html",revision:"30da2c8c87a560ecd8f70cafbc230241"},{url:"registerSW.js",revision:"402b66900e731ca748771b6fc5e7a068"},{url:"assets/tiny_turnip_512.png",revision:"88f685c79d6f671ac398a694a21afabf"},{url:"favicon.ico",revision:"5b36628cb8f7882826826562593cc5bc"},{url:"manifest.webmanifest",revision:"98d41ee7a80c5c480b8ffab4d5c81847"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html"))),e.registerRoute((({url:e})=>e.pathname.startsWith("/")),new e.CacheFirst({cacheName:"api-cache",plugins:[new e.CacheableResponsePlugin({statuses:[0,200]})]}),"GET")}));
