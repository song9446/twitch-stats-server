<svelte:head>
	<title>스트리머 지도</title>
</svelte:head>

<div class="w-full flex flex-row flex-wrap items-center my-4">
  <div class="p-2">
    <StreamerAutoComplete streamers={streamers} bind:selected={search} placeholder="지도에서 찾기"/>
  </div>
  <div class="p-2 flex flex-row flex-wrap items-center">
    <div class="px-2"><input type=checkbox bind:checked={clustering_show} id="border" name="border"> <label for="border">국경</label></div>
    <div class="px-2"><input type=checkbox bind:checked={potrait_show} id="potrait" name="potrait"> <label for="potrait">초상화</label></div>
    <div class="px-2"><input type=checkbox bind:checked={saturate_filter} id="saturate" name="saturate"> <label for="saturate">흑백</label></div>
    <div class="px-2"><input type=checkbox bind:checked={name_show} id="name" name="name"> <label for="name">이름</label></div>
  </div>
</div>
<div class="overflow-x-auto container">
  <canvas bind:this={canvas} width=1024 height=1024> </canvas>
</div>

<script context="module">
	import { API } from '../api.js';
  export async function preload(page, session) {
    let streamers = await API.streamer_map.call(this);
    return { streamers };
  }
</script>

<script>
import { onMount } from "svelte";
import StreamerAutoComplete from "../components/StreamerAutoComplete.svelte";

export let streamers;
let canvas;
let search = "";
let clustering_show = true;
let potrait_show = true;
let name_show = true;
let saturate_filter = false;
let piece_width, piece_height;
let hovered = null;
let mouse_x = 0, mouse_y = 0, mouse_in = false;
const CLUSTERING_BORDER_WIDTH = 6;
const POTRAIT_MARGIN = 0;
const COLOR_PALETTE = [
'#a6cee3',
'#1f78b4',
'#b2df8a',
'#33a02c',
'#fb9a99',
'#e31a1c',
'#fdbf6f',
'#ff7f00',
'#cab2d6',
'#6a3d9a',
'#ffff99',
'#b15928',
];
const DASH_PATTERNS = [
[1, 0],
[1, 1],
[10, 10],
[20, 5],
[15, 3, 3, 3],
[20, 3, 3, 3, 3, 3, 3, 3],
[12, 3, 3]
];
const PATTERNS = [
  [[1,1,1,1],
   [1,1,1,1],
   [1,1,1,1],
   [1,1,1,1]],
  [[1,0,1,1],
   [1,1,0,1],
   [1,1,1,0],
   [0,1,1,1]],
  [[1,0,1,0],
   [0,1,0,1],
   [1,0,1,0],
   [0,1,0,1]],
  [[1,1,1,1],
   [0,0,0,0],
   [1,1,1,1],
   [0,0,0,0]],
  [[0,1,0,1],
   [0,1,0,1],
   [0,1,0,1],
   [0,1,0,1]],
];


function stroke_arrow(ctx, sx, sy, ex, ey, margin, label) {
  let dy = ey-sy, 
      dx = ex-sx,
      d = Math.sqrt(dx*dx + dy*dy),
      r = Math.atan2(dy, dx),
      p = Math.PI,
      mw = margin*dx/d, mh = margin*dy/d;
  ctx.save()
  ctx.beginPath();
  ctx.moveTo(sx+mw, sy+mh);
  ctx.lineTo(ex-mw, ey-mh);

  ctx.translate(ex-mw, ey-mh);
  ctx.rotate(r);
  ctx.moveTo(0, 0);
  ctx.lineTo(-10, -10);
  ctx.moveTo(0, 0);
  ctx.lineTo(-10, 10);
  ctx.restore();
  ctx.stroke();
}
function highlight_streamer(ctx, s, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.5;
  ctx.fillRect(s.coordx, s.coordy, piece_width, piece_height);
  ctx.globalAlpha = 1.0;
  ctx.lineWidth = POTRAIT_MARGIN;
  ctx.strokeRect(s.coordx, s.coordy, piece_width, piece_height);
}

onMount(async ()=>{
  //streamers = await API.streamer_map.call(this);
  canvas.ondblclick = function () {
    for(let s of streamers) 
      if(mouse_x < s.coordx + piece_width &&
        mouse_x >= s.coordx &&
        mouse_y < s.coordy + piece_height &&
        mouse_y >= s.coordy)
        location = `/streamer/${s.id}`;
  }
  const buffer_canvas = document.createElement("canvas"),
        buffer_ctx = buffer_canvas.getContext("2d");
  buffer_canvas.width = 4;
  buffer_canvas.height = 4;
  const FILL_STYLES = [];
  const FILL_COLORS = [];
  for(let i=0; i<PATTERNS.length; ++i)
    for(let j=0; j<COLOR_PALETTE.length; ++j){
       FILL_STYLES.push(gen_pattern(i, COLOR_PALETTE[j], COLOR_PALETTE[(j+1)%COLOR_PALETTE.length]));
       FILL_COLORS.push(COLOR_PALETTE[j]);
    }
  function gen_pattern(index, color1, color2=null, alpha=1.0) {
    buffer_canvas.width = PATTERNS[index].length;
    buffer_canvas.height = PATTERNS[0].length;
    buffer_ctx.clearRect(0, 0, buffer_canvas.width, buffer_canvas.height);
    buffer_ctx.fillStyle = color1;
    buffer_ctx.globalAlpha = alpha;
    for(let i=0; i<buffer_canvas.width; ++i)
      for(let j=0; j<buffer_canvas.height; ++j)
        if(PATTERNS[index][i][j])
          buffer_ctx.fillRect(i, j, 1, 1);
    if(color2){
      buffer_ctx.fillStyle = color2;
      for(let i=0; i<buffer_canvas.width; ++i)
        for(let j=0; j<buffer_canvas.height; ++j)
          if(!PATTERNS[index][i][j])
            buffer_ctx.fillRect(i, j, 1, 1);
    }
    return buffer_ctx.createPattern(buffer_canvas, "repeat");
  }
  let ctx = canvas.getContext("2d");
  let potrait_matrix_canvas = document.createElement("canvas"),
      potrait_matrix_ctx = potrait_matrix_canvas.getContext("2d");
  let name_matrix_canvas = document.createElement("canvas"),
      name_matrix_ctx = name_matrix_canvas.getContext("2d");
  potrait_matrix_canvas.width = canvas.width;
  potrait_matrix_canvas.height = canvas.height;
  name_matrix_canvas.width = canvas.width;
  name_matrix_canvas.height = canvas.height;
  canvas.onmousemove = function (e) {
    let rect = e.target.getBoundingClientRect();
    mouse_x = e.clientX - rect.left;
    mouse_y = e.clientY - rect.top;
    mouse_in = true;
  }
  canvas.onmouseout = function(e) { mouse_in = false; }
  streamers = (() => {
    let n = (Math.ceil(Math.sqrt(streamers.length)));
    piece_width = canvas.width/n - POTRAIT_MARGIN*2;
    piece_height = canvas.height/n - POTRAIT_MARGIN*2;
    let streamer_matrix = Array(n).fill().map(()=>Array(n).fill(null));
    for(let s of streamers) streamer_matrix[s.x][s.y] = s;
    for(let s of streamers) {
      let x = (piece_width + POTRAIT_MARGIN*2)*s.x + POTRAIT_MARGIN,
          y = (piece_height + POTRAIT_MARGIN*2)*s.y + POTRAIT_MARGIN;
      if(s.cluster >= 0 && (s.x-1 < 0 || streamer_matrix[s.x-1][s.y] == null || streamer_matrix[s.x-1][s.y].cluster != s.cluster))
        s.left_edge = true;
      if(s.cluster >= 0 && (s.x+1 >= streamer_matrix.length || streamer_matrix[s.x+1][s.y] == null || streamer_matrix[s.x+1][s.y].cluster != s.cluster))
        s.right_edge = true;
      if(s.cluster >= 0 && (s.y-1 < 0 || streamer_matrix[s.x][s.y-1] == null || streamer_matrix[s.x][s.y-1].cluster != s.cluster))
        s.top_edge = true;
      if(s.cluster >= 0 && (s.y+1 >= streamer_matrix.length || streamer_matrix[s.x][s.y+1] == null || streamer_matrix[s.x][s.y+1].cluster != s.cluster))
        s.bottom_edge = true;
      let image = new Image();
      image.onload = function () {
        potrait_matrix_ctx.drawImage(image, s.coordx, s.coordy, piece_width, piece_height);
      }
      image.src = s.profile_image_url;
      name_matrix_ctx.font = "10px Arial";
      let nx = x + CLUSTERING_BORDER_WIDTH,
          nw = piece_width - CLUSTERING_BORDER_WIDTH*2,
          w = name_matrix_ctx.measureText(s.name).width,
          l = Math.ceil(w/nw),
          piece_length = Math.floor(s.name.length / l),
          fh = parseInt(name_matrix_ctx.font),
          nh = fh*l,
          ny = y + piece_height - nh - CLUSTERING_BORDER_WIDTH;
      name_matrix_ctx.globalAlpha = 0.7;
      name_matrix_ctx.fillStyle = "#fff";
      name_matrix_ctx.fillRect(nx, ny, nw, nh);
      name_matrix_ctx.globalAlpha = 1.0;
      name_matrix_ctx.fillStyle = "#000";
      name_matrix_ctx.textBaseline = "top";
      name_matrix_ctx.textAlign = "center";
      for(let i=0; i<l-1; ++i)
        name_matrix_ctx.fillText(s.name.substr(i*piece_length, piece_length), x+piece_width*.5, ny + i*fh);
      name_matrix_ctx.fillText(s.name.slice((l-1)*piece_length), x+piece_width*.5, ny + (l-1)*fh);
      s.coordx = x;
      s.coordy = y;
    }
    return streamers;
  })();
  let last_search = null
  let frame;
  let frame_index = 0;
  ctx.font = "11px Arial";
  (function loop() {
    frame = requestAnimationFrame(loop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save()
    if(saturate_filter)
      ctx.filter = "saturate(10%)"
    if(potrait_show)
      ctx.drawImage(potrait_matrix_canvas, 0, 0);
    ctx.restore();
    for(let s of streamers){
      if(clustering_show && s.cluster >= 0){
        let color = FILL_COLORS[s.cluster],
            fill_style = FILL_STYLES[s.cluster];
        ctx.fillStyle = fill_style;
        if(hovered && s.cluster > -1 && hovered.cluster === s.cluster && frame_index%10 > 5) {
        }
        else{
          if(s.left_edge){
            let y=s.coordy, y2=y+piece_height;
            if(!s.bottom_edge)
              y2 += CLUSTERING_BORDER_WIDTH;
            if(!s.top_edge)
              y -= CLUSTERING_BORDER_WIDTH;
            ctx.fillRect(
                s.coordx,
                y,
                CLUSTERING_BORDER_WIDTH, y2-y);
          }
          if(s.right_edge){
            let y=s.coordy, y2=y+piece_height;
            if(!s.bottom_edge)
              y2 += CLUSTERING_BORDER_WIDTH;
            if(!s.top_edge)
              y -= CLUSTERING_BORDER_WIDTH;
            ctx.fillRect(
                s.coordx + piece_width - CLUSTERING_BORDER_WIDTH,
                y, 
                CLUSTERING_BORDER_WIDTH, y2-y);
          }
          if(s.top_edge){
            let x=s.coordx, x2=x + piece_width;
            if(!s.right_edge)
              x2 += CLUSTERING_BORDER_WIDTH;
            if(!s.left_edge)
              x -= CLUSTERING_BORDER_WIDTH;
            ctx.fillRect(
                x, 
                s.coordy,
                x2-x, CLUSTERING_BORDER_WIDTH);
          }
          if(s.bottom_edge){
            let x=s.coordx, x2=x+piece_width;
            if(!s.right_edge)
              x2 += CLUSTERING_BORDER_WIDTH;
            if(!s.left_edge)
              x -= CLUSTERING_BORDER_WIDTH;
            ctx.fillRect(
                x, 
                s.coordy + piece_height - CLUSTERING_BORDER_WIDTH,
                x2-x, CLUSTERING_BORDER_WIDTH);
          }
        }
      }
    }
    if(name_show){
      ctx.drawImage(name_matrix_canvas, 0, 0);
    }
    if(mouse_in){
      for(let s of streamers) 
        if(mouse_x < s.coordx + piece_width &&
          mouse_x >= s.coordx &&
          mouse_y < s.coordy + piece_height &&
          mouse_y >= s.coordy)
          hovered = s;
      if(hovered){
        highlight_streamer(ctx, hovered, "#d4af37");
        if(search && hovered.id == search.id)
          search = "";
      }
    }
    else{
      hovered = null;
    }
    if(search != last_search) {
      last_search = search;
    }
    if(search){
      if(frame_index%10 > 5)
        highlight_streamer(ctx, search, "#d4af37");
      else{
        //highlight_streamer(ctx, search, "#d4af37");
      }
    }
		ctx.save()
		for(let s of streamers) {
			if(s.is_streaming){
				ctx.beginPath();
				ctx.globalAlpha = Math.abs(Math.sin(frame_index/20));
				ctx.arc(s.coordx + CLUSTERING_BORDER_WIDTH + 4, s.coordy + CLUSTERING_BORDER_WIDTH + 4, 3, 0, 2 * Math.PI, false);
				ctx.fillStyle = "#FF4560";
				ctx.fill();
			}
		}
		ctx.restore()
    frame_index += 1;
  }());
  return ()=>{
    cancelAnimationFrame(frame);
  }
});

</script>

<style>
</style>
