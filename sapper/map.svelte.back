<svelte:head>
	<title>트수gg - 스트리머 지도</title>
</svelte:head>

<Modal>
  <div class="p-6 flex flex-col bg-gray-200 text-gray-600">
    <div class="pt-2"> 조작법 </div>
    <div class="text-sm pl-2">
      <div>
        <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faMouse.icon[0]} {faMouse.icon[1]}" class="w-3 h-3 mr-1 overflow-visible inline-block">
          <path fill="currentColor" d="{faMouse.icon[4]}"/>
        </svg>
        휠/드래그/더블클릭
      </div>
      <div>
        <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faMobileAlt.icon[0]} {faMobileAlt.icon[1]}" class="w-3 h-3 mr-1 overflow-visible inline-block">
          <path fill="currentColor" d="{faMobileAlt.icon[4]}"/>
        </svg>
        확대,드래그제스처/더블탭
      </div>
    </div>
    <div class="pt-2"> 개요 </div>
    <div class="text-sm pl-2">
      <div>
        - 타일 한 칸은 스트리머 한 명을 의미합니다.
      </div>
      <div>
        - 거리가 가까운 스트리머는 서로 비슷할 확률이 높습니다.
      </div>
      <div>
        - 유의미하게 비슷한 스트리머 집단은 국가로 구분지어 표시됩니다.
      </div>
      <div>
        - 국가의 이름은 국가 전체의 성격을 가장 잘 나타내는 스트리머의 이름으로 표시됩니다.
      </div>
      <div>
        - 국가에 포함되지 않은 스트리머는 분쟁지역이거나 도시국가입니다.
      </div>
      <div>
        - 지도의 형태와 스트리머들의 위치는 계산 결과에 따라 수시로 바뀔수있습니다.
      </div>
    </div>
    <div class="pt-2"> 범례 </div>
    <div class="text-sm pl-2">
      <div class="align-middle mb-1">
        {#if sprites.town_night} 
          <img src="{sprites.town_night.src}" class="w-6 h-6 inline"/>
        {/if}
        100따리
      </div>
      <div class="align-middle mb-1">
        {#if sprites.castle_night} 
          <img src="{sprites.castle_night.src}" class="w-6 h-6 inline"/>
        {/if}
        1000따리
      </div>
      <div class="align-middle mb-1">
        {#if sprites.city_night} 
          <img src="{sprites.city_night.src}" class="w-6 h-6 inline"/>
        {/if}
        10000따리
      </div>
      <div class="mb-1">
        {#if sprites.town && sprites.castle && sprites.city} 
          <img src="{sprites.town.src}" class="w-6 h-6 inline"/>
          <img src="{sprites.castle.src}" class="w-6 h-6 inline"/>
          <img src="{sprites.city.src}" class="w-6 h-6 inline"/>
        {/if}
        방송중
      </div>
      <div class="align-middle mb-1">
        {#if sprites.fire} 
          <img src="{sprites.fire.src}" class="w-6 h-6 inline"/>
        {/if}
        채팅창 불남
      </div>
    </div>
  </div>
  
</Modal>

<div
    on:mousedown={canvas_mouse_down}
    on:mouseup={canvas_mouse_up}
    on:mousemove={canvas_mouse_move}
    on:mouseleave={canvas_mouse_out}
    on:wheel={canvas_scroll}
    on:touchstart={canvas_touch_start}
    on:touchmove={canvas_touch_move}
  >
<div class="fixed p-6 text-white md:block flex flex-row justify-between w-full md:w-auto">
  <div>
    <h2 class="inline-block text-2xl md:text-3xl">
      스트리머 지도
    </h2>
    <Tip click={tip_click}>
      클릭하여 설명열기
    </Tip>
  </div> 
  <StreamerAutoComplete streamers={streamers} bind:selected={search} placeholder="지도에서 찾기" input_class="bg-transparent border border-white text-sm w-40 p-2 md:mt-4" icon=false id="streamer-map"/>
</div>
<div class="overflow-x-auto canvas-container">
  <canvas bind:this={canvas} class="w-full h-full canvas"
  > </canvas>
</div>
</div>
<!--
<div class="w-full flex flex-row flex-wrap items-center">
  <div class="p-2 flex flex-row flex-wrap items-center">
    <div class="px-2"><input type=checkbox bind:checked={clustering_show} id="border" name="border"> <label for="border">국경</label></div>
    <div class="px-2"><input type=checkbox bind:checked={potrait_show} id="potrait" name="potrait"> <label for="potrait">초상화</label></div>
    <div class="px-2"><input type=checkbox bind:checked={name_show} id="name" name="name"> <label for="name">이름</label></div>
  </div>
</div>-->

<style>
.canvas-container {
  width: 100%;
  height: calc(100vh - 2.85rem);
  overflow-y: hidden;
  background-color: #2D3343;
  /*box-shadow: 0px 0px 1rem #000;*/
}
.canvas {
  /*background: url(/waterpattern.jpg);
  background-repeat: no-repeat;
  background-size: 100% 100%;*/
}
</style>

<script context="module">
	import { API } from '../api.js';
  export async function preload(page, session) {
    let streamers = await API.streamer_map.call(this);
    return { streamers };
  }
</script>

<script>
import { onMount, onDestroy } from "svelte";
import StreamerAutoComplete from "../components/StreamerAutoComplete.svelte";
import Panel from "../components/Panel.svelte";
import Modal, { show, hide } from "../components/Modal.svelte"; 
import { faMouse } from '@fortawesome/free-solid-svg-icons/faMouse'
import { faMobileAlt } from '@fortawesome/free-solid-svg-icons/faMobileAlt'
import Tip from '../components/Tip.svelte';

export let streamers;

function tip_click() {
  show(0);
}

const COLORS = {
  sea: "#2D3343",
  land: "#806A5C",
  load: "#3c3c33",
  highlight: "#d4af37",
}

let canvas;
let camera = [0.5, 0.45, 0.85];

let search = null;
let clustering_show = true;
let potrait_show = true;
let name_show = true;

let n = Math.max(...streamers.map(s=>s.x), ...streamers.map(s=>s.y)) + 1;
let piece_size = [64, 64];

let last_pointer_x=null, last_pointer_y=null, clicking = false;
function canvas_mouse_down(e) {
  last_pointer_x = e.pageX - canvas.getBoundingClientRect().x;
  last_pointer_y = e.pageY - canvas.getBoundingClientRect().y;
  clicking = true;
  //return e.preventDefault() && false;
}
function canvas_mouse_up(e) {
  clicking = false;
  //return e.preventDefault() && false;
}
function canvas_mouse_out(e) {
  clicking = false;
}
function canvas_mouse_move(e) {
  let dx = (e.pageX - canvas.getBoundingClientRect().x) - last_pointer_x,
      dy = (e.pageY - canvas.getBoundingClientRect().y) - last_pointer_y;
  last_pointer_x += dx;
  last_pointer_y += dy;
  if(!clicking) return;
  camera[0] -= dx / (n * piece_size[0]*camera[2]);
  camera[1] -= dy / (n * piece_size[1]*camera[2]);
}
function canvas_scroll(e) {
  let delta = e.wheelDelta ? e.wheelDelta : e.detail ? - e.detail : 0;
  camera[2] += delta / canvas.width;
  return e.preventDefault() && false;
}
function get_distance(e) {
  var diffX = e.touches[0].clientX - e.touches[1].clientX;
  var diffY = e.touches[0].clientY - e.touches[1].clientY;
  return Math.sqrt(diffX * diffX + diffY * diffY); // Pythagorean theorem
}

function canvas_touch_start(e) {
  let rect = canvas.getBoundingClientRect();
  if (e.touches.length > 1) { // if multiple touches (pinch zooming)
    finger_dist = get_distance(e); // Save current finger distance
  } // Else just moving around
  last_pointer_x = e.touches[0].clientX - rect.x; // Save finger position
  last_pointer_y = e.touches[0].clientY - rect.y; //
  if ("activeElement" in document)
    document.activeElement.blur();
};

let finger_dist=0;
function canvas_touch_move(e) {
  e.preventDefault(); // Stop the window from moving
  let rect = canvas.getBoundingClientRect();
  if (finger_dist && e.touches.length > 1) { // If pinch-zooming
    let new_finger_dist = get_distance(e); // Get current distance between fingers
    if(finger_dist) camera[2] = camera[2] * Math.abs(new_finger_dist / finger_dist); // Zoom is proportional to change
    finger_dist = new_finger_dist; // Save current distance for next time
  } else if(!finger_dist){ 
    let dx = e.touches[0].clientX - last_pointer_x - rect.x,
        dy = e.touches[0].clientY - last_pointer_y - rect.y;
    last_pointer_x += dx;
    last_pointer_y += dy;
    camera[0] -= dx / (n * piece_size[0]*camera[2]);
    camera[1] -= dy / (n * piece_size[1]*camera[2]);
  }
  return e.preventDefault() && false;
};


let sprites = { };

let frame;

onMount(async ()=>{
  console.log(streamers);
  const { Patterns } = (await import("../components/CanvasPatterns.js"));
  sprites.city = new Image();
  sprites.city.src = "/city_on.png";
  sprites.castle = new Image();
  sprites.castle.src = "/castle_on.png";
  sprites.town = new Image();
  sprites.town.src = "/town_on.png";
  sprites.city_night = new Image();
  sprites.city_night.src = "/city_off.png";
  sprites.castle_night = new Image();
  sprites.castle_night.src = "/castle_off.png";
  sprites.town_night = new Image();
  sprites.town_night.src = "/town_off.png";
  sprites.fire = new Image();
  sprites.fire.src = "/fire.png";
  let ctx = canvas.getContext("2d");
  canvas.width = canvas.getBoundingClientRect().width;
  canvas.height = canvas.getBoundingClientRect().height;
  //canvas.height = canvas.width;//canvas.getBoundingClientRect().height;
  piece_size = [Math.min(canvas.width, canvas.height) / n, Math.min(canvas.height, canvas.width) / n];
  let border_width = 6;
  let representor_of_cluster = [];
  let cluster_to_streamers = [];
  let streamer_matrix = Array(n).fill().map(()=>Array(n).fill(null));
  for(let s of streamers) {
    s.image = new Image();
    streamer_matrix[s.x][s.y] = s;
    if(s.cluster >= 0) {
      if(cluster_to_streamers[s.cluster] == null) 
        cluster_to_streamers[s.cluster] = [];
      cluster_to_streamers[s.cluster].push(s);
    }
  }
  for(let i in cluster_to_streamers) {
    cluster_to_streamers[i].sort((a, b) => b.probability - a.probability);
    representor_of_cluster[i] = cluster_to_streamers[i][0];
    representor_of_cluster[i].representation_x = cluster_to_streamers[i].reduce((a, b) => a + b.x, 0) / cluster_to_streamers[i].length;
    representor_of_cluster[i].representation_y = cluster_to_streamers[i].reduce((a, b) => a + b.y, 0) / cluster_to_streamers[i].length;
  }
  for(let s of streamers) {
    if(s.cluster >= 0 && (s.x-1 < 0 || streamer_matrix[s.x-1][s.y] == null || streamer_matrix[s.x-1][s.y].cluster != s.cluster))
      s.left_edge = true;
    if(s.cluster >= 0 && (s.x+1 >= streamer_matrix.length || streamer_matrix[s.x+1][s.y] == null || streamer_matrix[s.x+1][s.y].cluster != s.cluster))
      s.right_edge = true;
    if(s.cluster >= 0 && (s.y-1 < 0 || streamer_matrix[s.x][s.y-1] == null || streamer_matrix[s.x][s.y-1].cluster != s.cluster))
      s.top_edge = true;
    if(s.cluster >= 0 && (s.y+1 >= streamer_matrix.length || streamer_matrix[s.x][s.y+1] == null || streamer_matrix[s.x][s.y+1].cluster != s.cluster))
      s.bottom_edge = true;
  }
  let frame_index = 0;
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  ctx.font = "12px Arial";

  let pw, ph;
  let view;

  canvas.ondblclick = function(e){
    let target = (streamer_matrix[Math.floor((e.pageX - canvas.getBoundingClientRect().x + view[0]) / pw)] || [])[Math.floor((e.pageY - canvas.getBoundingClientRect().y + view[1]) / ph)];
    if(target)
      location = `/streamer/${target.id}`;
    return e.preventDefault() && false;
  }
  let timer = null, last_target;
  let canvas_touch_end = function(e) {
    if (e.touches.length >= 1) return;
    finger_dist = 0;
    let target = (streamer_matrix[Math.floor((last_pointer_x + view[0]) / pw)] || [])[Math.floor((last_pointer_y + view[1]) / ph)];
    if(timer == null){
      last_target = target;
      timer = setTimeout(function () {
          timer = null;
          last_target = null;
      }, 500);
    }else {
      clearTimeout(timer);
      timer = null;
      if(target && target == last_target)
        location = `/streamer/${target.id}`;
      else {
        last_target = target;
        timer = setTimeout(function () {
            timer = null;
            last_target = null;
        }, 300);
      }
    }
  };
  canvas.addEventListener("touchend", canvas_touch_end);
  canvas.addEventListener("touchcancel", canvas_touch_end);
  console.log(representor_of_cluster);
  (function loop() {
    frame = requestAnimationFrame(loop);
    if(search) {
      camera[0] = search.x/n;
      camera[1] = search.y/n;
      search.highlight = true;
      search = null;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pw = Math.ceil(piece_size[0]*camera[2]);
    ph = Math.ceil(piece_size[1]*camera[2]);
    view = [pw*n*camera[0] - canvas.width*0.5, ph*n*camera[1] - canvas.height*0.5, canvas.width, canvas.height];
    let view_x = Math.floor(view[0]/pw), 
        view_y = Math.floor(view[1]/ph),
        view_x2 = Math.ceil((view[0]+view[2]) / pw),
        view_y2 = Math.ceil((view[1]+view[3]) / ph);
    border_width = pw/10;
    ctx.font = Math.max(Math.floor(pw/5), 12) + "px Arial";
    let hovered = (streamer_matrix[Math.floor((last_pointer_x + view[0]) / pw)] || [])[Math.floor((last_pointer_y + view[1]) / ph)];
    // Zoomed enough: present all streamers
    ctx.save();
    //ctx.fillStyle = COLORS.sea;
    //ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  
    if(pw >= 64 && ph >= 64) {
      for(let x=view_x; x<=view_x2; ++x){
        for(let y=view_y; y<=view_y2; ++y){
          let px = Math.floor(pw*x - view[0]), 
              py = Math.floor(ph*y - view[1]);
          if(streamer_matrix[x] == null || streamer_matrix[x][y] == null){
            ctx.save()
            //ctx.fillStyle = "#718096"
            //ctx.fillStyle = COLORS.sea;
            //  ctx.fillRect(px, py, pw, ph);
            ctx.restore()
              continue;
          }
          let s = streamer_matrix[x][y];
          if(potrait_show){
            ctx.save();
            if(s.image.src && s.image.complete && s.image.naturalWidth > 0)
              ctx.drawImage(s.image, px, py, pw, ph);
            else {
              if(!s.image.src) 
                s.image.src = s.profile_image_url;
              ctx.fillStyle = "#CDA8C7";
              ctx.fillText("로딩중", px + pw*0.5, py); 
            }
            ctx.restore()
          }
          if(s.highlight) {
            if(s == hovered)
              s.highlight = false;
            if(frame_index%10 > 5){
              ctx.save();
              ctx.globalAlpha = 0.5;
              ctx.fillStyle = COLORS.highlight;
              ctx.fillRect(px + border_width, py+border_width, pw - 2*border_width, ph - 2*border_width);
              ctx.globalAlpha = 1.0;
              ctx.restore()
            }
          }
          if(name_show || hovered == s){
            ctx.save();
            let fh = parseInt(ctx.font),
                fw = ctx.measureText(s.name).width,
                l = Math.ceil(fw/(pw - 2*border_width)),
                text_piece_length = Math.floor(s.name.length / l);
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = "#fff";
            ctx.fillRect(px + border_width, py+ph - border_width - fh*l, pw - 2*border_width, fh*l);
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = "#000";
            for(let i=0; i<l-1; ++i)
              ctx.fillText(s.name.substr(i*text_piece_length, text_piece_length), px + pw*0.5, py + ph - border_width - fh*l + i*fh);
            ctx.fillText(s.name.slice((l-1)*text_piece_length), px+pw*0.5, py + ph - border_width - fh);
            //ctx.fillText(s.name, px + pw*0.5, py + ph - border_width - fh);
            ctx.restore();
          }
          if(s.is_streaming){
            ctx.save();
            ctx.beginPath();
            ctx.globalAlpha = Math.abs(Math.sin(frame_index/20));
            ctx.arc(px + border_width + pw/15, py + border_width + ph/15, pw/15-1, 0, 2 * Math.PI, false);
            ctx.fillStyle = "#FF4560";
            ctx.fill();
            ctx.restore();
          }
        }
      }
    }
    else {
      for(let x=view_x; x<=view_x2; ++x){
        for(let y=view_y; y<=view_y2; ++y){
          let px = Math.floor(pw*x - view[0]), 
              py = Math.floor(ph*y - view[1]);
          if(streamer_matrix[x] == null || streamer_matrix[x][y] == null) {// || streamer_matrix[x][y].cluster < 0){
            ctx.save()
            //ctx.fillStyle = "#718096"
            //ctx.fillStyle = "#414a4c"
            //ctx.fillStyle = COLORS.sea;
            //ctx.fillRect(px, py, pw, ph);
            ctx.restore();
            continue;
          }
          let s = streamer_matrix[x][y];
          ctx.fillStyle = COLORS.land;
          ctx.fillRect(px, py, pw, ph);
          if(s.cluster >= 0) {
            ctx.save()
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = Patterns[s.cluster];
            ctx.fillRect(px, py, pw, ph);
            ctx.restore()
          }
        }
      }
      for(let s of representor_of_cluster) {
          let rx = pw*s.representation_x - view[0] + pw*0.5 + (camera[0] - 0.5)*pw,
              ry = ph*s.representation_y - view[1] + ph*0.5 + (camera[1] - 0.5)*ph;
          let px = pw*s.x - view[0], 
              py = ph*s.y - view[1];
          ctx.save();
          ctx.globalAlpha = 1.0;
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          ctx.fillStyle = "white";
          ctx.strokeStyle = "black";
          //ctx.font = "italic 14px Arial";
          //ctx.font = "italic " + Math.max(Math.floor(pw/2), 12) + "px Arial";
          ctx.font = "italic " + Math.max(Math.floor(pw/1.5), 12) + "px Arial";
          let fw = ctx.measureText(s.name).width,
              fh = parseInt(ctx.font);
          /*rx = rx - fw*0.5 < 0? fw*0.5: 
               (rx + fw*0.5 >= canvas.width? canvas.width - fw*0.5 : rx),
          ry = ry - fh*0.5 < 0? fh*0.5: 
               (ry + fh*0.5 >= canvas.height? canvas.height - fh*0.5 : ry);*/
          //ctx.lineWidth = 5;
          //ctx.strokeText(s.name, rx, ry);
          ctx.fillText(s.name, rx, ry);
          ctx.restore();
      }
      for(let x=view_x; x<=view_x2; ++x){
        for(let y=view_y; y<=view_y2; ++y){
          let px = Math.floor(pw*x - view[0]), 
              py = Math.floor(ph*y - view[1]);
          if(streamer_matrix[x] == null || streamer_matrix[x][y] == null)
            continue;
          let s = streamer_matrix[x][y];
          if(s == hovered || s.highlight){
          //if(s == representor_of_cluster[s.cluster]){
            ctx.save();
            if(s.image.src && s.image.complete && s.image.naturalWidth > 0)
              ctx.drawImage(s.image, px, py, pw, ph);
            else {
              if(!s.image.src) 
                s.image.src = s.profile_image_url;
              ctx.fillStyle = "#CDA8C7";
              ctx.fillText("로딩중", px + pw*0.5, py); 
            }
            ctx.restore();
          }
          else {
            if(s.average_viewer_count >= 10000) {
              if(s.is_streaming){
                if(sprites.city.complete)
                  ctx.drawImage(sprites.city, px, py, pw, ph);
              }
              else {
                if(sprites.city_night.complete)
                  ctx.drawImage(sprites.city_night, px, py, pw, ph);
              }
            }
            else if(s.average_viewer_count >= 1000) {
              if(s.is_streaming){
                if(sprites.castle.complete)
                  ctx.drawImage(sprites.castle, px+pw*0.2, py+ph*0.2, pw*0.6, ph*0.6);
              }
              else {
                if(sprites.castle_night.complete)
                  ctx.drawImage(sprites.castle_night, px+pw*0.2, py+ph*0.2, pw*0.6, ph*0.6);
              }
            }
            else if(s.average_viewer_count >= 100) {
              if(s.is_streaming){
                if(sprites.town.complete)
                  ctx.drawImage(sprites.town, px+pw*0.2, py+ph*0.2, pw*0.6, ph*0.6);
              }
              else {
                if(sprites.town_night.complete)
                  ctx.drawImage(sprites.town_night, px+pw*0.2, py+ph*0.2, pw*0.6, ph*0.6);
              }
            }
            /*else {
              if(s.is_streaming) {
                ctx.fillStyle = "#fffe00";
                ctx.beginPath();
                ctx.arc(px + pw*0.5, py + ph*0.5, pw*0.05, 0, Math.PI*2);
                ctx.fill();
              }
            }*/
            if(s.is_streaming && s.chatting_speed >= 5){
              if(sprites.fire.complete){
                ctx.globalAlpha = 0.5;
                ctx.drawImage(sprites.fire, px + pw*0.2, py+ph*0.2, pw*0.6, ph*0.6);
                ctx.globalAlpha = 1.0;
              }
            }
            if(!s.is_streaming){
              ctx.globalAlpha = 0.3;
              ctx.fillStyle = "#000";
              ctx.fillRect(px, py, pw, ph);
              ctx.globalAlpha = 1.0;
            }
          }
          if(s.highlight) {
            if(s == hovered)
              s.highlight = false;
            if(frame_index%10 > 5){
              ctx.save();
              ctx.globalAlpha = 0.5;
              ctx.fillStyle = "#d4af37";
              ctx.fillRect(px + border_width, py+border_width, pw - 2*border_width, ph - 2*border_width);
              ctx.globalAlpha = 1.0;
              ctx.restore()
            }
          }
        }
      }
    }
    for(let x=view_x; x<=view_x2; ++x){
      for(let y=view_y; y<=view_y2; ++y){
        let px = Math.floor(pw*x - view[0]), 
            py = Math.floor(ph*y - view[1]);
        if(streamer_matrix[x] == null || streamer_matrix[x][y] == null)
          continue;
        let s = streamer_matrix[x][y];
        /*
        if(!s.is_streaming){
          ctx.save();
          ctx.globalAlpha = 0.2;
          ctx.fillStyle = "#000";
          ctx.fillRect(px, py, pw, ph);
          ctx.restore();
        } else{
          ctx.save();
          ctx.globalAlpha = 0.2;
          ctx.fillStyle = "#fff";
          ctx.fillRect(px, py, pw, ph);
          ctx.restore();
        }*/
        if(clustering_show) {
          ctx.save();
          if(hovered && hovered.cluster == s.cluster) 
            ctx.globalAlpha = Math.abs(Math.sin(frame_index/20));
          ctx.fillStyle = Patterns[s.cluster];
          if(s.left_edge){
            let y=py, y2=py+ph;
            if(!s.bottom_edge)
              y2 += border_width;
            if(!s.top_edge)
              y -= border_width;
            ctx.fillRect(
                px,
                y,
                border_width, y2-y);
          }
          if(s.right_edge){
            let y=py, y2=py+ph;
            if(!s.bottom_edge)
              y2 += border_width;
            if(!s.top_edge)
              y -= border_width;
            ctx.fillRect(
                px + pw - border_width,
                y, 
                border_width, y2-y);
          }
          if(s.top_edge){
            let x=px, x2=px + pw;
            if(!s.right_edge)
              x2 += border_width;
            if(!s.left_edge)
              x -= border_width;
            ctx.fillRect(
                x, 
                py,
                x2-x, border_width);
          }
          if(s.bottom_edge){
            let x=px, x2=px+pw;
            if(!s.right_edge)
              x2 += border_width;
            if(!s.left_edge)
              x -= border_width;
            ctx.fillRect(
                x, 
                py + ph - border_width,
                x2-x, border_width);
          }
          ctx.restore();
        }
      }
    }
    if(pw < 64 || ph < 64) {
      for(let x=view_x; x<=view_x2; ++x){
        for(let y=view_y; y<=view_y2; ++y){
          let px = Math.floor(pw*x - view[0]), 
              py = Math.floor(ph*y - view[1]);
          if(streamer_matrix[x] == null || streamer_matrix[x][y] == null)
            continue;
          let s = streamer_matrix[x][y];
          if(hovered == s) {
            ctx.save();
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = "#fff";
            let fh = parseInt(ctx.font),
                fw = ctx.measureText(s.name).width;
            ctx.fillRect(px + pw*0.5 - fw*0.5, py+ph, fw, fh);
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = "#000";
            ctx.fillText(s.name, px+pw*0.5, py+ph);
            ctx.restore();
          }
        }
      }
      for(let s of representor_of_cluster) {
          let rx = pw*s.representation_x - view[0] + pw*0.5 + (camera[0] - 0.5)*pw,
              ry = ph*s.representation_y - view[1] + ph*0.5 + (camera[1] - 0.5)*ph;
          let px = pw*s.x - view[0], 
              py = ph*s.y - view[1];
          ctx.save();
          ctx.globalAlpha = 0.3;
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          ctx.fillStyle = "white";
          ctx.strokeStyle = "black";
          //ctx.font = "italic 14px Arial";
          //ctx.font = "italic " + Math.max(Math.floor(pw/2), 12) + "px Arial";
          ctx.font = "italic " + Math.max(Math.floor(pw/1.5), 12) + "px Arial";
          let fw = ctx.measureText(s.name).width,
              fh = parseInt(ctx.font);
          /*rx = rx - fw*0.5 < 0? fw*0.5: 
               (rx + fw*0.5 >= canvas.width? canvas.width - fw*0.5 : rx),
          ry = ry - fh*0.5 < 0? fh*0.5: 
               (ry + fh*0.5 >= canvas.height? canvas.height - fh*0.5 : ry);*/
          //ctx.lineWidth = 5;
          //ctx.strokeText(s.name, rx, ry);
          ctx.fillText(s.name, rx, ry);
          ctx.restore();
      }
    }
    frame_index += 1;
  }());
  return ()=>{
    cancelAnimationFrame(frame);
  }
});
onDestroy(()=>{
  if(frame) {
    cancelAnimationFrame(frame);
    frame = null;
  }
});
/*
        let fh = parseInt(ctx.font);
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = "#fff";
        ctx.fillRect(px + border_width, py+ph - border_width - fh, pw - 2*border_width, fh);
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = "#000";
        ctx.fillText(s.name, px + border_width*0.5, py + ph - border_width - fh);
      }
    }
  }());
  return ()=>{
    cancelAnimationFrame(frame);
  }
});
*/
</script>
