let canvas;

let n = (Math.ceil(Math.sqrt(streamers.length)));
const PIECE_SIZE = [64, 64];

onMount(async ()=>{
  canvas.width = canvas.getBoundingClientRect().width;
  canvas.height = canvas.getBoundingClientRect().height;
  let camera = [0.5, 0.5, 1.0]
  let border_width = 6;
  let streamer_matrix = Array(n).fill().map(()=>Array(n).fill(null));
  for(let s of streamers) {
    if(s.cluster >= 0 && (s.x-1 < 0 || streamer_matrix[s.x-1][s.y] == null || streamer_matrix[s.x-1][s.y].cluster != s.cluster))
      s.left_edge = true;
    if(s.cluster >= 0 && (s.x+1 >= streamer_matrix.length || streamer_matrix[s.x+1][s.y] == null || streamer_matrix[s.x+1][s.y].cluster != s.cluster))
      s.right_edge = true;
    if(s.cluster >= 0 && (s.y-1 < 0 || streamer_matrix[s.x][s.y-1] == null || streamer_matrix[s.x][s.y-1].cluster != s.cluster))
      s.top_edge = true;
    if(s.cluster >= 0 && (s.y+1 >= streamer_matrix.length || streamer_matrix[s.x][s.y+1] == null || streamer_matrix[s.x][s.y+1].cluster != s.cluster))
      s.bottom_edge = true;
    s.image = new Image();
    streamer_matrix[s.x][s.y] = s;
  }
  let frame;
  let frame_index = 0;
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  (function loop() {
    frame = requestAnimationFrame(loop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save()
    /*if(saturate_filter)
      ctx.filter = "saturate(10%)"*/
    let pw = PIECE_SIZE[0]*camera[2], 
        ph = PIECE_SIZE[1]*camera[2]];
    let view = [pw*n*camera[0] - canvas.width*0.5, ph*n*camera[1] - canvas.height*0.5, canvas,width, canvas.height];
    let view_x = Math.floor(view[0]/pw), 
        view_y = Math.floor(view[1]/ph),
        view_x2 = Math.ceil((view[0]+view[2]) / pw),
        view_y2 = Math.ceil((view[1]+view[3]) / ph);
    for(let x=view_x; x<=view_x2; ++x){
      for(let y=view_y; y<=view_y2; ++y){
        let s = streamer_matrix[x][y],
            px = pw*x - view[0], 
            py = ph*y - view[1];
        if(s.image.complete)
          ctx.drawImage(s.image, px, py, pw, ph);
        else {
          if(!s.image.src) 
            s.image.src = s.profile_image_url;
          ctx.fillText("로딩중", px + pw*0.5, ph - border_width); 
        }
        /*
          w = name_matrix_ctx.measureText(s.name).width,
          l = Math.ceil(w/nw),
          piece_length = Math.floor(s.name.length / l),
          fh = parseInt(name_matrix_ctx.font),
          nh = fh*l,
          ny = y + piece_height - nh - CLUSTERING_BORDER_WIDTH;
        */
        let fh = parseInt(ctx.font),
          fw = name_matrix_ctx.measureText(s.name).width,
          l = Math.ceil((pw - 2*border_width) / fw),
          text_piece_length = Math.floor(s.name.length / l);
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = "#fff";
        ctx.fillRect(px + border_width, py+ph - border_width - fh*l, pw - 2*border_width, fh*l);
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = "#000";
        for(let i=0; i<l-1; ++i)
          ctx.fillText(s.name.substr(i*text_piece_length, text_piece_length), px + pw*0.5, py + ph - fh*l + i*fh);
        ctx.fillText(s.name.slice((l-1)*text_piece_length), px+pw, py + ph - fh);
        //ctx.fillText(s.name, px + border_width*0.5, py + ph - border_width - fh);
      }
    }
  }());
  return ()=>{
    cancelAnimationFrame(frame);
  }
});
