import{S as a,i as s,s as r,e as t,t as e,c as n,b as c,g as i,d as o,j as m,k as u,r as d}from"./index.1cf7c1a4.js";function f(a){var s,r,f=streamer.name+"";return{c(){s=t("div"),r=e(f)},l(a){s=n(a,"DIV",{},!1);var t=c(s);r=i(t,f),t.forEach(o)},m(a,t){m(a,s,t),u(s,r)},p:d,i:d,o:d,d(a){a&&o(s)}}}async function p(a,s){const{id:r}=a.params,t=await this.fetch(`/api/streamer/${r}`);return{streamer:await t.json()}}export default class extends a{constructor(a){super(),s(this,a,null,f,r,[])}}export{p as preload};
