if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let s=Promise.resolve();return r[e]||(s=new Promise(async s=>{if("document"in self){const r=document.createElement("script");r.src=e,document.head.appendChild(r),r.onload=s}else importScripts(e),s()})),s.then(()=>{if(!r[e])throw new Error(`Module ${e} didn’t register its module`);return r[e]})},s=(s,r)=>{Promise.all(s.map(e)).then(e=>r(1===e.length?e[0]:e))},r={require:Promise.resolve(s)};self.define=(s,c,i)=>{r[s]||(r[s]=Promise.resolve().then(()=>{let r={};const a={uri:location.origin+s.slice(1)};return Promise.all(c.map(s=>{switch(s){case"exports":return r;case"module":return a;default:return e(s)}})).then(e=>{const s=i(...e);return r.default||(r.default=s),r})}))}}define("./service-worker.js",["./workbox-468c4d03"],(function(e){"use strict";e.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"./favicon.png",revision:"728cabda15de8ca51c6d713a4a839c3b"},{url:"./index.html",revision:"c7182c7e245a14b76f0224dcb3d259e1"},{url:"./manifest.json",revision:"c7f815e96b2a37abbf9ad5a81ed88f73"},{url:"./static/css/main.4e6c46b043de889cb8a4.css",revision:"c1e0651311be55471e26e10953f8d711"},{url:"./static/js/0.baf74265c87b72bd9148.js",revision:"1b56b5ca42fda17ca289716b2747ddf2"},{url:"./static/js/0.baf74265c87b72bd9148.js.LICENSE.txt",revision:"af4701217085bd911d03758fa1b02cc0"},{url:"./static/js/1.a292a56e7f7a47196a91.js",revision:"077f32b04b90eb5122242644831a758c"},{url:"./static/js/1.a292a56e7f7a47196a91.js.LICENSE.txt",revision:"4e230d017ca1e1e1cdf42b987636e3ca"},{url:"./static/js/3.5c3af617ead8fc401461.js",revision:"2fb4f8cd9a8b391df2af9ce7c6bb73ec"},{url:"./static/js/runtime.c96ad1e23ad63da4d304.js",revision:"0358997880c41faa6ba2c6d73904d67c"}],{})}));
//# sourceMappingURL=service-worker.js.map