import{aD as E,aE as C,aF as b,aG as D}from"../@vue/@vue.CVGyaoMH.js";/**
* vue v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function F(){E()}F();var s={exports:{}},a={};/**
* vue v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/var $;function T(){return $||($=1,function(c){Object.defineProperty(c,"__esModule",{value:!0});var j=D,n=C,t=b;function O(e){var o=Object.create(null);if(e)for(var i in e)o[i]=e[i];return o.default=e,Object.freeze(o)}var _=O(n);const f=Object.create(null);function m(e,o){if(!t.isString(e))if(e.nodeType)e=e.innerHTML;else return n.warn("invalid template option: ",e),t.NOOP;const i=t.genCacheKey(e,o),l=f[i];if(l)return l;if(e[0]==="#"){const r=document.querySelector(e);r||n.warn(`Template element not found or is empty: ${e}`),e=r?r.innerHTML:""}const u=t.extend({hoistStatic:!0,onError:d,onWarn:r=>d(r,!0)},o);!u.isCustomElement&&typeof customElements<"u"&&(u.isCustomElement=r=>!!customElements.get(r));const{code:g}=j.compile(e,u);function d(r,q=!1){const p=q?r.message:`Template compilation error: ${r.message}`,y=r.loc&&t.generateCodeFrame(e,r.loc.start.offset,r.loc.end.offset);n.warn(y?`${p}
${y}`:p)}const v=new Function("Vue",g)(_);return v._rc=!0,f[i]=v}n.registerRuntimeCompiler(m),c.compile=m,Object.keys(n).forEach(function(e){e!=="default"&&!Object.prototype.hasOwnProperty.call(c,e)&&(c[e]=n[e])})}(a)),a}var h;function V(){return h||(h=1,s.exports=T()),s.exports}export{V as r};
