if(!self.define){let e,s={};const n=(n,i)=>(n=new URL(n+".js",i).href,s[n]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=s,document.head.appendChild(e)}else e=n,importScripts(n),s()})).then((()=>{let e=s[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(i,r)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let l={};const o=e=>n(e,t),u={module:{uri:t},exports:l,require:o};s[t]=Promise.all(i.map((e=>u[e]||o(e)))).then((e=>(r(...e),l)))}}define(["./workbox-5ffe50d4"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/BottomNav-BD650_c7.js",revision:null},{url:"assets/Dashboard-DjyyQuKr.js",revision:null},{url:"assets/Home-N-o5F_gL.js",revision:null},{url:"assets/index-kFxqLB8M.css",revision:null},{url:"assets/index-yg_IsvUt.js",revision:null},{url:"assets/Items-KfdjCLks.js",revision:null},{url:"assets/Orders-CnVFv2B0.js",revision:null},{url:"index.html",revision:"a6fdc872e33e4165327f5543ebcf50d4"},{url:"manifest.webmanifest",revision:"3b81e648db26a85f962a169f04fab4a5"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
