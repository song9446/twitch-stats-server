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
  <canvas bind:this={canvas} width=1280 height=1280> </canvas>
</div>

<script>
import { onMount } from "svelte";
import StreamerAutoComplete from "../StreamerAutoComplete.svelte";

let canvas;
let search;
let clustering_show = true;
let potrait_show = true;
let name_show = true;
let saturate_filter = true;
let streamers;
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
  ctx.fillRect(s.x, s.y, s.w, s.h);
  ctx.globalAlpha = 1.0;
  ctx.lineWidth = POTRAIT_MARGIN;
  ctx.strokeRect(s.x, s.y, s.w, s.h);
}

onMount(async ()=>{
  /*let rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = canvas.width;*/
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
  streamers = await (async () => {
    let streamers = await fetch("/api/thin-streamers").then(res=>res.json());
    let streamers_tsne_grid = await fetch("/api/streamer-tsne-grid").then(res=>res.json());
    let streamer_clusters = await fetch("/api/streamer-clusters").then(res=>res.json());
    //let streamers_similarities = await fetch("/api/streamer-similarities").then(res=>res.json());
    let streamers_by_id = {};
    let streamers_by_name = {};
    let streamer_matrix = [];
    for(let s of streamers){
      streamers_by_id[s.id] = s;
      s.cluster_index = -1;
      s.cluster_probability = -1;
      /*s.influenced_by = [];
      s.influence_to = [];*/
    }
    /*for(let ss of streamers_similarities){
      let subject = streamers_by_id[ss.subject],
          object = streamers_by_id[ss.object];
      subject.influenced_by.push([object, ss.ratio]);
      object.influence_to.push([subject, ss.ratio]);
    }*/
    for(let sc of streamer_clusters){
      streamers_by_id[sc.streamer_id].cluster_index = sc.cluster;
      streamers_by_id[sc.streamer_id].cluster_probability = sc.probability;
    }
    let piece_width = canvas.width/(Math.ceil(Math.sqrt(streamers.length))) - POTRAIT_MARGIN*2,
        piece_height = canvas.height/(Math.ceil(Math.sqrt(streamers.length))) - POTRAIT_MARGIN*2;
    for(let i=0; i<(Math.ceil(Math.sqrt(streamers.length))); ++i){
      streamer_matrix[i] = [];
      for(let j=0; j<(Math.ceil(Math.sqrt(streamers.length))); ++j){
        streamer_matrix[i].push(null);
      }
    }
    for(let pos of streamers_tsne_grid) {
      let s = streamers_by_id[pos.streamer_id];
      streamer_matrix[pos.x][pos.y] = s;
    };
    return streamers_tsne_grid.map(pos => {
      let s = streamers_by_id[pos.streamer_id];
      s.x = (piece_width + POTRAIT_MARGIN*2)*pos.x + POTRAIT_MARGIN;
      s.y = (piece_height + POTRAIT_MARGIN*2)*pos.y + POTRAIT_MARGIN;
      s.w = piece_width;
      s.h = piece_height;
      s.cx = s.x+s.w*.5;
      s.cy = s.y+s.h*.5;
      if(s.cluster_index >= 0 && (pos.x-1 < 0 || streamer_matrix[pos.x-1][pos.y] == null || streamer_matrix[pos.x-1][pos.y].cluster_index != s.cluster_index))
        s.left_edge = true;
      if(s.cluster_index >= 0 && (pos.x+1 >= streamer_matrix.length || streamer_matrix[pos.x+1][pos.y] == null || streamer_matrix[pos.x+1][pos.y].cluster_index != s.cluster_index))
        s.right_edge = true;
      if(s.cluster_index >= 0 && (pos.y-1 < 0 || streamer_matrix[pos.x][pos.y-1] == null || streamer_matrix[pos.x][pos.y-1].cluster_index != s.cluster_index))
        s.top_edge = true;
      if(s.cluster_index >= 0 && (pos.y+1 >= streamer_matrix.length || streamer_matrix[pos.x][pos.y+1] == null || streamer_matrix[pos.x][pos.y+1].cluster_index != s.cluster_index))
        s.bottom_edge = true;
      s.image = new Image();
      s.image_loaded = false;
      s.image_alpha = 0.0;
      s.image.onload = function(){
        s.image_loaded = true;
        potrait_matrix_ctx.drawImage(s.image, s.x, s.y, s.w, s.h);
      }
      s.image.src = s.profile_image_url;
        name_matrix_ctx.font = "10px Arial";
        let sx = s.x + CLUSTERING_BORDER_WIDTH,
            sw = s.w - CLUSTERING_BORDER_WIDTH*2,
            w = name_matrix_ctx.measureText(s.name).width,
            l = Math.ceil(w/sw),
            piece_length = Math.floor(s.name.length / l),
            fh = parseInt(name_matrix_ctx.font),
            h = fh*l,
            y = s.y + s.h - h - CLUSTERING_BORDER_WIDTH;
        name_matrix_ctx.globalAlpha = 0.5;
        name_matrix_ctx.fillStyle = "#fff";
        name_matrix_ctx.fillRect(sx, y, sw, h);
        name_matrix_ctx.globalAlpha = 1.0;
        name_matrix_ctx.fillStyle = "#000";
        name_matrix_ctx.textBaseline = "top";
        name_matrix_ctx.textAlign = "center";
        for(let i=0; i<l-1; ++i)
          name_matrix_ctx.fillText(s.name.substr(i*piece_length, piece_length), s.cx, y + i*fh);
        name_matrix_ctx.fillText(s.name.slice((l-1)*piece_length), s.cx, y + (l-1)*fh);
      return s;
    });
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
      if(clustering_show && s.cluster_index >= 0){
        let color = FILL_COLORS[s.cluster_index],
            fill_style = FILL_STYLES[s.cluster_index];
        ctx.fillStyle = fill_style;
        /*ctx.fillRect(s.x, s.y, s.w, s.h);
        ctx.fillStyle = color;*/
        if(hovered && s.cluster_index > -1 && hovered.cluster_index === s.cluster_index && frame_index%10 > 5) {
        }
        else{
          if(s.left_edge){
            let y=s.y, y2=y+s.h;
            if(!s.bottom_edge)
              y2 += CLUSTERING_BORDER_WIDTH;
            if(!s.top_edge)
              y -= CLUSTERING_BORDER_WIDTH;
            ctx.fillRect(
                s.x,
                y,
                CLUSTERING_BORDER_WIDTH, y2-y);
          }
          if(s.right_edge){
            let y=s.y, y2=y+s.h;
            if(!s.bottom_edge)
              y2 += CLUSTERING_BORDER_WIDTH;
            if(!s.top_edge)
              y -= CLUSTERING_BORDER_WIDTH;
            ctx.fillRect(
                s.x + s.w - CLUSTERING_BORDER_WIDTH,
                y, 
                CLUSTERING_BORDER_WIDTH, y2-y);
          }
          if(s.top_edge){
            let x=s.x, x2=x + s.w;
            if(!s.right_edge)
              x2 += CLUSTERING_BORDER_WIDTH;
            if(!s.left_edge)
              x -= CLUSTERING_BORDER_WIDTH;
            ctx.fillRect(
                x, 
                s.y,
                x2-x, CLUSTERING_BORDER_WIDTH);
          }
          if(s.bottom_edge){
            let x=s.x, x2=x+s.w;
            if(!s.right_edge)
              x2 += CLUSTERING_BORDER_WIDTH;
            if(!s.left_edge)
              x -= CLUSTERING_BORDER_WIDTH;
            ctx.fillRect(
                x, 
                s.y + s.h - CLUSTERING_BORDER_WIDTH,
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
        if(mouse_x < s.x + s.w &&
          mouse_x >= s.x &&
          mouse_y < s.y + s.h &&
          mouse_y >= s.y)
          hovered = s;
      if(hovered){
        /*for(let [i, ratio] of hovered.influenced_by) {
          highlight_streamer(ctx, i, "#00f");
        }
        for(let [i, ratio] of hovered.influence_to) {
          highlight_streamer(ctx, i, "#f00");
        }*/
        highlight_streamer(ctx, hovered, "#d4af37");
        if(search && hovered.id == search.id)
          search = null;
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
    frame_index += 1;
  }());
  return ()=>{
    cancelAnimationFrame(frame);
  }
});
</script>

<style>
</style>
