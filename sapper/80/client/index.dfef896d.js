function t(){}function n(t,n){for(const e in n)t[e]=n[e];return t}function e(t){return t()}function o(){return Object.create(null)}function r(t){t.forEach(e)}function c(t){return"function"==typeof t}function u(t,n){return t!=t?n==n:t!==n||t&&"object"==typeof t||"function"==typeof t}function s(t,n,e){if(t){const o=a(t,n,e);return t[0](o)}}function a(t,e,o){return t[1]?n({},n(e.$$scope.ctx,t[1](o?o(e):{}))):e.$$scope.ctx}function i(t,e,o,r){return t[1]?n({},n(e.$$scope.changed||{},t[1](r?r(o):{}))):e.$$scope.changed||{}}function f(t,n){t.appendChild(n)}function l(t,n,e){t.insertBefore(n,e||null)}function d(t){t.parentNode.removeChild(t)}function $(t,n){for(let e=0;e<t.length;e+=1)t[e]&&t[e].d(n)}function p(t){return document.createElement(t)}function h(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function m(t){return document.createTextNode(t)}function g(){return m(" ")}function y(){return m("")}function b(t,n,e,o){return t.addEventListener(n,e,o),()=>t.removeEventListener(n,e,o)}function x(t,n,e){null==e?t.removeAttribute(n):t.setAttribute(n,e)}function w(t){return Array.from(t.childNodes)}function _(t,n,e,o){for(let o=0;o<t.length;o+=1){const r=t[o];if(r.nodeName===n){for(let t=0;t<r.attributes.length;t+=1){const n=r.attributes[t];e[n.name]||r.removeAttribute(n.name)}return t.splice(o,1)[0]}}return o?h(n):p(n)}function v(t,n){for(let e=0;e<t.length;e+=1){const o=t[e];if(3===o.nodeType)return o.data=""+n,t.splice(e,1)[0]}return m(n)}function E(t){return v(t," ")}function N(t,n){n=""+n,t.data!==n&&(t.data=n)}function A(t,n){(null!=n||t.value)&&(t.value=n)}function j(t,n,e,o){t.style.setProperty(n,e,o?"important":"")}function k(t,n,e){t.classList[e?"add":"remove"](n)}let L;function O(t){L=t}function S(){if(!L)throw new Error("Function called outside component initialization");return L}function C(t){S().$$.on_mount.push(t)}function q(t,n){S().$$.context.set(t,n)}const z=[],B=[],F=[],M=[],P=Promise.resolve();let T=!1;function D(t){F.push(t)}function G(t){M.push(t)}function H(){const t=new Set;do{for(;z.length;){const t=z.shift();O(t),I(t.$$)}for(;B.length;)B.pop()();for(let n=0;n<F.length;n+=1){const e=F[n];t.has(e)||(e(),t.add(e))}F.length=0}while(z.length);for(;M.length;)M.pop()();T=!1}function I(t){t.fragment&&(t.update(t.dirty),r(t.before_update),t.fragment.p(t.dirty,t.ctx),t.dirty=null,t.after_update.forEach(D))}const J=new Set;let K;function Q(){K={r:0,c:[],p:K}}function R(){K.r||r(K.c),K=K.p}function U(t,n){t&&t.i&&(J.delete(t),t.i(n))}function V(t,n,e,o){if(t&&t.o){if(J.has(t))return;J.add(t),K.c.push(()=>{J.delete(t),o&&(e&&t.d(1),o())}),t.o(n)}}const W="undefined"!=typeof window?window:global;function X(t,n){const e={},o={},r={$$scope:1};let c=t.length;for(;c--;){const u=t[c],s=n[c];if(s){for(const t in u)t in s||(o[t]=1);for(const t in s)r[t]||(e[t]=s[t],r[t]=1);t[c]=s}else for(const t in u)r[t]=1}for(const t in o)t in e||(e[t]=void 0);return e}function Y(t){return"object"==typeof t&&null!==t?t:{}}function Z(t,n,e){-1!==t.$$.props.indexOf(n)&&(t.$$.bound[n]=e,e(t.$$.ctx[n]))}function tt(t,n,o){const{fragment:u,on_mount:s,on_destroy:a,after_update:i}=t.$$;u.m(n,o),D(()=>{const n=s.map(e).filter(c);a?a.push(...n):r(n),t.$$.on_mount=[]}),i.forEach(D)}function nt(t,n){t.$$.fragment&&(r(t.$$.on_destroy),t.$$.fragment.d(n),t.$$.on_destroy=t.$$.fragment=null,t.$$.ctx={})}function et(t,n){t.$$.dirty||(z.push(t),T||(T=!0,P.then(H)),t.$$.dirty=o()),t.$$.dirty[n]=!0}function ot(n,e,c,u,s,a){const i=L;O(n);const f=e.props||{},l=n.$$={fragment:null,ctx:null,props:a,update:t,not_equal:s,bound:o(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(i?i.$$.context:[]),callbacks:o(),dirty:null};let d=!1;l.ctx=c?c(n,f,(t,e,o=e)=>(l.ctx&&s(l.ctx[t],l.ctx[t]=o)&&(l.bound[t]&&l.bound[t](o),d&&et(n,t)),e)):f,l.update(),d=!0,r(l.before_update),l.fragment=u(l.ctx),e.target&&(e.hydrate?l.fragment.l(w(e.target)):l.fragment.c(),e.intro&&U(n.$$.fragment),tt(n,e.target,e.anchor),H()),O(i)}class rt{$destroy(){nt(this,1),this.$destroy=t}$on(t,n){const e=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return e.push(n),()=>{const t=e.indexOf(n);-1!==t&&e.splice(t,1)}}$set(){}}export{a as A,N as B,y as C,n as D,X as E,Y as F,q as G,Q as H,R as I,b as J,h as K,A as L,r as M,C as N,W as O,rt as S,w as a,v as b,_ as c,d,p as e,x as f,k as g,l as h,ot as i,f as j,B as k,Z as l,g as m,t as n,E as o,tt as p,U as q,V as r,u as s,m as t,$ as u,nt as v,G as w,s as x,j as y,i as z};
