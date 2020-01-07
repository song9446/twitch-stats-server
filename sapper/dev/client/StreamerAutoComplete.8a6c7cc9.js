import{S as e,i as s,s as r,e as t,a as l,t as a,c as n,b as c,d as i,f as o,g as h,h as u,l as d,j as p,k as f,m,n as _,o as g,p as v,q as x,r as w,u as b,v as E,w as k}from"./index.1cf7c1a4.js";import{A as y}from"./config.c223256a.js";function S(e,s,r){const t=Object.create(e);return t.streamer=s[r],t}function j(e){var s,r,_,g,v,x,w,b,E,k,y,S,j,I=e.streamer._left+"",A=e.streamer._center+"",N=e.streamer._right+"";function P(...s){return e.mousedown_handler(e,...s)}return{c(){s=t("li"),r=t("img"),g=l(),v=t("div"),x=t("span"),w=a(I),b=t("span"),E=a(A),k=t("span"),y=a(N),S=l(),this.h()},l(e){s=n(e,"LI",{class:!0},!1);var t=c(s);r=n(t,"IMG",{class:!0,src:!0},!1),c(r).forEach(i),g=o(t),v=n(t,"DIV",{class:!0},!1);var l=c(v);x=n(l,"SPAN",{},!1);var a=c(x);w=h(a,I),a.forEach(i),b=n(l,"SPAN",{class:!0},!1);var u=c(b);E=h(u,A),u.forEach(i),k=n(l,"SPAN",{},!1);var d=c(k);y=h(d,N),d.forEach(i),l.forEach(i),S=o(t),t.forEach(i),this.h()},h(){u(r,"class","rounded-full h-8 w-8"),u(r,"src",_=e.streamer.profile_image_url),u(b,"class","text-red-500"),u(v,"class","px-2"),u(s,"class","w-48 px-2 py-2 hover:bg-purple-500 hover:text-white text-black flex flex-row items-center truncate"),j=d(s,"mousedown",P)},m(e,t){p(e,s,t),f(s,r),f(s,g),f(s,v),f(v,x),f(x,w),f(v,b),f(b,E),f(v,k),f(k,y),f(s,S)},p(s,t){e=t,s.filtered_streamers&&_!==(_=e.streamer.profile_image_url)&&u(r,"src",_),s.filtered_streamers&&I!==(I=e.streamer._left+"")&&m(w,I),s.filtered_streamers&&A!==(A=e.streamer._center+"")&&m(E,A),s.filtered_streamers&&N!==(N=e.streamer._right+"")&&m(y,N)},d(e){e&&i(s),j()}}}function I(e){var s,r,a,h,m,k,y,I;let A=e.filtered_streamers,N=[];for(let s=0;s<A.length;s+=1)N[s]=j(S(e,A,s));return{c(){s=t("div"),r=t("input"),a=l(),h=_("svg"),m=_("path"),k=l(),y=t("ul");for(let e=0;e<N.length;e+=1)N[e].c();this.h()},l(e){s=n(e,"DIV",{class:!0},!1);var t=c(s);r=n(t,"INPUT",{placeholder:!0,class:!0},!1),c(r).forEach(i),a=o(t),h=n(t,"svg",{xmlns:!0,"xmlns:xlink":!0,version:!0,x:!0,y:!0,viewBox:!0,style:!0,"xml:space":!0,width:!0,height:!0,id:!0,class:!0},!0);var l=c(h);m=n(l,"path",{d:!0},!0),c(m).forEach(i),l.forEach(i),k=o(t),y=n(t,"UL",{class:!0},!1);var u=c(y);for(let e=0;e<N.length;e+=1)N[e].l(u);u.forEach(i),t.forEach(i),this.h()},h(){u(r,"placeholder",e.placeholder),u(r,"class","px-2 border rounded focus:outline-none w-48 text-xs leading-loose pr-6"),u(m,"d","M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z"),u(h,"xmlns","http://www.w3.org/2000/svg"),u(h,"xmlns:xlink","http://www.w3.org/1999/xlink"),u(h,"version","1.1"),u(h,"x","0px"),u(h,"y","0px"),u(h,"viewBox","0 0 56.966 56.966"),g(h,"enable-background","new 0 0 56.966 56.966"),u(h,"xml:space","preserve"),u(h,"width","512px"),u(h,"height","512px"),u(h,"id","Capa_1"),u(h,"class","h-3 w-3 text-gray-600 fill-current absolute top-0 right-0 mt-2 mr-2"),u(y,"class","absolute bg-white"),v(y,"hidden",!e.focused),u(s,"class","inline-block relative"),I=[d(r,"input",e.input_input_handler),d(r,"focus",e.focus_handler),d(r,"keyup",e.on_input_change),d(r,"blur",e.blur_handler)]},m(t,l){p(t,s,l),f(s,r),x(r,e.input_value),e.input_binding(r),f(s,a),f(s,h),f(h,m),f(s,k),f(s,y);for(let e=0;e<N.length;e+=1)N[e].m(y,null)},p(e,s){if(e.input_value&&r.value!==s.input_value&&x(r,s.input_value),e.placeholder&&u(r,"placeholder",s.placeholder),e.filtered_streamers){let r;for(A=s.filtered_streamers,r=0;r<A.length;r+=1){const t=S(s,A,r);N[r]?N[r].p(e,t):(N[r]=j(t),N[r].c(),N[r].m(y,null))}for(;r<N.length;r+=1)N[r].d(1);N.length=A.length}e.focused&&v(y,"hidden",!s.focused)},i:w,o:w,d(r){r&&i(s),e.input_binding(null),b(N,r),E(I)}}}function A(e,s,r){let t,l,a,{streamers:n=[],selected:c=null,placeholder:i="",onselect:o=(e=>{})}=s,h=!1,u=[];function d(e,s){r("filtered_streamers",u=s?e.filter(e=>e.name.search(s)>=0):[]);for(let e of u){let r=e.name.search(l);e._left=e.name.slice(0,r),e._center=l,e._right=e.name.slice(r+s.length)}}function p(e){r("selected",c=e),r("input_element",t.value=e.name,t),t.blur(),o(c),console.log("click")}return e.$set=(e=>{"streamers"in e&&r("streamers",n=e.streamers),"selected"in e&&r("selected",c=e.selected),"placeholder"in e&&r("placeholder",i=e.placeholder),"onselect"in e&&r("onselect",o=e.onselect)}),{streamers:n,selected:c,placeholder:i,onselect:o,input_element:t,input_value:l,focused:h,filtered_streamers:u,on_input_change:function(e){let s=l;a!=s&&(a=s,n.length?d(n,s):fetch(y+"/api/thin-streamers?search="+l).then(e=>e.json()).then(e=>{d(e,s)}))},on_list_click:p,input_input_handler:function(){l=this.value,r("input_value",l)},input_binding:function(e){k[e?"unshift":"push"](()=>{r("input_element",t=e)})},focus_handler:e=>r("focused",h=!0),blur_handler:e=>r("focused",h=!1),mousedown_handler:({streamer:e},s)=>p(e)}}class N extends e{constructor(e){super(),s(this,e,A,I,r,["streamers","selected","placeholder","onselect"])}}export{N as S};
